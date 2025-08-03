import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Github, Sparkles, HelpCircle, BarChart3, ExternalLink, MessageCircle, Bot, Zap } from 'lucide-react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import GitHubUserProfile from './components/GitHubUserProfile';
import VibeScoreResults from './components/VibeScoreResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { analyzeRepository, getUserProfile, getUserRepositories } from './services/api';

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

  const handleRepositoryAnalysis = useCallback(async (repoUrl) => {
    setLoading(true);
    setError(null);
    setCurrentInput({ type: 'repository', input: repoUrl });
    
    // Clear previous state immediately and switch view
    setUserProfile(null);
    setUserRepositories([]);
    setAnalysisResult(null);
    setCurrentView('analysis');
    
    try {
      const result = await analyzeRepository(repoUrl);
      setAnalysisResult(result.data);
    } catch (err) {
      // Reset to ready view on error
      setCurrentView('ready');
      handleError(err.message || 'An error occurred while analyzing the repository. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const handleUserSearch = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    setCurrentInput({ type: 'user', input: username });

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
    () => <LoadingSpinner message="Analyzing repository..." />,
    []
  );

  const errorComponent = useMemo(
    () => error && <ErrorMessage message={error} onRetry={handleNewAnalysis} />,
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Header 
              analysisState={analysisState}
              onNewAnalysis={handleNewAnalysis}
            />
          </div>
        </div>
        
        {/* Chat Section - Conditionally rendered */}
        {currentView === 'ready' && (
          <section ref={chatSectionRef} className="mb-8 sm:mb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              
                             {/* Welcome Section - First time users */}
               <div className="mb-6 sm:mb-8">
                 {memoizedChatInput}
               </div>
              
              {/* Loading State - Optimized */}
              {loading && loadingComponent}
              
              {/* Error State - Memoized */}
              {errorComponent}
            </div>
          </section>
        )}

        {/* Results Section - Conditionally rendered for performance */}
        {currentView === 'analysis' && analysisResult && (
          <section className="space-y-6 sm:space-y-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <VibeScoreResults 
                result={analysisResult} 
                onNewAnalysis={handleNewAnalysis}
              />
            </div>
          </section>
        )}

        {currentView === 'profile' && userProfile && (
          <section className="space-y-6 sm:space-y-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <GitHubUserProfile
                user={userProfile}
                repositories={userRepositories}
                onAnalyzeRepo={handleRepositoryAnalysis}
                onNewSearch={handleNewAnalysis}
              />
            </div>
          </section>
        )}
      </div>

      {/* About Section - Only show when ready */}
      {currentView === 'ready' && (
        <section id="about-section" className="mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose Vibe?
            </h2>
            <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
              Get deep insights into any GitHub repository with our comprehensive analysis engine
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8 sm:mb-12">
            <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-400 mb-2">Advanced</div>
              <div className="text-xs sm:text-sm text-white/80">Analysis Engine</div>
            </div>
            <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-purple-400 mb-2">12+</div>
              <div className="text-xs sm:text-sm text-white/80">Metrics</div>
            </div>
            <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-green-400 mb-2">Multi-Lang</div>
              <div className="text-xs sm:text-sm text-white/80">Tech Detection</div>
            </div>
            <div className="card-glass p-4 sm:p-6 text-center hover:bg-white/10 transition-all">
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-yellow-400 mb-2">Real-time</div>
              <div className="text-xs sm:text-sm text-white/80">Processing</div>
            </div>
          </div>
        </section>
      )}

      {/* Footer - Simplified and responsive */}
      <footer className="py-6 sm:py-8 text-center text-white/60 border-t border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm">
            Made with ❤️ for the GitHub community • 
            <span className="hidden sm:inline text-xs sm:text-sm"> Powered by GitHub API & Advanced Analytics</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 