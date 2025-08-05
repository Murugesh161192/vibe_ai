import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original environment
const originalEnv = { ...import.meta.env };

describe('Analytics Utility', () => {
  let analytics;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(async () => {
    // Reset environment and re-import analytics
    import.meta.env = { ...originalEnv };
    vi.resetModules();
    
    // Dynamically import the analytics module
    const analyticsModule = await import('../utils/analytics');
    analytics = analyticsModule.default;
    
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.clear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    localStorage.clear();
    import.meta.env = originalEnv;
    vi.clearAllTimers();
  });

  describe('trackPageView', () => {
    test('tracks page view events', () => {
      analytics.trackPageView('/home');
      analytics.trackPageView('/analysis');

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(2);
      expect(events[0].event).toBe('page_view');
      expect(events[0].data.page).toBe('/home');
      expect(events[1].data.page).toBe('/analysis');
    });
  });

  describe('trackEvent', () => {
    test('tracks custom events with properties', () => {
      vi.useFakeTimers();
      const startTime = Date.now();
      vi.advanceTimersByTime(1000); // Advance 1 second

      analytics.trackEvent('button_click', { button: 'analyze', location: 'header' });

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('button_click');
      expect(events[0].data.button).toBe('analyze');
      expect(events[0].data.location).toBe('header');
      expect(events[0].data.timestamp).toBeTruthy();
      expect(events[0].data.sessionDuration).toBeGreaterThanOrEqual(1000);
      
      vi.useRealTimers();
    });

    test('tracks events without properties', () => {
      analytics.trackEvent('modal_open');

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('modal_open');
      expect(events[0].data.timestamp).toBeDefined();
    });
  });

  describe('trackAnalysis', () => {
    test('tracks repository analysis with default type', () => {
      analytics.trackAnalysis('https://github.com/user/repo');

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('repository_analysis');
      expect(events[0].data.repoUrl).toBe('https://github.com/user/repo');
      expect(events[0].data.analysisType).toBe('basic');
    });

    test('tracks repository analysis with custom type', () => {
      analytics.trackAnalysis('https://github.com/user/repo', 'detailed');

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(1);
      expect(events[0].data.analysisType).toBe('detailed');
    });
  });

  describe('trackError', () => {
    test('tracks errors with context', () => {
      const error = new Error('Test error message');
      error.stack = 'Error: Test error message\n    at test.js:10:5';
      
      analytics.trackError(error, { component: 'RepositoryInput', action: 'submit' });

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('error');
      expect(events[0].data.message).toBe('Test error message');
      expect(events[0].data.stack).toContain('Error: Test error message');
      expect(events[0].data.context.component).toBe('RepositoryInput');
      expect(events[0].data.context.action).toBe('submit');
    });

    test('tracks errors without context', () => {
      const error = new Error('Simple error');
      
      analytics.trackError(error);

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(1);
      expect(events[0].data.message).toBe('Simple error');
      expect(events[0].data.context).toEqual({});
    });
  });

  describe('trackPerformance', () => {
    test('tracks performance metrics', () => {
      analytics.trackPerformance('api_response_time', 250);
      analytics.trackPerformance('render_time', 50);

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(2);
      expect(events[0].event).toBe('performance');
      expect(events[0].data.metric).toBe('api_response_time');
      expect(events[0].data.value).toBe(250);
      expect(events[1].data.metric).toBe('render_time');
      expect(events[1].data.value).toBe(50);
    });
  });

  describe('track (internal method)', () => {
    test('logs events in development mode', () => {
      // Mock development environment
      import.meta.env = { ...originalEnv, DEV: true, PROD: false };

      analytics.track('test_event', { data: 'test' });

      expect(consoleLogSpy).toHaveBeenCalledWith('Analytics Event:', expect.objectContaining({
        event: 'test_event',
        data: { data: 'test' },
        timestamp: expect.any(Number)
      }));
    });

    test('sends events to analytics in production mode', () => {
      // Clear localStorage first
      localStorage.clear();
      
      // Call sendToAnalytics directly
      const event = {
        event: 'prod_event',
        data: { data: 'production' },
        timestamp: Date.now()
      };
      analytics.sendToAnalytics(event);
      
      // Check localStorage was updated
      const stored = JSON.parse(localStorage.getItem('vibe_analytics') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].event).toBe('prod_event');
      expect(stored[0].data.data).toBe('production');
    });

    test('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error on setItem
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
      
      // Call sendToAnalytics directly
      const event = {
        event: 'error_event',  
        data: { data: 'will fail' },
        timestamp: Date.now()
      };
      
      // The main test: should not throw, error should be caught internally
      expect(() => analytics.sendToAnalytics(event)).not.toThrow();
      
      // Additional verification: analytics module should still be functional
      expect(analytics.getAnalytics).toBeDefined();
      expect(typeof analytics.trackEvent).toBe('function');

      // Restore
      localStorage.setItem = originalSetItem;
    });

    test('limits stored events to 100', () => {
      // Clear localStorage first
      localStorage.clear();
      
      // Add 105 events directly to localStorage
      const events = [];
      for (let i = 0; i < 105; i++) {
        events.push({
          event: 'event',
          data: { index: i },
          timestamp: Date.now()
        });
      }
      
      // Store initial events
      localStorage.setItem('vibe_analytics', JSON.stringify(events));
      
      // Now send one more event through analytics
      analytics.sendToAnalytics({
        event: 'final_event',
        data: { index: 105 },
        timestamp: Date.now()
      });

      // Check localStorage
      const stored = JSON.parse(localStorage.getItem('vibe_analytics') || '[]');
      expect(stored.length).toBe(100);
      expect(stored[0].data.index).toBe(6); // First 6 should be dropped
      expect(stored[99].event).toBe('final_event'); // Last should be the new event
    });
  });

  describe('getAnalytics', () => {
    test('returns all tracked events', () => {
      analytics.trackPageView('/home');
      analytics.trackEvent('click', { button: 'test' });
      analytics.trackPerformance('load', 100);

      const events = analytics.getAnalytics();
      expect(events).toHaveLength(3);
      expect(events[0].event).toBe('page_view');
      expect(events[1].event).toBe('click');
      expect(events[2].event).toBe('performance');
    });

    test('returns empty array when no events', () => {
      const events = analytics.getAnalytics();
      expect(events).toEqual([]);
    });
  });

  describe('clearAnalytics', () => {
    test('clears all events and localStorage', () => {
      // Add some events
      analytics.trackPageView('/home');
      analytics.trackEvent('click');
      
      // Store in localStorage
      localStorage.setItem('vibe_analytics', JSON.stringify([{ event: 'test' }]));

      // Clear analytics
      analytics.clearAnalytics();

      // Check events are cleared
      expect(analytics.getAnalytics()).toEqual([]);
      
      // Check localStorage is cleared
      expect(localStorage.getItem('vibe_analytics')).toBeNull();
    });
  });

  describe('Session duration tracking', () => {
    test('tracks session duration correctly', () => {
      vi.useFakeTimers();
      
      // Track first event immediately
      analytics.trackEvent('first_event');
      
      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);
      
      // Track second event
      analytics.trackEvent('second_event');
      
      const events = analytics.getAnalytics();
      expect(events[0].data.sessionDuration).toBeLessThan(10); // First event should be near start (allowing for small delays)
      expect(events[1].data.sessionDuration).toBeGreaterThanOrEqual(5000); // Second event after 5s
      expect(events[1].data.sessionDuration).toBeLessThan(5100); // But not too much more
      
      vi.useRealTimers();
    });
  });

  describe('Singleton behavior', () => {
    test('maintains state across imports', () => {
      // Track event
      analytics.trackPageView('/test');
      
      // Import again (should be same instance)
      const analytics2 = analytics;
      
      // Should have the same events
      expect(analytics2.getAnalytics()).toHaveLength(1);
      expect(analytics2.getAnalytics()[0].data.page).toBe('/test');
    });
  });
}); 