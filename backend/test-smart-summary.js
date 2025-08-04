import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testSmartSummary() {
  console.log('🧪 Testing Smart Summary Feature\n');
  
  const testCases = [
    { owner: 'facebook', repo: 'react' },
    { owner: 'nodejs', repo: 'node' },
    { owner: 'microsoft', repo: 'vscode' }
  ];
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  for (const test of testCases) {
    console.log(`\n📝 Testing ${test.owner}/${test.repo}...`);
    
    try {
      const response = await axios.post(`${API_URL}/api/ai/summarize`, {
        owner: test.owner,
        repo: test.repo
      });
      
      if (response.data.success) {
        console.log('✅ Success!');
        console.log('📄 Summary:', response.data.data.summary);
      } else {
        console.log('❌ Failed:', response.data.error);
      }
    } catch (error) {
      console.error('❌ Error:', error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n✨ Smart Summary test completed!');
}

testSmartSummary().catch(console.error); 