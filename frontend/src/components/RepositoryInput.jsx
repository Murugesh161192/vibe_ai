import React, { useState } from 'react';
import { Github, AlertCircle, Zap, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { validateRepoUrl } from '../services/api';

const RepositoryInput = ({ onAnalyze, error, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMetrics, setShowMetrics] = useState(false);

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
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced URL Input Form */}
      <div className="card-glass p-6 sm:p-8 hover-lift relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full -translate-y-16 translate-x-16"></div>
        
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative z-10" aria-label="Repository URL form">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Github className="w-6 h-6 text-indigo-400" />
              Repository Analysis
            </h3>
            <p className="text-white/70 text-sm sm:text-base">
              Enter any public GitHub repository URL to discover its comprehensive vibe score
            </p>
          </div>

          <div>
            <label htmlFor="repoUrl" className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"></span>
              GitHub Repository URL
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <Github className="h-5 w-5 sm:h-6 sm:w-6 text-white/50 group-focus-within:text-indigo-400 transition-all duration-200" />
              </div>
              <input
                id="repoUrl"
                type="url"
                value={repoUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repository"
                className={`input-glass pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 text-sm sm:text-base font-medium ${
                  !isValid ? 'border-red-400 focus:border-red-400 bg-red-900/10' : 'focus:border-indigo-400'
                }`}
                aria-describedby={!isValid ? 'url-error' : 'url-help'}
                aria-invalid={!isValid}
                disabled={isLoading}
                aria-label="GitHub Repository URL"
              />
              {/* Input enhancement */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/5 to-purple-600/5 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              
              <div id="url-help" className="sr-only">
                Enter a valid GitHub repository URL in the format https://github.com/username/repository
              </div>
            </div>
            {(error || (!isValid && errorMessage)) && (
              <div 
                id="url-error" 
                className="mt-3 flex items-center gap-2 text-red-300 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error || errorMessage}</span>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isLoading || !repoUrl.trim()}
              className={`btn-primary flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-xl shadow-2xl relative overflow-hidden group ${
                isLoading || !repoUrl.trim() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 active:scale-95 hover:shadow-indigo-500/25'
              }`}
              aria-describedby="submit-help"
            >
              {/* Button background enhancement */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                <span>Analyze Repository</span>
              </div>
            </button>
          </div>
          <div id="submit-help" className="sr-only">
            Click to analyze the repository and calculate its vibe score
          </div>
        </form>
      </div>

      {/* Enhanced Vibe Score Explanation */}
      <div className="card-content p-6 sm:p-8 hover-lift relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full -translate-y-12 -translate-x-12"></div>
        
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <span className="text-2xl sm:text-3xl">🧠</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-20 blur-lg scale-150"></div>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white">What is a Vibe Score?</h4>
          </div>
          <p className="text-white/80 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto mb-4 sm:mb-6">
            A comprehensive evaluation of repository quality based on twelve key metrics that matter most for modern software development
          </p>
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`btn-secondary flex items-center gap-2 mx-auto text-sm sm:text-base px-4 sm:px-6 py-3 hover-lift transition-all duration-200 ${
              showMetrics ? 'bg-black/40 border-white/40' : ''
            }`}
            aria-expanded={showMetrics}
            aria-controls="metrics-breakdown"
          >
            <span>{showMetrics ? 'Hide' : 'View'} Metrics Breakdown</span>
            {showMetrics ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Enhanced Collapsible Metrics Breakdown */}
        {showMetrics && (
          <div id="metrics-breakdown" className="reveal relative z-10">
            {/* High Priority Metrics */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
                  <h5 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide truncate">
                    High Priority Metrics
                  </h5>
                </div>
                <span className="text-xs text-white/70 bg-green-500/20 px-2 sm:px-3 py-1 rounded-full border border-green-500/30 whitespace-nowrap flex-shrink-0">12-16% weight</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: '🧪', name: 'Code Quality', weight: '16%', desc: 'Test coverage & complexity analysis' },
                  { icon: '👥', name: 'Collaboration', weight: '15%', desc: 'Team dynamics & contribution patterns' },
                  { icon: '📄', name: 'Readability', weight: '12%', desc: 'Documentation & code clarity' },
                  { icon: '🔒', name: 'Security & Safety', weight: '12%', desc: 'Vulnerability scanning & compliance' }
                ].map((metric, index) => (
                  <div key={index} className="bg-gradient-to-br from-black/20 to-black/30 rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-black/25 transition-all group">
                    <div className="flex items-start gap-3">
                      <span className="text-xl group-hover:scale-110 transition-transform flex-shrink-0 mt-1">{metric.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h6 className="text-white text-sm sm:text-base font-semibold truncate">{metric.name}</h6>
                          <span className="text-white/80 text-xs font-mono bg-white/10 px-2 py-1 rounded flex-shrink-0">{metric.weight}</span>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">{metric.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Priority Metrics */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full flex-shrink-0"></div>
                  <h5 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide truncate">
                    Medium Priority Metrics
                  </h5>
                </div>
                <span className="text-xs text-white/70 bg-yellow-500/20 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30 whitespace-nowrap flex-shrink-0">6-8% weight</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: '💡', name: 'Innovation', weight: '8%', desc: 'Modern practices & tech adoption' },
                  { icon: '🔧', name: 'Maintainability', weight: '8%', desc: 'Code organization & structure' },
                  { icon: '⚡', name: 'Performance', weight: '8%', desc: 'Efficiency & optimization' },
                  { icon: '✅', name: 'Testing Quality', weight: '6%', desc: 'Test coverage & reliability' }
                ].map((metric, index) => (
                  <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10 hover:bg-black/30 transition-all group">
                    <div className="flex items-start gap-3">
                      <span className="text-lg group-hover:scale-110 transition-transform flex-shrink-0 mt-1">{metric.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h6 className="text-white text-sm font-semibold truncate">{metric.name}</h6>
                          <span className="text-white/80 text-xs font-mono bg-white/10 px-2 py-1 rounded flex-shrink-0">{metric.weight}</span>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">{metric.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supporting Factors */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full flex-shrink-0"></div>
                  <h5 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide truncate">
                    Supporting Factors
                  </h5>
                </div>
                <span className="text-xs text-white/70 bg-blue-500/20 px-2 sm:px-3 py-1 rounded-full border border-blue-500/30 whitespace-nowrap flex-shrink-0">2-5% weight</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: '🌍', name: 'Inclusivity', weight: '5%', desc: 'Diversity & accessibility practices' },
                  { icon: '🤝', name: 'Community', weight: '4%', desc: 'Health & contribution patterns' },
                  { icon: '💚', name: 'Code Health', weight: '4%', desc: 'Technical debt & maintainability' },
                  { icon: '📦', name: 'Release Mgmt', weight: '2%', desc: 'Deployment & versioning practices' }
                ].map((metric, index) => (
                  <div key={index} className="bg-black/20 rounded-xl p-4 border border-white/10 hover:bg-black/30 transition-all group">
                    <div className="flex items-start gap-3">
                      <span className="text-base group-hover:scale-110 transition-transform flex-shrink-0 mt-1">{metric.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h6 className="text-white text-sm font-semibold truncate">{metric.name}</h6>
                          <span className="text-white/80 text-xs font-mono bg-white/10 px-2 py-1 rounded flex-shrink-0">{metric.weight}</span>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">{metric.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryInput; 