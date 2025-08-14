import dotenv from 'dotenv';
import { GeminiInsightsService } from './src/services/geminiInsights.js';

dotenv.config();

console.log('🧪 Testing Gemini 1.5 Flash Integration\n');

// Check if API key is set
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env file');
  console.log('\nPlease add to your .env file:');
  console.log('GEMINI_API_KEY=your_gemini_api_key_here');
  process.exit(1);
}

console.log('✅ Gemini API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...\n');

// Test data
const testRepoData = {
  repoInfo: {
    name: 'test-repo',
    description: 'Testing Gemini 1.5 Flash integration',
    language: 'JavaScript',
    stargazers_count: 100
  },
  commits: [
    { commit: { message: 'Initial commit', author: { name: 'Test User', date: new Date() } } },
    { commit: { message: 'Add feature', author: { name: 'Test User', date: new Date() } } }
  ],
  contributors: [
    { login: 'testuser', contributions: 10 }
  ],
  contents: [
    { path: 'index.js', type: 'file' },
    { path: 'README.md', type: 'file' }
  ]
};

async function testGemini() {
  try {
    console.log('🔄 Initializing Gemini service...');
    const geminiService = new GeminiInsightsService();
    
    console.log('📤 Sending test request to Gemini 1.5 Flash...');
    const startTime = Date.now();
    
    const result = await geminiService.generateInsights(testRepoData);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ SUCCESS! Gemini responded in ${duration}s`);
    console.log('\n📊 Insights Generated:');
    console.log('- Hotspot Files:', result.hotspotFiles?.length || 0);
    console.log('- Recommendations:', result.recommendations?.length || 0);
    console.log('- Has Contributor Insights:', !!result.contributorInsights);
    console.log('- Has Development Patterns:', !!result.developmentPatterns);
    console.log('- Has Code Quality:', !!result.codeQuality);
    
    if (result.recommendations?.length > 0) {
      console.log('\n💡 Sample Recommendation:');
      console.log(`- ${result.recommendations[0].priority.toUpperCase()}: ${result.recommendations[0].suggestion}`);
    }
    
    console.log('\n🎉 Gemini 1.5 Flash is working perfectly!');
    console.log('\n✨ Your Vibe GitHub Assistant is ready to use with AI insights.');
    
  } catch (error) {
    console.error('\n❌ Gemini test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n🔑 API Key Issue:');
      console.error('Please check your Gemini API key at:');
      console.error('https://makersuite.google.com/app/apikey');
    }
  }
}

testGemini(); 