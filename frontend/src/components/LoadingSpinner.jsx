import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Analyzing repository...' }) => {
  return (
    <div className="text-center">
      <div className="card-content inline-flex items-center gap-3 p-6">
        <Loader2 className="w-8 h-8 text-white animate-spin" aria-hidden="true" />
        <div className="text-white">
          <div className="font-medium">{message}</div>
          <div className="text-sm text-white/70">This may take a few moments...</div>
        </div>
      </div>
      
      {/* Screen reader only text */}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
};

export default LoadingSpinner; 