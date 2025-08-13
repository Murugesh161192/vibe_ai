import React, { useEffect, useState } from 'react';
import { Sparkles, Code2, GitBranch, Zap } from 'lucide-react';
import { usePrefersReducedMotion } from '../utils/accessibility';

const LoadingSpinner = ({ 
  variant = 'default',
  fullScreen = true,
  message = null,
  showProgress = false,
  progress = 0
}) => {
  const [loadingText, setLoadingText] = useState('Loading');
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Prevent body scrolling when fullScreen loading is active
  useEffect(() => {
    if (fullScreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Announce loading state to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = 'Loading in progress';
      document.body.appendChild(announcement);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        if (announcement.parentNode) {
          document.body.removeChild(announcement);
        }
      };
    }
  }, [fullScreen]);
  
  // Animated loading text for better user feedback
  useEffect(() => {
    if (!prefersReducedMotion) {
      const texts = ['Loading', 'Loading.', 'Loading..', 'Loading...'];
      let index = 0;
      
      const interval = setInterval(() => {
        setLoadingText(texts[index]);
        index = (index + 1) % texts.length;
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [prefersReducedMotion]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'user':
        return {
          gradient: 'from-blue-500 to-purple-500',
          orbColor: 'bg-blue-500',
          Icon: Code2,
          defaultMessage: 'Fetching user profile...'
        };
      case 'repository':
        return {
          gradient: 'from-green-500 to-emerald-500',
          orbColor: 'bg-green-500',
          Icon: GitBranch,
          defaultMessage: 'Analyzing repository...'
        };
      case 'insights':
        return {
          gradient: 'from-yellow-500 to-orange-500',
          orbColor: 'bg-yellow-500',
          Icon: Sparkles,
          defaultMessage: 'Generating AI insights...'
        };
      default:
        return {
          gradient: 'from-blue-500 to-purple-500',
          orbColor: 'bg-purple-500',
          Icon: Zap,
          defaultMessage: 'Processing...'
        };
    }
  };

  const { gradient, orbColor, Icon, defaultMessage } = getVariantStyles();
  const displayMessage = message || defaultMessage;

  // Simplified loader for reduced motion preference
  if (prefersReducedMotion) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4"
        role="status"
        aria-label={displayMessage}
        aria-live="polite"
        aria-busy="true"
      >
        <div className="relative">
          <div className={`p-6 rounded-full bg-gradient-to-br ${gradient} opacity-20`}>
            <Icon className="w-12 h-12 text-white" aria-hidden="true" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-medium">{displayMessage}</p>
          {showProgress && (
            <div className="mt-4 w-48 bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const spinnerContent = (
    <div 
      className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 gap-6 sm:gap-8"
      data-testid="loading-spinner"
      role="status"
      aria-label={displayMessage}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Enhanced Animated Loader - Optimized for performance */}
      <div className="relative will-change-transform">
        {/* Outer glow effect - GPU accelerated */}
        <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 gpu-accelerated">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} opacity-20 blur-2xl animate-pulse-subtle`}></div>
        </div>

        {/* Simplified rotating rings for better performance */}
        <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
          <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient-outer)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="220"
              strokeDashoffset="55"
              className="opacity-50"
            />
            <defs>
              <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Inner ring - counter-rotating */}
        <div className="absolute inset-4 sm:inset-5 lg:inset-6 w-24 h-24 sm:w-30 sm:h-30 lg:w-36 lg:h-36">
          <svg className="w-full h-full animate-spin-reverse-slow" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#gradient-inner)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="180"
              strokeDashoffset="45"
              className="opacity-40"
            />
            <defs>
              <linearGradient id="gradient-inner" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Central icon with glass effect */}
        <div className="relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
          <div className="relative z-10 p-4 sm:p-5 lg:p-6 rounded-2xl glass-enhanced">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-pulse-subtle" aria-hidden="true" />
          </div>
        </div>

        {/* Simplified floating orbs for performance */}
        <div className="absolute top-0 right-8 w-3 h-3">
          <div className={`w-full h-full ${orbColor} rounded-full animate-ping opacity-60`}></div>
        </div>
        <div className="absolute bottom-4 left-4 w-2.5 h-2.5">
          <div className={`w-full h-full ${orbColor} rounded-full animate-ping opacity-60`} style={{ animationDelay: '0.5s' }}></div>
        </div>
        <div className="absolute top-1/2 -right-2 w-2 h-2">
          <div className={`w-full h-full ${orbColor} rounded-full animate-ping opacity-60`} style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
      
      {/* Loading message and progress */}
      <div className="text-center space-y-2">
        <p className="text-white text-base sm:text-lg font-medium">
          {prefersReducedMotion ? displayMessage : loadingText}
        </p>
        {message && message !== defaultMessage && (
          <p className="text-white/60 text-sm sm:text-base">{message}</p>
        )}
        {showProgress && (
          <div className="mt-4 w-48 sm:w-64 bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Loading progress: ${progress}%`}
            />
          </div>
        )}
      </div>
      
      {/* Screen reader only text for better context */}
      <span className="sr-only">
        {showProgress ? `Loading progress: ${progress}%. ` : ''}
        Please wait while we process your request.
      </span>
    </div>
  );

  // If fullScreen is true, wrap in a full-screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 layer-max flex items-center justify-center pointer-events-auto">
        {/* Semi-transparent backdrop with blur */}
        <div 
          className="absolute inset-0 bg-gray-900/85 backdrop-blur-md pointer-events-auto"
          aria-hidden="true"
          onClick={(e) => e.preventDefault()}
        />
        {/* Spinner content */}
        <div className="relative z-10 pointer-events-none">
          {spinnerContent}
        </div>
      </div>
    );
  }

  // Otherwise, return the spinner without overlay
  return spinnerContent;
};

export default LoadingSpinner; 