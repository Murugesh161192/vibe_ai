import dotenv from 'dotenv';
import { GeminiInsightsService } from './src/services/geminiInsights.js';
import { GitHubService } from './src/services/github.js';

dotenv.config();

console.log('🧪 Testing Contributor Insights Generation\n');

async function testContributorInsights() {
  try {
    // Initialize services
    const githubService = new GitHubService();
    const geminiService = new GeminiInsightsService();
    
    // Test repository
    const owner = 'facebook';
    const repo = 'react';
    
    console.log(`📊 Testing with ${owner}/${repo}\n`);
    
    // Fetch repository data
    console.log('1️⃣ Fetching repository data from GitHub...');
    const [repoInfo, commits, contributors] = await Promise.all([
      githubService.getRepository(owner, repo),
      githubService.getCommits(owner, repo, 30),
      githubService.getContributors(owner, repo, 10)
    ]);
    
    console.log(`   ✅ Repository: ${repoInfo.name}`);
    console.log(`   ✅ Commits fetched: ${commits.length}`);
    console.log(`   ✅ Contributors fetched: ${contributors.length}\n`);
    
    // Generate contributor insights
    console.log('2️⃣ Generating AI contributor insights...');
    const contributorInsights = await geminiService.generateContributorInsights({
      repoInfo,
      commits,
      contributors
    });
    
    console.log('   ✅ Contributor insights generated!\n');
    
    // Display results
    console.log('📝 Contributor Insights:');
    console.log('━'.repeat(50));
    
    if (contributorInsights.contributors && contributorInsights.contributors.length > 0) {
      console.log('\n👥 Top Contributors:');
      contributorInsights.contributors.slice(0, 5).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.login}`);
        console.log(`      - Role: ${c.role}`);
        console.log(`      - Contributions: ${c.contributions}`);
        console.log(`      - Impact: ${c.impact}`);
        console.log(`      - Expertise: ${c.expertise}`);
        console.log(`      - Percentage: ${c.percentage}%`);
      });
    }
    
    if (contributorInsights.codeReviewMetrics) {
      console.log('\n📊 Code Review Metrics:');
      const metrics = contributorInsights.codeReviewMetrics;
      console.log(`   - PR Merge Rate: ${metrics.prMergeRate}`);
      console.log(`   - Issue Response Time: ${metrics.issueResponseTime}`);
      console.log(`   - Commit Frequency: ${metrics.commitFrequency}/week`);
      console.log(`   - Code Quality Score: ${metrics.codeQuality}/100`);
      console.log(`   - Test Coverage: ${metrics.testCoverage}`);
      console.log(`   - Active Branches: ${metrics.activeBranches}`);
    }
    
    if (contributorInsights.collaborationPattern) {
      console.log(`\n🤝 Collaboration Pattern: ${contributorInsights.collaborationPattern}`);
    }
    
    if (contributorInsights.teamDynamics) {
      console.log(`💡 Team Dynamics: ${contributorInsights.teamDynamics}`);
    }
    
    if (contributorInsights.reviewRecommendations && contributorInsights.reviewRecommendations.length > 0) {
      console.log('\n💭 Review Recommendations:');
      contributorInsights.reviewRecommendations.forEach((rec, i) => {
        const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${rec.message}`);
      });
    }
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testContributorInsights(); 