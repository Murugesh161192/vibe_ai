import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  describe('Initial Render', () => {
    test('renders with default message', () => {
      render(<LoadingSpinner />)
      
      // Default variant is 'default' which shows 'Processing...'
      expect(screen.getByText(/Processing/i)).toBeInTheDocument()
    })

    test('renders with custom message', () => {
      const customMessage = 'Analyzing repository...'
      render(<LoadingSpinner message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    test('renders spinner animation elements', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for SVG spinner elements
      const svgElements = container.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })

    test('renders AI attribution', () => {
      render(<LoadingSpinner />)
      
      // The component shows "Powered by AI" at the bottom
      expect(screen.getByText('Powered by AI')).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      const { container } = render(<LoadingSpinner message="" />)
      
      // Should render with default message for the variant
      expect(screen.getByText(/Processing/i)).toBeInTheDocument()
    })

    test('handles missing message prop', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText(/Processing/i)).toBeInTheDocument()
    })

    test('displays custom message when provided', () => {
      const customMessage = 'Processing data...'
      render(<LoadingSpinner message={customMessage} />)
      
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })
  })

  describe('Component Variants', () => {
    test('renders user variant correctly', () => {
      render(<LoadingSpinner variant="user" />)
      
      expect(screen.getByText('Fetching user profile...')).toBeInTheDocument()
    })

    test('renders repository variant correctly', () => {
      render(<LoadingSpinner variant="repository" />)
      
      expect(screen.getByText('Analyzing repository...')).toBeInTheDocument()
    })

    test('renders insights variant correctly', () => {
      render(<LoadingSpinner variant="insights" />)
      
      expect(screen.getByText('Generating AI insights...')).toBeInTheDocument()
    })

    test('renders default variant when unknown variant provided', () => {
      render(<LoadingSpinner variant="unknown" />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  describe('Progress Indicator', () => {
    test('shows progress indicator when progress is provided', () => {
      const { container } = render(<LoadingSpinner showProgress={true} progress={50} />)
      
      // Check for progress text
      expect(screen.getByText('50% Complete')).toBeInTheDocument()
    })

    test('does not show progress indicator when progress is null', () => {
      render(<LoadingSpinner showProgress={false} />)
      
      // Should not show progress text
      expect(screen.queryByText(/Complete/)).not.toBeInTheDocument()
    })

    test('shows progress bar when progress is provided', () => {
      const { container } = render(<LoadingSpinner showProgress={true} progress={75} />)
      
      // Check for progress bar element
      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '75')
    })
  })

  describe('Styling and Structure', () => {
    test('applies correct container styling classes', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />)
      
      // Check for fullscreen styles
      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('fixed')
    })

    test('applies text styling classes', () => {
      render(<LoadingSpinner message="Test message" />)
      
      const messageElement = screen.getByText('Test message')
      expect(messageElement).toHaveClass('text-white')
    })

    test('spinner has correct structure and styling', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for spinner container
      const spinnerContainer = container.querySelector('.relative')
      expect(spinnerContainer).toBeInTheDocument()
    })

    test('renders bot icon in center', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for icon in the center
      const svgElements = container.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Feedback', () => {
    test('renders main loading message prominently', () => {
      render(<LoadingSpinner message="Custom loading message" />)
      
      const messageElement = screen.getByText('Custom loading message')
      expect(messageElement).toBeInTheDocument()
      expect(messageElement).toHaveClass('text-white')
    })

    test('progress indicator has correct styling when present', () => {
      const { container } = render(<LoadingSpinner showProgress={true} progress={60} />)
      
      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper text content for screen readers', () => {
      const { container } = render(<LoadingSpinner message="Loading data" />)
      
      // Check for aria attributes
      const statusElement = container.querySelector('[role="status"]')
      expect(statusElement).toBeInTheDocument()
    })

    test('spinner elements are present for visual feedback', () => {
      const { container } = render(<LoadingSpinner />)
      
      const svgElements = container.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })
  })
}) 