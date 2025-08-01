import axios from 'axios';
import dotenv from 'dotenv';

/**
 * GitHub API service for fetching repository data
 * Handles all GitHub REST API calls with proper authentication and error handling
 */
export class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.token = process.env.GITHUB_TOKEN;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.rateLimitDelay = 1000; // 1 second delay between requests for unauthenticated calls
    dotenv.config();
    // Debug token configuration
    console.log(`🔧 GitHub Service initialized:`);
    console.log(`   - Token configured: ${this.token ? '✅ Yes' : '❌ No'}`);
    console.log(`   - Token preview: ${this.token ? this.token.substring(0, 10) + '...' : 'None'}`);
    
    // Configure axios instance with GitHub API headers
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'VibeAI-Analyzer/1.0.0',
        ...(this.token && { 'Authorization': `token ${this.token}` })
      },
      timeout: 10000 // 10 second timeout for faster failure detection
    });
    
    // Add request interceptor for rate limiting (only for unauthenticated requests)
    this.api.interceptors.request.use(
      async (config) => {
        // Only add delay for unauthenticated requests to avoid rate limits
        // With token, we have 5000 requests/hour, so no delay needed
        if (!this.token && !process.env.GITHUB_TOKEN) {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.rateLimitDelay) {
            const delay = this.rateLimitDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          this.lastRequestTime = Date.now();
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          throw new Error('GitHub API authentication failed. Please check your token.');
        }
        if (error.response?.status === 403) {
          const resetTime = error.response.headers['x-ratelimit-reset'];
          const remaining = error.response.headers['x-ratelimit-remaining'];
          
          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000);
            throw new Error(`GitHub API rate limit exceeded. Rate limit resets at ${resetDate.toLocaleTimeString()}. Please try again later.`);
          } else {
            throw new Error('GitHub API rate limit exceeded or access denied. Please try again later.');
          }
        }
        if (error.response?.status === 404) {
          throw new Error('Repository not found or is private.');
        }
        throw error;
      }
    );
  }

  /**
   * Ensure token is loaded (called before any API request)
   */
  ensureToken() {
    if (!this.token) {
      this.token = process.env.GITHUB_TOKEN;
      if (this.token) {
        this.api.defaults.headers['Authorization'] = `token ${this.token}`;
        console.log(`🔧 Token loaded dynamically: ${this.token.substring(0, 10)}...`);
      }
    }
  }

  /**
   * Get basic repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Repository information
   */
  async getRepositoryInfo(owner, repo) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch repository info for ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  /**
   * Get repository contents (files and folders)
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - Path within repository (default: root)
   * @returns {Array} Array of file and folder objects
   */
  async getRepositoryContents(owner, repo, path = '') {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${path}`);
      
      // If it's a single file, return it in an array
      if (!Array.isArray(response.data)) {
        return [response.data];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch repository contents for ${owner}/${repo}:`, error.message);
      // Return empty array if path doesn't exist
      return [];
    }
  }

  /**
   * Get commit history for collaboration analysis
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} perPage - Number of commits per page (max 100)
   * @returns {Array} Array of commit objects
   */
  async getCommitHistory(owner, repo, perPage = 30) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}/commits`, {
        params: {
          per_page: perPage,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch commit history for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  /**
   * Get repository contributors for diversity analysis
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Array} Array of contributor objects with basic information
   */
  async getContributors(owner, repo) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}/contributors`, {
        params: {
          per_page: 30, // Reduced to avoid rate limits
          page: 1
        }
      });
      
      // Return basic contributor data without detailed user info to avoid rate limits
      return response.data.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url
      }));
    } catch (error) {
      console.error(`Failed to fetch contributors for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  /**
   * Get repository languages for language detection
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Object with language names as keys and bytes as values
   */
  async getLanguages(owner, repo) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}/languages`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch languages for ${owner}/${repo}:`, error.message);
      return {};
    }
  }

  /**
   * Get repository statistics (stars, forks, etc.)
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Repository statistics
   */
  async getRepositoryStats(owner, repo) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}`);
      return {
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        watchers: response.data.watchers_count,
        openIssues: response.data.open_issues_count,
        size: response.data.size,
        defaultBranch: response.data.default_branch
      };
    } catch (error) {
      console.error(`Failed to fetch repository stats for ${owner}/${repo}:`, error.message);
      return {};
    }
  }

  /**
   * Get file content for analysis
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path within repository
   * @returns {string} File content (decoded from base64)
   */
  async getFileContent(owner, repo, path) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${path}`);
      
      // GitHub API returns content as base64 encoded
      if (response.data.content && response.data.encoding === 'base64') {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
      
      return response.data.content || '';
    } catch (error) {
      console.error(`Failed to fetch file content for ${owner}/${repo}/${path}:`, error.message);
      return '';
    }
  }

  /**
   * Search for files by pattern in repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} pattern - File pattern to search for
   * @returns {Array} Array of matching file objects
   */
  async searchFiles(owner, repo, pattern) {
    try {
      this.ensureToken();
      const response = await this.api.get('/search/code', {
        params: {
          q: `repo:${owner}/${repo} filename:${pattern}`,
          per_page: 100
        }
      });
      return response.data.items || [];
    } catch (error) {
      console.error(`Failed to search files for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  /**
   * Get repository topics for innovation analysis
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Array} Array of topic strings
   */
  async getTopics(owner, repo) {
    try {
      this.ensureToken();
      const response = await this.api.get(`/repos/${owner}/${repo}/topics`, {
        headers: {
          'Accept': 'application/vnd.github.mercy-preview+json'
        }
      });
      return response.data.names || [];
    } catch (error) {
      console.error(`Failed to fetch topics for ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  /**
   * Check if GitHub token is configured
   * @returns {boolean} True if token is available
   */
  hasToken() {
    return !!this.token;
  }

  /**
   * Get rate limit information
   * @returns {Object} Rate limit information
   */
  async getRateLimit() {
    try {
      this.ensureToken();
      const response = await this.api.get('/rate_limit');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rate limit info:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService(); 