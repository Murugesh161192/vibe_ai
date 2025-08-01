import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders loading spinner', () => {
      const { container } = render(<LoadingSpinner />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    test('renders with default message', () => {
      const { container } = render(<LoadingSpinner />)
      
      const visibleMessage = container.querySelector('.font-medium')
      expect(visibleMessage).toHaveTextContent('Analyzing repository...')
    })

    test('renders with custom message', () => {
      const customMessage = 'Custom loading message'
      const { container } = render(<LoadingSpinner message={customMessage} />)
      
      const visibleMessage = container.querySelector('.font-medium')
      expect(visibleMessage).toHaveTextContent(customMessage)
    })

    test('renders spinner animation', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    test('renders additional context text', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('This may take a few moments...')).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      const { container } = render(<LoadingSpinner message="" />)
      
      const visibleMessage = container.querySelector('.font-medium')
      expect(visibleMessage).toHaveTextContent('')
    })

    test('handles missing message prop', () => {
      const { container } = render(<LoadingSpinner />)
      
      const visibleMessage = container.querySelector('.font-medium')
      expect(visibleMessage).toHaveTextContent('Analyzing repository...')
    })

    test('displays custom message when provided', () => {
      const customMessage = 'Loading data...'
      const { container } = render(<LoadingSpinner message={customMessage} />)
      
      const visibleMessage = container.querySelector('.font-medium')
      expect(visibleMessage).toHaveTextContent(customMessage)
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<LoadingSpinner />)
      
      const statusElement = screen.getByRole('status')
      expect(statusElement).toBeInTheDocument()
    })

    test('has proper ARIA live region', () => {
      render(<LoadingSpinner />)
      
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })

    test('spinner icon has aria-hidden attribute', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toHaveAttribute('aria-hidden', 'true')
    })

    test('screen reader text matches visible message', () => {
      const message = 'Loading custom content...'
      const { container } = render(<LoadingSpinner message={message} />)
      
      const visibleMessage = container.querySelector('.font-medium')
      const screenReaderMessage = container.querySelector('.sr-only[role="status"]')
      
      expect(visibleMessage).toHaveTextContent(message)
      expect(screenReaderMessage).toHaveTextContent(message)
    })
  })

  describe('Styling', () => {
    test('applies correct container styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const textCenter = container.querySelector('.text-center')
      expect(textCenter).toBeInTheDocument()
    })

    test('spinner has correct styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toHaveClass('w-8', 'h-8', 'text-white', 'animate-spin')
    })

    test('applies card content styling', () => {
      const { container } = render(<LoadingSpinner />)
      
      const cardContent = container.querySelector('.card-content')
      expect(cardContent).toBeInTheDocument()
      expect(cardContent).toHaveClass('inline-flex', 'items-center', 'gap-3', 'p-6')
    })

    test('applies text styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const whiteText = container.querySelector('.text-white')
      expect(whiteText).toBeInTheDocument()
    })

    test('applies screen reader only class', () => {
      const { container } = render(<LoadingSpinner />)
      
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly).toBeInTheDocument()
    })
  })
}) 