/**
 * Responsive Design Utilities
 * Enterprise-grade responsive helpers for optimal mobile/tablet/desktop experience
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from './accessibility';

// Breakpoint definitions matching Tailwind config
export const BREAKPOINTS = {
  '2xs': 320,
  'xs': 375,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560
};

// Helper function to get breakpoint from width
const getBreakpointFromWidth = (width) => {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  if (width < BREAKPOINTS['3xl']) return '2xl';
  if (width < BREAKPOINTS['4xl']) return '3xl';
  return '4xl';
};

/**
 * Hook to detect current viewport size and breakpoint
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    return {
      width,
      height,
      breakpoint: getBreakpointFromWidth(width)
    };
  });

  useEffect(() => {
    // Check if window is available (for test environment)
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Double check window is still available
        if (typeof window !== 'undefined') {
          const width = window.innerWidth;
          const height = window.innerHeight;
          setViewport({
            width,
            height,
            breakpoint: getBreakpointFromWidth(width)
          });
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return viewport;
};

/**
 * Hook to check if current viewport matches a breakpoint
 */
export const useBreakpoint = (breakpoint) => {
  const { width } = useViewport();
  return width >= BREAKPOINTS[breakpoint];
};

/**
 * Hook to detect mobile/tablet/desktop
 */
export const useDeviceType = () => {
  const { width } = useViewport();
  
  return useMemo(() => {
    if (width < BREAKPOINTS.sm) return 'mobile';
    if (width < BREAKPOINTS.lg) return 'tablet';
    return 'desktop';
  }, [width]);
};

/**
 * Hook to detect touch device
 */
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    window.addEventListener('touchstart', () => setIsTouch(true), { once: true });
    window.addEventListener('mousemove', () => setIsTouch(false), { once: true });
  }, []);

  return isTouch;
};

/**
 * Hook for responsive images with lazy loading
 */
export const useResponsiveImage = (src, { 
  sizes = '100vw',
  loading = 'lazy',
  placeholder = '/placeholder.svg'
} = {}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = (e) => {
      setError(e);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { src: imageSrc, isLoading, error };
};

/**
 * Hook for responsive chart dimensions
 */
export const useChartDimensions = (containerRef, aspectRatio = 1) => {
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const { breakpoint } = useViewport();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = debounce(() => {
      const { width } = containerRef.current.getBoundingClientRect();
      const padding = breakpoint === 'mobile' ? 20 : breakpoint === 'tablet' ? 30 : 40;
      const maxWidth = width - padding;
      const height = maxWidth * aspectRatio;

      setDimensions({
        width: Math.min(maxWidth, 500),
        height: Math.min(height, 500)
      });
    }, 100);

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [aspectRatio, breakpoint]);

  return dimensions;
};

/**
 * Hook for intersection observer (for lazy loading)
 */
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return { isIntersecting, hasIntersected };
};

/**
 * Responsive class generator
 */
export const getResponsiveClasses = (classes) => {
  const { breakpoint } = useViewport();
  
  if (typeof classes === 'string') return classes;
  
  const defaults = classes.default || '';
  const current = classes[breakpoint] || '';
  
  return `${defaults} ${current}`.trim();
};

/**
 * Responsive padding/margin calculator
 */
export const getResponsiveSpacing = (base = 16) => {
  const { breakpoint } = useViewport();
  
  const multipliers = {
    '2xs': 0.5,
    'xs': 0.625,
    'sm': 0.75,
    'md': 0.875,
    'lg': 1,
    'xl': 1.125,
    '2xl': 1.25,
    '3xl': 1.375,
    '4xl': 1.5
  };
  
  return Math.round(base * (multipliers[breakpoint] || 1));
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) {
        // Performance warning: Component took over 100ms to render
      }
    };
  }, [componentName]);
};

/**
 * Orientation detection hook
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
};

/**
 * Safe area insets for notched devices
 */
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0')
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);

    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
};

/**
 * Network status hook for adaptive loading
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g'
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g'
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}; 

/**
 * Enhanced touch target hook for better mobile UX
 */
export const useTouchTarget = (size = 'default') => {
  const deviceType = useDeviceType();
  
  const touchSizes = {
    small: {
      mobile: 'min-h-[40px] min-w-[40px] p-2',
      tablet: 'min-h-[36px] min-w-[36px] p-1.5',
      desktop: 'min-h-[32px] min-w-[32px] p-1'
    },
    default: {
      mobile: 'min-h-[48px] min-w-[48px] p-3',
      tablet: 'min-h-[44px] min-w-[44px] p-2.5',
      desktop: 'min-h-[40px] min-w-[40px] p-2'
    },
    large: {
      mobile: 'min-h-[56px] min-w-[56px] p-4',
      tablet: 'min-h-[52px] min-w-[52px] p-3.5',
      desktop: 'min-h-[48px] min-w-[48px] p-3'
    }
  };

  return touchSizes[size][deviceType] || touchSizes[size].default;
};

/**
 * Responsive spacing hook for consistent component spacing
 */
export const useResponsiveSpacing = () => {
  const deviceType = useDeviceType();
  
  return {
    // Padding utilities
    p: {
      xs: deviceType === 'mobile' ? 'p-2' : deviceType === 'tablet' ? 'p-3' : 'p-4',
      sm: deviceType === 'mobile' ? 'p-3' : deviceType === 'tablet' ? 'p-4' : 'p-5',
      md: deviceType === 'mobile' ? 'p-4' : deviceType === 'tablet' ? 'p-5' : 'p-6',
      lg: deviceType === 'mobile' ? 'p-5' : deviceType === 'tablet' ? 'p-6' : 'p-8',
      xl: deviceType === 'mobile' ? 'p-6' : deviceType === 'tablet' ? 'p-8' : 'p-10'
    },
    // Margin utilities
    m: {
      xs: deviceType === 'mobile' ? 'm-2' : deviceType === 'tablet' ? 'm-3' : 'm-4',
      sm: deviceType === 'mobile' ? 'm-3' : deviceType === 'tablet' ? 'm-4' : 'm-5',
      md: deviceType === 'mobile' ? 'm-4' : deviceType === 'tablet' ? 'm-5' : 'm-6',
      lg: deviceType === 'mobile' ? 'm-5' : deviceType === 'tablet' ? 'm-6' : 'm-8',
      xl: deviceType === 'mobile' ? 'm-6' : deviceType === 'tablet' ? 'm-8' : 'm-10'
    },
    // Gap utilities
    gap: {
      xs: deviceType === 'mobile' ? 'gap-2' : deviceType === 'tablet' ? 'gap-3' : 'gap-4',
      sm: deviceType === 'mobile' ? 'gap-3' : deviceType === 'tablet' ? 'gap-4' : 'gap-5',
      md: deviceType === 'mobile' ? 'gap-4' : deviceType === 'tablet' ? 'gap-5' : 'gap-6',
      lg: deviceType === 'mobile' ? 'gap-5' : deviceType === 'tablet' ? 'gap-6' : 'gap-8',
      xl: deviceType === 'mobile' ? 'gap-6' : deviceType === 'tablet' ? 'gap-8' : 'gap-10'
    }
  };
};

/**
 * Enhanced responsive grid hook for better layout control
 */
export const useResponsiveGrid = (columns = { mobile: 1, tablet: 2, desktop: 3 }) => {
  const deviceType = useDeviceType();
  const { width } = useViewport();
  
  // Enhanced breakpoint detection
  const getGridColumns = () => {
    if (deviceType === 'mobile' || width < 640) {
      return `grid-cols-${columns.mobile}`;
    } else if (deviceType === 'tablet' || width < 1024) {
      return `grid-cols-${columns.tablet}`;
    } else {
      return `grid-cols-${columns.desktop}`;
    }
  };

  return {
    gridClasses: getGridColumns(),
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop'
  };
};

/**
 * Responsive typography hook for consistent text scaling
 */
export const useResponsiveText = () => {
  const deviceType = useDeviceType();
  
  return {
    // Display text
    display: {
      xs: deviceType === 'mobile' ? 'text-2xl' : deviceType === 'tablet' ? 'text-3xl' : 'text-4xl',
      sm: deviceType === 'mobile' ? 'text-3xl' : deviceType === 'tablet' ? 'text-4xl' : 'text-5xl',
      md: deviceType === 'mobile' ? 'text-4xl' : deviceType === 'tablet' ? 'text-5xl' : 'text-6xl',
      lg: deviceType === 'mobile' ? 'text-5xl' : deviceType === 'tablet' ? 'text-6xl' : 'text-7xl',
      xl: deviceType === 'mobile' ? 'text-6xl' : deviceType === 'tablet' ? 'text-7xl' : 'text-8xl'
    },
    // Heading text
    heading: {
      h1: deviceType === 'mobile' ? 'text-xl' : deviceType === 'tablet' ? 'text-2xl' : 'text-3xl',
      h2: deviceType === 'mobile' ? 'text-lg' : deviceType === 'tablet' ? 'text-xl' : 'text-2xl',
      h3: deviceType === 'mobile' ? 'text-base' : deviceType === 'tablet' ? 'text-lg' : 'text-xl',
      h4: deviceType === 'mobile' ? 'text-sm' : deviceType === 'tablet' ? 'text-base' : 'text-lg',
      h5: deviceType === 'mobile' ? 'text-xs' : deviceType === 'tablet' ? 'text-sm' : 'text-base',
      h6: deviceType === 'mobile' ? 'text-xs' : deviceType === 'tablet' ? 'text-xs' : 'text-sm'
    },
    // Body text
    body: {
      xs: deviceType === 'mobile' ? 'text-xs' : 'text-xs',
      sm: deviceType === 'mobile' ? 'text-sm' : 'text-sm',
      base: deviceType === 'mobile' ? 'text-sm' : deviceType === 'tablet' ? 'text-base' : 'text-base',
      lg: deviceType === 'mobile' ? 'text-base' : deviceType === 'tablet' ? 'text-lg' : 'text-lg',
      xl: deviceType === 'mobile' ? 'text-lg' : deviceType === 'tablet' ? 'text-xl' : 'text-xl'
    }
  };
};

/**
 * Enhanced responsive button hook
 */
export const useResponsiveButton = (variant = 'default') => {
  const deviceType = useDeviceType();
  const touchTarget = useTouchTarget();
  
  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${touchTarget}`;
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
  };

  const textSize = deviceType === 'mobile' ? 'text-sm' : 'text-sm sm:text-base';
  
  return `${baseClasses} ${variants[variant]} ${textSize}`;
};

/**
 * Responsive modal hook for better mobile modal experience
 */
export const useResponsiveModal = () => {
  const deviceType = useDeviceType();
  const { width, height } = useViewport();
  
  return {
    containerClasses: deviceType === 'mobile' 
      ? 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4'
      : 'fixed inset-0 z-50 flex items-center justify-center p-4',
    modalClasses: deviceType === 'mobile'
      ? 'w-full max-h-[90vh] bg-gray-900 border-t border-white/10 rounded-t-2xl sm:rounded-2xl sm:max-w-lg sm:w-full'
      : 'w-full max-w-2xl max-h-[90vh] bg-gray-900 border border-white/10 rounded-2xl',
    backdropClasses: 'fixed inset-0 bg-black/50 backdrop-blur-sm'
  };
};

/**
 * Responsive card hook for consistent card layouts
 */
export const useResponsiveCard = (size = 'default') => {
  const spacing = useResponsiveSpacing();
  const deviceType = useDeviceType();
  
  const sizes = {
    compact: `${spacing.p.xs} rounded-lg`,
    default: `${spacing.p.sm} rounded-xl`,
    large: `${spacing.p.md} rounded-2xl`
  };
  
  const baseClasses = 'bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300';
  const hoverClasses = deviceType !== 'mobile' ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-lg' : '';
  
  return `${baseClasses} ${sizes[size]} ${hoverClasses}`;
}; 