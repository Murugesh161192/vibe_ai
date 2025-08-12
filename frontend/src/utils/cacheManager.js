/**
 * Cache Manager Utility
 * Handles periodic cache cleanup and provides cache management functions
 */

import { clearExpiredCaches } from '../store/slices/analysisSlice';

class CacheManager {
  constructor() {
    this.cleanupInterval = null;
    this.cleanupIntervalMs = 5 * 60 * 1000; // Run cleanup every 5 minutes
  }

  /**
   * Start periodic cache cleanup
   * @param {Object} store - Redux store instance
   */
  startPeriodicCleanup(store) {
    if (this.cleanupInterval) {
      console.warn('Cache cleanup already running');
      return;
    }

    // Initial cleanup
    this.cleanupExpiredCaches(store);

    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCaches(store);
    }, this.cleanupIntervalMs);

    console.log('Cache cleanup started with interval:', this.cleanupIntervalMs);
  }

  /**
   * Stop periodic cache cleanup
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Cache cleanup stopped');
    }
  }

  /**
   * Manually trigger cache cleanup
   * @param {Object} store - Redux store instance
   */
  cleanupExpiredCaches(store) {
    store.dispatch(clearExpiredCaches());
    const state = store.getState();
    const cacheStatus = this.getCacheStatus(state);
    console.log('Cache cleanup completed:', cacheStatus);
  }

  /**
   * Get current cache status
   * @param {Object} state - Redux state
   * @returns {Object} Cache status information
   */
  getCacheStatus(state) {
    const analysisHistory = state.analysis.analysisHistory;
    const insightsCache = state.analysis.insightsCache;

    // Calculate cache sizes
    const analysisCacheSize = this.calculateObjectSize(analysisHistory);
    const insightsCacheSize = this.calculateObjectSize(insightsCache);
    const totalCacheSize = analysisCacheSize + insightsCacheSize;

    return {
      entries: {
        analysis: analysisHistory.length,
        insights: Object.keys(insightsCache).length,
        total: analysisHistory.length + Object.keys(insightsCache).length
      },
      size: {
        analysis: this.formatBytes(analysisCacheSize),
        insights: this.formatBytes(insightsCacheSize),
        total: this.formatBytes(totalCacheSize)
      },
      sizeBytes: {
        analysis: analysisCacheSize,
        insights: insightsCacheSize,
        total: totalCacheSize
      }
    };
  }

  /**
   * Calculate approximate size of an object in bytes
   * @param {any} obj - Object to calculate size for
   * @returns {number} Approximate size in bytes
   */
  calculateObjectSize(obj) {
    const str = JSON.stringify(obj);
    // Rough estimate: each character is 2 bytes in JavaScript strings
    return str.length * 2;
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if cache is getting too large and needs cleanup
   * @param {Object} state - Redux state
   * @returns {boolean} True if cache needs cleanup
   */
  needsCleanup(state) {
    const status = this.getCacheStatus(state);
    // Trigger cleanup if cache is over 5MB or has more than 100 entries
    return status.sizeBytes.total > 5 * 1024 * 1024 || status.entries.total > 100;
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
export default cacheManager;

// Export cache TTL configuration for consistency
export const CACHE_CONFIG = {
  TTL: {
    ANALYSIS: 60 * 60 * 1000,    // 1 hour
    INSIGHTS: 30 * 60 * 1000,     // 30 minutes
  },
  LIMITS: {
    MAX_ENTRIES: 100,
    MAX_SIZE_MB: 5
  },
  CLEANUP_INTERVAL: 5 * 60 * 1000  // 5 minutes
}; 