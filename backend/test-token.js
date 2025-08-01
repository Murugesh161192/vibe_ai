#!/usr/bin/env node

/**
 * Simple GitHub Token Test
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

console.log('🔍 GitHub Token Test\n');

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.log('❌ No GitHub token found in environment variables');
  console.log('💡 Run: npm run setup-token');
  process.exit(1);
}

console.log(`✅ Token found: ${token.substring(0, 10)}...`);
console.log('🚀 Testing GitHub API...\n');

// Test the token with a simple API call
const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'VibeAI-TokenTest/1.0.0',
    'Authorization': `token ${token}`
  },
  timeout: 10000
});

async function testToken() {
  try {
    // Test 1: Get rate limit info
    console.log('📊 Testing rate limit...');
    const rateLimitResponse = await api.get('/rate_limit');
    const rateLimit = rateLimitResponse.data.resources.core;
    
    console.log(`   - Limit: ${rateLimit.limit}`);
    console.log(`   - Remaining: ${rateLimit.remaining}`);
    console.log(`   - Reset: ${new Date(rateLimit.reset * 1000).toLocaleString()}`);
    
    // Test 2: Get a simple repository
    console.log('\n📦 Testing repository access...');
    const repoResponse = await api.get('/repos/fastify/fastify');
    const repo = repoResponse.data;
    
    console.log(`   - Repository: ${repo.full_name}`);
    console.log(`   - Language: ${repo.language}`);
    console.log(`   - Stars: ${repo.stargazers_count}`);
    console.log(`   - Forks: ${repo.forks_count}`);
    
    console.log('\n✅ Token is working correctly!');
    console.log('🎉 You can now use the Vibe AI application.');
    
  } catch (error) {
    console.error('\n❌ Token test failed:');
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('   - Authentication failed. Token might be invalid or expired.');
          console.error('   - Please generate a new token at: https://github.com/settings/tokens');
          break;
        case 403:
          console.error('   - Access denied. Token might not have the right permissions.');
          console.error('   - Make sure the token has "public_repo" scope.');
          break;
        case 404:
          console.error('   - Repository not found.');
          break;
        default:
          console.error(`   - HTTP ${status}: ${data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      console.error('   - Network error. Please check your internet connection.');
    } else {
      console.error(`   - ${error.message}`);
    }
    
    process.exit(1);
  }
}

testToken(); 