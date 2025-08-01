import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorMessage from '../components/ErrorMessage'

describe('ErrorMessage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders error message', () => {
      const errorMessage = 'Something went wrong'
      render(<ErrorMessage message={errorMessage} />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    test('renders with default error icon', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const icon = container.querySelector('.lucide-alert-circle')
      expect(icon).toBeInTheDocument()
    })

    test('renders retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /Try Again/i })
      expect(retryButton).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      render(<ErrorMessage message="" />)
      
      expect(screen.getAllByText('').length).toBeGreaterThan(0)
    })

    test('handles missing message prop', () => {
      expect(() => {
        render(<ErrorMessage />)
      }).not.toThrow()
    })

    test('does not render retry button when onRetry is not provided', () => {
      render(<ErrorMessage message="Test error" />)
      
      const retryButton = screen.queryByRole('button', { name: /Try Again/i })
      expect(retryButton).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<ErrorMessage message="Test error" />)
      
      const errorElement = screen.getByText('Test error').closest('.card-glass')
      expect(errorElement).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    test('applies error styling classes', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const errorContainer = container.querySelector('.card-glass')
      expect(errorContainer).toBeInTheDocument()
      
      const borderElement = container.querySelector('.border-red-400\\/50')
      expect(borderElement).toBeInTheDocument()
    })
  })
}) 