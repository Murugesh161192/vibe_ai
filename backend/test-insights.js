// Test script for Gemini AI insights endpoint
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testInsights() {
  console.log('🧪 Testing Gemini AI Insights Endpoint...\n');

  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env file');
    console.log('Please add your Gemini API key to the .env file:');
    console.log('GEMINI_API_KEY=your_actual_api_key_here\n');
    process.exit(1);
  }

  const testRepos = [
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
    'https://github.com/nodejs/node'
  ];

  console.log(`Testing with repository: ${testRepos[0]}\n`);

  try {
    console.log('📤 Sending request to /api/analyze/insights...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_URL}/api/analyze/insights`, {
      repoUrl: testRepos[0]
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Response received in ${duration}s\n`);

    if (response.data.success) {
      const { insights, visualizations } = response.data.data;
      
      console.log('📊 Insights Summary:');
      console.log('==================');
      
      // Hotspot Files
      if (insights.hotspotFiles?.length > 0) {
        console.log(`\n📍 Code Hotspots (${insights.hotspotFiles.length} files):`);
        insights.hotspotFiles.forEach((file, i) => {
          console.log(`  ${i + 1}. ${file.file}`);
          console.log(`     Reason: ${file.reason}`);
        });
      }

      // Contributor Insights
      if (insights.contributorInsights) {
        console.log('\n👥 Team Insights:');
        console.log(`  Most Active: ${insights.contributorInsights.mostActive?.join(', ') || 'N/A'}`);
        console.log(`  Pattern: ${insights.contributorInsights.collaborationPattern}`);
      }

      // Development Patterns
      if (insights.developmentPatterns) {
        console.log('\n📈 Development Patterns:');
        console.log(`  Commit Frequency: ${insights.developmentPatterns.commitFrequency}`);
        console.log(`  Velocity: ${insights.developmentPatterns.velocity}`);
      }

      // Code Quality
      if (insights.codeQuality) {
        console.log('\n🔍 Code Quality:');
        console.log(`  Strengths: ${insights.codeQuality.strengths?.length || 0} identified`);
        console.log(`  Concerns: ${insights.codeQuality.concerns?.length || 0} identified`);
      }

      // Recommendations
      if (insights.recommendations?.length > 0) {
        console.log(`\n📋 Recommendations (${insights.recommendations.length} total):`);
        const highPriority = insights.recommendations.filter(r => r.priority === 'high');
        console.log(`  High Priority: ${highPriority.length}`);
        const mediumPriority = insights.recommendations.filter(r => r.priority === 'medium');
        console.log(`  Medium Priority: ${mediumPriority.length}`);
        const lowPriority = insights.recommendations.filter(r => r.priority === 'low');
        console.log(`  Low Priority: ${lowPriority.length}`);
      }

      // Visualizations
      if (visualizations) {
        console.log('\n📊 Visualization Data:');
        console.log(`  Commit frequency data points: ${visualizations.commitFrequency?.length || 0}`);
        console.log(`  Contributors analyzed: ${visualizations.contributorDistribution?.length || 0}`);
      }

      console.log('\n✅ All tests passed! Gemini insights are working correctly.');
      
    } else {
      console.error('❌ Test failed: Response indicates failure');
      console.error(response.data);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(`Error: ${error.message}`);
    
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    
    if (error.response?.status === 503) {
      console.log('\n💡 Tip: Make sure your GEMINI_API_KEY is valid and active.');
    }
    
    process.exit(1);
  }
}

// Run the test
testInsights(); 