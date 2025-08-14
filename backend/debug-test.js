#!/usr/bin/env node

/**
 * Debug script to test the backend API
 */

import dotenv from 'dotenv';

// Load environment variables BEFORE any other imports
dotenv.config();

import { analyzeRepository } from './src/services/analyzer.js';

console.log('🔍 Debug Test for Vibe GitHub Assistant Backend\n');
console.log('🔧 Environment Variables:');
console.log(`   - GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set'}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'not set'}\n`);

// Test configuration
const testRepoUrl = 'https://github.com/fastify/fastify';

console.log('📋 Test Configuration:');
console.log(`- Repository: ${testRepoUrl}`);
console.log(`- GitHub Token: ${process.env.GITHUB_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
console.log(`- Node Environment: ${process.env.NODE_ENV || 'development'}\n`);

async function runTest() {
  try {
    console.log('🚀 Starting analysis...');
    const startTime = Date.now();
    
    const result = await analyzeRepository(testRepoUrl);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Analysis completed successfully!');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Vibe Score: ${result.vibeScore.total}/100`);
    console.log(`🏷️  Language: ${result.repoInfo.language}`);
    console.log(`⭐ Stars: ${result.repoInfo.stars}`);
    console.log(`🍴 Forks: ${result.repoInfo.forks}`);
    console.log(`👥 Contributors: ${result.repoInfo.contributors}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    // Check for specific error types
    if (error.message.includes('rate limit')) {
      console.log('\n💡 Rate limit solution:');
      console.log('1. Add a GitHub token to backend/.env');
      console.log('2. Run: npm run setup-token');
    }
    
    if (error.message.includes('not found')) {
      console.log('\n💡 Repository not found solution:');
      console.log('1. Check if the repository URL is correct');
      console.log('2. Ensure the repository is public');
    }
    
    if (error.message.includes('access denied')) {
      console.log('\n💡 Access denied solution:');
      console.log('1. Repository might be private');
      console.log('2. Check your GitHub token permissions');
    }
  }
}

// Run the test
runTest(); 