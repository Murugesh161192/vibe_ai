// Jest globals are available without import in test environment
import { VibeScoreCalculator } from '../src/services/vibeScore.js';
import { LanguageAnalyzer } from '../src/services/languageAnalyzer.js';

describe('VibeScoreCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new VibeScoreCalculator();
  });

  describe('calculateVibeScore', () => {
    it('should calculate total score correctly', () => {
      const mockData = {
        repoInfo: {
          stargazers_count: 100,
          forks_count: 50,
          created_at: '2023-01-01T00:00:00Z',
          description: 'A test repository'
        },
        contents: [
          { name: 'test.js', type: 'file', size: 100 },
          { name: 'README.md', type: 'file', size: 200 }
        ],
        commits: Array(50).fill({}),
        contributors: Array(5).fill({}),
        languageAnalysis: {
          testFiles: ['test.js'],
          documentationFiles: ['README.md'],
          dependencies: ['react', 'express'],
          folderStructure: ['src', 'tests'],
          commentDensity: 0.1,
          languages: { JavaScript: 1000 },
          hasPackageManager: true,
          hasLockFile: true
        }
      };

      const result = calculator.calculateVibeScore(mockData);
      
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(100);
      expect(result.breakdown).toHaveProperty('codeQuality');
      expect(result.breakdown).toHaveProperty('readability');
      expect(result.breakdown).toHaveProperty('collaboration');
      expect(result.breakdown).toHaveProperty('innovation');
      expect(result.breakdown).toHaveProperty('maintainability');
      expect(result.breakdown).toHaveProperty('inclusivity');
    });

    it('should handle empty data gracefully', () => {
      const mockData = {
        repoInfo: {},
        contents: [],
        commits: [],
        contributors: [],
        languageAnalysis: {}
      };

      const result = calculator.calculateVibeScore(mockData);
      
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateCodeQualityScore', () => {
    it('should give high score for repositories with tests', () => {
      const languageAnalysis = {
        testFiles: ['test1.js', 'test2.js', 'spec.js'],
        commentDensity: 0.05
      };
      const contents = [
        { name: '.gitignore', type: 'file' },
        { name: 'LICENSE', type: 'file' },
        { name: 'config.json', type: 'file' }
      ];

      const score = calculator.calculateCodeQualityScore(languageAnalysis, contents);
      
      expect(score).toBeGreaterThan(50);
    });

    it('should give low score for repositories without tests', () => {
      const languageAnalysis = {
        testFiles: [],
        commentDensity: 0.01
      };
      const contents = [
        { name: 'main.js', type: 'file', size: 1000 }
      ];

      const score = calculator.calculateCodeQualityScore(languageAnalysis, contents);
      
      expect(score).toBeLessThan(50);
    });
  });

  describe('calculateReadabilityScore', () => {
    it('should give high score for well-documented repositories', () => {
      const languageAnalysis = {
        documentationFiles: ['README.md', 'CONTRIBUTING.md', 'API.md'],
        commentDensity: 0.15
      };
      const repoInfo = {
        description: 'A comprehensive test repository with excellent documentation'
      };

      const score = calculator.calculateReadabilityScore(languageAnalysis, repoInfo);
      
      expect(score).toBeGreaterThan(60);
    });
  });

  describe('calculateCollaborationScore', () => {
    it('should give high score for active repositories', () => {
      const commits = Array(200).fill({});
      const contributors = Array(15).fill({});
      const repoInfo = {
        stargazers_count: 1000,
        forks_count: 200,
        created_at: '2022-01-01T00:00:00Z'
      };

      const score = calculator.calculateCollaborationScore(commits, contributors, repoInfo);
      
      expect(score).toBeGreaterThanOrEqual(60);
    });
  });
});

describe('LanguageAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new LanguageAnalyzer();
  });

  describe('findTestFiles', () => {
    it('should identify test files correctly', () => {
      const contents = [
        { name: 'test.js', type: 'file', path: 'test.js' },
        { name: 'spec.js', type: 'file', path: 'spec.js' },
        { name: 'main.js', type: 'file', path: 'main.js' },
        { name: 'test_main.py', type: 'file', path: 'test_main.py' }
      ];

      const config = {
        testPatterns: ['test', 'spec'],
        extensions: ['.js', '.py']
      };

      const testFiles = analyzer.findTestFiles(contents, config);
      
      expect(testFiles).toContain('test.js');
      expect(testFiles).toContain('spec.js');
      expect(testFiles).toContain('test_main.py');
      expect(testFiles).not.toContain('main.js');
    });
  });

  describe('findDocumentationFiles', () => {
    it('should identify documentation files correctly', () => {
      const contents = [
        { name: 'README.md', type: 'file', path: 'README.md' },
        { name: 'docs/guide.md', type: 'file', path: 'docs/guide.md' },
        { name: 'main.js', type: 'file', path: 'main.js' },
        { name: 'LICENSE', type: 'file', path: 'LICENSE' }
      ];

      const docFiles = analyzer.findDocumentationFiles(contents);
      
      expect(docFiles).toContain('README.md');
      expect(docFiles).toContain('docs/guide.md');
      expect(docFiles).toContain('LICENSE');
      expect(docFiles).not.toContain('main.js');
    });
  });

  describe('extractDependencies', () => {
    it('should extract dependencies from package.json', () => {
      const content = JSON.stringify({
        dependencies: {
          'react': '^18.0.0',
          'express': '^4.18.0'
        },
        devDependencies: {
          'jest': '^29.0.0'
        }
      });

      const dependencies = analyzer.extractDependencies(content, 'package.json');
      
      expect(dependencies).toContain('react');
      expect(dependencies).toContain('express');
      expect(dependencies).toContain('jest');
    });

    it('should extract dependencies from requirements.txt', () => {
      const content = `
        flask==2.3.0
        pytest==7.4.0
        requests>=2.28.0
      `;

      const dependencies = analyzer.extractDependencies(content, 'requirements.txt');
      
      expect(dependencies).toContain('flask');
      expect(dependencies).toContain('pytest');
      expect(dependencies).toContain('requests');
    });
  });
}); 