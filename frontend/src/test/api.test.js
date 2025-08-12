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

      // The analyzeRepository function uses the axios instance internally
      // We need to mock the axios.create return value properly
      const mockPost = vi.fn().mockResolvedValue({ data: mockResponseData });
      axios.create.mockReturnValue({
        post: mockPost,
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
      });

      // Re-import to use the new mock
      const { analyzeRepository: analyze } = await import('../services/api.js');
      
      const result = await analyze('https://github.com/user/repo');

      expect(mockPost).toHaveBeenCalledWith(
        '/api/analyze',
        { repoUrl: 'https://github.com/user/repo' },
        { timeout: 30000 }
      );
      // The API returns the response object with success and data properties
      expect(result).toEqual(mockResponseData);
    });

    test('handles analysis failure', async () => {
      const mockPost = vi.fn().mockRejectedValue(new Error('Analysis failed'));
      axios.create.mockReturnValue({
        post: mockPost,
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
      });

      const { analyzeRepository: analyze } = await import('../services/api.js');
      
      await expect(analyze('https://github.com/user/repo')).rejects.toThrow('Analysis failed');
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

      // Mock axios.post for generateInsights which uses axios directly
      const originalCreate = axios.create;
      axios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateInsights('https://github.com/user/repo');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze/insights'),
        { repoUrl: 'https://github.com/user/repo' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('handles insights generation failure', async () => {
      axios.post = vi.fn().mockRejectedValue(new Error('Insights generation failed'));
      
      await expect(generateInsights('https://github.com/user/repo')).rejects.toThrow('Insights generation failed');
    });

    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      networkError.code = 'ECONNREFUSED';
      axios.post = vi.fn().mockRejectedValue(networkError);
      
      await expect(generateInsights('https://github.com/user/repo')).rejects.toThrow('Network error');
    });
  });
}); 