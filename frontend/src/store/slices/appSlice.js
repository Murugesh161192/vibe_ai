import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for app slice
 */
const initialState = {
  loading: false,
  error: null,
  currentView: 'ready', // 'ready', 'profile', 'analysis', 'demo', 'loading'
  currentInput: {
    type: '', // 'user' or 'repo'
    value: ''
  },
  notifications: [],
  apiRequestCount: 0,
  lastApiRequestTime: null,
  performanceMetrics: {
    renderCount: 0,
    avgRenderTime: 0,
    slowRenders: []
  }
};

/**
 * App slice for general application state
 */
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Set loading state
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
      // Only change view to loading when starting to load
      // Don't change view when loading completes - let the calling code handle that
      if (action.payload === true) {
        state.currentView = 'loading';
      }
    },

    /**
     * Set error state
     */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      if (action.payload) {
        state.currentView = 'ready';
      }
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set current view
     */
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },

    /**
     * Set current input
     */
    setCurrentInput: (state, action) => {
      state.currentInput = action.payload;
    },

    /**
     * Add notification
     */
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.push(notification);
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications.shift();
      }
    },

    /**
     * Remove notification
     */
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      );
    },

    /**
     * Clear all notifications
     */
    clearNotifications: (state) => {
      state.notifications = [];
    },

    /**
     * Track API request
     */
    trackApiRequest: (state) => {
      state.apiRequestCount++;
      state.lastApiRequestTime = new Date().toISOString();
    },

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics: (state, action) => {
      const { renderTime, componentName } = action.payload;
      
      state.performanceMetrics.renderCount++;
      
      // Update average render time
      const currentAvg = state.performanceMetrics.avgRenderTime;
      const count = state.performanceMetrics.renderCount;
      state.performanceMetrics.avgRenderTime = 
        (currentAvg * (count - 1) + renderTime) / count;
      
      // Track slow renders
      if (renderTime > 100) {
        state.performanceMetrics.slowRenders.push({
          componentName,
          renderTime,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 slow renders
        if (state.performanceMetrics.slowRenders.length > 20) {
          state.performanceMetrics.slowRenders.shift();
        }
      }
    },

    /**
     * Reset app state
     */
    resetAppState: (state) => {
      return {
        ...initialState,
        notifications: state.notifications, // Keep notifications
        performanceMetrics: state.performanceMetrics // Keep performance metrics
      };
    }
  }
});

/**
 * Export actions
 */
export const {
  setLoading,
  setError,
  clearError,
  setCurrentView,
  setCurrentInput,
  addNotification,
  removeNotification,
  clearNotifications,
  trackApiRequest,
  updatePerformanceMetrics,
  resetAppState
} = appSlice.actions;

/**
 * Selectors
 */
export const selectIsLoading = (state) => state.app.loading;
export const selectError = (state) => state.app.error;
export const selectCurrentView = (state) => state.app.currentView;
export const selectCurrentInput = (state) => state.app.currentInput;
export const selectNotifications = (state) => state.app.notifications;
export const selectApiRequestCount = (state) => state.app.apiRequestCount;
export const selectPerformanceMetrics = (state) => state.app.performanceMetrics;

/**
 * Thunks for async actions
 */
export const showNotification = (message, type = 'info', duration = 5000) => (dispatch) => {
  const notification = { message, type };
  dispatch(addNotification(notification));
  
  if (duration > 0) {
    setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, duration);
  }
};

export default appSlice.reducer; 