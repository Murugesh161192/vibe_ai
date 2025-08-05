import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', progress = null }) => {
  return (
    <div className="icon-align-center flex-col p-8 sm:p-12" data-testid="loading-spinner">
      {/* Main loading container */}
      <div className="relative mb-6">
        {/* Primary spinner */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-purple-200/30 border-t-purple-400 rounded-full animate-spin"></div>
        
        {/* Centered icon */}
        <div className="absolute inset-0 icon-align-center">
          <div className="icon-container icon-container-primary p-3">
            <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-3">
        <h3 className="text-heading-md bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold">
          {message}
        </h3>
        
        {/* AI attribution */}
        <div className="icon-text-align justify-center text-white/70 text-responsive">
          <Sparkles className="icon-sm text-purple-300" />
          <span>Powered by AI</span>
        </div>
        
        {/* Progress bar (if provided) */}
        {progress && (
          <div className="mt-4 w-48 mx-auto">
            <div className="w-full bg-purple-200/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-white/60 text-sm">
              {Math.round(progress)}% complete
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 