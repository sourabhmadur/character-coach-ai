// Shared OpenAI API calling logic
import { getCharacterPrompt } from './prompts.ts';

export interface OpenAIRequest {
  characterName: string;
  goal: string;
  apiKey: string;
}

export interface OpenAIResponse {
  conversation: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateConversation(
  request: OpenAIRequest
): Promise<OpenAIResponse> {
  const { characterName, goal, apiKey } = request;
  
  const systemPrompt = getCharacterPrompt(characterName, goal);

  console.log('Calling OpenAI API...');
  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Create a comprehensive 2-month plan to achieve their goal.' }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('OpenAI API error:', aiResponse.status, errorText);
    throw new Error(`OpenAI API request failed: ${aiResponse.status}`);
  }

  const aiData = await aiResponse.json();
  
  return {
    conversation: aiData.choices[0].message.content,
    usage: aiData.usage,
  };
}
