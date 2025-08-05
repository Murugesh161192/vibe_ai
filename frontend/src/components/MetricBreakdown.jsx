import React, { useState, useMemo, useCallback, memo } from 'react';
import { CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

const MetricBreakdown = memo(({ breakdown, weights }) => {
  const [expandedMetrics, setExpandedMetrics] = useState({});
  const [showQuickSummary, setShowQuickSummary] = useState(true);

  // Memoize fallback weights to prevent recreation on every render
  const fallbackWeights = useMemo(() => ({
    codeQuality: 16,
    readability: 12,
    collaboration: 15,
    innovation: 8,
    maintainability: 8,
    inclusivity: 5,
    security: 12,
    performance: 8,
    testingQuality: 6,
    communityHealth: 4,
    codeHealth: 4,
    releaseManagement: 2
  }), []);

  // Memoize actual weights
  const actualWeights = useMemo(() => weights || fallbackWeights, [weights, fallbackWeights]);

  // Memoize metrics array to prevent recreation on every render
  const metrics = useMemo(() => [
    {
      key: 'codeQuality',
      label: 'Code Quality',
      description: 'Test coverage, code complexity, and best practices',
      detailedDescription: 'Evaluates testing frameworks, code structure, linting rules, and adherence to coding standards. Higher scores indicate comprehensive testing and clean code practices.',
      icon: '🧪',
      weight: actualWeights.codeQuality,
      category: 'Core'
    },
    {
      key: 'readability',
      label: 'Readability',
      description: 'Documentation quality and comment density',
      detailedDescription: 'Assesses README completeness, inline comments, API documentation, and overall project documentation. Critical for maintainability and team collaboration.',
      icon: '📚',
      weight: actualWeights.readability,
      category: 'Core'
    },
    {
      key: 'collaboration',
      label: 'Collaboration',
      description: 'Commit frequency and contributor diversity',
      detailedDescription: 'Measures team engagement, commit patterns, contributor diversity, and collaborative development practices. Indicates healthy team dynamics.',
      icon: '👥',
      weight: actualWeights.collaboration,
      category: 'Core'
    },
    {
      key: 'security',
      label: 'Security & Safety',
      description: 'Security practices, vulnerability scanning, and compliance',
      detailedDescription: 'Evaluates security configurations, dependency vulnerabilities, access controls, and security best practices implementation.',
      icon: '🔒',
      weight: actualWeights.security,
      category: 'Core'
    },
    {
      key: 'innovation',
      label: 'Innovation',
      description: 'Modern frameworks and technology choices',
      detailedDescription: 'Assesses use of modern technologies, frameworks, and innovative approaches. Indicates forward-thinking development practices.',
      icon: '🚀',
      weight: actualWeights.innovation,
      category: 'Enhancement'
    },
    {
      key: 'maintainability',
      label: 'Maintainability',
      description: 'Folder structure and dependency management',
      detailedDescription: 'Evaluates code organization, dependency management, and long-term maintainability practices.',
      icon: '🔧',
      weight: actualWeights.maintainability,
      category: 'Enhancement'
    },
    {
      key: 'inclusivity',
      label: 'Inclusivity',
      description: 'Accessibility and inclusive design practices',
      detailedDescription: 'Assesses accessibility features, inclusive design patterns, and consideration for diverse user needs.',
      icon: '♿',
      weight: actualWeights.inclusivity,
      category: 'Enhancement'
    },
    {
      key: 'performance',
      label: 'Performance',
      description: 'Runtime efficiency and optimization',
      detailedDescription: 'Evaluates code efficiency, performance optimizations, and runtime characteristics.',
      icon: '⚡',
      weight: actualWeights.performance,
      category: 'Quality'
    },
    {
      key: 'testingQuality',
      label: 'Testing Quality',
      description: 'Test comprehensiveness and quality',
      detailedDescription: 'Measures test coverage, test quality, and testing strategy effectiveness.',
      icon: '✅',
      weight: actualWeights.testingQuality,
      category: 'Quality'
    },
    {
      key: 'communityHealth',
      label: 'Community Health',
      description: 'Community engagement and project activity',
      detailedDescription: 'Assesses community engagement, issue response times, and overall project health.',
      icon: '🌟',
      weight: actualWeights.communityHealth,
      category: 'Quality'
    },
    {
      key: 'codeHealth',
      label: 'Code Health',
      description: 'Overall code quality and technical debt',
      detailedDescription: 'Evaluates technical debt, code complexity, and overall codebase health.',
      icon: '❤️',
      weight: actualWeights.codeHealth,
      category: 'Quality'
    },
    {
      key: 'releaseManagement',
      label: 'Release Management',
      description: 'Version control and release practices',
      detailedDescription: 'Assesses release frequency, version management, and deployment practices.',
      icon: '📦',
      weight: actualWeights.releaseManagement,
      category: 'Quality'
    }
  ], [actualWeights]);

  // Memoize functions to prevent unnecessary re-renders
  const toggleMetric = useCallback((metricKey) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }));
  }, []);

  const toggleQuickSummary = useCallback(() => {
    setShowQuickSummary(prev => !prev);
  }, []);

  // Memoize computed values
  const { getScoreClass, getTrendIcon, getMetricsSummary } = useMemo(() => ({
    getScoreClass: (score) => {
      if (score >= 80) return 'vibe-score-excellent';
      if (score >= 60) return 'vibe-score-good';
      if (score >= 40) return 'vibe-score-neutral';
      return 'vibe-score-poor';
    },

    getTrendIcon: (score) => {
      if (score >= 75) return <TrendingUp className="w-4 h-4 text-green-400" />;
      if (score >= 50) return <Minus className="w-4 h-4 text-yellow-400" />;
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    },

    getMetricsSummary: () => {
      const totalMetrics = metrics.length;
      const excellentCount = metrics.filter(m => (breakdown[m.key] || 0) >= 80).length;
      const goodCount = metrics.filter(m => {
        const score = breakdown[m.key] || 0;
        return score >= 60 && score < 80;
      }).length;
      const needsAttentionCount = totalMetrics - excellentCount - goodCount;

      return {
        total: totalMetrics,
        excellent: excellentCount,
        good: goodCount,
        needsAttention: needsAttentionCount
      };
    }
  }), [breakdown, metrics]);

  // Memoize grouped metrics
  const groupedMetrics = useMemo(() => {
    return metrics.reduce((groups, metric) => {
      const category = metric.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(metric);
      return groups;
    }, {});
  }, [metrics]);

  const summary = useMemo(() => getMetricsSummary(), [getMetricsSummary]);

  if (!breakdown || Object.keys(breakdown).length === 0) {
    return (
      <div className="card-glass-sm p-6 text-center">
        <Info className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-heading-sm mb-2">No Metrics Available</h3>
        <p className="text-body-sm">Metric breakdown data is not available for this repository.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Quick Summary */}
      {showQuickSummary && (
        <div className="card-content p-4 lg:p-5 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-400/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <div className="icon-container icon-container-primary p-1.5 icon-align-center">
                <BarChart3 className="icon-sm text-white" />
              </div>
              <span>Metrics Overview</span>
            </h4>
            <button
              onClick={toggleQuickSummary}
              className="text-white/60 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              Hide
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <div className="text-xl sm:text-2xl font-bold text-green-400">{summary.excellent}</div>
              <div className="text-xs text-green-300/80">Excellent</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-500/10">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">{summary.good}</div>
              <div className="text-xs text-yellow-300/80">Good</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-500/10">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{summary.total - summary.excellent - summary.good - summary.needsAttention}</div>
              <div className="text-xs text-blue-300/80">Average</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-500/10">
              <div className="text-xl sm:text-2xl font-bold text-red-400">{summary.needsAttention}</div>
              <div className="text-xs text-red-300/80">Needs Work</div>
            </div>
          </div>
          
          <p className="text-sm text-white/70 leading-relaxed">
            {summary.excellent >= summary.total * 0.6 && "🎉 Most metrics are performing excellently! "}
            {summary.needsAttention > 0 && `💡 ${summary.needsAttention} metric${summary.needsAttention > 1 ? 's' : ''} need${summary.needsAttention === 1 ? 's' : ''} attention. `}
            Focus on the lowest-scoring areas for maximum improvement impact.
          </p>
        </div>
      )}

      {!showQuickSummary && (
        <button
          onClick={toggleQuickSummary}
          className="btn-secondary text-sm px-4 py-2"
        >
          Show Overview
        </button>
      )}

      {/* Grouped Metrics Display */}
      {Object.entries(groupedMetrics).map(([category, categoryMetrics], categoryIndex) => (
        <div key={category} className={categoryIndex > 0 ? 'mt-6' : ''}>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2 px-1">
            <span className="text-lg">
              {category === 'Core' && '⚡'}
              {category === 'Enhancement' && '🚀'}
              {category === 'Quality' && '✨'}
            </span>
            {category} Metrics
            <span className="text-sm font-normal text-white/60">({categoryMetrics.length})</span>
          </h4>
          
          <div className="grid-responsive-md">
            {categoryMetrics.map((metric) => {
              const score = breakdown[metric.key];
              const status = {
                icon: metric.icon,
                text: score >= 80 ? 'Outstanding' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work',
                color: score >= 80 ? 'text-green-300' : score >= 60 ? 'text-yellow-300' : score >= 40 ? 'text-blue-300' : 'text-red-300'
              };
              const TrendIcon = getTrendIcon(score);
              const isExpanded = expandedMetrics[metric.key];

              return (
                <div
                  key={metric.key}
                  className="card-content p-4 lg:p-5 metric-hover"
                  aria-label={`${metric.label}: ${score} out of 100`}
                >
                  {/* Main metric header */}
                  <div className="flex items-start justify-between gap-2 sm:gap-4 mb-4">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5" role="img" aria-label={metric.label}>
                        {metric.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-base sm:text-lg font-semibold text-white">{metric.label}</h4>
                          {TrendIcon}
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2">{metric.description}</p>
                      </div>
                    </div>
                    
                    {/* Score and weight badges */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-start gap-1 sm:gap-2 flex-shrink-0">
                      <div className="status-badge status-badge-weight text-xs order-2 sm:order-1">
                        {metric.weight}%
                      </div>
                      <div className={`text-2xl sm:text-3xl font-bold ${getScoreClass(score)} text-right order-1 sm:order-2`}>
                        {Math.round(score)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${getScoreClass(score)}`}
                        style={{ width: `${Math.round(score)}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(score)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`${metric.label} score: ${Math.round(score)}%`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/40 mt-1">
                      <span>0</span>
                      <span>{Math.round(score)}%</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Status indicator and expand button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${status.color}`} aria-hidden="true" />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleMetric(metric.key)}
                      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                      aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${metric.label}`}
                    >
                      <span className="text-xs">Details</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable detailed information */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                      <p className="text-sm text-white/80 leading-relaxed mb-3">
                        {metric.detailedDescription}
                      </p>
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-xs text-white/60 mb-2">Improvement Suggestions:</div>
                        <div className="text-sm text-white/70">
                          {score >= 80 && "🎉 Excellent work! Consider sharing your practices with the team."}
                          {score >= 60 && score < 80 && "👍 Good foundation. Focus on consistency and advanced practices."}
                          {score >= 40 && score < 60 && "🔄 Moderate performance. Implement best practices and monitoring."}
                          {score < 40 && "💪 Needs attention. Prioritize this area for significant impact."}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick interpretation without expansion */}
                  {!isExpanded && (
                    <div className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed">
                      {score >= 80 && 'Outstanding performance in this area! 🎉'}
                      {score >= 60 && score < 80 && 'Good performance with room for improvement. 👍'}
                      {score >= 40 && score < 60 && 'Average performance, consider improvements. 🔄'}
                      {score < 40 && 'This area needs attention and improvement. 💪'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
});

export default MetricBreakdown; 