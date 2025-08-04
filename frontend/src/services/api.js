import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, params) => {
  return `${url}?${JSON.stringify(params || {})}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Limit cache size
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
};

const createApi = (axiosInstance) => {
    axiosInstance.defaults.baseURL = API_BASE_URL;
    axiosInstance.defaults.timeout = 60000;
    axiosInstance.defaults.headers['Content-Type'] = 'application/json';

    axiosInstance.interceptors.request.use(
        (config) => {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error('API Request Error:', error);
          return Promise.reject(error);
        }
      );
      
      axiosInstance.interceptors.response.use(
        (response) => {
          console.log(`API Response: ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error('API Response Error:', error);
          
          if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
              case 400:
                throw new Error(data.message || 'Invalid request. Please check your input.');
              case 404:
                throw new Error(data.message || 'Not found. Please check the username or repository.');
              case 403:
                // GitHub rate limit or permissions issue
                if (error.response.headers['x-ratelimit-remaining'] === '0') {
                  const resetTime = new Date(error.response.headers['x-ratelimit-reset'] * 1000);
                  throw new Error(`GitHub API rate limit exceeded. Please try again after ${resetTime.toLocaleTimeString()}`);
                }
                throw new Error('Access denied. This resource might be private or access is restricted.');
              case 422:
                throw new Error('Invalid input format. Please check your username or repository URL.');
              case 429:
                throw new Error('Rate limit exceeded. Please try again later.');
              case 500:
                throw new Error('Server error. Please try again later.');
              default:
                throw new Error(data.message || `Request failed with status ${status}`);
            }
          } else if (error.request) {
            // Network error
            if (error.code === 'ECONNABORTED') {
              throw new Error('Request timeout. Please check your internet connection and try again.');
            }
            throw new Error('Network error. Please check your connection and try again.');
          } else {
            throw new Error(error.message || 'An unexpected error occurred.');
          }
        }
      );

      return {
        // Repository analysis (existing)
        analyzeRepository: async (repoUrl) => {
            if (!repoUrl || typeof repoUrl !== 'string' || !repoUrl.trim()) {
              throw new Error('Repository URL is required');
            }
          
            const trimmedUrl = repoUrl.trim();
          
            if (!isValidGitHubUrl(trimmedUrl)) {
              throw new Error('Please enter a valid GitHub repository URL');
            }
          
            try {
              const response = await axiosInstance.post('/api/analyze', { repoUrl: trimmedUrl }, { timeout: 30000 });
              
              if (!response || !response.data) {
                throw new Error('Invalid response format');
              }
              if (response.data.success) {
                return response.data;
              } else {
                throw new Error(response.data.message || 'Analysis failed');
              }
            } catch (error) {
              console.error('Repository analysis failed:', error);
              if (error.message.includes('timeout')) {
                throw new Error('Request timed out. Please try again.');
              }
              throw error;
            }
          },

        // GitHub User Profile (new)
        getUserProfile: async (username) => {
            if (!username || typeof username !== 'string' || !username.trim()) {
              throw new Error('Username is required');
            }
          
            const trimmedUsername = username.trim();
          
            if (!isValidGitHubUsername(trimmedUsername)) {
              throw new Error('Please enter a valid GitHub username');
            }
          
            // Check cache first
            const cacheKey = getCacheKey(`/api/users/${trimmedUsername}`, null);
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
              return cachedData;
            }
          
            try {
              const response = await axiosInstance.get(`/api/users/${trimmedUsername}`);
              
              if (!response || !response.data) {
                throw new Error('Invalid response format');
              }
              
              // Cache the successful response
              setCachedData(cacheKey, response.data);
              
              return response.data;
            } catch (error) {
              console.error('User profile fetch failed:', error);
              if (error.response?.status === 404) {
                throw new Error('No user found with that name.');
              }
              throw error;
            }
          },

        // GitHub User Repositories (new)
        getUserRepositories: async (username, page = 1, perPage = 30) => {
            if (!username || typeof username !== 'string' || !username.trim()) {
              throw new Error('Username is required');
            }
          
            const trimmedUsername = username.trim();
          
            // Check cache first
            const params = { page, per_page: perPage, sort: 'updated' };
            const cacheKey = getCacheKey(`/api/users/${trimmedUsername}/repos`, params);
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
              return cachedData.success ? cachedData.data || [] : cachedData || [];
            }
          
            try {
              const response = await axiosInstance.get(`/api/users/${trimmedUsername}/repos`, {
                params
              });
              
              // Cache the successful response
              setCachedData(cacheKey, response.data);
              
              // The backend returns { success: true, data: [...] }
              if (response.data && response.data.success) {
                return response.data.data || [];
              }
              return response.data || [];
            } catch (error) {
              console.error('User repositories fetch failed:', error);
              throw error;
            }
          },

        // Chat Input Processing (new)
        processUserInput: async (input) => {
            if (!input || typeof input !== 'string' || !input.trim()) {
              throw new Error('Please enter a valid input.');
            }
          
            const trimmedInput = input.trim();
          
            // Check if it's a GitHub URL
            if (isValidGitHubUrl(trimmedInput)) {
              return {
                type: 'repository',
                input: trimmedInput
              };
            }
          
            // Check if it looks like a repository (owner/repo format)
            if (isValidGitHubRepoFormat(trimmedInput)) {
              return {
                type: 'repository',
                input: `https://github.com/${trimmedInput}`
              };
            }
          
            // Check if it's a valid username
            if (isValidGitHubUsername(trimmedInput)) {
              return {
                type: 'user',
                input: trimmedInput
              };
            }
          
            throw new Error('Please enter a GitHub username or repository URL.');
          },

        // AI README Summarization (new - bonus feature)
        summarizeReadme: async (owner, repo) => {
            try {
              const response = await axiosInstance.post('/api/ai/summarize', { 
                owner, 
                repo 
              });
              
              if (!response || !response.data || !response.data.data) {
                throw new Error('Invalid response format');
              }
              
              // Return the full response data object, not just the summary
              return response.data.data;
            } catch (error) {
              console.error('README summarization failed:', error);
              
              // Check if it's a server error with a message
              if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
              }
              
              throw new Error('Failed to generate summary. Please try again later.');
            }
          },

        // Batch AI Summarization (new - performance feature)
        batchSummarizeReadme: async (repositories, parallel = true) => {
            try {
              const response = await axiosInstance.post('/api/ai/batch-summarize', { 
                repositories: repositories.map(repo => ({
                  owner: repo.owner || repo.owner?.login,
                  repo: repo.name || repo.repo
                })),
                parallel
              });
              
              if (!response || !response.data || !response.data.data) {
                throw new Error('Invalid response format');
              }
              
              return response.data.data;
            } catch (error) {
              console.error('Batch README summarization failed:', error);
              
              if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
              }
              
              throw new Error('Failed to generate batch summaries. Please try again later.');
            }
          },

          getRepositoryInfo: async (owner, repo) => {
            if (!owner || !repo) {
              throw new Error('Owner and repository name are required');
            }
          
            try {
              const response = await axiosInstance.get(`/api/repos/${owner}/${repo}`);
              if (!response || !response.data) return {};
              return response.data;
            } catch (error) {
              if (error.response?.status === 404) {
                throw new Error('Repository not found');
              } else if (error.response?.status === 401) {
                throw new Error('Unauthorized access to repository');
              }
              throw error;
            }
          },
        getRepositoryStats: async (owner, repo) => {
            try {
              const response = await axiosInstance.get(`/api/repos/${owner}/${repo}/stats`);
              if (!response || !response.data) return {};
              return response.data;
            } catch (error) {
              console.error('Failed to get repository stats:', error);
              throw error;
            }
          },
        getRepositoryContent: async (owner, repo, path = '') => {
            try {
              const url = path ? `/api/repos/${owner}/${repo}/contents/${path}` : `/api/repos/${owner}/${repo}/contents`;
              const response = await axiosInstance.get(url);
              if (!response || !response.data) return [];
              return response.data;
            } catch (error) {
              console.error('Failed to get repository content:', error);
              throw error;
            }
          },
        getRepositoryLanguages: async (owner, repo) => {
            try {
              const response = await axiosInstance.get(`/api/repos/${owner}/${repo}/languages`);
              if (!response || !response.data) return {};
              return response.data;
            } catch (error) {
              console.error('Failed to get repository languages:', error);
              throw error;
            }
          },
        getRepositoryContributors: async (owner, repo) => {
            try {
              const response = await axiosInstance.get(`/api/repos/${owner}/${repo}/contributors`);
              if (!response || !response.data) return [];
              return response.data;
            } catch (error) {
              console.error('Failed to get repository contributors:', error);
              throw error;
            }
          },
        getApiStatus: async () => {
            try {
              const response = await axiosInstance.get('/api/analyze/status');
              return response.data;
            } catch (error) {
              console.error('Failed to get API status:', error);
              throw error;
            }
          },
        checkApiHealth: async () => {
            try {
              const response = await axiosInstance.get('/health');
              return response.data.status === 'ok';
            } catch (error) {
              console.error('API health check failed:', error);
              return false;
            }
          },
          isValidGitHubUrl: (url) => {
            if (!url || typeof url !== 'string') return false;
            // More strict regex that requires http/https protocol
            const githubRepoPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?(?:\/.*)?$/;
            return githubRepoPattern.test(url.trim());
          },
          isValidGitHubUsername: (username) => {
            if (!username || typeof username !== 'string') return false;
            // GitHub username pattern: 1-39 chars, alphanumeric and hyphens, cannot start/end with hyphen
            const usernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]){0,37}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
            return usernamePattern.test(username.trim());
          },
          isValidGitHubRepoFormat: (input) => {
            if (!input || typeof input !== 'string') return false;
            // Check for owner/repo format
            const repoFormatPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
            return repoFormatPattern.test(input.trim());
          },
          validateRepoUrl: (url) => {
            if (!url || typeof url !== 'string') return false;
            // More strict regex that requires http/https protocol  
            const githubRepoPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?(?:\/.*)?$/;
            return githubRepoPattern.test(url.trim());
          },
          extractRepoInfo: (url) => {
            const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) {
              throw new Error('Invalid GitHub repository URL');
            }
            
            return {
              owner: match[1],
              repo: match[2].replace('.git', '')
            };
          },
      };
}

const api = createApi(axios.create());

// Export individual functions for convenience
const {
  analyzeRepository,
  getUserProfile,
  getUserRepositories,
  processUserInput,
  summarizeReadme,
  batchSummarizeReadme,
  getRepositoryInfo,
  getApiStatus,
  checkApiHealth,
  validateRepoUrl,
  isValidGitHubUrl,
  isValidGitHubUsername,
  isValidGitHubRepoFormat,
  extractRepoInfo,
} = api;

/**
 * Generate AI-powered insights for a repository
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<Object>} - Insights data
 */
export const generateInsights = async (repoUrl) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze/insights`, { repoUrl });
    return response.data;
  } catch (error) {
    console.error('Generate insights error:', error);
    throw error;
  }
};

export { 
  api,
  analyzeRepository,
  getUserProfile,
  getUserRepositories,
  processUserInput,
  summarizeReadme,
  batchSummarizeReadme,
  getRepositoryInfo,
  getApiStatus,
  checkApiHealth,
  validateRepoUrl,
  isValidGitHubUrl,
  isValidGitHubUsername,
  isValidGitHubRepoFormat,
  extractRepoInfo
}; 