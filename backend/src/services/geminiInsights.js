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
Last Updated: ${new Date(repoInfo.updated_at).toLocaleDateString()}

Recent Activity:
${recentCommits.slice(0, 3).map(c => `- ${c.commit.message.slice(0, 50)}`).join('\n')}

Contributors: ${topContributors.map(c => c.login).join(', ')}

Return this exact JSON structure (be concise):
{
  "summary": "2-3 sentence repository overview",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2"],
  "recommendation": "One key actionable recommendation",
  "collaboration": "Brief insight about team collaboration patterns",
  "activity": "active|moderate|low",
  "quality": 1-100
}`;
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
    
    // Calculate activity level
    const daysSinceUpdate = Math.floor((Date.now() - new Date(repoInfo?.updated_at || Date.now())) / (1000 * 60 * 60 * 24));
    const activity = daysSinceUpdate < 7 ? 'Very active' : daysSinceUpdate < 30 ? 'Active' : daysSinceUpdate < 90 ? 'Moderate' : 'Low';
    
    // Generate basic insights
    const insights = {
      summary: `${repoInfo?.name || 'Repository'} is ${starCount > 50 ? 'a popular' : starCount > 10 ? 'a growing' : 'an emerging'} project with ${contributorCount} contributor${contributorCount !== 1 ? 's' : ''} and ${starCount} star${starCount !== 1 ? 's' : ''}.`,
      strengths: [],
      improvements: []
    };
    
    // Determine strengths
    if (starCount > 50) insights.strengths.push('Popular project with strong community interest');
    if (contributorCount > 10) insights.strengths.push('Good contributor engagement');
    if (daysSinceUpdate < 30) insights.strengths.push('Actively maintained');
    if (repoInfo?.license) insights.strengths.push('Properly licensed');
    if (forkCount > 20) insights.strengths.push('High fork count indicates reusability');
    
    // Determine improvements
    if (openIssues > 50) insights.improvements.push('High number of open issues');
    if (contributorCount < 3) insights.improvements.push('Attract more contributors');
    if (daysSinceUpdate > 30) insights.improvements.push('Regular maintenance needed');
    if (!repoInfo?.description) insights.improvements.push('Add project description');
    
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
      _quality: quality
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
      const { contributors } = repoData || {};
      const contributorCount = contributors?.length || 0;
      const topContributors = contributors?.slice(0, 3) || [];
      
      // Convert simple format to expected format
      return {
        hotspotFiles: [],
        contributorInsights: {
          mostActive: topContributors.map(c => c.login),
          collaborationPattern: parsed.collaboration || (contributorCount > 10 
            ? `Strong collaboration with ${contributorCount} contributors` 
            : contributorCount > 5 
            ? `Good team size with ${contributorCount} contributors`
            : `Small team with ${contributorCount} contributors`),
          recommendation: contributorCount < 5 
            ? 'Consider encouraging more contributors to join the project'
            : contributorCount < 10
            ? 'Good contributor base, consider expanding the team'
            : 'Excellent contributor engagement, maintain current practices'
        },
        codeQuality: {
          strengths: parsed.strengths || [],
          concerns: parsed.improvements || []
        },
        recommendations: [
          {
            priority: parsed.quality > 80 ? 'low' : parsed.quality > 60 ? 'medium' : 'high',
            area: 'AI Analysis',
            suggestion: parsed.recommendation || 'Continue improving code quality'
          }
        ],
        _summary: parsed.summary,
        _quality: parsed.quality || 70
      };
    } catch (error) {
      console.error('Failed to parse response:', error);
      throw error;
    }
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