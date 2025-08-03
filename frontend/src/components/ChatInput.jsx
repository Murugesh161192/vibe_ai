import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Github, User, Sparkles } from 'lucide-react';

const ChatInput = ({ onSubmit, loading, showWelcome = true }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  // Responsive placeholder text
  const [placeholder, setPlaceholder] = useState('Username or owner/repo');
  
  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 640) {
        setPlaceholder('Username or owner/repo');
      } else {
        setPlaceholder('Type a GitHub username or repository URL...');
      }
    };
    
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    return () => window.removeEventListener('resize', updatePlaceholder);
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    
    // Handle empty input
    if (!trimmedInput) {
      setError('Please enter a GitHub username or repository URL.');
      return;
    }

    setError('');
    setInput('');
    
    // Call parent handler with input directly
    onSubmit(trimmedInput);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Provide real-time validation hints
    if (value.trim()) {
      const trimmed = value.trim();
      
      // Check for common mistakes
      if (trimmed.startsWith('github.com/')) {
        setError('Tip: Include https:// at the beginning of the URL');
      } else if (trimmed.includes(' ')) {
        setError('Username or repository URL should not contain spaces');
      } else if (trimmed.startsWith('@')) {
        setError('Enter username without @ symbol');
      }
    }
  };

  const handleExampleClick = (example) => {
    setInput(example);
    setError('');
    // Auto-submit the example
    setTimeout(() => {
      onSubmit(example);
    }, 100);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Message */}
      {showWelcome && (
        <div className="card-glass p-4 sm:p-6 md:p-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="icon-container icon-container-primary p-2 sm:p-3 w-12 h-12 sm:w-14 sm:h-14">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Hi! I'm Vibe GitHub Assistant
              </h2>
            </div>
          </div>
          <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Let me help you analyze GitHub repositories and discover user profiles. Enter a username or repository URL below to get started.
          </p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="card-glass p-4 sm:p-6">
        <div className="relative group">
          <div className="flex items-center">
            <div className="absolute left-3 sm:left-4 z-10 text-white/50 group-focus-within:text-white transition-colors pointer-events-none hidden sm:flex items-center h-full">
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="input-glass w-full px-12 sm:pl-14 sm:pr-14 py-3 sm:py-4 text-sm sm:text-base font-medium placeholder-white/50 focus:border-indigo-400 text-center sm:text-left placeholder:text-center sm:placeholder:text-left"
              disabled={loading}
              aria-label="GitHub username or repository URL"
            />
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 rounded-lg transition-all touch-target ${
                loading || !input.trim()
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:scale-110 shadow-lg active:scale-95'
              }`}
              aria-label="Submit"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Validation Error */}
        {error && (
          <div className={`rounded-lg p-2 sm:p-3 text-xs sm:text-sm ${
            error.startsWith('Tip:') 
              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' 
              : 'bg-red-500/10 text-red-300 border border-red-500/20'
          } animate-fade-in mt-3`}>
            <p>{error}</p>
          </div>
        )}

        {/* Examples Section */}
        {showWelcome && (
          <div className="mt-4 sm:mt-6">
            <div className="text-white/70 text-xs sm:text-sm mb-3 flex items-center gap-2">
              <span>Examples:</span>
              <span className="hidden sm:inline-flex items-center gap-2">
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs">Username</span>
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs">owner/repo</span>
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs">GitHub URL</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'torvalds', type: 'user' },
                { label: 'octocat', type: 'user' },
                { label: 'facebook/react', type: 'repo' },
                { label: 'microsoft/vscode', type: 'repo' }
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example.label)}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 shadow-sm"
                  disabled={loading}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput; 