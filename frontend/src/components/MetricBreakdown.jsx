import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const MetricBreakdown = ({ breakdown, weights }) => {
  // Debug logging to check if weights are being passed
  console.log('MetricBreakdown received weights:', weights);
  console.log('MetricBreakdown received breakdown:', breakdown);
  // Fallback weights in case they're not provided
  const fallbackWeights = {
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
  };

  // Use provided weights or fallback
  const actualWeights = weights || fallbackWeights;

  const metrics = [
    {
      key: 'codeQuality',
      label: 'Code Quality',
      description: 'Test coverage, code complexity, and best practices',
      icon: '🧪',
      weight: actualWeights.codeQuality
    },
    {
      key: 'readability',
      label: 'Readability',
      description: 'Documentation quality and comment density',
      icon: '📚',
      weight: actualWeights.readability
    },
    {
      key: 'collaboration',
      label: 'Collaboration',
      description: 'Commit frequency and contributor diversity',
      icon: '👥',
      weight: actualWeights.collaboration
    },
    {
      key: 'innovation',
      label: 'Innovation',
      description: 'Modern frameworks and technology choices',
      icon: '🚀',
      weight: actualWeights.innovation
    },
    {
      key: 'maintainability',
      label: 'Maintainability',
      description: 'Folder structure and dependency management',
      icon: '🔧',
      weight: actualWeights.maintainability
    },
    {
      key: 'inclusivity',
      label: 'Inclusivity',
      description: 'Multilingual docs and accessibility',
      icon: '🌍',
      weight: actualWeights.inclusivity
    },
    {
      key: 'security',
      label: 'Security & Safety',
      description: 'Security practices, vulnerability scanning, and compliance',
      icon: '🔒',
      weight: actualWeights.security
    },
    {
      key: 'performance',
      label: 'Performance & Scalability',
      description: 'Performance monitoring, optimization, and scaling',
      icon: '⚡',
      weight: actualWeights.performance
    },
    {
      key: 'testingQuality',
      label: 'Testing Quality',
      description: 'Test coverage, CI/CD, and quality assurance',
      icon: '✅',
      weight: actualWeights.testingQuality
    },
    {
      key: 'communityHealth',
      label: 'Community Health',
      description: 'Issue response, PR quality, and guidelines',
      icon: '🤝',
      weight: actualWeights.communityHealth
    },
    {
      key: 'codeHealth',
      label: 'Code Health',
      description: 'Technical debt, code smells, and refactoring',
      icon: '💚',
      weight: actualWeights.codeHealth
    },
    {
      key: 'releaseManagement',
      label: 'Release Management',
      description: 'Release frequency, versioning, and changelog',
      icon: '📦',
      weight: actualWeights.releaseManagement
    }
  ];

  /**
   * Get score color class based on value
   * @param {number} score - Metric score
   * @returns {string} CSS class for color
   */
  const getScoreColor = (score) => {
    if (score >= 80) return 'vibe-score-excellent';
    if (score >= 60) return 'vibe-score-good';
    if (score >= 40) return 'vibe-score-neutral';
    return 'vibe-score-poor';
  };

  /**
   * Get progress bar style based on score
   * @param {number} score - Metric score
   * @returns {string} CSS class for progress bar
   */
  const getProgressBarStyle = (score) => {
    if (score >= 80) return 'progress-bar-excellent';
    if (score >= 60) return 'progress-bar-good';
    if (score >= 40) return 'progress-bar-neutral';
    return 'progress-bar-poor';
  };

  /**
   * Get status badge style based on score
   * @param {number} score - Metric score
   * @returns {string} CSS class for badge
   */
  const getStatusBadgeStyle = (score) => {
    if (score >= 80) return 'status-badge-excellent';
    if (score >= 60) return 'status-badge-good';
    if (score >= 40) return 'status-badge-neutral';
    return 'status-badge-poor';
  };

  /**
   * Get score status icon and text
   * @param {number} score - Metric score
   * @returns {Object} Icon component and status text
   */
  const getScoreStatus = (score) => {
    if (score >= 80) {
      return { icon: CheckCircle, text: 'Excellent', color: 'text-green-300' };
    } else if (score >= 60) {
      return { icon: CheckCircle, text: 'Good', color: 'text-yellow-300' };
    } else if (score >= 40) {
      return { icon: Info, text: 'Fair', color: 'text-blue-300' };
    } else {
      return { icon: AlertCircle, text: 'Needs Improvement', color: 'text-red-300' };
    }
  };

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const score = breakdown[metric.key];
        const status = getScoreStatus(score);
        const StatusIcon = status.icon;

        return (
          <div
            key={metric.key}
            className="card-content p-4 md:p-6 metric-hover"
            aria-label={`${metric.label}: ${score} out of 100`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <span className="text-xl sm:text-2xl flex-shrink-0" role="img" aria-label={metric.label}>
                  {metric.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-heading-sm text-sm sm:text-xl">{metric.label}</h4>
                  <p className="text-body-sm text-xs sm:text-sm">{metric.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3 flex-shrink-0">
                <div className="status-badge status-badge-weight text-xs">
                  {metric.weight}%
                </div>
                <div className="text-right">
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getScoreColor(score)}`}>
                    {Math.round(score)}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>0</span>
                <span>100</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getProgressBarStyle(score)}`}
                  style={{ width: `${Math.round(score)}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(score)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${metric.label} score: ${Math.round(score)}%`}
                />
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${status.color}`} aria-hidden="true" />
                <span className={`text-xs sm:text-sm font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>
              <div className={`status-badge ${getStatusBadgeStyle(score)} text-xs`}>
                {score >= 80 && 'Outstanding'}
                {score >= 60 && score < 80 && 'Good'}
                {score >= 40 && score < 60 && 'Average'}
                {score < 40 && 'Needs Work'}
              </div>
            </div>

            {/* Score interpretation */}
            <div className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed">
              {score >= 80 && 'Outstanding performance in this area! 🎉'}
              {score >= 60 && score < 80 && 'Good performance with room for improvement. 👍'}
              {score >= 40 && score < 60 && 'Average performance, consider improvements. 🔄'}
              {score < 40 && 'This area needs attention and improvement. 💪'}
            </div>
          </div>
        );
      })}

      {/* Score Interpretation Guide */}
      <div className="card-content p-4 md:p-6">
        <h4 className="text-heading-sm text-base sm:text-xl mb-4 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">📊</span>
          Score Interpretation Guide
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
              <span className="text-white font-medium">80-100: Excellent</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex-shrink-0"></div>
              <span className="text-white font-medium">60-79: Good</span>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex-shrink-0"></div>
              <span className="text-white font-medium">40-59: Fair</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex-shrink-0"></div>
              <span className="text-white font-medium">0-39: Poor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricBreakdown; 