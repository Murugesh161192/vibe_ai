import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target, Zap, Users, BookOpen, Code, Globe, Star, GitBranch, Clock, Shield, Heart } from 'lucide-react';

const AnalysisInsights = ({ analysis }) => {
  if (!analysis) {
    return null;
  }
  const { insights, testFiles, documentationFiles, dependencies, folderStructure } = analysis;

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
    <div className="space-y-6 sm:space-y-8 md:space-y-12">
      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <div className="card-glass p-6 sm:p-8 md:p-10">
          <h3 className="text-heading-md text-lg sm:text-2xl md:text-3xl mb-8 flex items-center gap-3">
            <div className="icon-container icon-container-primary p-2">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Analysis Insights
          </h3>

          <div className="space-y-4">
            {insights.map((insight, index) => {
              const iconData = getInsightIcon(insight);
              const IconComponent = iconData.icon;

              return (
                <div
                  key={index}
                  className="card-content p-5 border-l-4 border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${iconData.bgColor} rounded-xl p-3 flex-shrink-0`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-base leading-relaxed flex-1 my-0">{insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Repository Analysis Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Test Files */}
        <div className="group card-glass p-5 sm:p-6 md:p-7 hover:shadow-xl transition-all duration-500 metric-hover glow-hover">
          <div className="text-center mb-6">
            <div className="icon-container icon-container-success p-3 sm:p-4 glow mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Code className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Test Coverage</h4>
            <p className="text-white/60 text-sm">Automated testing files detected</p>
          </div>

          {testFiles && testFiles.length > 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-green-400 mb-4 group-hover:scale-105 transition-transform duration-300">
                {testFiles.length}
              </div>
              <div className="text-white/80 text-lg font-medium mb-4">Test Files</div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                  {testFiles.slice(0, 5).map((file, index) => (
                    <div
                      key={index}
                      className="text-xs sm:text-sm text-white/70 font-mono bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 truncate"
                      title={file}
                    >
                      📄 {file}
                    </div>
                  ))}
                  {testFiles.length > 5 && (
                    <div className="text-center pt-2">
                      <span className="status-badge status-badge-good text-xs">
                        +{testFiles.length - 5} more files
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-50">🧪</div>
              <div className="text-white/60 text-sm">
                No test files detected in the repository.
              </div>
              <div className="mt-3">
                <span className="status-badge status-badge-poor text-xs">
                  Consider adding tests
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Documentation Files */}
        <div className="group card-glass p-5 sm:p-6 md:p-7 hover:shadow-xl transition-all duration-500 metric-hover glow-hover">
          <div className="text-center mb-6">
            <div className="icon-container icon-container-info p-3 sm:p-4 glow mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Documentation</h4>
            <p className="text-white/60 text-sm">Project documentation quality</p>
          </div>

          {documentationFiles && documentationFiles.length > 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-4 group-hover:scale-105 transition-transform duration-300">
                {documentationFiles.length}
              </div>
              <div className="text-white/80 text-lg font-medium mb-4">Doc Files</div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scrollbar">
                  {documentationFiles.slice(0, 5).map((file, index) => (
                    <div
                      key={index}
                      className="text-xs sm:text-sm text-white/70 font-mono bg-white/5 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 truncate"
                      title={file}
                    >
                      📖 {file}
                    </div>
                  ))}
                  {documentationFiles.length > 5 && (
                    <div className="text-center pt-2">
                      <span className="status-badge status-badge-good text-xs">
                        +{documentationFiles.length - 5} more files
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <div className="text-white/60 text-sm">
                No documentation files detected.
              </div>
              <div className="mt-3">
                <span className="status-badge status-badge-poor text-xs">
                  Add documentation
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dependencies */}
        <div className="group card-glass p-5 sm:p-6 md:p-7 hover:shadow-xl transition-all duration-500 metric-hover glow-hover">
          <div className="text-center mb-6">
            <div className="icon-container icon-container-warning p-3 sm:p-4 glow mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Dependencies</h4>
            <p className="text-white/60 text-sm">External packages and libraries</p>
          </div>

          {dependencies && dependencies.length > 0 ? (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-4 group-hover:scale-105 transition-transform duration-300">
                {dependencies.length}
              </div>
              <div className="text-white/80 text-lg font-medium mb-4">Packages</div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto custom-scrollbar">
                  {dependencies.slice(0, 6).map((dep, index) => (
                    <span
                      key={index}
                      className="status-badge status-badge-weight text-xs hover:scale-105 transition-transform duration-200"
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
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-50">📦</div>
              <div className="text-white/60 text-sm">
                No dependencies detected.
              </div>
              <div className="mt-3">
                <span className="status-badge status-badge-neutral text-xs">
                  Standalone project
                </span>
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
          Smart Recommendations
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          {/* Improvement Recommendations */}
          <div className="card-content p-6 sm:p-8">
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="icon-container icon-container-success p-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              Improve Your Vibe Score
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
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="icon-container icon-container-info p-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              Best Practices
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