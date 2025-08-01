import { analyzeRepository } from '../services/analyzer.js';

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
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              repoInfo: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  fullName: { type: 'string' },
                  description: { type: 'string' },
                  language: { type: 'string' },
                  stars: { type: 'number' },
                  forks: { type: 'number' },
                  contributors: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              },
              vibeScore: {
                type: 'object',
                properties: {
                  total: { type: 'number', minimum: 0, maximum: 100 },
                  breakdown: {
                    type: 'object',
                    properties: {
                      codeQuality: { type: 'number', minimum: 0, maximum: 100 },
                      readability: { type: 'number', minimum: 0, maximum: 100 },
                      collaboration: { type: 'number', minimum: 0, maximum: 100 },
                      innovation: { type: 'number', minimum: 0, maximum: 100 },
                      maintainability: { type: 'number', minimum: 0, maximum: 100 },
                      inclusivity: { type: 'number', minimum: 0, maximum: 100 },
                      security: { type: 'number', minimum: 0, maximum: 100 },
                      performance: { type: 'number', minimum: 0, maximum: 100 },
                      testingQuality: { type: 'number', minimum: 0, maximum: 100 },
                      communityHealth: { type: 'number', minimum: 0, maximum: 100 },
                      codeHealth: { type: 'number', minimum: 0, maximum: 100 },
                      releaseManagement: { type: 'number', minimum: 0, maximum: 100 }
                    }
                  },
                  weights: {
                    type: 'object',
                    properties: {
                      codeQuality: { type: 'number' },
                      readability: { type: 'number' },
                      collaboration: { type: 'number' },
                      innovation: { type: 'number' },
                      maintainability: { type: 'number' },
                      inclusivity: { type: 'number' },
                      security: { type: 'number' },
                      performance: { type: 'number' },
                      testingQuality: { type: 'number' },
                      communityHealth: { type: 'number' },
                      codeHealth: { type: 'number' },
                      releaseManagement: { type: 'number' }
                    }
                  }
                }
              },
              analysis: {
                type: 'object',
                properties: {
                  testFiles: { type: 'array', items: { type: 'string' } },
                  documentationFiles: { type: 'array', items: { type: 'string' } },
                  dependencies: { type: 'array', items: { type: 'string' } },
                  folderStructure: { type: 'array', items: { type: 'string' } },
                  insights: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Main analysis endpoint
async function analyzeHandler(request, reply) {
  const { repoUrl } = request.body;
  
  try {
    // Log the analysis request
    request.log.info(`Analyzing repository: ${repoUrl}`);
    
    // Perform repository analysis
    const analysisResult = await analyzeRepository(repoUrl);
    
    // Return successful response
    return {
      success: true,
      data: analysisResult
    };
    
  } catch (error) {
    request.log.error(`Analysis failed for ${repoUrl}:`, error);
    
    // Handle specific error types
    if (error.status === 404) {
      return reply.status(404).send({
        success: false,
        error: 'Repository Not Found',
        message: 'The specified GitHub repository could not be found. Please check the URL and that the repository is public.'
      });
    }
    
    if (error.status === 401) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication Failed',
        message: 'Your GitHub token is invalid or has expired. Please verify your token in the backend .env file.'
      });
    }

    if (error.status === 403) {
      const isRateLimitError = error.message && error.message.toLowerCase().includes('rate limit');
      const resetTime = error.headers && error.headers['x-ratelimit-reset'] 
        ? new Date(parseInt(error.headers['x-ratelimit-reset']) * 1000).toLocaleTimeString() 
        : 'later';

      if (isRateLimitError) {
        return reply.status(429).send({
          success: false,
          error: 'Rate Limit Exceeded',
          message: `GitHub API rate limit exceeded. Please wait until ${resetTime} or add a valid GitHub token to increase your limit.`
        });
      }
      
      return reply.status(403).send({
        success: false,
        error: 'Access Denied',
        message: 'This repository is private or you do not have permission to access it. Only public repositories are supported.'
      });
    }
    
    if (error.status === 429) {
      return reply.status(429).send({
        success: false,
        error: 'Rate Limit Exceeded',
        message: 'GitHub API rate limit exceeded. Please try again later.'
      });
    }
    
    // Generic error response
    return reply.status(500).send({
      success: false,
      error: 'Analysis Failed',
      message: 'Failed to analyze the repository. Please try again later.'
    });
  }
}

// Export routes
export default async function (fastify, options) {
  fastify.post('/analyze', analyzeSchema, analyzeHandler);
  
  // Additional endpoint for getting analysis status
  fastify.get('/analyze/status', async (request, reply) => {
    return {
      status: 'operational',
      version: '1.0.0',
      supportedLanguages: ['JavaScript', 'Python', 'Java', 'Go', 'TypeScript', 'C++', 'C#', 'Ruby', 'PHP'],
      maxFileSize: '1MB',
      rateLimit: '100 requests per 15 minutes'
    };
  });
} 