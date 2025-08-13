import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeRepository, generateInsights } from '../../services/api';
import { setCurrentView, setLoading } from '../slices/appSlice';

// Cache configuration
const CACHE_TTL = {
  analysis: 60 * 60 * 1000,    // 1 hour for analysis
  insights: 30 * 60 * 1000,     // 30 minutes for AI insights
};

/**
 * Initial state for analysis slice
 */
const initialState = {
  currentAnalysis: null,
  aiInsights: null,
  analysisHistory: [],
  insightsCache: {},  // Separate cache for insights { repoUrl: { data, timestamp } }
  isAnalyzing: false,
  isGeneratingInsights: false,
  analysisError: null,
  insightsError: null,
  lastAnalysisTime: null,
  comparisonData: null,
  benchmarks: {
    industry: {
      average: 65,
      topPercentile: 85,
      median: 60
    },
    similarRepos: []
  }
};

/**
 * Helper function to check if cache is still valid
 */
const isCacheValid = (timestamp, ttl) => {
  if (!timestamp) return false;
  return Date.now() - new Date(timestamp).getTime() < ttl;
};

/**
 * Helper function to get cached insights
 */
const getCachedInsights = (state, repoUrl) => {
  const cached = state.insightsCache[repoUrl];
  if (cached && isCacheValid(cached.timestamp, CACHE_TTL.insights)) {
    return cached.data;
  }
  return null;
};

/**
 * Async thunk for analyzing repository
 */
export const analyzeRepo = createAsyncThunk(
  'analysis/analyzeRepo',
  async (repoUrl, { rejectWithValue }) => {
    try {
      const response = await analyzeRepository(repoUrl);
      return {
        ...response, // Changed from response.data to response since analyzeRepository already returns the data
        repoUrl,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to analyze repository');
    }
  }
);

/**
 * Async thunk for generating AI insights
 */
export const generateAIInsights = createAsyncThunk(
  'analysis/generateInsights',
  async (repoUrl, { rejectWithValue, getState }) => {
    try {
      // Check cache first
      const state = getState().analysis;
      const cachedInsights = getCachedInsights(state, repoUrl);
      
      if (cachedInsights) {
        return { 
          data: cachedInsights, 
          fromCache: true,
          repoUrl 
        };
      }
      
      const response = await generateInsights(repoUrl);
      return { 
        data: response.data || response, // Handle both response.data and direct response
        fromCache: false,
        repoUrl 
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate AI insights');
    }
  }
);

/**
 * Async thunk for complete analysis (both basic and AI insights)
 */
export const performCompleteAnalysis = createAsyncThunk(
  'analysis/complete',
  async (repoUrl, { dispatch, getState }) => {
    const state = getState().analysis;
    
    // Check if we have cached analysis
    const existingHistoryEntry = state.analysisHistory.find(
      (h) => h.repoUrl === repoUrl
    );

    // Check cached insights separately
    const cachedInsights = getCachedInsights(state, repoUrl);
    
    // Check if analysis cache is still valid
    let hasCachedAnalysis = false;
    if (existingHistoryEntry) {
      hasCachedAnalysis = isCacheValid(existingHistoryEntry.timestamp, CACHE_TTL.analysis);
    }

    // If both caches are valid, use them
    if (hasCachedAnalysis && cachedInsights) {
      dispatch(setAnalysisResult(existingHistoryEntry.analysis));
      dispatch(setAiInsights(cachedInsights));
      return { 
        fromCache: true,
        analysis: existingHistoryEntry.analysis,
        insights: cachedInsights
      };
    }
    
    // Prepare promises for parallel execution
    const promises = [];
    
    // Only fetch analysis if not cached
    if (!hasCachedAnalysis) {
      promises.push(dispatch(analyzeRepo(repoUrl)));
    } else {
      // Use cached analysis
      dispatch(setAnalysisResult(existingHistoryEntry.analysis));
      promises.push(Promise.resolve({ 
        status: 'fulfilled', 
        value: { payload: existingHistoryEntry.analysis } 
      }));
    }
    
    // Always fetch insights (the thunk will check its own cache)
    promises.push(dispatch(generateAIInsights(repoUrl)));

    // Run required operations in parallel
    const results = await Promise.allSettled(promises);
    const [analysisResult, insightsResult] = results;

    return {
      analysis: analysisResult.status === 'fulfilled' ? 
        (hasCachedAnalysis ? existingHistoryEntry.analysis : analysisResult.value.payload) : null,
      insights: insightsResult.status === 'fulfilled' ? 
        insightsResult.value.payload.data : null,
      analysisError: analysisResult.status === 'rejected' ? analysisResult.reason : null,
      insightsError: insightsResult.status === 'rejected' ? insightsResult.reason : null,
      fromCache: hasCachedAnalysis && insightsResult.value?.payload?.fromCache
    };
  }
);

export const startAnalysis = createAsyncThunk(
  'analysis/start',
  async (repoUrl, { dispatch }) => {
    // Set loading state
    dispatch(setLoading(true));
    
    let normalizedUrl = repoUrl.trim();
    if (
      !normalizedUrl.startsWith('https://') &&
      !normalizedUrl.startsWith('http://')
    ) {
      if (normalizedUrl.split('/').length === 2) {
        normalizedUrl = `https://github.com/${normalizedUrl}`;
      }
    }
    
    // Dispatch the complete analysis
    const result = await dispatch(performCompleteAnalysis(normalizedUrl));
    
    // Clear loading state
    dispatch(setLoading(false));
    
    return result;
  }
);

export const startAnalysisAndNavigate = createAsyncThunk(
  'analysis/startAndNavigate',
  async (repoUrl, { dispatch }) => {
    // Set loading state
    dispatch(setLoading(true));
    
    let normalizedUrl = repoUrl.trim();
    if (
      !normalizedUrl.startsWith('https://') &&
      !normalizedUrl.startsWith('http://')
    ) {
      if (normalizedUrl.split('/').length === 2) {
        normalizedUrl = `https://github.com/${normalizedUrl}`;
      }
    }
    
    try {
      // Dispatch the complete analysis
      const result = await dispatch(performCompleteAnalysis(normalizedUrl));
      
      // Check if we have any successful results (including cached data)
      const hasAnalysis = result.payload?.analysis || (result.payload?.fromCache && result.payload?.analysis);
      const hasInsights = result.payload?.insights;
      
      // Navigate to analysis view if we have at least the analysis data
      // (insights can fail but we should still show the analysis)
      if (hasAnalysis) {
        dispatch(setCurrentView('analysis'));
      } else if (result.payload?.analysisError) {
        // If there's an analysis error, stay on ready view to show the error
        dispatch(setCurrentView('ready'));
      }
      
      // Clear loading state
      dispatch(setLoading(false));
      
      return result;
    } catch (error) {
      console.error('Unexpected error in startAnalysisAndNavigate:', error);
      // Handle unexpected errors
      dispatch(setLoading(false));
      dispatch(setCurrentView('ready'));
      throw error;
    }
  }
);

/**
 * Analysis slice for repository analysis state
 */
const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    /**
     * Set analysis result
     */
    setAnalysisResult: (state, action) => {
      state.currentAnalysis = {
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.lastAnalysisTime = new Date().toISOString();
    },

    /**
     * Set AI insights
     */
    setAiInsights: (state, action) => {
      state.aiInsights = action.payload;
    },

    /**
     * Clear current analysis
     */
    clearAnalysis: (state) => {
      state.currentAnalysis = null;
      state.aiInsights = null;
      state.analysisError = null;
      state.insightsError = null;
      // Don't clear cache here - let it expire naturally
    },

    /**
     * Clear all caches
     */
    clearAllCaches: (state) => {
      state.analysisHistory = [];
      state.insightsCache = {};
      state.currentAnalysis = null;
      state.aiInsights = null;
    },

    /**
     * Clear expired caches
     */
    clearExpiredCaches: (state) => {
      // Clear expired analysis history
      state.analysisHistory = state.analysisHistory.filter(
        h => isCacheValid(h.timestamp, CACHE_TTL.analysis)
      );
      
      // Clear expired insights cache
      Object.keys(state.insightsCache).forEach(repoUrl => {
        if (!isCacheValid(state.insightsCache[repoUrl].timestamp, CACHE_TTL.insights)) {
          delete state.insightsCache[repoUrl];
        }
      });
    },

    /**
     * Invalidate cache for a specific repository
     */
    invalidateRepoCache: (state, action) => {
      const repoUrl = action.payload;
      
      // Remove from analysis history
      state.analysisHistory = state.analysisHistory.filter(
        h => h.repoUrl !== repoUrl
      );
      
      // Remove from insights cache
      delete state.insightsCache[repoUrl];
      
      // Clear current if it matches
      if (state.currentAnalysis?.repoUrl === repoUrl) {
        state.currentAnalysis = null;
        state.aiInsights = null;
      }
    },

    /**
     * Add to analysis history
     */
    addToHistory: (state, action) => {
      const historyEntry = {
        ...action.payload,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      
      // Remove if same repo already exists
      state.analysisHistory = state.analysisHistory.filter(
        h => h.repositoryInfo?.full_name !== action.payload.repositoryInfo?.full_name
      );
      
      // Add to beginning
      state.analysisHistory.unshift(historyEntry);
      
      // Keep only last 20
      if (state.analysisHistory.length > 20) {
        state.analysisHistory.pop();
      }
    },

    /**
     * Remove from history
     */
    removeFromHistory: (state, action) => {
      state.analysisHistory = state.analysisHistory.filter(
        h => h.id !== action.payload
      );
    },

    /**
     * Clear history
     */
    clearHistory: (state) => {
      state.analysisHistory = [];
    },

    /**
     * Set comparison data
     */
    setComparisonData: (state, action) => {
      state.comparisonData = action.payload;
    },

    /**
     * Update benchmarks
     */
    updateBenchmarks: (state, action) => {
      state.benchmarks = {
        ...state.benchmarks,
        ...action.payload
      };
    },

    /**
     * Add similar repository for comparison
     */
    addSimilarRepo: (state, action) => {
      const repo = {
        ...action.payload,
        addedAt: new Date().toISOString()
      };
      
      // Check if already exists
      const exists = state.benchmarks.similarRepos.some(
        r => r.full_name === action.payload.full_name
      );
      
      if (!exists) {
        state.benchmarks.similarRepos.push(repo);
        
        // Keep only last 10
        if (state.benchmarks.similarRepos.length > 10) {
          state.benchmarks.similarRepos.shift();
        }
      }
    },

    /**
     * Calculate score improvement
     */
    calculateImprovement: (state, action) => {
      if (!state.currentAnalysis) return;
      
      const { previousScore } = action.payload;
      const currentScore = state.currentAnalysis.overallScore;
      
      state.currentAnalysis.improvement = {
        previousScore,
        currentScore,
        difference: currentScore - previousScore,
        percentage: ((currentScore - previousScore) / previousScore) * 100
      };
    }
  },
  extraReducers: (builder) => {
    // Handle analyzeRepo
    builder
      .addCase(analyzeRepo.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisError = null;
      })
      .addCase(analyzeRepo.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        
        // Store the entire analysis including aiInsights and contributorInsights
        state.currentAnalysis = action.payload;
        
        // If AI insights are included in the analyze response, store them separately too
        if (action.payload?.aiInsights) {
          state.aiInsights = action.payload.aiInsights;
        }
        
        // If contributor insights are included, they're already part of currentAnalysis
        
        state.lastAnalysisTime = new Date().toISOString();
        
        // Add to history
        const historyEntry = {
          ...action.payload,
          id: Date.now()
        };
        state.analysisHistory.unshift(historyEntry);
        if (state.analysisHistory.length > 20) {
          state.analysisHistory.pop();
        }
      })
      .addCase(analyzeRepo.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisError = action.payload;
      });

    // Handle generateAIInsights
    builder
      .addCase(generateAIInsights.pending, (state) => {
        state.isGeneratingInsights = true;
        state.insightsError = null;
      })
      .addCase(generateAIInsights.fulfilled, (state, action) => {
        state.isGeneratingInsights = false;
        const { data, fromCache, repoUrl } = action.payload;
        
        // Set current insights
        state.aiInsights = data;
        
        // Cache insights if not from cache
        if (!fromCache && repoUrl) {
          state.insightsCache[repoUrl] = {
            data: data,
            timestamp: new Date().toISOString()
          };
          
          // Limit cache size to prevent memory issues
          const cacheKeys = Object.keys(state.insightsCache);
          if (cacheKeys.length > 50) {
            // Remove oldest cached item
            const oldestKey = cacheKeys.reduce((oldest, key) => {
              const oldestTime = new Date(state.insightsCache[oldest].timestamp).getTime();
              const keyTime = new Date(state.insightsCache[key].timestamp).getTime();
              return keyTime < oldestTime ? key : oldest;
            });
            delete state.insightsCache[oldestKey];
          }
        }
      })
      .addCase(generateAIInsights.rejected, (state, action) => {
        state.isGeneratingInsights = false;
        state.insightsError = action.payload;
      });

    // Handle performCompleteAnalysis
    builder
      .addCase(performCompleteAnalysis.pending, (state) => {
        state.isAnalyzing = true;
        state.isGeneratingInsights = true;
      })
      .addCase(performCompleteAnalysis.fulfilled, (state, action) => {
        const { analysis, insights, analysisError, insightsError, fromCache } =
          action.payload;

        state.isAnalyzing = false;
        state.isGeneratingInsights = false;

        // Handle both cached and fresh analysis data
        if (analysis) {
          state.currentAnalysis = analysis;
          state.lastAnalysisTime = new Date().toISOString();

          // Only add to history if it's a fresh analysis (not from cache)
          if (!fromCache) {
            const historyEntry = {
              analysis: analysis,
              repoUrl: analysis.repoUrl,
              timestamp: analysis.timestamp || new Date().toISOString(),
              id: Date.now(),
            };
            
            state.analysisHistory = state.analysisHistory.filter(
              (h) => h.repoUrl !== analysis.repoUrl
            );

            state.analysisHistory.unshift(historyEntry);
            if (state.analysisHistory.length > 20) {
              state.analysisHistory.pop();
            }
          }
        }

        // Insights are handled separately in their own cache
        if (insights) {
          state.aiInsights = insights;
          
          // Cache insights if we have a repoUrl
          if (analysis?.repoUrl && !fromCache) {
            state.insightsCache[analysis.repoUrl] = {
              data: insights,
              timestamp: new Date().toISOString()
            };
          }
        }

        state.analysisError = analysisError;
        state.insightsError = insightsError;
      })
      .addCase(performCompleteAnalysis.rejected, (state) => {
        state.isAnalyzing = false;
        state.isGeneratingInsights = false;
      });
  }
});

/**
 * Export actions
 */
export const {
  setAnalysisResult,
  setAiInsights,
  clearAnalysis,
  addToHistory,
  removeFromHistory,
  clearHistory,
  setComparisonData,
  updateBenchmarks,
  addSimilarRepo,
  calculateImprovement,
  clearAllCaches,
  clearExpiredCaches,
  invalidateRepoCache
} = analysisSlice.actions;

/**
 * Selectors
 */
export const selectCurrentAnalysis = (state) => state.analysis.currentAnalysis;
export const selectAiInsights = (state) => state.analysis.aiInsights;
export const selectAnalysisHistory = (state) => state.analysis.analysisHistory;
export const selectIsAnalyzing = (state) => state.analysis.isAnalyzing;
export const selectIsGeneratingInsights = (state) => state.analysis.isGeneratingInsights;
export const selectAnalysisError = (state) => state.analysis.analysisError;
export const selectInsightsError = (state) => state.analysis.insightsError;
export const selectBenchmarks = (state) => state.analysis.benchmarks;
export const selectComparisonData = (state) => state.analysis.comparisonData;
export const selectInsightsCache = (state) => state.analysis.insightsCache;

// Cache status selectors
export const selectCacheStatus = (state) => {
  const analysisHistory = state.analysis.analysisHistory;
  const insightsCache = state.analysis.insightsCache;
  
  return {
    totalCachedAnalyses: analysisHistory.length,
    totalCachedInsights: Object.keys(insightsCache).length,
    cacheSize: {
      analysis: analysisHistory.length,
      insights: Object.keys(insightsCache).length
    }
  };
};

export const selectIsRepoCached = (state, repoUrl) => {
  const analysisHistory = state.analysis.analysisHistory;
  const insightsCache = state.analysis.insightsCache;
  
  const analysisCached = analysisHistory.some(
    h => h.repoUrl === repoUrl && isCacheValid(h.timestamp, CACHE_TTL.analysis)
  );
  
  const insightsCached = !!(insightsCache[repoUrl] && 
    isCacheValid(insightsCache[repoUrl].timestamp, CACHE_TTL.insights));
  
  return {
    analysis: analysisCached,
    insights: insightsCached,
    fullyCached: analysisCached && insightsCached
  };
};

// Computed selectors
export const selectOverallScore = (state) => state.analysis.currentAnalysis?.overallScore || 0;

export const selectScoreBreakdown = (state) => state.analysis.currentAnalysis?.breakdown || {};

export const selectTopMetrics = (state) => {
  const breakdown = selectScoreBreakdown(state);
  const metrics = Object.entries(breakdown);
  
  // Sort by score and get top 3
  return metrics
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, score]) => ({ name, score }));
};

export const selectWeakMetrics = (state) => {
  const breakdown = selectScoreBreakdown(state);
  const metrics = Object.entries(breakdown);
  
  // Get metrics below 60 and sort by score
  return metrics
    .filter(([, score]) => score < 60)
    .sort(([, a], [, b]) => a - b)
    .map(([name, score]) => ({ name, score }));
};

export const selectAnalysisComparison = (state) => {
  const current = state.analysis.currentAnalysis;
  const history = state.analysis.analysisHistory;
  
  if (!current || history.length < 2) return null;
  
  // Find previous analysis of same repo
  const previous = history.find(
    h => h.repositoryInfo?.full_name === current.repositoryInfo?.full_name &&
         h.id !== current.id
  );
  
  if (!previous) return null;
  
  return {
    current: current.overallScore,
    previous: previous.overallScore,
    improvement: current.overallScore - previous.overallScore,
    percentage: ((current.overallScore - previous.overallScore) / previous.overallScore) * 100
  };
};

export default analysisSlice.reducer; 