import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Github, Sparkles, HelpCircle, BarChart3, ExternalLink, MessageCircle, Bot, Zap, Play } from 'lucide-react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import GitHubUserProfile from './components/GitHubUserProfile';
import VibeScoreResults from './components/VibeScoreResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import DemoMode from './components/DemoMode';
import ScoreTransparency from './components/ScoreTransparency';
import BenchmarkComparison from './components/BenchmarkComparison';
import { analyzeRepository, getUserProfile, getUserRepositories, generateInsights } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('ready'); // 'ready', 'profile', 'analysis'
  const [userProfile, setUserProfile] = useState(null);
  const [userRepositories, setUserRepositories] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentInput, setCurrentInput] = useState({ type: '', input: '' });
  
  const chatSectionRef = useRef(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
    setCurrentView('ready'); // Ensure we go back to 'ready' view to display the error
  }, []);

  const clearState = useCallback(() => {
    setError(null);
    setAnalysisResult(null);
    setUserProfile(null);
    setUserRepositories([]);
    setCurrentInput({ type: '', input: '' });
  }, []);

  const handleNewAnalysis = useCallback(() => {
    clearState();
    setCurrentView('ready');
    
    // Smooth scroll to chat section
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [clearState]);

  // Add demo mode handler
  const handleDemoMode = useCallback(() => {
    clearState();
    setCurrentView('demo');
  }, [clearState]);

  const handleRepositoryAnalysis = useCallback(async (repoUrl) => {
    setLoading(true);
    setCurrentView('loading');
    setCurrentInput({ type: 'repo', value: repoUrl });

    try {
      // Fetch both basic analysis and AI insights in parallel
      const [analysisResult, insightsResult] = await Promise.allSettled([
        analyzeRepository(repoUrl),
        generateInsights(repoUrl)
      ]);
      
      // Handle basic analysis result
      if (analysisResult.status === 'fulfilled') {
        const result = {
          ...analysisResult.value.data,
          aiInsights: insightsResult.status === 'fulfilled' ? insightsResult.value.data : null,
          aiInsightsError: insightsResult.status === 'rejected' ? insightsResult.reason?.message : null
        };
        
        setAnalysisResult(result);
        setCurrentView('analysis');
      } else {
        throw new Error(analysisResult.reason?.message || 'Analysis failed');
      }
    } catch (error) {
      handleError(error.message || 'Failed to analyze repository');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Check for repo in URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const repo = urlParams.get('repo');
    
    if (repo && repo.includes('/')) {
      // Auto-analyze the shared repository
      const repoUrl = `https://github.com/${repo}`;
      handleRepositoryAnalysis(repoUrl);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleRepositoryAnalysis]);

  const handleUserSearch = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    setCurrentInput({ type: 'user', input: username });

    // Scroll to the loader
    setTimeout(() => {
      if (chatSectionRef.current) {
        chatSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100); // Small delay to ensure DOM updates

    try {
      // Validate username before making API calls
      if (username.toLowerCase() === 'user') {
        throw new Error('Please enter a specific GitHub username. Try "octocat" or "torvalds" for example.');
      }
      
      // Fetch user profile and repositories in parallel for better performance
      const [profileResult, reposResult] = await Promise.all([
        getUserProfile(username),
        getUserRepositories(username)
      ]);

      setUserProfile(profileResult.data);
      setUserRepositories(reposResult || []);
      setCurrentView('profile');
      setAnalysisResult(null);
    } catch (err) {
      // Provide more helpful error messages
      let errorMessage = err.message || 'An error occurred while fetching user data.';
      if (err.message.includes('No user found')) {
        errorMessage = `No GitHub user found with username "${username}". Please check the spelling or try a different username.`;
      }
      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const handleInputSubmit = useCallback(async (input) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Clear previous state
    setError(null);

    // Check if it's a GitHub URL
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(\/.*)?$/;
    const urlMatch = trimmedInput.match(githubUrlPattern);

    if (urlMatch) {
      // It's a GitHub repository URL
      const cleanUrl = `https://github.com/${urlMatch[2]}/${urlMatch[3]}`;
      await handleRepositoryAnalysis(cleanUrl);
    } else if (trimmedInput.includes('/')) {
      // It's in owner/repo format
      const parts = trimmedInput.split('/');
      if (parts.length === 2 && parts[0] && parts[1]) {
        const repoUrl = `https://github.com/${parts[0].trim()}/${parts[1].trim()}`;
        await handleRepositoryAnalysis(repoUrl);
      } else {
        handleError('Invalid repository format. Use "owner/repo" or a full GitHub URL.');
      }
    } else {
      // Treat it as a username
      await handleUserSearch(trimmedInput);
    }
  }, [handleRepositoryAnalysis, handleUserSearch, handleError]);

  // Memoized current view analysis state
  const analysisState = useMemo(() => {
    if (loading) return 'processing';
    if (currentView === 'analysis' || currentView === 'profile') return 'results';
    return 'ready';
  }, [loading, currentView]);

  // Memoized components to prevent unnecessary re-renders
  const memoizedChatInput = useMemo(
    () => (
      <ChatInput
        onSubmit={handleInputSubmit}
        loading={loading}
        placeholder="Enter GitHub username (e.g., 'torvalds') or repository URL"
      />
    ),
    [handleInputSubmit, loading]
  );

  const loadingComponent = useMemo(
    () => (
      <LoadingSpinner message={
        currentInput.type === 'user' 
          ? 'Loading user profile...' 
          : currentInput.type === 'repo'
          ? 'Analyzing repository...'
          : 'Processing request...'
      } />
    ),
    [currentInput.type]
  );

  const errorComponent = useMemo(
    () => error && (
      <div data-testid="error-message">
        <ErrorMessage message={error} onRetry={handleNewAnalysis} />
      </div>
    ),
    [error, handleNewAnalysis]
  );

  // Scroll to top when view changes (optimized)
  useEffect(() => {
    if (currentView === 'analysis' || currentView === 'profile') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      {/* Background Pattern - Performance optimized */}
      <div className="fixed inset-0 opacity-10 bg-pattern"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10">
        {/* Header - Adjusted for compact results view */}
        <div className={`${currentView === 'analysis' ? 'mb-4 sm:mb-6' : 'mb-8 sm:mb-12'} ${
          currentView === 'analysis' ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-12'
        }`}>
          <div className="container-responsive">
            <div data-testid="header">
              <Header 
                analysisState={analysisState}
                onNewAnalysis={handleNewAnalysis}
                onDemoMode={handleDemoMode}
                onAnalyzeRepo={handleRepositoryAnalysis}
              />
            </div>
          </div>
        </div>
        
        {/* Chat Section - Conditionally rendered */}
        {currentView === 'ready' && (
          <section ref={chatSectionRef} className="mb-8 sm:mb-12">
            <div className="container-responsive max-w-3xl mx-auto">
              
              {/* Welcome Section - First time users */}
              <div className="mb-6 sm:mb-8">
                <div className="text-center mb-4">
                  <p className="text-white/70 text-responsive">
                    Enter any GitHub username or repository URL to get started
                  </p>
                </div>
                {memoizedChatInput}
              </div>
              
              {/* Error State - Memoized */}
              {errorComponent}
            </div>
          </section>
        )}

        {/* Loading View - Single loading state */}
        {(currentView === 'loading' || (currentView === 'ready' && loading)) && (
          <section className="mb-8 sm:mb-12">
            <div className="container-responsive max-w-3xl mx-auto">
              {loadingComponent}
            </div>
          </section>
        )}

        {/* Results Section - Conditionally rendered for performance */}
        {currentView === 'analysis' && analysisResult && (
          <section className="spacing-responsive">
            <div className="container-responsive max-w-6xl mx-auto">
              <div data-testid="vibe-score-results">
                <VibeScoreResults 
                  result={analysisResult} 
                  onNewAnalysis={handleNewAnalysis}
                />
              </div>
            </div>
          </section>
        )}

        {currentView === 'profile' && userProfile && (
          <section className="spacing-responsive">
            <div className="container-responsive max-w-6xl mx-auto">
              <GitHubUserProfile
                user={userProfile}
                repositories={userRepositories}
                onAnalyzeRepo={handleRepositoryAnalysis}
                onNewSearch={handleNewAnalysis}
              />
            </div>
          </section>
        )}

        {/* Demo Mode View */}
        {currentView === 'demo' && (
          <section className="spacing-responsive">
            <div className="container-responsive max-w-6xl mx-auto">
              <DemoMode
                onExitDemo={handleNewAnalysis}
                onAnalyzeRepo={handleRepositoryAnalysis}
              />
            </div>
          </section>
        )}
      </div>

      {/* About Section - Only show when ready */}
      {currentView === 'ready' && (
        <section id="about-section" className="mb-8 sm:mb-12">
          <div className="container-responsive">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-heading-lg text-white mb-4">
                Why Choose Vibe?
              </h2>
              <p className="text-white/80 text-responsive max-w-3xl mx-auto">
                Get deep insights into any GitHub repository with our comprehensive analysis engine
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8 sm:mb-12">
              <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
                <div className="text-heading-lg font-bold text-blue-400 mb-2">Advanced</div>
                <div className="text-responsive text-white/80">Analysis Engine</div>
              </div>
              <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
                <div className="text-heading-lg font-bold text-purple-400 mb-2">12+</div>
                <div className="text-responsive text-white/80">Metrics</div>
              </div>
              <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
                <div className="text-heading-lg font-bold text-green-400 mb-2">Multi-Lang</div>
                <div className="text-responsive text-white/80">Tech Detection</div>
              </div>
              <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
                <div className="text-heading-lg font-bold text-yellow-400 mb-2">Real-time</div>
                <div className="text-responsive text-white/80">Processing</div>
              </div>
            </div>

            {/* Score Transparency Section */}
            <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
              <ScoreTransparency 
                vibeScore={52}
                breakdown={{
                  codeQuality: 30,
                  readability: 70,
                  collaboration: 85,
                  security: 20
                }}
              />
            </div>

            {/* Try Your Own Repository Section */}
            <div className="max-w-4xl mx-auto">
              <div className="card-glass p-8 text-center">
                <h3 className="text-heading-md text-white mb-4">
                  Ready to Analyze Your Repository?
                </h3>
                <p className="text-white/80 text-responsive mb-6 max-w-2xl mx-auto">
                  Get comprehensive insights across all 12 metrics, AI-powered recommendations, 
                  and personalized suggestions for improvement.
                </p>
                <div className="flex-responsive-sm">
                  <button
                    onClick={() => {
                      if (chatSectionRef.current) {
                        chatSectionRef.current.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="btn-primary icon-text-align px-8 py-4 text-responsive touch-target"
                  >
                    <Zap className="icon-md" />
                    <span>Start Your Analysis</span>
                  </button>
                  <button
                    onClick={handleDemoMode}
                    className="btn-secondary icon-text-align px-6 py-4 text-responsive touch-target"
                  >
                    <Play className="icon-sm" />
                    <span>Try Demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-white/60 text-responsive">
        <p>
          Built with ❤️ for <span className="text-purple-400 font-semibold">Cognizant Vibe Coding 2025</span> • 
        </p>
      </footer>
    </div>
  );
}

export default App; 