import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Sparkles, Command, ArrowRight, Keyboard, X, AlertCircle } from 'lucide-react';
import { getKeyboardShortcuts, isModifierPressed, detectOS } from '../utils/osDetection';

const ChatInput = ({ onSubmit, loading, placeholder = "Enter GitHub username or repository URL", disabled = false }) => {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentOS, setCurrentOS] = useState('windows');
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);

  // Detect OS and mobile on mount
  useEffect(() => {
    setCurrentOS(detectOS());
    
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Focus input on mount (desktop only)
  useEffect(() => {
    // Only auto-focus on desktop to avoid unwanted keyboard popup on mobile
    if (!isMobile) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Global keyboard shortcut for focus (Ctrl/Cmd + K) - Desktop only
  useEffect(() => {
    if (isMobile) return; // Skip keyboard shortcuts on mobile
    
    const handleGlobalKeyDown = (e) => {
      if (isModifierPressed(e) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isMobile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      setIsValid(false);
      setError('Please enter a GitHub username or repository URL');
      return;
    }
    
    // Reset error state
    setError('');
    setIsValid(true);
    
    onSubmit(trimmedInput);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
      setIsValid(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setInput('');
      setError('');
      setIsValid(true);
      inputRef.current?.blur();
    }
  };

  // Example suggestions for autocomplete feel
  const exampleInputs = ['torvalds', 'facebook/react', 'microsoft/vscode'];
  const currentExample = exampleInputs[Math.floor(Date.now() / 3000) % exampleInputs.length];

  const shortcuts = getKeyboardShortcuts();

  // Check if input looks valid (basic validation)
  const isValidInput = input.trim().length > 0 && isValid;

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto"
      role="search"
      aria-label="Repository analysis input"
    >
      <form 
        onSubmit={handleSubmit} 
        className="relative"
        noValidate
      >
        <div className="relative">
          {/* Mobile-optimized input field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={`
              w-full px-3 xs:px-4 sm:px-5 lg:px-6 
              py-3 xs:py-3.5 sm:py-4 lg:py-5 
              pr-20 xs:pr-24 sm:pr-28 lg:pr-32
              text-[15px] xs:text-sm sm:text-base lg:text-lg 
              bg-gradient-to-r from-gray-800/60 to-gray-900/60 
              border rounded-xl sm:rounded-2xl 
              text-white placeholder-gray-400/80 placeholder:text-sm xs:placeholder:text-sm sm:placeholder:text-base
              backdrop-blur-xl shadow-xl 
              transition-all duration-300
              min-h-[44px] xs:min-h-[48px] sm:min-h-[56px] lg:min-h-[64px]
              ${isValidInput && !loading 
                ? 'border-violet-500/30 hover:border-violet-400/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20' 
                : 'border-white/10 hover:border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
              }
              ${error ? 'border-red-500/50 focus:border-red-400 focus:ring-red-400/30' : ''}
              ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
              focus:outline-none
            `}
            aria-label="Enter GitHub repository URL, owner/repo, or username"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'input-error' : 'input-hint'}
            aria-busy={loading}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          {/* Loading indicator inside input */}
          {loading && (
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" aria-hidden="true">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {/* Mobile-optimized submit button */}
          <button
            type="submit"
            disabled={disabled || loading}
            className={`
              absolute right-1.5 xs:right-2 sm:right-2.5 lg:right-3 
              top-1/2 -translate-y-1/2 
              px-2.5 xs:px-3 sm:px-4 lg:px-5 
              py-2 xs:py-2 sm:py-2.5 lg:py-3 
              text-xs xs:text-xs sm:text-sm lg:text-base 
              font-medium rounded-lg 
              transition-all duration-300 
              min-h-[36px] xs:min-h-[40px] sm:min-h-[44px] lg:min-h-[48px]
              min-w-[60px] xs:min-w-[70px] sm:min-w-[90px] lg:min-w-[100px]
              ${isValidInput && !loading && !disabled
                ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 hover:from-violet-500/30 hover:to-indigo-500/30 backdrop-blur-sm text-white border border-white/10 shadow-lg hover:shadow-xl xs:hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400/50 active:scale-95'
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }
            `}
            aria-label={loading ? 'Analyzing repository' : 'Analyze repository'}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-1">
                <span className="sr-only">Analyzing...</span>
                <span aria-hidden="true">...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1 xs:gap-1.5">
                <Search className="w-3.5 h-3.5 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="hidden xs:hidden sm:inline">Analyze</span>
                <span className="xs:inline sm:hidden">Go</span>
              </span>
            )}
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div 
            id="input-error"
            className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
            role="alert"
          >
            <p className="text-xs sm:text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          </div>
        )}
        
        {/* Help text - responsive */}
        {!error && (
          <div 
            id="input-hint"
            className="mt-2 px-3 text-center"
          >
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">
              Enter a GitHub repo URL (e.g., github.com/facebook/react), owner/repo, or username
            </p>
          </div>
        )}
      </form>
      
      {/* Keyboard shortcuts hint - hidden on mobile */}
      <div className="hidden sm:block absolute -bottom-8 left-0 right-0 text-center">
        <kbd className="px-2 py-1 text-[10px] bg-gray-800 border border-gray-700 rounded text-gray-400">
          Enter
        </kbd>
        <span className="text-[10px] text-gray-500 ml-1">to analyze</span>
        {isValidInput && (
          <>
            <span className="text-gray-600 mx-2">•</span>
            <kbd className="px-2 py-1 text-[10px] bg-gray-800 border border-gray-700 rounded text-gray-400">
              Esc
            </kbd>
            <span className="text-[10px] text-gray-500 ml-1">to clear</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 