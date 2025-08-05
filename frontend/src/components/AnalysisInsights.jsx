import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target, Zap, Users, BookOpen, Code, Globe, Star, GitBranch, Clock, Shield, Heart, FileCode } from 'lucide-react';

const AnalysisInsights = ({ analysis }) => {
  if (!analysis) {
    return null;
  }
  const { insights, testFiles, documentationFiles, dependencies, folderStructure, languages } = analysis;

  /**
   * Get insight icon based on insight type and sentiment
   * @param {string} insight - Insight text
   * @returns {Object} Icon component and color
   */
  const getInsightIcon = (insight) => {
    const lowerInsight = insight.toLowerCase();

    // Positive achievements and excellent patterns
    if (lowerInsight.includes('excellent') || lowerInsight.includes('outstanding') ||
      lowerInsight.includes('🎉') || lowerInsight.includes('great job') ||
      lowerInsight.includes('well done') || lowerInsight.includes('impressive')) {
      return { icon: CheckCircle, color: 'text-green-300', bgColor: 'status-badge-excellent' };
    }

    // Good/positive patterns
    if (lowerInsight.includes('good') || lowerInsight.includes('great use') ||
      lowerInsight.includes('👍') || lowerInsight.includes('nice') ||
      lowerInsight.includes('solid') || lowerInsight.includes('strong') ||
      lowerInsight.includes('modern frameworks') || lowerInsight.includes('good practices') ||
      lowerInsight.includes('well') || lowerInsight.includes('effective')) {
      return { icon: TrendingUp, color: 'text-blue-300', bgColor: 'status-badge-neutral' };
    }

    // Suggestions and potential improvements (not warnings)
    if (lowerInsight.includes('consider') || lowerInsight.includes('could') ||
      lowerInsight.includes('might') || lowerInsight.includes('suggest') ||
      lowerInsight.includes('💪') || lowerInsight.includes('potential') ||
      lowerInsight.includes('opportunity') || lowerInsight.includes('recommendation') ||
      lowerInsight.includes('try') || lowerInsight.includes('adding')) {
      return { icon: Lightbulb, color: 'text-yellow-300', bgColor: 'status-badge-good' };
    }

    // Issues, problems, and actual warnings
    if (lowerInsight.includes('issue') || lowerInsight.includes('problem') ||
      lowerInsight.includes('missing') || lowerInsight.includes('lacking') ||
      lowerInsight.includes('warning') || lowerInsight.includes('error') ||
      lowerInsight.includes('fix') || lowerInsight.includes('needs attention') ||
      lowerInsight.includes('critical') || lowerInsight.includes('urgent')) {
      return { icon: AlertTriangle, color: 'text-red-300', bgColor: 'status-badge-poor' };
    }

    // Default to informational for neutral insights
    return { icon: Lightbulb, color: 'text-indigo-300', bgColor: 'status-badge-weight' };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <div>
          <h4 className="text-base sm:text-lg font-medium mb-4 flex items-center gap-3">
            <span className="text-xl sm:text-2xl">📊</span>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent font-bold">
              Basic Analysis Results
            </span>
          </h4>

          <div className="space-y-3">
            {insights.map((insight, index) => {
              const iconData = getInsightIcon(insight);
              const IconComponent = iconData.icon;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-lg ${iconData.bgColor} backdrop-blur-md transition-all hover:bg-white/10`}
                >
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${iconData.color} flex-shrink-0 mt-0.5`} />
                  <span className="text-white text-sm sm:text-base leading-relaxed">{insight}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Repository Analysis Details - Updated to 2 columns */}
              <div className="grid-responsive-md">
        {/* Test Coverage */}
        <div className="card-glass p-5 sm:p-6 md:p-7">
          <div className="text-center mb-6">
            <div className="icon-container icon-container-success p-3 sm:p-4 mx-auto mb-4">
              <Code className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-green-200 to-emerald-200 bg-clip-text text-transparent">
              Test Coverage
            </h4>
            <p className="text-white/60 text-sm">Automated testing files detected</p>
          </div>

          {testFiles && testFiles.length > 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-green-400 mb-4">
                {testFiles.length}
              </div>
              <div className="text-white/80 text-lg font-medium mb-4">Test Files</div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto custom-scrollbar">
                  {testFiles.slice(0, 5).map((file, index) => (
                    <span
                      key={index}
                      className="status-badge status-badge-excellent text-xs"
                      title={file}
                    >
                      🧪 {file.length > 15 ? file.substring(0, 15) + '...' : file}
                    </span>
                  ))}
                  {testFiles.length > 5 && (
                    <span className="status-badge status-badge-good text-xs">
                      +{testFiles.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-400 mb-4">
                0
              </div>
              <div className="text-white/60">No test files detected</div>
              <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
                <p className="text-white/70 text-sm">
                  💡 Consider adding automated tests to improve code quality and reliability
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dependencies - Simplified and focused */}
        <div className="card-glass p-5 sm:p-6 md:p-7">
          <div className="text-center mb-6">
            <div className="icon-container icon-container-warning p-3 sm:p-4 mx-auto mb-4">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Dependencies
            </h4>
            <p className="text-white/60 text-sm">External packages and libraries</p>
          </div>

          {dependencies && dependencies.length > 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-4">
                {dependencies.length}
              </div>
              <div className="text-white/80 text-lg font-medium mb-4">Packages</div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto custom-scrollbar">
                  {dependencies.slice(0, 6).map((dep, index) => (
                    <span
                      key={index}
                      className="status-badge status-badge-weight text-xs"
                      title={dep}
                    >
                      📦 {dep}
                    </span>
                  ))}
                  {dependencies.length > 6 && (
                    <span className="status-badge status-badge-good text-xs">
                      +{dependencies.length - 6}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-400 mb-4">
                0
              </div>
              <div className="text-white/60">No dependencies detected</div>
              <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
                <p className="text-white/70 text-sm">
                  📦 This could be a standalone project or dependency detection failed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Recommendations */}
      <div className="card-glass p-6 sm:p-8 md:p-10">
        <h3 className="text-heading-md text-lg sm:text-2xl md:text-3xl mb-6 sm:mb-8 flex items-center gap-3">
          <div className="icon-container icon-container-primary p-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold">
            Smart Recommendations
          </span>
        </h3>

        <div className="grid-responsive-lg">
          {/* Improvement Recommendations */}
          <div className="card-content p-6 sm:p-8">
            <h4 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="icon-container icon-container-success p-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-green-200 to-emerald-200 bg-clip-text text-transparent">
                Improve Your Vibe Score
              </span>
            </h4>

            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="icon-container icon-container-success p-2 flex-shrink-0">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-base sm:text-lg mb-2">Add Comprehensive Test Coverage</div>
                  <div className="text-white/70 text-sm sm:text-base leading-relaxed">Implement unit, integration, and end-to-end tests to ensure code reliability</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="icon-container icon-container-info p-2 flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-base sm:text-lg mb-2">Enhance Documentation</div>
                  <div className="text-white/70 text-sm sm:text-base leading-relaxed">Create detailed README, API docs, and contribution guidelines</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="icon-container icon-container-warning p-2 flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-base sm:text-lg mb-2">Foster Community Engagement</div>
                  <div className="text-white/70 text-sm sm:text-base leading-relaxed">Encourage contributions, respond to issues, and maintain active discussions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="card-content p-6 sm:p-8">
            <h4 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="icon-container icon-container-info p-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Best Practices
              </span>
            </h4>

            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="icon-container icon-container-success p-2 flex-shrink-0">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-base sm:text-lg mb-2">Clear Commit Messages</div>
                  <div className="text-white/70 text-sm sm:text-base leading-relaxed">Use conventional commit format and descriptive messages</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="icon-container icon-container-info p-2 flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-base sm:text-lg mb-2">Coding Standards</div>
                  <div className="text-white/70 text-sm sm:text-base leading-relaxed">Maintain consistent style guides and linting rules</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="icon-container icon-container-warning p-2 flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-base sm:text-lg mb-2">Regular Updates</div>
                  <div className="text-white/70 text-sm sm:text-base leading-relaxed">Keep dependencies updated and monitor security vulnerabilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 sm:mt-10 text-center">
        <div className="card-content p-6 sm:p-8">
          <h5 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <div className="icon-container icon-container-primary p-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Ready to Improve?
          </h5>
          <p className="text-white/80 text-sm sm:text-base mb-4 max-w-2xl mx-auto leading-relaxed">
            Start implementing these recommendations to boost your repository's vibe score and attract more contributors!
          </p>

          <div className="flex items-center justify-center gap-6 text-white/70 text-sm">
            <span>Track your progress</span>
            <span>•</span>
            <span>See improvements over time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisInsights;