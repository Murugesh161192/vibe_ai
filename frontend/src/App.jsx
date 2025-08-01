import React, { useState } from 'react';
import Header from './components/Header';
import RepositoryInput from './components/RepositoryInput';
import VibeScoreResults from './components/VibeScoreResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { analyzeRepository } from './services/api';
import { Github, Home, Zap, Info, Sparkles } from 'lucide-react';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRepoUrl, setCurrentRepoUrl] = useState(null);

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
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="noise" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="white" opacity="0.3"/>
              <circle cx="75" cy="75" r="1" fill="white" opacity="0.3"/>
              <circle cx="50" cy="10" r="0.5" fill="white" opacity="0.2"/>
              <circle cx="10" cy="60" r="0.5" fill="white" opacity="0.2"/>
              <circle cx="90" cy="40" r="0.5" fill="white" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#noise)"/>
        </svg>
      </div>
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg"><Sparkles className="w-10 h-10 text-white" /></span>
              </div>
              <div>
                <div className="text-white font-bold text-xl tracking-wide">Vibe AI</div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-ghost flex items-center space-x-1"
                aria-label="Go to top of page"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button 
                onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost flex items-center space-x-1"
                aria-label="About Vibe Score section"
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </button>
              {/* Only show Demo button when not displaying results */}
              {!analysisResult && (
                <button 
                  onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-ghost flex items-center space-x-1"
                  aria-label="Demo section"
                >
                  <Zap className="w-4 h-4" />
                  <span>Demo</span>
                </button>
              )}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center space-x-1">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden text-white p-2" aria-label="Toggle mobile menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mx-4 max-w-md w-full text-center border border-white/20 shadow-2xl">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing Repository</h3>
            <p className="text-white/80 mb-4">Calculating vibe score...</p>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-white/60 mt-3">This may take a few moments</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Header 
          analysisState={
            loading ? 'processing' : 
            analysisResult ? 'results' : 
            'ready'
          }
          onNewAnalysis={analysisResult ? handleReset : undefined}
        />
        
        <main className="mt-8">
          {!analysisResult ? (
            <div className="max-w-4xl mx-auto">
              {/* Demo Section */}
              <section id="demo-section" className="mb-16">
                <RepositoryInput onAnalyze={handleAnalyzeRepository} />
              </section>
              
              {error && (
                <div className="mt-8">
                  <ErrorMessage 
                    message={error} 
                    onRetry={currentRepoUrl ? () => handleAnalyzeRepository(currentRepoUrl) : undefined}
                  />
                </div>
              )}
            </div>
          ) : (
            <VibeScoreResults 
              result={analysisResult} 
              onAnalyzeAnother={handleReset}
            />
          )}
        </main>
        
        {/* About Vibe Score Section */}
        <section id="about-section" className="mt-24 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="card-glass p-8">
              <h2 className="text-heading-xl mb-8 text-center">
                About Vibe Score
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-heading-md mb-4">What is Vibe Score?</h3>
                  <p className="text-body leading-relaxed mb-4">
                    Vibe Score is an intelligent analysis tool that evaluates GitHub repositories 
                    based on twelve comprehensive metrics for enterprise-grade validation. It provides insights into code quality, documentation, 
                    collaboration patterns, security, performance, and overall project health.
                  </p>
                  <p className="text-body leading-relaxed">
                    Our advanced algorithm considers multiple factors including test coverage, documentation quality, 
                    community engagement, security practices, performance optimization, and modern development practices to generate a score from 0-100.
                  </p>
                </div>
                <div>
                  <h3 className="text-heading-md mb-4">Why Use Vibe Score?</h3>
                  <ul className="space-y-3 text-body">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Quick assessment of repository quality</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Identify areas for improvement</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Compare different projects</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Make informed decisions about contributions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section id="docs-section" className="mt-16 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="card-glass p-8">
              <h2 className="text-heading-xl mb-8 text-center">
                Documentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card-content p-6">
                  <h3 className="text-heading-sm mb-4">Getting Started</h3>
                  <p className="text-body-sm leading-relaxed">
                    Learn how to use Vibe AI to analyze your first repository. 
                    Simply paste a GitHub URL and get instant insights.
                  </p>
                </div>
                <div className="card-content p-6">
                  <h3 className="text-heading-sm mb-4">API Reference</h3>
                  <p className="text-body-sm leading-relaxed">
                    Integrate Vibe Score into your own applications using our 
                    RESTful API endpoints.
                  </p>
                </div>
                <div className="card-content p-6">
                  <h3 className="text-heading-sm mb-4">Metrics Guide</h3>
                  <p className="text-body-sm leading-relaxed">
                    Understand how each metric is calculated and what factors 
                    contribute to your repository's score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 py-8 border-t border-white/20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center">
              {/* Event Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20 shadow-lg">
                <span className="text-3xl">🎉</span>
                <span className="text-white font-semibold text-base">Built for Cognizant Vibe Coding Week 2025</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App; 