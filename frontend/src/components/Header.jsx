import React from 'react';
import { Sparkles, Zap, Play } from 'lucide-react';
import VibeIcon from './VibeIcon';

const Header = ({ analysisState = 'ready', onNewAnalysis, onDemoMode, onAnalyzeRepo }) => {
  const getTitle = () => {
    switch (analysisState) {
      case 'processing':
        return 'Vibe GitHub Analyzer';
      case 'results':
        return 'Analysis Complete';
      default:
        return 'Vibe GitHub Analyzer';
    }
  };

  const getSubtitle = () => {
    switch (analysisState) {
      case 'processing':
        return 'Discover the vibe of any GitHub repository';
      case 'results':
        return 'View your repository analysis below';
      default:
        return 'Discover the vibe of any GitHub repository';
    }
  };

  const quickExamples = [
    { name: 'React', url: 'facebook/react', icon: '⚛️' },
    { name: 'Vue.js', url: 'vuejs/vue', icon: '💚' },
    { name: 'Node.js', url: 'nodejs/node', icon: '🟢' },
    { name: 'Python', url: 'python/cpython', icon: '🐍' }
  ];

  return (
    <header className="text-center container-responsive">
      {/* Main Title */}
      <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
        <div className="icon-container icon-container-primary p-3 flex items-center justify-center">
          <VibeIcon className="icon-xl text-white" />
        </div>
        <div className="flex flex-col items-start">
          <h1 className="text-heading-xl text-white font-bold leading-none">
            {getTitle()}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Sparkles className="icon-sm text-purple-400" />
            <span className="text-purple-400 font-medium text-responsive">Powered by AI</span>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-white/80 text-responsive mb-6 sm:mb-8 max-w-2xl mx-auto">
        {getSubtitle()}
      </p>

      {/* Action Buttons */}
      {analysisState === 'ready' && (
        <div className="flex-responsive-sm mb-8">
          {/* Quick Examples */}
          <div className="flex flex-wrap justify-center gap-2">
            {quickExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => onAnalyzeRepo && onAnalyzeRepo(`https://github.com/${example.url}`)}
                className="btn-secondary icon-text-align-sm px-4 py-2 text-responsive touch-target"
              >
                <span className="text-base">{example.icon}</span>
                {example.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 