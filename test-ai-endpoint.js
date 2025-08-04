#!/usr/bin/env node

/**
 * Test script for AI insights endpoint
 * Helps diagnose deployment issues
 */

import fetch from 'node-fetch';
import https from 'https';

const API_BASE = 'https://vibe-ai-fjtt.onrender.com';

// Create a custom HTTPS agent to handle SSL issues
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testEndpoint() {
  console.log('🧪 Testing AI Insights Endpoint');
  console.log('================================\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_BASE}/health`, {
      agent: httpsAgent
    });
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Basic analysis endpoint
  console.log('\n2. Testing basic analysis endpoint...');
  try {
    const analyzeResponse = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/facebook/react'
      }),
      agent: httpsAgent
    });

    if (analyzeResponse.ok) {
      const analyzeData = await analyzeResponse.json();
      console.log('✅ Basic analysis passed');
    } else {
      const errorData = await analyzeResponse.text();
      console.log('❌ Basic analysis failed:', analyzeResponse.status, errorData);
    }
  } catch (error) {
    console.log('❌ Basic analysis error:', error.message);
  }

  // Test 3: AI insights endpoint
  console.log('\n3. Testing AI insights endpoint...');
  try {
    const insightsResponse = await fetch(`${API_BASE}/api/analyze/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/facebook/react'
      }),
      agent: httpsAgent
    });

    console.log('Status:', insightsResponse.status);
    console.log('Status Text:', insightsResponse.statusText);

    const responseText = await insightsResponse.text();
    console.log('Response:', responseText);

    if (insightsResponse.ok) {
      try {
        const insightsData = JSON.parse(responseText);
        console.log('✅ AI insights passed');
        console.log('Data keys:', Object.keys(insightsData));
      } catch (parseError) {
        console.log('⚠️ Response is not valid JSON:', responseText);
      }
    } else {
      console.log('❌ AI insights failed');
      
      // Try to parse error response
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (parseError) {
        console.log('Raw error response:', responseText);
      }
    }
  } catch (error) {
    console.log('❌ AI insights error:', error.message);
  }

  // Test 4: Different repository URL format
  console.log('\n4. Testing with different URL format...');
  try {
    const insightsResponse2 = await fetch(`${API_BASE}/api/analyze/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repoUrl: 'https://github.com/facebook/react.git'
      }),
      agent: httpsAgent
    });

    console.log('Status (with .git):', insightsResponse2.status);
    const responseText2 = await insightsResponse2.text();
    console.log('Response (with .git):', responseText2);
  } catch (error) {
    console.log('❌ Test with .git failed:', error.message);
  }
}

testEndpoint().catch(console.error); 