/**
 * Accessibility utility functions and hooks
 * Implements WCAG 2.1 AA compliance helpers
 */

import { useEffect, useRef, useState } from 'react';

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