import { configureStore } from '@reduxjs/toolkit';
import aiReducer, { 
  summarizeRepositoryReadme,
  batchSummarizeRepositories,
  clearSummaryCache,
  selectCachedSummary,
  selectRepoLoadingState,
  selectBatchProgress
} from '../store/slices/aiSlice';

describe('AI Slice Redux Integration', () => {
  let store;
  
  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: { ai: aiReducer }
    });
  });
  
  describe('Initial State', () => {
    test('should have correct initial state', () => {
      const state = store.getState().ai;
      expect(state).toEqual({
        currentSummary: null,
        summaryCache: {},
        isLoadingSummary: false,
        isLoadingBatch: false,
        summaryError: null,
        batchError: null,
        batchSummaries: {},
        batchProgress: {
          total: 0,
          completed: 0,
          failed: 0,
          inProgress: false
        },
        repoLoadingStates: {},
        repoErrors: {}
      });
    });
  });
  
  describe('Cache Management', () => {
    test('should clear summary cache', () => {
      // Add some mock data to cache
      store.dispatch({
        type: 'ai/summarizeRepositoryReadme/fulfilled',
        payload: {
          owner: 'test',
          repo: 'repo',
          data: { summary: 'Test summary' },
          fromCache: false
        }
      });
      
      // Verify cache has data
      let state = store.getState().ai;
      expect(Object.keys(state.summaryCache).length).toBe(1);
      
      // Clear cache
      store.dispatch(clearSummaryCache());
      
      // Verify cache is cleared
      state = store.getState().ai;
      expect(state.summaryCache).toEqual({});
      expect(state.batchSummaries).toEqual({});
    });
  });
  
  describe('Selectors', () => {
    test('should select cached summary correctly', () => {
      // Add mock data to cache
      store.dispatch({
        type: 'ai/summarizeRepositoryReadme/fulfilled',
        payload: {
          owner: 'facebook',
          repo: 'react',
          data: { summary: 'React is a JavaScript library' },
          fromCache: false
        }
      });
      
      // Test selector
      const state = store.getState();
      const cachedSummary = selectCachedSummary('facebook', 'react')(state);
      expect(cachedSummary).toEqual({ summary: 'React is a JavaScript library' });
      
      // Test non-existent cache
      const nonExistent = selectCachedSummary('unknown', 'repo')(state);
      expect(nonExistent).toBeNull();
    });
    
    test('should select repo loading state correctly', () => {
      const repoId = 123;
      
      // Initial state should be false
      let state = store.getState();
      expect(selectRepoLoadingState(repoId)(state)).toBe(false);
      
      // Dispatch pending action
      store.dispatch({
        type: 'ai/summarizeRepositoryReadme/pending',
        meta: { arg: { repoId } }
      });
      
      // Loading state should be true
      state = store.getState();
      expect(selectRepoLoadingState(repoId)(state)).toBe(true);
    });
    
    test('should select batch progress correctly', () => {
      const state = store.getState();
      const progress = selectBatchProgress(state);
      
      expect(progress).toEqual({
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: false
      });
    });
  });
  
  describe('Loading States', () => {
    test('should handle summary loading states', () => {
      // Check initial state
      let state = store.getState().ai;
      expect(state.isLoadingSummary).toBe(false);
      
      // Dispatch pending action
      store.dispatch({
        type: 'ai/summarizeRepositoryReadme/pending'
      });
      
      state = store.getState().ai;
      expect(state.isLoadingSummary).toBe(true);
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'ai/summarizeRepositoryReadme/fulfilled',
        payload: {
          owner: 'test',
          repo: 'repo',
          data: { summary: 'Test' },
          fromCache: false
        }
      });
      
      state = store.getState().ai;
      expect(state.isLoadingSummary).toBe(false);
    });
    
    test('should handle batch loading states', () => {
      // Check initial state
      let state = store.getState().ai;
      expect(state.isLoadingBatch).toBe(false);
      expect(state.batchProgress.inProgress).toBe(false);
      
      // Dispatch pending action
      store.dispatch({
        type: 'ai/batchSummarizeRepositories/pending'
      });
      
      state = store.getState().ai;
      expect(state.isLoadingBatch).toBe(true);
      expect(state.batchProgress.inProgress).toBe(true);
      
      // Dispatch fulfilled action
      store.dispatch({
        type: 'ai/batchSummarizeRepositories/fulfilled',
        payload: {
          results: {},
          stats: {
            total: 5,
            cached: 2,
            fetched: 3,
            failed: 0
          }
        }
      });
      
      state = store.getState().ai;
      expect(state.isLoadingBatch).toBe(false);
      expect(state.batchProgress).toEqual({
        total: 5,
        completed: 5,
        failed: 0,
        inProgress: false
      });
    });
  });
  
  describe('Error Handling', () => {
    test('should handle summary errors', () => {
      const errorMessage = 'Failed to fetch summary';
      
      // Dispatch rejected action
      store.dispatch({
        type: 'ai/summarizeRepositoryReadme/rejected',
        payload: {
          error: errorMessage,
          repoId: 123
        }
      });
      
      const state = store.getState().ai;
      expect(state.summaryError).toBe(errorMessage);
      expect(state.repoErrors[123]).toBe(errorMessage);
    });
    
    test('should handle batch errors', () => {
      const errorMessage = 'Batch processing failed';
      
      // Dispatch rejected action
      store.dispatch({
        type: 'ai/batchSummarizeRepositories/rejected',
        payload: errorMessage
      });
      
      const state = store.getState().ai;
      expect(state.batchError).toBe(errorMessage);
      expect(state.batchProgress.inProgress).toBe(false);
    });
  });
});

// Example usage documentation
export const usageExamples = {
  // Example 1: Using in a component to fetch a single summary
  singleSummaryExample: `
    // In your React component
    import { useDispatch, useSelector } from 'react-redux';
    import { summarizeRepositoryReadme, selectRepoLoadingState } from '../store/slices/aiSlice';
    
    const MyComponent = ({ repo }) => {
      const dispatch = useDispatch();
      const isLoading = useSelector(selectRepoLoadingState(repo.id));
      
      const handleSummarize = async () => {
        const result = await dispatch(summarizeRepositoryReadme({
          owner: repo.owner.login,
          repo: repo.name,
          repoId: repo.id
        }));
        
        if (summarizeRepositoryReadme.fulfilled.match(result)) {
          console.log('Summary:', result.payload.data);
        }
      };
      
      return (
        <button onClick={handleSummarize} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Get Summary'}
        </button>
      );
    };
  `,
  
  // Example 2: Batch summarization
  batchSummaryExample: `
    // Batch summarize multiple repositories
    const handleBatchSummarize = async (repositories) => {
      const result = await dispatch(batchSummarizeRepositories({
        repositories: repositories.slice(0, 10), // Limit to 10
        parallel: true
      }));
      
      if (batchSummarizeRepositories.fulfilled.match(result)) {
        const { stats } = result.payload;
        console.log(\`Processed: \${stats.total}, Cached: \${stats.cached}, Failed: \${stats.failed}\`);
      }
    };
  `,
  
  // Example 3: Using cached summaries
  cachedSummaryExample: `
    // Check if summary is already cached
    const cachedSummary = useSelector(selectCachedSummary(owner, repoName));
    
    if (cachedSummary) {
      // Use cached summary immediately
      setSummary(cachedSummary);
    } else {
      // Fetch new summary
      dispatch(summarizeRepositoryReadme({ owner, repo: repoName }));
    }
  `
}; 