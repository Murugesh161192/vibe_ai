import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Import slices
import appReducer from './slices/appSlice';
import userReducer from './slices/userSlice';
import analysisReducer from './slices/analysisSlice';
import aiReducer from './slices/aiSlice';
import repositoryReducer from './slices/repositorySlice';

/**
 * Redux persist configuration
 * Persists user preferences and recent analyses
 */
const persistConfig = {
  key: 'vibe-github-assistant',
  version: 1,
  storage,
  whitelist: ['user', 'repository'], // Persist user slice and repository cache
  blacklist: ['app', 'analysis', 'ai'] // Don't persist app state, analysis, and AI (too large)
};

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
  app: appReducer,
  user: userReducer,
  analysis: analysisReducer,
  ai: aiReducer,
  repository: repositoryReducer
});

/**
 * Persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure and create the Redux store
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignore specific paths in state
        ignoredPaths: ['app.error', 'analysis.currentAnalysis.timestamp']
      },
      // Add thunk options
      thunk: {
        extraArgument: {
          // Add any extra arguments for thunks here
          // e.g., API client instances
        }
      }
    }),
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production' && {
    // Limit the number of actions stored in DevTools
    maxAge: 50,
    // Sanitize actions for security
    actionSanitizer: (action) => {
      // Remove sensitive data from actions if needed
      if (action.type === 'user/setApiKey') {
        return { ...action, payload: '***' };
      }
      return action;
    },
    // Sanitize state for security
    stateSanitizer: (state) => {
      // Remove sensitive data from state if needed
      if (state.user?.apiKey) {
        return {
          ...state,
          user: {
            ...state.user,
            apiKey: '***'
          }
        };
      }
      return state;
    }
  }
});

/**
 * Create persistor for redux-persist
 */
export const persistor = persistStore(store);

/**
 * Expose store to window for debugging in development
 */
if (process.env.NODE_ENV !== 'production' || import.meta.env.MODE !== 'production') {
  window.__REDUX_STORE__ = store;
}

/**
 * Export typed hooks for TypeScript (if needed in future)
 */
export const useAppDispatch = () => store.dispatch;
export const useAppSelector = (selector) => selector(store.getState());

/**
 * Export action creators for easy access
 */
export { 
  setLoading, 
  setError, 
  clearError,
  setCurrentView 
} from './slices/appSlice';

export { 
  setUserProfile, 
  setUserRepositories,
  clearUserData,
  addRecentSearch 
} from './slices/userSlice';

export { 
  setAnalysisResult,
  setAiInsights,
  clearAnalysis,
  addToHistory 
} from './slices/analysisSlice';

export {
  summarizeRepositoryReadme,
  batchSummarizeRepositories,
  clearCurrentSummary,
  clearSummaryCache,
  clearRepositoryCache,
  updateBatchProgress,
  resetBatchProgress,
  setRepoLoadingState,
  setRepoError,
  clearErrors
} from './slices/aiSlice';

export default store; 