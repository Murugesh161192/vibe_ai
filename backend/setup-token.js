#!/usr/bin/env node

/**
 * GitHub Token Setup Script
 * Helps users configure their GitHub Personal Access Token
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 GitHub Token Setup for Vibe GitHub Assistant\n');

console.log('📋 Instructions:');
console.log('1. Go to: https://github.com/settings/tokens');
console.log('2. Click "Generate new token (classic)"');
console.log('3. Give it a name like "Vibe GitHub Assistant"');
console.log('4. Select the "public_repo" scope');
console.log('5. Copy the generated token\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your GitHub Personal Access Token: ', (token) => {
  if (!token || token.trim() === '') {
    console.log('❌ No token provided. Setup cancelled.');
    rl.close();
    return;
  }

  // Validate token format (support both classic and fine-grained tokens)
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    console.log('⚠️  Warning: Token should start with "ghp_" (classic) or "github_pat_" (fine-grained). Please verify your token.');
  }

  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  // Read existing .env file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if GITHUB_TOKEN already exists
  if (envContent.includes('GITHUB_TOKEN=')) {
    // Replace existing token
    envContent = envContent.replace(/GITHUB_TOKEN=.*/g, `GITHUB_TOKEN=${token}`);
  } else {
    // Add token to existing content
    envContent += `\n# GitHub API Configuration\nGITHUB_TOKEN=${token}\n`;
  }

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ GitHub token configured successfully!');
    console.log('📁 Token saved to: backend/.env');
    console.log('\n🚀 You can now run the application with higher API rate limits (5,000 requests/hour)');
  } catch (error) {
    console.error('❌ Failed to save token:', error.message);
  }

  rl.close();
}); 