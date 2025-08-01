#!/usr/bin/env node

/**
 * Test API Response Structure
 */

import dotenv from 'dotenv';
import { analyzeRepository } from './src/services/analyzer.js';

// Load environment variables
dotenv.config();

console.log('🔍 Testing API Response Structure\n');

async function testResponse() {
  try {
    const result = await analyzeRepository('https://github.com/fastify/fastify');
    
    console.log('📊 Full Response Structure:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 Repository Info Details:');
    console.log(`- Name: ${result.repoInfo.name}`);
    console.log(`- Full Name: ${result.repoInfo.fullName}`);
    console.log(`- Language: ${result.repoInfo.language}`);
    console.log(`- Stars: ${result.repoInfo.stars}`);
    console.log(`- Forks: ${result.repoInfo.forks}`);
    console.log(`- Contributors: ${result.repoInfo.contributors}`);
    console.log(`- Contributors Type: ${typeof result.repoInfo.contributors}`);
    console.log(`- Created At: ${result.repoInfo.createdAt}`);
    console.log(`- Updated At: ${result.repoInfo.updatedAt}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testResponse(); 