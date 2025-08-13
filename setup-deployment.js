#!/usr/bin/env node

/**
 * Deployment Setup Script for Vibe GitHub Assistant
 * Helps configure required environment variables for deployment
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Vibe GitHub Assistant Deployment Setup');
console.log('============================\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupDeployment() {
  console.log('This script will help you configure the required environment variables for deployment.\n');

  // GitHub Token
  console.log('1. GitHub Personal Access Token');
  console.log('   - Go to: https://github.com/settings/tokens');
  console.log('   - Generate a new token with "public_repo" scope');
  console.log('   - Copy the token (starts with ghp_...)\n');
  
  const githubToken = await question('Enter your GitHub token (or press Enter to skip): ');
  
  // Gemini API Key
  console.log('\n2. Gemini AI API Key (Required for AI Insights)');
  console.log('   - Go to: https://makersuite.google.com/app/apikey');
  console.log('   - Create a new API key');
  console.log('   - Copy the key (starts with AI...)\n');
  
  const geminiKey = await question('Enter your Gemini API key (or press Enter to skip): ');
  
  // API URL
  console.log('\n3. Backend API URL');
  console.log('   - This should be your deployed backend URL');
  console.log('   - Example: https://your-app.railway.app\n');
  
  const apiUrl = await question('Enter your backend API URL (or press Enter to use default): ');
  
  // Generate configuration
  console.log('\n📋 Configuration Summary:');
  console.log('========================');
  
  if (githubToken) {
    console.log('✅ GitHub Token: Configured');
  } else {
    console.log('⚠️  GitHub Token: Not configured');
  }
  
  if (geminiKey) {
    console.log('✅ Gemini API Key: Configured');
  } else {
    console.log('⚠️  Gemini API Key: Not configured (AI insights will be disabled)');
  }
  
  if (apiUrl) {
    console.log('✅ API URL: Configured');
  } else {
    console.log('⚠️  API URL: Using default');
  }
  
  // Generate environment files
  console.log('\n📁 Generating environment files...');
  
  // Backend .env
  if (githubToken || geminiKey) {
    const backendEnv = `# GitHub API Configuration
GITHUB_TOKEN=${githubToken || 'your_github_token_here'}

# Gemini AI API Configuration (Required for AI insights)
GEMINI_API_KEY=${geminiKey || 'your_gemini_api_key_here'}

# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=${apiUrl ? new URL(apiUrl).origin : 'http://localhost:5173'}
RATE_LIMIT_MAX=1000
RATE_LIMIT_TIME_WINDOW=900000
`;
    
    fs.writeFileSync('backend/.env', backendEnv);
    console.log('✅ Created backend/.env');
  }
  
  // Frontend .env
  const frontendEnv = `# API Configuration
VITE_API_URL=${apiUrl || 'http://localhost:3000'}

# Application Configuration
VITE_APP_NAME=Vibe GitHub Assistant
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
`;
  
  fs.writeFileSync('frontend/.env', frontendEnv);
  console.log('✅ Created frontend/.env');
  
  // Deployment instructions
  console.log('\n📋 Deployment Instructions:');
  console.log('===========================');
  
  console.log('\n🔧 For Railway/Render/Heroku deployment:');
  console.log('1. Add these environment variables to your deployment platform:');
  
  if (githubToken) {
    console.log(`   GITHUB_TOKEN=${githubToken}`);
  } else {
    console.log('   GITHUB_TOKEN=your_github_token_here');
  }
  
  if (geminiKey) {
    console.log(`   GEMINI_API_KEY=${geminiKey}`);
  } else {
    console.log('   GEMINI_API_KEY=your_gemini_api_key_here');
  }
  
  console.log('   NODE_ENV=production');
  console.log('   PORT=3000');
  
  if (apiUrl) {
    console.log(`   CORS_ORIGIN=${new URL(apiUrl).origin}`);
  } else {
    console.log('   CORS_ORIGIN=https://your-frontend-domain.com');
  }
  
  console.log('\n🌐 For Netlify deployment:');
  console.log('1. Add these environment variables to Netlify:');
  console.log(`   VITE_API_URL=${apiUrl || 'https://your-backend-domain.com'}`);
  console.log('   VITE_APP_NAME=Vibe GitHub Assistant');
  console.log('   VITE_APP_VERSION=1.0.0');
  
  console.log('\n🧪 Testing:');
  console.log('1. Test backend health:');
  console.log(`   curl ${apiUrl || 'https://your-backend-domain.com'}/health`);
  
  console.log('\n2. Test AI insights (if Gemini key is configured):');
  console.log(`   curl -X POST ${apiUrl || 'https://your-backend-domain.com'}/api/analyze/insights \\`);
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"repoUrl": "https://github.com/facebook/react"}\'');
  
  console.log('\n✅ Setup complete!');
  console.log('\n📚 For detailed deployment instructions, see DEPLOYMENT.md');
  
  rl.close();
}

setupDeployment().catch(console.error); 