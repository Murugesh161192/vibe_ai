import React from 'react';

const LoadingSpinner = ({ message = 'Analyzing repository...' }) => {
  return (
    <div className="text-center py-12">
      <div className="card-glass p-8 max-w-md mx-auto">
        {/* Large, prominent spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
            {/* Spinning inner ring */}
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
            {/* Center dot for visual appeal */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-80"></div>
          </div>
        </div>
        
        {/* Message section */}
        <div className="text-white space-y-2">
          <div className="text-xl font-semibold">{message}</div>
          <div className="text-white/70">This may take a few moments...</div>
          
          {/* Progress indicator dots */}
          <div className="flex justify-center space-x-1 pt-4">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
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