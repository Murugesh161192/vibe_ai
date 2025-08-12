import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Play, Sparkles, BarChart3, Users, Code, Shield, Info, ArrowRight, ExternalLink, Zap, X, Star } from 'lucide-react';
import { startAnalysisAndNavigate } from '../store/slices/analysisSlice';

const DemoMode = ({ onExitDemo }) => {
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showLimitedDemo, setShowLimitedDemo] = useState(true);
  const dispatch = useDispatch();

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
    dispatch(startAnalysisAndNavigate(repo.url));
  };

  return (
    <div className="space-y-8" data-testid="demo-mode">
      {/* Demo Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Play className="w-6 h-6 text-purple-400 flex-shrink-0" />
          <h2 className="text-2xl font-bold text-white">Demo Mode</h2>
        </div>
        <p className="text-white/80 mb-4 max-w-lg mx-auto">
          Preview sample repository analyses to understand Vibe's capabilities
        </p>
        {/* Single banner for limited preview messaging */}
        <div className="flex items-start justify-center gap-2 text-sm text-white/80 mb-6 px-4 max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-lg py-3" role="status" aria-live="polite">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-center leading-relaxed">All features shown below are part of the limited demo preview. For full insights and metrics, try the real analysis.</span>
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
            </div>
            <p className="text-white/80 text-sm mb-4">
              {repo.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span className="text-white/70">{repo.language}</span>
              </div>
              <div className="flex items-center gap-1 text-white/60">
                <Star className="w-4 h-4" />
                <span>{repo.stars.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                handleAnalyzeRepo(repo);
                }}
                className="btn-primary w-full"
              >
                <ExternalLink className="w-4 h-4" />
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
              className="btn-icon"
              aria-label="Close metrics preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <p className="text-white/70 text-sm">
              This shows just 4 sample metrics. Real analysis includes all 12 metrics plus AI insights, detailed breakdowns, and personalized recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-1" data-testid="demo-score">
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
        </div>
      )}

      {/* Demo Features (no repeated demo labels) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass p-6 text-center">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-white mb-2">AI Insights</h4>
          <p className="text-white/70 text-sm mb-0">
            Smart recommendations powered by Google Gemini
          </p>
        </div>
        <div className="card-glass p-6 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-3 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-white mb-2">Community Health</h4>
          <p className="text-white/70 text-sm mb-0">
            Detailed contributor analysis and collaboration metrics
          </p>
        </div>
        <div className="card-glass p-6 text-center">
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-3 flex-shrink-0" />
          <h4 className="text-lg font-semibold text-white mb-2">Security Analysis</h4>
          <p className="text-white/70 text-sm mb-0">
            Comprehensive vulnerability scanning and dependency analysis
          </p>
        </div>
      </div>

      {/* Final CTA Section removed; consolidated into sticky footer */}

      {/* Sticky Footer CTA (single source of actions) */}
      <div className="fixed inset-x-4 bottom-4 z-30 safe-bottom">
        <div className="card-glass p-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 backdrop-blur max-w-4xl mx-auto">
          <div className="text-white/80 text-sm hidden sm:block">Ready to get full insights?</div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onExitDemo}
              className="btn-secondary"
            >
              Exit Demo
            </button>
            <button
              onClick={() => {
                // The demo CTA should nudge users to real analysis via the parent flow
                onExitDemo();
              }}
              className="btn-primary"
            >
              Try Real Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode; 