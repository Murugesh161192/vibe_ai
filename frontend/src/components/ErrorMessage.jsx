import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="card-glass border-red-400/50">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            Analysis Failed
          </h3>
          <p className="text-white/80 mb-4">
            {message}
          </p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-secondary flex items-center gap-2"
              aria-describedby="error-description"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          <div id="error-description" className="sr-only">
            Click to retry the repository analysis
          </div>
        </div>
      </div>
      
      <div className="mt-4 card-content p-3">
        <h4 className="font-medium text-white mb-2">Troubleshooting Tips:</h4>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Ensure the repository URL is correct and the repository is public</li>
          <li>• Check that the repository exists and is accessible</li>
          <li>• Try again in a few moments if you've hit rate limits</li>
          <li>• Make sure you have a stable internet connection</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorMessage; 