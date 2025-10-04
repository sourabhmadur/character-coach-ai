import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription_id, email, character_name, goal } = await req.json();
    
    console.log('Processing subscription:', { subscription_id, email, character_name, goal });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API keys
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);

    // Create character-specific prompt for 2-month plan
    const characterPrompts: Record<string, string> = {
      'David Goggins': `You are David Goggins, the ultra-endurance athlete and motivational speaker. Create a detailed 2-month action plan for someone whose fitness goal is: "${goal}". Be intense, direct, and push them to overcome their mental barriers. Break it down week by week with specific actions, milestones, and mental strategies. Make it challenging but achievable. Format it clearly with weekly breakdowns.`,
      'Tyrion Lannister': `You are Tyrion Lannister, the wise and witty strategist from Game of Thrones. Create a detailed 2-month reading plan for someone whose goal is: "${goal}". Use wit, wisdom, and strategic thinking. Break it down week by week with specific books, reading targets, and reflection points. Include literary insights and clever observations. Format it clearly with weekly breakdowns.`,
      'Dalai Lama': `You are the Dalai Lama, a spiritual leader known for compassion and mindfulness. Create a detailed 2-month meditation and mindfulness plan for someone whose goal is: "${goal}". Focus on inner peace, compassion, and spiritual growth. Break it down week by week with specific practices, meditation techniques, and spiritual milestones. Format it clearly with weekly breakdowns.`,
    };

    const systemPrompt = characterPrompts[character_name] || 
      `Create a detailed 2-month action plan for someone working towards: "${goal}". Break it down week by week with specific actions and milestones. Format it clearly with weekly breakdowns.`;

    // Call Lovable AI
    console.log('Calling Lovable AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a comprehensive 2-month plan for ${email} to achieve their goal.` }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`Lovable AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const conversation = aiData.choices[0].message.content;

    console.log('Generated conversation:', conversation);

    // Update the subscription with the generated conversation
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ conversation })
      .eq('id', subscription_id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw updateError;
    }

    console.log('Successfully updated subscription:', subscription_id);

    // Send email with the 2-month plan
    console.log('Sending email to:', email);
    const { error: emailError } = await resend.emails.send({
      from: 'goggins@momentoai.co',
      to: [email],
      subject: `Your 2-Month Plan from ${character_name}`,
      html: `
        <h1>Your Personalized 2-Month Plan</h1>
        <p>Hello! ${character_name} has created a custom plan to help you achieve your goal:</p>
        <p><strong>Your Goal:</strong> ${goal}</p>
        <hr />
        <div style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6;">
          ${conversation}
        </div>
        <hr />
        <p>Stay committed and track your progress. You've got this!</p>
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    console.log('Email sent successfully to:', email);

    return new Response(
      JSON.stringify({ success: true, message: 'Conversation generated and email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-conversation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});