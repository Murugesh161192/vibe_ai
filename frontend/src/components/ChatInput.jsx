import React, { useState, useRef, useEffect } from 'react';
import { Send, Github, User, Sparkles } from 'lucide-react';
import { getKeyboardShortcuts } from '../utils/osDetection';

const ChatInput = ({ onSubmit, loading, placeholder = "Enter GitHub username or repository URL..." }) => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('auto'); // 'auto', 'repo', 'user'
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts - only active on desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard shortcuts on desktop devices
      // Check if device has a keyboard (not touch-only)
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          const trimmedInput = input.trim();
          if (trimmedInput && !loading) {
            onSubmit(trimmedInput);
            setInput('');
          }
        }
        
        // Escape to clear input
        if (e.key === 'Escape') {
          setInput('');
          inputRef.current?.focus();
        }
        
        // Ctrl/Cmd + K to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [input, loading, onSubmit]);

  // Auto-detect input type
  useEffect(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setInputType('auto');
      return;
    }

    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(\/.*)?$/;
    const isRepoUrl = githubUrlPattern.test(trimmedInput);
    const hasSlash = trimmedInput.includes('/');
    
    if (isRepoUrl || hasSlash) {
      setInputType('repo');
    } else {
      setInputType('user');
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;
    
    onSubmit(trimmedInput);
    setInput('');
  };

  const getInputIcon = () => {
    switch (inputType) {
      case 'repo':
        return <Github className="icon-md text-purple-400" />;
      case 'user':
        return <User className="icon-md text-blue-400" />;
      default:
        return <Sparkles className="icon-md text-gray-400" />;
    }
  };

  const getPlaceholder = () => {
    switch (inputType) {
      case 'repo':
        return isMobile ? "Repository URL" : "Repository URL (e.g., facebook/react)";
      case 'user':
        return isMobile ? "GitHub username" : "GitHub username (e.g., torvalds)";
      default:
        return isMobile ? "Username or repo URL" : placeholder;
    }
  };

  return (
    <div className="card-glass p-6 max-w-2xl mx-auto" data-testid="chat-input">
      <div className="spacing-responsive">
        {/* Input field with icon */}
        <div className="input-icon-both">
          <div className="icon-left flex items-center justify-center">
            {getInputIcon()}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={getPlaceholder()}
            disabled={loading}
            className={`input-glass w-full py-3 text-responsive placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 touch-target ${input ? 'text-left' : 'text-center'}`}
            aria-label="Enter GitHub repository URL or username"
            data-testid="chat-input-field"
          />
          
          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="icon-right flex items-center justify-center text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Submit analysis"
            data-testid="chat-submit-button"
          >
            <Send className="w-5 h-5 flex-shrink-0" />
          </button>
        </div>

        {/* Keyboard shortcuts hint - Only show on desktop */}
        <div className="hidden lg:block text-xs text-white/50 text-center space-x-4">
          <span>{getKeyboardShortcuts().focus} to focus</span>
          <span>{getKeyboardShortcuts().submit} to submit</span>
          <span>{getKeyboardShortcuts().clear} to clear</span>
        </div>

        {/* Input type indicator */}
        {inputType !== 'auto' && (
          <div className="icon-align-center space-x-2 text-xs">
            <span className="text-white/60">Analyzing:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              inputType === 'repo' 
                ? 'bg-purple-500/20 text-purple-300' 
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {inputType === 'repo' ? 'Repository' : 'User Profile'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 