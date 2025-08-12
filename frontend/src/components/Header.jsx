import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Play, Home, Search, Zap, RefreshCw, ChevronDown, Github, Sparkles, Menu, X, Info } from 'lucide-react';
import { startAnalysisAndNavigate } from '../store/slices/analysisSlice';
import { setCurrentView, setError, setLoading } from '../store/slices/appSlice';
import { clearAnalysis } from '../store/slices/analysisSlice';
import { useFocusTrap, useKeyboardShortcuts } from '../utils/accessibility';
import MetricsModal from './MetricsModal';

const Header = ({ 
  onDemoMode, 
  loading, 
  currentView, 
  onNewSearch, 
  onNewAnalysis
}) => {
  const [selectedTech, setSelectedTech] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const techDropdownRef = useRef(null);
  const focusTrapRef = useFocusTrap(mobileMenuOpen);
  
  // Example repositories for each tech
  const techExamples = {
    react: 'https://github.com/facebook/react',
    vue: 'https://github.com/vuejs/core',
    nodejs: 'https://github.com/nodejs/node',
    python: 'https://github.com/python/cpython'
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
        setTechDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (techDropdownOpen) {
          setTechDropdownOpen(false);
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, techDropdownOpen]);
  
  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentView]);
  
  // Keyboard shortcuts for header actions
  useKeyboardShortcuts({
    'alt+h': () => handleGoHome(),
    'alt+n': () => onNewAnalysis && onNewAnalysis(),
    'alt+e': () => onExport && onExport(),
    'alt+s': () => onShare && onShare(),
  });
  
  const handleTechSelect = (tech) => {
    setSelectedTech(tech);
    if (techExamples[tech]) {
      dispatch(startAnalysisAndNavigate(techExamples[tech]));
    }
    setTechDropdownOpen(false);
    // Announce to screen readers
    const announcement = `Loading ${tech} repository example`;
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);
  };
  
  const handleGoHome = () => {
    // Clear all state and go to home
    dispatch(clearAnalysis());
    dispatch(setError(null));
    dispatch(setLoading(false));
    dispatch(setCurrentView('ready'));
    if (onNewSearch) {
      onNewSearch();
    }
  };
  
  // Mobile styles for smaller screens
  const btnClasses = 'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium';
  const primaryBtnClasses = 'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm font-medium';
  
  // Use consistent header design for all pages
  return (
    <>
      {/* Fixed Header - Consistent across all pages */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 animate-slide-down"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0)', // Support for notched devices
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          backdropFilter: 'blur(12px)'
        }}
        role="banner"
        aria-label="Main header"
      >
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        
        {/* Header with mobile-optimized styling */}
        <div className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm border-b border-white/10">
          <div className="px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 xs:py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 xs:gap-3">
              {/* Left Side - Logo and Title (Mobile Optimized) */}
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 flex-1 min-w-0">
                <button 
                  onClick={handleGoHome}
                  className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg p-0.5 xs:p-1"
                  aria-label="Go to home page"
                >
                  <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent truncate">
                      <span className="xs:hidden">Vibe Assistant</span>
                      <span className="hidden xs:inline">Vibe GitHub Assistant</span>
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 hidden xs:block truncate">
                      AI-Powered Repository Analysis
                    </span>
                  </div>
                </button>
              </div>

              {/* Center/Right Side - Navigation Actions */}
              <div className="hidden md:flex items-center gap-2 lg:gap-3">
                {/* Metrics Info Button - Always visible */}
                <button
                  onClick={() => setMetricsModalOpen(true)}
                  className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] px-3"
                  aria-label="View metrics explanation"
                >
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                  <span className="hidden lg:inline">How We Score</span>
                  <span className="lg:hidden">Metrics</span>
                </button>
                
                {/* Show navigation based on current view */}
                {currentView === 'ready' && !loading && (
                  <>
                    <button
                      onClick={onDemoMode}
                      className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] px-3"
                      aria-label="Try demo mode"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                      <span>Try Demo</span>
                    </button>
                    
                    <div className="relative" ref={techDropdownRef}>
                      <button
                        onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                        className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] px-3"
                        aria-expanded={techDropdownOpen}
                        aria-haspopup="true"
                        aria-controls="tech-menu"
                      >
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                        <span>Quick Start</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${techDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                      
                      {techDropdownOpen && (
                        <div 
                          id="tech-menu"
                          className="absolute top-full mt-2 right-0 bg-gray-800 border border-white/10 rounded-lg shadow-xl p-2 min-w-[160px]"
                          role="menu"
                        >
                          {Object.entries(techExamples).map(([tech, url]) => (
                            <button
                              key={tech}
                              onClick={() => handleTechSelect(tech)}
                              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded transition-colors text-sm capitalize"
                              role="menuitem"
                            >
                              {tech}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Analysis Actions */}
                {(currentView === 'analysis' || currentView === 'profile') && (
                  <>
                    <button
                      onClick={handleGoHome}
                      className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] px-3"
                      aria-label="Go home"
                    >
                      <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                      <span className="hidden lg:inline">Home</span>
                    </button>
                    
                    <button
                      onClick={onNewAnalysis}
                      className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] px-3"
                      aria-label="Start new analysis"
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                      <span className="hidden lg:inline">New Analysis</span>
                      <span className="lg:hidden">New</span>
                    </button>
                  </>
                )}
                
                {/* Demo mode navigation */}
                {currentView === 'demo' && (
                  <button
                    onClick={handleGoHome}
                    className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 min-h-[40px] px-3"
                    aria-label="Exit demo"
                  >
                    <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    <span>Exit Demo</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5 text-white" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div 
                id="mobile-menu"
                ref={focusTrapRef}
                className="md:hidden mt-4 py-4 border-t border-white/10"
                role="menu"
                aria-label="Mobile navigation"
              >
                <div className="flex flex-col gap-2">
                  {/* Metrics Info Button - Always visible in mobile */}
                  <button
                    onClick={() => {
                      setMetricsModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <Info className="w-4 h-4" aria-hidden="true" />
                    <span>How We Score</span>
                  </button>
                  
                  {currentView === 'ready' && !loading && (
                    <>
                      <button
                        onClick={() => {
                          onDemoMode();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <Play className="w-4 h-4" aria-hidden="true" />
                        <span>Try Demo</span>
                      </button>
                      
                      <div className="px-4 py-2">
                        <p className="text-xs text-white/60 mb-2">Quick Start:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(techExamples).map(([tech, url]) => (
                            <button
                              key={tech}
                              onClick={() => {
                                handleTechSelect(tech);
                                setMobileMenuOpen(false);
                              }}
                              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-sm capitalize"
                              role="menuitem"
                            >
                              {tech}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {(currentView === 'analysis' || currentView === 'profile') && (
                    <>
                      <button
                        onClick={() => {
                          handleGoHome();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <Home className="w-4 h-4" aria-hidden="true" />
                        <span>Home</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onNewAnalysis();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        <span>New Analysis</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Spacer to account for fixed header height */}
      <div className="h-14 xs:h-16 sm:h-20 w-full" aria-hidden="true" />

      {/* Metrics Modal */}
      <MetricsModal 
        isOpen={metricsModalOpen} 
        onClose={() => setMetricsModalOpen(false)} 
      />
    </>
  );
};

export default Header; 