import React, { useState } from 'react';
import { ArrowLeft, Star, GitBranch, Calendar, Users, HelpCircle } from 'lucide-react';
import RadarChart from './RadarChart';
import MetricBreakdown from './MetricBreakdown';
import RepositoryInfo from './RepositoryInfo';
import AnalysisInsights from './AnalysisInsights';
import MetricsModal from './MetricsModal';

const VibeScoreResults = ({ result, onAnalyzeAnother }) => {
  const { repoInfo, vibeScore, analysis } = result;
  const [isModalOpen, setIsModalOpen] = useState(false);
  



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

      {/* Repository Information */}
      <RepositoryInfo repoInfo={repoInfo} />

      {/* Enhanced Main Vibe Score Display */}
      <div className="card-glass p-4 sm:p-6 md:p-8 text-center">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-heading-lg text-xl sm:text-3xl md:text-4xl mb-3">
            Vibe Score Results
          </h2>
          <p className="text-body text-sm sm:text-lg">
            Comprehensive analysis of <span className="text-accent">{repoInfo.name}</span>
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-4 sm:mb-6">
            <div className={`text-6xl sm:text-7xl md:text-8xl font-bold ${getVibeScoreColor(vibeScore.total)} mb-4 animate-pulse`}>
              {Math.round(vibeScore.total)}
            </div>
          </div>
          
          <div className="text-heading-md text-lg sm:text-2xl md:text-3xl mb-4">
            {vibeMessage.title}
          </div>
          
          <p className="text-body text-sm sm:text-base max-w-2xl leading-relaxed">
            {vibeMessage.description}
          </p>
          
          {/* Accessibility: Screen reader summary */}
          <div className="sr-only" aria-live="polite">
            Vibe score is {Math.round(vibeScore.total)} out of 100. {vibeScore.total >= 80 ? 'Excellent vibes detected.' :
             vibeScore.total >= 60 ? 'Good vibes detected.' :
             vibeScore.total >= 40 ? 'Decent vibes detected.' : 'Room for improvement detected.'}
          </div>
        </div>
      </div>

      {/* Enhanced Radar Chart and Metrics Grid */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Interactive Radar Chart - Responsive */}
        <div className="card-glass p-4 sm:p-6 md:p-8">
          <h3 className="text-heading-md text-lg sm:text-2xl md:text-3xl mb-6 sm:mb-8 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📊</span>
            Vibe Score Breakdown
          </h3>
          <div className="w-full flex justify-center items-center">
            <div className="w-full max-w-[95vw] aspect-square max-h-[500px] min-h-[300px]">
              <RadarChart data={vibeScore.breakdown} />
            </div>
          </div>
          <p className="text-body-sm text-xs sm:text-sm mt-4 sm:mt-6 text-center">
            💡 Hover over the chart to see detailed metrics
          </p>
        </div>

        {/* Detailed Metrics - Now Below Radar Chart */}
        <div className="card-glass p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <h3 className="text-heading-md text-lg sm:text-2xl md:text-3xl flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">📋</span>
              Detailed Metrics
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
              aria-label="Learn more about vibe score metrics"
            >
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">What do these metrics mean?</span>
            </button>
          </div>
          <div className="flex flex-col justify-start">
            <MetricBreakdown 
              breakdown={vibeScore.breakdown} 
              weights={vibeScore.weights}
            />
          </div>
        </div>
      </div>

      {/* Analysis Insights */}
      <AnalysisInsights analysis={analysis} />

      {/* Enhanced Repository Statistics */}
      <div className="card-glass p-4 sm:p-6 lg:p-8">
        <h3 className="text-heading-md mb-4 sm:mb-6 flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">📈</span>
          Repository Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-full">
          <div className="card-content p-3 sm:p-4 lg:p-6 text-center">
            <div className="icon-container icon-container-warning mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">{repoInfo.stars.toLocaleString()}</div>
            <div className="text-body-sm">Stars</div>
          </div>
          <div className="card-content p-3 sm:p-4 lg:p-6 text-center">
            <div className="icon-container icon-container-info mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12">
              <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">{repoInfo.forks.toLocaleString()}</div>
            <div className="text-body-sm">Forks</div>
          </div>
          <div className="card-content p-3 sm:p-4 lg:p-6 text-center">
            <div className="icon-container icon-container-primary mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
              {new Date(repoInfo.createdAt).getFullYear()}
            </div>
            <div className="text-body-sm">Created</div>
          </div>
          <div className="card-content p-3 sm:p-4 lg:p-6 text-center">
            <div className="icon-container icon-container-success mx-auto mb-2 sm:mb-3 w-10 h-10 sm:w-12 sm:h-12">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
              {(repoInfo.contributors || 0).toLocaleString()}
            </div>
            <div className="text-body-sm">Contributors</div>
          </div>
        </div>
      </div>

      <MetricsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default VibeScoreResults; 