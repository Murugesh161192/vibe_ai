import React from 'react';
import { Sparkles, BarChart3, Bot, Zap } from 'lucide-react';

const Header = ({ analysisState, onNewAnalysis }) => {
  const getHeaderContent = () => {
    switch (analysisState) {
      case 'processing':
        return {
          title: 'Analysis in Progress',
          subtitle: 'Analyzing repository structure and metrics...',
          icon: BarChart3,
          showButton: false,
          showCapabilities: false
        };
      case 'results':
        return {
          title: '📊 Analysis Complete',
          subtitle: 'Repository insights generated successfully',
          icon: BarChart3,
          showButton: true,
          buttonText: '🔄 New Analysis',
          showCapabilities: false,
          minimal: true
        };
      default:
        return {
          title: 'Vibe GitHub Assistant',
          subtitle: 'Analyze GitHub repositories with advanced metrics',
          icon: Sparkles,
          showButton: false,
          showCapabilities: true
        };
    }
  };

  const content = getHeaderContent();
  const IconComponent = content.icon;

  // Minimal header for results view
  if (content.minimal) {
    return (
      <div className="text-center mb-6 px-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="icon-container icon-container-primary w-10 h-10">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-lg sm:text-xl font-semibold text-white">{content.title}</h1>
              <p className="text-xs sm:text-sm text-white/70">{content.subtitle}</p>
            </div>
          </div>
          {content.showButton && (
            <button
              onClick={onNewAnalysis}
              className="btn-primary text-sm px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl"
            >
              {content.buttonText}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 px-4 sm:px-6">
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="icon-container icon-container-primary w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto">
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </div>
        </div>
        
        <div>
          <h1 className="text-heading-xl text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
            {content.title}
          </h1>
          <p className="text-body text-sm sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
        </div>
      </div>

      {/* Capabilities Showcase - Only show on landing page */}
      {content.showCapabilities && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 mb-3">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Smart Analysis</h3>
              <p className="text-white/80 text-sm">Comprehensive repository metrics and insights</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/20 mb-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white text-base sm:text-lg mb-2">12+ Metrics</h3>
              <p className="text-white/80 text-sm">Code quality, security, collaboration, and more</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-500/20 mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Instant Results</h3>
              <p className="text-white/80 text-sm">Fast analysis with visual charts and breakdowns</p>
            </div>
          </div>
        </div>
      )}

      {content.showButton && !content.minimal && (
        <div className="pt-4">
          <button
            onClick={onNewAnalysis}
            className="btn-primary text-base px-8 py-3.5 rounded-xl hover-lift font-medium shadow-lg hover:shadow-xl"
          >
            {content.buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default Header; 