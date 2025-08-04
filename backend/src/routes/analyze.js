import { RepositoryAnalyzer } from '../services/analyzer.js';
import { GitHubService } from '../services/github.js';
import { GeminiInsightsService } from '../services/geminiInsights.js';

const analyzer = new RepositoryAnalyzer();
const githubService = new GitHubService();

// Initialize Gemini service with error handling
let geminiService = null;
try {
  geminiService = new GeminiInsightsService();
  console.log('✅ Gemini service initialized successfully');
} catch (error) {
  console.error('⚠️ Gemini service initialization failed:', error.message);
  console.log('💡 Smart Summary feature will be disabled until GEMINI_API_KEY is configured');
}

// Schema definitions for request validation
const analyzeSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['repoUrl'],
      properties: {
        repoUrl: {
          type: 'string',
          pattern: '^https?:\\/\\/(www\\.)?github\\.com\\/[a-zA-Z0-9._-]+\\/[a-zA-Z0-9._-]+\\/?$',
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
          pattern: '^https?:\\/\\/(www\\.)?github\\.com\\/[a-zA-Z0-9._-]+\\/[a-zA-Z0-9._-]+\\/?$',
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

// Main analysis endpoint
async function analyzeHandler(request, reply) {
  const { repoUrl } = request.body;
  
  try {
    request.log.info(`Analyzing repository: ${repoUrl}`);
    const result = await analyzer.analyzeRepository(repoUrl);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    request.log.error(`Repository analysis error:`, error);
    
    // Handle specific error types
    if (error.message === 'Repository not found') {
      return reply.status(404).send({
        success: false,
        error: 'Repository not found. Please check the URL and try again.'
      });
    }
    
    if (error.message === 'GitHub API rate limit exceeded') {
      return reply.status(429).send({
        success: false,
        error: 'GitHub API rate limit exceeded. Please try again later.'
      });
    }
    
    if (error.message === 'Failed to fetch repository data') {
      return reply.status(503).send({
        success: false,
        error: 'Unable to access GitHub API. Please check your connection and try again.'
      });
    }
    
    return reply.status(500).send({
      success: false,
      error: 'Failed to analyze repository. Please try again later.'
    });
  }
}

// AI insights endpoint
async function insightsHandler(request, reply) {
  const { repoUrl } = request.body;
  
  try {
    request.log.info(`Generating insights for repository: ${repoUrl}`);
    
    // Check if Gemini service is available
    if (!geminiService) {
      return reply.status(503).send({
        success: false,
        error: 'AI service not available',
        message: 'Gemini API key is not configured. Please configure GEMINI_API_KEY environment variable.'
      });
    }
    
    // Extract repo info using regex to handle various URL formats
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid GitHub repository URL'
      });
    }
    
    const owner = match[1];
    const repo = match[2].replace(/\.git$/, ''); // Remove .git suffix if present
    
    // Fetch repository data
    const [repoInfo, contents, commits, contributors] = await Promise.all([
      githubService.getRepositoryInfo(owner, repo),
      githubService.getRepositoryContents(owner, repo),
      githubService.getCommitHistory(owner, repo, 50), // Get more commits for better analysis
      githubService.getContributors(owner, repo)
    ]);
    
    // Generate insights using AI service
    const insights = await geminiService.generateInsights({
      repoInfo,
      contents,
      commits,
      contributors
    });
    
    // Generate visualization data
    const visualizations = await geminiService.generateVisualizationData({
      commits,
      contributors
    });
    
    return {
      success: true,
      data: {
        insights,
        visualizations
      }
    };
  } catch (error) {
    request.log.error(`Insight generation error:`, error);
    
    if (error.message === 'Failed to generate repository insights') {
      return reply.status(503).send({
        success: false,
        error: 'AI service temporarily unavailable. Please try again later.'
      });
    }
    
    return reply.status(500).send({
      success: false,
      error: 'Failed to generate insights. Please try again later.'
    });
  }
}

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
        message: 'Gemini API key is not configured. Please configure GEMINI_API_KEY environment variable.'
      });
    }
    
    // Fetch repository README content
    const readmeContent = await githubService.getReadmeContent(owner, repo);
    
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
    } else {
      reply.status(500).send({
        success: false,
        error: 'Summarization failed',
        message: 'Failed to generate summary. Please try again later.'
      });
    }
  }
}

// Export routes
export default async function (fastify, options) {
  // Repository analysis
  fastify.post('/analyze', analyzeSchema, analyzeHandler);
  
  // AI insights
  fastify.post('/analyze/insights', insightsSchema, insightsHandler);
  
  // AI summarize for Smart Summary feature
  fastify.post('/ai/summarize', summarizeSchema, summarizeHandler);
  
  // User profile endpoints - Fixed to match frontend
  fastify.get('/users/:username', userProfileSchema, userProfileHandler);
  fastify.get('/users/:username/repos', userProfileSchema, userReposHandler);
} 