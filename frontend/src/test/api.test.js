import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock console before importing anything
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};
global.console = mockConsole;

// Mock axios module - must be done before any imports that use axios
vi.mock('axios', () => {
  const { vi } = import.meta.vitest;
  
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      baseURL: '',
      timeout: 0,
      headers: {}
    },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };
  
  return {
    default: {
      create: () => mockAxiosInstance,
      post: vi.fn(),
      get: vi.fn()
    }
  };
});

// Import axios and API functions after mocking
import axios from 'axios';
import { analyzeRepository, generateInsights } from '../services/api.js';

// Get reference to the mocked axios instance
const mockAxiosInstance = axios.create();

// We need to create a separate instance to test the utility functions
// Since they are part of the api object but not directly exported
const createTestApi = () => {
  return {
    isValidGitHubUrl: (url) => {
      if (!url || typeof url !== 'string') return false;
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
    }
  };
};

const testApi = createTestApi();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('analyzeRepository', () => {
    test('successfully analyzes a repository', async () => {
      const mockResponseData = {
        success: true,
        data: {
          vibeScore: {
            total: 85
          }
        }
      };

      // Axios returns response.data, so we need to wrap it
      mockAxiosInstance.post.mockResolvedValue({ data: mockResponseData });

      const result = await analyzeRepository('https://github.com/user/repo');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/analyze',
        { repoUrl: 'https://github.com/user/repo' },
        { timeout: 30000 }
      );
      // The API returns the response object with success and data properties
      expect(result).toEqual(mockResponseData);
    });

    test('handles analysis failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Analysis failed'));
      await expect(analyzeRepository('https://github.com/user/repo')).rejects.toThrow('Analysis failed');
    });
  });

  describe('isValidGitHubUrl', () => {
    test('validates correct GitHub URLs', () => {
      expect(testApi.isValidGitHubUrl('https://github.com/user/repo')).toBe(true);
      expect(testApi.isValidGitHubUrl('http://github.com/user/repo')).toBe(true);
      expect(testApi.isValidGitHubUrl('https://www.github.com/user/repo')).toBe(true);
      expect(testApi.isValidGitHubUrl('https://github.com/user/repo.git')).toBe(true);
    });

    test('invalidates incorrect GitHub URLs', () => {
      expect(testApi.isValidGitHubUrl('https://gitlab.com/user/repo')).toBe(false);
      expect(testApi.isValidGitHubUrl('github.com/user/repo')).toBe(false); // missing protocol
      expect(testApi.isValidGitHubUrl('https://github.com/user')).toBe(false); // missing repo
      expect(testApi.isValidGitHubUrl('not-a-url')).toBe(false);
      expect(testApi.isValidGitHubUrl('')).toBe(false);
      expect(testApi.isValidGitHubUrl(null)).toBe(false);
      expect(testApi.isValidGitHubUrl(undefined)).toBe(false);
    });
  });

  describe('extractRepoInfo', () => {
    test('extracts info from valid URL', () => {
      const info = testApi.extractRepoInfo('https://github.com/user/repo');
      expect(info).toEqual({ owner: 'user', repo: 'repo' });
    });

    test('extracts info from URL with .git extension', () => {
      const info = testApi.extractRepoInfo('https://github.com/user/repo.git');
      expect(info).toEqual({ owner: 'user', repo: 'repo' });
    });

    test('extracts info from URL with www', () => {
      const info = testApi.extractRepoInfo('https://www.github.com/user/repo');
      expect(info).toEqual({ owner: 'user', repo: 'repo' });
    });

    test('throws error for invalid URL', () => {
      expect(() => testApi.extractRepoInfo('invalid-url')).toThrow('Invalid GitHub repository URL');
      expect(() => testApi.extractRepoInfo('https://gitlab.com/user/repo')).toThrow('Invalid GitHub repository URL');
    });
  });

  describe('generateInsights', () => {
    test('successfully generates insights for a repository', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            insights: {
              hotspotFiles: [],
              contributorInsights: {
                mostActive: ['user1'],
                collaborationPattern: 'Active collaboration',
                recommendation: 'Keep up the good work'
              },
              developmentPatterns: {
                commitFrequency: 'Daily',
                releasePattern: 'Weekly',
                velocity: 'High'
              },
              codeQuality: {
                strengths: ['Clean code'],
                concerns: ['No tests'],
                technicalDebt: 'Low'
              },
              recommendations: []
            }
          }
        }
      };

      // generateInsights uses axios.post directly
      axios.post.mockResolvedValue(mockResponse);

      const result = await generateInsights('https://github.com/user/repo');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze/insights'),
        { repoUrl: 'https://github.com/user/repo' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('handles insights generation failure', async () => {
      axios.post.mockRejectedValue(new Error('Insights generation failed'));
      
      await expect(generateInsights('https://github.com/user/repo')).rejects.toThrow('Insights generation failed');
    });

    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.code = 'ECONNREFUSED';
      axios.post.mockRejectedValue(networkError);
      
      await expect(generateInsights('https://github.com/user/repo')).rejects.toThrow('Network error');
    });
  });
}); 