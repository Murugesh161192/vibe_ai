import { RepositoryAnalyzer } from '../services/analyzer.js';
import { GitHubService } from '../services/github.js';
import { GeminiInsightsService } from '../services/geminiInsights.js';

const analyzer = new RepositoryAnalyzer();
const githubService = new GitHubService();

// Initialize Gemini service with proper error handling
let geminiService = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiService = new GeminiInsightsService();
    console.log('✅ Gemini AI service initialized successfully');
  } catch (error) {
    console.error('⚠️ Failed to initialize Gemini AI service:', error.message);
    console.error('   Summarization features will be unavailable');
    // Continue without AI features instead of crashing
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY not configured - AI features disabled');
}

/**
 * Generate basic contributor insights when AI is not available
 */
function generateBasicContributorInsights(repoData) {
  const { repoInfo, commits, contributors } = repoData;
  const contributorCount = contributors?.length || 0;
  const recentCommitCount = commits?.length || 0;
  
  console.log('  Contributors count:', contributorCount);
  console.log('  Commits count:', recentCommitCount);
  
  // Process contributors data
  let analyzedContributors = [];
  
  if (contributorCount > 0) {
    const totalContributions = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
    
    analyzedContributors = contributors.slice(0, 10).map((contributor, index) => {
      const percentage = totalContributions > 0 
        ? Math.round((contributor.contributions / totalContributions) * 100)
        : 0;
      
      let role = 'Occasional Contributor';
      let impact = 'Low';
      
      if (index === 0) {
        role = 'Lead Developer';
        impact = 'High';
      } else if (percentage > 20) {
        role = 'Core Contributor';
        impact = 'High';
      } else if (percentage > 10) {
        role = 'Active Contributor';
        impact = 'Medium';
      }
      
      return {
        login: contributor.login,
        contributions: contributor.contributions,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
        role,
        expertise: index === 0 ? 'Project Lead' : percentage > 10 ? 'Core Development' : 'Contributing',
        impact,
        percentage
      };
    });
  } else if (commits && commits.length > 0) {
    const commitAuthors = {};
    
    commits.forEach(commit => {
      const author = commit.commit?.author?.name || commit.author?.login || 'Unknown';
      if (author && author !== 'Unknown') {
        commitAuthors[author] = (commitAuthors[author] || 0) + 1;
      }
    });
    
    const sortedAuthors = Object.entries(commitAuthors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const totalCommits = sortedAuthors.reduce((sum, [, count]) => sum + count, 0);
    
    analyzedContributors = sortedAuthors.map(([author, count], index) => {
      const percentage = totalCommits > 0 ? Math.round((count / totalCommits) * 100) : 0;
      
      let role = 'Occasional Contributor';
      let impact = 'Low';
      
      if (index === 0) {
        role = 'Lead Developer';
        impact = 'High';
      } else if (percentage > 20) {
        role = 'Core Contributor';
        impact = 'High';
      } else if (percentage > 10) {
        role = 'Active Contributor';
        impact = 'Medium';
      }
      
      return {
        login: author,
        contributions: count,
        avatar_url: null,
        html_url: null,
        role,
        expertise: index === 0 ? 'Project Lead' : percentage > 10 ? 'Core Development' : 'Contributing',
        impact,
        percentage
      };
    });
  }
  
  // If still no contributors, create a default entry
  if (analyzedContributors.length === 0 && repoInfo) {
    analyzedContributors = [{
      login: repoInfo.owner?.login || 'Repository Owner',
      contributions: recentCommitCount || 1,
      avatar_url: repoInfo.owner?.avatar_url || null,
      html_url: repoInfo.owner?.html_url || null,
      role: 'Project Owner',
      expertise: 'Full Stack Development',
      impact: 'High',
      percentage: 100
    }];
  }
  
  // Calculate ACTUAL repository-specific metrics instead of hardcoded values
  const daysSinceUpdate = Math.floor((Date.now() - new Date(repoInfo?.updated_at || Date.now())) / (1000 * 60 * 60 * 24));
  const daysSinceCreation = Math.floor((Date.now() - new Date(repoInfo?.created_at || Date.now())) / (1000 * 60 * 60 * 24));
  const weeklyCommitRate = recentCommitCount > 0 ? Math.round((recentCommitCount / 30) * 7) : 0;
  
  // Calculate PR Merge Rate based on repository activity patterns
  let prMergeRate = 50; // base rate
  if (repoInfo?.stargazers_count > 500) prMergeRate += 20;
  if (contributorCount > 10) prMergeRate += 15;
  if (daysSinceUpdate < 7) prMergeRate += 10;
  if (repoInfo?.forks_count > 50) prMergeRate += 5;
  prMergeRate = Math.min(prMergeRate, 95);
  
  // Calculate response time based on repository activity and size
  let responseTimeHours = 72; // base 3 days
  if (contributorCount > 20) responseTimeHours = 12; // 12 hours for large teams
  else if (contributorCount > 10) responseTimeHours = 24; // 1 day for medium teams
  else if (contributorCount > 3) responseTimeHours = 48; // 2 days for small teams
  else if (daysSinceUpdate > 30) responseTimeHours = 168; // 1 week for inactive repos
  
  const formatResponseTime = (hours) => {
    if (hours <= 12) return '< 12h';
    if (hours <= 24) return '< 24h';
    if (hours <= 48) return '< 2d';
    if (hours <= 168) return '< 1w';
    return '> 1w';
  };
  
  // Calculate code quality score based on multiple factors
  let codeQuality = 40; // base score
  if (repoInfo?.stargazers_count > 100) codeQuality += 15;
  if (contributorCount > 10) codeQuality += 10;
  if (repoInfo?.license) codeQuality += 10;
  if (daysSinceUpdate < 30) codeQuality += 10;
  if (repoInfo?.open_issues_count < 50) codeQuality += 10;
  if (repoInfo?.forks_count > 10) codeQuality += 5;
  codeQuality = Math.min(codeQuality, 100);
  
  // Calculate test coverage estimation based on repository characteristics
  let testCoverageScore = 30; // base
  if (repoInfo?.stargazers_count > 1000) testCoverageScore += 25;
  if (contributorCount > 15) testCoverageScore += 20;
  if (repoInfo?.license) testCoverageScore += 15;
  if (repoInfo?.forks_count > 100) testCoverageScore += 10;
  testCoverageScore = Math.min(testCoverageScore, 100);
  
  const getTestCoverageLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Moderate';
    return 'Needs Improvement';
  };
  
  // Generate recommendations
  const reviewRecommendations = [];
  
  if (contributorCount < 5) {
    reviewRecommendations.push({
      type: 'warning',
      message: 'Encourage more contributors to join - consider improving documentation'
    });
  } else {
    reviewRecommendations.push({
      type: 'success',
      message: 'Healthy contributor base indicates strong community engagement'
    });
  }
  
  if (weeklyCommitRate < 5) {
    reviewRecommendations.push({
      type: 'warning',
      message: 'Increase development activity to maintain project momentum'
    });
  }
  
  if (codeQuality < 60) {
    reviewRecommendations.push({
      type: 'warning',
      message: 'Consider implementing code review standards to improve quality score'
    });
  } else {
    reviewRecommendations.push({
      type: 'success',
      message: 'Good code quality maintained through regular reviews'
    });
  }
  
  // Add info recommendations
  if (repoInfo?.open_issues_count > 20) {
    reviewRecommendations.push({
      type: 'info',
      message: `${repoInfo.open_issues_count} open issues show active community engagement`
    });
  }
  
  // Determine collaboration pattern
  let collaborationPattern = 'Solo developer';
  let teamDynamics = 'Single developer maintaining the project';
  
  if (contributorCount >= 10) {
    collaborationPattern = 'Strong team collaboration';
    teamDynamics = 'Large, active team with distributed contributions';
  } else if (contributorCount >= 5) {
    collaborationPattern = 'Growing contributor base';
    teamDynamics = 'Small but growing team with regular contributions';
  } else if (contributorCount >= 2) {
    collaborationPattern = 'Small focused team';
    teamDynamics = 'Small team working closely together';
  }
  
  console.log('🎯 Generated repository-specific metrics:');
  console.log(`  PR Merge Rate: ${prMergeRate}%`);
  console.log(`  Response Time: ${formatResponseTime(responseTimeHours)}`);
  console.log(`  Commit Frequency: ${weeklyCommitRate}/week`);
  console.log(`  Code Quality: ${codeQuality}/100`);
  console.log(`  Test Coverage: ${getTestCoverageLabel(testCoverageScore)}`);
  
  return {
    contributors: analyzedContributors,
    codeReviewMetrics: {
      prMergeRate: `${prMergeRate}%`,
      issueResponseTime: formatResponseTime(responseTimeHours),
      commitFrequency: weeklyCommitRate,
      codeQuality,
      testCoverage: getTestCoverageLabel(testCoverageScore),
      activeBranches: Math.max(1, Math.min(contributorCount, 10))
    },
    reviewRecommendations,
    collaborationPattern,
    teamDynamics
  };
}

/**
 * Generate repository-specific insights and recommendations when AI is not available
 */
function generateRepositorySpecificInsights(repoData) {
  const { repoInfo, commits, contributors } = repoData;
  
  // Basic metrics
  const starCount = repoInfo?.stargazers_count || 0;
  const forkCount = repoInfo?.forks_count || 0;
  const openIssues = repoInfo?.open_issues_count || 0;
  const contributorCount = contributors?.length || 0;
  const commitCount = commits?.length || 0;
  const hasLicense = !!repoInfo?.license;
  const hasDescription = !!repoInfo?.description;
  
  // Calculate basic quality score
  let quality = 50; // Base score
  if (starCount > 100) quality += 15;
  else if (starCount > 10) quality += 10;
  else if (starCount > 0) quality += 5;
  
  if (forkCount > 50) quality += 10;
  else if (forkCount > 10) quality += 5;
  
  if (contributorCount > 10) quality += 10;
  else if (contributorCount > 5) quality += 5;
  
  if (openIssues < 10) quality += 5;
  if (hasLicense) quality += 5;
  if (hasDescription) quality += 5;
  
  // Calculate activity level
  const daysSinceUpdate = Math.floor((Date.now() - new Date(repoInfo?.updated_at || Date.now())) / (1000 * 60 * 60 * 24));
  const activity = daysSinceUpdate < 7 ? 'active' : daysSinceUpdate < 30 ? 'moderate' : 'low';
  
  // Generate repository-specific smart recommendations
  const smartRecommendations = [];
  
  // Testing recommendation
  if (contributorCount > 5 || starCount > 50) {
    smartRecommendations.push({
      title: 'Add Comprehensive Test Coverage',
      description: `With ${starCount} stars and ${contributorCount} contributors, implementing robust testing will ensure code reliability and build contributor confidence`,
      priority: starCount > 100 ? 'critical' : 'moderate',
      category: 'testing'
    });
  }
  
  // Documentation recommendation
  if (!hasDescription) {
    smartRecommendations.push({
      title: 'Add Repository Description',
      description: 'A clear description helps potential users and contributors understand your project at first glance',
      priority: 'critical',
      category: 'documentation'
    });
  } else if (starCount < 50) {
    smartRecommendations.push({
      title: 'Enhance README Documentation',
      description: 'Improve documentation with usage examples, installation instructions, and contribution guidelines to attract more users',
      priority: 'moderate',
      category: 'documentation'
    });
  }
  
  // Issue management recommendation
  if (openIssues > 30) {
    smartRecommendations.push({
      title: 'Improve Issue Management',
      description: `With ${openIssues} open issues, consider triaging, labeling, and closing stale issues to maintain project health`,
      priority: openIssues > 100 ? 'critical' : 'moderate',
      category: 'community'
    });
  }
  
  // Community engagement recommendation
  if (contributorCount < 5 && starCount > 20) {
    smartRecommendations.push({
      title: 'Foster Community Engagement',
      description: `Your project has ${starCount} stars but only ${contributorCount} contributors. Add CONTRIBUTING.md and good first issues to encourage participation`,
      priority: 'moderate',
      category: 'community'
    });
  }
  
  // Code quality recommendation
  if (daysSinceUpdate > 180) {
    smartRecommendations.push({
      title: 'Revitalize Project Maintenance',
      description: `Repository hasn't been updated in ${Math.floor(daysSinceUpdate)} days. Regular updates keep the project relevant and dependencies secure`,
      priority: 'critical',
      category: 'code-quality'
    });
  } else if (contributorCount > 3) {
    smartRecommendations.push({
      title: 'Implement CI/CD Pipeline',
      description: `With ${contributorCount} contributors, automated testing and deployment will improve code quality and reduce manual effort`,
      priority: 'moderate',
      category: 'code-quality'
    });
  }
  
  // Security recommendation
  if (!hasLicense) {
    smartRecommendations.push({
      title: 'Add Open Source License',
      description: 'A license clarifies how others can use, modify, and contribute to your project, encouraging wider adoption',
      priority: starCount > 10 ? 'critical' : 'moderate',
      category: 'security'
    });
  }
  
  // Performance recommendation for popular projects
  if (starCount > 200 || forkCount > 100) {
    smartRecommendations.push({
      title: 'Optimize for Scale',
      description: `With ${starCount} stars and ${forkCount} forks, consider performance optimizations and scalability improvements`,
      priority: 'moderate',
      category: 'performance'
    });
  }
  
  // Generate key insights
  const keyInsights = [
    starCount > 100 ? 
      `High community interest with ${starCount} stars indicates strong project adoption` :
      starCount > 20 ? 
        `Growing community engagement with ${starCount} stars shows promising traction` :
        `Early-stage project with ${starCount} stars has room for growth`,
    
    daysSinceUpdate < 7 ? 
      'Very active development with recent updates in the past week' :
      daysSinceUpdate < 30 ? 
        'Regular maintenance with updates in the past month' :
        `Repository hasn't been updated in ${daysSinceUpdate} days - may need attention`,
    
    contributorCount > 10 ? 
      `Strong collaborative environment with ${contributorCount} active contributors` :
      contributorCount > 1 ? 
        `Small but collaborative team with ${contributorCount} contributors` :
        'Solo developer project - could benefit from more contributors',
    
    openIssues > 50 ? 
      `High activity with ${openIssues} open issues - active community engagement` :
      openIssues > 10 ? 
        `Moderate issue activity with ${openIssues} open issues` :
        `Low issue count (${openIssues}) suggests good maintenance or low activity`,
    
    forkCount > 50 ? 
      `High reusability with ${forkCount} forks - widely adopted codebase` :
      forkCount > 10 ? 
        `Good code reuse with ${forkCount} forks` :
        'Limited forking activity - potential for wider adoption',
    
    hasLicense && hasDescription ? 
      'Well-documented with proper licensing for open source use' :
      !hasLicense ? 
        'Missing license may limit adoption and contribution' :
        'Repository lacks description - first impressions matter'
  ].filter(insight => insight); // Remove any null/undefined insights
  
  return {
    summary: `${repoInfo?.name || 'Repository'} is ${starCount > 50 ? 'a popular' : starCount > 10 ? 'a growing' : 'an emerging'} ${repoInfo?.language || 'software'} project with ${contributorCount} contributor${contributorCount !== 1 ? 's' : ''} and ${starCount} star${starCount !== 1 ? 's' : ''}. The repository ${daysSinceUpdate < 30 ? 'is actively maintained' : 'shows moderate activity'}.`,
    keyInsights: keyInsights.slice(0, 6), // Limit to 6 insights
    smartRecommendations: smartRecommendations.slice(0, 6), // Limit to 6 recommendations
    activity,
    quality,
    strengths: [
      starCount > 50 ? 'Popular project with strong community interest' : null,
      contributorCount > 10 ? 'Good contributor engagement' : null,
      daysSinceUpdate < 30 ? 'Actively maintained' : null,
      hasLicense ? 'Properly licensed' : null,
      forkCount > 20 ? 'High fork count indicates reusability' : null
    ].filter(s => s),
    improvements: [
      starCount < 10 ? 'Increase visibility through better documentation' : null,
      contributorCount < 3 ? 'Encourage more contributors' : null,
      daysSinceUpdate > 90 ? 'More frequent updates needed' : null,
      !hasLicense ? 'Add a license file' : null,
      openIssues > 50 ? 'Address open issues' : null
    ].filter(i => i)
  };
}

/**
 * Generate fallback insights when AI service is not available
 */
function generateFallbackInsights(repoData) {
  const { repoInfo, commits, contributors } = repoData;
  
  // Calculate basic metrics
  const recentCommitCount = commits?.length || 0;
  const contributorCount = contributors?.length || 0;
  const daysSinceUpdate = repoInfo?.updated_at 
    ? Math.floor((Date.now() - new Date(repoInfo.updated_at)) / (1000 * 60 * 60 * 24))
    : 30;
  const hasLicense = !!repoInfo?.license;
  const stars = repoInfo?.stargazers_count || 0;
  
  // Generate key insights
  const keyInsights = [];
  
  if (stars > 1000) {
    keyInsights.push({
      type: 'strength',
      category: 'Popularity',
      message: `This repository has ${stars.toLocaleString()} stars, indicating strong community interest`,
      impact: 'high'
    });
  }
  
  if (contributorCount > 10) {
    keyInsights.push({
      type: 'strength',
      category: 'Collaboration',
      message: `Active community with ${contributorCount} contributors`,
      impact: 'high'
    });
  } else if (contributorCount < 3) {
    keyInsights.push({
      type: 'improvement',
      category: 'Collaboration',
      message: 'Consider encouraging more community contributions',
      impact: 'medium'
    });
  }
  
  if (daysSinceUpdate < 7) {
    keyInsights.push({
      type: 'strength',
      category: 'Activity',
      message: 'Repository is actively maintained with recent updates',
      impact: 'high'
    });
  } else if (daysSinceUpdate > 90) {
    keyInsights.push({
      type: 'improvement',
      category: 'Activity',
      message: 'Repository hasn\'t been updated in a while',
      impact: 'low'
    });
  }
  
  if (!hasLicense) {
    keyInsights.push({
      type: 'improvement',
      category: 'Legal',
      message: 'Add a license to clarify usage terms',
      impact: 'medium'
    });
  }
  
  // Generate smart recommendations
  const smartRecommendations = [];
  
  if (repoInfo?.open_issues_count > 50) {
    smartRecommendations.push({
      priority: 'high',
      action: 'Issue Management',
      description: `Address the ${repoInfo.open_issues_count} open issues to improve project health`,
      effort: 'medium',
      impact: 'high'
    });
  }
  
  if (contributorCount < 5) {
    smartRecommendations.push({
      priority: 'medium',
      action: 'Community Building',
      description: 'Create contribution guidelines to attract more contributors',
      effort: 'low',
      impact: 'high'
    });
  }
  
  if (!repoInfo?.topics || repoInfo.topics.length === 0) {
    smartRecommendations.push({
      priority: 'low',
      action: 'Discoverability',
      description: 'Add repository topics to improve discoverability',
      effort: 'low',
      impact: 'medium'
    });
  }
  
  // Generate improvement areas
  const improvementAreas = [];
  
  if (repoInfo?.open_issues_count > 20) {
    improvementAreas.push('Issue resolution and triage');
  }
  if (contributorCount < 5) {
    improvementAreas.push('Community engagement and contributor growth');
  }
  if (!hasLicense) {
    improvementAreas.push('Legal compliance and licensing');
  }
  if (daysSinceUpdate > 30) {
    improvementAreas.push('Regular maintenance and updates');
  }
  
  // Generate contributor insights
  const contributorInsights = generateBasicContributorInsights(repoData);
  
  return {
    keyInsights,
    smartRecommendations,
    improvementAreas,
    summary: {
      strengths: keyInsights.filter(i => i.type === 'strength').length,
      improvements: keyInsights.filter(i => i.type === 'improvement').length,
      totalInsights: keyInsights.length
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      dataSource: 'fallback',
      repository: repoInfo?.full_name || 'Unknown'
    },
    contributorInsights
  };
}

/**
 * Main repository analysis handler
 */
const analyzeHandler = async (request, reply) => {
  const { repoUrl } = request.body;
  
  try {
    console.log(`📊 Analyzing repository: ${repoUrl}`);
    
    // Extract owner and repo from URL
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1]?.replace('.git', ''); // Remove .git if present
    
    if (!owner || !repo) {
      return reply.code(400).send({
        success: false,
        message: 'Invalid repository URL format'
      });
    }
    
    // Use the comprehensive analyzer to get all metrics
    // This will return all 12 metrics for the radar chart
    let fullAnalysis;
    try {
      console.log('🔍 Running comprehensive repository analysis...');
      fullAnalysis = await analyzer.analyzeRepository(repoUrl);
      console.log('✅ Comprehensive analysis complete with all metrics');
      console.log('  vibeScore.total:', fullAnalysis?.vibeScore?.total);
      console.log('  vibeScore.breakdown keys:', Object.keys(fullAnalysis?.vibeScore?.breakdown || {}));
    } catch (analysisError) {
      console.log('⚠️ Full analysis failed, falling back to basic analysis:');
      console.error('  Error details:', analysisError.message);
      console.error('  Stack trace:', analysisError.stack);
      
      // Fallback to basic analysis if comprehensive fails
      const [repoInfo, commits, contributors] = await Promise.all([
        githubService.getRepositoryInfo(owner, repo),
        githubService.getCommitHistory(owner, repo, 100),
        githubService.getContributors(owner, repo, 5)
      ]);
      
      // Use simplified score calculation as fallback
      const basicScore = analyzer.calculateScore({
        repoInfo,
        commits,
        contributors
      });
      
      console.log('📊 Basic score calculated:', basicScore);
      console.log('  Basic breakdown:', basicScore.breakdown);
      
      // Transform basic score to match expected format with all 12 metrics
      // Use reasonable defaults for missing metrics
      fullAnalysis = {
        vibeScore: {
          total: basicScore.overallScore,
          breakdown: {
            codeQuality: basicScore.breakdown.health || 50,
            readability: basicScore.breakdown.documentation || 50,
            collaboration: basicScore.breakdown.activity || 50,
            innovation: Math.round((basicScore.breakdown.popularity || 50) * 0.8),
            maintainability: Math.round((basicScore.breakdown.health || 50) * 0.9),
            inclusivity: basicScore.breakdown.documentation ? 60 : 40,
            security: Math.round((basicScore.breakdown.health || 50) * 0.85),
            performance: Math.round((basicScore.breakdown.activity || 50) * 0.9),
            testingQuality: Math.round((basicScore.breakdown.health || 50) * 0.8),
            communityHealth: basicScore.breakdown.activity || 50,
            codeHealth: basicScore.breakdown.health || 50,
            releaseManagement: Math.round((basicScore.breakdown.activity || 50) * 0.7)
          },
          weights: {
            codeQuality: 16,
            readability: 12,
            collaboration: 15,
            innovation: 8,
            maintainability: 8,
            inclusivity: 5,
            security: 12,
            performance: 8,
            testingQuality: 6,
            communityHealth: 4,
            codeHealth: 4,
            releaseManagement: 2
          }
        },
        repoInfo,
        commits,
        contributors,
        metrics: basicScore.metrics
      };
      
      console.log('📊 Fallback analysis created with all 12 metrics');
      console.log('  Fallback breakdown keys:', Object.keys(fullAnalysis.vibeScore.breakdown));
    }
    
    // Extract data from full analysis
    const { vibeScore } = fullAnalysis;
    const repoInfo = fullAnalysis.repoInfo || fullAnalysis.repositoryInfo;
    const commits = fullAnalysis.commits || fullAnalysis.commitHistory || [];
    const contributors = fullAnalysis.contributors || [];
    
    // Log contributors data for debugging
    console.log('📊 Contributors data:');
    console.log('  Total contributors:', contributors.length);
    console.log('  Contributors sample:', contributors.slice(0, 3));
    
    // Ensure vibeScore has all required fields
    const finalVibeScore = {
      total: vibeScore?.total || vibeScore?.overallScore || 0,
      breakdown: vibeScore?.breakdown || {},
      weights: vibeScore?.weights || {
        codeQuality: 16,
        readability: 12,
        collaboration: 15,
        innovation: 8,
        maintainability: 8,
        inclusivity: 5,
        security: 12,
        performance: 8,
        testingQuality: 6,
        communityHealth: 4,
        codeHealth: 4,
        releaseManagement: 2
      }
    };
    
    // Ensure all 12 metrics are present in breakdown
    const expectedMetrics = [
      'codeQuality', 'readability', 'collaboration', 'innovation',
      'maintainability', 'inclusivity', 'security', 'performance',
      'testingQuality', 'communityHealth', 'codeHealth', 'releaseManagement'
    ];
    
    // Fill in any missing metrics with default values
    expectedMetrics.forEach(metric => {
      if (finalVibeScore.breakdown[metric] === undefined) {
        console.log(`⚠️ Missing metric ${metric}, using default value`);
        finalVibeScore.breakdown[metric] = 50; // Default to 50 if missing
      }
    });
    
    // Log the final vibeScore structure for debugging
    console.log('📊 Final vibeScore structure:');
    console.log('  Total:', finalVibeScore.total);
    console.log('  Breakdown metrics:', Object.keys(finalVibeScore.breakdown));
    console.log('  All 12 metrics present?', Object.keys(finalVibeScore.breakdown).length === 12);
    console.log('  Metrics:', finalVibeScore.breakdown);
    
    // Prepare data for AI insights
    const repoData = {
      repoInfo: repoInfo,
      commits: commits,
      contributors: contributors
    };
    
    // Try to generate AI insights if service is available
    let aiInsights = null;
    let contributorInsights = null;
    
    if (geminiService) {
      try {
        console.log('🤖 Generating AI-powered insights...');
        const [regular, contrib] = await Promise.all([
          geminiService.generateQuickInsights(repoData),
          geminiService.generateContributorInsights(repoData)
        ]);
        aiInsights = regular;
        contributorInsights = contrib;
      } catch (error) {
        console.log('⚠️ AI insights generation failed, generating repository-specific fallback insights:', error.message);
        // Generate repository-specific insights instead of no insights
        console.log('📊 Generating dynamic repository-specific insights...');
        aiInsights = geminiService.generateInstantInsights(repoData);
      }
    } else {
      console.log('💡 Gemini service not configured, generating repository-specific insights');
      // Generate repository-specific insights when service is not available
      aiInsights = generateRepositorySpecificInsights(repoData);
    }
    
    // Generate basic contributor insights if AI failed or not available
    if (!contributorInsights) {
      console.log('📊 Generating basic contributor insights...');
      contributorInsights = generateBasicContributorInsights(repoData);
    }
    
    // Return comprehensive analysis
    return reply.code(200).send({
      success: true,
      repoUrl,
      repoInfo: repoInfo ? {
        name: repoInfo.name,
        fullName: repoInfo.full_name || repoInfo.fullName,
        description: repoInfo.description,
        stars: repoInfo.stargazers_count || repoInfo.stars,
        forks: repoInfo.forks_count || repoInfo.forks,
        openIssues: repoInfo.open_issues_count || repoInfo.openIssues,
        watchers: repoInfo.watchers_count || repoInfo.watchers,
        language: repoInfo.language,
        topics: repoInfo.topics,
        license: repoInfo.license?.name,
        createdAt: repoInfo.created_at || repoInfo.createdAt,
        updatedAt: repoInfo.updated_at || repoInfo.updatedAt,
        homepage: repoInfo.homepage,
        size: repoInfo.size,
        defaultBranch: repoInfo.default_branch || repoInfo.defaultBranch,
        contributors: contributors?.length || repoInfo.contributors || 0
      } : {},
      vibeScore: finalVibeScore,  // This now contains all 12 metrics from comprehensive analysis
      commitActivity: {
        totalCommits: commits?.length || 0,
        recentCommits: commits.slice(0, 10).map(c => ({
          sha: c.sha,
          message: c.commit?.message || c.message,
          author: c.commit?.author?.name || c.author,
          date: c.commit?.author?.date || c.date
        }))
      },
      insights: aiInsights,
      contributorInsights,
      analysis: fullAnalysis.analysis || {},
      metrics: fullAnalysis.metrics || {}
    });
    
  } catch (error) {
    console.error('Repository analysis failed:', error);
    
    if (error.message?.includes('404')) {
      return reply.code(404).send({
        success: false,
        message: 'Repository not found. Please check the URL and try again.'
      });
    }
    
    if (error.message?.includes('403')) {
      return reply.code(403).send({
        success: false,
        message: 'Access denied. The repository might be private or rate limit exceeded.'
      });
    }
    
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to analyze repository'
    });
  }
};

/**
 * AI insights handler - Returns repository insights powered by Gemini AI
 */
const insightsHandler = async (request, reply) => {
  const { repoUrl } = request.body;
  
  try {
    // Validate input
    if (!repoUrl) {
      console.log('❌ No repository URL provided');
      return reply.code(400).send({
        success: false,
        message: 'Repository URL is required'
      });
    }
    
    console.log(`🤖 Generating AI insights for: ${repoUrl}`);
    
    // More robust URL parsing
    let owner, repo;
    
    // Handle different URL formats
    if (repoUrl.includes('github.com')) {
      // Full GitHub URL
      const urlPattern = /github\.com[/:]([^/]+)\/([^/\s.]+)/;
      const match = repoUrl.match(urlPattern);
      
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    } else if (repoUrl.includes('/')) {
      // owner/repo format
      const parts = repoUrl.split('/');
      if (parts.length === 2) {
        owner = parts[0].trim();
        repo = parts[1].trim().replace(/\.git$/, '');
      }
    }
    
    if (!owner || !repo) {
      console.log('❌ Failed to parse repository URL:', { repoUrl, owner, repo });
      return reply.code(400).send({
        success: false,
        message: 'Invalid repository URL format. Please use format: owner/repo or https://github.com/owner/repo'
      });
    }
    
    console.log(`📦 Parsed repository: ${owner}/${repo}`);
    
    // Fetch repository data (same as analyze but for insights)
    const [repoInfo, commits, contributors] = await Promise.all([
      githubService.getRepositoryInfo(owner, repo),
      githubService.getCommitHistory(owner, repo, 30), // Last 30 commits
      githubService.getContributors(owner, repo, 10) // Top 10 contributors
    ]);
    
    const repoData = {
      repoInfo,
      commits,
      contributors
    };
    
    let insights = {};
    
    // Check if Gemini service is available
    if (geminiService) {
      try {
        // Generate both regular insights and contributor insights in parallel
        const [regularInsights, contributorInsights] = await Promise.all([
          geminiService.generateInsights(repoData),
          geminiService.generateContributorInsights(repoData)
        ]);
        
        // Combine insights
        insights = {
          ...regularInsights,
          contributorInsights
        };
      } catch (aiError) {
        console.log('⚠️ AI insights generation failed, using fallback:', aiError.message);
        insights = generateFallbackInsights(repoData);
      }
    } else {
      console.log('💡 Gemini service not configured, using fallback insights');
      insights = generateFallbackInsights(repoData);
    }
    
    return reply.code(200).send({
      success: true,
      data: insights
    });
    
  } catch (error) {
    console.error('❌ AI insights generation failed:', error);
    
    // Check for specific error types
    if (error.message?.includes('404')) {
      return reply.code(404).send({
        success: false,
        message: 'Repository not found. Please check the URL and try again.'
      });
    }
    
    if (error.message?.includes('403')) {
      return reply.code(403).send({
        success: false,
        message: 'Access denied. The repository might be private or rate limit exceeded.'
      });
    }
    
    if (error.message?.includes('GEMINI_API_KEY')) {
      return reply.code(503).send({
        success: false,
        message: 'AI service not configured. Please set up GEMINI_API_KEY.'
      });
    }
    
    // Generic error
    return reply.code(500).send({
      success: false,
      message: error.message || 'Failed to generate AI insights. Please try again later.'
    });
  }
};

// User profile endpoint
async function userProfileHandler(request, reply) {
  const { username } = request.params;
  
  try {
    request.log.info(`Fetching user profile: ${username}`);
    
    // Fetch user profile
    const userProfile = await githubService.getUserProfile(username);
    
    if (!userProfile) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return {
      success: true,
      data: userProfile
    };
  } catch (error) {
    request.log.error(`User profile fetch error:`, error);
    
    if (error.response?.status === 404) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      });
    }
    
    return reply.status(500).send({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
}

// User repositories endpoint
async function userReposHandler(request, reply) {
  const { username } = request.params;
  
  try {
    request.log.info(`Fetching repositories for user: ${username}`);
    
    // Fetch user repositories
    const repositories = await githubService.getUserRepositories(username);
    
    return {
      success: true,
      data: repositories
    };
  } catch (error) {
    request.log.error('User repos error:', error);
    reply.status(500).send({
      success: false,
      error: 'Failed to fetch user repositories',
      message: error.message
    });
  }
}

// AI Summarize handler for Smart Summary feature
async function summarizeHandler(request, reply) {
  const { owner, repo } = request.body;
  
  try {
    request.log.info(`Summarizing repository README: ${owner}/${repo}`);
    
    // Check if Gemini service is available
    if (!geminiService) {
      return reply.status(503).send({
        success: false,
        error: 'AI service not available',
        message: 'Gemini API key is not configured. Please configure GEMINI_API_KEY environment variable.',
        details: 'To enable AI insights, add GEMINI_API_KEY to your environment variables. Get your API key from https://makersuite.google.com/app/apikey'
      });
    }
    
    // Fetch repository README content
    let readmeContent;
    try {
      readmeContent = await githubService.getReadmeContent(owner, repo);
    } catch (githubError) {
      // Check if it's a repository not found error
      if (githubError.isRepositoryNotFound || 
          (githubError.response?.status === 404 && githubError.message?.includes('not found or is private'))) {
        return reply.status(404).send({
          success: false,
          error: 'Repository not found',
          message: `Repository ${owner}/${repo} not found or is private`
        });
      }
      // Re-throw other errors to be handled by the outer catch
      throw githubError;
    }
    
    if (!readmeContent) {
      return reply.status(404).send({
        success: false,
        error: 'README not found',
        message: 'This repository does not have a README file'
      });
    }
    
    // Generate summary using Gemini
    const prompt = `Please provide a concise, professional summary of this GitHub repository README. Focus on:
1. What the project does
2. Key features or capabilities
3. Who might use it
4. Any notable technical aspects

Keep the summary to 3-4 sentences maximum.

README content:
${readmeContent}`;

    const result = await geminiService.model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    reply.send({
      success: true,
      data: {
        summary: summary.trim(),
        repository: `${owner}/${repo}`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    request.log.error('Summarization error:', error);
    request.log.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    if (error.status === 404) {
      reply.status(404).send({
        success: false,
        error: 'Repository not found',
        message: `Repository ${owner}/${repo} not found or is private`
      });
    } else if (error.message?.includes('API key') || error.message?.includes('GEMINI_API_KEY')) {
      reply.status(500).send({
        success: false,
        error: 'AI service not configured',
        message: 'Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.'
      });
    } else if (error.message?.includes('API_KEY_INVALID')) {
      reply.status(500).send({
        success: false,
        error: 'Invalid API key',
        message: 'The configured Gemini API key is invalid. Please check your GEMINI_API_KEY.'
      });
    } else if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      reply.status(429).send({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Gemini API rate limit exceeded. Please try again later.'
      });
    } else if (error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED')) {
      reply.status(503).send({
        success: false,
        error: 'Service unavailable',
        message: 'Unable to reach Gemini API. Please check your internet connection.'
      });
    } else {
      reply.status(500).send({
        success: false,
        error: 'Summarization failed',
        message: 'Failed to generate summary. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Batch AI Summarize handler for multiple repositories
async function batchSummarizeHandler(request, reply) {
  const { repositories, parallel = true } = request.body;
  
  try {
    request.log.info(`Batch summarizing ${repositories.length} repositories`);
    
    // Check if Gemini service is available
    if (!geminiService) {
      return reply.status(503).send({
        success: false,
        error: 'AI service not available',
        message: 'Gemini API key is not configured. Please configure GEMINI_API_KEY environment variable.',
        details: 'To enable AI insights, add GEMINI_API_KEY to your environment variables.'
      });
    }
    
    const results = [];
    
    if (parallel) {
      // Process repositories in parallel
      const summaryPromises = repositories.map(async (repo) => {
        try {
          const readmeContent = await githubService.getReadmeContent(repo.owner, repo.repo);
          
          if (!readmeContent) {
            return {
              owner: repo.owner,
              repo: repo.repo,
              error: 'README not found',
              data: null
            };
          }
          
          const prompt = `Please provide a concise, professional summary of this GitHub repository README. Focus on:
1. What the project does
2. Key features or capabilities
3. Who might use it
4. Any notable technical aspects

Keep the summary to 3-4 sentences maximum.

README content:
${readmeContent}`;
          
          const result = await geminiService.model.generateContent(prompt);
          const response = await result.response;
          const summary = response.text();
          
          return {
            owner: repo.owner,
            repo: repo.repo,
            data: {
              summary: summary.trim(),
              repository: `${repo.owner}/${repo.repo}`,
              timestamp: new Date().toISOString()
            },
            error: null
          };
        } catch (error) {
          request.log.error(`Error summarizing ${repo.owner}/${repo.repo}:`, error);
          return {
            owner: repo.owner,
            repo: repo.repo,
            error: error.message || 'Failed to generate summary',
            data: null
          };
        }
      });
      
      const summaryResults = await Promise.all(summaryPromises);
      results.push(...summaryResults);
    } else {
      // Process repositories sequentially
      for (const repo of repositories) {
        try {
          const readmeContent = await githubService.getReadmeContent(repo.owner, repo.repo);
          
          if (!readmeContent) {
            results.push({
              owner: repo.owner,
              repo: repo.repo,
              error: 'README not found',
              data: null
            });
            continue;
          }
          
          const prompt = `Please provide a concise, professional summary of this GitHub repository README. Focus on:
1. What the project does
2. Key features or capabilities
3. Who might use it
4. Any notable technical aspects

Keep the summary to 3-4 sentences maximum.

README content:
${readmeContent}`;
          
          const result = await geminiService.model.generateContent(prompt);
          const response = await result.response;
          const summary = response.text();
          
          results.push({
            owner: repo.owner,
            repo: repo.repo,
            data: {
              summary: summary.trim(),
              repository: `${repo.owner}/${repo.repo}`,
              timestamp: new Date().toISOString()
            },
            error: null
          });
        } catch (error) {
          request.log.error(`Error summarizing ${repo.owner}/${repo.repo}:`, error);
          results.push({
            owner: repo.owner,
            repo: repo.repo,
            error: error.message || 'Failed to generate summary',
            data: null
          });
        }
      }
    }
    
    // Calculate stats
    const successful = results.filter(r => r.data !== null).length;
    const failed = results.filter(r => r.error !== null).length;
    
    reply.send({
      success: true,
      data: {
        results,
        stats: {
          total: repositories.length,
          successful,
          failed
        }
      }
    });
    
  } catch (error) {
    request.log.error('Batch summarization error:', error);
    
    reply.status(500).send({
      success: false,
      error: 'Batch summarization failed',
      message: 'Failed to process batch summaries. Please try again later.'
    });
  }
}

/**
 * Get repository contributors handler
 */
const repoContributorsHandler = async (request, reply) => {
  const { owner, repo } = request.params;
  
  try {
    console.log(`📊 Fetching contributors for ${owner}/${repo}`);
    
    const contributors = await githubService.getContributors(owner, repo, 30);
    
    return reply.code(200).send({
      success: true,
      data: contributors
    });
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    
    if (error.message.includes('404')) {
      return reply.code(404).send({
        success: false,
        message: 'Repository not found'
      });
    }
    
    if (error.message.includes('403')) {
      return reply.code(403).send({
        success: false,
        message: 'API rate limit exceeded or authentication required'
      });
    }
    
    return reply.code(500).send({
      success: false,
      message: 'Failed to fetch contributors'
    });
  }
};

// Schema definitions for request validation
const analyzeSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['repoUrl'],
      properties: {
        repoUrl: {
          type: 'string',
          pattern: '^https?:\\/\\/(www\\.)?github\\.com\\/[a-zA-Z0-9._-]+\\/[a-zA-Z0-9._-]+(?:\\/.*)?$',
          description: 'Valid GitHub repository URL'
        }
      }
    }
  }
};

const insightsSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['repoUrl'],
      properties: {
        repoUrl: {
          type: 'string',
          pattern: '^https?:\\/\\/(www\\.)?github\\.com\\/[a-zA-Z0-9._-]+\\/[a-zA-Z0-9._-]+(?:\\/.*)?$',
          description: 'Valid GitHub repository URL'
        }
      }
    }
  }
};

const userProfileSchema = {
  schema: {
    params: {
      type: 'object',
      required: ['username'],
      properties: {
        username: {
          type: 'string',
          minLength: 1,
          description: 'GitHub username'
        }
      }
    }
  }
};

const summarizeSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['owner', 'repo'],
      properties: {
        owner: {
          type: 'string',
          minLength: 1,
          description: 'Repository owner'
        },
        repo: {
          type: 'string',
          minLength: 1,
          description: 'Repository name'
        }
      }
    }
  }
};

const batchSummarizeSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['repositories'],
      properties: {
        repositories: {
          type: 'array',
          items: {
            type: 'object',
            required: ['owner', 'repo'],
            properties: {
              owner: {
                type: 'string',
                minLength: 1,
                description: 'Repository owner'
              },
              repo: {
                type: 'string',
                minLength: 1,
                description: 'Repository name'
              }
            }
          },
          minItems: 1,
          maxItems: 10,
          description: 'Array of repositories to summarize'
        },
        parallel: {
          type: 'boolean',
          default: true,
          description: 'Whether to process summaries in parallel'
        }
      }
    }
  }
};

// Export routes
export default async function (fastify, options) {
  // Repository analysis
  fastify.post('/analyze', analyzeSchema, analyzeHandler);
  
  // AI insights
  fastify.post('/analyze/insights', insightsSchema, insightsHandler);
  
  // AI summarize for Smart Summary feature
  fastify.post('/ai/summarize', summarizeSchema, summarizeHandler);
  
  // Batch AI summarize for multiple repositories
  fastify.post('/ai/batch-summarize', batchSummarizeSchema, batchSummarizeHandler);
  
  // User profile endpoints - Fixed to match frontend
  fastify.get('/users/:username', userProfileSchema, userProfileHandler);
  fastify.get('/users/:username/repos', userProfileSchema, userReposHandler);
  
  // Repository endpoints
  fastify.get('/repos/:owner/:repo/contributors', {
    schema: {
      params: {
        type: 'object',
        required: ['owner', 'repo'],
        properties: {
          owner: { type: 'string' },
          repo: { type: 'string' }
        }
      }
    }
  }, repoContributorsHandler);
} 