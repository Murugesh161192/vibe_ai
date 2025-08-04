import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service for generating AI-powered repository insights using Google Gemini 1.5 Flash
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
      // Use gemini-1.5-flash model for fast and efficient insights
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Gemini AI 1.5 Flash initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive repository insights
   * @param {Object} repoData - Repository data including commits, contributors, files
   * @returns {Object} AI-generated insights
   */
  async generateInsights(repoData) {
    try {
      console.log('🔍 Generating insights for repository...');
      const prompt = this.buildInsightPrompt(repoData);
      
      console.log('📝 Sending request to Gemini AI...');
      console.log('📋 Prompt length:', prompt.length, 'characters');
      
      const result = await this.model.generateContent(prompt);
      console.log('📨 Gemini API response received');
      
      const response = await result.response;
      console.log('📄 Response object obtained');
      
      const text = response.text();
      console.log('✅ Text extracted from response');
      console.log('📏 Response length:', text.length, 'characters');
      
      // Parse the JSON response from Gemini
      return this.parseInsightResponse(text);
    } catch (error) {
      console.error('❌ Gemini insight generation failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Provide more specific error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key');
      }
      if (error.message?.includes('quota')) {
        throw new Error('Gemini API quota exceeded');
      }
      if (error.message?.includes('model')) {
        throw new Error('Gemini model not available');
      }
      
      throw new Error('Failed to generate repository insights: ' + error.message);
    }
  }

  /**
   * Build a structured prompt for Gemini
   */
  buildInsightPrompt(repoData) {
    const { repoInfo, commits, contributors, contents, languages } = repoData;
    
    // Calculate some basic stats for context
    const fileCount = contents?.filter(item => item.type === 'file').length || 0;
    const recentCommits = commits?.slice(0, 10) || [];
    const topContributors = contributors?.slice(0, 5) || [];
    
    return `You are analyzing a GitHub repository. Provide actionable insights in valid JSON format.

Repository: ${repoInfo.name}
Description: ${repoInfo.description || 'No description'}
Primary Language: ${repoInfo.language || 'Unknown'}
Stars: ${repoInfo.stargazers_count || 0}
Total Files: ${fileCount}

Recent Commits (last 10):
${recentCommits.map(c => `- ${c.commit.message} by ${c.commit.author.name}`).join('\n')}

Top Contributors:
${topContributors.map(c => `- ${c.login}: ${c.contributions} commits`).join('\n')}

File Structure Sample:
${contents?.slice(0, 20).map(f => `- ${f.path} (${f.type})`).join('\n') || 'No files'}

Return ONLY valid JSON with no additional text, following this exact structure:
{
  "hotspotFiles": [
    {
      "file": "filename",
      "reason": "why this is a hotspot",
      "recommendation": "what to do about it"
    }
  ],
  "contributorInsights": {
    "mostActive": ["contributor1", "contributor2"],
    "collaborationPattern": "description of how team works together",
    "recommendation": "suggestions for team improvement"
  },
  "developmentPatterns": {
    "commitFrequency": "analysis of commit patterns",
    "releasePattern": "how often releases happen",
    "velocity": "development speed analysis"
  },
  "codeQuality": {
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"],
    "technicalDebt": "assessment of technical debt"
  },
  "recommendations": [
    {
      "priority": "high|medium|low",
      "area": "category",
      "suggestion": "specific recommendation"
    }
  ]
}`;
  }

  /**
   * Parse Gemini's response into structured insights
   */
  parseInsightResponse(text) {
    try {
      // Extract JSON from the response (Gemini might add explanation text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      // Return a fallback structure
      return {
        hotspotFiles: [],
        contributorInsights: {
          mostActive: [],
          collaborationPattern: 'Analysis unavailable',
          recommendation: 'Unable to generate recommendation'
        },
        developmentPatterns: {
          commitFrequency: 'Analysis unavailable',
          releasePattern: 'Analysis unavailable',
          velocity: 'Analysis unavailable'
        },
        codeQuality: {
          strengths: [],
          concerns: [],
          technicalDebt: 'Analysis unavailable'
        },
        recommendations: []
      };
    }
  }

  /**
   * Generate visualization data for charts
   */
  async generateVisualizationData(repoData) {
    const { commits, contributors } = repoData;
    
    // Commit frequency over time
    const commitFrequency = this.calculateCommitFrequency(commits);
    
    // Contributor distribution
    const contributorDistribution = contributors?.map(c => ({
      name: c.login,
      commits: c.contributions,
      percentage: (c.contributions / contributors.reduce((sum, cont) => sum + cont.contributions, 0)) * 100
    })) || [];
    
    return {
      commitFrequency,
      contributorDistribution
    };
  }

  calculateCommitFrequency(commits) {
    if (!commits || commits.length === 0) return [];
    
    // Group commits by date
    const frequencyMap = {};
    
    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
      frequencyMap[date] = (frequencyMap[date] || 0) + 1;
    });
    
    // Convert to array for charting
    return Object.entries(frequencyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
} 