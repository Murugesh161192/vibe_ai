import { GitHubService } from './github.js';
import { VibeScoreCalculator } from './vibeScore.js';
import { LanguageAnalyzer } from './languageAnalyzer.js';

/**
 * Main repository analyzer service
 * Orchestrates the analysis of GitHub repositories and calculates vibe scores
 */
export class RepositoryAnalyzer {
  constructor() {
    this.githubService = new GitHubService();
    this.vibeCalculator = new VibeScoreCalculator();
    this.languageAnalyzer = new LanguageAnalyzer();
  }

  /**
   * Calculate score from pre-fetched data (simplified version)
   * Used by the analyze route when data is already fetched
   * @param {Object} data - Pre-fetched repository data
   * @returns {Object} Vibe score object
   */
  calculateScore(data) {
    const { repoInfo, commits = [], contributors = [] } = data;
    
    // Create a simplified score based on available data
    // This is a simplified scoring for when we don't have full analysis
    
    // Basic metrics
    const hasReadme = !!repoInfo.size; // Simplified check
    const hasLicense = !!repoInfo.license;
    const starCount = repoInfo.stargazers_count || 0;
    const forkCount = repoInfo.forks_count || 0;
    const openIssues = repoInfo.open_issues_count || 0;
    const contributorCount = contributors.length || 0;
    const commitCount = commits.length || 0;
    
    // Calculate basic scores (0-100 scale)
    const popularityScore = Math.min(100, (starCount / 10) + (forkCount / 5));
    const activityScore = Math.min(100, (commitCount / 10) + (contributorCount * 5));
    const healthScore = Math.max(0, 100 - (openIssues / 10));
    const docsScore = (hasReadme ? 50 : 0) + (hasLicense ? 50 : 0);
    
    // Overall score (weighted average)
    const overallScore = Math.round(
      (popularityScore * 0.25) +
      (activityScore * 0.35) +
      (healthScore * 0.20) +
      (docsScore * 0.20)
    );
    
    return {
      overallScore,
      breakdown: {
        popularity: Math.round(popularityScore),
        activity: Math.round(activityScore),
        health: Math.round(healthScore),
        documentation: Math.round(docsScore)
      },
      metrics: {
        stars: starCount,
        forks: forkCount,
        contributors: contributorCount,
        commits: commitCount,
        openIssues: openIssues,
        hasReadme,
        hasLicense
      }
    };
  }

  /**
   * Analyze a GitHub repository and calculate its vibe score
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Object} Analysis result with vibe score and breakdown
   */
  async analyzeRepository(repoUrl) {
    try {
      // Extract repository owner and name from URL
      const { owner, repo } = this.extractRepoInfo(repoUrl);
      
      // Parallelize GitHub API calls for better performance
      const [repoInfo, contents, commits, contributors] = await Promise.all([
        this.githubService.getRepositoryInfo(owner, repo),
        this.githubService.getRepositoryContents(owner, repo),
        this.githubService.getCommitHistory(owner, repo),
        this.githubService.getContributors(owner, repo)
      ]);
      
      // Analyze repository based on detected language
      const languageAnalysis = await this.languageAnalyzer.analyzeLanguage(
        repoInfo.language,
        contents,
        owner,
        repo
      );
      
      // Parallelize analysis operations for better performance
      const [securityAnalysis, performanceAnalysis, communityAnalysis] = await Promise.all([
        this.performSecurityAnalysis(contents, languageAnalysis),
        this.performPerformanceAnalysis(contents, languageAnalysis),
        this.performCommunityAnalysis(contents, repoInfo)
      ]);
      
      // Calculate vibe score based on all collected data
      const vibeScore = this.vibeCalculator.calculateVibeScore({
        repoInfo,
        contents,
        commits,
        contributors,
        languageAnalysis,
        securityAnalysis,
        performanceAnalysis,
        communityAnalysis
      });
      
      // Log the vibeScore to verify all metrics are present
      console.log('📊 Calculated VibeScore with all metrics:');
      console.log('  Total score:', vibeScore.total);
      console.log('  Breakdown keys:', Object.keys(vibeScore.breakdown || {}));
      console.log('  Metrics count:', Object.keys(vibeScore.breakdown || {}).length);
      
      // Generate insights and recommendations
      const insights = this.generateInsights(vibeScore, languageAnalysis, repoInfo);
      
      return {
        repoInfo: {
          name: repoInfo.name,
          fullName: repoInfo.full_name,
          owner: owner, // Add the owner field here
          description: repoInfo.description,
          language: repoInfo.language,
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          openIssues: repoInfo.open_issues_count,
          watchers: repoInfo.watchers_count,
          contributors: contributors.length,
          createdAt: repoInfo.created_at,
          updatedAt: repoInfo.updated_at
        },
        vibeScore,
        analysis: {
          testFiles: languageAnalysis.testFiles,
          documentationFiles: languageAnalysis.documentationFiles,
          dependencies: languageAnalysis.dependencies,
          folderStructure: languageAnalysis.folderStructure,
          insights
        },
        contributors, // Add the full contributors array
        commits // Also include commits for better insights
      };
      
    } catch (error) {
      console.error('Repository analysis failed:', error);
      throw error;
    }
  }

  /**
   * Extract owner and repository name from GitHub URL
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Object} Object with owner and repo properties
   */
  extractRepoInfo(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    
    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  }

  /**
   * Perform security analysis on repository contents
   * @param {Array} contents - Repository contents
   * @param {Object} languageAnalysis - Language analysis results
   * @returns {Object} Security analysis results
   */
  async performSecurityAnalysis(contents, languageAnalysis) {
    const allFiles = contents.map(item => item.name);
    
    // Check for security-related files
    const securityFiles = allFiles.filter(file => 
      file.toLowerCase().includes('security') ||
      file.toLowerCase().includes('license') ||
      file.toLowerCase().includes('licence') ||
      file.toLowerCase().includes('copying') ||
      file.toLowerCase().includes('copyright')
    );
    
    // Check for security tools in dependencies
    const securityTools = languageAnalysis.dependencies?.filter(dep => 
      ['snyk', 'dependabot', 'npm audit', 'yarn audit', 'safety', 'bandit', 'semgrep'].some(tool => 
        dep.toLowerCase().includes(tool.toLowerCase())
      )
    ) || [];
    
    return {
      files: allFiles,
      securityFiles,
      securityTools,
      hasSecurityConfig: securityFiles.length > 0,
      hasSecurityTools: securityTools.length > 0
    };
  }

  /**
   * Perform performance analysis on repository contents
   * @param {Array} contents - Repository contents
   * @param {Object} languageAnalysis - Language analysis results
   * @returns {Object} Performance analysis results
   */
  async performPerformanceAnalysis(contents, languageAnalysis) {
    const allFiles = contents.map(item => item.name);
    
    // Check for performance monitoring tools
    const performanceTools = languageAnalysis.dependencies?.filter(dep => 
      ['prometheus', 'grafana', 'newrelic', 'datadog', 'sentry', 'statsd'].some(tool => 
        dep.toLowerCase().includes(tool.toLowerCase())
      )
    ) || [];
    
    // Check for caching and optimization files
    const performanceFiles = allFiles.filter(file => 
      file.toLowerCase().includes('cache') ||
      file.toLowerCase().includes('redis') ||
      file.toLowerCase().includes('memcached') ||
      file.toLowerCase().includes('optimization') ||
      file.toLowerCase().includes('performance')
    );
    
    return {
      files: allFiles,
      performanceTools,
      performanceFiles,
      hasPerformanceMonitoring: performanceTools.length > 0,
      hasOptimization: performanceFiles.length > 0
    };
  }

  /**
   * Perform community health analysis
   * @param {Array} contents - Repository contents
   * @param {Object} repoInfo - Repository information
   * @returns {Object} Community analysis results
   */
  async performCommunityAnalysis(contents, repoInfo) {
    const allFiles = contents.map(item => item.name);
    
    // Check for community-related files
    const communityFiles = allFiles.filter(file => 
      file.toLowerCase().includes('contributing') ||
      file.toLowerCase().includes('code-of-conduct') ||
      file.toLowerCase().includes('community') ||
      file.toLowerCase().includes('guidelines') ||
      file.toLowerCase().includes('issue_template') ||
      file.toLowerCase().includes('pull_request_template')
    );
    
    return {
      files: allFiles,
      communityFiles,
      hasGuidelines: communityFiles.some(file => 
        file.toLowerCase().includes('contributing') || file.toLowerCase().includes('code-of-conduct')
      ),
      hasTemplates: communityFiles.some(file => 
        file.toLowerCase().includes('template')
      )
    };
  }

  /**
   * Generate insights and recommendations based on analysis results
   * @param {Object} vibeScore - Calculated vibe score object
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Object} repoInfo - Repository information
   * @returns {Array} Array of insight strings
   */
  generateInsights(vibeScore, languageAnalysis, repoInfo) {
    const insights = [];
    
    // Code Quality insights
    if (vibeScore.breakdown.codeQuality < 50) {
      insights.push('Consider adding more test files to improve code quality');
    } else if (vibeScore.breakdown.codeQuality > 80) {
      insights.push('Excellent test coverage! Your code quality is outstanding');
    }
    
    // Readability insights
    if (vibeScore.breakdown.readability < 40) {
      insights.push('Adding more documentation and comments would improve readability');
    }
    
    // Collaboration insights
    if (vibeScore.breakdown.collaboration < 30) {
      insights.push('Consider encouraging more community contributions');
    }
    
    // Innovation insights
    if (vibeScore.breakdown.innovation > 70) {
      insights.push('Great use of modern frameworks and tools!');
    }
    
    // Maintainability insights
    if (vibeScore.breakdown.maintainability < 50) {
      insights.push('Consider improving folder structure and dependency management');
    }
    
    // Inclusivity insights
    if (vibeScore.breakdown.inclusivity < 40) {
      insights.push('Adding multilingual documentation could improve inclusivity');
    }
    
    // Overall score insights
    if (vibeScore.total > 80) {
      insights.push('🎉 This repository has excellent vibes! Keep up the great work!');
    } else if (vibeScore.total > 60) {
      insights.push('👍 Good vibes detected! There\'s room for improvement in some areas');
    } else {
      insights.push('💪 Every repository has potential! Focus on the areas with lower scores');
    }
    
    return insights;
  }
}

// Export singleton instance
export const repositoryAnalyzer = new RepositoryAnalyzer();

// Convenience function for direct usage
export async function analyzeRepository(repoUrl) {
  return await repositoryAnalyzer.analyzeRepository(repoUrl);
} 