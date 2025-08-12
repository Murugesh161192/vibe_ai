import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Optimized service for generating AI-powered repository insights using Google Gemini
 * Focuses on performance and fast response times
 */
export class GeminiInsightsService {
  constructor() {
    // Initialize Gemini AI with API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('⚠️ GEMINI_API_KEY is not set in environment variables');
      throw new Error('GEMINI_API_KEY is required for AI insights');
    }
    
    console.log(`🤖 Initializing Gemini AI (API Key: ${apiKey.substring(0, 10)}...)`);
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Use only the flash model for speed
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024, // Limit output size for faster response
        }
      });
      
      console.log('✅ Gemini AI Flash model initialized for optimal performance');
      
      // Simple in-memory cache for recent analyses
      this.cache = new Map();
      this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
      
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      throw error;
    }
  }

  /**
   * Get cache key for repository
   */
  getCacheKey(repoData) {
    const { repoInfo } = repoData;
    return `${repoInfo.full_name}-${repoInfo.updated_at}`;
  }

  /**
   * Try to get cached insights
   */
  getCachedInsights(repoData) {
    const cacheKey = this.getCacheKey(repoData);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📦 Returning cached insights');
      return cached.data;
    }
    
    return null;
  }

  /**
   * Cache insights for future use
   */
  cacheInsights(repoData, insights) {
    const cacheKey = this.getCacheKey(repoData);
    this.cache.set(cacheKey, {
      data: insights,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Quick analysis with minimal API calls - FAST VERSION
   */
  async generateQuickInsights(repoData) {
    try {
      // Check cache first
      const cached = this.getCachedInsights(repoData);
      if (cached) {
        return cached;
      }

      console.log('🚀 Generating quick insights...');
      const prompt = this.buildOptimizedPrompt(repoData);
      
      // Single attempt with short timeout
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);
      
      const response = await result.response;
      const text = response.text();
      console.log('✅ Quick insights generated');
      
      const insights = this.parseInsightResponse(text, repoData);
      
      // Cache the results
      this.cacheInsights(repoData, insights);
      
      return insights;
      
    } catch (error) {
      console.log('⚡ Falling back to instant basic insights');
      // Return immediate basic insights
      return this.generateInstantInsights(repoData);
    }
  }

  /**
   * Generate insights with optimized performance
   */
  async generateInsights(repoData) {
    try {
      // Always try quick insights first
      return await this.generateQuickInsights(repoData);
    } catch (error) {
      console.error('❌ Insight generation failed:', error);
      return {
        success: true,
        fallback: true,
        insights: this.generateInstantInsights(repoData),
        message: 'Showing quick analysis'
      };
    }
  }

  /**
   * Build a smaller, optimized prompt for faster response
   */
  buildOptimizedPrompt(repoData) {
    const { repoInfo, commits, contributors } = repoData;
    
    // Use only essential data
    const recentCommits = commits?.slice(0, 5) || [];
    const topContributors = contributors?.slice(0, 3) || [];
    
    return `Analyze this GitHub repository concisely. Return ONLY valid JSON.

Repository: ${repoInfo.name}
Language: ${repoInfo.language || 'Unknown'}
Stars: ${repoInfo.stargazers_count || 0}
Forks: ${repoInfo.forks_count || 0}
Open Issues: ${repoInfo.open_issues_count || 0}
Last Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}
Description: ${repoInfo.description || 'No description'}

Recent Activity:
${recentCommits.slice(0, 3).map(c => `- ${c.commit.message.slice(0, 50)}`).join('\n')}

Contributors: ${topContributors.map(c => c.login).join(', ')}

Return this exact JSON structure (be concise but insightful):
{
  "summary": "2-3 sentence repository overview",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2"],
  "recommendation": "One key actionable recommendation",
  "collaboration": "Brief insight about team collaboration patterns",
  "activity": "active|moderate|low",
  "quality": 1-100,
  "keyInsights": [
    "Specific insight about the repository's current state",
    "Insight about code quality or architecture",
    "Insight about community engagement",
    "Insight about maintenance patterns",
    "Insight about project momentum",
    "Insight about technical debt or opportunities"
  ],
  "smartRecommendations": [
    {
      "title": "Specific actionable recommendation title",
      "description": "Brief explanation of why this is important",
      "priority": "critical|moderate|info",
      "category": "testing|documentation|community|code-quality|security|performance"
    },
    {
      "title": "Another recommendation",
      "description": "Why this matters for the project",
      "priority": "critical|moderate|info",
      "category": "testing|documentation|community|code-quality|security|performance"
    },
    {
      "title": "Third recommendation",
      "description": "How this will improve the repository",
      "priority": "critical|moderate|info",
      "category": "testing|documentation|community|code-quality|security|performance"
    },
    {
      "title": "Fourth recommendation",
      "description": "Expected benefits from this action",
      "priority": "critical|moderate|info",
      "category": "testing|documentation|community|code-quality|security|performance"
    }
  ]
}

Provide specific, actionable insights based on the repository data. Make recommendations relevant to the repository's language, size, and activity level.`;
  }

  /**
   * Generate instant basic insights (no AI needed)
   */
  generateInstantInsights(repoData) {
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
    
    // Generate basic insights
    const insights = {
      summary: `${repoInfo?.name || 'Repository'} is ${starCount > 50 ? 'a popular' : starCount > 10 ? 'a growing' : 'an emerging'} ${repoInfo?.language || 'software'} project with ${contributorCount} contributor${contributorCount !== 1 ? 's' : ''} and ${starCount} star${starCount !== 1 ? 's' : ''}. The repository ${daysSinceUpdate < 30 ? 'is actively maintained' : 'shows moderate activity'}.`,
      strengths: [],
      improvements: [],
      keyInsights: [],
      smartRecommendations: []
    };
    
    // Generate key insights based on metrics
    insights.keyInsights = [];
    
    // Repository state insight
    if (starCount > 100) {
      insights.keyInsights.push(`High community interest with ${starCount} stars indicates strong project adoption`);
    } else if (starCount > 20) {
      insights.keyInsights.push(`Growing community engagement with ${starCount} stars shows promising traction`);
    } else {
      insights.keyInsights.push(`Early-stage project with ${starCount} stars has room for growth`);
    }
    
    // Activity insight
    if (daysSinceUpdate < 7) {
      insights.keyInsights.push('Very active development with recent updates in the past week');
    } else if (daysSinceUpdate < 30) {
      insights.keyInsights.push('Regular maintenance with updates in the past month');
    } else {
      insights.keyInsights.push(`Repository hasn't been updated in ${daysSinceUpdate} days - may need attention`);
    }
    
    // Collaboration insight
    if (contributorCount > 10) {
      insights.keyInsights.push(`Strong collaborative environment with ${contributorCount} active contributors`);
    } else if (contributorCount > 1) {
      insights.keyInsights.push(`Small but collaborative team with ${contributorCount} contributors`);
    } else {
      insights.keyInsights.push('Solo developer project - could benefit from more contributors');
    }
    
    // Issues insight
    if (openIssues > 50) {
      insights.keyInsights.push(`High activity with ${openIssues} open issues - active community engagement`);
    } else if (openIssues > 10) {
      insights.keyInsights.push(`Moderate issue activity with ${openIssues} open issues`);
    } else {
      insights.keyInsights.push(`Low issue count (${openIssues}) suggests good maintenance or low activity`);
    }
    
    // Fork insight
    if (forkCount > 50) {
      insights.keyInsights.push(`High reusability with ${forkCount} forks - widely adopted codebase`);
    } else if (forkCount > 10) {
      insights.keyInsights.push(`Good code reuse with ${forkCount} forks`);
    } else {
      insights.keyInsights.push('Limited forking activity - potential for wider adoption');
    }
    
    // Documentation/License insight
    if (hasLicense && hasDescription) {
      insights.keyInsights.push('Well-documented with proper licensing for open source use');
    } else if (!hasLicense) {
      insights.keyInsights.push('Missing license may limit adoption and contribution');
    } else if (!hasDescription) {
      insights.keyInsights.push('Repository lacks description - first impressions matter');
    }
    
    // Determine strengths
    if (starCount > 50) insights.strengths.push('Popular project with strong community interest');
    if (contributorCount > 10) insights.strengths.push('Good contributor engagement');
    if (daysSinceUpdate < 30) insights.strengths.push('Actively maintained');
    if (hasLicense) insights.strengths.push('Properly licensed');
    if (forkCount > 20) insights.strengths.push('High fork count indicates reusability');
    
    // Determine improvements
    if (starCount < 10) insights.improvements.push('Increase visibility through better documentation');
    if (contributorCount < 3) insights.improvements.push('Encourage more contributors');
    if (daysSinceUpdate > 90) insights.improvements.push('More frequent updates needed');
    if (!hasLicense) insights.improvements.push('Add a license file');
    if (openIssues > 50) insights.improvements.push('Address open issues');
    
    // Generate smart recommendations based on repository analysis
    insights.smartRecommendations = [];
    
    // Testing recommendation
    if (!repoInfo?.has_tests && !repoInfo?.name?.includes('test')) {
      insights.smartRecommendations.push({
        title: 'Add Comprehensive Test Coverage',
        description: 'Implement unit and integration tests to ensure code reliability and make the project more trustworthy for contributors',
        priority: 'critical',
        category: 'testing'
      });
    }
    
    // Documentation recommendation
    if (!hasDescription || !repoInfo?.has_readme) {
      insights.smartRecommendations.push({
        title: hasDescription ? 'Enhance README Documentation' : 'Add Repository Description',
        description: 'Clear documentation helps new users and contributors understand the project purpose and how to get started',
        priority: contributorCount < 3 ? 'critical' : 'moderate',
        category: 'documentation'
      });
    } else if (starCount < 50) {
      insights.smartRecommendations.push({
        title: 'Improve Documentation Quality',
        description: 'Add examples, API documentation, and contribution guidelines to attract more users and contributors',
        priority: 'moderate',
        category: 'documentation'
      });
    }
    
    // Community recommendation
    if (contributorCount < 5) {
      insights.smartRecommendations.push({
        title: 'Foster Community Engagement',
        description: contributorCount === 1 ? 
          'Open the project to contributions by adding CONTRIBUTING.md and good first issues' :
          'Encourage more participation through clear contribution guidelines and responsive issue management',
        priority: 'moderate',
        category: 'community'
      });
    } else if (openIssues > 30) {
      insights.smartRecommendations.push({
        title: 'Improve Issue Management',
        description: `With ${openIssues} open issues, consider triaging, labeling, and closing stale issues to maintain project health`,
        priority: openIssues > 100 ? 'critical' : 'moderate',
        category: 'community'
      });
    }
    
    // Code quality recommendation
    if (daysSinceUpdate > 180) {
      insights.smartRecommendations.push({
        title: 'Revitalize Project Maintenance',
        description: 'Regular updates keep the project relevant. Consider dependency updates, bug fixes, or feature enhancements',
        priority: 'critical',
        category: 'code-quality'
      });
    } else if (!repoInfo?.has_ci) {
      insights.smartRecommendations.push({
        title: 'Implement CI/CD Pipeline',
        description: 'Automated testing and deployment improve code quality and reduce manual effort',
        priority: 'moderate',
        category: 'code-quality'
      });
    }
    
    // Security recommendation
    if (!hasLicense) {
      insights.smartRecommendations.push({
        title: 'Add Open Source License',
        description: 'A license clarifies how others can use, modify, and contribute to your project',
        priority: 'critical',
        category: 'security'
      });
    } else if (openIssues > 0 && repoInfo?.name?.toLowerCase().includes('security')) {
      insights.smartRecommendations.push({
        title: 'Address Security Concerns',
        description: 'Prioritize security-related issues and implement security best practices',
        priority: 'critical',
        category: 'security'
      });
    }
    
    // Performance recommendation based on language
    if (repoInfo?.language === 'JavaScript' || repoInfo?.language === 'TypeScript') {
      insights.smartRecommendations.push({
        title: 'Optimize Bundle Size',
        description: 'Implement code splitting and tree shaking to improve performance for JavaScript applications',
        priority: 'info',
        category: 'performance'
      });
    } else if (repoInfo?.language === 'Python') {
      insights.smartRecommendations.push({
        title: 'Add Type Hints',
        description: 'Python type hints improve code maintainability and catch errors early',
        priority: 'info',
        category: 'code-quality'
      });
    }
    
    // Limit to 4 most relevant recommendations
    if (insights.smartRecommendations.length > 4) {
      // Sort by priority (critical > moderate > info) and take top 4
      insights.smartRecommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, moderate: 1, info: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      insights.smartRecommendations = insights.smartRecommendations.slice(0, 4);
    }
    
    // Ensure we always have at least 4 recommendations
    while (insights.smartRecommendations.length < 4) {
      const genericRecs = [
        {
          title: 'Enhance Code Organization',
          description: 'Refactor code structure for better maintainability and scalability',
          priority: 'info',
          category: 'code-quality'
        },
        {
          title: 'Implement Best Practices',
          description: `Follow ${repoInfo?.language || 'language'}-specific best practices and coding standards`,
          priority: 'info',
          category: 'code-quality'
        },
        {
          title: 'Add Performance Monitoring',
          description: 'Track performance metrics to identify and resolve bottlenecks',
          priority: 'info',
          category: 'performance'
        },
        {
          title: 'Improve Developer Experience',
          description: 'Add development setup instructions and debugging guides',
          priority: 'info',
          category: 'documentation'
        }
      ];
      
      const nextRec = genericRecs[insights.smartRecommendations.length];
      if (nextRec) insights.smartRecommendations.push(nextRec);
      else break;
    }
    
    // Ensure we have at least some items
    if (insights.strengths.length === 0) {
      insights.strengths.push('Project is established');
    }
    if (insights.improvements.length === 0) {
      insights.improvements.push('Continue current practices');
    }
    
    // Add recommendation
    if (quality < 60) {
      insights.recommendation = 'Focus on documentation and attracting contributors to improve project health.';
    } else if (quality < 80) {
      insights.recommendation = 'Consider adding more features and improving test coverage.';
    } else {
      insights.recommendation = 'Maintain current momentum and consider expanding the project scope.';
    }
    
    // Transform to match expected format
    return {
      hotspotFiles: [],
      contributorInsights: {
        mostActive: contributors?.slice(0, 3).map(c => c?.login).filter(Boolean) || [],
        collaborationPattern: `${contributorCount} contributor${contributorCount !== 1 ? 's' : ''} working on the project`,
        recommendation: contributorCount < 5 ? 'Encourage more contributors' : 'Good collaboration'
      },
      codeQuality: {
        strengths: insights.strengths,
        concerns: insights.improvements
      },
      recommendations: [
        {
          priority: quality < 60 ? 'high' : quality < 80 ? 'medium' : 'low',
          area: 'Overall',
          suggestion: insights.recommendation
        }
      ],
      _summary: insights.summary,
      _quality: quality,
      keyInsights: insights.keyInsights,
      smartRecommendations: insights.smartRecommendations
    };
  }

  /**
   * Parse Gemini's response into structured insights
   */
  parseInsightResponse(text, repoData) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Return the parsed response directly with the expected structure
      // The AI is already returning the format we need
      return {
        summary: parsed.summary,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        recommendation: parsed.recommendation,
        collaboration: parsed.collaboration,
        activity: parsed.activity,
        quality: parsed.quality,
        keyInsights: parsed.keyInsights || [],
        smartRecommendations: parsed.smartRecommendations || []
      };
    } catch (error) {
      console.error('Failed to parse response:', error);
      // If parsing fails, return instant insights instead
      return this.generateInstantInsights(repoData);
    }
  }

  /**
   * Generate detailed contributor and code review insights
   */
  async generateContributorInsights(repoData) {
    try {
      const { repoInfo, commits, contributors } = repoData;
      
      // Check cache first with specific key
      const cacheKey = `contributors-${this.getCacheKey(repoData)}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Returning cached contributor insights');
        return cached.data;
      }

      console.log('👥 Generating contributor and code review insights...');
      
      // Build optimized prompt for contributor analysis
      const prompt = `Analyze the contributors and code review patterns for this GitHub repository. Return ONLY valid JSON.

Repository: ${repoInfo?.name || 'Unknown'}
Language: ${repoInfo?.language || 'Unknown'}
Stars: ${repoInfo?.stargazers_count || 0}
Forks: ${repoInfo?.forks_count || 0}
Open Issues: ${repoInfo?.open_issues_count || 0}
Total Contributors: ${contributors?.length || 0}

Top Contributors:
${contributors?.slice(0, 10).map(c => `- ${c.login}: ${c.contributions} commits`).join('\n') || 'No contributors data'}

Recent Commits (last 30):
${commits?.slice(0, 30).map(c => `- ${c.commit.author.name}: ${c.commit.message.split('\n')[0]}`).join('\n') || 'No commit data'}

Generate a JSON response with this EXACT structure:
{
  "contributors": [
    {
      "login": "username",
      "contributions": 100,
      "role": "Lead Developer|Core Contributor|Active Contributor|Occasional Contributor",
      "expertise": "Backend Development|Frontend|DevOps|Documentation|Testing",
      "impact": "High|Medium|Low",
      "percentage": 25
    }
  ],
  "codeReviewMetrics": {
    "prMergeRate": "85%",
    "issueResponseTime": "< 24h",
    "commitFrequency": 15,
    "codeQuality": 75,
    "testCoverage": "Good|Moderate|Needs Improvement",
    "activeBranches": 5
  },
  "reviewRecommendations": [
    {
      "type": "success|warning|info",
      "message": "Specific recommendation about code review practices"
    }
  ],
  "collaborationPattern": "Strong team collaboration|Small focused team|Solo developer|Growing contributor base",
  "teamDynamics": "Brief description of how the team works together"
}

Analyze the contributor distribution, identify key contributors, estimate code review metrics based on activity patterns, and provide actionable recommendations.`;

      // Generate insights with timeout
      const result = await Promise.race([
        this.model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);
      
      const response = await result.response;
      const text = response.text();
      console.log('✅ Contributor insights generated');
      
      const insights = this.parseContributorResponse(text, repoData);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: insights,
        timestamp: Date.now()
      });
      
      return insights;
      
    } catch (error) {
      console.log('⚡ Falling back to basic contributor analysis');
      return this.generateBasicContributorInsights(repoData);
    }
  }

  /**
   * Parse contributor insights response
   */
  parseContributorResponse(text, repoData) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Ensure contributors have proper structure
      if (parsed.contributors && Array.isArray(parsed.contributors)) {
        const totalContributions = parsed.contributors.reduce((sum, c) => sum + (c.contributions || 0), 0) || 1;
        parsed.contributors = parsed.contributors.map(c => ({
          ...c,
          percentage: c.percentage || Math.round((c.contributions / totalContributions) * 100)
        }));
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse contributor response:', error);
      return this.generateBasicContributorInsights(repoData);
    }
  }

  /**
   * Generate basic contributor insights without AI
   */
  generateBasicContributorInsights(repoData) {
    const { repoInfo, commits, contributors } = repoData;
    const contributorCount = contributors?.length || 0;
    const recentCommitCount = commits?.length || 0;
    
    console.log('📊 Basic contributor insights generation:');
    console.log('  Contributors count:', contributorCount);
    console.log('  Commits count:', recentCommitCount);
    
    // If no contributors data, create from commits
    let analyzedContributors = [];
    
    if (contributorCount > 0) {
      // Calculate total contributions for percentage
      const totalContributions = contributors.reduce((sum, c) => sum + (c.contributions || 0), 0);
      
      // Analyze each contributor - PRESERVE original GitHub data including avatars
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
          avatar_url: contributor.avatar_url, // PRESERVE original GitHub avatar URL
          html_url: contributor.html_url,     // PRESERVE original GitHub profile URL
          role,
          expertise: index === 0 ? 'Project Lead' : percentage > 10 ? 'Core Development' : 'Contributing',
          impact,
          percentage
        };
      });
    } else if (commits && commits.length > 0) {
      // Fallback: extract contributors from commits but try to enrich with GitHub data
      const commitAuthors = {};
      
      commits.forEach(commit => {
        const author = commit.commit?.author?.name || commit.author?.login || 'Unknown';
        const authorLogin = commit.author?.login || null; // Try to get GitHub login
        const authorAvatar = commit.author?.avatar_url || null; // Try to get avatar from commit data
        const authorUrl = commit.author?.html_url || null; // Try to get profile URL
        
        if (author && author !== 'Unknown') {
          if (!commitAuthors[author]) {
            commitAuthors[author] = {
              count: 0,
              login: authorLogin || author,
              avatar_url: authorAvatar,
              html_url: authorUrl
            };
          }
          commitAuthors[author].count += 1;
          
          // If we find better data in subsequent commits, use it
          if (authorLogin && !commitAuthors[author].login.includes('@')) {
            commitAuthors[author].login = authorLogin;
          }
          if (authorAvatar && !commitAuthors[author].avatar_url) {
            commitAuthors[author].avatar_url = authorAvatar;
          }
          if (authorUrl && !commitAuthors[author].html_url) {
            commitAuthors[author].html_url = authorUrl;
          }
        }
      });
      
      const sortedAuthors = Object.entries(commitAuthors)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10);
      
      const totalCommits = sortedAuthors.reduce((sum, [, data]) => sum + data.count, 0);
      
      analyzedContributors = sortedAuthors.map(([author, data], index) => {
        const percentage = totalCommits > 0 ? Math.round((data.count / totalCommits) * 100) : 0;
        
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
          login: data.login,
          contributions: data.count,
          avatar_url: data.avatar_url || `https://github.com/${data.login}.png?size=80`, // Generate GitHub avatar URL as fallback
          html_url: data.html_url || `https://github.com/${data.login}`, // Generate GitHub profile URL as fallback
          role,
          expertise: index === 0 ? 'Project Lead' : percentage > 10 ? 'Core Development' : 'Contributing',
          impact,
          percentage
        };
      });
      
      console.log('  Generated contributors from commits with enhanced data:', analyzedContributors.length);
    }
    
    // If still no contributors, create a default entry
    if (analyzedContributors.length === 0 && repoInfo) {
      const ownerLogin = repoInfo.owner?.login || 'repository-owner';
      analyzedContributors = [{
        login: ownerLogin,
        contributions: recentCommitCount || 1,
        avatar_url: repoInfo.owner?.avatar_url || `https://github.com/${ownerLogin}.png?size=80`,
        html_url: repoInfo.owner?.html_url || `https://github.com/${ownerLogin}`,
        role: 'Project Owner',
        expertise: 'Full Stack Development',
        impact: 'High',
        percentage: 100
      }];
    }
    
    console.log('👤 Contributors with avatars:', analyzedContributors.map(c => ({ 
      login: c.login, 
      hasAvatar: !!c.avatar_url,
      avatarUrl: c.avatar_url?.substring(0, 50) + '...'
    })));
    
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
   * Generate visualization data for charts
   */
  async generateVisualizationData(repoData) {
    const { commits, contributors } = repoData;
    
    // Limit data for performance
    const limitedCommits = commits?.slice(0, 30) || [];
    const limitedContributors = contributors?.slice(0, 10) || [];
    
    // Commit frequency over time (simplified)
    const commitFrequency = this.calculateCommitFrequency(limitedCommits);
    
    // Contributor distribution
    const totalCommits = limitedContributors.reduce((sum, c) => sum + c.contributions, 0) || 1;
    const contributorDistribution = limitedContributors.map(c => ({
      name: c.login,
      commits: c.contributions,
      percentage: Math.round((c.contributions / totalCommits) * 100)
    }));
    
    return {
      commitFrequency,
      contributorDistribution
    };
  }

  calculateCommitFrequency(commits) {
    if (!commits || commits.length === 0) return [];
    
    // Group by week for better performance
    const frequencyMap = {};
    
    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      frequencyMap[weekKey] = (frequencyMap[weekKey] || 0) + 1;
    });
    
    // Return only last 8 weeks
    return Object.entries(frequencyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
      .reverse();
  }
} 