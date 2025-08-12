import React, { useState, useEffect } from 'react';
import { Users, GitPullRequest, GitCommit, Code, Star, TrendingUp, Calendar, Award, MessageSquare, Clock, Activity, CheckCircle, AlertCircle, Zap, Shield } from 'lucide-react';

const ActiveContributors = ({ repoUrl, repoInfo, analysis, contributorInsights }) => {
  const [loading, setLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('📊 ActiveContributors props:', {
      hasContributorInsights: !!contributorInsights,
      contributorsCount: contributorInsights?.contributors?.length || 0,
      repoInfo,
      analysis
    });
    
    // Log contributor data structure for debugging avatars
    const contributors = contributorInsights?.contributors || analysis?.contributors || [];
    if (contributors.length > 0) {
      console.log('👥 Contributors data:', contributors.slice(0, 3).map(c => ({
        login: c.login,
        hasAvatar: !!c.avatar_url,
        avatarUrl: c.avatar_url,
        htmlUrl: c.html_url
      })));
    }
    
    // Log data source for metrics with better context
    if (contributorInsights?.codeReviewMetrics) {
      console.log('🤖 Using AI-generated code review metrics:', contributorInsights.codeReviewMetrics);
    } else {
      console.log('📈 Using fallback repository analysis data');
      console.log('⚠️ AI insights not available - this may be due to:');
      console.log('   • Missing GEMINI_API_KEY configuration');
      console.log('   • AI service timeout or error');
      console.log('   • Falling back to calculated metrics based on repository data');
    }
  }, [contributorInsights, repoInfo, analysis]);

  // Use AI-generated contributor insights if available, otherwise fall back to analysis.contributors
  const contributors = contributorInsights?.contributors || analysis?.contributors || [];
  const codeReviewMetrics = contributorInsights?.codeReviewMetrics || {
    prMergeRate: analysis?.prMergeRate || 'N/A',
    issueResponseTime: analysis?.issueResolutionTime || 'N/A',
    commitFrequency: analysis?.commitFrequency || 0,
    activeBranches: analysis?.activeBranches || 0,
    codeQuality: analysis?.vibeScore?.breakdown?.codeQuality || analysis?.codeQuality || 0,
    testCoverage: analysis?.testCoverage || 'Unknown'
  };
  const reviewRecommendations = contributorInsights?.reviewRecommendations || [];
  const collaborationPattern = contributorInsights?.collaborationPattern ||
    (contributors.length === 0 ? 'Solo developer' :
      contributors.length === 1 ? 'Solo developer' :
        contributors.length < 5 ? 'Small focused team' :
          'Growing contributor base');
  const teamDynamics = contributorInsights?.teamDynamics || '';

  // Get top 5 contributors for display
  const topContributors = contributors.slice(0, 5);

  // Enhanced impact indicator with better UX
  const getImpactDisplay = (impact) => {
    switch (impact) {
      case 'High':
        return {
          label: 'High Impact',
          shortLabel: 'High',
          icon: '🚀',
          className: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30'
        };
      case 'Medium':
        return {
          label: 'Medium Impact',
          shortLabel: 'Medium',
          icon: '⭐',
          className: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30'
        };
      default:
        return {
          label: 'Contributing',
          shortLabel: 'Active',
          icon: '👤',
          className: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30'
        };
    }
  };

  // Enhanced contributor card component with improved layout
  const ContributorCard = ({ contributor, index }) => {
    const impactInfo = getImpactDisplay(contributor.impact);
    const isTopContributor = index === 0;

    return (
      <div className="group relative p-5 sm:p-6 lg:p-7 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.01]">
        {/* Top contributor crown - Enhanced positioning */}
        {isTopContributor && (
          <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg z-10">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
        )}

        <div className="flex items-start gap-4 sm:gap-5">
          {/* Enhanced avatar section */}
          <div className="relative flex-shrink-0">
            {contributor.avatar_url ? (
              <img
                src={contributor.avatar_url}
                alt={contributor.login}
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-xl border-2 border-white/20 shadow-lg object-cover"
                onError={(e) => {
                  // Fallback: hide broken image and show initials instead
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.nextElementSibling;
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            {/* Fallback avatar with initials - always render but hide when image loads */}
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-lg"
              style={{ display: contributor.avatar_url ? 'none' : 'flex' }}
            >
              <span className="text-white font-bold text-base sm:text-lg lg:text-xl">
                {contributor.login?.[0]?.toUpperCase() || '?'}
              </span>
            </div>

            {/* Impact indicator moved to avatar overlay */}
            {contributor.impact && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="text-xs sm:text-sm">{impactInfo.icon}</span>
              </div>
            )}
          </div>

          {/* Enhanced contributor information */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Name section with improved alignment */}
            <div className="space-y-2">
              <div className="flex items-center">
                {contributor.html_url ? (
                  <a
                    href={contributor.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-bold text-base sm:text-lg hover:text-blue-400 transition-colors truncate group-hover:text-blue-300"
                  >
                    {contributor.login}
                  </a>
                ) : (
                  <span className="text-white font-bold text-base sm:text-lg truncate">
                    {contributor.login}
                  </span>
                )}
              </div>

              {/* Role badge positioned directly below name */}
              {contributor.role && (
                <div className="flex items-start">
                  <span className="inline-flex items-center text-xs sm:text-sm px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 font-medium">
                    {contributor.role}
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced contribution statistics */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-medium">{contributor.contributions || 0}</span>
                <span className="text-white/50">commits</span>
              </div>
              {contributor.percentage && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="font-medium">{contributor.percentage}%</span>
                  <span className="text-white/50">contribution</span>
                </div>
              )}
              {contributor.expertise && (
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="font-medium truncate max-w-32 sm:max-w-none">{contributor.expertise}</span>
                </div>
              )}
            </div>

            {/* Enhanced impact and progress section */}
            <div className="space-y-3">
              {/* Impact badge with better positioning */}
              {contributor.impact && (
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${impactInfo.className}`}>
                    <span className="text-base">{impactInfo.icon}</span>
                    <span>{impactInfo.label}</span>
                  </div>
                </div>
              )}

              {/* Enhanced contribution progress bar */}
              {contributor.percentage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 font-medium">Contribution Level</span>
                    <span className="text-white font-semibold">{contributor.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(contributor.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced metric card with improved responsive design
  const MetricCard = ({ icon: Icon, label, value, description, color = 'blue' }) => {
    const colorSchemes = {
      blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
      green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
      purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
      yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-400',
      red: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400'
    };

    return (
      <div className={`p-4 sm:p-5 lg:p-6 rounded-xl bg-gradient-to-br ${colorSchemes[color]} border backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 min-h-[110px] sm:min-h-[120px] lg:min-h-[130px] flex flex-col`}>
        {/* Header section */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-white/10 flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm sm:text-base font-semibold text-white leading-tight">{label}</h5>
            <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Value section - Aligned to bottom */}
        <div className="mt-auto">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-none">
            {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '0')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Active Contributors Section with properly aligned header */}
      <div className="relative">
        {/* Standardized section header with consistent alignment */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-shrink-0 mt-1">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Active Contributors
            </h3>
          </div>
        </div>

        {/* Enhanced contributors content */}
        {contributors.length === 0 ? (
          <div className="text-center py-12 sm:py-16 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4 sm:mb-6">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">No contributor data available</h4>
            <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
              Contributor insights will appear when data becomes available from the repository analysis
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {topContributors.map((contributor, index) => (
              <ContributorCard key={contributor.login || index} contributor={contributor} index={index} />
            ))}

            {/* Enhanced more contributors indicator */}
            {contributors.length > 5 && (
              <div className="text-center pt-4 sm:pt-6">
                <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  <span className="text-sm sm:text-base text-white/70 font-medium">
                    +{contributors.length - 5} more contributors
                  </span>
                </div>
              </div>
            )}

            {/* Enhanced team dynamics insight */}
            {teamDynamics && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-white text-left">Team Dynamics Insight</h4>
                    <p className="text-sm sm:text-base text-white/80 italic leading-relaxed text-left">{teamDynamics}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Review Insights Section with properly aligned header */}
      <div className="relative">
        {/* Standardized section header matching Active Contributors exactly */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6">
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 flex-shrink-0 mt-1">
            <Code className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Code Review Insights
              </h3>
              {/* Data source indicator - positioned consistently */}
              {contributorInsights?.codeReviewMetrics ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-xs font-medium text-purple-300">AI</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  <span className="text-xs font-medium text-blue-300">Data</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced responsive grid for metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <MetricCard
            icon={GitPullRequest}
            label="PR Merge Rate"
            value={codeReviewMetrics.prMergeRate}
            description="Pull request acceptance rate"
            color="blue"
          />
          <MetricCard
            icon={Clock}
            label="Response Time"
            value={codeReviewMetrics.issueResponseTime}
            description="Average issue response time"
            color="yellow"
          />
          <MetricCard
            icon={Activity}
            label="Commit Frequency"
            value={`${codeReviewMetrics.commitFrequency}/week`}
            description="Weekly commit activity"
            color="purple"
          />
          <MetricCard
            icon={CheckCircle}
            label="Code Quality"
            value={`${codeReviewMetrics.codeQuality}/100`}
            description="Overall code quality score"
            color="green"
          />
          <MetricCard
            icon={Shield}
            label="Test Coverage"
            value={codeReviewMetrics.testCoverage}
            description="Test coverage percentage"
            color="green"
          />
        </div>

        {/* Enhanced Review Recommendations with consistent alignment */}
        {reviewRecommendations.length > 0 && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-2.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Review Recommendations</h4>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {reviewRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10">
                  {rec.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  ) : rec.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm sm:text-base text-white/80 leading-relaxed">{rec.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveContributors;