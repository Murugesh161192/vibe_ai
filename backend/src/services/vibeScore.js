/**
 * Comprehensive Vibe Score Calculator
 * Calculates repository vibe scores based on twelve weighted metrics for enterprise-grade validation:
 * - Code Quality (20%): Test coverage, code complexity, best practices
 * - Readability/Documentation (12%): README, comments, API docs
 * - Collaboration/Activity (15%): Commits, contributors, community health
 * - Innovation/Creativity (8%): Modern frameworks, dependencies
 * - Maintainability (8%): Folder structure, dependency management
 * - Inclusivity (5%): Multilingual docs, accessibility
 * - Security & Safety (12%): Security practices, vulnerability scanning
 * - Performance & Scalability (8%): Performance considerations, optimization
 * - Testing Quality (6%): Test coverage, CI/CD, quality assurance
 * - Community Health (4%): Issue response, PR quality, guidelines
 * - Code Health (4%): Technical debt, code smells, refactoring
 * - Release Management (3%): Release frequency, versioning, changelog
 */
export class VibeScoreCalculator {
  constructor() {
    // Define weights for each metric (must sum to 100)
    this.weights = {
      codeQuality: 16,
      readability: 12,
      collaboration: 15,
      innovation: 8,
      maintainability: 8,
      inclusivity: 5,
      security: 12,
      performance: 8,
      testingQuality: 6,
      communityHealth: 4,
      codeHealth: 4,
      releaseManagement: 2
    };
    
    // Validate weights sum to 100
    const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      throw new Error(`Weights must sum to 100, got ${totalWeight}`);
    }
  }

  /**
   * Calculate the overall vibe score for a repository
   * @param {Object} data - Repository analysis data
   * @returns {Object} Vibe score object with total and breakdown
   */
  calculateVibeScore(data) {
    const {
      repoInfo,
      contents,
      commits,
      languageAnalysis,
      securityAnalysis,
      performanceAnalysis,
      communityAnalysis
    } = data;

    // Calculate individual metric scores
    const codeQualityScore = this.calculateCodeQualityScore(languageAnalysis, contents);
    const readabilityScore = this.calculateReadabilityScore(languageAnalysis, repoInfo);
    const collaborationScore = this.calculateCollaborationScore(commits, data.contributors, repoInfo);
    const innovationScore = this.calculateInnovationScore(languageAnalysis, repoInfo);
    const maintainabilityScore = this.calculateMaintainabilityScore(languageAnalysis, contents);
    const inclusivityScore = this.calculateInclusivityScore(languageAnalysis);
    
    // New comprehensive metrics
    const securityScore = this.calculateSecurityScore(securityAnalysis, languageAnalysis);
    const performanceScore = this.calculatePerformanceScore(performanceAnalysis, languageAnalysis);
    const testingQualityScore = this.calculateTestingQualityScore(languageAnalysis, contents);
    const communityHealthScore = this.calculateCommunityHealthScore(communityAnalysis, repoInfo);
    const codeHealthScore = this.calculateCodeHealthScore(languageAnalysis, contents);
    const releaseManagementScore = this.calculateReleaseManagementScore(repoInfo, commits);

    // Calculate weighted total score
    const totalScore = Math.round(
      (codeQualityScore * this.weights.codeQuality +
       readabilityScore * this.weights.readability +
       collaborationScore * this.weights.collaboration +
       innovationScore * this.weights.innovation +
       maintainabilityScore * this.weights.maintainability +
       inclusivityScore * this.weights.inclusivity +
       securityScore * this.weights.security +
       performanceScore * this.weights.performance +
       testingQualityScore * this.weights.testingQuality +
       communityHealthScore * this.weights.communityHealth +
       codeHealthScore * this.weights.codeHealth +
       releaseManagementScore * this.weights.releaseManagement) / 100
    );

    return {
      total: Math.min(100, Math.max(0, totalScore)), // Ensure score is between 0-100
      breakdown: {
        codeQuality: codeQualityScore,
        readability: readabilityScore,
        collaboration: collaborationScore,
        innovation: innovationScore,
        maintainability: maintainabilityScore,
        inclusivity: inclusivityScore,
        security: securityScore,
        performance: performanceScore,
        testingQuality: testingQualityScore,
        communityHealth: communityHealthScore,
        codeHealth: codeHealthScore,
        releaseManagement: releaseManagementScore
      },
      weights: this.weights
    };
  }

  /**
   * Calculate Code Quality score (30% weight)
   * Based on test coverage, code complexity, and best practices
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Array} contents - Repository contents
   * @returns {number} Score from 0-100
   */
  calculateCodeQualityScore(languageAnalysis, contents) {
    let score = 0;
    
    // Test file presence (40% of code quality score)
    const testFiles = languageAnalysis.testFiles || [];
    const hasTestFiles = testFiles.length > 0;
    const testFileRatio = testFiles.length / Math.max(1, contents.length);
    
    if (hasTestFiles) {
      score += 40; // Base score for having tests
      score += Math.min(20, testFileRatio * 100); // Bonus for good test coverage
    }
    
    // Code complexity analysis (30% of code quality score)
    const avgFileSize = this.calculateAverageFileSize(contents);
    if (avgFileSize < 500) {
      score += 30; // Small files are generally better
    } else if (avgFileSize < 1000) {
      score += 20;
    } else if (avgFileSize < 2000) {
      score += 10;
    }
    
    // Best practices (30% of code quality score)
    const hasGitignore = contents.some(file => file.name === '.gitignore');
    const hasLicense = contents.some(file => file.name.toLowerCase().includes('license'));
    const hasConfigFiles = contents.some(file => 
      file.name.includes('config') || file.name.includes('setup')
    );
    
    if (hasGitignore) score += 10;
    if (hasLicense) score += 10;
    if (hasConfigFiles) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Calculate Readability/Documentation score (20% weight)
   * Based on README quality, comment density, and documentation
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Object} repoInfo - Repository information
   * @returns {number} Score from 0-100
   */
  calculateReadabilityScore(languageAnalysis, repoInfo) {
    let score = 0;
    
    // README presence and quality (50% of readability score)
    const documentationFiles = languageAnalysis.documentationFiles || [];
    const hasReadme = documentationFiles.some(file => 
      file.toLowerCase().includes('readme')
    );
    const hasMultipleDocs = documentationFiles.length > 1;
    
    if (hasReadme) {
      score += 30; // Base score for README
      if (hasMultipleDocs) score += 20; // Bonus for additional docs
    }
    
    // Repository description (20% of readability score)
    if (repoInfo.description && repoInfo.description.length > 10) {
      score += 20;
    }
    
    // Comment density analysis (30% of readability score)
    const commentDensity = languageAnalysis.commentDensity || 0;
    if (commentDensity > 0.1) {
      score += 30; // Good comment density
    } else if (commentDensity > 0.05) {
      score += 20;
    } else if (commentDensity > 0.02) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Collaboration/Activity score (25% weight)
   * Based on commit frequency and community engagement
   * @param {Array} commits - Commit history
   * @param {Array} contributors - List of contributors
   * @param {Object} repoInfo - Repository information
   * @returns {number} Score from 0-100
   */
  calculateCollaborationScore(commits, contributors, repoInfo) {
    let score = 0;
    
    // Commit frequency (40% of collaboration score)
    const commitCount = commits.length;
    const daysSinceCreation = this.calculateDaysSince(repoInfo.created_at);
    const commitsPerDay = commitCount / Math.max(1, daysSinceCreation);
    
    if (commitsPerDay > 1) {
      score += 40; // Very active
    } else if (commitsPerDay > 0.5) {
      score += 30; // Active
    } else if (commitsPerDay > 0.1) {
      score += 20; // Moderate activity
    } else if (commitsPerDay > 0.01) {
      score += 10; // Some activity
    }
    
    // Repository activity (35% of collaboration score)
    const daysSinceLastUpdate = this.calculateDaysSince(repoInfo.updated_at);
    if (daysSinceLastUpdate < 7) {
      score += 35; // Very recent activity
    } else if (daysSinceLastUpdate < 30) {
      score += 25;
    } else if (daysSinceLastUpdate < 90) {
      score += 15;
    } else if (daysSinceLastUpdate < 365) {
      score += 10;
    }

    // Contributor count (25% of collaboration score)
    const contributorCount = contributors.length;
    if (contributorCount > 20) {
      score += 25; // High number of contributors
    } else if (contributorCount > 10) {
      score += 20;
    } else if (contributorCount > 3) {
      score += 15;
    } else if (contributorCount > 0) {
      score += 10;
    }
    
    // Community engagement (25% of collaboration score)
    const stars = repoInfo.stargazers_count || 0;
    const forks = repoInfo.forks_count || 0;
    
    if (stars > 1000) {
      score += 25; // Very popular
    } else if (stars > 100) {
      score += 20;
    } else if (stars > 10) {
      score += 15;
    } else if (stars > 0) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Innovation/Creativity score (15% weight)
   * Based on modern frameworks, dependencies, and technology choices
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Object} repoInfo - Repository information
   * @returns {number} Score from 0-100
   */
  calculateInnovationScore(languageAnalysis, repoInfo) {
    let score = 0;
    
    // Modern frameworks and dependencies (60% of innovation score)
    const dependencies = languageAnalysis.dependencies || [];
    const modernFrameworks = this.identifyModernFrameworks(dependencies);
    
    score += Math.min(60, modernFrameworks.length * 15); // 15 points per modern framework
    
    // Technology stack diversity (40% of innovation score)
    const languages = languageAnalysis.languages || {};
    const languageCount = Object.keys(languages).length;
    
    if (languageCount > 3) {
      score += 40; // Multi-language project
    } else if (languageCount > 1) {
      score += 25; // Multiple languages
    } else if (languageCount === 1) {
      score += 15; // Single language
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Maintainability score (10% weight)
   * Based on folder structure, dependency management, and code organization
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Array} contents - Repository contents
   * @returns {number} Score from 0-100
   */
  calculateMaintainabilityScore(languageAnalysis, contents) {
    let score = 0;
    
    // Folder structure (50% of maintainability score)
    const folderStructure = languageAnalysis.folderStructure || [];
    const hasSrcFolder = folderStructure.some(folder => folder.toLowerCase().includes('src'));
    const hasTestFolder = folderStructure.some(folder => folder.toLowerCase().includes('test'));
    const hasDocsFolder = folderStructure.some(folder => folder.toLowerCase().includes('doc'));
    
    if (hasSrcFolder) score += 20;
    if (hasTestFolder) score += 20;
    if (hasDocsFolder) score += 10;
    
    // Dependency management (30% of maintainability score)
    const hasPackageManager = languageAnalysis.hasPackageManager || false;
    const hasLockFile = languageAnalysis.hasLockFile || false;
    
    if (hasPackageManager) score += 20;
    if (hasLockFile) score += 10;
    
    // Code organization (20% of maintainability score)
    const fileCount = contents.length;
    if (fileCount < 50) {
      score += 20; // Well-organized, not too many files
    } else if (fileCount < 100) {
      score += 15;
    } else if (fileCount < 200) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Inclusivity score (10% weight)
   * Based on multilingual documentation and accessibility
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @returns {number} Score from 0-100
   */
  calculateInclusivityScore(languageAnalysis) {
    let score = 0;
    
    // Multilingual documentation (40% of inclusivity score)
    const documentationFiles = languageAnalysis.documentationFiles || [];
    const multilingualDocs = documentationFiles.filter(file => 
      file.toLowerCase().includes('readme') && 
      (file.toLowerCase().includes('es') || file.toLowerCase().includes('fr') || 
       file.toLowerCase().includes('de') || file.toLowerCase().includes('ja') ||
       file.toLowerCase().includes('zh') || file.toLowerCase().includes('ko'))
    );
    
    score += Math.min(40, multilingualDocs.length * 20);
    
    // Documentation accessibility (60% of inclusivity score)
    const hasAccessibleDocs = documentationFiles.some(file => 
      file.toLowerCase().includes('accessibility') || 
      file.toLowerCase().includes('a11y') ||
      file.toLowerCase().includes('contributing') ||
      file.toLowerCase().includes('code-of-conduct')
    );
    
    if (hasAccessibleDocs) {
      score += 60;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate average file size for complexity analysis
   * @param {Array} contents - Repository contents
   * @returns {number} Average file size in lines
   */
  calculateAverageFileSize(contents) {
    const files = contents.filter(item => item.type === 'file');
    if (files.length === 0) return 0;
    
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    return totalSize / files.length;
  }

  /**
   * Calculate days since a given date
   * @param {string} dateString - ISO date string
   * @returns {number} Number of days
   */
  calculateDaysSince(dateString) {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Identify modern frameworks in dependencies
   * @param {Array} dependencies - List of dependency names
   * @returns {Array} Array of modern framework names
   */
  identifyModernFrameworks(dependencies) {
    const modernFrameworks = [
      // JavaScript/TypeScript
      'react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'solid',
      'express', 'fastify', 'koa', 'nest', 'prisma', 'graphql',
      // Python
      'django', 'flask', 'fastapi', 'pydantic', 'sqlalchemy', 'celery',
      // Java
      'spring', 'quarkus', 'micronaut', 'junit', 'mockito',
      // Go
      'gin', 'echo', 'fiber', 'gorm', 'testify',
      // Other
      'docker', 'kubernetes', 'terraform', 'ansible'
    ];
    
    return dependencies.filter(dep => 
      modernFrameworks.some(framework => 
        dep.toLowerCase().includes(framework.toLowerCase())
      )
    );
  }

  /**
   * Calculate Security & Safety score (12% weight)
   * Based on security practices, vulnerability scanning, and safety measures
   * @param {Object} securityAnalysis - Security analysis results
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @returns {number} Score from 0-100
   */
  calculateSecurityScore(securityAnalysis = {}, languageAnalysis) {
    let score = 0;
    
    // Use security analysis results if available, otherwise fallback to basic checks
    if (securityAnalysis && securityAnalysis.files) {
      const allFiles = securityAnalysis.files;
      
      // Security configuration files (30% of security score)
      const securityFiles = [
        '.security', 'security.md', 'security.yml', 'security.yaml',
        '.github/security.yml', '.github/security.yaml',
        'SECURITY.md', 'SECURITY.txt'
      ];
      
      const hasSecurityConfig = securityFiles.some(file => 
        allFiles.some(f => f.toLowerCase().includes(file.toLowerCase()))
      );
      
      if (hasSecurityConfig) {
        score += 30;
      }
      
      // Code security practices (25% of security score)
      const securityKeywords = ['input validation', 'sanitize', 'escape', 'csrf', 'xss', 'sql injection'];
      const hasSecurityPractices = securityKeywords.some(keyword => 
        allFiles.some(file => file.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (hasSecurityPractices) {
        score += 25;
      }
      
      // License compliance (20% of security score)
      const licenseFiles = ['license', 'licence', 'copying', 'copyright'];
      const hasLicense = licenseFiles.some(file => 
        allFiles.some(f => f.toLowerCase().includes(file.toLowerCase()))
      );
      
      if (hasLicense) {
        score += 20;
      }
    }
    
    // Dependency security (25% of security score)
    const dependencies = languageAnalysis.dependencies || [];
    const securityTools = ['snyk', 'dependabot', 'npm audit', 'yarn audit', 'safety'];
    const hasSecurityTools = securityTools.some(tool => 
      dependencies.some(dep => dep.toLowerCase().includes(tool.toLowerCase()))
    );
    
    if (hasSecurityTools) {
      score += 25;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Performance & Scalability score (8% weight)
   * Based on performance considerations, optimization practices, and scalability
   * @param {Object} performanceAnalysis - Performance analysis results
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @returns {number} Score from 0-100
   */
  calculatePerformanceScore(performanceAnalysis = {}, languageAnalysis) {
    let score = 0;
    
    // Use performance analysis results if available, otherwise fallback to basic checks
    if (performanceAnalysis && performanceAnalysis.files) {
      const allFiles = performanceAnalysis.files;
      
      // Caching strategies (25% of performance score)
      const cachingKeywords = ['cache', 'redis', 'memcached', 'lru', 'ttl'];
      const hasCaching = cachingKeywords.some(keyword => 
        allFiles.some(file => file.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (hasCaching) {
        score += 25;
      }
      
      // Database optimization (25% of performance score)
      const dbKeywords = ['index', 'query optimization', 'connection pooling', 'migration'];
      const hasDbOptimization = dbKeywords.some(keyword => 
        allFiles.some(file => file.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (hasDbOptimization) {
        score += 25;
      }
      
      // Load balancing and scaling (20% of performance score)
      const scalingKeywords = ['load balancer', 'horizontal scaling', 'vertical scaling', 'auto-scaling'];
      const hasScaling = scalingKeywords.some(keyword => 
        allFiles.some(file => file.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (hasScaling) {
        score += 20;
      }
    }
    
    // Performance monitoring (30% of performance score)
    const performanceTools = ['prometheus', 'grafana', 'newrelic', 'datadog', 'sentry'];
    const dependencies = languageAnalysis.dependencies || [];
    const hasPerformanceMonitoring = performanceTools.some(tool => 
      dependencies.some(dep => dep.toLowerCase().includes(tool.toLowerCase()))
    );
    
    if (hasPerformanceMonitoring) {
      score += 30;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Testing Quality score (6% weight)
   * Based on test coverage, CI/CD, and quality assurance practices
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Array} contents - Repository contents
   * @returns {number} Score from 0-100
   */
  calculateTestingQualityScore(languageAnalysis, contents) {
    let score = 0;
    
    // Test coverage tools (30% of testing quality score)
    const coverageTools = ['jest', 'mocha', 'pytest', 'coverage', 'istanbul', 'nyc'];
    const dependencies = languageAnalysis.dependencies || [];
    const hasCoverageTools = coverageTools.some(tool => 
      dependencies.some(dep => dep.toLowerCase().includes(tool.toLowerCase()))
    );
    
    if (hasCoverageTools) {
      score += 30;
    }
    
    // CI/CD pipeline (30% of testing quality score)
    const ciFiles = ['.github/workflows', '.gitlab-ci.yml', '.travis.yml', '.circleci', 'jenkins'];
    const hasCI = ciFiles.some(file => 
      contents.some(f => f.name.toLowerCase().includes(file.toLowerCase()))
    );
    
    if (hasCI) {
      score += 30;
    }
    
    // Integration tests (20% of testing quality score)
    const integrationTestFiles = languageAnalysis.testFiles?.filter(file => 
      file.toLowerCase().includes('integration') || file.toLowerCase().includes('e2e') ||
      file.toLowerCase().includes('end-to-end')
    ) || [];
    
    if (integrationTestFiles.length > 0) {
      score += 20;
    }
    
    // Code quality tools (20% of testing quality score)
    const qualityTools = ['eslint', 'prettier', 'black', 'flake8', 'sonarqube', 'codeclimate'];
    const hasQualityTools = qualityTools.some(tool => 
      dependencies.some(dep => dep.toLowerCase().includes(tool.toLowerCase()))
    );
    
    if (hasQualityTools) {
      score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Community Health score (4% weight)
   * Based on issue response, PR quality, and community guidelines
   * @param {Object} communityAnalysis - Community analysis results
   * @param {Object} repoInfo - Repository information
   * @returns {number} Score from 0-100
   */
  calculateCommunityHealthScore(communityAnalysis = {}, repoInfo) {
    let score = 0;
    
    // Community guidelines (40% of community health score)
    const guidelineFiles = ['contributing.md', 'code-of-conduct', 'community.md', 'guidelines.md'];
    const hasGuidelines = guidelineFiles.some(file => 
      communityAnalysis.files?.some(f => f.toLowerCase().includes(file.toLowerCase()))
    );
    
    if (hasGuidelines) {
      score += 40;
    }
    
    // Issue templates (30% of community health score)
    const issueTemplates = ['.github/issue_template', '.github/ISSUE_TEMPLATE'];
    const hasIssueTemplates = issueTemplates.some(template => 
      communityAnalysis.files?.some(f => f.toLowerCase().includes(template.toLowerCase()))
    );
    
    if (hasIssueTemplates) {
      score += 30;
    }
    
    // PR templates (30% of community health score)
    const prTemplates = ['.github/pull_request_template', '.github/PULL_REQUEST_TEMPLATE'];
    const hasPRTemplates = prTemplates.some(template => 
      communityAnalysis.files?.some(f => f.toLowerCase().includes(template.toLowerCase()))
    );
    
    if (hasPRTemplates) {
      score += 30;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Code Health score (4% weight)
   * Based on technical debt, code smells, and refactoring patterns
   * @param {Object} languageAnalysis - Language-specific analysis results
   * @param {Array} contents - Repository contents
   * @returns {number} Score from 0-100
   */
  calculateCodeHealthScore(languageAnalysis, contents) {
    let score = 0;
    
    // Code complexity analysis (40% of code health score)
    const avgFileSize = this.calculateAverageFileSize(contents);
    if (avgFileSize < 300) {
      score += 40; // Small, focused files
    } else if (avgFileSize < 600) {
      score += 30;
    } else if (avgFileSize < 1000) {
      score += 20;
    }
    
    // Refactoring indicators (30% of code health score)
    const refactoringKeywords = ['refactor', 'cleanup', 'optimize', 'simplify'];
    const hasRefactoring = refactoringKeywords.some(keyword => 
      contents.some(file => file.name.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (hasRefactoring) {
      score += 30;
    }
    
    // Documentation quality (30% of code health score)
    const docFiles = languageAnalysis.documentationFiles || [];
    const codeFiles = contents.filter(item => item.type === 'file').length;
    const docRatio = docFiles.length / Math.max(1, codeFiles);
    
    if (docRatio > 0.1) {
      score += 30; // Good documentation ratio
    } else if (docRatio > 0.05) {
      score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Release Management score (3% weight)
   * Based on release frequency, versioning, and changelog practices
   * @param {Object} repoInfo - Repository information
   * @param {Array} commits - Repository commits
   * @returns {number} Score from 0-100
   */
  calculateReleaseManagementScore(repoInfo, commits) {
    let score = 0;
    
    // Release frequency (40% of release management score)
    const daysSinceCreated = this.calculateDaysSince(repoInfo.created_at);
    const commitFrequency = commits.length / Math.max(1, daysSinceCreated / 30); // commits per month
    
    if (commitFrequency > 10) {
      score += 40; // Active development
    } else if (commitFrequency > 5) {
      score += 30;
    } else if (commitFrequency > 2) {
      score += 20;
    }
    
    // Versioning practices (30% of release management score)
    const versioningKeywords = ['version', 'release', 'changelog', 'semver'];
    const hasVersioning = versioningKeywords.some(keyword => 
      commits.some(commit => commit.message?.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (hasVersioning) {
      score += 30;
    }
    
    // Release documentation (30% of release management score)
    const releaseFiles = ['changelog', 'release-notes', 'version-history'];
    const hasReleaseDocs = releaseFiles.some(file => 
      repoInfo.description?.toLowerCase().includes(file.toLowerCase()) ||
      commits.some(commit => commit.message?.toLowerCase().includes(file.toLowerCase()))
    );
    
    if (hasReleaseDocs) {
      score += 30;
    }
    
    return Math.min(100, score);
  }
}