import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
};
global.console = mockConsole;

// Mock axios instance with all necessary properties
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

// Mock axios.create to return our mock instance
axios.create = vi.fn(() => mockAxiosInstance);

// Import after mocking to ensure the mocks are in place
const { analyzeRepository, isValidGitHubUrl, extractRepoInfo, generateInsights } = await import('../services/api.js');

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
      expect(isValidGitHubUrl('https://github.com/user/repo')).toBe(true);
    });

    test('invalidates incorrect GitHub URLs', () => {
      expect(isValidGitHubUrl('https://gitlab.com/user/repo')).toBe(false);
    });
  });

  describe('extractRepoInfo', () => {
    test('extracts info from valid URL', () => {
      const info = extractRepoInfo('https://github.com/user/repo');
      expect(info).toEqual({ owner: 'user', repo: 'repo' });
    });

    test('throws error for invalid URL', () => {
      expect(() => extractRepoInfo('invalid-url')).toThrow('Invalid GitHub repository URL');
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

      // Need to mock axios directly since generateInsights uses axios.post
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