import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000';

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
                throw new Error(data.message || 'Invalid repository URL. Please check the format.');
              case 404:
                throw new Error('Repository not found. Please check the URL and ensure it\'s a public repository.');
              case 403:
                throw new Error('Access denied. This repository might be private or access is restricted.');
              case 429:
                throw new Error('Rate limit exceeded. Please try again later.');
              case 500:
                throw new Error('Server error. Please try again later.');
              default:
                throw new Error(data.message || `Request failed with status ${status}`);
            }
          } else if (error.request) {
            throw new Error('Network error. Please check your connection and try again.');
          } else {
            throw new Error(error.message || 'An unexpected error occurred.');
          }
        }
      );

      return {
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
                return response.data.data;
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

export const {
    analyzeRepository,
    getRepositoryInfo,
    getRepositoryStats,
    getRepositoryContent,
    getRepositoryLanguages,
    getRepositoryContributors,
    getApiStatus,
    checkApiHealth,
    validateRepoUrl,
    isValidGitHubUrl,
    extractRepoInfo,
  } = api;
  
export { api }; 