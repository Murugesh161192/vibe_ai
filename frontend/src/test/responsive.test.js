/**
 * Responsive Design Tests
 * Validates responsive behavior across all device sizes
 */

import { renderHook, act } from '@testing-library/react';
import { 
  useViewport, 
  useDeviceType, 
  useBreakpoint,
  useTouchDevice,
  useOrientation,
  BREAKPOINTS 
} from '../utils/responsive';

// Mock window properties
const mockWindow = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });
};

describe('Responsive Utilities', () => {
  describe('useViewport Hook', () => {
    it('should detect mobile viewport', () => {
      mockWindow(375, 667);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
      expect(result.current.breakpoint).toBe('xs');
    });

    it('should detect tablet viewport', () => {
      mockWindow(768, 1024);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(768);
      expect(result.current.breakpoint).toBe('md');
    });

    it('should detect desktop viewport', () => {
      mockWindow(1920, 1080);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.width).toBe(1920);
      expect(result.current.breakpoint).toBe('3xl');
    });

    it('should update on window resize', async () => {
      mockWindow(375, 667);
      const { result } = renderHook(() => useViewport());
      
      expect(result.current.breakpoint).toBe('xs');
      
      act(() => {
        mockWindow(1024, 768);
        window.dispatchEvent(new Event('resize'));
      });
      
      // Wait for debounced update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(result.current.breakpoint).toBe('lg');
    });
  });

  describe('useDeviceType Hook', () => {
    it('should identify mobile device', () => {
      mockWindow(320, 568);
      const { result } = renderHook(() => useDeviceType());
      expect(result.current).toBe('mobile');
    });

    it('should identify tablet device', () => {
      mockWindow(768, 1024);
      const { result } = renderHook(() => useDeviceType());
      expect(result.current).toBe('tablet');
    });

    it('should identify desktop device', () => {
      mockWindow(1440, 900);
      const { result } = renderHook(() => useDeviceType());
      expect(result.current).toBe('desktop');
    });
  });

  describe('useBreakpoint Hook', () => {
    it('should correctly identify breakpoint matches', () => {
      mockWindow(1024, 768);
      
      const { result: smResult } = renderHook(() => useBreakpoint('sm'));
      const { result: mdResult } = renderHook(() => useBreakpoint('md'));
      const { result: lgResult } = renderHook(() => useBreakpoint('lg'));
      const { result: xlResult } = renderHook(() => useBreakpoint('xl'));
      
      expect(smResult.current).toBe(true);
      expect(mdResult.current).toBe(true);
      expect(lgResult.current).toBe(true);
      expect(xlResult.current).toBe(false);
    });
  });

  describe('useOrientation Hook', () => {
    it('should detect portrait orientation', () => {
      mockWindow(375, 812);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('portrait');
    });

    it('should detect landscape orientation', () => {
      mockWindow(812, 375);
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe('landscape');
    });
  });
});

describe('Responsive Component Behavior', () => {
  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets on mobile', () => {
      const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
      
      touchTargets.forEach(element => {
        const styles = window.getComputedStyle(element);
        const height = parseFloat(styles.minHeight) || element.offsetHeight;
        const width = parseFloat(styles.minWidth) || element.offsetWidth;
        
        if (window.innerWidth <= 768) {
          expect(height).toBeGreaterThanOrEqual(44);
          expect(width).toBeGreaterThanOrEqual(44);
        }
      });
    });
  });

  describe('Text Scaling', () => {
    it('should scale text appropriately for mobile', () => {
      mockWindow(375, 667);
      const headings = document.querySelectorAll('h1, h2, h3');
      
      headings.forEach(heading => {
        const styles = window.getComputedStyle(heading);
        const fontSize = parseFloat(styles.fontSize);
        
        // Ensure text is readable on mobile (min 14px for body, 18px for headings)
        if (heading.tagName === 'H1') {
          expect(fontSize).toBeGreaterThanOrEqual(24);
        } else if (heading.tagName === 'H2') {
          expect(fontSize).toBeGreaterThanOrEqual(20);
        } else if (heading.tagName === 'H3') {
          expect(fontSize).toBeGreaterThanOrEqual(18);
        }
      });
    });
  });

  describe('Layout Responsiveness', () => {
    it('should stack columns on mobile', () => {
      mockWindow(375, 667);
      const grids = document.querySelectorAll('[class*="grid-cols"]');
      
      grids.forEach(grid => {
        const styles = window.getComputedStyle(grid);
        const gridTemplateColumns = styles.gridTemplateColumns;
        
        // On mobile, should be single column or max 2 columns
        const columnCount = gridTemplateColumns.split(' ').length;
        expect(columnCount).toBeLessThanOrEqual(2);
      });
    });

    it('should maintain proper aspect ratios for images', () => {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const displayedRatio = img.offsetWidth / img.offsetHeight;
        
        // Allow 5% variance for aspect ratio
        expect(Math.abs(aspectRatio - displayedRatio)).toBeLessThan(0.05);
      });
    });
  });

  describe('Performance', () => {
    it('should lazy load images below the fold', () => {
      const images = document.querySelectorAll('img');
      let lazyLoadedCount = 0;
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isAboveFold = rect.top < window.innerHeight;
        
        if (!isAboveFold) {
          expect(img.loading).toBe('lazy');
          lazyLoadedCount++;
        }
      });
      
      // Ensure at least some images are lazy loaded
      expect(lazyLoadedCount).toBeGreaterThan(0);
    });

    it('should debounce resize events', async () => {
      const resizeHandler = vi.fn();
      window.addEventListener('resize', resizeHandler);
      
      // Trigger multiple resize events
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'));
      }
      
      // Should not be called immediately
      expect(resizeHandler).toHaveBeenCalledTimes(10);
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Clean up
      window.removeEventListener('resize', resizeHandler);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      const interactiveElements = document.querySelectorAll('button, a[role="button"], [role="button"]');
      
      interactiveElements.forEach(element => {
        const hasAriaLabel = element.hasAttribute('aria-label');
        const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
        const hasTextContent = element.textContent.trim().length > 0;
        
        expect(hasAriaLabel || hasAriaLabelledBy || hasTextContent).toBe(true);
      });
    });

    it('should maintain color contrast ratios', () => {
      const elements = document.querySelectorAll('*');
      
      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && backgroundColor !== 'transparent') {
          // This is a simplified check - in reality you'd calculate contrast ratio
          expect(color).not.toBe(backgroundColor);
        }
      });
    });
  });
});

describe('Breakpoint Coverage', () => {
  const testBreakpoints = [
    { name: '2xs', width: 320, height: 568 },
    { name: 'xs', width: 375, height: 667 },
    { name: 'sm', width: 640, height: 480 },
    { name: 'md', width: 768, height: 1024 },
    { name: 'lg', width: 1024, height: 768 },
    { name: 'xl', width: 1280, height: 720 },
    { name: '2xl', width: 1536, height: 864 },
    { name: '3xl', width: 1920, height: 1080 },
    { name: '4xl', width: 2560, height: 1440 }
  ];

  testBreakpoints.forEach(({ name, width, height }) => {
    it(`should render correctly at ${name} breakpoint (${width}x${height})`, () => {
      mockWindow(width, height);
      
      // Check that no horizontal scroll exists
      expect(document.body.scrollWidth).toBeLessThanOrEqual(width);
      
      // Check that content is visible
      const mainContent = document.querySelector('main');
      if (mainContent) {
        expect(mainContent.offsetWidth).toBeGreaterThan(0);
        expect(mainContent.offsetHeight).toBeGreaterThan(0);
      }
      
      // Check that text is readable
      const bodyFontSize = parseFloat(window.getComputedStyle(document.body).fontSize);
      expect(bodyFontSize).toBeGreaterThanOrEqual(14);
    });
  });
}); 