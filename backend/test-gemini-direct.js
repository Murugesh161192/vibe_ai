import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiDirect() {
  console.log('🧪 Testing Gemini API directly...\n');

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('📝 Sending test prompt to Gemini...');
    
    const result = await model.generateContent('Say "Hello from Gemini 2.5 Flash!" and nothing else.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Response received:', text);
    console.log('\n🎉 Gemini API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message?.includes('models/gemini-2.5-flash')) {
      console.log('\n💡 Try using a different model like:');
      console.log('   - gemini-1.5-flash');
      console.log('   - gemini-1.5-pro');
      console.log('   - gemini-pro');
    }
  }
}

testGeminiDirect(); 