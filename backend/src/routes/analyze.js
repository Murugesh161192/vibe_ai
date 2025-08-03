import { analyzeRepository } from '../services/analyzer.js';
import { githubRequest } from '../services/github.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// JSON schema for request validation
const analyzeSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['repoUrl'],
      properties: {
        repoUrl: {
          type: 'string',
          pattern: '^https://github\\.com/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/?$',
          description: 'Valid GitHub repository URL'
        }
      }
    }
  }
};

// User profile schema
const userProfileSchema = {
  schema: {
    params: {
      type: 'object',
      required: ['username'],
      properties: {
        username: {
          type: 'string',
          minLength: 1,
          maxLength: 39,
          description: 'GitHub username'
        }
      }
    }
  }
};

// User repositories schema
const userReposSchema = {
  schema: {
    params: {
      type: 'object',
      required: ['username'],
      properties: {
        username: {
          type: 'string',
          minLength: 1,
          maxLength: 39,
          description: 'GitHub username'
        }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        per_page: { type: 'integer', minimum: 1, maximum: 100, default: 30 },
        sort: { type: 'string', enum: ['created', 'updated', 'pushed', 'full_name'], default: 'updated' }
      }
    }
  }
};

// AI summarization schema
const aiSummarizeSchema = {
  schema: {
    body: {
      type: 'object',
      required: ['owner', 'repo'],
      properties: {
        owner: { type: 'string', minLength: 1 },
        repo: { type: 'string', minLength: 1 }
      }
    }
  }
};

// Batch AI summarization schema
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
              owner: { type: 'string', minLength: 1 },
              repo: { type: 'string', minLength: 1 }
            }
          },
          minItems: 1,
          maxItems: 10 // Limit batch size
        },
        parallel: { type: 'boolean', default: true }
      }
    }
  }
};

// Main analysis endpoint
async function analyzeHandler(request, reply) {
  const { repoUrl } = request.body;
  
  try {
    request.log.info(`Analyzing repository: ${repoUrl}`);
    const analysisResult = await analyzeRepository(repoUrl);
    
    return {
      success: true,
      data: analysisResult
    };
  } catch (error) {
    request.log.error(`Analysis failed for ${repoUrl}:`, error);
    
    if (error.status === 404) {
      return reply.status(404).send({
        success: false,
        message: 'Repository not found. Please check the URL and ensure it\'s a public repository.'
      });
    }
    
    return reply.status(500).send({
      success: false,
      message: error.message || 'Failed to analyze repository'
    });
  }
}

// GitHub user profile endpoint
async function userProfileHandler(request, reply) {
  const { username } = request.params;
  
  try {
    request.log.info(`Fetching user profile: ${username}`);
    const response = await githubRequest(`/users/${username}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    request.log.error(`User profile fetch failed for ${username}:`, error);
    
    if (error.response?.status === 404) {
      return reply.status(404).send({
        success: false,
        message: 'No user found with that name.'
      });
    }
    
    return reply.status(500).send({
      success: false,
      message: error.message || 'Failed to fetch user profile'
    });
  }
}

// GitHub user repositories endpoint
async function userReposHandler(request, reply) {
  const { username } = request.params;
  const { page = 1, per_page = 30, sort = 'updated' } = request.query;
  
  try {
    request.log.info(`Fetching repositories for user: ${username}`);
    const response = await githubRequest(`/users/${username}/repos`, {
      params: { 
        page: parseInt(page), 
        per_page: Math.min(parseInt(per_page), 100),
        sort,
        direction: 'desc'
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    request.log.error(`User repositories fetch failed for ${username}:`, error);
    
    if (error.response?.status === 404) {
      return reply.status(404).send({
        success: false,
        message: 'User not found or no repositories available.'
      });
    }
    
    return reply.status(500).send({
      success: false,
      message: error.message || 'Failed to fetch user repositories'
    });
  }
}

// AI README summarization endpoint
async function aiSummarizeHandler(request, reply) {
  const { owner, repo } = request.body;
  
  try {
    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // For demo purposes, return a mock summary if no API key is configured
      const mockSummary = {
        summary: `${repo} is a repository by ${owner}. This is a demo summary - configure GEMINI_API_KEY for real Gemini 2.5 Pro AI summaries.`,
        repository: `${owner}/${repo}`,
        isMock: true
      };
      
      return {
        success: true,
        data: mockSummary
      };
    }

    request.log.info(`Generating AI summary for: ${owner}/${repo}`);
    
    // First, get repository info to use as fallback and for cache invalidation
    let repoInfo = null;
    try {
      const repoResponse = await githubRequest(`/repos/${owner}/${repo}`);
      repoInfo = repoResponse.data || repoResponse;
    } catch (repoError) {
      request.log.error(`Failed to fetch repository info: ${repoError.message}`);
    }
    
    // Try to get README content with multiple variations
    let readmeContent = '';
    const readmeVariations = [
      'README.md',
      'readme.md',
      'README.MD',
      'Readme.md',
      'README',
      'readme',
      'README.txt',
      'readme.txt',
      'README.rst',
      'readme.rst'
    ];
    
    for (const readmeFile of readmeVariations) {
      try {
        const readmeResponse = await githubRequest(`/repos/${owner}/${repo}/contents/${readmeFile}`);
        
        if (readmeResponse && readmeResponse.data && readmeResponse.data.content) {
          readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
          request.log.info(`Found README file: ${readmeFile}`);
          break;
        } else if (readmeResponse && readmeResponse.content) {
          readmeContent = Buffer.from(readmeResponse.content, 'base64').toString('utf-8');
          request.log.info(`Found README file: ${readmeFile}`);
          break;
        }
      } catch (readmeError) {
        // Continue trying other variations
        continue;
      }
    }
    
    // If no README found, use repository description
    if (!readmeContent && repoInfo) {
      const description = repoInfo.description || 'No description available';
      const language = repoInfo.language || 'Unknown';
      const topics = repoInfo.topics?.join(', ') || '';
      
      readmeContent = `Repository: ${repoInfo.name}
Description: ${description}
Primary Language: ${language}
${topics ? `Topics: ${topics}` : ''}
Stars: ${repoInfo.stargazers_count || 0}
Forks: ${repoInfo.forks_count || 0}`;
    }
    
    // If still no content, return a helpful message
    if (!readmeContent) {
      const noReadmeResponse = {
        summary: `${repo} by ${owner} appears to be a repository without a README file. Consider adding documentation to help others understand the project.`,
        repository: `${owner}/${repo}`,
        noReadme: true
      };
      
      return {
        success: true,
        data: noReadmeResponse
      };
    }

    // Generate advanced prompt based on repository characteristics
    const prompt = generateAdvancedPrompt(readmeContent, repoInfo);

    // Use Gemini 1.5 flash for advanced AI summarization
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    const summaryResponse = {
      summary: summary.trim(),
      repository: `${owner}/${repo}`,
      language: repoInfo?.language || null,
      generatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: summaryResponse
    };
  } catch (error) {
    request.log.error(`AI summarization failed for ${owner}/${repo}:`, error);
    
    // Return a fallback response instead of error
    const errorResponse = {
      summary: `Unable to generate AI summary for ${repo}. This might be a private repository or the AI service is temporarily unavailable.`,
      repository: `${owner}/${repo}`,
      error: true
    };
    
    return {
      success: true,
      data: errorResponse
    };
  }
}

// Batch AI README summarization endpoint
async function batchSummarizeHandler(request, reply) {
  const { repositories, parallel = true } = request.body;
  
  try {
    request.log.info(`Processing batch AI summary for ${repositories.length} repositories`);
    
    const results = [];
    
    if (parallel) {
      // Process repositories in parallel for better performance
      const promises = repositories.map(async ({ owner, repo }) => {
        try {
          // Create a mock request object for the individual handler
          const mockRequest = {
            body: { owner, repo },
            log: request.log
          };
          
          const result = await aiSummarizeHandler(mockRequest, reply);
          return {
            owner,
            repo,
            success: true,
            ...result.data
          };
        } catch (error) {
          request.log.error(`Batch summarization failed for ${owner}/${repo}:`, error);
          return {
            owner,
            repo,
            success: false,
            error: error.message || 'Summarization failed'
          };
        }
      });
      
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const { owner, repo } = repositories[index];
          results.push({
            owner,
            repo,
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
    } else {
      // Process repositories sequentially
      for (const { owner, repo } of repositories) {
        try {
          const mockRequest = {
            body: { owner, repo },
            log: request.log
          };
          
          const result = await aiSummarizeHandler(mockRequest, reply);
          results.push({
            owner,
            repo,
            success: true,
            ...result.data
          });
        } catch (error) {
          request.log.error(`Batch summarization failed for ${owner}/${repo}:`, error);
          results.push({
            owner,
            repo,
            success: false,
            error: error.message || 'Summarization failed'
          });
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return {
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          processing_mode: parallel ? 'parallel' : 'sequential'
        }
      }
    };
    
  } catch (error) {
    request.log.error('Batch AI summarization failed:', error);
    
    return {
      success: false,
      error: 'Batch processing failed',
      message: error.message || 'An error occurred during batch processing'
    };
  }
}

// Generate advanced prompts based on repository characteristics
function generateAdvancedPrompt(readmeContent, repoInfo) {
  const language = repoInfo?.language?.toLowerCase() || '';
  const topics = repoInfo?.topics || [];
  const isFramework = topics.some(topic => ['framework', 'library', 'sdk'].includes(topic.toLowerCase()));
  const isWeb = topics.some(topic => ['web', 'frontend', 'backend', 'fullstack'].includes(topic.toLowerCase()));
  const isML = topics.some(topic => ['machine-learning', 'ai', 'ml', 'deep-learning'].includes(topic.toLowerCase()));
  
  let promptTemplate = `Please provide a concise 2-line summary of this GitHub repository:

${readmeContent}

Format: Line 1 should describe what the repository is. Line 2 should mention the main technology/framework used.`;

  // Customize prompt based on repository type
  if (isML) {
    promptTemplate += `
    
Focus on: ML/AI techniques used, datasets, model types, and practical applications.
Example: "A deep learning model for image classification using convolutional neural networks. Built with TensorFlow and Python."`;
  } else if (isFramework) {
    promptTemplate += `
    
Focus on: What problems it solves, key features, and target audience.
Example: "A React component library for building accessible user interfaces. Features pre-built components with TypeScript support."`;
  } else if (isWeb) {
    promptTemplate += `
    
Focus on: Type of web application, main features, and tech stack.
Example: "A real-time collaborative code editor for remote teams. Built with React, Node.js, and WebSocket."`;
  } else if (language === 'python') {
    promptTemplate += `
    
Focus on: Primary use case, key functionalities, and Python ecosystem integration.
Example: "A data analysis library for processing large datasets efficiently. Compatible with pandas and NumPy."`;
  } else if (language === 'javascript' || language === 'typescript') {
    promptTemplate += `
    
Focus on: Runtime environment (Node.js/browser), main purpose, and framework dependencies.
Example: "A command-line tool for optimizing web assets and build processes. Built with Node.js and supports modern bundlers."`;
  }
  
  return promptTemplate;
}

// Status endpoint
async function statusHandler(request, reply) {
  return {
    status: 'ok',
    message: 'Vibe GitHub Assistant API is running',
    timestamp: new Date().toISOString(),
    supportedFeatures: ['repository-analysis', 'user-profiles', 'ai-summaries']
  };
}

// Export routes
export default async function (fastify, options) {
  // Repository analysis
  fastify.post('/analyze', analyzeSchema, analyzeHandler);
  
  // User profile endpoints
  fastify.get('/users/:username', userProfileSchema, userProfileHandler);
  fastify.get('/users/:username/repos', userReposSchema, userReposHandler);
  
  // AI summarization
  fastify.post('/ai/summarize', aiSummarizeSchema, aiSummarizeHandler);
  fastify.post('/ai/batch-summarize', batchSummarizeSchema, batchSummarizeHandler);
  
  // Status endpoint
  fastify.get('/analyze/status', statusHandler);
  fastify.get('/status', statusHandler);
} 