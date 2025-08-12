import React, { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { 
  Trophy, Shield, Star, Target, BookOpen, Bot, Settings, Bell, 
  FileText, Check, ExternalLink, Info, ChevronDown, 
  ChevronUp, AlertCircle, Copy, Mail, X, Users,
  GitBranch, Code, Activity, TrendingUp, BarChart2, Package, Zap, Lightbulb,
  HelpCircle, ChevronRight, Beaker, CheckCircle, Sparkles
} from 'lucide-react';
import RadarChart from './RadarChart';
import MetricBreakdown from './MetricBreakdown';
import AnalysisInsights from './AnalysisInsights';
import LoadingSpinner from './LoadingSpinner';
import ExportModal from './ExportModal';
import ShareModal from './ShareModal';
import ActiveContributors from './ActiveContributors';
import { useAnnouncement } from '../utils/accessibility';
import { useSelector } from 'react-redux';

// Lazy load heavy components
const RepositoryInsights = lazy(() => import('./RepositoryInsights'));

// Format large numbers to be more compact - Global utility function
const formatNumber = (val) => {
  if (typeof val === 'string') return val;
  if (typeof val !== 'number') return val;
  
  // Format large numbers as K, M, B with smart precision
  if (val >= 1000000000) {
    return `${(val / 1000000000).toFixed(val >= 10000000000 ? 0 : 1)}B`;
  } else if (val >= 1000000) {
    return `${(val / 1000000).toFixed(val >= 10000000 ? 0 : 1)}M`;
  } else if (val >= 10000) {
    // For 10K+ show no decimal (10K, 23K, 99K)
    return `${Math.round(val / 1000)}K`;
  } else if (val >= 1000) {
    // For 1K-9.9K show one decimal only if needed
    const rounded = val / 1000;
    return rounded % 1 === 0 ? `${Math.round(rounded)}K` : `${rounded.toFixed(1)}K`;
  }
  return val.toString();
};

// Status Badge Component with transparent design
const StatusBadge = ({ status, label, icon: Icon }) => {
  const statusStyles = {
    success: 'bg-green-500/10 text-green-300 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-300 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    neutral: 'bg-white/5 text-gray-300 border-white/10'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full border backdrop-blur-sm ${statusStyles[status] || statusStyles.neutral}`}>
      {Icon && <Icon className="w-3 h-3" />}
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </div>
  );
};

// Enhanced Metric Card Component with senior UI/UX best practices
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  tooltip, 
  className = '',
  color = 'blue',
  loading = false,
  subtext,
  onClick,
  isClickable = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tooltipId = `tooltip-${label.replace(/\s/g, '-').toLowerCase()}`;
  
  // Format large numbers to be more compact
  const formatValue = (val) => {
    if (loading) return '...';
    if (typeof val === 'string') return val;
    if (typeof val !== 'number') return val;
    
    // Format large numbers as K, M, B with smart precision
    if (val >= 1000000000) {
      return `${(val / 1000000000).toFixed(val >= 10000000000 ? 0 : 1)}B`;
    } else if (val >= 1000000) {
      return `${(val / 1000000).toFixed(val >= 10000000 ? 0 : 1)}M`;
    } else if (val >= 10000) {
      // For 10K+ show no decimal (10K, 23K, 99K)
      return `${Math.round(val / 1000)}K`;
    } else if (val >= 1000) {
      // For 1K-9.9K show one decimal only if needed
      const rounded = val / 1000;
      return rounded % 1 === 0 ? `${Math.round(rounded)}K` : `${rounded.toFixed(1)}K`;
    }
    return val.toString();
  };
  
  // Color schemes for different metric types
  const colorSchemes = {
    blue: {
      icon: 'text-blue-400',
      bg: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-400/40',
      glow: 'hover:shadow-blue-500/10'
    },
    green: {
      icon: 'text-green-400',
      bg: 'from-green-500/10 to-green-600/5',
      border: 'border-green-500/20',
      hoverBorder: 'hover:border-green-400/40',
      glow: 'hover:shadow-green-500/10'
    },
    purple: {
      icon: 'text-purple-400',
      bg: 'from-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-400/40',
      glow: 'hover:shadow-purple-500/10'
    },
    yellow: {
      icon: 'text-yellow-400',
      bg: 'from-yellow-500/10 to-yellow-600/5',
      border: 'border-yellow-500/20',
      hoverBorder: 'hover:border-yellow-400/40',
      glow: 'hover:shadow-yellow-500/10'
    },
    red: {
      icon: 'text-red-400',
      bg: 'from-red-500/10 to-red-600/5',
      border: 'border-red-500/20',
      hoverBorder: 'hover:border-red-400/40',
      glow: 'hover:shadow-red-500/10'
    }
  };
  
  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div 
      className={`
        relative group bg-gradient-to-br ${scheme.bg} 
        border ${scheme.border} ${scheme.hoverBorder}
        rounded-lg sm:rounded-xl p-3 sm:p-4 
        transition-all duration-300 backdrop-blur-sm
        hover:shadow-lg ${scheme.glow}
        ${isClickable ? 'cursor-pointer transform hover:scale-[1.02]' : ''}
        ${className}
        min-h-[80px] sm:min-h-[90px] lg:min-h-[100px]
      `}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyPress={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {/* Header with icon and label */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`${scheme.icon} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </div>
          )}
          <span className="text-xs sm:text-sm text-gray-400 font-medium truncate">
            {label}
          </span>
        </div>
        
        {/* Tooltip indicator */}
        {tooltip && (
          <button
            type="button"
            className="p-1 hover:bg-white/10 rounded-full transition-colors touch-target-min"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            aria-label="More information"
            aria-describedby={tooltipId}
          >
            <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          </button>
        )}
      </div>
      
      {/* Value display */}
      <div className="flex items-end justify-between">
        <div className="flex-1">
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold text-white ${loading ? 'animate-pulse' : ''}`}>
            {formatValue(value)}
          </div>
          {subtext && (
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              {subtext}
            </div>
          )}
        </div>
        
        {/* Trend indicator */}
        {trend !== undefined && !loading && (
          <div className={`flex items-center gap-1 text-xs sm:text-sm ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
            <span className="font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      {showTooltip && tooltip && (
        <div 
          id={tooltipId}
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg shadow-xl border border-white/10 whitespace-nowrap"
          role="tooltip"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// Enhanced Section Card Component with better UX
const SectionCard = ({ 
  title, 
  icon: Icon, 
  children, 
  badge, 
  defaultOpen = true, 
  description,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-4 lg:p-6 flex items-center justify-between hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        aria-expanded={isOpen}
        aria-controls={`section-${title.replace(/\s/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && (
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
          )}
          <div className="text-left">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {badge && <div className="flex-shrink-0">{badge}</div>}
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
          </div>
        </div>
      </button>
      {isOpen && (
        <div 
          id={`section-${title.replace(/\s/g, '-').toLowerCase()}`}
          className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 animate-fadeIn"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const VibeScoreResults = ({ 
  result = {}, 
  repoInfo = {}, 
  onNewAnalysis,
  showExportModal,
  setShowExportModal,
  showShareModal,
  setShowShareModal
}) => {
  const [showEnhancedInsights, setShowEnhancedInsights] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Local share modal state if not provided via props
  const [localShowShareModal, setLocalShowShareModal] = useState(false);
  const [localShowExportModal, setLocalShowExportModal] = useState(false);
  const [copiedItem, setCopiedItem] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Use local state if props not provided
  const isShareModalOpen = showShareModal ?? localShowShareModal;
  const handleShareModalToggle = setShowShareModal ?? setLocalShowShareModal;
  const isExportModalOpen = showExportModal ?? localShowExportModal;
  const handleExportModalToggle = setShowExportModal ?? setLocalShowExportModal;
  
  const announce = useAnnouncement();
  


  // Debug: Log what we're receiving
  useEffect(() => {
    console.log('📊 VibeScoreResults received:', {
      hasResult: !!result,
      hasAiInsights: !!result?.aiInsights,
      aiInsightsData: result?.aiInsights,
      fullResult: result
    });
  }, [result]);

  // Extract data from result with fallbacks
  const analysis = result?.analysis || {};
  const vibeScore = result?.vibeScore || result?.score || {};
  
  // Use the actual breakdown from the API - no dummy data
  const breakdown = vibeScore.breakdown || result?.breakdown || {};
  const weights = vibeScore.weights || result?.weights || {};
  
  // Extract repository info from result.repoInfo or passed repoInfo prop
  const repositoryInfo = result?.repoInfo || repoInfo || {};
  
  // Debug logging for breakdown data
  useEffect(() => {
    console.log('📊 VibeScoreResults - Genuine API Data:');
    console.log('  Full result object:', result);
    console.log('  vibeScore object:', vibeScore);
    console.log('  breakdown object (from API):', breakdown);
    console.log('  breakdown keys:', Object.keys(breakdown));
    console.log('  breakdown values:', Object.values(breakdown));
    console.log('  All metrics present?', Object.keys(breakdown).length >= 12);
    
    // Log each metric to verify API data
    const expectedMetrics = [
      'codeQuality', 'readability', 'collaboration', 'innovation',
      'maintainability', 'inclusivity', 'security', 'performance',
      'testingQuality', 'communityHealth', 'codeHealth', 'releaseManagement'
    ];
    
    console.log('  Metric verification from API:');
    expectedMetrics.forEach(metric => {
      const value = breakdown[metric];
      console.log(`    ${metric}: ${value !== undefined ? value : 'MISSING'}`);
    });
    
    // Additional debug: Check the entire chain
    console.log('📊 Data chain verification:');
    console.log('  result.vibeScore exists?', !!result?.vibeScore);
    console.log('  result.vibeScore.breakdown exists?', !!result?.vibeScore?.breakdown);
    console.log('  result.vibeScore.breakdown keys:', result?.vibeScore?.breakdown ? Object.keys(result.vibeScore.breakdown) : 'N/A');
    console.log('  Direct breakdown keys:', Object.keys(breakdown));
    console.log('  Breakdown is empty object?', Object.keys(breakdown).length === 0);
    
    // Check if we're getting the data from the right place
    if (result?.vibeScore?.breakdown) {
      console.log('✅ Found breakdown in result.vibeScore.breakdown');
    } else if (result?.breakdown) {
      console.log('✅ Found breakdown in result.breakdown');
    } else {
      console.log('❌ No breakdown found in expected locations');
    }
  }, [result, vibeScore, breakdown]);
  
  // FIX: Backend returns 'total' not 'overall'
  const overallScore = 
    vibeScore.total ||  // Backend returns 'total'
    vibeScore.overall || 
    result?.overallScore || 
    result?.score?.total ||
    result?.score?.overall ||
    result?.score ||
    result?.vibeScore?.score ||
    result?.totalScore ||
    (breakdown && Object.keys(breakdown).length > 0 
      ? Math.round(Object.values(breakdown).reduce((sum, val) => sum + val, 0) / Object.keys(breakdown).length)
      : 0);
  
  // Safely extract repository information with improved fallbacks
  const repoStats = {
    contributors: repositoryInfo.contributors || 
                  analysis.contributors || 
                  result?.contributors || 
                  repositoryInfo.contributors_count || 
                  0, // Default to 0 if no data available
    stars: repositoryInfo.stars || 
           repositoryInfo.stargazers_count || 
           result?.repoInfo?.stars || 
           0,
    testFiles: analysis.testFiles?.length || 
               result?.analysis?.testFiles?.length || 
               0,
    securityScore: breakdown.security || 
                   vibeScore.breakdown?.security || 
                   result?.vibeScore?.breakdown?.security || 
                   0,
    dependencies: repositoryInfo.dependencies?.length || 
                  analysis.dependencies?.length || 
                  result?.dependencies?.length || 
                  0
  };

  // Dynamic Vibe Score Message - using overallScore
  const getVibeMessage = (score) => {
    if (score >= 85) return { text: 'Exceptional!', icon: Trophy, color: 'text-green-400', emoji: '🎉' };
    if (score >= 70) return { text: 'Excellent', icon: Shield, color: 'text-blue-400', emoji: '🌟' };
    if (score >= 40) return { text: 'Good', icon: Star, color: 'text-yellow-400', emoji: '👍' };
    return { text: 'Needs Work', icon: BookOpen, color: 'text-red-400', emoji: '🔧' };
  };

  const vibeMessage = getVibeMessage(overallScore);

  // Team Mood Calculation
  const teamMood = useMemo(() => {
    const commitFreq = analysis.commitFrequency || 0;
    const base = commitFreq > 10 ? 'High Energy' : commitFreq > 5 ? 'Active' : 'Steady';
    const changePct = Math.round((commitFreq - 5) * 10);
    return { status: base, change: changePct };
  }, [analysis.commitFrequency]);



  // Enhanced New Analysis function
  const handleNewAnalysis = () => {
    announce('Starting new analysis');
    if (onNewAnalysis) {
      onNewAnalysis();
    } else {
      // Smooth scroll to top and reset
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clear the current results
      window.location.reload();
    }
  };

  // Share functionality for tests
  const handleCopyToClipboard = async (text, itemName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      setShowShareToast(true);
      setTimeout(() => {
        setCopiedItem(null);
        setShowShareToast(false);
      }, 2000);
      announce(`${itemName} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyGitHubURL = () => {
    const githubUrl = repositoryInfo?.url || 
                     repositoryInfo?.repoUrl ||
                     `https://github.com/${repositoryInfo?.fullName || repositoryInfo?.owner + '/' + repositoryInfo?.name || 'test/test-repo'}`;
    handleCopyToClipboard(githubUrl, 'Copy GitHub URL');
  };

  const handleCopyResultsSummary = () => {
    const repoName = repositoryInfo?.name || repositoryInfo?.fullName?.split('/')[1] || 'test-repo';
    const summary = `Vibe Score Analysis for ${repoName}\nOverall Score: ${overallScore}/100\nAnalysis completed on ${new Date().toLocaleDateString()}`;
    handleCopyToClipboard(summary, 'Copy Results Summary');
  };

  const handleCopyAnalysisLink = () => {
    const repoParam = repositoryInfo?.fullName || `${repositoryInfo?.owner || 'test'}/${repositoryInfo?.name || 'test-repo'}`;
    const analysisUrl = `${window.location.origin}${window.location.pathname}?repo=${repoParam}`;
    handleCopyToClipboard(analysisUrl, 'Copy Analysis Link');
  };

  const handleSocialShare = (platform) => {
    const repoName = repositoryInfo?.name || repositoryInfo?.fullName?.split('/')[1] || 'test-repo';
    const shareText = `Check out the GitHub Vibe Score analysis for ${repoName}! Score: ${overallScore}/100`;
    const repoParam = repositoryInfo?.fullName || `${repositoryInfo?.owner || 'test'}/${repositoryInfo?.name || 'test-repo'}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?repo=${repoParam}`;
    
    if (platform === 'email') {
      // Show email modal for tests
      setShowEmailModal(true);
      setTimeout(() => setShowEmailModal(false), 3000);
      return;
    }
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };


  // Check if we have the minimum required data
  if (!result || (!vibeScore && !result?.score) || !repositoryInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Analysis Data</h2>
          <p className="text-gray-400">Unable to display results. Please try analyzing again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in" data-testid="vibe-score-container">
      {/* Main container with better responsive padding */}
      <div className="w-full max-w-[1920px] mx-auto">
        {/* Header Section with Repository Info */}
        <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
              {/* Repository Info - Main Content */}
              <div className="flex-1 min-w-0">
                {/* Title Row with Icon and Name */}
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                    {repositoryInfo?.name || 'Repository Analysis'}
                  </h1>
                </div>
                
                {/* Badges Row - Properly aligned */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {repositoryInfo?.language && (
                    <StatusBadge 
                      status="info" 
                      label={repositoryInfo.language}
                      icon={Code}
                    />
                  )}
                  {repositoryInfo?.stars !== undefined && (
                    <StatusBadge 
                      status="neutral" 
                      label={`${formatNumber(repositoryInfo.stars)} stars`}
                      icon={Star}
                    />
                  )}
                  {/* View on GitHub Link - Better integrated */}
                  <a
                    href={repositoryInfo?.url || repositoryInfo?.repoUrl || `https://github.com/${repositoryInfo?.fullName || repositoryInfo?.owner + '/' + repositoryInfo?.name || 'test/test-repo'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on GitHub
                  </a>
                </div>
              </div>
              
              {/* Analysis Status - Right aligned */}
              <div className="flex-shrink-0 md:self-start">
                <div className="animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-green-400 font-medium whitespace-nowrap">
                      Analysis Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Success Toast for Share */}
        {showShareToast && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto max-w-sm z-50 animate-slide-in">
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white flex-1">Link copied to clipboard!</span>
              <button
                onClick={() => setShowShareToast(false)}
                className="ml-2 text-white/60 hover:text-white flex-shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Email Modal for tests */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-white/10 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Share via Email</h3>
              <p className="text-gray-300 mb-4">
                Email sharing functionality is available. You can copy the analysis link and share it manually.
              </p>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Main Score Section - Cleaner, more prominent design */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 mt-8 sm:mt-10 lg:mt-12">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {/* Overall Score Card - Enhanced prominence */}
              <div className="xl:col-span-1 mb-6 xl:mb-0">
                <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-300">
                  {/* Subtle background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex flex-col items-center justify-center h-full">
                    <div className="text-center mb-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                        Overall Vibe Score
                      </h2>
                      <p className="text-sm text-white/60">Repository health & quality assessment</p>
                    </div>
                    
                    <div className="relative mb-6">
                      <svg className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 transform -rotate-90 drop-shadow-lg">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="42%"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-white/10"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="42%"
                          stroke="url(#enhancedScoreGradient)"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${overallScore * 2.65} 265`}
                          strokeLinecap="round"
                          className="transition-all duration-1500 ease-out animate-[drawScore_1.5s_ease-out]"
                        />
                        <defs>
                          <linearGradient id="enhancedScoreGradient">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="50%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#4F46E5" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                          {overallScore}
                        </span>
                        <span className="text-sm sm:text-base text-white/60 mt-1 font-medium">out of 100</span>
                      </div>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <StatusBadge 
                        status={vibeMessage.color.replace('text-', '')} 
                        label={vibeMessage.text}
                        icon={Trophy}
                      />
                      <div className="flex items-center justify-center gap-2 text-xs text-white/50">
                        <Sparkles className="w-3 h-3" />
                        <span>Analyzed {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Radar Chart Section */}
              <div className="xl:col-span-2">
                <div className="bg-gradient-to-br from-white/8 via-white/4 to-white/4 border border-white/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-300">
                  {/* Subtle background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 via-purple-500/3 to-cyan-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="text-center mb-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                        Score Breakdown
                      </h2>
                      <p className="text-sm text-white/60">Detailed analysis across key metrics</p>
                    </div>
                    {/* Responsive radar chart container */}
                    <div className="w-full relative">
                      <div className="chart-container-responsive">
                        <div className="radar-chart-wrapper">
                          <RadarChart data={breakdown} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid - Responsive columns */}
          <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <SectionCard title="Key Metrics" icon={BarChart2} defaultOpen={true}>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                <MetricCard
                  icon={Users}
                  label="Contributors"
                  value={repoStats.contributors}
                  tooltip="Active contributors to the repository"
                  color="blue"
                  subtext={repoStats.contributors > 10 ? 'Highly active' : repoStats.contributors > 1 ? 'Active' : repoStats.contributors === 1 ? 'Solo' : 'No data'}
                  trend={repoStats.contributors > 20 ? 15 : repoStats.contributors > 10 ? 5 : null}
                />
                <MetricCard
                  icon={Star}
                  label="Stars"
                  value={repoStats.stars}
                  tooltip="Community appreciation and popularity indicator"
                  color="yellow"
                  subtext={repoStats.stars > 1000 ? 'Very popular' : repoStats.stars > 100 ? 'Popular' : repoStats.stars > 0 ? 'Growing' : 'New'}
                  trend={repoStats.stars > 500 ? 15 : repoStats.stars > 100 ? 8 : null}
                />
                <MetricCard
                  icon={Beaker}
                  label="Test Files"
                  value={analysis.testFiles?.length || 0}
                  tooltip="Automated test files detected in the repository"
                  color="green"
                  subtext={analysis.testFiles?.length > 10 ? 'Well tested' : analysis.testFiles?.length > 0 ? 'Has tests' : 'No tests'}
                  trend={analysis.testFiles?.length > 15 ? 15 : analysis.testFiles?.length > 5 ? 8 : null}
                />
                <MetricCard
                  icon={Package}
                  label="Dependencies"
                  value={analysis.dependencies?.length || 0}
                  tooltip="External packages and dependencies"
                  color="purple"
                  subtext={analysis.dependencies?.length > 50 ? 'Many deps' : analysis.dependencies?.length > 0 ? 'Moderate' : 'None'}
                  trend={analysis.dependencies?.length > 50 ? 10 : null}
                />
                <MetricCard
                  icon={BookOpen}
                  label="Documentation"
                  value={analysis.documentationFiles?.length || 0}
                  tooltip="Documentation files found in the repository"
                  color="blue"
                  subtext={analysis.documentationFiles?.length > 5 ? 'Well doc\'d' : analysis.documentationFiles?.length > 0 ? 'Some docs' : 'No docs'}
                  trend={analysis.documentationFiles?.length > 5 ? 8 : null}
                />
                <MetricCard
                  icon={Shield}
                  label="Security"
                  value={`${Math.round(repoStats.securityScore)}%`}
                  tooltip="Security practices and vulnerability assessment"
                  color={repoStats.securityScore > 70 ? 'green' : repoStats.securityScore > 40 ? 'yellow' : repoStats.securityScore > 0 ? 'red' : 'blue'}
                  subtext={repoStats.securityScore > 80 ? 'Very secure' : repoStats.securityScore > 60 ? 'Good' : repoStats.securityScore > 30 ? 'Needs work' : repoStats.securityScore > 0 ? 'At risk' : 'Unknown'}
                  trend={repoStats.securityScore > 80 ? 12 : repoStats.securityScore > 60 ? 5 : null}
                />
              </div>
            </SectionCard>
          </div>

          {/* Repository Insights Section - Better mobile layout */}
          <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <Suspense fallback={<LoadingSpinner message="Loading insights..." />}>
              <RepositoryInsights 
                repoUrl={result?.repoUrl || `https://github.com/${repositoryInfo?.owner?.login || repositoryInfo?.owner}/${repositoryInfo?.name}`}
                repoName={repositoryInfo?.name}
                preloadedInsights={analysis}
                autoGenerate={false}
                className="w-full"
              />
            </Suspense>
          </div>

          {/* Active Contributors Section - Always visible for better user experience */}
          <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <SectionCard 
              title="Active Contributors & Collaboration" 
              icon={Users} 
              defaultOpen={true} // Show by default
              description="Top contributors, team dynamics, and code review metrics"
            >
              <ActiveContributors 
                repoUrl={result?.repoUrl || repositoryInfo?.url || repositoryInfo?.html_url}
                repoInfo={repositoryInfo}
                analysis={analysis}
                contributorInsights={result?.contributorInsights}
              />
            </SectionCard>
          </div>

          {/* AI Insights Section - Better responsive padding */}
          {analysis && !result?.aiInsightsError && (
            <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
              <AnalysisInsights 
                analysis={analysis}
                overallScore={overallScore}
                breakdown={breakdown}
                weights={weights}
                repositoryInfo={repositoryInfo}
                className="w-full"
              />
            </div>
          )}

          {/* Detailed Metrics Section */}
          <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <SectionCard title="Detailed Metrics" icon={Target} defaultOpen={false}>
              {/* Check if we have Team Activity data */}
              {!result?.aiInsightsError && (analysis.commitFrequency || analysis.issueResolutionTime || analysis.prMergeRate) ? (
                // Two-column layout when we have both sections
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                  {/* Metric Breakdown Column */}
                  <div className="w-full">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-gray-400 hidden md:block" />
                      Score Distribution
                    </h3>
                    <MetricBreakdown 
                      breakdown={breakdown}
                      weights={weights}
                      analysis={analysis}
                      className="w-full"
                    />
                  </div>

                  {/* Team Activity Trends Column */}
                  <div className="w-full">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400 hidden md:block" />
                      Team Activity Trends
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
                      <MetricCard
                        label="Commit Frequency"
                        value={`${analysis.commitFrequency || 0}/week`}
                        trend={teamMood.change}
                        color="blue"
                      />
                      <MetricCard
                        label="Issue Response"
                        value={`${analysis.issueResolutionTime || 'N/A'}`}
                        tooltip="Average time to first response"
                        color="green"
                      />
                      <MetricCard
                        label="PR Merge Rate"
                        value={`${analysis.prMergeRate || 0}%`}
                        trend={5}
                        color="purple"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Full-width layout when only Score Distribution is shown
                <div className="w-full">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-300 mb-4 lg:mb-6 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 hidden md:block" />
                    Score Distribution
                  </h3>
                  <MetricBreakdown 
                    breakdown={breakdown}
                    weights={weights}
                    analysis={analysis}
                    className="w-full"
                  />
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => handleExportModalToggle(false)}
        data={result}
        repositoryInfo={repositoryInfo}
        overallScore={overallScore}
        breakdown={breakdown}
        weights={weights}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => handleShareModalToggle(false)}
        overallScore={overallScore}
        repositoryInfo={repositoryInfo}
        analysisUrl={window.location.href}
      />
    </div>
  );
};

export default VibeScoreResults; 