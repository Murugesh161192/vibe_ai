import React from 'react';
import { ArrowLeft, Star, GitBranch, Calendar, Users, Bot } from 'lucide-react';
import RadarChart from './RadarChart';
import MetricBreakdown from './MetricBreakdown';
import RepositoryInfo from './RepositoryInfo';
import AnalysisInsights from './AnalysisInsights';

const VibeScoreResults = ({ result, onNewAnalysis }) => {
  const { repoInfo, vibeScore, analysis } = result;
  
  /**
   * Get vibe score color class based on score value
   * @param {number} score - Vibe score value
   * @returns {string} CSS class for color
   */
  const getVibeScoreColor = (score) => {
    if (score >= 80) return 'vibe-score-excellent';
    if (score >= 60) return 'vibe-score-good';
    if (score >= 40) return 'vibe-score-neutral';
    return 'vibe-score-poor';
  };

  /**
   * Get vibe score emoji based on score value
   * @param {number} score - Vibe score value
   * @returns {string} Emoji representation
   */
  const getVibeScoreEmoji = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    if (score >= 40) return '😐';
    return '💪';
  };

  /**
   * Get vibe score message based on score value
   * @param {number} score - Vibe score value
   * @returns {Object} Title and description
   */
  const getVibeScoreMessage = (score) => {
    if (score >= 80) {
      return {
        title: '🎉 Excellent Vibes!',
        description: 'This repository has outstanding vibes across all metrics! It demonstrates excellent code quality, documentation, and community engagement.'
      };
    } else if (score >= 60) {
      return {
        title: '👍 Good Vibes!',
        description: 'This repository shows good practices and has solid vibes. There are some areas for improvement but overall quality is commendable.'
      };
    } else if (score >= 40) {
      return {
        title: '😐 Decent Vibes',
        description: 'This repository has some good aspects but could use improvements in several areas. Focus on the metrics with lower scores.'
      };
    } else {
      return {
        title: '💪 Room for Improvement',
        description: 'This repository has potential but needs work to improve its vibes. Consider addressing the areas with the lowest scores first.'
      };
    }
  };

  const vibeMessage = getVibeScoreMessage(vibeScore.total);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">

      {/* Main Vibe Score Display - Enhanced visuals */}
      <div className="mb-6 sm:mb-8">
        <div className="card-glass p-4 sm:p-6 text-center relative overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Vibe Score Analysis
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-lg mx-auto">
              Comprehensive analysis of <span className="text-blue-400 font-semibold">{repoInfo.name}</span>
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className={`text-5xl sm:text-6xl md:text-7xl font-black ${getVibeScoreColor(vibeScore.total)} mb-2 transition-all duration-300`}>
                {Math.round(vibeScore.total)}
              </div>
              <div className="text-white/60 text-xs sm:text-sm">out of 100</div>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3">
              {vibeMessage.title}
            </div>
            <p className="text-xs sm:text-sm md:text-base text-white/70 max-w-lg mx-auto leading-relaxed px-4">
              {vibeMessage.description}
            </p>
          </div>
        </div>
      </div>

      {/* Repository Information Card - Optimized layout */}
      <RepositoryInfo repoInfo={repoInfo} />

      {/* Radar Chart - Interactive visualization */}
      {vibeScore && vibeScore.breakdown && (
        <div className="mb-6 sm:mb-8">
          <div className="card-glass p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 text-center">
              📊 Score Breakdown
            </h3>
            <RadarChart data={vibeScore.breakdown} weights={vibeScore.weights} />
          </div>
        </div>
      )}

      {/* Score Interpretation Guide - Moved here for better UX */}
      <div className="mb-6 sm:mb-8">
        <div className="card-content p-4 md:p-6">
          <h4 className="text-base sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
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

      {/* Metrics Breakdown - Detailed analysis */}
      {vibeScore && vibeScore.breakdown && (
        <div className="mb-6 sm:mb-8">
          <MetricBreakdown breakdown={vibeScore.breakdown} weights={vibeScore.weights} />
        </div>
      )}

      {/* Repository Statistics - Key numbers with enhanced visuals */}
      <div className="mb-6 sm:mb-8">
        <div className="card-glass p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center">
            📈 Repository Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Stars', value: repoInfo.stars || 0, icon: '⭐', color: 'text-yellow-400' },
              { label: 'Forks', value: repoInfo.forks || 0, icon: '🔱', color: 'text-blue-400' },
              { label: 'Issues', value: repoInfo.openIssues || 0, icon: '🐛', color: 'text-red-400' },
              { label: 'Watchers', value: repoInfo.watchers || 0, icon: '👀', color: 'text-green-400' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="card-glass-sm p-3 sm:p-4 text-center hover:bg-white/10 transition-all duration-200 cursor-default"
              >
                <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-white/60 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Insights */}
      <AnalysisInsights analysis={analysis} />
    </div>
  );
};

export default VibeScoreResults; 