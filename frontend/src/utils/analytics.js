// Simple analytics utility for tracking user interactions
class Analytics {
  constructor() {
    this.events = [];
    this.startTime = Date.now();
  }

  // Track page views
  trackPageView(page) {
    this.track('page_view', { page });
  }

  // Track user interactions
  trackEvent(eventName, properties = {}) {
    this.track(eventName, {
      ...properties,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime
    });
  }

  // Track repository analysis
  trackAnalysis(repoUrl, analysisType = 'basic') {
    this.track('repository_analysis', {
      repoUrl,
      analysisType,
      timestamp: Date.now()
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  // Track performance metrics
  trackPerformance(metric, value) {
    this.track('performance', {
      metric,
      value,
      timestamp: Date.now()
    });
  }

  // Internal tracking method
  track(eventName, data) {
    const event = {
      event: eventName,
      data,
      timestamp: Date.now()
    };

    this.events.push(event);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event);
    }

    // Send to analytics service in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(event);
    }
  }

  // Send events to analytics service
  sendToAnalytics(event) {
    // In a real app, you'd send to Google Analytics, Mixpanel, etc.
    // For now, we'll just store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('vibe_analytics') || '[]');
      existing.push(event);
      localStorage.setItem('vibe_analytics', JSON.stringify(existing.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Get analytics data
  getAnalytics() {
    return this.events;
  }

  // Clear analytics
  clearAnalytics() {
    this.events = [];
    this.startTime = Date.now();
    localStorage.removeItem('vibe_analytics');
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics; 