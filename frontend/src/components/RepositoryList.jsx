import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Star, 
  GitFork, 
  Calendar, 
  Code2, 
  BarChart3, 
  Bot, 
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  Package,
  Clock,
  Activity,
  TrendingUp,
  X,
  FileText,
  RefreshCw,
  Loader2,
  Sparkles,
  GitBranch,
  Code,
  Globe
} from 'lucide-react';
import { 
  batchSummarizeRepositories, 
  selectBatchProgress,
  selectIsLoadingBatch 
} from '../store/slices/aiSlice';
import { 
  fetchRepositoriesForPage,
  setRepositories,
  selectRepositoriesForUser,
  selectPaginationState,
  selectLastFetchInfo,
  selectRepositoryStats,
  selectIsLoadingRepos,
  selectLoadingPage
} from '../store/slices/repositorySlice';

const RepositoryList = ({ 
  repositories = [], 
  totalCount = null,
  onAnalyzeRepo, 
  onSummarizeRepo,
  loadingAnalyze = {},
  loadingSummary = {},
  username = null
}) => {
  const dispatch = useDispatch();
  const batchProgress = useSelector(selectBatchProgress);
  const isLoadingBatch = useSelector(selectIsLoadingBatch);
  
  // Create memoized selectors for this username
  const repositoriesSelector = useMemo(
    () => selectRepositoriesForUser(username),
    [username]
  );
  
  const paginationSelector = useMemo(
    () => selectPaginationState(username),
    [username]
  );
  
  // Redux selectors - Using properly memoized selectors
  const cachedRepositories = useSelector(repositoriesSelector);
  const paginationState = useSelector(paginationSelector);
  const lastFetchInfo = useSelector(selectLastFetchInfo);
  const repoStats = useSelector(selectRepositoryStats);
  const isLoadingFromRedux = useSelector(selectIsLoadingRepos);
  const loadingPage = useSelector(selectLoadingPage);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('stars');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode] = useState('compact-grid'); // Fixed to grid view only
  const [currentViewPage, setCurrentViewPage] = useState(1); // Current page being viewed
  const [itemsPerPage] = useState(6); // Items per page
  const [showFilters, setShowFilters] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [justFetchedPage, setJustFetchedPage] = useState(null); // Track just fetched page
  const [showMetrics, setShowMetrics] = useState(false); // New state for metrics visibility
  
  // Use cached repositories if available, otherwise use props
  const allRepositories = useMemo(() => {
    if (cachedRepositories.length > 0) {
      // Remove duplicates and null placeholders
      const uniqueRepos = [];
      const seenIds = new Set();
      
      cachedRepositories.forEach(repo => {
        if (repo && repo.id && !seenIds.has(repo.id)) {
          seenIds.add(repo.id);
          uniqueRepos.push(repo);
        }
      });
      
      return uniqueRepos;
    }
    return repositories;
  }, [cachedRepositories, repositories]);

  // Initialize Redux store with initial repositories (only if not already cached)
  useEffect(() => {
    if (repositories.length > 0 && cachedRepositories.length === 0 && username) {
      // Remove any duplicates from the initial repositories
      const uniqueRepos = [];
      const seenIds = new Set();
      
      repositories.forEach(repo => {
        if (repo && repo.id && !seenIds.has(repo.id)) {
          seenIds.add(repo.id);
          uniqueRepos.push(repo);
        }
      });
      
      console.log(`Initializing Redux with ${uniqueRepos.length} unique repositories for ${username}`);
      dispatch(setRepositories({ 
        username, 
        repos: uniqueRepos, 
        totalCount 
      }));
    }
  }, [repositories, cachedRepositories, username, totalCount, dispatch]);

  // Track newly fetched page
  useEffect(() => {
    if (lastFetchInfo && lastFetchInfo.username === username) {
      // Calculate which UI pages were affected by this fetch
      const apiPage = lastFetchInfo.apiPage;
      const startUIPage = (apiPage - 1) * 5 + 1; // Each API page covers 5 UI pages
      setJustFetchedPage(startUIPage);
      // Clear after 3 seconds
      const timer = setTimeout(() => setJustFetchedPage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastFetchInfo, username]);

  // Extract unique languages from repositories
  const availableLanguages = useMemo(() => {
    const languages = new Set();
    allRepositories.forEach(repo => {
      if (repo.language) languages.add(repo.language);
    });
    return Array.from(languages).sort();
  }, [allRepositories]);

  // Filter and sort repositories
  const filteredAndSortedRepos = useMemo(() => {
    let filtered = [...allRepositories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name?.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
      );
    }

    // Apply language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(repo => repo.language === selectedLanguage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = (a.name || '').localeCompare(b.name || '');
          break;
        case 'stars':
          compareValue = (a.stargazers_count || 0) - (b.stargazers_count || 0);
          break;
        case 'forks':
          compareValue = (a.forks_count || 0) - (b.forks_count || 0);
          break;
        case 'updated':
          compareValue = new Date(a.updated_at || 0) - new Date(b.updated_at || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [allRepositories, searchQuery, selectedLanguage, sortBy, sortOrder]);

  // Paginated repositories - Show based on current page
  const displayedRepos = useMemo(() => {
    const startIndex = (currentViewPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRepos = filteredAndSortedRepos.slice(startIndex, endIndex);
    
    // Ensure we never show more than itemsPerPage items
    if (pageRepos.length > itemsPerPage) {
      console.warn(`Warning: Attempting to display ${pageRepos.length} repos, limiting to ${itemsPerPage}`);
      return pageRepos.slice(0, itemsPerPage);
    }
    
    return pageRepos;
  }, [filteredAndSortedRepos, currentViewPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    // If we have a total count from GitHub, calculate maximum possible pages
    if (totalCount && filteredAndSortedRepos.length === allRepositories.length) {
      return Math.ceil(totalCount / itemsPerPage);
    }
    // Otherwise use what we have loaded
    return Math.ceil(filteredAndSortedRepos.length / itemsPerPage);
  }, [filteredAndSortedRepos.length, allRepositories.length, itemsPerPage, totalCount]);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 7;
    const currentLoadedPages = Math.ceil(filteredAndSortedRepos.length / itemsPerPage);
    const pagesToShow = Math.min(totalPages, currentLoadedPages + 1); // Show one more page to indicate more available
    
    if (pagesToShow <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= pagesToShow; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentViewPage <= 4) {
        // Near the start
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(pagesToShow);
      } else if (currentViewPage >= pagesToShow - 3) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = pagesToShow - 4; i <= pagesToShow; i++) pages.push(i);
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        for (let i = currentViewPage - 1; i <= currentViewPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(pagesToShow);
      }
    }
    
    return pages;
  }, [currentViewPage, totalPages, filteredAndSortedRepos.length, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentViewPage(1);
  }, [searchQuery, selectedLanguage, sortBy, sortOrder]);
  
  // Clean up any stuck states on mobile when page changes
  useEffect(() => {
    // Remove any lingering focus/hover states on mobile
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      const buttons = document.querySelectorAll('button[aria-label^="Go to page"]');
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.blur();
          // Remove hover class if it exists
          btn.classList.remove('hover');
        }
      });
    }
  }, [currentViewPage]);

  // Auto-fetch when navigating to a page that needs more data
  useEffect(() => {
    const startIndex = (currentViewPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredAndSortedRepos.slice(startIndex, endIndex);
    
    // Check if we need more data for this page
    if (username && pageData.length < itemsPerPage && paginationState.hasMore && !isLoadingFromRedux) {
      // We need to fetch more data
      dispatch(fetchRepositoriesForPage({ 
        username, 
        uiPage: currentViewPage
      }));
    }
  }, [currentViewPage, filteredAndSortedRepos, itemsPerPage, username, paginationState.hasMore, isLoadingFromRedux, dispatch]);

  // Force refresh from GitHub
  const handleForceRefresh = async () => {
    if (!username || isLoadingFromRedux) return;
    
    // Reset view to first page
    setCurrentViewPage(1);
    await dispatch(fetchRepositoriesForPage({ 
      username, 
      uiPage: 1,
      forceRefresh: true 
    }));
  };

  // Handle page navigation
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      // Clear any active element focus (important for mobile)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      setCurrentViewPage(pageNum);
      
      // Smooth scroll to top of repository list
      document.querySelector('#repo-list-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Force remove any hover states on mobile by triggering a reflow
      if (window.matchMedia('(hover: none)').matches) {
        document.body.style.pointerEvents = 'none';
        setTimeout(() => {
          document.body.style.pointerEvents = '';
        }, 0);
      }
    }
  };

  // Helper functions
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      Ruby: '#701516',
      PHP: '#4F5D95',
      'C++': '#f34b7d',
      'C#': '#178600',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Scala: '#c22d40',
      Shell: '#89e051',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Vue: '#4fc08d',
      React: '#61dafb'
    };
    return colors[language] || '#6e7681';
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('all');
    setSortBy('stars');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedLanguage !== 'all' || sortBy !== 'stars';
  
  // Batch summarization handler
  const handleBatchSummarize = async () => {
    if (displayedRepos.length === 0) return;
    
    console.log(`Starting batch summarization for ${displayedRepos.length} repositories`);
    setShowBatchModal(true);
    
    try {
      const resultAction = await dispatch(batchSummarizeRepositories({
        repositories: displayedRepos.slice(0, 10), // Limit to 10 for performance
        parallel: true
      }));
      
      if (batchSummarizeRepositories.fulfilled.match(resultAction)) {
        const { stats } = resultAction.payload;
        console.log(`Batch summarization completed: ${stats.fetched} fetched, ${stats.failed} failed`);
      }
    } catch (error) {
      console.error('Batch summarization failed:', error);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Metrics Overview - Enhanced for better mobile readability */}
      {showMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-white/60 mb-1">Total Repos</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">
                  {totalCount || displayedRepos.length}
                </p>
              </div>
              <GitBranch className="w-8 h-8 text-purple-400 opacity-50 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-white/60 mb-1">Total Stars</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">
                  {displayedRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0).toLocaleString()}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-400 opacity-50 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-white/60 mb-1">Languages</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">
                  {new Set(displayedRepos.map(r => r.language).filter(Boolean)).size}
                </p>
              </div>
              <Code className="w-8 h-8 text-blue-400 opacity-50 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Responsive and Professional */}
      <div className="sticky top-0 z-10 border-b border-white/10 py-4 sm:py-5 mb-4 sm:mb-6">
        <div className="w-full">
          <div className="space-y-4">
            {/* Title and Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Title */}
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-400 flex-shrink-0" aria-hidden="true" />
                <h2 id="repo-list-heading" className="text-lg sm:text-xl font-semibold text-white">
                  Public Repositories
                </h2>
              </div>
              
              {/* Action Buttons */}
              {displayedRepos.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Quick Insights Button */}
                  <button
                    onClick={handleBatchSummarize}
                    disabled={isLoadingBatch}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5
                      bg-gradient-to-r from-purple-500/10 to-blue-500/10
                      border border-purple-400/30 rounded-lg
                      text-sm font-medium text-white
                      transition-all duration-200
                      hover:from-purple-500/20 hover:to-blue-500/20
                      hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10
                      focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-gray-900
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    aria-label={isLoadingBatch ? `Generating insights: ${batchProgress.completed} of ${batchProgress.total}` : "Generate AI insights for visible repositories"}
                    aria-busy={isLoadingBatch}
                  >
                    <Bot className={`w-4 h-4 ${isLoadingBatch ? 'animate-pulse' : ''}`} aria-hidden="true" />
                    <span className="hidden sm:inline">
                      {isLoadingBatch ? `${batchProgress.completed}/${batchProgress.total}` : 'Quick Insights'}
                    </span>
                  </button>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={handleForceRefresh}
                    disabled={isLoadingFromRedux}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5
                      bg-white/5 border border-white/20 rounded-lg
                      text-sm font-medium text-white/80
                      transition-all duration-200
                      hover:bg-white/10 hover:border-white/30 hover:text-white
                      focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-gray-900
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    aria-label={isLoadingFromRedux ? "Refreshing repository data..." : "Refresh repository data from GitHub"}
                    aria-busy={isLoadingFromRedux}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingFromRedux ? 'animate-spin' : ''}`} aria-hidden="true" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col lg:flex-row gap-3" role="search" aria-label="Repository filters">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <label htmlFor="repo-search" className="sr-only">Search public repositories</label>
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-white/40 pointer-events-none z-10" aria-hidden="true" />
                <input
                  id="repo-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repositories..."
                  className={`
                    w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-2.5
                    bg-white/5 text-white border border-white/20 rounded-lg
                    text-xs sm:text-sm placeholder-white/40
                    transition-all duration-200
                    hover:bg-white/10 hover:border-white/30
                    focus:outline-none focus:bg-white/10 focus:border-purple-400/50
                    focus:ring-2 focus:ring-purple-400/30 focus:ring-offset-2 focus:ring-offset-gray-900
                  `}
                  aria-describedby="search-description"
                />
                <span id="search-description" className="sr-only">
                  Search by repository name, description, or programming language
                </span>
              </div>

              {/* Filter Controls */}
              <div className="flex gap-2 sm:gap-3">
                {/* Language Filter */}
                <div className="relative flex-1 lg:flex-initial">
                  <label htmlFor="language-filter" className="sr-only">Filter by programming language</label>
                  <div className="relative">
                    <Globe className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none z-10" aria-hidden="true" />
                    <select
                      id="language-filter"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className={`
                        w-full lg:w-52 pl-3 sm:pl-10 pr-7 sm:pr-10 py-2 sm:py-2.5
                        bg-white/5 border border-white/20 rounded-lg
                        text-xs sm:text-sm text-white
                        transition-all duration-200 appearance-none cursor-pointer
                        hover:bg-white/10 hover:border-white/30
                        focus:outline-none focus:bg-white/10 focus:border-purple-400/50
                        focus:ring-2 focus:ring-purple-400/30 focus:ring-offset-2 focus:ring-offset-gray-900
                      `}
                      aria-label="Filter repositories by programming language"
                    >
                      <option value="all">All Languages</option>
                      {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-white/40 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="relative flex-1 lg:flex-initial">
                  <label htmlFor="sort-filter" className="sr-only">Sort repositories</label>
                  <div className="relative">
                    <Star className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none z-10" aria-hidden="true" />
                    <select
                      id="sort-filter"
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [newSortBy, newSortOrder] = e.target.value.split('-');
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                      }}
                      className={`
                        w-full lg:w-52 pl-3 sm:pl-10 pr-7 sm:pr-10 py-2 sm:py-2.5
                        bg-white/5 border border-white/20 rounded-lg
                        text-xs sm:text-sm text-white
                        transition-all duration-200 appearance-none cursor-pointer
                        hover:bg-white/10 hover:border-white/30
                        focus:outline-none focus:bg-white/10 focus:border-purple-400/50
                        focus:ring-2 focus:ring-purple-400/30 focus:ring-offset-2 focus:ring-offset-gray-900
                      `}
                      aria-label="Sort repositories"
                    >
                      <option value="stars-desc">Most Stars</option>
                      <option value="stars-asc">Least Stars</option>
                      <option value="forks-desc">Most Forks</option>
                      <option value="forks-asc">Least Forks</option>
                      <option value="updated-desc">Recently Updated</option>
                      <option value="updated-asc">Least Recently Updated</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                    </select>
                    <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-white/40 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className={`
                      px-2.5 sm:px-3 py-2 sm:py-2.5
                      bg-red-500/10 border border-red-400/30 rounded-lg
                      text-xs sm:text-sm font-medium text-red-400
                      transition-all duration-200
                      hover:bg-red-500/20 hover:border-red-400/50
                      focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:ring-offset-2 focus:ring-offset-gray-900
                      flex items-center justify-center
                    `}
                    aria-label="Clear all filters"
                    title="Clear filters"
                  >
                    <X className="w-3.5 sm:w-4 h-3.5 sm:h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Display with Grid View Only */}
      <div id="repo-list-top" aria-labelledby="repo-list-heading">
        {displayedRepos.length > 0 || loadingPage === currentViewPage ? (
          <div 
            className='grid gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            role="list"
            aria-busy={loadingPage === currentViewPage}
            aria-live="polite"
            aria-relevant="additions removals"
          >
            {/* Show loading placeholders if fetching this page */}
            {loadingPage === currentViewPage && displayedRepos.length < itemsPerPage && (
              <>
                {[...Array(itemsPerPage - displayedRepos.length)].map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 animate-pulse"
                    role="listitem"
                    aria-label="Loading repository..."
                  >
                    <div className="h-5 bg-white/10 rounded mb-3"></div>
                    <div className="h-3 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 w-8 bg-white/10 rounded"></div>
                      <div className="h-8 w-8 bg-white/10 rounded"></div>
                      <div className="h-8 w-8 bg-white/10 rounded"></div>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {/* Display actual repos */}
            {displayedRepos.map((repo, index) => (
              <RepositoryCard
                key={repo.id || repo.name}
                repo={repo}
                index={index}
                viewMode={viewMode}
                onAnalyze={() => onAnalyzeRepo(repo)}
                onSummarize={() => onSummarizeRepo(repo)}
                loadingAnalyze={loadingAnalyze[repo.id]}
                loadingSummary={loadingSummary[repo.id]}
                formatNumber={formatNumber}
                formatDate={formatDate}
                getLanguageColor={getLanguageColor}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-10 h-10 text-white/30 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-white mb-2">No public repositories found</h3>
            <p className="text-sm text-white/60 max-w-sm">
              {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'No public repositories to display'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-md border border-purple-400/20 hover:bg-purple-500/30 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {(totalPages > 1 || paginationState.hasMore) && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Info */}
          <div className="text-sm text-white/60 order-2 sm:order-1">
            Page {currentViewPage} of {totalPages}
            {filteredAndSortedRepos.length > 0 && (
              <span> • Showing {((currentViewPage - 1) * itemsPerPage) + 1}-{Math.min(currentViewPage * itemsPerPage, filteredAndSortedRepos.length)} of {filteredAndSortedRepos.length}</span>
            )}
            {totalCount && filteredAndSortedRepos.length < totalCount && (
              <span className="text-white/40"> ({totalCount} total available)</span>
            )}
          </div>
          
          {/* Page Navigation */}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentViewPage - 1)}
              disabled={currentViewPage === 1}
              className="px-2.5 py-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-white/40">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={(e) => {
                      e.currentTarget.blur(); // Remove focus after click (important for mobile)
                      goToPage(page);
                    }}
                    onMouseLeave={(e) => {
                      // Force remove hover state on mouse leave
                      e.currentTarget.blur();
                    }}
                    disabled={loadingPage === page}
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all select-none ${
                      currentViewPage === page
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/20'
                        : page > Math.ceil(filteredAndSortedRepos.length / itemsPerPage)
                        ? 'text-white/40 hover:text-white hover:bg-white/10 border border-dashed border-white/20'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    } ${loadingPage === page ? 'cursor-wait' : ''} focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900`}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentViewPage === page ? 'page' : undefined}
                  >
                    {loadingPage === page && (
                      <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    )}
                    <span className={loadingPage === page ? 'opacity-0' : ''}>{page}</span>
                  </button>
                )
              ))}
            </div>
            
            {/* Next Button */}
            <button
              onClick={() => goToPage(currentViewPage + 1)}
              disabled={currentViewPage === totalPages || loadingPage !== null}
              className="px-2.5 py-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Repository Status Indicator */}
      {filteredAndSortedRepos.length > 0 && (
        <div className="mt-4 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
          <div className="text-center text-xs sm:text-sm text-white/80 space-y-1">
            {/* Main status */}
            <div className="font-medium">
              📊 Loaded {filteredAndSortedRepos.length} of {totalCount || '?'} repositories
              {allRepositories.length !== filteredAndSortedRepos.length && (
                <span className="text-purple-300 ml-1">
                  (filtered from {allRepositories.length} total)
                </span>
              )}
            </div>
            
            {/* New fetch indicator */}
            {justFetchedPage !== null && (
              <div className="text-green-400 text-[10px] sm:text-xs flex items-center">
                <Sparkles className="w-3 h-3 mr-1 animate-pulse" aria-hidden="true" />
                ✨ Just fetched new repositories for pages {justFetchedPage}-{justFetchedPage + 4}!
              </div>
            )}
            
            {/* Removed cache status display - no longer showing cache statistics */}

            {/* Action hints */}
            <div className="text-white/60 text-[11px] sm:text-xs">
              {paginationState.hasMore && (
                <span>💡 Navigate to new pages to automatically load more repositories</span>
              )}
              {!paginationState.hasMore && totalCount && filteredAndSortedRepos.length >= totalCount && (
                <span>✅ All {totalCount} repositories loaded</span>
              )}
              {loadingPage && (
                <span className="ml-2 text-blue-300">
                  <Loader2 className="inline w-3 h-3 mr-1 animate-spin" aria-hidden="true" />
                  Fetching page {loadingPage}...
                </span>
              )}
            </div>
            
            {/* Total fetched info */}
            {totalCount && (
              <div className="text-[10px] text-white/40 pt-1 border-t border-white/10">
                Progress: {Math.round((filteredAndSortedRepos.length / totalCount) * 100)}% of total repositories loaded
                {paginationState.fetchedApiPages.length > 0 && (
                  <span className="ml-1">
                    • API pages fetched: {paginationState.fetchedApiPages.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Optimized Repository Card Component with Better Alignment
const RepositoryCard = ({ 
  repo, 
  index,
  viewMode, 
  onAnalyze, 
  onSummarize, 
  loadingAnalyze, 
  loadingSummary,
  formatNumber,
  formatDate,
  getLanguageColor
}) => {
  // List View - Better Alignment
  if (viewMode === 'list') {
    return (
      <article 
        className="group bg-white/5 hover:bg-white/8 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:border-purple-400/30 transition-all focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-900"
        data-testid={`repo-card-${index}`}
        role="listitem"
        aria-label={`Repository: ${repo.name}${repo.description ? `, ${repo.description}` : ''}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Repository Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-white group-hover:text-purple-300 transition-colors truncate mb-1.5">
              <a 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline focus:outline-none focus:underline focus:text-purple-300"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${repo.name} - View on GitHub`}
              >
                {repo.name}
              </a>
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              {repo.language && (
                <span className="inline-flex items-center gap-1" aria-label={`Language: ${repo.language}`}>
                  <span 
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: getLanguageColor(repo.language) }}
                    aria-hidden="true"
                  />
                  <span className="leading-none">{repo.language}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1" aria-label={`${formatNumber(repo.stargazers_count || 0)} stars`}>
                <Star className="inline-block w-3 h-3" aria-hidden="true" />
                <span className="leading-none">{formatNumber(repo.stargazers_count || 0)}</span>
              </span>
              <span className="inline-flex items-center gap-1" aria-label={`${formatNumber(repo.forks_count || 0)} forks`}>
                <GitFork className="inline-block w-3 h-3" aria-hidden="true" />
                <span className="leading-none">{formatNumber(repo.forks_count || 0)}</span>
              </span>
              <span className="inline-flex items-center gap-1" aria-label={`Last updated ${formatDate(repo.updated_at)}`}>
                <Clock className="inline-block w-3 h-3" aria-hidden="true" />
                <span className="leading-none">{formatDate(repo.updated_at)}</span>
              </span>
            </div>
          </div>

          {/* Actions - Fixed Alignment */}
          <div className="flex items-center gap-1.5 flex-shrink-0" role="group" aria-label="Repository actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              disabled={loadingAnalyze}
              className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              title={`Analyze vibe score for ${repo.name}`}
              aria-label={`Analyze vibe score for ${repo.name}`}
              aria-busy={loadingAnalyze}
            >
              <BarChart3 className={`w-4 h-4 ${loadingAnalyze ? 'mobile-slow-spin' : ''}`} aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSummarize();
              }}
              disabled={loadingSummary}
              className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              title={`Generate AI summary for ${repo.name}`}
              aria-label={`Generate AI summary for ${repo.name}`}
              aria-busy={loadingSummary}
            >
              <Bot className={`w-4 h-4 ${loadingSummary ? 'mobile-slow-spin' : ''}`} aria-hidden="true" />
            </button>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center w-8 h-8 bg-white/5 text-white/70 rounded hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900"
              title={`View ${repo.name} on GitHub`}
              aria-label={`View ${repo.name} on GitHub (opens in new tab)`}
            >
              <ExternalLink className={`w-4 h-4`} aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // Compact Grid View - Better Alignment and Spacing
  return (
    <article 
      className="group relative bg-white/5 hover:bg-white/8 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-purple-400/30 transition-all flex flex-col h-full focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-900"
      data-testid={`repo-card-${index}`}
      role="listitem"
      aria-label={`Repository: ${repo.name}${repo.description ? `, ${repo.description}` : ''}`}
    >
      {/* Card Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="mb-3">
          <h3 className="font-medium text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
            <a 
              href={repo.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline focus:outline-none focus:underline focus:text-purple-300"
              onClick={(e) => e.stopPropagation()}
              aria-label={`${repo.name} - View on GitHub`}
            >
              {repo.name}
            </a>
          </h3>
          {repo.description && (
            <p className="text-xs text-white/50 line-clamp-2" title={repo.description}>
              {repo.description}
            </p>
          )}
        </header>

        {/* Metadata - Better Alignment */}
        <div className="flex-1 space-y-2 text-xs">
          {repo.language && (
            <div className="flex items-center gap-1.5" aria-label={`Language: ${repo.language}`}>
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: getLanguageColor(repo.language) }}
                aria-hidden="true"
              />
              <span className="text-white/60 truncate">{repo.language}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-white/60" aria-label={`${formatNumber(repo.stargazers_count || 0)} stars`}>
                <Star className="w-3 h-3" aria-hidden="true" />
                <span>{formatNumber(repo.stargazers_count || 0)}</span>
              </span>
              <span className="flex items-center gap-1 text-white/60" aria-label={`${formatNumber(repo.forks_count || 0)} forks`}>
                <GitFork className="w-3 h-3" aria-hidden="true" />
                <span>{formatNumber(repo.forks_count || 0)}</span>
              </span>
            </div>
            <span className="text-white/40 text-xs truncate" aria-label={`Last updated ${formatDate(repo.updated_at)}`}>
              {formatDate(repo.updated_at)}
            </span>
          </div>
        </div>

        {/* Actions - Consistent Button Layout */}
        <footer className="mt-3 pt-3 border-t border-white/10">
          <div className="flex gap-1.5" role="group" aria-label="Repository actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              disabled={loadingAnalyze}
              className="flex-1 inline-flex items-center justify-center px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-400/20 hover:bg-purple-500/30 transition-all gap-1.5 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={`Analyze vibe score for ${repo.name}`}
              aria-busy={loadingAnalyze}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${loadingAnalyze ? 'mobile-slow-spin' : ''}`} aria-hidden="true" />
              <span>Analyze</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSummarize();
              }}
              disabled={loadingSummary}
              className="inline-flex items-center justify-center px-2.5 py-1.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-400/20 hover:bg-blue-500/30 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              title={`Generate AI summary for ${repo.name}`}
              aria-label={`Generate AI summary for ${repo.name}`}
              aria-busy={loadingSummary}
            >
              <Bot className={`w-3.5 h-3.5 ${loadingSummary ? 'mobile-slow-spin' : ''}`} aria-hidden="true" />
            </button>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center px-2.5 py-1.5 bg-white/5 text-white/60 rounded text-xs border border-white/10 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900"
              title={`View ${repo.name} on GitHub`}
              aria-label={`View ${repo.name} on GitHub (opens in new tab)`}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default RepositoryList; 