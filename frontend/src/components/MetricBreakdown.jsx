import React, { useState, useMemo, useCallback, memo } from 'react';
import { CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BarChart3, Activity, Sparkles, Target, Award, Zap, Users, Shield, Trophy, List } from 'lucide-react';
import { useDeviceType, useViewport, useTouchTarget } from '../utils/responsive';
import { usePrefersReducedMotion, useAnnouncement } from '../utils/accessibility';

// Enhanced Sparkline component for visual trends
const Sparkline = ({ points = [], color = 'text-purple-300' }) => {
  if (!points.length) return null;
  const width = 80;
  const height = 24;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const pathData = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  return (
    <div className="flex items-center justify-center">
      <svg width={width} height={height} className={`${color} opacity-80`} aria-hidden="true">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#gradient-${color})`}
          opacity="0.2"
        />
      </svg>
    </div>
  );
};

// Enhanced Progress Bar Component with better accessibility
const ProgressBar = ({ value, max = 100, color = 'blue', showValue = true, size = 'md', label }) => {
  const colorSchemes = {
    blue: 'from-blue-400 to-cyan-400',
    green: 'from-green-400 to-emerald-400',
    purple: 'from-purple-400 to-violet-400',
    yellow: 'from-yellow-400 to-amber-400',
    red: 'from-red-400 to-rose-400',
    orange: 'from-orange-400 to-red-400',
    indigo: 'from-indigo-400 to-purple-400',
    pink: 'from-pink-400 to-rose-400',
    teal: 'from-teal-400 to-cyan-400',
    emerald: 'from-emerald-400 to-green-400'
  };
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3'
  };
  
  const percentage = Math.min((value / max) * 100, 100);
  const gradient = colorSchemes[color] || colorSchemes.blue;
  
  return (
    <div className="space-y-1">
      <div 
        className={`w-full bg-white/10 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin="0"
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(value)} out of ${max}`}
      >
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
          style={{ 
            width: `${percentage}%`,
            boxShadow: percentage > 0 ? `0 0 10px rgba(59, 130, 246, 0.3)` : 'none'
          }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-xs text-white/60">
          <span>{Math.round(value)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Metric Card Component with improved accessibility and responsiveness
const MetricCard = ({ metric, isExpanded, onToggle, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const deviceType = useDeviceType();
  const viewport = useViewport();
  const touchTarget = useTouchTarget('default');
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const score = Math.round(metric.value);
  const weight = metric.weight;
  const contribution = metric.value * weight;
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue'; 
    if (score >= 40) return 'yellow';
    if (score >= 20) return 'orange';
    return 'red';
  };
  
  const scoreColor = getScoreColor(score);
  
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500/10 via-blue-600/5 to-cyan-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      bg: 'bg-blue-500/20'
    },
    green: {
      gradient: 'from-green-500/10 via-emerald-600/5 to-teal-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      bg: 'bg-green-500/20'
    },
    yellow: {
      gradient: 'from-yellow-500/10 via-amber-600/5 to-orange-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/20'
    },
    orange: {
      gradient: 'from-orange-500/10 via-amber-600/5 to-red-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-400',
      bg: 'bg-orange-500/20'
    },
    red: {
      gradient: 'from-red-500/10 via-rose-600/5 to-pink-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      bg: 'bg-red-500/20'
    }
  };
  
  const scheme = colorSchemes[scoreColor] || colorSchemes.blue;
  
  // Enhanced responsive text sizing for better mobile readability
  const getResponsiveTextSize = (size) => {
    const baseSize = {
      'xs': deviceType === 'mobile' && viewport.width < 375 
        ? 'text-[10px]' 
        : deviceType === 'mobile' 
          ? 'text-xs' 
          : 'text-xs',
      'sm': deviceType === 'mobile' && viewport.width < 375 
        ? 'text-xs' 
        : deviceType === 'mobile' 
          ? 'text-sm' 
          : 'text-sm',
      'base': deviceType === 'mobile' && viewport.width < 375 
        ? 'text-sm' 
        : deviceType === 'mobile' 
          ? 'text-sm' 
          : deviceType === 'tablet' 
            ? 'text-base' 
            : 'text-base',
      'lg': deviceType === 'mobile' && viewport.width < 375 
        ? 'text-base' 
        : deviceType === 'mobile' 
          ? 'text-lg' 
          : deviceType === 'tablet' 
            ? 'text-lg' 
            : 'text-xl',
      '2xl': deviceType === 'mobile' && viewport.width < 375 
        ? 'text-lg' 
        : deviceType === 'mobile' 
          ? 'text-2xl' 
          : 'text-3xl'
    };
    return baseSize[size] || baseSize.base;
  };

  // Enhanced responsive spacing for ultra-small screens
  const getResponsiveSpacing = () => {
    if (deviceType === 'mobile' && viewport.width < 375) {
      return {
        padding: 'p-3',
        margin: 'm-1',
        gap: 'gap-1.5'
      };
    } else if (deviceType === 'mobile') {
      return {
        padding: 'p-4',
        margin: 'm-2',
        gap: 'gap-2'
      };
    } else {
      return {
        padding: 'p-4 sm:p-5',
        margin: 'm-2 sm:m-3',
        gap: 'gap-3'
      };
    }
  };

  const spacing = getResponsiveSpacing();
  
  return (
    <div
      className={`
        group relative rounded-2xl bg-gradient-to-br ${scheme.gradient}
        border ${scheme.border} hover:border-white/30
        backdrop-blur-xl transition-all duration-500 cursor-pointer
        ${!prefersReducedMotion ? 'hover:scale-[1.02] hover:shadow-xl' : 'hover:shadow-xl'}
        ${isExpanded ? 'lg:col-span-2 xl:col-span-2 2xl:col-span-2' : ''}
        ${viewMode === 'list' ? 'w-full' : ''}
        ${touchTarget}
        overflow-hidden min-w-0
      `}
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${metric.label} metric: ${score} out of 100. ${isExpanded ? 'Collapse' : 'Expand'} details.`}
      tabIndex={0}
      data-testid={`metric-${metric.key.toLowerCase().replace(/[_\s]+/g, '-')}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      </div>
      
      <div className={`relative z-10 ${spacing.padding} overflow-hidden`}>
        {/* Header with improved responsive layout */}
        <div className={`flex items-start justify-between mb-3 sm:mb-4 ${spacing.gap} min-w-0`}>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
            <div className={`
              p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${scheme.gradient} border ${scheme.border}
              transition-transform duration-300 flex-shrink-0 
              ${!prefersReducedMotion && isHovered ? 'scale-110 rotate-3' : 'scale-100'}
            `}>
              <span className={`${getResponsiveTextSize('base')} sm:text-lg`}>{metric.icon}</span>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h5 className={`font-semibold text-white ${getResponsiveTextSize('sm')} sm:text-base lg:text-lg xl:text-base 2xl:text-lg truncate pr-2`} 
                  data-testid="metric-name"
                  title={metric.label}>
                {metric.label}
              </h5>
              {/* Enhanced responsive badge layout with proper spacing */}
              <div className="flex flex-col gap-1.5 mt-2">
                {/* Weight and points container with improved layout */}
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  {/* Weight badge with proper constraints */}
                  <span className={`
                    inline-flex items-center px-2.5 py-1 rounded-full 
                    ${getResponsiveTextSize('xs')} font-medium 
                    ${scheme.bg} ${scheme.text} 
                    whitespace-nowrap flex-shrink-0
                    transition-all duration-200
                    hover:shadow-md hover:scale-105
                    relative z-10
                  `}>
                    <span className="font-semibold">{Math.round(weight * 100)}%</span>
                    <span className="ml-1">weight</span>
                  </span>
                  {/* Points with separator */}
                  <span className={`
                    inline-flex items-center gap-1
                    ${getResponsiveTextSize('xs')} text-white/60 
                    whitespace-nowrap
                  `}>
                    <span className="hidden sm:inline text-white/30">•</span>
                    <span className="font-medium">{Math.round(contribution)} pts</span>
                  </span>
                </div>
                {/* Trend indicator on separate line for clarity */}
                {metric.trend !== 0 && (
                  <div className={`flex items-center gap-1.5 ${getResponsiveTextSize('xs')} font-medium ${
                    metric.trend > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span className="flex items-center gap-1" aria-label={`Trend: ${metric.trend > 0 ? 'improving' : 'declining'} by ${Math.round(Math.abs(metric.trend))} percent`}>
                      <span className="text-lg">{metric.trend > 0 ? '↗' : '↘'}</span>
                      <span>{Math.round(Math.abs(metric.trend))}%</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced score section with better responsive design */}
          <div className="flex flex-col items-end justify-start flex-shrink-0 ml-3 pl-2">
            <div className={`${getResponsiveTextSize('2xl')} sm:text-3xl lg:text-4xl font-bold ${scheme.text} leading-none tabular-nums`} 
                 data-testid="metric-score"
                 aria-label={`Score: ${score} out of 100`}>
              {score}
            </div>
            <div className={`${getResponsiveTextSize('xs')} text-white/60 mt-1 whitespace-nowrap font-medium`}>
              Score
            </div>
          </div>
        </div>

        {/* Progress Bar with accessibility label */}
        <div className="mb-3 sm:mb-4">
          <ProgressBar 
            value={score} 
            max={100} 
            color={scoreColor} 
            showValue={false}
            size="md"
            label={`${metric.label} score progress`}
          />
        </div>

        {/* Sparkline - Optimized for different screen sizes */}
        <div className={`${deviceType === 'mobile' && viewport.width < 375 ? 'hidden' : 'block'} mb-3 sm:mb-4`}>
          {metric.sparklineData && metric.sparklineData.length > 0 && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className={`${getResponsiveTextSize('xs')} text-white/60 font-medium`}>Trend History</span>
                <div className={`flex items-center gap-1.5 ${getResponsiveTextSize('xs')} font-medium ${
                  metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> : 
                   metric.trend < 0 ? <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" /> : 
                   <Minus className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{metric.trend > 0 ? 'Improving' : metric.trend < 0 ? 'Declining' : 'Stable'}</span>
                </div>
              </div>
              <Sparkline points={metric.sparklineData} color={`text-${scoreColor}-400`} />
            </div>
          )}
        </div>

        {/* Expand indicator with better touch targets */}
        <div className={`flex items-center justify-between ${getResponsiveTextSize('xs')} text-white/60`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              score >= 70 ? 'bg-green-400' : 
              score >= 40 ? 'bg-yellow-400' : 
              'bg-red-400'
            }`} aria-hidden="true"></span>
            <span className="font-medium">
              {score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Work'}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`${deviceType === 'mobile' && viewport.width < 375 ? 'hidden' : 'inline'}`}>
              {isExpanded ? 'Hide' : 'Show'} details
            </span>
            {isExpanded ? 
              <ChevronUp className="w-4 h-4" aria-hidden="true" /> : 
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            }
          </div>
        </div>
      </div>

      {/* Expanded Details with improved mobile layout */}
      {isExpanded && (
        <div className={`px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/10 pt-4 ${!prefersReducedMotion ? 'animate-fade-in' : ''}`} 
             role="region" 
             aria-label={`Detailed information about ${metric.label}`}>
          <div className="space-y-4">
            {/* Description */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className={`${getResponsiveTextSize('sm')} text-white/80 leading-relaxed mb-3`}>{metric.description}</p>
              
              {/* Key Factors with better mobile grid */}
              <div className="mb-4">
                <h6 className={`${getResponsiveTextSize('xs')} font-semibold text-white/60 uppercase tracking-wider mb-3`}>
                  Key Contributing Factors
                </h6>
                <div className={`grid ${deviceType === 'mobile' && viewport.width < 375 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2`}>
                  {metric.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                      <div className={`w-2 h-2 rounded-full ${scheme.bg}`} aria-hidden="true"></div>
                      <span className={`${getResponsiveTextSize('xs')} text-white/80`}>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className={`p-4 rounded-xl ${scheme.bg} border ${scheme.border}`}>
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg bg-white/10 flex-shrink-0`}>
                  <Target className={`w-4 h-4 ${scheme.text}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h6 className={`${getResponsiveTextSize('sm')} font-semibold ${scheme.text} mb-2`}>
                    Improvement Strategy
                  </h6>
                  <p className={`${getResponsiveTextSize('sm')} text-white/80 leading-relaxed`}>{metric.tips}</p>
                </div>
              </div>
            </div>

            {/* Score Impact Analysis with responsive grid */}
            <div className={`grid ${deviceType === 'mobile' && viewport.width < 375 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-3`}>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className={`${getResponsiveTextSize('sm')} font-semibold text-white mb-1`}>Current Score</div>
                <div className={`${getResponsiveTextSize('lg')} font-bold ${scheme.text}`} aria-label={`Current score is ${score}`}>{score}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className={`${getResponsiveTextSize('sm')} font-semibold text-white mb-1`}>Weight Impact</div>
                <div className={`${getResponsiveTextSize('lg')} font-bold text-yellow-400`} aria-label={`Weight impact is ${Math.round(weight * 100)} percent`}>{Math.round(weight * 100)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className={`${getResponsiveTextSize('sm')} font-semibold text-white mb-1`}>Contribution</div>
                <div className={`${getResponsiveTextSize('lg')} font-bold text-blue-400`} aria-label={`Contribution is ${Math.round(contribution)} points`}>{Math.round(contribution)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBreakdown = memo(({ breakdown, weights }) => {
  const [expandedMetrics, setExpandedMetrics] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('score'); // 'score', 'weight', 'contribution'
  const deviceType = useDeviceType();
  const viewport = useViewport();
  const announce = useAnnouncement();
  const touchTarget = useTouchTarget('default');

  // Toggle metric expansion with announcement
  const toggleMetric = useCallback((metric) => {
    setExpandedMetrics(prev => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(metric);
      
      if (newSet.has(metric)) {
        newSet.delete(metric);
        announce(`${metric} details collapsed`);
      } else {
        newSet.add(metric);
        announce(`${metric} details expanded`);
      }
      return newSet;
    });
  }, [announce]);

  // Calculate metric details with enhanced information
  const metricsWithDetails = useMemo(() => {
    if (!breakdown || !weights) return [];

    const metricDetails = {
      codeQuality: {
        label: 'Code Quality',
        icon: '✨',
        description: 'Measures code structure, patterns, and maintainability through static analysis and best practices adherence',
        factors: ['Clean code patterns', 'Error handling', 'Code organization', 'Best practices adherence'],
        tips: 'Focus on refactoring complex functions, implementing proper error handling, and following established coding standards',
        sparklineData: [65, 70, 68, 72, 75, 78, 80],
        gradient: 'from-purple-400 to-pink-400'
      },
      readability: {
        label: 'Readability',
        icon: '📖',
        description: 'Evaluates code clarity, documentation quality, and how easily other developers can understand the codebase',
        factors: ['Comments coverage', 'Variable naming', 'Function clarity', 'Documentation completeness'],
        tips: 'Add comprehensive inline comments, use descriptive variable names, and maintain up-to-date documentation',
        sparklineData: [70, 72, 71, 74, 76, 75, 78],
        gradient: 'from-blue-400 to-cyan-400'
      },
      collaboration: {
        label: 'Collaboration',
        icon: '👥',
        description: 'Tracks team contribution patterns, code review practices, and community engagement metrics',
        factors: ['Contributor diversity', 'PR review quality', 'Issue response time', 'Community engagement'],
        tips: 'Encourage more contributors, implement thorough code review practices, and maintain responsive community support',
        sparklineData: [60, 65, 70, 68, 72, 75, 73],
        gradient: 'from-green-400 to-teal-400'
      },
      security: {
        label: 'Security',
        icon: '🔒',
        description: 'Analyzes security practices, vulnerability management, and adherence to security standards',
        factors: ['Security policies', 'Dependency scanning', 'Vulnerability patching', 'Access controls'],
        tips: 'Implement automated security scanning, keep dependencies updated, and establish clear security policies',
        sparklineData: [55, 58, 60, 62, 65, 68, 70],
        gradient: 'from-red-400 to-orange-400'
      },
      innovation: {
        label: 'Innovation',
        icon: '🚀',
        description: 'Measures adoption of modern practices, technologies, and creative problem-solving approaches',
        factors: ['Modern frameworks', 'New technologies', 'Creative solutions', 'Performance optimizations'],
        tips: 'Explore modern development practices, adopt new technologies where appropriate, and focus on innovative solutions',
        sparklineData: [50, 52, 55, 58, 60, 62, 65],
        gradient: 'from-yellow-400 to-amber-400'
      },
      maintainability: {
        label: 'Maintainability',
        icon: '🔧',
        description: 'Assesses how easy the code is to maintain, extend, and modify over time',
        factors: ['Module structure', 'Dependency management', 'Test coverage', 'Documentation quality'],
        tips: 'Improve test coverage, modularize your codebase, and maintain clear architectural documentation',
        sparklineData: [45, 48, 50, 52, 55, 58, 60],
        gradient: 'from-indigo-400 to-purple-400'
      },
      inclusivity: {
        label: 'Inclusivity',
        icon: '🤝',
        description: 'Evaluates community openness, accessibility, and contribution guidelines for diverse contributors',
        factors: ['Code of conduct', 'Contributing guidelines', 'Issue templates', 'Accessibility features'],
        tips: 'Establish a code of conduct, create clear contribution guidelines, and ensure accessibility compliance',
        sparklineData: [40, 42, 45, 48, 50, 52, 55],
        gradient: 'from-pink-400 to-rose-400'
      },
      performance: {
        label: 'Performance',
        icon: '⚡',
        description: 'Measures optimization practices, efficiency metrics, and runtime performance characteristics',
        factors: ['Load time optimization', 'Bundle size management', 'Runtime efficiency', 'Resource utilization'],
        tips: 'Optimize bundle sizes, implement performance monitoring, and focus on critical rendering path improvements',
        sparklineData: [55, 58, 60, 62, 65, 63, 68],
        gradient: 'from-cyan-400 to-blue-400'
      },
      testingQuality: {
        label: 'Testing Quality',
        icon: '🧪',
        description: 'Evaluates comprehensive testing practices, coverage metrics, and test automation implementation',
        factors: ['Unit test coverage', 'Integration tests', 'E2E testing', 'Test automation pipeline'],
        tips: 'Increase test coverage across all levels, implement continuous testing, and focus on critical path coverage',
        sparklineData: [30, 35, 40, 45, 50, 52, 55],
        gradient: 'from-teal-400 to-green-400'
      },
      communityHealth: {
        label: 'Community Health',
        icon: '❤️',
        description: 'Tracks community engagement metrics, project vitality, and long-term sustainability indicators',
        factors: ['Issue activity', 'PR velocity', 'Community growth', 'Response times'],
        tips: 'Engage with community issues promptly, maintain regular releases, and foster inclusive discussions',
        sparklineData: [45, 48, 50, 52, 50, 53, 55],
        gradient: 'from-rose-400 to-pink-400'
      },
      codeHealth: {
        label: 'Code Health',
        icon: '💚',
        description: 'Overall codebase health assessment including technical debt and code quality metrics',
        factors: ['Technical debt ratio', 'Code complexity', 'Duplication levels', 'Architecture quality'],
        tips: 'Address technical debt systematically, reduce code duplication, and maintain clean architecture',
        sparklineData: [50, 52, 54, 56, 58, 60, 62],
        gradient: 'from-emerald-400 to-green-400'
      },
      releaseManagement: {
        label: 'Release Management',
        icon: '📦',
        description: 'Evaluates release processes, version control practices, and deployment automation',
        factors: ['Release frequency', 'Changelog maintenance', 'Semantic versioning', 'Deployment automation'],
        tips: 'Implement semantic versioning, maintain detailed changelogs, and automate deployment processes',
        sparklineData: [40, 42, 44, 46, 48, 50, 52],
        gradient: 'from-violet-400 to-purple-400'
      }
    };

    return Object.entries(breakdown).map(([key, value]) => {
      const details = metricDetails[key] || {
        label: key.replace(/([A-Z])/g, ' $1').trim(),
        icon: '📊',
        description: 'Metric information',
        factors: ['Factor 1', 'Factor 2', 'Factor 3'],
        tips: 'Focus on improving this metric through targeted efforts',
        sparklineData: [],
        gradient: 'from-gray-400 to-gray-500'
      };

      const weight = weights[key] || 0;
      const weightedScore = value * weight;
      const trend = details.sparklineData.length > 1 
        ? details.sparklineData[details.sparklineData.length - 1] - details.sparklineData[details.sparklineData.length - 2]
        : 0;

      return {
        key,
        value,
        weight,
        weightedScore,
        trend,
        ...details
      };
    });
  }, [breakdown, weights]);

  // Sort metrics
  const sortedMetrics = useMemo(() => {
    const sorted = [...metricsWithDetails].sort((a, b) => {
      switch (sortBy) {
        case 'weight':
          return b.weight - a.weight;
        case 'contribution':
          return b.weightedScore - a.weightedScore;
        case 'score':
        default:
          return b.value - a.value;
      }
    });
    return sorted;
  }, [metricsWithDetails, sortBy]);

  // Enhanced responsive grid classes for better mobile layout
  const getResponsiveGridClasses = () => {
    if (viewMode === 'list') return 'space-y-4';
    
    // Ultra-small screens (< 375px)
    if (deviceType === 'mobile' && viewport.width < 375) {
      return 'grid grid-cols-1 gap-3';
    }
    // Regular mobile (375px - 640px)
    else if (deviceType === 'mobile') {
      return 'grid grid-cols-1 gap-3 sm:gap-4';
    }
    // Tablet and desktop with improved spacing for all screen sizes
    else {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1920px] mx-auto" data-testid="metrics-breakdown" role="region" aria-label="Metrics breakdown analysis">
      {/* Enhanced Header with Controls */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Header Content */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`${deviceType === 'mobile' && viewport.width < 375 ? 'text-sm' : 'text-base'} sm:text-lg font-semibold text-white break-words`}>
                Detailed Metrics Analysis
              </h4>
              <p className={`${deviceType === 'mobile' && viewport.width < 375 ? 'text-[10px]' : 'text-xs'} sm:text-sm text-white/60 mt-0.5`}>
                Comprehensive breakdown of {sortedMetrics.length} key performance indicators
              </p>
            </div>
          </div>
          
          {/* Controls Container with better responsive layout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sort Options with better mobile accessibility */}
            <div className="flex items-center justify-center gap-0.5 p-0.5 bg-white/5 rounded-lg">
              {[
                { key: 'score', label: 'Score', icon: Award },
                { key: 'weight', label: 'Weight', icon: Target },
                { key: 'contribution', label: 'Impact', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortBy(key);
                    announce(`Sorted by ${label}`);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-md ${deviceType === 'mobile' && viewport.width < 375 ? 'text-[10px]' : 'text-xs'} sm:text-sm font-medium transition-all min-h-[36px] sm:min-h-[38px] ${touchTarget} ${
                    sortBy === key 
                      ? 'bg-white/15 text-white shadow-sm' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Sort by ${label}`}
                  aria-label={`Sort by ${label}`}
                  aria-pressed={sortBy === key}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className={`${deviceType === 'mobile' && viewport.width < 375 ? 'hidden' : 'hidden xs:inline'}`}>{label}</span>
                </button>
              ))}
            </div>
            
            {/* View Mode Toggle - Hidden on very small mobile screens */}
            <div className={`${deviceType === 'mobile' && viewport.width < 375 ? 'hidden' : 'hidden md:flex'} items-center justify-center gap-0.5 p-0.5 bg-white/5 rounded-lg`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center px-3 py-2 sm:px-3.5 sm:py-2 rounded-md text-xs sm:text-sm transition-all min-h-[36px] sm:min-h-[38px] ${touchTarget} ${
                  viewMode === 'grid' 
                    ? 'bg-white/15 text-white shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                aria-label="Grid view"
                title="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center px-3 py-2 sm:px-3.5 sm:py-2 rounded-md text-xs sm:text-sm transition-all min-h-[36px] sm:min-h-[38px] ${touchTarget} ${
                  viewMode === 'list' 
                    ? 'bg-white/15 text-white shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                aria-label="List view"
                title="List view"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h5 className="text-sm font-semibold text-blue-300 mb-2">Understanding Your Scores</h5>
            <p className="text-sm text-blue-200/90 leading-relaxed">
              Your <span className="font-medium text-blue-100">Comprehensive Score</span> is a weighted average out of 100, calculated from all metrics based on their importance. 
              Each metric contributes proportionally: <span className="font-medium text-blue-100">Contribution = Metric Score × Weight%</span>. 
              Higher weighted metrics have greater impact on your comprehensive score. Click on any metric for detailed insights and improvement strategies.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile-friendly layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mb-2 mx-auto" aria-hidden="true" />
          <div className="text-xs sm:text-sm font-semibold text-white/60 mb-1">Metrics</div>
          <div className="text-lg sm:text-xl font-bold text-blue-400">{sortedMetrics.length}</div>
        </div>
        
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mb-2 mx-auto" aria-hidden="true" />
          <div className="text-xs sm:text-sm font-semibold text-white/60 mb-1">Avg Score</div>
          <div className="text-lg sm:text-xl font-bold text-green-400">
            {Math.round(sortedMetrics.reduce((sum, m) => sum + m.value, 0) / sortedMetrics.length)}
          </div>
        </div>
        
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-2 mx-auto" aria-hidden="true" />
          <div className="text-xs sm:text-sm font-semibold text-white/60 mb-1">Weighted Score</div>
          <div className="text-lg sm:text-xl font-bold text-purple-400">
            {(() => {
              const totalWeightedScore = sortedMetrics.reduce((sum, m) => sum + m.weightedScore, 0);
              const totalWeight = sortedMetrics.reduce((sum, m) => sum + m.weight, 0);
              const comprehensiveScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
              return Math.min(100, Math.max(0, comprehensiveScore));
            })()}
          </div>
        </div>
        
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mb-2 mx-auto" aria-hidden="true" />
          <div className="text-xs sm:text-sm font-semibold text-white/60 mb-1">Top Score</div>
          <div className="text-lg sm:text-xl font-bold text-yellow-400">
            {Math.max(...sortedMetrics.map(m => m.value))}
          </div>
        </div>
      </div>

      {/* Metrics Grid with enhanced responsive layout */}
      <div 
        className={`${getResponsiveGridClasses()} relative`}
        role="list"
        aria-label="Detailed metrics list"
      >
        {sortedMetrics.map((metric, index) => (
          <div 
            key={metric.key}
            className="relative w-full min-w-0"
            style={{ 
              animationDelay: `${index * 50}ms`,
              contain: 'layout style'
            }}
          >
            <MetricCard
              metric={metric}
              isExpanded={expandedMetrics.has(metric.key)}
              onToggle={() => toggleMetric(metric.key)}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-gray-900/60 to-gray-800/40 border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-2 sm:mb-3">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">
            {Math.round(sortedMetrics.reduce((sum, m) => sum + m.value, 0) / sortedMetrics.length)}
          </div>
          <div className="text-[10px] sm:text-xs text-white/60">Average Score</div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-2 sm:mb-3">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-green-400 mb-0.5 sm:mb-1">
            {sortedMetrics.filter(m => m.value >= 70).length}
          </div>
          <div className="text-[10px] sm:text-xs text-white/60">Excellent</div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-2 sm:mb-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-yellow-400 mb-0.5 sm:mb-1">
            {sortedMetrics.filter(m => m.value >= 40 && m.value < 70).length}
          </div>
          <div className="text-[10px] sm:text-xs text-white/60">Good</div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 mb-2 sm:mb-3">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-red-400 mb-0.5 sm:mb-1">
            {sortedMetrics.filter(m => m.value < 40).length}
          </div>
          <div className="text-[10px] sm:text-xs text-white/60">Needs Work</div>
        </div>
      </div>
    </div>
  );
});

MetricBreakdown.displayName = 'MetricBreakdown';

export default MetricBreakdown; 