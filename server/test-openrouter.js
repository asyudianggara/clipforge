const OpenAI = require('openai');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
  console.error('❌ OPENROUTER_API_KEY not found in .env file!');
  console.log('\n📝 Setup Steps:');
  console.log('1. Visit: https://openrouter.ai/keys');
  console.log('2. Sign in with Google');
  console.log('3. Click "Create Key"');
  console.log('4. Copy the key and add to .env file:');
  console.log('   OPENROUTER_API_KEY=sk-or-v1-...\n');
  console.log('💡 You get $1 FREE credit for testing!\n');
  process.exit(1);
}

console.log('Testing OpenRouter API Connection...\n');

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // Your app URL
    'X-Title': 'CLIPFORGE' // Your app name
  }
});

async function testOpenRouter() {
  try {
    console.log('Sending test request...');
    
    const completion = await openrouter.chat.completions.create({
      model: 'meta-llama/llama-3.2-3b-instruct:free', // Model GRATIS di OpenRouter
      messages: [
        { role: 'user', content: 'Say "Hello from OpenRouter!" in one short sentence.' }
      ]
    });
    
    const response = completion.choices[0].message.content;
    
    console.log('\n✅ OpenRouter API: SUCCESS!\n');
    console.log('Model used:', completion.model);
    console.log('Response:', response);
    console.log('\n🎉 Ready to use OpenRouter for CLIPFORGE!\n');
    
  } catch (error) {
    console.error('\n❌ OpenRouter API: FAILED\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 Your API key is invalid. Please check and update it.\n');
    } else if (error.message.includes('credit')) {
      console.log('\n💡 No credits available. Add payment method at https://openrouter.ai/settings/billing\n');
    }
  }
}

testOpenRouter();
