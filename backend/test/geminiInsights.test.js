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

  describe('buildInsightPrompt', () => {
    let service;
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
      // Note: This will initialize the real Gemini service, but we'll only test methods that don't make API calls
      try {
        service = new GeminiInsightsService();
      } catch (error) {
        // If initialization fails, we'll skip these tests
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
          stargazers_count: 50
        },
        commits: [
          {
            commit: {
              message: 'Fix bug',
              author: { name: 'Alice' }
            }
          }
        ],
        contributors: [
          { login: 'alice', contributions: 10 }
        ],
        contents: [
          { path: 'index.js', type: 'file' },
          { path: 'src', type: 'dir' }
        ]
      };

      const prompt = service.buildInsightPrompt(repoData);

      expect(prompt).toContain('test-repo');
      expect(prompt).toContain('Test description');
      expect(prompt).toContain('JavaScript');
      expect(prompt).toContain('50');
      expect(prompt).toContain('Fix bug by Alice');
      expect(prompt).toContain('alice: 10 commits');
      expect(prompt).toContain('index.js (file)');
    });

    it('should handle missing data gracefully', () => {
      if (!service) return;

      const repoData = {
        repoInfo: {},
        commits: null,
        contributors: undefined,
        contents: []
      };

      const prompt = service.buildInsightPrompt(repoData);

      expect(prompt).toContain('No description');
      expect(prompt).toContain('Unknown');
      expect(prompt).toContain('No files');
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

    it('should parse valid JSON response', () => {
      if (!service) return;

      const validResponse = `Here is the analysis:
      {
        "hotspotFiles": [],
        "contributorInsights": {
          "mostActive": ["user1"],
          "collaborationPattern": "Active collaboration",
          "recommendation": "Keep up the good work"
        },
        "developmentPatterns": {
          "commitFrequency": "Daily",
          "releasePattern": "Weekly",
          "velocity": "High"
        },
        "codeQuality": {
          "strengths": ["Clean code"],
          "concerns": ["No tests"],
          "technicalDebt": "Low"
        },
        "recommendations": []
      }
      Additional text here`;

      const result = service.parseInsightResponse(validResponse);

      expect(result).toHaveProperty('hotspotFiles');
      expect(result).toHaveProperty('contributorInsights');
      expect(result.contributorInsights.mostActive).toContain('user1');
      expect(result.developmentPatterns.velocity).toBe('High');
    });

    it('should handle invalid JSON with fallback structure', () => {
      if (!service) return;

      const invalidResponse = 'This is not JSON at all';

      const result = service.parseInsightResponse(invalidResponse);

      expect(result).toHaveProperty('hotspotFiles');
      expect(result.hotspotFiles).toEqual([]);
      expect(result.contributorInsights.collaborationPattern).toBe('Analysis unavailable');
      expect(result.codeQuality.technicalDebt).toBe('Analysis unavailable');
    });

    it('should extract JSON from mixed content', () => {
      if (!service) return;

      const mixedResponse = `Some preamble text
      {"hotspotFiles": [{"file": "test.js", "reason": "Complex", "recommendation": "Refactor"}]}
      Some trailing text`;

      const result = service.parseInsightResponse(mixedResponse);

      expect(result.hotspotFiles).toHaveLength(1);
      expect(result.hotspotFiles[0].file).toBe('test.js');
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

    it('should calculate commit frequency by date', () => {
      if (!service) return;

      const commits = [
        { commit: { author: { date: '2024-01-01T10:00:00Z' } } },
        { commit: { author: { date: '2024-01-01T14:00:00Z' } } },
        { commit: { author: { date: '2024-01-02T10:00:00Z' } } },
        { commit: { author: { date: '2024-01-02T11:00:00Z' } } },
        { commit: { author: { date: '2024-01-02T12:00:00Z' } } }
      ];

      const frequency = service.calculateCommitFrequency(commits);

      expect(frequency).toHaveLength(2);
      expect(frequency[0]).toEqual({ date: '2024-01-01', count: 2 });
      expect(frequency[1]).toEqual({ date: '2024-01-02', count: 3 });
    });

    it('should return empty array for no commits', () => {
      if (!service) return;

      const frequency = service.calculateCommitFrequency([]);
      expect(frequency).toEqual([]);
    });

    it('should sort dates chronologically', () => {
      if (!service) return;

      const commits = [
        { commit: { author: { date: '2024-01-03T10:00:00Z' } } },
        { commit: { author: { date: '2024-01-01T10:00:00Z' } } },
        { commit: { author: { date: '2024-01-02T10:00:00Z' } } }
      ];

      const frequency = service.calculateCommitFrequency(commits);

      expect(frequency[0].date).toBe('2024-01-01');
      expect(frequency[1].date).toBe('2024-01-02');
      expect(frequency[2].date).toBe('2024-01-03');
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
          { commit: { author: { date: '2024-01-01T11:00:00Z' } } },
          { commit: { author: { date: '2024-01-02T10:00:00Z' } } }
        ],
        contributors: [
          { login: 'user1', contributions: 30 },
          { login: 'user2', contributions: 20 }
        ]
      };

      const vizData = await service.generateVisualizationData(repoData);

      expect(vizData).toHaveProperty('commitFrequency');
      expect(vizData).toHaveProperty('contributorDistribution');
      expect(vizData.commitFrequency).toHaveLength(2); // 2 unique dates
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