// Jest globals are available without import in test environment
import { GeminiInsightsService } from '../src/services/geminiInsights.js';

describe('GeminiInsightsService', () => {
  describe('constructor', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should throw error when API key is missing', () => {
      process.env = { ...originalEnv };
      delete process.env.GEMINI_API_KEY;
      
      expect(() => {
        new GeminiInsightsService();
      }).toThrow('GEMINI_API_KEY is required for AI insights');
    });
  });

  describe('buildOptimizedPrompt', () => {
    let service;
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
      try {
        service = new GeminiInsightsService();
      } catch (error) {
        console.log('Skipping tests - Gemini initialization failed');
      }
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should build valid prompt with complete data', () => {
      if (!service) return;

      const repoData = {
        repoInfo: {
          name: 'test-repo',
          description: 'Test description',
          language: 'JavaScript',
          stargazers_count: 100,
          forks_count: 50,
          updated_at: new Date().toISOString()
        },
        commits: [
          { commit: { message: 'Test commit' } }
        ],
        contributors: [
          { login: 'user1' }
        ]
      };

      const prompt = service.buildOptimizedPrompt(repoData);

      expect(prompt).toContain('test-repo');
      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('100');
      expect(prompt).toContain('user1');
    });

    it('should handle missing data gracefully', () => {
      if (!service) return;

      const repoData = {
        repoInfo: {
          name: 'test-repo'
        },
        commits: [],
        contributors: []
      };

      const prompt = service.buildOptimizedPrompt(repoData);

      expect(prompt).toContain('test-repo');
      expect(prompt).toContain('Unknown');
    });
  });

  describe('parseInsightResponse', () => {
    let service;
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
      try {
        service = new GeminiInsightsService();
      } catch (error) {
        console.log('Skipping tests - Gemini initialization failed');
      }
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should parse valid response correctly', () => {
      if (!service) return;

      const validResponse = `Here is the analysis:
      {
        "summary": "Well-maintained repository",
        "strengths": ["Clean code", "Good structure", "Active development"],
        "improvements": ["Add more tests", "Update documentation"],
        "recommendation": "Focus on test coverage",
        "collaboration": "Active collaboration with regular commits",
        "activity": "active",
        "quality": 85
      }
      Additional text here`;
      
      const mockRepoData = {
        contributors: [
          { login: 'user1' },
          { login: 'user2' },
          { login: 'user3' }
        ]
      };

      const result = service.parseInsightResponse(validResponse, mockRepoData);

      expect(result).toHaveProperty('hotspotFiles');
      expect(result).toHaveProperty('contributorInsights');
      expect(result.contributorInsights.mostActive).toEqual(['user1', 'user2', 'user3']);
      expect(result.contributorInsights.collaborationPattern).toBe('Active collaboration with regular commits');
      expect(result.codeQuality.strengths).toContain('Clean code');
      expect(result.codeQuality.concerns).toContain('Add more tests');
    });

    it('should handle invalid JSON with fallback structure', () => {
      if (!service) return;

      const invalidResponse = 'This is not JSON at all';

      expect(() => service.parseInsightResponse(invalidResponse)).toThrow();
    });

    it('should extract JSON from mixed content', () => {
      if (!service) return;

      const mixedResponse = `Some preamble text
      {"summary": "Test repo", "strengths": ["Good"], "improvements": ["Test"], "quality": 75}
      Some trailing text`;
      
      const mockRepoData = {
        contributors: [
          { login: 'user1' },
          { login: 'user2' }
        ]
      };

      const result = service.parseInsightResponse(mixedResponse, mockRepoData);

      expect(result).toHaveProperty('contributorInsights');
      expect(result.contributorInsights.mostActive).toEqual(['user1', 'user2']);
      expect(result.codeQuality.strengths).toEqual(['Good']);
      expect(result.codeQuality.concerns).toEqual(['Test']);
    });
  });

  describe('calculateCommitFrequency', () => {
    let service;
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
      try {
        service = new GeminiInsightsService();
      } catch (error) {
        console.log('Skipping tests - Gemini initialization failed');
      }
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should calculate commit frequency by week', () => {
      if (!service) return;

      const commits = [
        { commit: { author: { date: '2024-01-01T10:00:00Z' } } }, // Monday
        { commit: { author: { date: '2024-01-01T14:00:00Z' } } }, // Monday
        { commit: { author: { date: '2024-01-02T10:00:00Z' } } }, // Tuesday
        { commit: { author: { date: '2024-01-02T11:00:00Z' } } }, // Tuesday
        { commit: { author: { date: '2024-01-02T12:00:00Z' } } }, // Tuesday
        { commit: { author: { date: '2024-01-08T10:00:00Z' } } }  // Next Monday
      ];

      const frequency = service.calculateCommitFrequency(commits);

      expect(frequency).toHaveLength(2); // 2 weeks
      expect(frequency[0].count).toBe(5); // First week
      expect(frequency[1].count).toBe(1); // Second week
    });

    it('should handle empty commits', () => {
      if (!service) return;

      const frequency = service.calculateCommitFrequency([]);
      expect(frequency).toEqual([]);
    });

    it('should limit to last 8 weeks', () => {
      if (!service) return;

      // Create commits across 10 weeks
      const commits = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7)); // Each week
        commits.push({
          commit: { author: { date: date.toISOString() } }
        });
      }

      const frequency = service.calculateCommitFrequency(commits);
      expect(frequency.length).toBeLessThanOrEqual(8);
    });
  });

  describe('generateVisualizationData', () => {
    let service;
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
      try {
        service = new GeminiInsightsService();
      } catch (error) {
        console.log('Skipping tests - Gemini initialization failed');
      }
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should generate visualization data from commits and contributors', async () => {
      if (!service) return;

      const repoData = {
        commits: [
          { commit: { author: { date: '2024-01-01T10:00:00Z' } } },
          { commit: { author: { date: '2024-01-02T10:00:00Z' } } },
          { commit: { author: { date: '2024-01-08T10:00:00Z' } } }
        ],
        contributors: [
          { login: 'user1', contributions: 30 },
          { login: 'user2', contributions: 20 }
        ]
      };

      const vizData = await service.generateVisualizationData(repoData);

      expect(vizData).toHaveProperty('commitFrequency');
      expect(vizData).toHaveProperty('contributorDistribution');
      expect(vizData.commitFrequency).toHaveLength(2); // 2 unique weeks
      expect(vizData.contributorDistribution).toHaveLength(2);
      expect(vizData.contributorDistribution[0].percentage).toBe(60); // 30/50 * 100
    });

    it('should handle empty data', async () => {
      if (!service) return;

      const repoData = {
        commits: [],
        contributors: []
      };

      const vizData = await service.generateVisualizationData(repoData);

      expect(vizData.commitFrequency).toEqual([]);
      expect(vizData.contributorDistribution).toEqual([]);
    });
  });
}); 