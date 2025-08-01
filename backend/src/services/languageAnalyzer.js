import { githubService } from './github.js';

/**
 * Language-specific analyzer for repository analysis
 * Handles different programming languages and their specific patterns
 */
export class LanguageAnalyzer {
  constructor() {
    // Define language-specific patterns and configurations
    this.languageConfigs = {
      JavaScript: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        testPatterns: ['test', 'spec', '.test.', '.spec.'],
        commentPatterns: ['//', '/*', '*/'],
        dependencyFiles: ['package.json', 'yarn.lock', 'package-lock.json'],
        testFrameworks: ['jest', 'mocha', 'vitest', 'cypress', 'playwright'],
        buildTools: ['webpack', 'vite', 'rollup', 'parcel']
      },
      Python: {
        extensions: ['.py', '.pyw'],
        testPatterns: ['test_', '_test', 'test.py', 'spec.py'],
        commentPatterns: ['#', '"""', "'''"],
        dependencyFiles: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
        testFrameworks: ['pytest', 'unittest', 'nose', 'tox'],
        buildTools: ['poetry', 'pipenv', 'conda']
      },
      Java: {
        extensions: ['.java', '.kt'],
        testPatterns: ['Test', 'test', 'Spec', 'spec'],
        commentPatterns: ['//', '/*', '*/', '/**'],
        dependencyFiles: ['pom.xml', 'build.gradle', 'gradle.properties'],
        testFrameworks: ['junit', 'testng', 'mockito', 'spock'],
        buildTools: ['maven', 'gradle', 'ant']
      },
      Go: {
        extensions: ['.go'],
        testPatterns: ['_test.go', 'test_'],
        commentPatterns: ['//', '/*', '*/'],
        dependencyFiles: ['go.mod', 'go.sum'],
        testFrameworks: ['testing', 'testify', 'ginkgo'],
        buildTools: ['go', 'make']
      },
      TypeScript: {
        extensions: ['.ts', '.tsx'],
        testPatterns: ['test', 'spec', '.test.', '.spec.'],
        commentPatterns: ['//', '/*', '*/'],
        dependencyFiles: ['package.json', 'tsconfig.json'],
        testFrameworks: ['jest', 'mocha', 'vitest', 'cypress'],
        buildTools: ['webpack', 'vite', 'rollup', 'tsc']
      },
      CSharp: {
        extensions: ['.cs', '.csproj'],
        testPatterns: ['Test', 'test', 'Spec', 'spec'],
        commentPatterns: ['//', '/*', '*/', '///'],
        dependencyFiles: ['.csproj', 'packages.config', 'Directory.Build.props'],
        testFrameworks: ['nunit', 'xunit', 'mstest', 'moq'],
        buildTools: ['msbuild', 'dotnet', 'nuget']
      },
      Ruby: {
        extensions: ['.rb', '.erb'],
        testPatterns: ['_spec.rb', '_test.rb', 'spec_'],
        commentPatterns: ['#', '=begin', '=end'],
        dependencyFiles: ['Gemfile', 'Gemfile.lock', 'gemspec'],
        testFrameworks: ['rspec', 'minitest', 'cucumber'],
        buildTools: ['bundler', 'rake', 'gem']
      },
      PHP: {
        extensions: ['.php'],
        testPatterns: ['Test.php', 'test_', '_test'],
        commentPatterns: ['//', '/*', '*/', '#'],
        dependencyFiles: ['composer.json', 'composer.lock'],
        testFrameworks: ['phpunit', 'pest', 'codeception'],
        buildTools: ['composer', 'php']
      }
    };
  }

  /**
   * Analyze repository based on detected language
   * @param {string} language - Primary language detected by GitHub
   * @param {Array} contents - Repository contents
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Language-specific analysis results
   */
  async analyzeLanguage(language, contents, owner, repo) {
    const config = this.languageConfigs[language] || this.getGenericConfig();
    
    // Analyze repository structure and files
    const analysis = {
      testFiles: this.findTestFiles(contents, config),
      documentationFiles: this.findDocumentationFiles(contents),
      dependencies: await this.analyzeDependencies(contents, config, owner, repo),
      folderStructure: this.analyzeFolderStructure(contents),
      commentDensity: await this.calculateCommentDensity(contents, config, owner, repo),
      languages: await this.getLanguageBreakdown(owner, repo),
      hasPackageManager: this.hasPackageManager(contents, config),
      hasLockFile: this.hasLockFile(contents, config)
    };

    return analysis;
  }

  /**
   * Find test files in repository
   * @param {Array} contents - Repository contents
   * @param {Object} config - Language configuration
   * @returns {Array} Array of test file names
   */
  findTestFiles(contents, config) {
    const testFiles = [];
    
    for (const item of contents) {
      if (item.type === 'file') {
        const fileName = item.name.toLowerCase();
        const filePath = item.path.toLowerCase();
        
        // Check if file matches test patterns
        const isTestFile = config.testPatterns.some(pattern => 
          fileName.includes(pattern.toLowerCase()) || 
          filePath.includes(pattern.toLowerCase())
        );
        
        // Check if file is in test directory
        const isInTestDir = filePath.includes('test') || filePath.includes('spec');
        
        if (isTestFile || isInTestDir) {
          testFiles.push(item.path);
        }
      }
    }
    
    return testFiles;
  }

  /**
   * Find documentation files in repository
   * @param {Array} contents - Repository contents
   * @returns {Array} Array of documentation file names
   */
  findDocumentationFiles(contents) {
    const docFiles = [];
    const docPatterns = [
      'readme', 'docs', 'documentation', 'guide', 'tutorial',
      'changelog', 'contributing', 'license', 'code_of_conduct'
    ];
    
    for (const item of contents) {
      if (item.type === 'file') {
        const fileName = item.name.toLowerCase();
        const filePath = item.path.toLowerCase();
        
        const isDocFile = docPatterns.some(pattern => 
          fileName.includes(pattern) || filePath.includes(pattern)
        );
        
        if (isDocFile) {
          docFiles.push(item.path);
        }
      }
    }
    
    return docFiles;
  }

  /**
   * Analyze dependencies for the repository
   * @param {Array} contents - Repository contents
   * @param {Object} config - Language configuration
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Array} Array of dependency names
   */
  async analyzeDependencies(contents, config, owner, repo) {
    const dependencies = [];
    
    // Find dependency files
    const dependencyFiles = contents.filter(item => 
      item.type === 'file' && 
      config.dependencyFiles.some(depFile => 
        item.name.toLowerCase().includes(depFile.toLowerCase())
      )
    );
    
    // Analyze each dependency file
    for (const file of dependencyFiles) {
      try {
        const content = await githubService.getFileContent(owner, repo, file.path);
        const deps = this.extractDependencies(content, file.name, config);
        dependencies.push(...deps);
      } catch (error) {
        console.error(`Failed to analyze dependencies in ${file.path}:`, error.message);
      }
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Extract dependencies from file content
   * @param {string} content - File content
   * @param {string} fileName - File name
   * @param {Object} config - Language configuration
   * @returns {Array} Array of dependency names
   */
  extractDependencies(content, fileName, config) {
    const dependencies = [];
    
    try {
      if (fileName === 'package.json') {
        const packageJson = JSON.parse(content);
        if (packageJson.dependencies) {
          dependencies.push(...Object.keys(packageJson.dependencies));
        }
        if (packageJson.devDependencies) {
          dependencies.push(...Object.keys(packageJson.devDependencies));
        }
      } else if (fileName === 'requirements.txt') {
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const dep = trimmed.split('==')[0].split('>=')[0].split('<=')[0];
            dependencies.push(dep);
          }
        }
      } else if (fileName === 'pom.xml') {
        // Simple XML parsing for Maven dependencies
        const depMatches = content.match(/<artifactId>([^<]+)<\/artifactId>/g);
        if (depMatches) {
          depMatches.forEach(match => {
            const dep = match.replace(/<\/?artifactId>/g, '');
            dependencies.push(dep);
          });
        }
      } else if (fileName === 'go.mod') {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('\t') && !line.includes('//')) {
            const parts = line.trim().split(' ');
            if (parts.length > 0) {
              dependencies.push(parts[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to parse dependencies from ${fileName}:`, error.message);
    }
    
    return dependencies;
  }

  /**
   * Analyze folder structure of repository
   * @param {Array} contents - Repository contents
   * @returns {Array} Array of folder names
   */
  analyzeFolderStructure(contents) {
    const folders = [];
    
    for (const item of contents) {
      if (item.type === 'dir') {
        folders.push(item.name);
      }
    }
    
    return folders;
  }

  /**
   * Calculate comment density in source files
   * @param {Array} contents - Repository contents
   * @param {Object} config - Language configuration
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {number} Comment density ratio
   */
  async calculateCommentDensity(contents, config, owner, repo) {
    let totalLines = 0;
    let commentLines = 0;
    let filesAnalyzed = 0;
    
    // Sample up to 10 source files for analysis
    const sourceFiles = contents
      .filter(item => 
        item.type === 'file' && 
        config.extensions.some(ext => item.name.endsWith(ext))
      )
      .slice(0, 10);
    
    for (const file of sourceFiles) {
      try {
        const content = await githubService.getFileContent(owner, repo, file.path);
        const lines = content.split('\n');
        
        totalLines += lines.length;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (this.isCommentLine(trimmed, config)) {
            commentLines++;
          }
        }
        
        filesAnalyzed++;
      } catch (error) {
        console.error(`Failed to analyze comments in ${file.path}:`, error.message);
      }
    }
    
    return filesAnalyzed > 0 ? commentLines / totalLines : 0;
  }

  /**
   * Check if a line is a comment
   * @param {string} line - Line content
   * @param {Object} config - Language configuration
   * @returns {boolean} True if line is a comment
   */
  isCommentLine(line, config) {
    if (!line) return false;
    
    return config.commentPatterns.some(pattern => {
      if (pattern === '//') {
        return line.startsWith('//');
      } else if (pattern === '#') {
        return line.startsWith('#');
      } else if (pattern === '/*' || pattern === '*/') {
        return line.includes('/*') || line.includes('*/');
      }
      return false;
    });
  }

  /**
   * Get language breakdown for repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object} Language statistics
   */
  async getLanguageBreakdown(owner, repo) {
    try {
      return await githubService.getLanguages(owner, repo);
    } catch (error) {
      console.error(`Failed to get language breakdown for ${owner}/${repo}:`, error.message);
      return {};
    }
  }

  /**
   * Check if repository has package manager files
   * @param {Array} contents - Repository contents
   * @param {Object} config - Language configuration
   * @returns {boolean} True if package manager is present
   */
  hasPackageManager(contents, config) {
    return contents.some(item => 
      item.type === 'file' && 
      config.dependencyFiles.some(depFile => 
        item.name.toLowerCase().includes(depFile.toLowerCase())
      )
    );
  }

  /**
   * Check if repository has lock files
   * @param {Array} contents - Repository contents
   * @param {Object} config - Language configuration
   * @returns {boolean} True if lock file is present
   */
  hasLockFile(contents, config) {
    const lockFiles = ['package-lock.json', 'yarn.lock', 'Gemfile.lock', 'composer.lock', 'go.sum'];
    return contents.some(item => 
      item.type === 'file' && 
      lockFiles.some(lockFile => 
        item.name.toLowerCase().includes(lockFile.toLowerCase())
      )
    );
  }

  /**
   * Get generic configuration for unsupported languages
   * @returns {Object} Generic language configuration
   */
  getGenericConfig() {
    return {
      extensions: ['.txt', '.md', '.yml', '.yaml', '.json', '.xml'],
      testPatterns: ['test', 'spec'],
      commentPatterns: ['#', '//', '/*', '*/'],
      dependencyFiles: [],
      testFrameworks: [],
      buildTools: []
    };
  }
}

// Export singleton instance
export const languageAnalyzer = new LanguageAnalyzer(); 