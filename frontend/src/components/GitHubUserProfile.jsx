import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Calendar, ExternalLink, Star, GitFork, Building, Bot, BarChart3, Activity, ChevronDown, Eye } from 'lucide-react';
import RepositoryList from './RepositoryList';
import { SummaryModal } from './Modal';
import { startAnalysisAndNavigate } from '../store/slices/analysisSlice';
import { 
  summarizeRepositoryReadme, 
  selectRepoLoadingState, 
  selectRepoError,
  selectCachedSummary 
} from '../store/slices/aiSlice';

const GitHubUserProfile = ({ user, repositories = [], onNewSearch }) => {
  const dispatch = useDispatch();
  const [loadingSummary, setLoadingSummary] = useState({});
  const [loadingAnalyze, setLoadingAnalyze] = useState({});
  const [summaryData, setSummaryData] = useState({});
  const [summaryErrors, setSummaryErrors] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    repo: null,
    summary: null,
    isLoading: false,
    error: null
  });


  // Provide default values if user data is missing or incomplete
  const safeUser = user && Object.keys(user).length > 0 ? {
    login: user.login || 'unknown',
    name: user.name || user.login || 'Unknown User',
    avatar_url: user.avatar_url || 'https://github.com/identicons/default.png',
    html_url: user.html_url || `https://github.com/${user.login || 'unknown'}`,
    bio: user.bio || null,
    location: user.location || null,
    company: user.company || null,
    email: user.email || null,
    blog: user.blog || null,
    public_repos: user.public_repos || 0,
    followers: user.followers || 0,
    created_at: user.created_at || null
  } : {
    login: 'unknown',
    name: 'Unknown User',
    avatar_url: 'https://github.com/identicons/default.png',
    html_url: 'https://github.com/unknown',
    bio: null,
    location: null,
    company: null,
    email: null,
    blog: null,
    public_repos: 0,
    followers: 0,
    created_at: null
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (!num || typeof num !== 'number') return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Calculate repository statistics
  const repoStats = React.useMemo(() => {
    if (!repositories || !Array.isArray(repositories)) {
      return { totalStars: 0, totalForks: 0, languages: 0 };
    }
    
    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    
    const uniqueLanguages = new Set();
    repositories.forEach(repo => {
      if (repo.language) uniqueLanguages.add(repo.language);
    });
    
    return {
      totalStars,
      totalForks,
      languages: uniqueLanguages.size
    };
  }, [repositories]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSummarizeRepo = async (repo) => {
    console.log('Summary clicked for repo:', repo.name);
    
    // Open modal in loading state
    setModalState({
      isOpen: true,
      repo: repo,
      summary: null,
      isLoading: true,
      error: null
    });
    
    try {
      // Dispatch Redux action to summarize the repository
      const resultAction = await dispatch(summarizeRepositoryReadme({
        owner: repo.owner.login,
        repo: repo.name,
        repoId: repo.id
      }));
      
      if (summarizeRepositoryReadme.fulfilled.match(resultAction)) {
        const response = resultAction.payload.data;
        console.log('API response received for', repo.name);
        
        // Enhanced summary with better branding
        const summaryText = response?.summary || 'No summary available';
        const aiInfo = response?.isMock ? 
          '\n\n⚠️ Demo Mode: Configure API key for full capabilities' : 
          '';
        
        const summaryMessage = `${summaryText}${aiInfo}`;
        
        // Update modal with summary
        setModalState({
          isOpen: true,
          repo: repo,
          summary: summaryMessage,
          isLoading: false,
          error: null
        });
        
        // Store summary in state for future reference
        setSummaryData(prev => ({ ...prev, [repo.id]: summaryMessage }));
        
      } else if (summarizeRepositoryReadme.rejected.match(resultAction)) {
        // Handle rejection
        const errorMessage = resultAction.payload?.error || 'Failed to generate summary';
        console.error('Error summarizing repository:', errorMessage);
        
        // Update modal with error
        setModalState({
          isOpen: true,
          repo: repo,
          summary: null,
          isLoading: false,
          error: errorMessage
        });
        
        setSummaryErrors(prev => ({ ...prev, [repo.id]: errorMessage }));
      }
    } catch (error) {
      console.error('Unexpected error summarizing repository:', error);
      
      // Update modal with error
      setModalState({
        isOpen: true,
        repo: repo,
        summary: null,
        isLoading: false,
        error: error.message || 'Failed to generate summary'
      });
      
      setSummaryErrors(prev => ({ ...prev, [repo.id]: error.message }));
    }
  };

  const handleAnalyzeRepo = async (repo) => {
    console.log('Analyze Vibe clicked for repo:', repo.name);
    
    // Set loading state for this specific repo
    setLoadingAnalyze(prev => ({ ...prev, [repo.id]: true }));
    
    try {
      // Safely construct repository URL
      const ownerLogin = repo.owner?.login || repo.full_name?.split('/')[0] || safeUser.login;
      const repoName = repo.name || repo.full_name?.split('/')[1];
      
      if (!ownerLogin || !repoName) {
        throw new Error('Unable to determine repository owner or name');
      }
      
      const repoUrl = `https://github.com/${ownerLogin}/${repoName}`;
      console.log('Constructed repo URL:', repoUrl);
      
      // Use Redux action for consistent caching and navigation
      dispatch(startAnalysisAndNavigate(repoUrl));
    } catch (error) {
      console.error('Analysis failed for', repo.name, ':', error);
      alert(`Analysis failed for ${repo.name || 'repository'}\n\nError: ${error.message}`);
    } finally {
      // Clear loading state after a short delay to show feedback
      setTimeout(() => {
        setLoadingAnalyze(prev => ({ ...prev, [repo.id]: false }));
      }, 500);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      repo: null,
      summary: null,
      isLoading: false,
      error: null
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Enhanced User Profile Card with Premium Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
        
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
            
            {/* Avatar and Basic Info - Improved Mobile Layout */}
            <div className="flex flex-col items-center lg:items-start flex-shrink-0 w-full lg:w-auto">
              <div className="relative mb-4">
                <img
                  src={safeUser.avatar_url}
                  alt={`${safeUser.login}'s avatar`}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-3 border-white/20 shadow-xl"
                  onError={(e) => {
                    e.target.src = 'https://github.com/identicons/default.png';
                  }}
                  data-testid="user-avatar"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg"></div>
              </div>
              
              <div className="text-center lg:text-left w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
                  {safeUser.name || safeUser.login}
                </h1>
                <p className="text-lg sm:text-xl text-purple-300 mb-3 font-medium">
                  @{safeUser.login}
                </p>
                {safeUser.bio && (
                  <p className="text-sm sm:text-base text-white/80 mb-4 max-w-md mx-auto lg:mx-0">
                    {safeUser.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Stats and Details - Responsive Grid */}
            <div className="flex-1 w-full min-w-0 space-y-6">
              
              {/* User Details Pills - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {safeUser.location && (
                  <div className="flex items-center gap-2.5 min-h-[40px] text-white/80 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 transition-all">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-blue-400" />
                    <span className="text-sm truncate flex-1 leading-normal">{safeUser.location}</span>
                  </div>
                )}
                {safeUser.company && (
                  <div className="flex items-center gap-2.5 min-h-[40px] text-white/80 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 transition-all">
                    <Building className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span className="text-sm truncate flex-1 leading-normal">{safeUser.company}</span>
                  </div>
                )}
                {safeUser.created_at && (
                  <div className="flex items-center gap-2.5 min-h-[40px] text-white/80 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 transition-all">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-orange-400" />
                    <span className="text-sm truncate flex-1 leading-normal">Joined {formatDate(safeUser.created_at)}</span>
                  </div>
                )}
              </div>

              {/* GitHub Stats - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 text-center border border-white/10 hover:border-white/20 transition-all">
                  <div className="relative">
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(safeUser.public_repos)}</div>
                    <div className="text-xs text-white/70 font-medium">Public Repos</div>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 text-center border border-white/10 hover:border-white/20 transition-all">
                  <div className="relative">
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(safeUser.followers)}</div>
                    <div className="text-xs text-white/70 font-medium">Followers</div>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 text-center border border-white/10 hover:border-white/20 transition-all">
                  <div className="relative">
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(repoStats.totalStars)}</div>
                    <div className="text-xs text-white/70 font-medium">Total Stars</div>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 text-center border border-white/10 hover:border-white/20 transition-all">
                  <div className="relative">
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(repoStats.totalForks)}</div>
                    <div className="text-xs text-white/70 font-medium">Total Forks</div>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 text-center border border-white/10 hover:border-white/20 transition-all col-span-2 sm:col-span-1">
                  <div className="relative">
                    <div className="text-2xl font-bold text-white mb-1">{repoStats.languages}</div>
                    <div className="text-xs text-white/70 font-medium">Languages</div>
                  </div>
                </div>
              </div>

              {/* View Profile Button - Centered on Mobile */}
              <div className="flex justify-center lg:justify-start">
                <a
                  href={safeUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-lg border border-purple-400/20 hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">View on GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Repositories Section - Better Responsive Padding */}
      {repositories && Array.isArray(repositories) && repositories.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent pointer-events-none"></div>
          
          <div className="relative p-4 sm:p-6 lg:p-8">
            <RepositoryList
              repositories={repositories}
              totalCount={safeUser.public_repos}
              username={safeUser.login}
              onAnalyzeRepo={handleAnalyzeRepo}
              onSummarizeRepo={handleSummarizeRepo}
              loadingAnalyze={loadingAnalyze}
              loadingSummary={loadingSummary}
            />
          </div>
        </div>
      )}

      {/* No Repositories Message - Enhanced */}
      {repositories && Array.isArray(repositories) && repositories.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-gray-600/5 to-transparent pointer-events-none"></div>
          <div className="relative p-10 text-center">
            <div className="max-w-md mx-auto">
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 w-fit mx-auto mb-6 shadow-lg">
                <GitFork className="w-12 h-12 text-white/40" />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-transparent rounded-2xl"></div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">No Public Repositories</h3>
              <p className="text-white/70 text-lg leading-relaxed">This user hasn't published any public repositories yet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      <SummaryModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        repo={modalState.repo}
        summary={modalState.summary}
        isLoading={modalState.isLoading}
        error={modalState.error}
      />
    </div>
  );
};

export default GitHubUserProfile; 