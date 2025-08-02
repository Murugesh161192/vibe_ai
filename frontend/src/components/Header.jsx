import React from 'react';
import { Zap, Sparkles, ArrowLeft, Star, TrendingUp, Code, Users } from 'lucide-react';

const Header = ({ analysisState = 'ready', onNewAnalysis }) => {
  // Show compact header when results are displayed
  if (analysisState === 'results') {
    return (
      <header className="text-center py-4 sm:py-6">
        {/* Compact Title */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="icon-container icon-container-primary p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Vibe AI
            </h1>
          </div>
        </div>
        
        {/* New Analysis Button */}
        {onNewAnalysis && (
          <button 
            onClick={onNewAnalysis}
            className="btn-secondary flex items-center gap-2 mx-auto text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 hover-lift"
            aria-label="Analyze another repository"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Analyze Another Repository</span>
          </button>
        )}
      </header>
    );
  }

  // Enhanced hero section for landing page
  return (
    <header className="text-center py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Main Title with Enhanced Design */}
      <div className="relative z-10 mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative">
            <div className="icon-container icon-container-primary p-4 sm:p-5 w-16 h-16 sm:w-20 sm:h-20 hover-lift">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 blur-xl"></div>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text">
              Vibe AI
            </h1>
            <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full mt-2 mx-auto"></div>
          </div>
        </div>
        
        {/* Enhanced Subtitle */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Analyze GitHub Repositories.
            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Discover Their Vibe.
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed px-4 sm:px-0 max-w-2xl mx-auto">
            Get intelligent insights into code quality, collaboration patterns, and innovation metrics with our AI-powered analysis
          </p>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
          <div className="card-glass-sm p-4 sm:p-6 hover-lift">
            <div className="icon-container icon-container-success w-12 h-12 mx-auto mb-3">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Code Quality Analysis</h3>
            <p className="text-white/70 text-xs sm:text-sm">Deep dive into test coverage, complexity, and best practices</p>
          </div>
          
          <div className="card-glass-sm p-4 sm:p-6 hover-lift">
            <div className="icon-container icon-container-info w-12 h-12 mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Team Collaboration</h3>
            <p className="text-white/70 text-xs sm:text-sm">Evaluate community health and contribution patterns</p>
          </div>
          
          <div className="card-glass-sm p-4 sm:p-6 hover-lift">
            <div className="icon-container icon-container-warning w-12 h-12 mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Innovation Metrics</h3>
            <p className="text-white/70 text-xs sm:text-sm">Assess modern practices and technological advancement</p>
          </div>
        </div>
      </div>

      {/* Enhanced CTA based on state */}
      <div className="relative z-10">
        {analysisState === 'ready' && (
          <div className="flex justify-center">
            {/* Interactive scroll indicator */}
            <button 
              onClick={() => {
                const demoSection = document.getElementById('demo-section');
                if (demoSection) {
                  demoSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }}
              className="group flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-all duration-300 cursor-pointer transform hover:scale-105 p-4 rounded-lg hover:bg-white/5 mx-auto"
              aria-label="Scroll to repository analysis section"
            >
              <span className="text-xs uppercase tracking-wide font-medium">Get Started</span>
              <div className="animate-bounce group-hover:animate-pulse">
                <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 