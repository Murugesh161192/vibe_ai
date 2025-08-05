import React, { useState } from 'react';
import { Play, Sparkles, BarChart3, Users, Code, Shield, Info, ArrowRight, ExternalLink, Zap } from 'lucide-react';

const DemoMode = ({ onExitDemo, onAnalyzeRepo }) => {
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showLimitedDemo, setShowLimitedDemo] = useState(true);

  const demoRepositories = [
    {
      name: 'React',
      owner: 'facebook',
      url: 'https://github.com/facebook/react',
      description: 'The library for web and native user interfaces',
      stars: 237844,
      language: 'JavaScript',
      vibeScore: 56,
      metrics: {
        codeQuality: 30,
        readability: 100,
        collaboration: 85,
        innovation: 100,
        maintainability: 50,
        inclusivity: 60,
        security: 50,
        performance: 0,
        testingQuality: 50,
        communityHealth: 40,
        codeHealth: 30,
        releaseManagement: 0
      }
    },
    {
      name: 'Vue.js',
      owner: 'vuejs',
      url: 'https://github.com/vuejs/vue',
      description: 'Progressive JavaScript framework',
      stars: 209222,
      language: 'JavaScript',
      vibeScore: 52,
      metrics: {
        codeQuality: 74,
        readability: 70,
        collaboration: 85,
        innovation: 100,
        maintainability: 80,
        inclusivity: 0,
        security: 20,
        performance: 0,
        testingQuality: 20,
        communityHealth: 0,
        codeHealth: 30,
        releaseManagement: 0
      }
    },
    {
      name: 'Node.js',
      owner: 'nodejs',
      url: 'https://github.com/nodejs/node',
      description: 'JavaScript runtime built on Chrome V8',
      stars: 112520,
      language: 'JavaScript',
      vibeScore: 47,
      metrics: {
        codeQuality: 30,
        readability: 70,
        collaboration: 85,
        innovation: 40,
        maintainability: 70,
        inclusivity: 60,
        security: 50,
        performance: 0,
        testingQuality: 0,
        communityHealth: 40,
        codeHealth: 30,
        releaseManagement: 0
      }
    },
    {
      name: 'Python',
      owner: 'python',
      url: 'https://github.com/python/cpython',
      description: 'The Python programming language',
      stars: 55000,
      language: 'Python',
      vibeScore: 35,
      metrics: {
        codeQuality: 30,
        readability: 70,
        collaboration: 85,
        innovation: 40,
        maintainability: 30,
        inclusivity: 0,
        security: 20,
        performance: 0,
        testingQuality: 0,
        communityHealth: 0,
        codeHealth: 30,
        releaseManagement: 0
      }
    }
  ];

  const handleRepoClick = (repo) => {
    setSelectedRepo(repo);
    setShowMetrics(true);
  };

  const handleAnalyzeRepo = (repo) => {
    onAnalyzeRepo(repo.url);
  };

  const handleTryRealAnalysis = () => {
    onExitDemo();
  };

  return (
    <div className="space-y-8">
      {/* Demo Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Play className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <h2 className="text-2xl font-bold text-white">Demo Mode</h2>
        </div>
        <p className="text-white/80 mb-4 max-w-lg mx-auto">
          Preview sample repository analyses to understand Vibe's capabilities
        </p>
        <div className="flex items-start justify-center gap-2 text-sm text-white/60 mb-6 px-4 max-w-md mx-auto">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-center leading-relaxed">This is a limited preview. Try real analysis for full insights!</span>
        </div>
        
        {/* Strong CTA to real analysis */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={handleTryRealAnalysis}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg touch-target"
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            Try Real Analysis
          </button>
          <button
            onClick={onExitDemo}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors touch-target"
          >
            Exit Demo
          </button>
        </div>
      </div>

      {/* Limited Demo Repositories */}
              <div className="grid-responsive-md">
        {demoRepositories.slice(0, 2).map((repo, index) => (
          <div
            key={index}
            className={`card-glass p-6 hover:bg-white/10 transition-all cursor-pointer ${
              selectedRepo?.name === repo.name ? 'ring-2 ring-purple-400' : ''
            }`}
            onClick={() => handleRepoClick(repo)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {repo.name}
                </h3>
                <p className="text-white/60 text-sm">
                  {repo.owner}/{repo.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-400 font-medium">
                  Demo Preview
                </div>
                <div className="text-xs text-white/60">Vibe Score Hidden</div>
              </div>
            </div>
            
            <p className="text-white/80 text-sm mb-4">
              {repo.description}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span className="text-white/70">{repo.language}</span>
              </div>
              <div className="text-white/60">
                ⭐ {repo.stars.toLocaleString()}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnalyzeRepo(repo);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors touch-target"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                Analyze Full Repository
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Limited Metrics Preview */}
      {selectedRepo && showMetrics && (
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              Sample Metrics for {selectedRepo.name}
            </h3>
            <button
              onClick={() => setShowMetrics(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-yellow-600/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-400 font-medium">Demo Preview</span>
            </div>
            <p className="text-white/70 text-sm">
              This shows just 4 sample metrics. Real analysis includes all 12 metrics plus AI insights, 
              detailed breakdowns, and personalized recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {selectedRepo.metrics.codeQuality}%
              </div>
              <div className="text-sm text-white/60 mb-2">Code Quality</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {selectedRepo.metrics.readability}%
              </div>
              <div className="text-sm text-white/60 mb-2">Readability</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {selectedRepo.metrics.collaboration}%
              </div>
              <div className="text-sm text-white/60 mb-2">Collaboration</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-indigo-400 mb-1">
                {selectedRepo.metrics.innovation}%
              </div>
              <div className="text-sm text-white/60 mb-2">Innovation</div>
            </div>
          </div>

          <div className="p-4 bg-purple-600/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-lg font-semibold text-white">Vibe Score</div>
                <div className="text-sm text-white/70">Demo: Score hidden</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-400 font-medium">Demo Preview</div>
                <div className="text-xs text-white/60">Try real analysis</div>
              </div>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={handleTryRealAnalysis}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all hover:scale-105 mx-auto touch-target"
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                Get Full Analysis with All 12 Metrics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Features with CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass p-6 text-center">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-white mb-2">AI Insights</h4>
          <p className="text-white/70 text-sm mb-4">
            Smart recommendations powered by Google Gemini
          </p>
          <div className="text-xs text-white/50">Demo: Limited preview</div>
        </div>
        
        <div className="card-glass p-6 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-3 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-white mb-2">Community Health</h4>
          <p className="text-white/70 text-sm mb-4">
            Detailed contributor analysis and collaboration metrics
          </p>
          <div className="text-xs text-white/50">Demo: Limited preview</div>
        </div>
        
        <div className="card-glass p-6 text-center">
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-3 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-white mb-2">Security Analysis</h4>
          <p className="text-white/70 text-sm mb-4">
            Comprehensive vulnerability scanning and dependency analysis
          </p>
          <div className="text-xs text-white/50">Demo: Limited preview</div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="card-glass p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Ready to Analyze Your Repository?
        </h3>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Get comprehensive insights across all 12 metrics, AI-powered recommendations, 
          detailed breakdowns, and personalized suggestions for improvement.
        </p>
        <div className="flex-responsive-sm">
          <button
            onClick={handleTryRealAnalysis}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg touch-target"
          >
            <Zap className="w-5 h-5 flex-shrink-0" />
            Start Real Analysis
          </button>
          <button
            onClick={onExitDemo}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors touch-target"
          >
            Exit Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoMode; 