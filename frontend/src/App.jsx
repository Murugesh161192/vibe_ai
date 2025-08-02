import React, { useState, useRef, useEffect } from 'react';
import { Github, Sparkles, HelpCircle, BarChart3, ExternalLink } from 'lucide-react';
import Header from './components/Header';
import RepositoryInput from './components/RepositoryInput';
import VibeScoreResults from './components/VibeScoreResults';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeRepository } from './services/api';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRepoUrl, setCurrentRepoUrl] = useState(null);
  
  // Ref for the loading section to enable auto-scroll
  const loadingSectionRef = useRef(null);

  /**
   * Handle repository analysis
   * @param {string} repoUrl - GitHub repository URL
   */
  const handleAnalyzeRepository = async (repoUrl) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentRepoUrl(repoUrl);

    try {
      const result = await analyzeRepository(repoUrl);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to loading section when analysis starts
  useEffect(() => {
    if (loading && loadingSectionRef.current) {
      loadingSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [loading]);

  /**
   * Reset the application state and scroll to top
   */
  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setCurrentRepoUrl(null);
    // Smooth scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 relative overflow-hidden">
      {/* Lightweight CSS-based texture overlay - replaces heavy SVG */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, white 1px, transparent 1px),
                           radial-gradient(circle at 50% 10%, white 0.5px, transparent 0.5px),
                           radial-gradient(circle at 10% 60%, white 0.5px, transparent 0.5px),
                           radial-gradient(circle at 90% 40%, white 0.5px, transparent 0.5px)`,
          backgroundSize: '100px 100px, 100px 100px, 150px 150px, 150px 150px, 150px 150px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0'
        }}
      />
      
      {/* Navigation */}
      <nav className="bg-black/20 border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="icon-container icon-container-primary w-8 h-8 sm:w-10 sm:h-10">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Vibe AI</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Only show Demo/Analyze button based on current state */}
              {!analysisResult && !loading && (
                <button 
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-ghost flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                  aria-label="Start Analysis"
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Analyze</span>
                </button>
              )}
              
              {/* Reset button when showing results */}
              {analysisResult && (
                <button 
                  onClick={handleReset}
                  className="btn-ghost flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                  aria-label="New Analysis"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Analysis</span>
                </button>
              )}
              
              <button 
                onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                aria-label="About Vibe Score"
              >
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">About</span>
              </button>
              
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-ghost flex items-center space-x-1 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                aria-label="View on GitHub"
              >
                <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Hero Section */}
        <section className="text-center py-4 sm:py-6 md:py-8 mb-6 sm:mb-8 md:mb-12">
          <Header 
            analysisState={analysisResult ? 'results' : loading ? 'processing' : 'ready'}
            onNewAnalysis={handleReset}
          />
        </section>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto">
          {/* Analysis Results */}
          {analysisResult && (
            <section className="mb-8 sm:mb-12 animate-fade-in">
              <VibeScoreResults 
                result={analysisResult} 
                repoUrl={currentRepoUrl}
                onNewAnalysis={handleReset}
              />
            </section>
          )}

          {/* Error State */}
          {error && (
            <section className="mb-8">
              <ErrorMessage 
                message={error} 
                onRetry={() => setError(null)}
              />
            </section>
          )}

                     {/* Loading Section */}
           {loading && (
             <section ref={loadingSectionRef} className="mb-8 sm:mb-12 animate-fade-in">
               <LoadingSpinner message="Analyzing Repository..." />
             </section>
           )}

          {/* Repository Input Section - Hide when showing results */}
          {!analysisResult && !loading && (
            <section id="demo-section" className="mb-8 sm:mb-12">
              <div className="card-glass p-4 sm:p-6 md:p-8">
                <RepositoryInput 
                  onAnalyze={handleAnalyzeRepository}
                  error={error}
                  isLoading={loading}
                />

                {/* Popular Repository Examples */}
                <div className="mt-8 sm:mt-12">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                      <span className="text-2xl">⚡</span>
                      Try These Popular Repositories
                    </h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Click any repository below to see a live analysis demo
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { 
                        emoji: '⚛️', 
                        name: 'React', 
                        url: 'https://github.com/facebook/react', 
                        desc: 'Popular JavaScript library',
                        stats: 'JavaScript • 200k+ stars',
                        color: 'from-blue-400 to-cyan-500'
                      },
                      { 
                        emoji: '💚', 
                        name: 'Vue.js', 
                        url: 'https://github.com/vuejs/vue', 
                        desc: 'Progressive JavaScript framework',
                        stats: 'JavaScript • 200k+ stars',
                        color: 'from-green-400 to-emerald-500'
                      },
                      { 
                        emoji: '🐍', 
                        name: 'Python', 
                        url: 'https://github.com/python/cpython', 
                        desc: 'Python programming language',
                        stats: 'Python • 50k+ stars',
                        color: 'from-yellow-400 to-orange-500'
                      },
                      { 
                        emoji: '⚡', 
                        name: 'Fastify', 
                        url: 'https://github.com/fastify/fastify', 
                        desc: 'Fast web framework for Node.js',
                        stats: 'JavaScript • 30k+ stars',
                        color: 'from-purple-400 to-indigo-500'
                      }
                    ].map((repo, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnalyzeRepository(repo.url)}
                        className="group relative overflow-hidden bg-gradient-to-br from-black/20 to-black/30 rounded-2xl p-5 sm:p-6 text-left border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                        aria-label={`Analyze ${repo.name} repository`}
                      >
                        {/* Background gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${repo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-black/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl">{repo.emoji}</span>
                              </div>
                              <div>
                                <div className="text-white font-bold text-lg group-hover:text-white transition-colors">{repo.name}</div>
                                <div className="text-white/60 text-xs font-mono">{repo.stats}</div>
                              </div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                              <svg className="w-3 h-3 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/80 transition-colors">{repo.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* About Section */}
        <section id="about-section" className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-heading-lg mb-4">About Vibe Score</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-glass-sm p-6">
              <h3 className="text-heading-sm mb-4">What is Vibe Score?</h3>
              <p className="text-body mb-4">
                Vibe Score is an intelligent analysis tool that evaluates GitHub repositories based on twelve 
                comprehensive metrics for enterprise-grade validation. It provides insights into code quality, 
                documentation, collaboration patterns, security, performance, and overall project health.
              </p>
              <p className="text-body">
                Our advanced algorithm considers multiple factors including test coverage, documentation quality, 
                community engagement, security practices, performance optimization, and modern development practices 
                to generate a score from 0-100.
              </p>
            </div>
            <div className="card-glass-sm p-6">
              <h3 className="text-heading-sm mb-4">Why Use Vibe Score?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-body">
                  <span className="text-green-300 font-bold">✓</span>
                  <span>Quick assessment of repository quality</span>
                </li>
                <li className="flex items-center gap-3 text-body">
                  <span className="text-green-300 font-bold">✓</span>
                  <span>Identify areas for improvement</span>
                </li>
                <li className="flex items-center gap-3 text-body">
                  <span className="text-green-300 font-bold">✓</span>
                  <span>Compare different projects</span>
                </li>
                <li className="flex items-center gap-3 text-body">
                  <span className="text-green-300 font-bold">✓</span>
                  <span>Make informed decisions about contributions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section id="docs-section" className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-heading-lg mb-4">Documentation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass-sm p-6 text-center">
              <h3 className="text-heading-sm mb-3">Getting Started</h3>
              <p className="text-body-sm">
                Learn how to use Vibe AI to analyze your first repository. Simply paste a GitHub URL and get instant insights.
              </p>
            </div>
            <div className="card-glass-sm p-6 text-center">
              <h3 className="text-heading-sm mb-3">API Reference</h3>
              <p className="text-body-sm">
                Integrate Vibe Score into your own applications using our RESTful API endpoints.
              </p>
            </div>
            <div className="card-glass-sm p-6 text-center">
              <h3 className="text-heading-sm mb-3">Metrics Guide</h3>
              <p className="text-body-sm">
                Understand how each metric is calculated and what factors contribute to your repository's score.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-white/80">
            <span className="text-xl">🎉</span>
            <span>Built for Cognizant Vibe Coding Week 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 