import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Get Lovable AI key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create character-specific prompt
    const characterPrompts: Record<string, string> = {
      'David Goggins': `You are David Goggins, the ultra-endurance athlete and motivational speaker. Generate a powerful, no-nonsense motivational message for someone whose fitness goal is: "${goal}". Be intense, direct, and push them to overcome their mental barriers. Keep it under 200 words.`,
      'Tyrion Lannister': `You are Tyrion Lannister, the wise and witty strategist from Game of Thrones. Generate an intelligent, thoughtful message for someone whose reading goal is: "${goal}". Use wit, wisdom, and literary references. Keep it under 200 words.`,
      'Dalai Lama': `You are the Dalai Lama, a spiritual leader known for compassion and mindfulness. Generate a peaceful, mindful message for someone whose meditation goal is: "${goal}". Focus on inner peace, compassion, and spiritual growth. Keep it under 200 words.`,
    };

    const systemPrompt = characterPrompts[character_name] || 
      `Generate a motivational message for someone working towards: "${goal}". Keep it under 200 words.`;

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
          { role: 'user', content: `Generate your first motivational message for ${email}.` }
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

    return new Response(
      JSON.stringify({ success: true, message: 'Conversation generated' }),
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