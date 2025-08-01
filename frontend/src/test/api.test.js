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
const { analyzeRepository, isValidGitHubUrl, extractRepoInfo } = await import('../services/api.js');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('analyzeRepository', () => {
    test('successfully analyzes a repository', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            vibeScore: { total: 85 },
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await analyzeRepository('https://github.com/user/repo');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/analyze',
        { repoUrl: 'https://github.com/user/repo' },
        { timeout: 30000 }
      );
      expect(result).toEqual(mockResponse.data.data);
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
}); 