import React, { useState, useCallback, useRef, useMemo, useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Zap } from 'lucide-react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { getUserProfile, getUserRepositories } from './services/api';
import { useKeyboardShortcuts } from './utils/accessibility';
import { useViewport, useDeviceType, useNetworkStatus } from './utils/responsive';
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

// Lazy load heavy components for better performance
const GitHubUserProfile = lazy(() => import('./components/GitHubUserProfile'));
const VibeScoreResults = lazy(() => import('./components/VibeScoreResults'));
const DemoMode = lazy(() => import('./components/DemoMode'));
const ExportModal = lazy(() => import('./components/ExportModal'));
const ShareModal = lazy(() => import('./components/ShareModal'));

function App() {
  const dispatch = useDispatch();
  
  // Redux state
  const currentView = useSelector(selectCurrentView);
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const analysisResult = useSelector(selectCurrentAnalysis);
  const aiInsights = useSelector(selectAiInsights);
  
  // Responsive hooks
  const viewport = useViewport();
  const deviceType = useDeviceType();
  const networkStatus = useNetworkStatus();
  
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
    'ctrl+n': handleNewAnalysis,
    'ctrl+d': handleDemoMode,
    'escape': () => {
      if (showExportModal) setShowExportModal(false);
      if (showShareModal) setShowShareModal(false);
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

  // Enhanced memoized components with suspense fallback
  const memoizedChatInput = useMemo(
    () => (
      <ChatInput
        onSubmit={handleInputSubmit}
        loading={loading}
        placeholder={deviceType === 'mobile' 
          ? "GitHub user or repo URL" 
          : "Enter GitHub username (e.g., 'torvalds') or repository URL"}
      />
    ),
    [handleInputSubmit, loading, deviceType]
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
        showSkeleton={networkStatus.effectiveType === '3g' || networkStatus.effectiveType === '2g'}
      />
    ),
    [currentInput.type, networkStatus.effectiveType]
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-['Inter',sans-serif] flex flex-col overflow-x-hidden" data-testid="app-ready">
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
      
      {/* Header Component */}
      <Header 
        onDemoMode={handleDemoMode}
        loading={loading}
        currentView={currentView}
        onNewSearch={handleNewAnalysis}
        onNewAnalysis={handleNewAnalysis}
      />
      
      {/* Main Content Container with perfect centering */}
      <main 
        id="main-content" 
        className="flex-1 flex items-center justify-center min-h-0"
        role="main"
        aria-busy={loading}
        aria-live="polite"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentView === 'ready' && (
            <div className="animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-12rem)] py-6 sm:py-8 lg:py-12">
              {/* Hero Section with improved mobile-first responsive design */}
              <div className="text-center space-y-6 sm:space-y-8 lg:space-y-10 max-w-5xl mx-auto w-full">
                
                {/* Icon with better mobile sizing */}
                <div className="flex justify-center mb-2 sm:mb-4">
                  <div className="p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 backdrop-blur-sm animate-pulse-slow shadow-lg">
                    <Zap className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white" aria-hidden="true" />
                  </div>
                </div>
                
                {/* Typography with improved hierarchy */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-2 sm:px-4">
                  <h1 className="font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight sm:leading-tight lg:leading-tight">
                    Analyze Any GitHub Repository
                  </h1>
                  <p className="text-white/70 text-base sm:text-lg lg:text-xl max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
                    Enter a GitHub username or repository URL to get comprehensive insights
                  </p>
                </div>
                
                {/* Error Display with better spacing */}
                {errorComponent && (
                  <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
                    {errorComponent}
                  </div>
                )}
                
                {/* Chat Input Section - Mobile-optimized */}
                <div ref={chatSectionRef} className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-0">
                  {memoizedChatInput}
                </div>
                
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loading && currentView === 'loading' && (
            <div className="flex justify-center items-center min-h-[60vh]">
              {loadingComponent}
            </div>
          )}
          
          {/* Demo Mode with Suspense */}
          {currentView === 'demo' && (
            <Suspense fallback={<LoadingSpinner variant="default" />}>
              <DemoMode />
            </Suspense>
          )}
          
          {/* User Profile View with Suspense */}
          {currentView === 'profile' && userProfile && (
            <Suspense fallback={<LoadingSpinner variant="user" />}>
              <GitHubUserProfile 
                user={userProfile} 
                repositories={userRepositories}
                onAnalyzeRepo={(repo) => {
                  const repoUrl = `https://github.com/${repo.owner.login}/${repo.name}`;
                  dispatch(startAnalysisAndNavigate(repoUrl));
                }}
              />
            </Suspense>
          )}
          
          {/* Analysis Results View with Suspense */}
          {currentView === 'analysis' && analysisResult && (
            <Suspense fallback={<LoadingSpinner variant="repository" />}>
              <div id="analysis-content" className="animate-fade-in">
                <VibeScoreResults 
                  result={analysisResult}
                  repoInfo={analysisResult?.repoInfo}
                  onNewAnalysis={handleNewAnalysis}
                  showExportModal={showExportModal}
                  setShowExportModal={setShowExportModal}
                  showShareModal={showShareModal}
                  setShowShareModal={setShowShareModal}
                />
              </div>
            </Suspense>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Built with <span className="text-red-400">❤️</span> for{' '}
              <span className="font-semibold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Cognizant Vibe Coding 2025
              </span>
            </p>
          </div>
        </div>
      </footer>
      
      {/* Export Modal with Suspense */}
      {showExportModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />}>
          <ExportModal 
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            data={{
              analysisResult,
              aiInsights,
              userProfile,
              repositories: userRepositories
            }}
          />
        </Suspense>
      )}
      
      {/* Share Modal with Suspense */}
      {showShareModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />}>
          <ShareModal 
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            data={{
              analysisResult,
              url: window.location.href
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App; 