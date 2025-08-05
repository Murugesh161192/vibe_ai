import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorMessage from '../components/ErrorMessage'

describe('ErrorMessage Component', () => {
  describe('Initial Render', () => {
    test('renders error message correctly', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    test('renders with error icon', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const icon = container.querySelector('.icon-lg')
      expect(icon).toBeInTheDocument()
    })

    test('renders error title', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByRole('heading', { level: 3, name: 'Something went wrong' })).toBeInTheDocument()
    })
  })

  describe('Error Type Handling', () => {
    test('renders network error type correctly', () => {
      render(<ErrorMessage message="Connection failed" errorType="network" />)
      
      expect(screen.getByRole('heading', { level: 3, name: 'Connection Error' })).toBeInTheDocument()
    })

    test('renders not found error type correctly', () => {
      render(<ErrorMessage message="Repository not found" errorType="not-found" />)
      
      expect(screen.getByRole('heading', { level: 3, name: 'Not Found' })).toBeInTheDocument()
    })

    test('renders rate limit error type correctly', () => {
      render(<ErrorMessage message="Rate limit exceeded" errorType="rate-limit" />)
      
      expect(screen.getByRole('heading', { level: 3, name: 'Rate Limit Exceeded' })).toBeInTheDocument()
    })

    test('shows network error suggestions', () => {
      render(<ErrorMessage message="Connection failed" errorType="network" />)
      
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument()
      expect(screen.getByText('Try again in a few moments')).toBeInTheDocument()
      expect(screen.getByText('Verify the repository URL is correct')).toBeInTheDocument()
    })

    test('shows not found error suggestions', () => {
      render(<ErrorMessage message="Repository not found" errorType="not-found" />)
      
      expect(screen.getByText('Check the spelling of the username or repository')).toBeInTheDocument()
      expect(screen.getByText('Ensure the repository is public')).toBeInTheDocument()
      expect(screen.getByText('Try a different repository or user')).toBeInTheDocument()
    })

    test('shows rate limit error suggestions', () => {
      render(<ErrorMessage message="Rate limit exceeded" errorType="rate-limit" />)
      
      expect(screen.getByText('GitHub API rate limit reached')).toBeInTheDocument()
      expect(screen.getByText('Try again in a few minutes')).toBeInTheDocument()
      expect(screen.getByText('Consider using a GitHub token for higher limits')).toBeInTheDocument()
    })
  })

  describe('Suggestions Section', () => {
    test('renders suggestions heading', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByText('Try these solutions:')).toBeInTheDocument()
    })

    test('renders all suggestion items', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByText('Double-check the input format')).toBeInTheDocument()
      expect(screen.getByText('Try a different repository or user')).toBeInTheDocument()
      expect(screen.getByText('Contact support if the issue persists')).toBeInTheDocument()
    })

    test('renders suggestions as a list', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(3)
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      render(<ErrorMessage message="" />)
      
      // Should still render the structure even with empty message
      expect(screen.getByRole('heading', { level: 3, name: 'Something went wrong' })).toBeInTheDocument()
    })

    test('handles missing onRetry prop', () => {
      render(<ErrorMessage message="Test error" />)
      
      // Should not show retry button when onRetry is not provided
      expect(screen.queryByRole('button', { name: /Try Again/i })).not.toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    test('retry button calls onRetry when clicked', () => {
      const onRetry = vi.fn()
      render(<ErrorMessage message="Test error" onRetry={onRetry} />)
      
      const retryButton = screen.getByRole('button', { name: /Try Again/i })
      fireEvent.click(retryButton)
      
      expect(onRetry).toHaveBeenCalled()
    })

    test('refresh button reloads page when clicked', () => {
      const mockReload = vi.fn()
      vi.stubGlobal('location', {
        ...window.location,
        reload: mockReload
      })
      
      render(<ErrorMessage message="Test error" />)
      
      const refreshButton = screen.getByRole('button', { name: /Refresh Page/i })
      fireEvent.click(refreshButton)
      
      expect(mockReload).toHaveBeenCalled()
      
      vi.unstubAllGlobals()
    })
  })

  describe('Accessibility', () => {
    test('has proper data-testid attribute', () => {
      render(<ErrorMessage message="Test error" />)
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    test('retry button has proper data-testid', () => {
      render(<ErrorMessage message="Test error" onRetry={() => {}} />)
      
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    test('applies card glass styling', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      const cardGlass = container.querySelector('.card-glass')
      expect(cardGlass).toBeInTheDocument()
    })

    test('has proper layout structure', () => {
      const { container } = render(<ErrorMessage message="Test error" />)
      
      // Check for main layout container
      const layoutContainer = container.querySelector('.icon-align-left')
      expect(layoutContainer).toBeInTheDocument()
    })

    test('retry button has proper styling classes', () => {
      const { container } = render(<ErrorMessage message="Test error" onRetry={() => {}} />)
      
      const retryButton = container.querySelector('[data-testid="retry-button"]')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveClass('btn-primary', 'icon-text-align')
    })
  })
}) 