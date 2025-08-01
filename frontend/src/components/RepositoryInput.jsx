import React, { useState } from 'react';
import { Github, AlertCircle, Zap, ExternalLink, Loader } from 'lucide-react';
import { validateRepoUrl } from '../services/api';

const RepositoryInput = ({ onAnalyze, error, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Handle input change and validate URL
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const url = e.target.value;
    setRepoUrl(url);
    
    // Clear validation errors when user starts typing
    if (errorMessage) {
      setErrorMessage('');
      setIsValid(true);
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedUrl = repoUrl.trim();
    
    if (!trimmedUrl) {
      setErrorMessage('Please enter a repository URL');
      setIsValid(false);
      return;
    }

    if (!validateRepoUrl(trimmedUrl)) {
      setErrorMessage('Please enter a valid GitHub repository URL');
      setIsValid(false);
      return;
    }

    setIsValid(true);
    setErrorMessage('');

    if (onAnalyze) {
      onAnalyze(trimmedUrl);
    }
  };

  /**
   * Handle example repository selection
   * @param {string} exampleUrl - Example repository URL
   */
  const handleExampleClick = (exampleUrl) => {
    setRepoUrl(exampleUrl);
    setIsValid(true);
    setErrorMessage('');
    if (onAnalyze) {
      onAnalyze(exampleUrl);
    }
  };

  const showValidation = error || (errorMessage && !isValid);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Input Card */}
      <div className="card-glass p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="icon-container icon-container-primary">
              <Github className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-heading-lg">
              Repository Analysis
            </h2>
          </div>
          <p className="text-body text-lg max-w-2xl mx-auto">
            Enter any public GitHub repository URL to discover its comprehensive vibe score
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Repository URL form">
          <div>
            <label htmlFor="repoUrl" className="block text-sm font-medium text-white/90 mb-3">
              Repository URL
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-white/60 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                id="repoUrl"
                type="url"
                value={repoUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repository"
                className={`input-glass pl-12 pr-4 py-4 ${!isValid ? 'border-red-400 focus:border-red-400' : ''}`}
                aria-describedby={!isValid ? 'url-error' : 'url-help'}
                aria-invalid={!isValid}
                disabled={isLoading}
                aria-label="GitHub Repository URL"
              />
              <div id="url-help" className="sr-only">
                Enter a valid GitHub repository URL in the format https://github.com/username/repository
              </div>
            </div>
            {(error || (!isValid && errorMessage)) && (
              <div 
                id="url-error" 
                className="mt-3 flex items-center gap-2 text-red-300 text-sm"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error || errorMessage}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              aria-describedby="submit-help"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analyze Repository
                </>
              )}
            </button>
          </div>
          <div id="submit-help" className="sr-only">
            Click to analyze the repository and calculate its vibe score
          </div>
        </form>

        {/* Enhanced Example Repositories */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <h3 className="text-heading-sm mb-6 text-center">
            Try these popular repositories:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'React',
                url: 'https://github.com/facebook/react',
                description: 'Popular JavaScript library',
                icon: '⚛️'
              },
              {
                name: 'Vue.js',
                url: 'https://github.com/vuejs/vue',
                description: 'Progressive JavaScript framework',
                icon: '💚'
              },
              {
                name: 'Python',
                url: 'https://github.com/python/cpython',
                description: 'Python programming language',
                icon: '🐍'
              },
              {
                name: 'Fastify',
                url: 'https://github.com/fastify/fastify',
                description: 'Fast web framework for Node.js',
                icon: '⚡'
              }
            ].map((example) => (
              <button
                key={example.url}
                onClick={() => handleExampleClick(example.url)}
                className="card-content p-6 text-left metric-hover group"
                aria-label={`Analyze ${example.name} repository`}
                tabIndex={-1}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{example.icon}</span>
                  <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {example.name}
                  </div>
                </div>
                <div className="text-body-sm mb-3">{example.description}</div>
                <div className="flex items-center gap-2 text-indigo-300 text-xs">
                  <ExternalLink className="w-3 h-3" />
                  <span>Click to analyze</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Vibe Score Explanation */}
        <div className="card-content p-6 mt-8">
          <h4 className="text-heading-sm mb-4 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            What is a Vibe Score?
          </h4>
          <p className="text-body-sm leading-relaxed mb-4">
            A comprehensive evaluation of repository quality based on twelve key metrics:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-white/70">
              <span>🧪</span>
              <span>Code Quality (16%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>📄</span>
              <span>Readability (12%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>👥</span>
              <span>Collaboration (15%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>💡</span>
              <span>Innovation (8%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>🔧</span>
              <span>Maintainability (8%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>🌍</span>
              <span>Inclusivity (5%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>🔒</span>
              <span>Security & Safety (12%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>⚡</span>
              <span>Performance (8%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>✅</span>
              <span>Testing Quality (6%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>🤝</span>
              <span>Community Health (4%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>💚</span>
              <span>Code Health (4%)</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span>📦</span>
              <span>Release Management (2%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryInput; 