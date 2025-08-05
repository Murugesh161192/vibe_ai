import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, GitBranch, Calendar, Users, Bot, ChevronUp, ChevronDown, Sparkles, BarChart3, TrendingUp, Info, Activity, Target, Share2, Copy, Twitter, Linkedin, CheckCircle, MessageCircle, Mail } from 'lucide-react';
import RadarChart from './RadarChart';
import MetricBreakdown from './MetricBreakdown';
import RepositoryInfo from './RepositoryInfo';
import AnalysisInsights from './AnalysisInsights';
import RepositoryInsights from './RepositoryInsights';

const VibeScoreResults = ({ result, onNewAnalysis }) => {
  const { repoInfo, vibeScore, analysis, aiInsights, aiInsightsError } = result;
  
  // Initialize state from localStorage or default to false
  const [showAIInsights, setShowAIInsights] = useState(() => {
    const saved = localStorage.getItem('showAIInsights');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Share functionality states
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' });
  
  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('showAIInsights', JSON.stringify(showAIInsights));
  }, [showAIInsights]);
  
  /**
   * Get vibe score color class based on score value
   * @param {number} score - Vibe score value
   * @returns {string} CSS class for color
   */
  const getVibeScoreColor = (score) => {
    if (score >= 55) return 'vibe-score-excellent';
    if (score >= 45) return 'vibe-score-good';
    if (score >= 35) return 'vibe-score-neutral';
    return 'vibe-score-poor';
  };

  /**
   * Get vibe score emoji based on score value
   * @param {number} score - Vibe score value
   * @returns {string} Emoji representation
   */
  const getVibeScoreEmoji = (score) => {
    if (score >= 55) return '🎉';
    if (score >= 45) return '👍';
    if (score >= 35) return '😐';
    return '💪';
  };

  /**
   * Get vibe score message based on score value
   * @param {number} score - Vibe score value
   * @returns {Object} Title and description
   */
  const getVibeScoreMessage = (score) => {
    if (score >= 55) {
      return {
        title: '🎉 Enterprise-Grade Repository!',
        description: 'This repository meets the highest standards! It demonstrates excellence comparable to projects like Kubernetes, VS Code, or React.'
      };
    } else if (score >= 45) {
      return {
        title: '👍 High-Quality Repository!',
        description: 'This repository shows strong engineering practices. It\'s well-maintained and follows industry best practices.'
      };
    } else if (score >= 35) {
      return {
        title: '😐 Solid Foundation',
        description: 'This repository has a good foundation with room for improvement. Consider enhancing the areas with lower scores.'
      };
    } else {
      return {
        title: '💪 Growth Opportunity',
        description: 'This repository has potential! Focus on improving code quality, documentation, and testing to boost your score.'
      };
    }
  };

  const vibeMessage = getVibeScoreMessage(vibeScore.total);

  // Share functionality handlers with error handling
  const handleCopyLink = async () => {
    // This copies the GITHUB repository URL
    const repoUrl = `https://github.com/${repoInfo.owner}/${repoInfo.name}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(repoUrl);
        setCopiedItem('link');
        setTimeout(() => setCopiedItem(null), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = repoUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedItem('link');
        setTimeout(() => setCopiedItem(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link. Please copy manually: ' + repoUrl);
    }
  };

  const handleCopyResults = async () => {
    const resultsText = `
🎯 Vibe Score Analysis for ${repoInfo.name}

Overall Score: ${Math.round(vibeScore.total)}/100 ${getVibeScoreEmoji(vibeScore.total)}

📊 Breakdown:
• Code Quality: ${Math.round(vibeScore.breakdown.codeQuality)}
• Readability: ${Math.round(vibeScore.breakdown.readability)}
• Collaboration: ${Math.round(vibeScore.breakdown.collaboration)}
• Security: ${Math.round(vibeScore.breakdown.security)}

${vibeMessage.title}
${vibeMessage.description}

Repository: https://github.com/${repoInfo.owner}/${repoInfo.name}
Analyzed with: Vibe GitHub Analyzer
    `.trim();
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(resultsText);
        setCopiedItem('results');
        setTimeout(() => setCopiedItem(null), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = resultsText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedItem('results');
        setTimeout(() => setCopiedItem(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy results. Please try again.');
    }
  };

  const handleShareUrl = async () => {
    // This copies the APP URL that will auto-analyze when visited
    const baseUrl = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    const pathname = window.location.pathname || '/';
    const shareUrl = `${baseUrl}${pathname}?repo=${repoInfo.owner}/${repoInfo.name}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedItem('url');
        setTimeout(() => setCopiedItem(null), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedItem('url');
        setTimeout(() => setCopiedItem(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy URL. Please copy manually: ' + shareUrl);
    }
  };

  const handleShareTwitter = () => {
    try {
      const emoji = getVibeScoreEmoji(vibeScore.total);
      const score = Math.round(vibeScore.total);
      const baseUrl = window.location.origin || `${window.location.protocol}//${window.location.host}`;
      const text = `🎯 Just analyzed ${repoInfo.name} with Vibe GitHub Analyzer!\n\n📊 Vibe Score: ${score}/100 ${emoji}\n\n✨ ${vibeMessage.title}\n\n#GitHub #CodeQuality #OpenSource`;
      const url = `${baseUrl}?repo=${repoInfo.owner}/${repoInfo.name}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    } catch (err) {
      console.error('Failed to open Twitter share:', err);
      alert('Failed to open Twitter. Please try again.');
    }
  };

  const handleShareLinkedIn = () => {
    try {
      const baseUrl = window.location.origin || `${window.location.protocol}//${window.location.host}`;
      const url = `${baseUrl}?repo=${repoInfo.owner}/${repoInfo.name}`;
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    } catch (err) {
      console.error('Failed to open LinkedIn share:', err);
      alert('Failed to open LinkedIn. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    try {
      const emoji = getVibeScoreEmoji(vibeScore.total);
      const baseUrl = window.location.origin || `${window.location.protocol}//${window.location.host}`;
      const text = `Check out this GitHub repository analysis!\n\n🎯 *${repoInfo.name}*\nVibe Score: ${Math.round(vibeScore.total)}/100 ${emoji}\n\n${vibeMessage.title}\n\nAnalyze it yourself: ${baseUrl}?repo=${repoInfo.owner}/${repoInfo.name}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to open WhatsApp share:', err);
      alert('Failed to open WhatsApp. Please try again.');
    }
  };

  const handleShareEmail = () => {
    const baseUrl = window.location.origin || `${window.location.protocol}//${window.location.host}`;
    const subject = `Check out ${repoInfo.name}'s Vibe Score Analysis`;
    
    const body = [
      'Hi,',
      '',
      `I just analyzed ${repoInfo.name} using Vibe GitHub Analyzer and thought you might find it interesting!`,
      '',
      `Vibe Score: ${Math.round(vibeScore.total)}/100`,
      '',
      vibeMessage.title,
      vibeMessage.description,
      '',
      'Breakdown:',
      `• Code Quality: ${Math.round(vibeScore.breakdown.codeQuality)}`,
      `• Readability: ${Math.round(vibeScore.breakdown.readability)}`,
      `• Collaboration: ${Math.round(vibeScore.breakdown.collaboration)}`,
      `• Security: ${Math.round(vibeScore.breakdown.security)}`,
      '',
      'Check it out yourself:',
      `${baseUrl}?repo=${repoInfo.owner}/${repoInfo.name}`,
      '',
      'Best regards'
    ].join('\n');
    
    // Store email content for modal
    setEmailContent({ subject, body });
    
    // Try to open email client
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Create a test to see if mailto worked
    let mailtoWorked = false;
    
    // Try to detect if user has email client
    const testAnchor = document.createElement('a');
    testAnchor.href = mailtoUrl;
    testAnchor.style.display = 'none';
    document.body.appendChild(testAnchor);
    
    // Set a flag before attempting
    const beforeTime = Date.now();
    
    // Try to open email
    testAnchor.click();
    
    // Check if page is still visible after a short delay
    setTimeout(() => {
      document.body.removeChild(testAnchor);
      
      // If the page lost focus, email client likely opened
      if (document.hidden || Date.now() - beforeTime > 1000) {
        mailtoWorked = true;
      }
      
      // If email didn't open or we're not sure, show the modal
      if (!mailtoWorked && !document.hidden) {
        setShowShareMenu(false);
        setShowEmailModal(true);
      }
    }, 500);
  };

  const copyEmailToClipboard = async () => {
    const fullContent = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullContent);
        setCopiedItem('email');
        setTimeout(() => setCopiedItem(null), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullContent;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedItem('email');
        setTimeout(() => setCopiedItem(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="spacing-responsive">

      {/* Main Vibe Score Display - Enhanced visuals */}
      <div className="mb-6 sm:mb-8">
        <div className="card-glass p-4 sm:p-6 text-center relative overflow-hidden">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-heading-md bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent font-bold mb-2 icon-text-align justify-center">
              <div className="icon-container icon-container-primary p-2 icon-align-center">
                <Activity className="icon-lg text-white" />
              </div>
              <span>Vibe Score Analysis</span>
            </h2>
            <p className="text-responsive text-white/80 max-w-lg mx-auto">
              Comprehensive analysis of <span className="text-blue-400 font-semibold">{repoInfo.name}</span>
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className={`text-5xl sm:text-6xl md:text-7xl font-black ${getVibeScoreColor(vibeScore.total)} mb-2 transition-all duration-300`}>
                {Math.round(vibeScore.total)}
              </div>
              <div className="text-white/60 text-responsive">out of 100</div>
            </div>
            <div className="text-heading-md font-semibold text-white mb-3">
              {vibeMessage.title}
            </div>
            <p className="text-responsive text-white/70 max-w-lg mx-auto leading-relaxed px-4">
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
            <h3 className="text-heading-md bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold mb-4 text-center icon-text-align justify-center">
              <div className="icon-container icon-container-primary p-2 icon-align-center">
                <BarChart3 className="icon-lg text-white" />
              </div>
              <span>Score Breakdown</span>
            </h3>
            <RadarChart data={vibeScore.breakdown} weights={vibeScore.weights} />
          </div>
        </div>
      )}

      {/* Score Interpretation Guide - Moved here for better UX */}
      <div className="mb-6 sm:mb-8">
        <div className="card-content p-4 md:p-6">
          <h4 className="text-heading-sm bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent font-bold mb-4 icon-text-align">
            <div className="icon-container icon-container-info p-2 icon-align-center">
              <Info className="icon-md text-white" />
            </div>
            <span>Score Interpretation Guide</span>
          </h4>
          <div className="grid-responsive-sm text-responsive">
            <div className="space-y-2 sm:space-y-3">
              <div className="icon-text-align gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium">55+: Enterprise Grade</span>
              </div>
              <div className="icon-text-align gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium">45-54: High Quality</span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="icon-text-align gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium">35-44: Good Standard</span>
              </div>
              <div className="icon-text-align gap-2 sm:gap-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex-shrink-0"></div>
                <span className="text-white font-medium">Below 35: Needs Work</span>
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
          <h3 className="text-heading-md bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent font-bold mb-4 sm:mb-6 text-center icon-text-align justify-center">
            <div className="icon-container icon-container-success p-2 icon-align-center">
              <TrendingUp className="icon-lg text-white" />
            </div>
            <span>Repository Statistics</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-responsive">
            {[
              { label: 'Stars', value: repoInfo.stars || 0, icon: '⭐', color: 'text-yellow-400' },
              { label: 'Forks', value: repoInfo.forks || 0, icon: '🔱', color: 'text-blue-400' },
              { label: 'Issues', value: repoInfo.openIssues || 0, icon: '🐛', color: 'text-red-400' },
              { label: 'Contributors', value: repoInfo.contributors || 0, icon: '👥', color: 'text-purple-400' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="card-glass-sm p-3 sm:p-4 text-center hover:bg-white/10 transition-all duration-200 cursor-default"
              >
                <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
                <div className={`text-heading-lg font-bold ${stat.color} mb-1`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-white/60 text-responsive">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Insights - Combined Section */}
      <div className="mb-6 sm:mb-8">
        <div className="card-glass p-6 sm:p-8">
          <h3 className="text-heading-md bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent font-bold mb-6 icon-text-align">
            <div className="icon-container icon-container-primary p-2 icon-align-center">
              <Bot className="icon-lg text-white" />
            </div>
            <span>Repository Insights & Recommendations</span>
          </h3>
          
          {/* Basic insights from initial analysis - This includes Test Coverage, Dependencies, and Smart Recommendations */}
          <AnalysisInsights analysis={analysis} />
          
          {/* AI-powered insights integrated below */}
          <div className="mt-8">
            {/* Enhanced Analysis Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h4 className="text-heading-sm text-white icon-text-align">
                  <Sparkles className="icon-md text-purple-400 animate-pulse" />
                  <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                    Enhanced Analysis
                  </span>
                  {aiInsights && !showAIInsights && !aiInsightsError && (
                    <span className="text-responsive text-purple-300/60 ml-2 font-normal">
                      ({aiInsights.insights?.recommendations?.length || 0} insights)
                    </span>
                  )}
                </h4>
                {/* Only show toggle button if there are insights to show */}
                {aiInsights && !aiInsightsError && (
                  <button
                    onClick={() => setShowAIInsights(!showAIInsights)}
                    className="group icon-text-align px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200 text-responsive font-medium text-purple-300 hover:text-purple-200 touch-target"
                    aria-expanded={showAIInsights}
                    aria-controls="ai-insights-content"
                  >
                    {showAIInsights ? (
                      <>
                        <ChevronUp className="icon-sm group-hover:transform group-hover:-translate-y-0.5 transition-transform" />
                        <span>Hide Details</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="icon-sm group-hover:transform group-hover:translate-y-0.5 transition-transform" />
                        <span>View Details</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Preview Grid when collapsed */}
              {!showAIInsights && aiInsights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiInsights.insights?.hotspotFiles?.length > 0 && (
                    <div className="icon-text-align gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      <p className="text-responsive text-orange-200/80">
                        {aiInsights.insights.hotspotFiles.length} code hotspots identified
                      </p>
                    </div>
                  )}
                  {aiInsights.insights?.codeQuality && (
                    <div className="icon-text-align gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      <p className="text-responsive text-yellow-200/80">
                        Code quality assessment ready
                      </p>
                    </div>
                  )}
                  {aiInsights.insights?.developmentPatterns && (
                    <div className="icon-text-align gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-responsive text-green-200/80">
                        Development patterns analyzed
                      </p>
                    </div>
                  )}
                  {aiInsights.insights?.recommendations?.length > 0 && (
                    <div className="icon-text-align gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <p className="text-responsive text-purple-200/80">
                        {aiInsights.insights.recommendations.length} actionable insights
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Error State */}
              {!showAIInsights && aiInsightsError && (
                <div className="icon-text-align gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 icon-align-center">
                    <span className="text-red-400 text-xs">!</span>
                  </div>
                  <p className="text-responsive text-red-300/80">
                    {aiInsightsError.includes('API key') 
                      ? 'AI insights require Gemini API configuration'
                      : aiInsightsError.includes('overloaded') || aiInsightsError.includes('503')
                      ? 'AI insights temporarily unavailable due to high demand • Basic analysis complete'
                      : 'AI insights temporarily unavailable • Basic analysis complete'}
                  </p>
                </div>
              )}

              {/* Fallback State - Show when using basic insights */}
              {!showAIInsights && aiInsights && aiInsights.fallback && (
                <div className="icon-text-align gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 icon-align-center">
                    <span className="text-yellow-400 text-xs">⚠</span>
                  </div>
                  <p className="text-responsive text-yellow-300/80">
                    AI insights temporarily unavailable due to high demand • Showing basic analysis
                  </p>
                </div>
              )}

              {/* Expandable Content */}
              {aiInsights && !aiInsightsError && (
                <div
                  id="ai-insights-content"
                  className={`transition-all duration-300 ease-in-out ${
                    showAIInsights ? 'opacity-100 mt-4' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
                >
                  {showAIInsights && (
                    <div className="animate-fadeIn">
                      <RepositoryInsights 
                        repoUrl={`https://github.com/${repoInfo.owner}/${repoInfo.name}`}
                        preloadedInsights={aiInsights}
                        preloadedError={aiInsightsError}
                        hideTitle={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center">
        <div className="inline-flex gap-3 relative">
          <button
            onClick={onNewAnalysis}
            className="btn-primary icon-text-align px-6 py-3 text-responsive touch-target"
          >
            <ArrowLeft className="icon-md" />
            <span>New Analysis</span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="btn-secondary icon-text-align px-6 py-3 text-responsive touch-target"
            >
              <Share2 className="icon-md" />
              <span>Share Results</span>
            </button>
            
            {/* Share Menu Dropdown */}
            {showShareMenu && (
              <div className="absolute bottom-full mb-2 right-0 w-64 card-glass p-2 shadow-xl animate-fadeIn z-50">
                <div className="space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-3 text-white/90">
                        <Copy className="w-4 h-4" />
                        Copy GitHub URL
                      </span>
                      <span className="text-xs text-white/50 ml-7">
                        Direct link to the repository
                      </span>
                    </div>
                    {copiedItem === 'link' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyResults();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-3 text-white/90">
                        <Copy className="w-4 h-4" />
                        Copy Results Summary
                      </span>
                      <span className="text-xs text-white/50 ml-7">
                        Formatted text with scores
                      </span>
                    </div>
                    {copiedItem === 'results' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareUrl();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-3 text-white/90">
                        <Copy className="w-4 h-4" />
                        Copy Analysis Link
                      </span>
                      <span className="text-xs text-white/50 ml-7">
                        Share results - auto-analyzes on visit
                      </span>
                    </div>
                    {copiedItem === 'url' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </button>
                  
                  <div className="border-t border-white/10 my-1"></div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareTwitter();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-3 text-white/90">
                      <Twitter className="w-4 h-4" />
                      Share on Twitter
                    </span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareLinkedIn();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-3 text-white/90">
                      <Linkedin className="w-4 h-4" />
                      Share on LinkedIn
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareWhatsApp();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-3 text-white/90">
                      <MessageCircle className="w-4 h-4" />
                      Share on WhatsApp
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareEmail();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-3 text-white/90">
                      <Mail className="w-4 h-4" />
                      Share by Email
                    </span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Email Modal - Appears above share button */}
            {showEmailModal && (
              <div className="absolute bottom-full mb-2 right-0 w-96 max-w-[90vw] card-glass shadow-xl animate-fadeIn z-50 max-h-[70vh] overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Share via Email
                    </h3>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(70vh-80px)]">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                    <p className="text-xs text-yellow-300">
                      No email client detected. Copy content below.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Subject:</label>
                      <div className="bg-white/5 rounded p-2 text-sm text-white select-all cursor-text">
                        {emailContent.subject}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Body:</label>
                      <div className="bg-white/5 rounded p-2 text-sm text-white/90 whitespace-pre-wrap max-h-[200px] overflow-y-auto select-all cursor-text">
                        {emailContent.body}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={copyEmailToClipboard}
                      className="btn-primary icon-text-align px-3 py-2 text-sm flex-1"
                    >
                      {copiedItem === 'email' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                    
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary icon-text-align px-3 py-2 text-sm"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Gmail</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {(showShareMenu || showEmailModal) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowShareMenu(false);
            setShowEmailModal(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default VibeScoreResults; 