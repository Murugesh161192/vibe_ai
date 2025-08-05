import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  describe('Initial Render', () => {
    test('renders with default message', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    test('renders with custom message', () => {
      const customMessage = 'Analyzing repository...'
      render(<LoadingSpinner message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    test('renders spinner animation elements', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for main spinner
      const mainSpinner = container.querySelector('.animate-spin')
      expect(mainSpinner).toBeInTheDocument()
      
      // Check for spinner styling
      expect(mainSpinner).toHaveClass('border-t-purple-400')
    })

    test('renders AI attribution', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('Powered by AI')).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      render(<LoadingSpinner message="" />)
      
      // Check that the component renders without crashing
      const { container } = render(<LoadingSpinner message="" />)
      const headingElement = container.querySelector('h3')
      expect(headingElement).toBeInTheDocument()
    })

    test('handles missing message prop', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    test('displays custom message when provided', () => {
      const customMessage = 'Processing data...'
      render(<LoadingSpinner message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })
  })

  describe('Progress Indicator', () => {
    test('shows progress indicator when progress is provided', () => {
      render(<LoadingSpinner progress={75} />)
      
      expect(screen.getByText('75% complete')).toBeInTheDocument()
    })

    test('does not show progress indicator when progress is null', () => {
      render(<LoadingSpinner progress={null} />)
      
      expect(screen.queryByText(/\d+% complete/)).not.toBeInTheDocument()
    })

    test('shows progress bar when progress is provided', () => {
      const { container } = render(<LoadingSpinner progress={50} />)
      
      const progressBar = container.querySelector('.bg-gradient-to-r.from-purple-400.to-purple-600')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Styling and Structure', () => {
    test('applies correct container styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const containerDiv = container.querySelector('.icon-align-center.flex-col')
      expect(containerDiv).toBeInTheDocument()
    })

    test('applies text styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const headingElement = container.querySelector('h3')
      expect(headingElement).toHaveClass('text-heading-md')
    })

    test('spinner has correct structure and styling', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('border-4', 'border-purple-200/30', 'border-t-purple-400', 'rounded-full')
    })

    test('renders bot icon in center', () => {
      const { container } = render(<LoadingSpinner />)
      
      const iconContainer = container.querySelector('.icon-container.icon-container-primary')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Visual Feedback', () => {
    test('renders main loading message prominently', () => {
      const message = 'Processing...'
      render(<LoadingSpinner message={message} />)
      
      const messageElement = screen.getByText(message)
      expect(messageElement).toBeInTheDocument()
      expect(messageElement.tagName).toBe('H3')
    })

    test('progress indicator has correct styling when present', () => {
      const { container } = render(<LoadingSpinner progress={80} />)
      
      const progressText = screen.getByText('80% complete')
      expect(progressText).toHaveClass('text-white/60', 'text-sm')
    })
  })

  describe('Accessibility', () => {
    test('has proper text content for screen readers', () => {
      const message = 'Loading data...'
      render(<LoadingSpinner message={message} />)
      
      expect(screen.getByText(message)).toBeInTheDocument()
    })

    test('spinner elements are present for visual feedback', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check that spinner is present
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })
}) 