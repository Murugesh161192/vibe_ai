import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Zap } from 'lucide-react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import GitHubUserProfile from './components/GitHubUserProfile';
import VibeScoreResults from './components/VibeScoreResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import DemoMode from './components/DemoMode';
import ExportModal from './components/ExportModal';
import ShareModal from './components/ShareModal';
import { getUserProfile, getUserRepositories } from './services/api';
import { useKeyboardShortcuts } from './utils/accessibility';
import { 
  selectCurrentView, 
  selectIsLoading, 
  selectError,
  setCurrentView,
  setError,
  setLoading 
} from './store/slices/appSlice';
import { 
  selectCurrentAnalysis,
  selectAiInsights,
  startAnalysisAndNavigate,
  clearAnalysis
} from './store/slices/analysisSlice';

function App() {
  const dispatch = useDispatch();
  
  // Redux state
  const currentView = useSelector(selectCurrentView);
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const analysisResult = useSelector(selectCurrentAnalysis);
  const aiInsights = useSelector(selectAiInsights);
  
  // Local state (for non-Redux managed state)
  const [userProfile, setUserProfile] = useState(null);
  const [userRepositories, setUserRepositories] = useState([]);
  const [currentInput, setCurrentInput] = useState({ type: '', input: '' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const chatSectionRef = useRef(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleError = useCallback((errorMessage) => {
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    dispatch(setCurrentView('ready')); // Ensure we go back to 'ready' view to display the error
  }, [dispatch]);

  const clearState = useCallback(() => {
    dispatch(setError(null));
    dispatch(clearAnalysis()); // Clear Redux analysis state to prevent cache issues
    setUserProfile(null);
    setUserRepositories([]);
    setCurrentInput({ type: '', input: '' });
  }, [dispatch]);

  const handleNewAnalysis = useCallback(() => {
    clearState();
    dispatch(setCurrentView('ready'));
    
    // Smooth scroll to chat section after view change
    setTimeout(() => {
      if (chatSectionRef.current && currentView === 'ready') {
        chatSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }, [clearState, dispatch, currentView]);

  // Add demo mode handler
  const handleDemoMode = useCallback(() => {
    clearState();
    dispatch(setCurrentView('demo'));
  }, [clearState, dispatch]);
  
  // Add export and share handlers
  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);
  
  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  // Add keyboard shortcuts for analysis actions
  useKeyboardShortcuts({
    'ctrl+e': () => {
      if (currentView === 'analysis') {
        setShowExportModal(true);
      }
    },
    'ctrl+s': () => {
      if (currentView === 'analysis') {
        setShowShareModal(true);
      }
    },
    'ctrl+n': () => {
      if (currentView === 'analysis') {
        handleNewAnalysis();
      }
    }
  });
  
  // Add useEffect to mark app as ready
  useEffect(() => {
    // Mark app as ready for e2e tests
    const appContainer = document.querySelector('[data-testid="app-container"]');
    if (appContainer) {
      appContainer.setAttribute('data-testid', 'app-ready');
    }
  }, []);

  const handleRepositoryAnalysis = useCallback(async (repoUrl) => {
    setCurrentInput({ type: 'repo', value: repoUrl });
    
    try {
      // Use Redux action for analysis and navigation
      const result = await dispatch(startAnalysisAndNavigate(repoUrl));
      
      // Check for errors
      if (result.payload?.analysisError) {
        throw new Error(result.payload.analysisError);
      }
    } catch (error) {
      handleError(error.message || 'Failed to analyze repository');
    }
  }, [handleError, dispatch]);

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
    dispatch(setLoading(true));
    dispatch(setError(null));
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
      dispatch(setCurrentView('profile'));
      // setAnalysisResult(null); // This line is removed as analysisResult is now Redux state
    } catch (err) {
      // Provide more helpful error messages
      let errorMessage = err.message || 'An error occurred while fetching user data.';
      if (err.message.includes('No user found')) {
        errorMessage = `No GitHub user found with username "${username}". Please check the spelling or try a different username.`;
      }
      handleError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }, [handleError, dispatch]);

  const handleInputSubmit = useCallback(async (input) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Clear previous state
    dispatch(setError(null));

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
  }, [handleRepositoryAnalysis, handleUserSearch, handleError, dispatch]);

  // Combine analysis result with AI insights for the component
  const combinedAnalysisResult = useMemo(() => {
    if (!analysisResult) return null;
    
    // Debug: Log what we're combining
    console.log('📊 Combining analysis result:', {
      hasAnalysisResult: !!analysisResult,
      hasAiInsights: !!aiInsights,
      aiInsightsData: aiInsights,
      analysisAiInsights: analysisResult?.aiInsights,
      mergedResult: {
        ...analysisResult,
        aiInsights: aiInsights || analysisResult?.aiInsights
      }
    });
    
    return {
      ...analysisResult,
      aiInsights: aiInsights || analysisResult?.aiInsights // Use separate aiInsights or fallback to what's in analysisResult
    };
  }, [analysisResult, aiInsights]);

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
      <LoadingSpinner 
        variant={
          currentInput.type === 'user' 
            ? 'user' 
            : currentInput.type === 'repo'
            ? 'repository'
            : 'default'
        }
        showSkeleton={false}
      />
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
      // Ensure we scroll both the main container and window
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-['Inter',sans-serif] flex flex-col" data-testid="app-ready">
      {/* Fixed position background with proper viewport constraints */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,#8B5CF6_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#3B82F6_0%,transparent_50%),radial-gradient(circle_at_40%_40%,#10B981_0%,transparent_50%)] opacity-10 pointer-events-none" />
      {/* Skip Navigation Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* ARIA Live Region for Screen Reader Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {loading && 'Loading, please wait...'}
        {error && `Error: ${error}`}
        {analysisResult && `Analysis complete. Vibe score: ${analysisResult.vibeScore?.total || 0}`}
      </div>
      
      {/* Main Content Container with proper scrolling */}
      <main id="main-content" className="relative z-10 w-full flex-1 overflow-y-auto scrollbar-custom" role="main" aria-busy={loading}>
        {/* Header Section - Now consistent across all views */}
        <div data-testid="header">
          <Header 
            onDemoMode={handleDemoMode}
            loading={loading}
            currentView={currentView}
            onNewSearch={handleNewAnalysis}
            onExport={handleExport}
            onShare={handleShare}
            onNewAnalysis={handleNewAnalysis}
            showAnalysisActions={currentView === 'analysis'}
          />
        </div>
        
        {/* Chat Input Section - Mobile Optimized */}
        {currentView === 'ready' && (
          <section ref={chatSectionRef} className="w-full px-responsive py-responsive" aria-label="Repository search">
            <div className="container-narrow">
              {/* Welcome Section - Mobile Optimized Typography */}
              <div className="mb-6 sm:mb-8">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-responsive-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
                    Analyze Any GitHub Repository
                  </h1>
                  <p className="text-gray-300 text-responsive-base max-w-2xl mx-auto leading-relaxed" role="status">
                    Enter a GitHub username or repository URL to get comprehensive insights
                  </p>
                </div>
                {memoizedChatInput}
              </div>
              
              {/* Error State */}
              {errorComponent}
            </div>
          </section>
        )}

        {/* Loading View - Centered and responsive */}
        {(currentView === 'loading' || (currentView === 'ready' && loading)) && (
          <section className="section-spacing px-responsive" aria-label="Loading">
            <div className="container-narrow">
              {loadingComponent}
            </div>
          </section>
        )}

        {/* Results Section - Full width on large screens with max constraint */}
        {currentView === 'analysis' && combinedAnalysisResult && (
          <section className="py-responsive" aria-label="Analysis results">
            <div className="container-full">
              <div data-testid="vibe-score-results">
                <VibeScoreResults 
                  result={combinedAnalysisResult}
                  repoInfo={combinedAnalysisResult?.repoInfo || combinedAnalysisResult?.repositoryInfo}
                  onNewAnalysis={handleNewAnalysis}
                  showExportModal={showExportModal}
                  setShowExportModal={setShowExportModal}
                  showShareModal={showShareModal}
                  setShowShareModal={setShowShareModal}
                />
              </div>
            </div>
          </section>
        )}

        {currentView === 'profile' && userProfile && (
          <section className="py-responsive" aria-label="User profile">
            <div className="container-full">
              <GitHubUserProfile
                user={userProfile}
                repositories={userRepositories}
                onNewSearch={handleNewAnalysis}
              />
            </div>
          </section>
        )}

        {/* Demo Mode View */}
        {currentView === 'demo' && (
          <section className="py-responsive" aria-label="Demo mode">
            <div className="container-full">
              <DemoMode
                onExitDemo={handleNewAnalysis}
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer - Compact and fixed at bottom */}
      <footer className="relative z-10 py-3 sm:py-4 text-center px-responsive border-t border-white/10" role="contentinfo">
        <p className="text-gray-500 text-xs sm:text-sm">
          Built with <span aria-label="love">❤️</span> for <span className="text-blue-400 font-semibold">Cognizant Vibe Coding 2025</span>
        </p>
      </footer>
    </div>
  );
}

export default App; 