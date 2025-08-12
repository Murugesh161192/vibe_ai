import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { summarizeReadme, batchSummarizeReadme } from '../../services/api';

// Cache configuration
const CACHE_TTL = {
  summary: 30 * 60 * 1000,     // 30 minutes for summaries
  batch: 30 * 60 * 1000,        // 30 minutes for batch summaries
};

/**
 * Initial state for AI slice
 */
const initialState = {
  // Single summary state
  currentSummary: null,
  
  // Cache for summaries { "owner/repo": { data, timestamp } }
  summaryCache: {},
  
  // Loading states
  isLoadingSummary: false,
  isLoadingBatch: false,
  
  // Error states
  summaryError: null,
  batchError: null,
  
  // Batch processing state
  batchSummaries: {},
  batchProgress: {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false
  },
  
  // Repository-specific loading states
  repoLoadingStates: {},  // { repoId: boolean }
  repoErrors: {},          // { repoId: errorMessage }
};

/**
 * Helper function to check if cache is still valid
 */
const isCacheValid = (timestamp, ttl) => {
  if (!timestamp) return false;
  return Date.now() - new Date(timestamp).getTime() < ttl;
};

/**
 * Helper function to generate cache key
 */
const getCacheKey = (owner, repo) => {
  return `${owner}/${repo}`;
};

/**
 * Helper function to get cached summary
 */
const getCachedSummary = (state, owner, repo) => {
  const cacheKey = getCacheKey(owner, repo);
  const cached = state.summaryCache[cacheKey];
  if (cached && isCacheValid(cached.timestamp, CACHE_TTL.summary)) {
    return cached.data;
  }
  return null;
};

/**
 * Async thunk for summarizing a single README
 */
export const summarizeRepositoryReadme = createAsyncThunk(
  'ai/summarizeReadme',
  async ({ owner, repo, repoId }, { rejectWithValue, getState }) => {
    try {
      // Check cache first
      const state = getState().ai;
      const cachedSummary = getCachedSummary(state, owner, repo);
      
      if (cachedSummary) {
        console.log(`Using cached summary for ${owner}/${repo}`);
        return { 
          owner,
          repo,
          repoId,
          data: cachedSummary,
          fromCache: true
        };
      }
      
      console.log(`Fetching fresh summary for ${owner}/${repo}`);
      const response = await summarizeReadme(owner, repo);
      
      return { 
        owner,
        repo,
        repoId,
        data: response,
        fromCache: false
      };
    } catch (error) {
      return rejectWithValue({
        owner,
        repo,
        repoId,
        error: error.message || 'Failed to generate summary'
      });
    }
  }
);

/**
 * Async thunk for batch summarizing multiple READMEs
 */
export const batchSummarizeRepositories = createAsyncThunk(
  'ai/batchSummarize',
  async ({ repositories, parallel = true }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState().ai;
      const reposToFetch = [];
      const cachedResults = {};
      
      // Check cache for each repository
      repositories.forEach(repo => {
        const owner = repo.owner?.login || repo.owner;
        const name = repo.name || repo.repo;
        const cacheKey = getCacheKey(owner, name);
        const cachedSummary = getCachedSummary(state, owner, name);
        
        if (cachedSummary) {
          console.log(`Using cached summary for ${cacheKey}`);
          cachedResults[cacheKey] = {
            owner,
            repo: name,
            data: cachedSummary,
            fromCache: true
          };
        } else {
          reposToFetch.push({ owner, repo: name });
        }
      });
      
      let freshResults = {};
      
      // Fetch summaries for non-cached repositories
      if (reposToFetch.length > 0) {
        console.log(`Fetching ${reposToFetch.length} fresh summaries`);
        
        if (parallel) {
          // Use batch API endpoint
          const response = await batchSummarizeReadme(reposToFetch, true);
          
          // Process batch response
          if (response.results) {
            response.results.forEach(result => {
              const cacheKey = getCacheKey(result.owner, result.repo);
              freshResults[cacheKey] = {
                owner: result.owner,
                repo: result.repo,
                data: result.data,
                fromCache: false,
                error: result.error
              };
            });
          }
        } else {
          // Sequential processing
          for (const repo of reposToFetch) {
            try {
              const response = await summarizeReadme(repo.owner, repo.repo);
              const cacheKey = getCacheKey(repo.owner, repo.repo);
              freshResults[cacheKey] = {
                owner: repo.owner,
                repo: repo.repo,
                data: response,
                fromCache: false
              };
              
              // Update progress
              dispatch(updateBatchProgress({
                completed: Object.keys(freshResults).length + Object.keys(cachedResults).length,
                total: repositories.length
              }));
            } catch (error) {
              const cacheKey = getCacheKey(repo.owner, repo.repo);
              freshResults[cacheKey] = {
                owner: repo.owner,
                repo: repo.repo,
                error: error.message,
                fromCache: false
              };
            }
          }
        }
      }
      
      // Combine cached and fresh results
      const allResults = { ...cachedResults, ...freshResults };
      
      return {
        results: allResults,
        stats: {
          total: repositories.length,
          cached: Object.keys(cachedResults).length,
          fetched: Object.keys(freshResults).length,
          failed: Object.values(allResults).filter(r => r.error).length
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to batch summarize repositories');
    }
  }
);

/**
 * AI slice
 */
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Clear current summary
    clearCurrentSummary: (state) => {
      state.currentSummary = null;
      state.summaryError = null;
    },
    
    // Clear all summaries cache
    clearSummaryCache: (state) => {
      state.summaryCache = {};
      state.batchSummaries = {};
    },
    
    // Clear specific repository cache
    clearRepositoryCache: (state, action) => {
      const { owner, repo } = action.payload;
      const cacheKey = getCacheKey(owner, repo);
      delete state.summaryCache[cacheKey];
      delete state.batchSummaries[cacheKey];
    },
    
    // Update batch progress
    updateBatchProgress: (state, action) => {
      state.batchProgress = {
        ...state.batchProgress,
        ...action.payload
      };
    },
    
    // Reset batch progress
    resetBatchProgress: (state) => {
      state.batchProgress = {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: false
      };
    },
    
    // Set repository loading state
    setRepoLoadingState: (state, action) => {
      const { repoId, isLoading } = action.payload;
      state.repoLoadingStates[repoId] = isLoading;
    },
    
    // Set repository error
    setRepoError: (state, action) => {
      const { repoId, error } = action.payload;
      if (error) {
        state.repoErrors[repoId] = error;
      } else {
        delete state.repoErrors[repoId];
      }
    },
    
    // Clear all errors
    clearErrors: (state) => {
      state.summaryError = null;
      state.batchError = null;
      state.repoErrors = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Single summary cases
      .addCase(summarizeRepositoryReadme.pending, (state, action) => {
        state.isLoadingSummary = true;
        state.summaryError = null;
        
        // Set repo-specific loading state if repoId provided
        if (action.meta.arg.repoId) {
          state.repoLoadingStates[action.meta.arg.repoId] = true;
          delete state.repoErrors[action.meta.arg.repoId];
        }
      })
      .addCase(summarizeRepositoryReadme.fulfilled, (state, action) => {
        state.isLoadingSummary = false;
        const { owner, repo, repoId, data, fromCache } = action.payload;
        const cacheKey = getCacheKey(owner, repo);
        
        // Update current summary
        state.currentSummary = data;
        
        // Update cache if not from cache
        if (!fromCache) {
          state.summaryCache[cacheKey] = {
            data,
            timestamp: new Date().toISOString()
          };
        }
        
        // Clear repo-specific loading state
        if (repoId) {
          state.repoLoadingStates[repoId] = false;
        }
      })
      .addCase(summarizeRepositoryReadme.rejected, (state, action) => {
        state.isLoadingSummary = false;
        const { repoId, error } = action.payload || {};
        
        state.summaryError = error || action.error.message;
        
        // Set repo-specific error
        if (repoId) {
          state.repoLoadingStates[repoId] = false;
          state.repoErrors[repoId] = error || action.error.message;
        }
      })
      
      // Batch summary cases
      .addCase(batchSummarizeRepositories.pending, (state) => {
        state.isLoadingBatch = true;
        state.batchError = null;
        state.batchProgress.inProgress = true;
      })
      .addCase(batchSummarizeRepositories.fulfilled, (state, action) => {
        state.isLoadingBatch = false;
        const { results, stats } = action.payload;
        
        // Update batch summaries
        state.batchSummaries = results;
        
        // Update cache for successfully fetched summaries
        Object.entries(results).forEach(([cacheKey, result]) => {
          if (!result.error && !result.fromCache && result.data) {
            state.summaryCache[cacheKey] = {
              data: result.data,
              timestamp: new Date().toISOString()
            };
          }
        });
        
        // Update progress
        state.batchProgress = {
          total: stats.total,
          completed: stats.total,
          failed: stats.failed,
          inProgress: false
        };
      })
      .addCase(batchSummarizeRepositories.rejected, (state, action) => {
        state.isLoadingBatch = false;
        state.batchError = action.payload || action.error.message;
        state.batchProgress.inProgress = false;
      });
  }
});

// Export actions
export const {
  clearCurrentSummary,
  clearSummaryCache,
  clearRepositoryCache,
  updateBatchProgress,
  resetBatchProgress,
  setRepoLoadingState,
  setRepoError,
  clearErrors
} = aiSlice.actions;

// Selectors
export const selectCurrentSummary = (state) => state.ai.currentSummary;
export const selectSummaryCache = (state) => state.ai.summaryCache;
export const selectIsLoadingSummary = (state) => state.ai.isLoadingSummary;
export const selectIsLoadingBatch = (state) => state.ai.isLoadingBatch;
export const selectSummaryError = (state) => state.ai.summaryError;
export const selectBatchError = (state) => state.ai.batchError;
export const selectBatchSummaries = (state) => state.ai.batchSummaries;
export const selectBatchProgress = (state) => state.ai.batchProgress;
export const selectRepoLoadingState = (repoId) => (state) => state.ai.repoLoadingStates[repoId] || false;
export const selectRepoError = (repoId) => (state) => state.ai.repoErrors[repoId];
export const selectCachedSummary = (owner, repo) => (state) => {
  const cacheKey = `${owner}/${repo}`;
  return state.ai.summaryCache[cacheKey]?.data || null;
};

// Export reducer
export default aiSlice.reducer; 