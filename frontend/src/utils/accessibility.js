/**
 * Accessibility utility functions and hooks
 * Implements WCAG 2.1 AA compliance helpers
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to manage focus trap within a container
 * @param {boolean} isActive - Whether the focus trap is active
 * @returns {Object} ref - Ref to attach to the container element
 */
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstFocusable?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook to announce dynamic content changes to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');
  const announcementRef = useRef(null);

  useEffect(() => {
    if (!announcementRef.current) {
      const div = document.createElement('div');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      div.className = 'sr-only';
      document.body.appendChild(div);
      announcementRef.current = div;
    }

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (announcement && announcementRef.current) {
      announcementRef.current.textContent = announcement;
      // Clear after announcement
      const timer = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  return setAnnouncement;
};

/**
 * Check if color contrast meets WCAG AA standards
 * @param {string} foreground - Foreground color in hex
 * @param {string} background - Background color in hex
 * @returns {Object} - Contrast ratio and compliance levels
 */
export const checkColorContrast = (foreground, background) => {
  const getLuminance = (hexColor) => {
    const rgb = hexColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!rgb) return 0;
    
    const [, r, g, b] = rgb.map(x => parseInt(x, 16) / 255);
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: contrast.toFixed(2),
    normalTextAA: contrast >= 4.5,
    normalTextAAA: contrast >= 7,
    largeTextAA: contrast >= 3,
    largeTextAAA: contrast >= 4.5,
  };
};

/**
 * Hook to manage keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to handlers
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      let shortcutKey = '';
      if (ctrl) shortcutKey += 'ctrl+';
      if (shift) shortcutKey += 'shift+';
      if (alt) shortcutKey += 'alt+';
      shortcutKey += key;

      if (shortcuts[shortcutKey]) {
        e.preventDefault();
        shortcuts[shortcutKey](e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

/**
 * Generate unique ID for form elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hook to detect user's preferred reduced motion setting
 * @returns {boolean} - Whether user prefers reduced motion
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Debounce function for input handlers
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Screen reader only CSS class
 */
export const srOnly = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Get ARIA attributes for interactive elements
 * @param {Object} props - Component props
 * @returns {Object} - ARIA attributes
 */
export const getAriaProps = ({
  label,
  describedBy,
  expanded,
  controls,
  pressed,
  current,
  invalid,
  required,
  disabled,
  hidden,
  live,
  role
}) => {
  const ariaProps = {};
  
  if (label) ariaProps['aria-label'] = label;
  if (describedBy) ariaProps['aria-describedby'] = describedBy;
  if (expanded !== undefined) ariaProps['aria-expanded'] = expanded;
  if (controls) ariaProps['aria-controls'] = controls;
  if (pressed !== undefined) ariaProps['aria-pressed'] = pressed;
  if (current) ariaProps['aria-current'] = current;
  if (invalid !== undefined) ariaProps['aria-invalid'] = invalid;
  if (required !== undefined) ariaProps['aria-required'] = required;
  if (disabled !== undefined) ariaProps['aria-disabled'] = disabled;
  if (hidden !== undefined) ariaProps['aria-hidden'] = hidden;
  if (live) ariaProps['aria-live'] = live;
  if (role) ariaProps['role'] = role;
  
  return ariaProps;
}; 

/**
 * Generate comprehensive screen reader description for score breakdown data
 * @param {Object} breakdown - Score breakdown data
 * @param {Object} weights - Metric weights
 * @returns {string} - Detailed description for screen readers
 */
export const generateScoreBreakdownDescription = (breakdown, weights) => {
  if (!breakdown || !weights || Object.keys(breakdown).length === 0) {
    return 'No score breakdown data available';
  }

  const metrics = Object.entries(breakdown).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    score: Math.round(value),
    weight: Math.round((weights[key] || 0) * 100),
    contribution: Math.round(value * (weights[key] || 0))
  }));

  // Sort by score for better narrative flow
  metrics.sort((a, b) => b.score - a.score);

  const totalMetrics = metrics.length;
  const avgScore = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / totalMetrics);
  const totalContribution = metrics.reduce((sum, m) => sum + m.contribution, 0);
  const topMetric = metrics[0];
  const lowestMetric = metrics[metrics.length - 1];
  
  const excellentCount = metrics.filter(m => m.score >= 80).length;
  const goodCount = metrics.filter(m => m.score >= 60 && m.score < 80).length;
  const needsWorkCount = metrics.filter(m => m.score < 60).length;

  let description = `Score breakdown analysis showing ${totalMetrics} performance metrics. `;
  description += `Overall average score is ${avgScore} out of 100. `;
  description += `Total weighted contribution is ${Math.round(totalContribution)} points. `;
  
  if (excellentCount > 0) {
    description += `${excellentCount} metric${excellentCount > 1 ? 's' : ''} performing excellently (80 or above). `;
  }
  if (goodCount > 0) {
    description += `${goodCount} metric${goodCount > 1 ? 's' : ''} performing well (60-79). `;
  }
  if (needsWorkCount > 0) {
    description += `${needsWorkCount} metric${needsWorkCount > 1 ? 's' : ''} need${needsWorkCount === 1 ? 's' : ''} improvement (below 60). `;
  }

  description += `Top performing metric: ${topMetric.name} with ${topMetric.score} points and ${topMetric.weight}% weight contributing ${topMetric.contribution} points. `;
  description += `Lowest performing metric: ${lowestMetric.name} with ${lowestMetric.score} points and ${lowestMetric.weight}% weight contributing ${lowestMetric.contribution} points.`;

  return description;
};

/**
 * Generate radar chart accessibility description
 * @param {Array} radarData - Processed radar chart data
 * @returns {string} - Chart description for screen readers
 */
export const generateRadarChartDescription = (radarData) => {
  if (!radarData || radarData.length === 0) {
    return 'No radar chart data available';
  }

  const sortedData = [...radarData].sort((a, b) => b.value - a.value);
  const avgValue = Math.round(radarData.reduce((sum, d) => sum + d.value, 0) / radarData.length);
  const maxValue = sortedData[0];
  const minValue = sortedData[sortedData.length - 1];

  let description = `Interactive radar chart displaying ${radarData.length} metrics in a circular visualization. `;
  description += `Average score across all metrics is ${avgValue}. `;
  description += `Highest score: ${maxValue.axis} at ${Math.round(maxValue.value)} out of 100. `;
  description += `Lowest score: ${minValue.axis} at ${Math.round(minValue.value)} out of 100. `;
  description += `Use arrow keys to navigate between data points. Press Enter or Space to hear individual values.`;

  return description;
};

/**
 * Generate metric improvement suggestions for screen readers
 * @param {Object} metric - Individual metric data
 * @returns {string} - Improvement suggestions
 */
export const generateMetricImprovementSuggestion = (metric) => {
  if (!metric) return '';

  const score = Math.round(metric.value);
  let suggestion = `${metric.label || metric.axis} scored ${score} out of 100. `;
  
  if (score >= 80) {
    suggestion += 'Excellent performance. Continue current practices to maintain this high standard.';
  } else if (score >= 60) {
    suggestion += 'Good performance with room for improvement. ';
    if (metric.tips) {
      suggestion += `Focus on: ${metric.tips}`;
    }
  } else if (score >= 40) {
    suggestion += 'Moderate performance requiring attention. ';
    if (metric.tips) {
      suggestion += `Priority improvements: ${metric.tips}`;
    }
  } else {
    suggestion += 'Low performance requiring immediate attention. ';
    if (metric.tips) {
      suggestion += `Critical improvements needed: ${metric.tips}`;
    }
  }

  if (metric.weight) {
    const weight = Math.round(metric.weight * 100);
    const contribution = Math.round(metric.value * metric.weight);
    suggestion += ` This metric has ${weight}% weight in overall scoring, contributing ${contribution} points.`;
  }

  return suggestion;
};

/**
 * Hook for dynamic content announcements with rate limiting
 * @param {number} delay - Delay between announcements in milliseconds
 * @returns {Function} - Throttled announcement function
 */
export const useThrottledAnnouncement = (delay = 1000) => {
  const announce = useAnnouncement();
  const lastAnnouncementRef = useRef(0);

  return useCallback((message) => {
    const now = Date.now();
    if (now - lastAnnouncementRef.current >= delay) {
      announce(message);
      lastAnnouncementRef.current = now;
    }
  }, [announce, delay]);
};

/**
 * Generate accessible data table description from breakdown data
 * @param {Object} breakdown - Score breakdown data
 * @param {Object} weights - Metric weights
 * @returns {string} - Table description for screen readers
 */
export const generateAccessibleTableDescription = (breakdown, weights) => {
  if (!breakdown || !weights) return '';

  const metrics = Object.entries(breakdown).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    score: Math.round(value),
    weight: Math.round((weights[key] || 0) * 100),
    contribution: Math.round(value * (weights[key] || 0))
  }));

  let description = `Data table with ${metrics.length} rows and 4 columns: Metric Name, Score, Weight Percentage, and Contribution Points. `;
  
  metrics.forEach((metric, index) => {
    description += `Row ${index + 1}: ${metric.name}, score ${metric.score}, weight ${metric.weight} percent, contribution ${metric.contribution} points. `;
  });

  return description;
};

/**
 * Enhanced keyboard navigation announcement helper
 * @param {number} currentIndex - Current focused index
 * @param {number} totalItems - Total number of items
 * @param {string} itemType - Type of items being navigated
 * @returns {string} - Navigation status announcement
 */
export const generateNavigationAnnouncement = (currentIndex, totalItems, itemType = 'item') => {
  const position = currentIndex + 1;
  return `${itemType} ${position} of ${totalItems}`;
};

/**
 * Color contrast checker for dynamic content
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @param {string} elementType - Type of element for context
 * @returns {Object} - Accessibility compliance information
 */
export const checkDynamicContrast = (foreground, background, elementType = 'text') => {
  const contrast = checkColorContrast(foreground, background);
  const isLargeText = elementType.includes('heading') || elementType.includes('large');
  
  const meetsAA = isLargeText ? contrast.largeTextAA : contrast.normalTextAA;
  const meetsAAA = isLargeText ? contrast.largeTextAAA : contrast.normalTextAAA;

  return {
    ...contrast,
    meetsAA,
    meetsAAA,
    recommendation: meetsAAA ? 'Excellent contrast' : 
                   meetsAA ? 'Good contrast' : 
                   'Insufficient contrast - consider adjusting colors'
  };
}; 