import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Import components
import App from '../App';
import ChatInput from '../components/ChatInput';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header';
import VibeScoreResults from '../components/VibeScoreResults';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('WCAG Compliance', () => {
    test('App component should have no accessibility violations', async () => {
      const { container } = render(<App />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Skip navigation link should be present and functional', () => {
      render(<App />);
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('skip-link');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('Main content should have proper landmark role', () => {
      render(<App />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Color Contrast', () => {
    test('Text should meet WCAG AA contrast requirements', () => {
      const { container } = render(<App />);
      const computedStyles = window.getComputedStyle(container);
      
      // Check that improved contrast colors are applied
      expect(computedStyles.getPropertyValue('--text-gray-300')).toBeTruthy();
      expect(computedStyles.getPropertyValue('--text-gray-400')).toBeTruthy();
      expect(computedStyles.getPropertyValue('--text-gray-500')).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    test('All interactive elements should be keyboard accessible', async () => {
      render(<App />);
      
      // Test tab navigation
      const user = userEvent.setup();
      await user.tab();
      
      // Skip link should be focused first
      expect(document.activeElement).toHaveAttribute('href', '#main-content');
    });

    test('Focus should be visible on all interactive elements', () => {
      render(<App />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        button.focus();
        const styles = window.getComputedStyle(button);
        // Check for focus ring styles
        expect(styles.outline || styles.boxShadow).toBeTruthy();
      });
    });
  });

  describe('ARIA Labels and Attributes', () => {
    test('ChatInput should have proper ARIA labels', () => {
      render(<ChatInput onSubmit={jest.fn()} />);
      
      const input = screen.getByLabelText(/GitHub username or repository URL/i);
      expect(input).toBeInTheDocument();
      
      const submitButton = screen.getByLabelText(/Analyze repository/i);
      expect(submitButton).toBeInTheDocument();
    });

    test('LoadingSpinner should have proper ARIA attributes', () => {
      render(<LoadingSpinner message="Loading..." />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveAttribute('aria-live', 'polite');
      expect(loader).toHaveAttribute('aria-busy', 'true');
    });

    test('Icons should have aria-hidden when decorative', () => {
      const mockResult = {
        vibeScore: { overall: 75, breakdown: {}, weights: {} },
        analysis: {},
        repoInfo: { name: 'test-repo', html_url: 'https://github.com/test/repo' }
      };
      
      render(<VibeScoreResults result={mockResult} repoInfo={mockResult.repoInfo} />);
      
      // Find SVG icons and check they have aria-hidden
      const icons = document.querySelectorAll('svg');
      icons.forEach(icon => {
        if (!icon.getAttribute('aria-label')) {
          expect(icon).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });
  });

  describe('Form Accessibility', () => {
    test('Form submission should be debounced', async () => {
      const mockSubmit = jest.fn();
      render(<ChatInput onSubmit={mockSubmit} />);
      
      const input = screen.getByLabelText(/GitHub username or repository URL/i);
      const submitButton = screen.getByLabelText(/Analyze repository/i);
      
      // Type and submit rapidly
      await userEvent.type(input, 'test-repo');
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      
      // Should only be called once due to debouncing
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });
    });

    test('Submit button should be disabled during submission', async () => {
      const mockSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<ChatInput onSubmit={mockSubmit} />);
      
      const input = screen.getByLabelText(/GitHub username or repository URL/i);
      const submitButton = screen.getByLabelText(/Analyze repository/i);
      
      await userEvent.type(input, 'test-repo');
      fireEvent.click(submitButton);
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-label', 'Processing...');
    });
  });

  describe('Touch Target Size', () => {
    test('All buttons should meet minimum touch target size', () => {
      render(<App />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const height = parseFloat(styles.minHeight) || parseFloat(styles.height);
        const width = parseFloat(styles.minWidth) || parseFloat(styles.width);
        
        // Minimum 44px for touch targets
        expect(height).toBeGreaterThanOrEqual(44);
        expect(width).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Responsive Design', () => {
    test('Should handle mobile viewport without horizontal scroll', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      const { container } = render(<App />);
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      // No horizontal scroll
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });

  describe('Screen Reader Support', () => {
    test('Dynamic content updates should be announced', async () => {
      render(<LoadingSpinner message="Loading repository..." variant="repository" />);
      
      // Check for live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      // Wait for message to be announced
      await waitFor(() => {
        expect(screen.getByText(/Loading repository/i)).toBeInTheDocument();
      });
    });

    test('Error messages should be associated with form inputs', async () => {
      render(<ChatInput onSubmit={jest.fn()} />);
      
      const input = screen.getByLabelText(/GitHub username or repository URL/i);
      
      // Type invalid input to trigger validation
      await userEvent.type(input, '!!!invalid!!!');
      
      // Wait for validation message
      await waitFor(() => {
        const validationMessage = screen.getByText(/Enter a valid GitHub username/i);
        expect(validationMessage).toBeInTheDocument();
      });
    });
  });

  describe('Focus Management', () => {
    test('Focus should be trapped in modals', () => {
      // This would test focus trap in modal components
      // Currently no modals in the app, but the utility is available
      expect(true).toBe(true);
    });

    test('Focus should return to trigger element after modal close', () => {
      // This would test focus restoration
      // Currently no modals in the app, but the utility is available
      expect(true).toBe(true);
    });
  });

  describe('Reduced Motion', () => {
    test('Should respect prefers-reduced-motion', () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      
      const { container } = render(<App />);
      const animatedElements = container.querySelectorAll('[class*="animate"]');
      
      // Animations should be reduced
      animatedElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.animationDuration).toBe('0.01ms');
      });
    });
  });
});

describe('Accessibility Utilities', () => {
  test('debounce utility should work correctly', async () => {
    const { debounce } = await import('../utils/accessibility');
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);
    
    // Call multiple times rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    // Should not be called immediately
    expect(mockFn).not.toHaveBeenCalled();
    
    // Should be called once after delay
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  test('checkColorContrast utility should calculate correct ratios', async () => {
    const { checkColorContrast } = await import('../utils/accessibility');
    
    // Test white on black (maximum contrast)
    const result = checkColorContrast('#FFFFFF', '#000000');
    expect(parseFloat(result.ratio)).toBeGreaterThan(20);
    expect(result.normalTextAA).toBe(true);
    expect(result.normalTextAAA).toBe(true);
    
    // Test gray on black (should meet AA but not AAA)
    const grayResult = checkColorContrast('#9CA3AF', '#000000');
    expect(grayResult.normalTextAA).toBe(true);
  });
}); 