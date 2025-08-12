import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Sparkles, Command, ArrowRight, Keyboard, X, AlertCircle, Github, Zap } from 'lucide-react';
import { getKeyboardShortcuts, isModifierPressed, detectOS } from '../utils/osDetection';

const ChatInput = ({ onSubmit, loading, placeholder = "Enter GitHub username or repository URL", disabled = false }) => {
  const [input, setInput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentOS, setCurrentOS] = useState('windows');
  const [isMobile, setIsMobile] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const inputRef = useRef(null);

  // Enhanced example suggestions with different types
  const suggestions = [
    { type: 'username', text: 'torvalds', icon: Github, description: 'Explore a developer profile' },
    { type: 'repo', text: 'facebook/react', icon: Zap, description: 'Analyze a popular repository' },
    { type: 'repo', text: 'microsoft/vscode', icon: Zap, description: 'Check code quality metrics' },
    { type: 'username', text: 'octocat', icon: Github, description: 'View contribution patterns' },
    { type: 'repo', text: 'vercel/next.js', icon: Zap, description: 'Deep dive into frameworks' }
  ];

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

  // Cycle through suggestions every 4 seconds
  useEffect(() => {
    if (!isFocused && !input) {
      const interval = setInterval(() => {
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isFocused, input, suggestions.length]);

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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };



  const currentSuggestion = suggestions[suggestionIndex];
  const isValidInput = input.trim().length > 0 && isValid;
  const showSuggestions = !isFocused && !input && !loading;

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto"
      role="search"
      aria-label="Repository analysis input"
    >
      {/* Animated Background Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20 rounded-2xl blur-lg transition-all duration-500 ${isFocused ? 'opacity-60 scale-105' : 'opacity-0 scale-100'}`} />
      
      <form 
        onSubmit={handleSubmit} 
        className="relative"
        noValidate
      >
        <div className="relative group">
          {/* Enhanced input field with glassmorphism */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isFocused || input ? placeholder : ''}
              disabled={disabled || loading}
              className={`
                w-full px-4 sm:px-6 lg:px-8 
                py-4 sm:py-5 lg:py-6 
                pr-24 sm:pr-32 lg:pr-36
                text-base sm:text-lg lg:text-xl 
                bg-white/5 backdrop-blur-2xl
                border-2 rounded-2xl 
                text-white placeholder-transparent
                shadow-2xl 
                transition-all duration-500 ease-out
                min-h-[56px] sm:min-h-[64px] lg:min-h-[72px]
                ${isFocused 
                  ? 'border-violet-400/60 shadow-violet-500/20' 
                  : isValidInput 
                    ? 'border-emerald-400/40 shadow-emerald-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }
                ${error ? 'border-red-400/60 shadow-red-500/20' : ''}
                ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
                focus:outline-none focus:border-violet-400/80 focus:shadow-2xl focus:shadow-violet-500/20
                hover:shadow-xl hover:bg-white/10
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
            
            {/* Custom Animated Placeholder */}
            {!input && (
              <div className={`absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 ${isFocused ? 'opacity-0 translate-y-[-150%] scale-75' : 'opacity-100'}`}>
                {showSuggestions ? (
                  <div className="flex items-center gap-3 animate-fade-in">
                    <currentSuggestion.icon className="w-5 h-5 text-violet-400/70" />
                    <div>
                      <span className="text-white/90 text-base sm:text-lg font-medium">
                        {currentSuggestion.text}
                      </span>
                      <span className="text-white/40 text-sm sm:text-base ml-2">
                        — {currentSuggestion.description}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-white/40 text-base sm:text-lg">
                    {placeholder}
                  </span>
                )}
              </div>
            )}
            
            {/* Enhanced loading indicator */}
            {loading && (
              <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3" aria-hidden="true">
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-violet-400/30 rounded-full" />
                  <div className="absolute top-0 left-0 w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-violet-400 text-sm font-medium animate-pulse">
                  Analyzing...
                </span>
              </div>
            )}
            
            {/* Enhanced submit button with better states */}
            <button
              type="submit"
              disabled={disabled || loading || !input.trim()}
              className={`
                absolute right-2 sm:right-3 lg:right-4 
                top-1/2 -translate-y-1/2 
                px-4 sm:px-6 lg:px-8 
                py-2.5 sm:py-3 lg:py-3.5 
                text-sm sm:text-base lg:text-lg 
                font-semibold rounded-xl 
                transition-all duration-300 ease-out
                min-h-[44px] sm:min-h-[50px] lg:min-h-[56px]
                min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]
                ${isValidInput && !loading && !disabled
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-2xl hover:shadow-violet-500/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:ring-offset-2 focus:ring-offset-transparent active:scale-95'
                  : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                }
              `}
              aria-label={loading ? 'Analyzing repository' : 'Analyze repository'}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Analyze</span>
                  <span className="sm:hidden">Go</span>
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced error message */}
        {error && (
          <div 
            id="input-error"
            className="mt-4 px-4 py-3 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl animate-slide-down"
            role="alert"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}
        

        
        {/* Enhanced help text */}
        {!error && (
          <div 
            id="input-hint"
            className="mt-3 text-center"
          >
            <p className="text-xs sm:text-sm text-white/30">
              Enter a GitHub repo URL, owner/repo format, or username to get started
            </p>
          </div>
        )}
      </form>
      
      {/* Enhanced keyboard shortcuts hint */}
      {!isMobile && (
        <div className="mt-6 flex justify-center items-center gap-4 text-xs text-white/30">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/40">
              Enter
            </kbd>
            <span>to analyze</span>
          </div>
          {isValidInput && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/40">
                  Esc
                </kbd>
                <span>to clear</span>
              </div>
            </>
          )}
          <span>•</span>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/40">
              {currentOS === 'mac' ? '⌘' : 'Ctrl'} K
            </kbd>
            <span>to focus</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput; 