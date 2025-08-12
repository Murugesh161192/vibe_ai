import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { getUserRepositories } from '../../services/api';

// Cache configuration
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache
const REPOS_PER_PAGE = 6; // Match UI pagination

/**
 * Initial state for repository slice
 */
const initialState = {
  // Repository data
  repositories: {},  // { username: { repos: [], lastFetch: timestamp, totalCount: number } }
  
  // Pagination state - track what pages have been fetched from API
  paginationState: {}, // { username: { fetchedApiPages: [], hasMore: true, totalCount: 0 } }
  
  // Batch fetch tracking
  lastFetchInfo: null, // { username: string, page: number, count: number, timestamp: string }
  
  // Loading states
  isLoadingRepos: false,
  loadingPage: null,
  
  // Error handling
  error: null,
  
  // Statistics
  stats: {
    apiCallCount: 0,
    cacheHits: 0,
    totalReposFetched: 0
  }
};

/**
 * Helper function to check if cache is still valid
 */
const isCacheValid = (timestamp) => {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Async thunk to fetch repositories for a specific page
 */
export const fetchRepositoriesForPage = createAsyncThunk(
  'repository/fetchForPage',
  async ({ username, uiPage, forceRefresh = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userCache = state.repository.repositories[username];
      const paginationInfo = state.repository.paginationState[username];
      
      // Calculate what we need to fetch
      const startIndex = (uiPage - 1) * REPOS_PER_PAGE;
      const endIndex = uiPage * REPOS_PER_PAGE;
      
      // Check if we already have this data in cache
      if (!forceRefresh && userCache && isCacheValid(userCache.lastFetch)) {
        const cachedPageData = userCache.repos.slice(startIndex, endIndex);
        
        // If we have all the data for this page, return from cache
        if (cachedPageData.length === REPOS_PER_PAGE || 
            (paginationInfo && !paginationInfo.hasMore && cachedPageData.length > 0)) {
          console.log(`[Redux Cache Hit] Page ${uiPage} for ${username}`);
          return {
            username,
            repos: cachedPageData,
            uiPage,
            fromCache: true,
            totalCount: userCache.totalCount
          };
        }
      }
      
      // Calculate which GitHub API page we need to fetch
      // GitHub API uses 30 repos per page, we use 6 per UI page
      // So UI pages 1-5 = API page 1, UI pages 6-10 = API page 2, etc.
      const apiPage = Math.ceil(endIndex / 30);
      const apiStartIndex = (apiPage - 1) * 30;
      
      // Check if we've already fetched this API page
      if (paginationInfo && paginationInfo.fetchedApiPages && 
          paginationInfo.fetchedApiPages.includes(apiPage) && !forceRefresh) {
        // We have the API page, return the slice we need
        const cachedPageData = userCache.repos.slice(startIndex, endIndex);
        console.log(`[Redux Slice] Returning slice for UI page ${uiPage}`);
        return {
          username,
          repos: cachedPageData,
          uiPage,
          fromCache: true,
          totalCount: userCache.totalCount
        };
      }
      
      // Need to fetch from API
      console.log(`[API Call] Fetching API page ${apiPage} for UI page ${uiPage} of ${username}`);
      const repos = await getUserRepositories(username, apiPage, 30);
      
      return {
        username,
        repos: repos || [],
        apiPage,
        uiPage,
        apiStartIndex,
        fromCache: false,
        timestamp: Date.now()
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch repositories');
    }
  }
);

/**
 * Repository slice for managing repository data
 */
const repositorySlice = createSlice({
  name: 'repository',
  initialState,
  reducers: {
    /**
     * Set repositories for a user (used for initial load)
     */
    setRepositories: (state, action) => {
      const { username, repos, totalCount } = action.payload;
      
      // Remove duplicates from incoming repos
      const uniqueRepos = [];
      const seenIds = new Set();
      
      repos.forEach(repo => {
        if (repo && repo.id && !seenIds.has(repo.id)) {
          seenIds.add(repo.id);
          uniqueRepos.push(repo);
        }
      });
      
      if (!state.repositories[username]) {
        state.repositories[username] = {
          repos: [],
          lastFetch: Date.now(),
          totalCount: totalCount || uniqueRepos.length
        };
      }
      
      state.repositories[username].repos = uniqueRepos;
      state.repositories[username].lastFetch = Date.now();
      state.repositories[username].totalCount = totalCount || uniqueRepos.length;
      
      // Initialize pagination state - Use array instead of Set for serialization
      if (!state.paginationState[username]) {
        state.paginationState[username] = {
          fetchedApiPages: [1], // First page is fetched - Using array instead of Set
          hasMore: totalCount > uniqueRepos.length,
          totalCount: totalCount || uniqueRepos.length
        };
      }
    },
    
    /**
     * Merge repositories from API fetch
     */
    mergeRepositories: (state, action) => {
      const { username, repos, apiPage, apiStartIndex } = action.payload;
      
      if (!state.repositories[username]) {
        state.repositories[username] = {
          repos: [],
          lastFetch: Date.now(),
          totalCount: null
        };
      }
      
      // Create a map of existing repos by ID to prevent duplicates
      const existingReposMap = new Map();
      state.repositories[username].repos.forEach((repo, index) => {
        if (repo && repo.id) {
          existingReposMap.set(repo.id, { repo, index });
        }
      });
      
      // Create a new array with proper length
      const currentRepos = [...state.repositories[username].repos];
      
      // Ensure array is long enough
      while (currentRepos.length < apiStartIndex + repos.length) {
        currentRepos.push(null);
      }
      
      // Insert repos at the correct position, avoiding duplicates
      repos.forEach((repo, index) => {
        if (repo && repo.id) {
          // Check if this repo already exists at a different position
          const existing = existingReposMap.get(repo.id);
          if (existing && existing.index !== apiStartIndex + index) {
            // Remove the duplicate from its old position
            currentRepos[existing.index] = null;
          }
          currentRepos[apiStartIndex + index] = repo;
        }
      });
      
      // Remove any trailing nulls and compress the array
      const finalRepos = currentRepos.filter(repo => repo !== null);
      
      state.repositories[username].repos = finalRepos;
      state.repositories[username].lastFetch = Date.now();
      
      // Update pagination state - Use array instead of Set for serialization
      if (!state.paginationState[username]) {
        state.paginationState[username] = {
          fetchedApiPages: [], // Using array instead of Set
          hasMore: true,
          totalCount: null
        };
      }
      
      // Mark this API page as fetched - Use array methods
      if (!state.paginationState[username].fetchedApiPages) {
        state.paginationState[username].fetchedApiPages = [];
      }
      
      // Only add if not already present
      if (!state.paginationState[username].fetchedApiPages.includes(apiPage)) {
        state.paginationState[username].fetchedApiPages.push(apiPage);
      }
      
      // Update hasMore flag
      if (repos.length < 30) {
        state.paginationState[username].hasMore = false;
      }
      
      // Update last fetch info
      state.lastFetchInfo = {
        username,
        apiPage,
        count: repos.length,
        timestamp: new Date().toISOString()
      };
    },
    
    /**
     * Clear repositories for a user
     */
    clearUserRepositories: (state, action) => {
      const username = action.payload;
      delete state.repositories[username];
      delete state.paginationState[username];
      
      if (state.lastFetchInfo?.username === username) {
        state.lastFetchInfo = null;
      }
    },
    
    /**
     * Clear all repository data
     */
    clearAllRepositories: (state) => {
      state.repositories = {};
      state.paginationState = {};
      state.lastFetchInfo = null;
      state.error = null;
    },
    
    /**
     * Update statistics
     */
    updateStats: (state, action) => {
      const { apiCalls = 0, cacheHits = 0, reposFetched = 0 } = action.payload;
      state.stats.apiCallCount += apiCalls;
      state.stats.cacheHits += cacheHits;
      state.stats.totalReposFetched += reposFetched;
    },
    
    /**
     * Set error
     */
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoadingRepos = false;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Handle fetchRepositoriesForPage
      .addCase(fetchRepositoriesForPage.pending, (state, action) => {
        state.isLoadingRepos = true;
        state.loadingPage = action.meta.arg.uiPage;
        state.error = null;
      })
      .addCase(fetchRepositoriesForPage.fulfilled, (state, action) => {
        const { username, repos, apiPage, uiPage, apiStartIndex, fromCache } = action.payload;
        
        // Update stats
        if (fromCache) {
          state.stats.cacheHits += 1;
        } else if (apiPage !== undefined) {
          state.stats.apiCallCount += 1;
          state.stats.totalReposFetched += repos.length;
          
          // Merge new repos into our collection
          repositorySlice.caseReducers.mergeRepositories(state, {
            payload: { username, repos, apiPage, apiStartIndex }
          });
        }
        
        state.isLoadingRepos = false;
        state.loadingPage = null;
      })
      .addCase(fetchRepositoriesForPage.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoadingRepos = false;
        state.loadingPage = null;
      });
  }
});

// Export actions
export const {
  setRepositories,
  mergeRepositories,
  clearUserRepositories,
  clearAllRepositories,
  updateStats,
  setError
} = repositorySlice.actions;

// Selectors with proper memoization
export const selectRepositoryState = (state) => state.repository;

// Direct selectors that don't need memoization
export const selectLastFetchInfo = (state) => state.repository.lastFetchInfo;
export const selectRepositoryStats = (state) => state.repository.stats;
export const selectIsLoadingRepos = (state) => state.repository.isLoadingRepos;
export const selectLoadingPage = (state) => state.repository.loadingPage;

// Memoized selectors for user-specific data
export const selectRepositoriesForUser = (username) => {
  return createSelector(
    [selectRepositoryState],
    (repository) => {
      return repository.repositories[username]?.repos || [];
    }
  );
};

// Create stable pagination selector
export const selectPaginationState = (username) => {
  // Create a stable empty state
  const emptyState = {
    hasMore: true,
    totalCount: 0,
    fetchedApiPages: []
  };
  
  return createSelector(
    [selectRepositoryState],
    (repository) => {
      const pagination = repository.paginationState[username];
      if (!pagination) {
        return emptyState;
      }
      
      // Already an array, no conversion needed
      return {
        hasMore: pagination.hasMore ?? true,
        totalCount: pagination.totalCount ?? 0,
        fetchedApiPages: pagination.fetchedApiPages || []
      };
    }
  );
};

export const selectRepositoryCache = (username) => {
  return createSelector(
    [selectRepositoryState],
    (repository) => repository.repositories[username]
  );
};

// Export reducer
export default repositorySlice.reducer; 