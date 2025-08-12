import 'dotenv/config';
import { GeminiInsightsService } from './src/services/geminiInsights.js';
import { GitHubService } from './src/services/github.js';

console.log('🧪 Testing AI Insights Generation in Backend...\n');

// Check if Gemini API key is configured
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not configured in .env file!');
  console.log('\n📝 To enable AI insights:');
  console.log('1. Get a Gemini API key from: https://makersuite.google.com/app/apikey');
  console.log('2. Add to backend/.env file:');
  console.log('   GEMINI_API_KEY=your_api_key_here');
  console.log('3. Run this test again');
  process.exit(1);
}

console.log('✅ Gemini API Key found:', apiKey.substring(0, 10) + '...');

async function testAIInsights() {
  try {
    // Initialize services
    console.log('\n📦 Initializing services...');
    const geminiService = new GeminiInsightsService();
    const githubService = new GitHubService();
    
    // Test repository
    const testRepo = 'facebook/react';
    const [owner, repo] = testRepo.split('/');
    
    console.log(`\n🔍 Testing with repository: ${testRepo}`);
    
    // Fetch GitHub data
    console.log('\n📊 Fetching GitHub data...');
    const [repoInfo, commits, contributors] = await Promise.all([
      githubService.getRepositoryInfo(owner, repo),
      githubService.getCommitHistory(owner, repo, 10),
      githubService.getContributors(owner, repo, 5)
    ]);
    
    console.log('✅ GitHub data fetched:');
    console.log(`  - Repository: ${repoInfo.full_name}`);
    console.log(`  - Stars: ${repoInfo.stargazers_count}`);
    console.log(`  - Commits fetched: ${commits.length}`);
    console.log(`  - Contributors fetched: ${contributors.length}`);
    
    // Generate AI insights
    console.log('\n🤖 Generating AI insights...');
    const insights = await geminiService.generateInsights({
      repoInfo,
      commits,
      contributors
    });
    
    // Validate the response structure
    console.log('\n✅ AI Insights Generated Successfully!');
    console.log('\n📊 Response Structure:');
    console.log({
      hasKeyInsights: !!insights.keyInsights,
      keyInsightsCount: insights.keyInsights?.length || 0,
      hasSmartRecommendations: !!insights.smartRecommendations,
      smartRecommendationsCount: insights.smartRecommendations?.length || 0,
      hasSummary: !!insights.summary,
      hasStrengths: !!insights.strengths,
      hasImprovements: !!insights.improvements,
      hasQuality: typeof insights.quality === 'number',
      hasActivity: !!insights.activity,
      hasCollaboration: !!insights.collaboration
    });
    
    // Display Key Insights
    if (insights.keyInsights && insights.keyInsights.length > 0) {
      console.log('\n🔑 Key Insights (AI Generated):');
      insights.keyInsights.forEach((insight, i) => {
        console.log(`  ${i + 1}. ${insight}`);
      });
    } else {
      console.log('\n⚠️ No Key Insights generated!');
    }
    
    // Display Smart Recommendations
    if (insights.smartRecommendations && insights.smartRecommendations.length > 0) {
      console.log('\n💡 Smart Recommendations (AI Generated):');
      insights.smartRecommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.title}`);
        console.log(`     Priority: ${rec.priority} | Category: ${rec.category}`);
        console.log(`     ${rec.description}`);
      });
    } else {
      console.log('\n⚠️ No Smart Recommendations generated!');
    }
    
    // Display Summary
    if (insights.summary) {
      console.log('\n📝 Repository Summary:');
      console.log(`  ${insights.summary}`);
    }
    
    // Display Quality Score
    if (typeof insights.quality === 'number') {
      console.log('\n📈 Quality Score:', insights.quality);
    }
    
    // Test the full analyze endpoint integration
    console.log('\n\n🔄 Testing Full Analyze Endpoint Integration...');
    console.log('(This would be called from the frontend)\n');
    
    // Import the analyzer to simulate the full flow
    const { RepositoryAnalyzer } = await import('./src/services/analyzer.js');
    const analyzer = new RepositoryAnalyzer();
    
    const fullAnalysisResult = await analyzer.analyzeRepository(`https://github.com/${testRepo}`);
    
    console.log('✅ Full Analysis Result Structure:');
    console.log({
      hasVibeScore: !!fullAnalysisResult.vibeScore,
      hasAnalysis: !!fullAnalysisResult.analysis,
      hasRepoInfo: !!fullAnalysisResult.repoInfo,
      vibeScoreTotal: fullAnalysisResult.vibeScore?.total,
      analysisInsightsCount: fullAnalysisResult.analysis?.insights?.length || 0
    });
    
    // Now add AI insights to the result (as the endpoint does)
    const enhancedResult = {
      ...fullAnalysisResult,
      aiInsights: insights
    };
    
    console.log('\n✅ Enhanced Result (with AI):');
    console.log({
      hasAiInsights: !!enhancedResult.aiInsights,
      aiKeyInsightsCount: enhancedResult.aiInsights?.keyInsights?.length || 0,
      aiRecommendationsCount: enhancedResult.aiInsights?.smartRecommendations?.length || 0
    });
    
    console.log('\n✅ AI Insights are working correctly!');
    console.log('The backend is properly generating AI-powered insights.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message.includes('API key')) {
      console.log('\n📝 API Key Issue:');
      console.log('Please check that your GEMINI_API_KEY is valid.');
    } else if (error.message.includes('quota')) {
      console.log('\n📝 Quota Issue:');
      console.log('Your Gemini API quota may be exceeded. Please check your usage.');
    } else if (error.message.includes('GitHub')) {
      console.log('\n📝 GitHub API Issue:');
      console.log('There may be an issue with GitHub API access.');
      console.log('Check if you need a GITHUB_TOKEN for higher rate limits.');
    }
  }
}

// Run the test
testAIInsights().catch(console.error); 