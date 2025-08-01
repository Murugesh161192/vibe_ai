import React from 'react';
import { Zap, Sparkles, ArrowLeft } from 'lucide-react';

const Header = ({ analysisState = 'ready', onNewAnalysis }) => {
  // Show compact header when results are displayed
  if (analysisState === 'results') {
    return (
      <header className="text-center py-6">
        {/* Compact Title */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="icon-container icon-container-primary p-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-heading-lg">
              Vibe AI
            </h1>
          </div>
        </div>
        
        {/* New Analysis Button */}
        {onNewAnalysis && (
          <button 
            onClick={onNewAnalysis}
            className="btn-secondary flex items-center gap-2 mx-auto"
            aria-label="Analyze another repository"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze Another Repository
          </button>
        )}
      </header>
    );
  }

  // Full header for initial state and processing
  return (
    <header className="text-center py-12">
      {/* Main Title with Enhanced Design */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="icon-container icon-container-primary p-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-heading-xl">
            Vibe AI
          </h1>
        </div>
      </div>
      
      {/* Enhanced Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-heading-xl mb-6">
          Analyze GitHub Repositories. Discover Their Vibe.
        </h2>
        <p className="text-body text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
          Intelligent insights into code quality, collaboration, and innovation
        </p>
        
        {/* Conditional Action Button - Only show when not displaying results */}
        {analysisState !== 'results' && (
          <button 
            onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary flex items-center gap-2 mx-auto"
            aria-label="Try the demo"
          >
            <Zap className="w-5 h-5" />
            Try It Now
          </button>
        )}
      </div>
      
      {/* Enhanced Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
        <div className="card-glass-sm p-6">
          <div className="icon-container icon-container-success mb-4 mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-heading-sm text-center mb-2">Security & Safety</h3>
          <p className="text-body-sm text-center">Vulnerability scanning & compliance</p>
        </div>
        
        <div className="card-glass-sm p-6">
          <div className="icon-container icon-container-danger mb-4 mx-auto">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-heading-sm text-center mb-2">Performance & Scalability</h3>
          <p className="text-body-sm text-center">Monitoring & optimization</p>
        </div>
        
        <div className="card-glass-sm p-6">
          <div className="icon-container icon-container-info mb-4 mx-auto">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-heading-sm text-center mb-2">Testing Quality</h3>
          <p className="text-body-sm text-center">CI/CD & quality assurance</p>
        </div>
        
        <div className="card-glass-sm p-6">
          <div className="icon-container icon-container-primary mb-4 mx-auto">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-heading-sm text-center mb-2">Community Health</h3>
          <p className="text-body-sm text-center">Guidelines & collaboration</p>
        </div>
      </div>

    </header>
  );
};

export default Header; 