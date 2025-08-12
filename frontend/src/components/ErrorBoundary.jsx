import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

/**
 * Error Fallback Component
 * Displays user-friendly error messages with recovery options
 */
const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-red-500/20 p-8 shadow-2xl">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            Oops! Something went wrong
          </h1>

          {/* Error Description */}
          <p className="text-gray-300 text-center mb-6">
            We encountered an unexpected error. Don't worry, your data is safe and our team has been notified.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
                Technical Details (Development Only)
              </summary>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-red-400 font-mono">{error.toString()}</p>
                {error.stack && (
                  <pre className="text-xs text-gray-500 overflow-x-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Recovery Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetError}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all border border-purple-500/30"
              aria-label="Try again"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all border border-blue-500/30"
              aria-label="Go to homepage"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>

            <a
              href="mailto:support@vibegithub.com?subject=Error Report"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-all border border-gray-600/30"
              aria-label="Contact support"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>

          {/* Error ID for tracking */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Error ID: {generateErrorId()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate unique error ID for tracking
 */
const generateErrorId = () => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Error Boundary Class Component
 * Catches JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = generateErrorId();
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary Caught:', error, errorInfo);
    }

    // Send error to monitoring service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo, errorId);

    // Update error count for rate limiting
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // If too many errors, show maintenance mode
    if (this.state.errorCount > 5) {
      this.setState({ maintenanceMode: true });
    }
  }

  logErrorToService = (error, errorInfo, errorId) => {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry integration
      // Sentry.captureException(error, {
      //   contexts: {
      //     react: {
      //       componentStack: errorInfo.componentStack
      //     }
      //   },
      //   tags: {
      //     errorId
      //   }
      // });

      // Example: Custom API logging
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     errorId,
      //     message: error.toString(),
      //     stack: error.stack,
      //     componentStack: errorInfo.componentStack,
      //     timestamp: new Date().toISOString(),
      //     userAgent: navigator.userAgent,
      //     url: window.location.href
      //   })
      // }).catch(() => {
      //   // Fail silently if logging fails
      // });
    }

    // Store error in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push({
        id: errorId,
        message: error.toString(),
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift();
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch {
      // Fail silently if localStorage is not available
    }
  };

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    // Show maintenance mode if too many errors
    if (this.state.maintenanceMode) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Under Maintenance
            </h1>
            <p className="text-gray-400">
              We're experiencing technical difficulties. Please try again later.
            </p>
          </div>
        </div>
      );
    }

    // Show error fallback UI
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    // Render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 