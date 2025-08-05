import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, errorType = 'general' }) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return <AlertCircle className="icon-lg text-red-400" />;
      case 'not-found':
        return <HelpCircle className="icon-lg text-yellow-400" />;
      case 'rate-limit':
        return <AlertCircle className="icon-lg text-orange-400" />;
      default:
        return <AlertCircle className="icon-lg text-red-400" />;
    }
  };

  const getErrorSuggestions = () => {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Try again in a few moments',
          'Verify the repository URL is correct'
        ];
      case 'not-found':
        return [
          'Check the spelling of the username or repository',
          'Ensure the repository is public',
          'Try a different repository or user'
        ];
      case 'rate-limit':
        return [
          'GitHub API rate limit reached',
          'Try again in a few minutes',
          'Consider using a GitHub token for higher limits'
        ];
      default:
        return [
          'Double-check the input format',
          'Try a different repository or user',
          'Contact support if the issue persists'
        ];
    }
  };

  return (
    <div className="card-glass p-6 max-w-2xl mx-auto" data-testid="error-message">
      <div className="icon-align-left space-x-4">
        {getErrorIcon()}
        
        <div className="flex-1">
          <h3 className="text-heading-sm text-white mb-2">
            {errorType === 'not-found' ? 'Not Found' : 
             errorType === 'rate-limit' ? 'Rate Limit Exceeded' :
             errorType === 'network' ? 'Connection Error' : 'Something went wrong'}
          </h3>
          
          <p className="text-white/80 mb-4 text-responsive">{message}</p>
          
          {/* Suggestions */}
          <div className="mb-4">
            <p className="text-sm text-white/60 mb-2">Try these solutions:</p>
            <ul className="text-sm text-white/70 space-y-1">
              {getErrorSuggestions().map((suggestion, index) => (
                <li key={index} className="icon-text-align-sm">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-primary icon-text-align px-4 py-2 text-responsive touch-target"
                data-testid="retry-button"
              >
                <RefreshCw className="icon-sm" />
                <span>Try Again</span>
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary px-4 py-2 text-responsive touch-target"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 