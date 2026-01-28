const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('=== Gemini API Diagnostic Test ===\n');

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file!');
  process.exit(1);
}

// Cek apakah key valid (panjang dan format)
if (GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.error('❌ You need to replace the placeholder with actual API key!');
  console.log('\n📝 Steps:');
  console.log('1. Go to: https://aistudio.google.com/app/apikey');
  console.log('2. Create new API key');
  console.log('3. Copy and paste to .env file\n');
  process.exit(1);
}

console.log('✅ API Key found (length:', GEMINI_API_KEY.length, 'chars)');
console.log('   Key preview:', GEMINI_API_KEY.substring(0, 10) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4));

console.log('\nTesting connection with gemini-pro model...\n');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = 'Say "Hello from Gemini!" in one sentence.';
    
    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Gemini is working!\n');
    console.log('Response:', text);
    console.log('\n🎉 Ready to proceed with migration!\n');
    
  } catch (error) {
    console.error('\n❌ FAILED to connect to Gemini\n');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
      console.log('\n💡 Solution: Your API key might be invalid or restricted.');
      console.log('   Try creating a NEW API key at: https://aistudio.google.com/app/apikey\n');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('\n💡 Solution: Model access issue.');
      console.log('   This might be a regional restriction or API limitation.');
      console.log('   Try enabling Gemini API in Google Cloud Console.\n');
    }
    
    console.log('Full error details for debugging:');
    console.error(error);
  }
}

testGemini();
