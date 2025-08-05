import React, { useState, useEffect } from 'react';
import { Sparkles, FileCode, Users, TrendingUp, AlertCircle, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import { generateInsights } from '../services/api';

const RepositoryInsights = ({ repoUrl, repoName, autoGenerate = false, preloadedInsights = null, preloadedError = null, hideTitle = false }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(preloadedInsights);
  const [error, setError] = useState(preloadedError);
  const [hasGenerated, setHasGenerated] = useState(!!preloadedInsights || !!preloadedError);

  useEffect(() => {
    // Update state if preloaded data changes
    if (preloadedInsights) {
      setInsights(preloadedInsights);
      setHasGenerated(true);
    }
    if (preloadedError) {
      setError(preloadedError);
    }
  }, [preloadedInsights, preloadedError]);

  useEffect(() => {
    if (autoGenerate && !hasGenerated && !preloadedInsights) {
      handleGenerateInsights();
    }
  }, [autoGenerate]);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    setHasGenerated(true);
    
    try {
      const result = await generateInsights(repoUrl);
      setInsights(result.data);
    } catch (err) {
      setError(err.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (!autoGenerate && !hasGenerated) {
    return (
      <button
        onClick={handleGenerateInsights}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Generate AI Insights</span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      {!autoGenerate && !hideTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI-Powered Repository Insights
          </h3>
          <button
            onClick={handleGenerateInsights}
            className="text-white/60 hover:text-white transition-colors"
            title="Regenerate insights"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin mb-3" />
          <p className="text-white/70 text-sm">Generating AI-powered insights...</p>
          <p className="text-white/50 text-xs mt-1">This may take a few seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-300 text-sm">
            {error.includes('API key') ? 
              '🔑 Gemini API key not configured. See setup instructions in the documentation.' : 
              error}
          </p>
          {!error.includes('API key') && (
            <button
              onClick={handleGenerateInsights}
              className="mt-3 text-sm text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6">
          <div className="text-sm text-purple-400 font-medium">
            ✨ Enhanced with Gemini AI
          </div>
          {/* Hotspot Files */}
          {insights.insights?.hotspotFiles?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-orange-400" />
                Code Hotspots
              </h4>
              <div className="space-y-2">
                {insights.insights.hotspotFiles.map((hotspot, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="font-medium text-white mb-1">{hotspot.file}</div>
                    <p className="text-white/70 text-sm mb-2">{hotspot.reason}</p>
                    <p className="text-blue-400 text-sm">
                      💡 {hotspot.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributor Insights */}
          {insights.insights?.contributorInsights && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Team Insights
              </h4>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                {insights.insights.contributorInsights.mostActive?.length > 0 && (
                  <div className="mb-3">
                    <span className="text-white/70 text-sm">Most Active: </span>
                    <span className="text-white font-medium">
                      {insights.insights.contributorInsights.mostActive.join(', ')}
                    </span>
                  </div>
                )}
                <p className="text-white/70 mb-2">
                  {insights.insights.contributorInsights.collaborationPattern}
                </p>
                <p className="text-green-400 text-sm">
                  ✨ {insights.insights.contributorInsights.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Code Quality */}
          {insights.insights?.codeQuality && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Code Quality Assessment
              </h4>
              <div className="grid-responsive-md">
                {insights.insights.codeQuality.strengths?.length > 0 && (
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <div className="font-medium text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </div>
                    <ul className="space-y-1">
                      {insights.insights.codeQuality.strengths.map((strength, index) => (
                        <li key={index} className="text-white/80 text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {insights.insights.codeQuality.concerns?.length > 0 && (
                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                    <div className="font-medium text-orange-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas of Concern
                    </div>
                    <ul className="space-y-1">
                      {insights.insights.codeQuality.concerns.map((concern, index) => (
                        <li key={index} className="text-white/80 text-sm">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.insights?.recommendations?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">
                📋 Actionable Recommendations
              </h4>
              <div className="space-y-2">
                {insights.insights.recommendations.map((rec, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-white/70 text-sm">{rec.area}</span>
                    </div>
                    <p className="text-white">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryInsights; 