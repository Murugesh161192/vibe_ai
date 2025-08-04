import dotenv from 'dotenv';
import { GitHubService } from './src/services/github.js';

dotenv.config();

async function testReadmeFetch() {
  console.log('🧪 Testing README Fetch\n');
  
  const githubService = new GitHubService();
  
  const tests = [
    { owner: 'facebook', repo: 'react' },
    { owner: 'nodejs', repo: 'node' },
    { owner: 'boysenberry-repo-1', repo: 'boysenberry-repo-1' }
  ];
  
  for (const test of tests) {
    console.log(`\n📖 Fetching README for ${test.owner}/${test.repo}...`);
    
    try {
      const content = await githubService.getReadmeContent(test.owner, test.repo);
      
      if (content) {
        console.log('✅ README found!');
        console.log(`📏 Length: ${content.length} characters`);
        console.log(`📄 First 200 chars: ${content.substring(0, 200)}...`);
      } else {
        console.log('❌ No README found');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('Details:', error.status, error.response?.data);
    }
  }
}

testReadmeFetch().catch(console.error); 