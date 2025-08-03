import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorMessage from '../components/ErrorMessage'

describe('ErrorMessage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders error message text', () => {
      const errorMessage = 'Something went wrong'
      render(<ErrorMessage message={errorMessage} />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    test('renders error title', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByRole('heading', { level: 3, name: 'Analysis Failed' })).toBeInTheDocument()
    })

    test('renders with error icon', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const icon = container.querySelector('.lucide-alert-circle')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    test('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /Try Again/i })
      expect(retryButton).toBeInTheDocument()
    })

    test('renders retry button with refresh icon', () => {
      const onRetry = vi.fn()
      const { container } = render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const refreshIcon = container.querySelector('.lucide-refresh-cw')
      expect(refreshIcon).toBeInTheDocument()
    })
  })

  describe('Troubleshooting Section', () => {
    test('renders troubleshooting tips heading', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByRole('heading', { level: 4, name: 'Troubleshooting Tips:' })).toBeInTheDocument()
    })

    test('renders all troubleshooting tips', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByText(/Ensure the repository URL is correct/i)).toBeInTheDocument()
      expect(screen.getByText(/Check that the repository exists/i)).toBeInTheDocument()
      expect(screen.getByText(/Try again in a few moments/i)).toBeInTheDocument()
      expect(screen.getByText(/Make sure you have a stable internet/i)).toBeInTheDocument()
    })

    test('renders troubleshooting tips as a list', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const list = container.querySelector('ul')
      expect(list).toBeInTheDocument()
      
      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(4)
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      render(<ErrorMessage message="" />)
      
      // Should still render the structure even with empty message
      expect(screen.getByRole('heading', { level: 3, name: 'Analysis Failed' })).toBeInTheDocument()
    })

    test('handles missing message prop gracefully', () => {
      expect(() => {
        render(<ErrorMessage />)
      }).not.toThrow()
    })

    test('does not render retry button when onRetry is not provided', () => {
      render(<ErrorMessage message="Test error" />)
      
      const retryButton = screen.queryByRole('button', { name: /Try Again/i })
      expect(retryButton).not.toBeInTheDocument()
    })

    test('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /Try Again/i })
      retryButton.click()
      
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes for retry button', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /Try Again/i })
      expect(retryButton).toHaveAttribute('aria-describedby', 'error-description')
    })

    test('has screen reader description for retry button', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const description = screen.getByText('Click to retry the repository analysis')
      expect(description).toHaveClass('sr-only')
      expect(description).toHaveAttribute('id', 'error-description')
    })

    test('error icon has aria-hidden attribute', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const icon = container.querySelector('.lucide-alert-circle')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Styling and Layout', () => {
    test('applies error styling classes', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const errorContainer = container.querySelector('.card-glass')
      expect(errorContainer).toBeInTheDocument()
      
      const borderElement = container.querySelector('.border-red-400\\/50')
      expect(borderElement).toBeInTheDocument()
    })

    test('has proper layout structure', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      // Check for main flex container
      const flexContainer = container.querySelector('.flex.items-start.gap-3')
      expect(flexContainer).toBeInTheDocument()
      
      // Check for troubleshooting section
      const troubleshootingSection = container.querySelector('.card-content')
      expect(troubleshootingSection).toBeInTheDocument()
    })

    test('applies correct text styling', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const title = container.querySelector('.text-lg.font-semibold.text-white')
      expect(title).toBeInTheDocument()
      
      const messageText = container.querySelector('.text-white\\/80')
      expect(messageText).toBeInTheDocument()
    })

    test('retry button has proper styling classes', () => {
      const onRetry = vi.fn()
      const { container } = render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const retryButton = container.querySelector('.btn-secondary')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveClass('flex', 'items-center', 'gap-2')
    })
  })
}) 