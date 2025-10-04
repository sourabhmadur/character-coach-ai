import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { generateConversation } from "../_shared/openai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to escape HTML characters
const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Function to convert markdown to HTML with proper formatting
const formatContent = (text: string) => {
  // Split into lines for processing
  const lines = text.split('\n');
  const htmlLines: string[] = [];
  let inList = false;
  let listType = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip empty lines but add spacing
    if (!line.trim()) {
      if (inList) {
        htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      htmlLines.push('<div style="margin: 10px 0;"></div>');
      continue;
    }
    
    // Escape HTML first
    line = escapeHtml(line);
    
    // Handle headers (h1, h2, h3)
    if (line.match(/^###\s+(.+)/)) {
      if (inList) {
        htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      const content = line.replace(/^###\s+/, '');
      htmlLines.push(`<h3 style="color: #2d3748; font-size: 18px; font-weight: 700; margin: 25px 0 12px 0; line-height: 1.4;">${content}</h3>`);
      continue;
    }
    
    if (line.match(/^##\s+(.+)/)) {
      if (inList) {
        htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      const content = line.replace(/^##\s+/, '');
      htmlLines.push(`<h2 style="color: #1a202c; font-size: 22px; font-weight: 700; margin: 30px 0 15px 0; line-height: 1.3; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">${content}</h2>`);
      continue;
    }
    
    if (line.match(/^#\s+(.+)/)) {
      if (inList) {
        htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      const content = line.replace(/^#\s+/, '');
      htmlLines.push(`<h1 style="color: #1a202c; font-size: 24px; font-weight: 700; margin: 30px 0 15px 0; line-height: 1.3;">${content}</h1>`);
      continue;
    }
    
    // Handle horizontal rules
    if (line.match(/^---+$/)) {
      if (inList) {
        htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      htmlLines.push('<hr style="border: none; border-top: 2px solid #cbd5e0; margin: 25px 0;">');
      continue;
    }
    
    // Handle unordered lists (*, -)
    if (line.match(/^\s*[\*\-]\s+(.+)/)) {
      const content = line.replace(/^\s*[\*\-]\s+/, '');
      if (!inList || listType !== 'ul') {
        if (inList) htmlLines.push('</ol>');
        htmlLines.push('<ul style="margin: 10px 0; padding-left: 25px;">');
        inList = true;
        listType = 'ul';
      }
      htmlLines.push(`<li style="color: #4a5568; font-size: 15px; line-height: 1.7; margin: 8px 0;">${content}</li>`);
      continue;
    }
    
    // Handle numbered lists
    if (line.match(/^\s*\d+\.\s+(.+)/)) {
      const content = line.replace(/^\s*\d+\.\s+/, '');
      if (!inList || listType !== 'ol') {
        if (inList) htmlLines.push('</ul>');
        htmlLines.push('<ol style="margin: 10px 0; padding-left: 25px;">');
        inList = true;
        listType = 'ol';
      }
      htmlLines.push(`<li style="color: #4a5568; font-size: 15px; line-height: 1.7; margin: 8px 0;">${content}</li>`);
      continue;
    }
    
    // Close list if we're in one and hit regular text
    if (inList) {
      htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }
    
    // Regular paragraph
    htmlLines.push(`<p style="color: #4a5568; font-size: 15px; line-height: 1.7; margin: 12px 0;">${line}</p>`);
  }
  
  // Close any open lists
  if (inList) {
    htmlLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }
  
  // Join all lines
  let formatted = htmlLines.join('\n');
  
  // Apply inline formatting (bold, italic) after structure is built
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');
  
  // Convert *italic* to <em>
  formatted = formatted.replace(/\*([^*\s][^*]*[^*\s])\*/g, '<em style="font-style: italic;">$1</em>');
  
  return formatted;
};

// Function to create simple HTML email template with plain text content
const createEmailTemplate = (characterName: string, goal: string, conversation: string) => {
  // Just escape HTML entities and preserve line breaks
  const escapedConversation = escapeHtml(conversation).replace(/\n/g, '<br>');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your 2-Month Plan from ${escapeHtml(characterName)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                🚀 Your Personalized 2-Month Plan
              </h1>
              <p style="margin: 15px 0 0 0; color: #f0f0f0; font-size: 16px;">
                from ${escapeHtml(characterName)}
              </p>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Welcome Message -->
              <p style="margin: 0 0 25px 0; color: #2d3748; font-size: 16px; line-height: 1.6;">
                Hello! ${escapeHtml(characterName)} has created a custom plan to help you achieve your goal.
              </p>
              
              <!-- Goal Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #edf2f7; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
                    <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      YOUR GOAL
                    </p>
                    <p style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 600; line-height: 1.5;">
                      ${escapeHtml(goal)}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 30px 0;">
              
              <!-- Action Plan -->
              <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px; font-weight: 700;">
                📋 Your Action Plan
              </h2>
              
              <div style="color: #4a5568; font-size: 15px; line-height: 1.8; white-space: pre-wrap; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                ${escapedConversation}
              </div>
              
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                💪 Stay committed and track your progress.
              </p>
              <p style="margin: 0; color: #718096; font-size: 14px; font-style: italic;">
                You've got this!
              </p>
              <p style="margin: 15px 0 0 0; color: #2d3748; font-size: 15px; font-weight: 600;">
                — ${escapeHtml(characterName)}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);

    // Generate conversation using shared module
    const { conversation } = await generateConversation({
      characterName: character_name,
      goal: goal,
      apiKey: openaiApiKey,
    });

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

    // Generate beautifully formatted email with inline styles
    console.log('Generating email template...');
    const emailHtml = createEmailTemplate(character_name, goal, conversation);
    
    // Send email with the 2-month plan
    console.log('Sending email to:', email);
    const { error: emailError } = await resend.emails.send({
      from: 'goggins@momentoai.co',
      to: [email],
      subject: `Your 2-Month Plan from ${character_name} 🚀`,
      html: emailHtml,
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