import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileCode, AlertTriangle, Star, Activity, CheckCircle, XCircle, Code, Shield, Clock, GitBranch, ExternalLink, Sparkles, Lightbulb, RefreshCw, Loader, Key, ArrowRight, Zap, Brain, Target, Award } from 'lucide-react';
import { generateInsights } from '../services/api';

// Enhanced Insight Section Component
const InsightSection = ({ title, icon: Icon, children, color = 'blue', loading = false }) => {
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500/10 via-blue-600/5 to-cyan-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/10'
    },
    green: {
      gradient: 'from-green-500/10 via-emerald-600/5 to-teal-500/10',
      border: 'border-green-500/20',
      icon: 'text-green-400',
      glow: 'shadow-green-500/10'
    },
    purple: {
      gradient: 'from-purple-500/10 via-violet-600/5 to-indigo-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/10'
    },
    orange: {
      gradient: 'from-orange-500/10 via-amber-600/5 to-yellow-500/10',
      border: 'border-orange-500/20',
      icon: 'text-orange-400',
      glow: 'shadow-orange-500/10'
    }
  };
  
  const scheme = colorSchemes[color] || colorSchemes.blue;
  
  return (
    <div className={`
      group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${scheme.gradient}
      border ${scheme.border} hover:border-white/30
      backdrop-blur-xl transition-all duration-500
      hover:scale-[1.01] hover:shadow-xl ${scheme.glow}
    `}>
      {/* Background decoration */}
      <div className="absolute inset-0 rounded-2xl opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            p-2.5 rounded-xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border}
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
          `}>
            <Icon className={`w-5 h-5 ${scheme.icon}`} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              {title}
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mobile-slow-spin" />
              )}
            </h4>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Status Badge Component
const StatusBadge = ({ type, label }) => {
  const variants = {
    success: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30',
    warning: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30',
    info: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30'
  };
  
  return (
    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${variants[type] || variants.info}`}>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};

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

  if (!autoGenerate && !hasGenerated) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-white/10 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
        
        <div className="relative z-10 p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 mb-6">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
            AI-Powered Deep Analysis
          </h3>
          <p className="text-white/70 text-sm sm:text-base mb-6 max-w-md mx-auto leading-relaxed">
            Get advanced insights about your repository's architecture, performance, and team collaboration patterns.
          </p>
          
          <button
            onClick={handleGenerateInsights}
            className="btn-primary group"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Generate AI Insights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="ai-insights">
      {/* Loading State */}
      {loading && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Loader className="w-6 h-6 text-purple-400 mobile-slow-spin" />
            <div>
              <h4 className="text-base font-semibold text-white">Generating AI Insights...</h4>
              <p className="text-sm text-white/60">Analyzing repository patterns and best practices</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent"></div>
          
          <div className="relative z-10 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30">
                {error.includes('API key') ? (
                  <Key className="w-5 h-5 text-red-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-red-300 mb-2">
                  {error.includes('API key') ? 'Configuration Required' : 'Analysis Failed'}
                </h4>
                <p className="text-red-200/80 text-sm leading-relaxed mb-4">
                  {error.includes('API key') 
                    ? 'Gemini API key not configured. Please check the setup instructions in the documentation.'
                    : error
                  }
                </p>
                {!error.includes('API key') && (
                  <button
                    onClick={handleGenerateInsights}
                    className="btn-xs bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6">
          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Hotspots */}
            {insights.insights?.hotspotFiles?.length > 0 && (
              <InsightSection title="Code Hotspots" icon={Zap} color="orange">
                {insights.insights.hotspotFiles.map((hotspot, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="font-mono text-sm text-white/90 bg-gray-800/50 px-2 py-1 rounded border truncate">
                        {hotspot.file}
                      </div>
                      <Target className="w-4 h-4 text-orange-400 flex-shrink-0 group-hover:animate-pulse" />
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed mb-3">{hotspot.reason}</p>
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-300 text-sm leading-relaxed">{hotspot.recommendation}</p>
                    </div>
                  </div>
                ))}
              </InsightSection>
            )}

            {/* Team Insights */}
            {insights.insights?.contributorInsights && (
              <InsightSection title="Team Collaboration" icon={Users} color="blue">
                <div className="space-y-4">
                  {insights.insights.contributorInsights.mostActive?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h5 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        Most Active Contributors
                      </h5>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {insights.insights.contributorInsights.mostActive.map((contributor, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                            {contributor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      {insights.insights.contributorInsights.collaborationPattern}
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-green-300 text-sm leading-relaxed">
                        {insights.insights.contributorInsights.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </InsightSection>
            )}

            {/* Code Quality Analysis */}
            {insights.insights?.codeQuality && (
              <InsightSection title="Code Quality Assessment" icon={Code} color="green">
                <div className={`grid gap-4 ${
                  insights.insights.codeQuality.strengths?.length > 0 && insights.insights.codeQuality.improvements?.length > 0 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1'
                }`}>
                  {/* Strengths - Only show if there are strengths */}
                  {insights.insights.codeQuality.strengths?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h5 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h5>
                      <ul className="space-y-2">
                        {insights.insights.codeQuality.strengths.map((strength, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Improvements - Only show if there are improvements */}
                  {insights.insights.codeQuality.improvements?.length > 0 && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <h5 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Areas for Improvement
                      </h5>
                      <ul className="space-y-2">
                        {insights.insights.codeQuality.improvements.map((improvement, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Show message if no data is available */}
                  {(!insights.insights.codeQuality.strengths?.length && !insights.insights.codeQuality.improvements?.length) && (
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 mb-3">
                        <Code className="w-6 h-6 text-blue-400" />
                      </div>
                      <h5 className="text-base font-semibold text-white mb-2">Analysis in Progress</h5>
                      <p className="text-white/60 text-sm">
                        Detailed code quality insights will appear here as our AI completes the analysis.
                      </p>
                    </div>
                  )}
                </div>
              </InsightSection>
            )}

            {/* Architecture & Design */}
            {insights.insights?.architecture && (
              <InsightSection title="Architecture Analysis" icon={Shield} color="purple">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    {insights.insights.architecture.pattern}
                  </p>
                  {insights.insights.architecture.suggestions?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-purple-300 mb-2">Architectural Suggestions</h5>
                      {insights.insights.architecture.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                          <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </InsightSection>
            )}
          </div>

          {/* Summary & Next Steps */}
          {insights.insights?.summary && (
            <InsightSection title="Summary & Action Plan" icon={TrendingUp} color="blue">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/90 text-sm leading-relaxed">{insights.insights.summary}</p>
                </div>
                
                {insights.insights.nextSteps?.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h5 className="text-base font-semibold text-blue-300 mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Recommended Action Steps
                    </h5>
                    <div className="space-y-3">
                      {insights.insights.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 group">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </InsightSection>
          )}

          {/* Performance Metrics */}
          {insights.insights?.performance && (
            <InsightSection title="Performance Analysis" icon={Activity} color="green">
              <div className="space-y-4">
                {insights.insights.performance.metrics?.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    {insights.insights.performance.metrics.map((metric, index) => (
                      <div key={index} className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-cyan-400 mb-1">{metric.value}</div>
                        <div className="text-xs text-white/60">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {insights.insights.performance.recommendation && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-cyan-300 text-sm leading-relaxed">
                      {insights.insights.performance.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </InsightSection>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryInsights; 