import React, { useState, useRef, useEffect } from 'react';
import { 
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target, Zap, Users, 
  BookOpen, Code, Globe, Star, GitBranch, Clock, Shield, Heart, FileCode, 
  ChevronDown, ChevronUp, Info, AlertCircle, BarChart3, Beaker, Package, 
  Award, Rocket, ArrowRight, Plus 
} from 'lucide-react';

const Tooltip = ({ label, children }) => (
  <span className="relative group inline-flex items-center">
    {children}
    <button
      className="ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 text-white/80 text-[10px] font-medium flex items-center justify-center hover:scale-110 focus:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      aria-label={`More information: ${label}`}
      type="button"
    >
      i
    </button>
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 hidden group-hover:block group-focus-within:block whitespace-pre text-xs text-white bg-gradient-to-r from-gray-900 to-gray-800 border border-white/20 rounded-lg px-3 py-2 z-20 shadow-xl backdrop-blur-md max-w-xs"
      role="tooltip"
      aria-live="polite"
    >
      {label}
    </div>
  </span>
);

// Priority Chip Component
const PriorityChip = ({ level }) => {
  const getChipStyles = () => {
    switch(level) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-red-600/10',
          border: 'border-red-500/30',
          text: 'text-red-300',
          dot: 'bg-red-400',
          label: 'Critical'
        };
      case 'moderate':
        return {
          bg: 'bg-gradient-to-r from-amber-500/20 to-orange-600/10',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          dot: 'bg-amber-400',
          label: 'Moderate'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-600/10',
          border: 'border-green-500/30',
          text: 'text-green-300',
          dot: 'bg-green-400',
          label: 'Info'
        };
    }
  };

  const styles = getChipStyles();

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-full text-[10px] sm:text-xs font-semibold
        backdrop-blur-sm shadow-sm
        animate-fade-in
      `}
      role="status"
      aria-label={`Priority: ${styles.label}`}
    >
      <span className={`w-1.5 h-1.5 ${styles.dot} rounded-full animate-pulse`} />
      {styles.label}
    </span>
  );
};

// Enhanced Metric Card Component with Accessibility
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  color = 'blue', 
  trend,
  onClick,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500/10 via-blue-600/5 to-cyan-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/10',
      focus: 'focus:ring-blue-400/50'
    },
    green: {
      gradient: 'from-green-500/10 via-emerald-600/5 to-teal-500/10',
      border: 'border-green-500/20',
      icon: 'text-green-400',
      glow: 'shadow-green-500/10',
      focus: 'focus:ring-green-400/50'
    },
    purple: {
      gradient: 'from-purple-500/10 via-violet-600/5 to-indigo-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/10',
      focus: 'focus:ring-purple-400/50'
    },
    yellow: {
      gradient: 'from-yellow-500/10 via-amber-600/5 to-orange-500/10',
      border: 'border-yellow-500/20',
      icon: 'text-yellow-400',
      glow: 'shadow-yellow-500/10',
      focus: 'focus:ring-yellow-400/50'
    }
  };
  
  const scheme = colorSchemes[color] || colorSchemes.blue;
  
  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`
          flex items-center justify-center p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border}
          transition-transform duration-300 ${(isHovered || isFocused) ? 'scale-110 rotate-3' : 'scale-100'}
          w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0
        `}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${scheme.icon}`} aria-hidden="true" />
        </div>
        {trend && (
          <div 
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium min-h-[24px] flex-shrink-0
              ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
            `}
            aria-label={`Trend: ${trend > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(trend)}%`}
          >
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      {/* Content - takes remaining space */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <h4 className="text-sm sm:text-base text-white/60 font-medium leading-tight">{label}</h4>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-none">
          {value}
        </div>
        {subtext && (
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed mt-auto">{subtext}</p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          group relative p-4 sm:p-5 lg:p-6 rounded-2xl bg-gradient-to-br ${scheme.gradient}
          border ${scheme.border} hover:border-white/30 focus:border-white/30
          backdrop-blur-xl transition-all duration-500 cursor-pointer text-left w-full
          hover:scale-[1.02] focus:scale-[1.02] hover:shadow-2xl focus:shadow-2xl ${scheme.glow}
          focus:outline-none focus:ring-2 ${scheme.focus} h-full min-h-[140px] sm:min-h-[160px]
          ${className}
        `}
        aria-label={`${label}: ${value}${subtext ? `. ${subtext}` : ''}`}
        type="button"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 rounded-2xl opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10 h-full">
          {cardContent}
        </div>
      </button>
    );
  }

  return (
    <div 
      className={`
        group relative p-4 sm:p-5 lg:p-6 rounded-2xl bg-gradient-to-br ${scheme.gradient}
        border ${scheme.border} backdrop-blur-xl transition-all duration-500
        h-full min-h-[140px] sm:min-h-[160px] ${className}
      `}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 rounded-2xl opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10 h-full">
        {cardContent}
      </div>
    </div>
  );
};

// Enhanced Recommendation Card with Accessibility
const RecommendationCard = ({ title, desc, level, icon: Icon, index = 0, category }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cardId = `recommendation-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Dynamic gradient backgrounds based on priority and index
  const gradientClasses = {
    critical: [
      'from-red-500/20 to-rose-500/10',
      'from-pink-500/20 to-red-500/10',
      'from-orange-500/20 to-red-500/10',
    ],
    high: [
      'from-amber-500/20 to-yellow-500/10',
      'from-orange-500/20 to-amber-500/10',
      'from-yellow-500/20 to-orange-500/10',
    ],
    moderate: [
      'from-blue-500/20 to-cyan-500/10',
      'from-indigo-500/20 to-blue-500/10',
      'from-purple-500/20 to-indigo-500/10',
    ],
    low: [
      'from-emerald-500/20 to-green-500/10',
      'from-teal-500/20 to-emerald-500/10',
      'from-green-500/20 to-teal-500/10',
    ]
  };

  // Get icon styling based on priority
  const getIconStyling = () => {
    switch((level || 'moderate').toLowerCase()) {
      case 'critical':
        return {
          iconColor: 'text-red-400',
          bgGradient: 'from-red-500/30 to-rose-500/20',
          borderColor: 'border-red-400/30',
          glowColor: 'shadow-red-500/20'
        };
      case 'high':
        return {
          iconColor: 'text-amber-400',
          bgGradient: 'from-amber-500/30 to-yellow-500/20',
          borderColor: 'border-amber-400/30',
          glowColor: 'shadow-amber-500/20'
        };
      case 'moderate':
        return {
          iconColor: 'text-blue-400',
          bgGradient: 'from-blue-500/30 to-cyan-500/20',
          borderColor: 'border-blue-400/30',
          glowColor: 'shadow-blue-500/20'
        };
      default:
        return {
          iconColor: 'text-emerald-400',
          bgGradient: 'from-emerald-500/30 to-green-500/20',
          borderColor: 'border-emerald-400/30',
          glowColor: 'shadow-emerald-500/20'
        };
    }
  };

  // Get detailed steps based on recommendation
  const getDetailedSteps = () => {
    const detailsMap = {
      'Add Comprehensive Test Coverage': [
        'Set up a testing framework (Jest, Vitest, or similar)',
        'Write unit tests for individual functions and components',
        'Add integration tests for API endpoints',
        'Implement end-to-end tests for critical user flows',
        'Set up code coverage reporting',
        'Aim for at least 80% code coverage'
      ],
      'Improve Issue Management': [
        'Review and triage all open issues',
        'Add appropriate labels (bug, feature, help wanted, etc.)',
        'Close stale or duplicate issues',
        'Create issue templates for better reporting',
        'Set up automated issue management with GitHub Actions',
        'Establish a regular issue review schedule'
      ],
      'Enhance README Documentation': [
        'Add a clear project description and purpose',
        'Include installation instructions',
        'Provide usage examples and code snippets',
        'Document API endpoints and methods',
        'Add contributing guidelines',
        'Include badges for build status, coverage, etc.'
      ],
      'Implement CI/CD Pipeline': [
        'Set up GitHub Actions or similar CI service',
        'Configure automated testing on pull requests',
        'Add linting and code quality checks',
        'Implement automated deployment to staging',
        'Set up production deployment workflow',
        'Add security scanning and dependency updates'
      ]
    };
    
    return detailsMap[title] || [
      'Analyze current implementation',
      'Identify areas for improvement',
      'Create an implementation plan',
      'Execute changes incrementally',
      'Test thoroughly',
      'Document the changes'
    ];
  };

  const iconStyling = getIconStyling();
  const priorityLevel = (level || 'moderate').toLowerCase();
  const selectedGradient = gradientClasses[priorityLevel]?.[index % 3] || gradientClasses.moderate[0];
  
  const handleCardClick = (e) => {
    // Prevent click if clicking on a button or link inside the card
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
      return;
    }
    setShowDetails(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowDetails(true);
    }
  };
  
  return (
    <>
      <article 
        id={cardId}
        className={`
          group relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${selectedGradient}
          border border-white/10 backdrop-blur-xl
          transition-all duration-500 hover:scale-[1.02] hover:border-white/20
          hover:shadow-2xl hover:-translate-y-1
          animate-slide-up cursor-pointer
          min-h-[160px] sm:min-h-[170px] lg:min-h-[180px]
        `}
        style={{ animationDelay: `${index * 75}ms` }}
        role="button"
        aria-labelledby={`recommendation-title-${cardId}`}
        aria-pressed={showDetails}
        tabIndex="0"
        onClick={handleCardClick}
        onKeyDown={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Enhanced gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Animated background accent */}
        <div 
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${selectedGradient} 
            rounded-full blur-3xl opacity-20 group-hover:opacity-40 
            group-hover:scale-150 transition-all duration-700`}
          aria-hidden="true" 
        />
        
        <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full">
          {/* Header with icon and priority */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Enhanced animated icon container */}
              <div className={`
                p-2.5 rounded-xl bg-gradient-to-br ${iconStyling.bgGradient}
                border ${iconStyling.borderColor}
                group-hover:scale-110 group-hover:rotate-6
                transition-all duration-500
                shadow-lg ${iconStyling.glowColor}
                backdrop-blur-xl
              `}>
                {Icon ? (
                  <Icon className={`w-4 h-4 ${iconStyling.iconColor} animate-pulse-subtle`} />
                ) : (
                  <Lightbulb className={`w-4 h-4 ${iconStyling.iconColor} animate-pulse-subtle`} />
                )}
              </div>
              
              {/* Category badge */}
              {category && (
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  {category}
                </span>
              )}
            </div>
            
            {/* Enhanced Priority Badge */}
            <div className={`
              px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide
              transition-all duration-300 group-hover:scale-105
              ${level?.toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                level?.toLowerCase() === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                level?.toLowerCase() === 'moderate' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'}
            `}>
              {level || 'Moderate'}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Title with improved typography */}
            <h3 
              id={`recommendation-title-${cardId}`}
              className="text-sm sm:text-[15px] font-bold text-white/95 mb-2 
                line-clamp-2 group-hover:text-white transition-colors duration-300"
            >
              {title}
            </h3>
            
            {/* Description with better readability */}
            <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed 
              line-clamp-3 group-hover:text-white/80 transition-colors duration-300 flex-1">
              {desc}
            </p>
          </div>
          
          {/* Action indicator */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-[11px] text-white/50 font-medium">
              Click for details
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 
              group-hover:translate-x-1 transition-all duration-300" />
          </div>
          
          {/* Bottom accent line */}
          <div className={`
            absolute bottom-0 left-0 right-0 h-0.5
            bg-gradient-to-r ${selectedGradient}
            opacity-50 group-hover:opacity-100
            transition-opacity duration-500
          `} />
        </div>
        
        {/* Focus ring for accessibility */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-900/50" />
        )}
      </article>

      {/* Detailed Modal */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDetails(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${cardId}`}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 
              rounded-2xl border border-white/10 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl 
              border-b border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-3 rounded-xl bg-gradient-to-br ${iconStyling.bgGradient}
                    border ${iconStyling.borderColor}
                    shadow-lg ${iconStyling.glowColor}
                  `}>
                    {Icon ? (
                      <Icon className={`w-5 h-5 ${iconStyling.iconColor}`} />
                    ) : (
                      <Lightbulb className={`w-5 h-5 ${iconStyling.iconColor}`} />
                    )}
                  </div>
                  <div>
                    <h2 id={`modal-title-${cardId}`} className="text-lg font-bold text-white">
                      {title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold uppercase
                        ${level?.toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-300' :
                          level?.toLowerCase() === 'high' ? 'bg-amber-500/20 text-amber-300' :
                          level?.toLowerCase() === 'moderate' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-emerald-500/20 text-emerald-300'}
                      `}>
                        {level || 'Moderate'} Priority
                      </span>
                      {category && (
                        <span className="text-xs text-white/50 uppercase">
                          {category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-label="Close modal"
                >
                  <ChevronUp className="w-5 h-5 text-white/70 rotate-45" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Overview
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {desc}
                </p>
              </div>

              {/* Implementation Steps */}
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Implementation Steps
                </h3>
                <ol className="space-y-2">
                  {getDetailedSteps().map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                        border border-white/20 flex items-center justify-center text-xs font-bold text-white/80">
                        {i + 1}
                      </span>
                      <span className="text-sm text-white/70 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Benefits */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
                <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Expected Benefits
                </h3>
                <ul className="space-y-1 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Improved code quality and reliability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Better developer experience and productivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Increased community engagement and contributions</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                    border border-white/20 text-sm font-medium text-white/90 
                    hover:from-blue-500/30 hover:to-purple-500/30 hover:border-white/30 
                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AnalysisInsights = ({ analysis, aiInsights }) => {
  const [collapseSmart, setCollapseSmart] = useState(false);
  const [collapseBest, setCollapseBest] = useState(false);
  
  const recommendationsRef = useRef(null);

  // Debug: Log AI insights to verify data flow
  useEffect(() => {
    if (aiInsights) {
      console.log('📊 AI Insights received:', {
        keyInsights: aiInsights?.keyInsights,
        smartRecommendations: aiInsights?.smartRecommendations,
        fullData: aiInsights
      });
    }
  }, [aiInsights]);

  if (!analysis && !aiInsights) return null;
  
  // AI Response Data Structure:
  // aiInsights = {
  //   keyInsights: ["insight1", "insight2", ...], // 6 insights from Gemini AI
  //   smartRecommendations: [
  //     { title, description, priority, category }, // 4 recommendations from AI
  //   ],
  //   summary, strengths, improvements, etc.
  // }
  // OR nested as: aiInsights.insights.keyInsights (from backend response)
  
  // Extract recommendations from AI data - check multiple possible paths
  const smartRecommendations = 
    aiInsights?.smartRecommendations || 
    aiInsights?.insights?.smartRecommendations || 
    aiInsights?.data?.insights?.smartRecommendations ||
    aiInsights?.data?.smartRecommendations ||
    [];

  // Get icon for recommendations based on category
  const getRecommendationIcon = (category) => {
    switch(category) {
      case 'testing': return Shield;
      case 'documentation': return BookOpen;
      case 'community': return Heart;
      case 'code-quality': return Code;
      case 'security': return Shield;
      case 'performance': return Zap;
      default: return Lightbulb;
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = (event, toggleFunction, sectionRef) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFunction();
      
      // Focus management for screen readers
      if (sectionRef.current) {
        setTimeout(() => {
          const firstFocusableElement = sectionRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusableElement) {
            firstFocusableElement.focus();
          }
        }, 150);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10" role="main" aria-label="Repository Analysis Insights">
      {/* Smart Recommendations - Always show this section */}
      <section 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-white/10 backdrop-blur-2xl"
        aria-labelledby="smart-recommendations-heading"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
        
        <div className="relative z-10">
          <button 
            onClick={() => setCollapseSmart(!collapseSmart)}
            onKeyDown={(e) => handleKeyDown(e, () => setCollapseSmart(!collapseSmart), recommendationsRef)}
            className="w-full flex items-center justify-between text-left p-3 sm:p-4 lg:p-6 xl:p-8 hover:bg-white/5 focus:bg-white/5 rounded-3xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[70px] sm:min-h-[80px] lg:min-h-[96px]"
            aria-expanded={!collapseSmart}
            aria-controls="smart-recommendations-content"
            type="button"
          >
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
              {/* Icon Container - Fixed dimensions */}
              <div className="flex items-center justify-center p-2 sm:p-2.5 lg:p-3 xl:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 group-hover:scale-110 group-focus:scale-110 transition-transform duration-300 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-purple-400" aria-hidden="true" />
              </div>
              
              {/* Text Content */}
              <div className="min-w-0 flex-1">
                <h2 
                  id="smart-recommendations-heading"
                  className="text-base sm:text-lg font-semibold bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent leading-tight"
                >
                  Smart Recommendations
                </h2>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400 hidden sm:block" aria-hidden="true" />
              {collapseSmart ? 
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/70 group-hover:text-white group-focus:text-white transition-colors" aria-hidden="true" /> : 
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white/70 group-hover:text-white group-focus:text-white transition-colors" aria-hidden="true" />
              }
            </div>
          </button>
          
          {!collapseSmart && (
            <div 
              id="smart-recommendations-content"
              ref={recommendationsRef}
              className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8"
              role="region"
              aria-labelledby="smart-recommendations-heading"
            >
              {/* Enhanced container with subtle background */}
              <div className="relative">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-pink-500/3 rounded-xl" aria-hidden="true" />
                
                {/* Updated responsive grid to match Key Insights layout */}
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {smartRecommendations.length > 0 ? (
                  // Show AI-generated recommendations first 6 for optimal display
                  smartRecommendations.slice(0, 6).map((recommendation, index) => {
                    const { title, description, priority, category } = recommendation;
                    return (
                      <RecommendationCard
                        key={`recommendation-${index}`}
                        title={title}
                        desc={description}
                        level={priority}
                        icon={getRecommendationIcon(category)}
                        index={index}
                        category={category}
                      />
                    );
                  })
                ) : (
                  // Fallback recommendations when AI data is not available yet - use dynamic data when possible
                  <>
                    <RecommendationCard
                      title="Add Comprehensive Test Coverage"
                      desc="Implement unit and integration tests to ensure code reliability and make the project more trustworthy for contributors"
                      level="critical"
                      icon={Shield}
                      index={0}
                      category="testing"
                    />
                    <RecommendationCard
                      title="Improve Issue Management"
                      desc={`${analysis?.repoInfo?.openIssues && analysis.repoInfo.openIssues > 0 
                        ? `With ${analysis.repoInfo.openIssues} open issues, consider triaging, labeling, and closing stale issues to maintain project health`
                        : 'Consider implementing better issue management practices with proper labeling and triaging to maintain project health'}`}
                      level="critical"
                      icon={BookOpen}
                      index={1}
                      category="documentation"
                    />
                    <RecommendationCard
                      title="Enhance README Documentation"
                      desc="Clear documentation helps new users and contributors understand the project purpose and how to get started"
                      level="moderate"
                      icon={Heart}
                      index={2}
                      category="community"
                    />
                    <RecommendationCard
                      title="Implement CI/CD Pipeline"
                      desc="Automated testing and deployment improve code quality and reduce manual effort"
                      level="moderate"
                      icon={Code}
                      index={3}
                      category="code-quality"
                    />
                  </>
                )}
                </div>
                
                {/* Show a "View More" button if there are more than 6 recommendations */}
                {smartRecommendations.length > 6 && (
                  <div className="mt-6 text-center">
                    <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                      border border-white/20 text-sm font-medium text-white/90 
                      hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 
                      hover:border-white/30 hover:scale-105 transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-purple-400/50">
                      View {smartRecommendations.length - 6} More Recommendations
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>


    </div>
  );
};

export default AnalysisInsights;