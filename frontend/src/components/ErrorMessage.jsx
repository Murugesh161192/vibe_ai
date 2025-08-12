import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, HelpCircle, WifiOff, Clock, AlertTriangle, Home } from 'lucide-react';
import { useAnnouncement } from '../utils/accessibility';

const ErrorMessage = ({ 
  message, 
  onRetry, 
  errorType = 'general',
  onGoHome,
  showHomeButton = false 
}) => {
  const announce = useAnnouncement();
  
  // Announce error to screen readers
  useEffect(() => {
    const errorText = `Error: ${message}. ${errorType === 'rate-limit' ? 'Rate limit exceeded.' : ''} Please try the suggested solutions.`;
    announce(errorText);
  }, [message, errorType, announce]);
  
  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: WifiOff,
          iconColor: 'text-red-400',
          bgColor: 'from-red-500/10 to-red-600/5',
          borderColor: 'border-red-500/20',
          title: 'Connection Error',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Verify the repository URL is correct',
            'Check if GitHub is accessible'
          ]
        };
      case 'not-found':
        return {
          icon: HelpCircle,
          iconColor: 'text-yellow-400',
          bgColor: 'from-yellow-500/10 to-amber-600/5',
          borderColor: 'border-yellow-500/20',
          title: 'Not Found',
          suggestions: [
            'Check the spelling of the username or repository',
            'Ensure the repository is public',
            'Try a different repository or user',
            'Verify the URL format (owner/repo)'
          ]
        };
      case 'rate-limit':
        return {
          icon: Clock,
          iconColor: 'text-orange-400',
          bgColor: 'from-orange-500/10 to-amber-600/5',
          borderColor: 'border-orange-500/20',
          title: 'Rate Limit Exceeded',
          suggestions: [
            'GitHub API rate limit reached',
            'Try again in a few minutes',
            'Consider using a GitHub token for higher limits',
            'Check GitHub API status'
          ]
        };
      case 'validation':
        return {
          icon: AlertTriangle,
          iconColor: 'text-purple-400',
          bgColor: 'from-purple-500/10 to-violet-600/5',
          borderColor: 'border-purple-500/20',
          title: 'Invalid Input',
          suggestions: [
            'Check the input format',
            'Use format: owner/repo or full GitHub URL',
            'Ensure no special characters in username',
            'Try copy-pasting the URL directly from GitHub'
          ]
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-red-400',
          bgColor: 'from-red-500/10 to-red-600/5',
          borderColor: 'border-red-500/20',
          title: 'Something went wrong',
          suggestions: [
            'Double-check the input format',
            'Try a different repository or user',
            'Refresh the page and try again',
            'Contact support if the issue persists'
          ]
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div
      className="w-full animate-slide-up"
      data-testid="error-message"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`
        relative overflow-hidden rounded-xl 
        bg-gradient-to-br ${config.bgColor} 
        border ${config.borderColor} 
        backdrop-blur-xl p-4 sm:p-6 max-w-2xl mx-auto
        shadow-lg hover:shadow-xl transition-all duration-300
      `}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4">
          {/* Icon with animation */}
          <div className="flex-shrink-0">
            <div className={`
              p-3 rounded-lg bg-gradient-to-br ${config.bgColor} 
              border ${config.borderColor} animate-pulse-subtle
            `}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} aria-hidden="true" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Error title */}
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 flex items-center gap-2">
              {config.title}
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                {new Date().toLocaleTimeString()}
              </span>
            </h3>
            
            {/* Error message */}
            <p className="text-sm sm:text-base text-white/80 mb-4 leading-relaxed">
              {message}
            </p>
            
            {/* Suggestions with improved styling */}
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-white/60 mb-2 font-medium">
                Suggested solutions:
              </p>
              <ul className="text-xs sm:text-sm text-white/70 space-y-2" role="list">
                {config.suggestions.map((suggestion, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 group hover:text-white/90 transition-colors"
                    role="listitem"
                  >
                    <span className={`
                      w-1.5 h-1.5 ${config.bgColor.includes('red') ? 'bg-red-400' : 
                                     config.bgColor.includes('yellow') ? 'bg-yellow-400' : 
                                     config.bgColor.includes('orange') ? 'bg-orange-400' : 
                                     config.bgColor.includes('purple') ? 'bg-purple-400' : 
                                     'bg-blue-400'} 
                      rounded-full mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform
                    `} aria-hidden="true"></span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Action buttons with better touch targets */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="btn-enhanced flex items-center gap-2 px-4 py-2.5 
                           bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                           hover:from-blue-500/30 hover:to-purple-500/30 
                           text-white border border-blue-400/30 hover:border-blue-400/50 
                           rounded-lg transition-all duration-200 
                           shadow-sm hover:shadow-lg hover:shadow-blue-500/20
                           focus:ring-2 focus:ring-blue-400/50 focus:outline-none
                           min-h-[44px]"
                  data-testid="retry-button"
                  aria-label="Try again"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" aria-hidden="true" />
                  <span className="text-sm sm:text-base font-medium">Try Again</span>
                </button>
              )}
              
              {(showHomeButton || onGoHome) && (
                <button
                  onClick={onGoHome || (() => window.location.href = '/')}
                  className="btn-enhanced flex items-center gap-2 px-4 py-2.5 
                           bg-white/5 hover:bg-white/10 
                           text-white/80 hover:text-white 
                           border border-white/10 hover:border-white/20 
                           rounded-lg transition-all duration-200 
                           shadow-sm hover:shadow-lg
                           focus:ring-2 focus:ring-white/50 focus:outline-none
                           min-h-[44px]"
                  aria-label="Go to home page"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm sm:text-base font-medium">Go Home</span>
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="btn-enhanced flex items-center gap-2 px-4 py-2.5 
                         bg-white/5 hover:bg-white/10 
                         text-white/60 hover:text-white/80 
                         border border-white/10 hover:border-white/20 
                         rounded-lg transition-all duration-200 
                         shadow-sm hover:shadow-lg
                         focus:ring-2 focus:ring-white/50 focus:outline-none
                         min-h-[44px]"
                aria-label="Refresh the page"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm sm:text-base font-medium">Refresh Page</span>
              </button>
            </div>
            
            {/* Additional help text */}
            {errorType === 'rate-limit' && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-white/60">
                  <strong>Tip:</strong> GitHub API allows 60 requests per hour for unauthenticated users. 
                  Consider waiting a few minutes or using a GitHub token for increased limits.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 