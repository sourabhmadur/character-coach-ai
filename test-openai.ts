// Test OpenAI API using shared modules
// Run with: deno run --allow-net --allow-env test-openai.ts

import { generateConversation } from "./supabase/functions/_shared/openai.ts";

// Configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || 'YOUR_OPENAI_API_KEY_HERE';
const character_name = 'David Goggins';
const goal = 'run a marathon in 2 months';

async function testOpenAI() {
  console.log('Testing OpenAI API with shared modules...\n');
  console.log(`Character: ${character_name}`);
  console.log(`Goal: ${goal}\n`);
  console.log('Calling OpenAI via shared module...\n');

  try {
    const { conversation, usage } = await generateConversation({
      characterName: character_name,
      goal: goal,
      apiKey: OPENAI_API_KEY,
    });

    console.log('='.repeat(80));
    console.log('OPENAI RESPONSE:');
    console.log('='.repeat(80));
    console.log(conversation);
    console.log('='.repeat(80));
    
    if (usage) {
      console.log('\nTokens used:');
      console.log(`  Prompt tokens: ${usage.prompt_tokens}`);
      console.log(`  Completion tokens: ${usage.completion_tokens}`);
      console.log(`  Total tokens: ${usage.total_tokens}`);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

// Run the test
if (import.meta.main) {
  testOpenAI();
}
