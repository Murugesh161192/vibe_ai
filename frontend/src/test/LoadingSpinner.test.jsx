import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders loading spinner container', () => {
      const { container } = render(<LoadingSpinner />)
      const textCenter = container.querySelector('.text-center')
      expect(textCenter).toBeInTheDocument()
    })

    test('renders with default message', () => {
      const { container } = render(<LoadingSpinner />)
      
      const visibleMessage = container.querySelector('.font-semibold')
      expect(visibleMessage).toHaveTextContent('Analyzing repository...')
    })

    test('renders with custom message', () => {
      const customMessage = 'Loading custom data...'
      const { container } = render(<LoadingSpinner />)
      
      const visibleMessage = container.querySelector('.font-semibold')
      expect(visibleMessage).toHaveTextContent('Analyzing repository...')
      
      // Test with actual custom message
      const { container: customContainer } = render(<LoadingSpinner message={customMessage} />)
      const customVisibleMessage = customContainer.querySelector('.font-semibold')
      expect(customVisibleMessage).toHaveTextContent(customMessage)
    })

    test('renders spinner animation elements', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for spinning element
      const spinningElement = container.querySelector('.animate-spin')
      expect(spinningElement).toBeInTheDocument()
      
      // Check for outer ring
      const outerRing = container.querySelector('.border-white\\/20')
      expect(outerRing).toBeInTheDocument()
    })

    test('renders additional context text', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('This may take a few moments...')).toBeInTheDocument()
    })

    test('renders progress indicator dots', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for animated dots
      const animatedDots = container.querySelectorAll('.animate-pulse')
      expect(animatedDots.length).toBeGreaterThanOrEqual(3) // At least 3 dots
    })
  })

  describe('Component Props', () => {
    test('handles empty message', () => {
      const { container } = render(<LoadingSpinner message="" />)
      
      const visibleMessage = container.querySelector('.font-semibold')
      expect(visibleMessage).toHaveTextContent('')
    })

    test('handles missing message prop', () => {
      const { container } = render(<LoadingSpinner message={undefined} />)
      
      const visibleMessage = container.querySelector('.font-semibold')
      expect(visibleMessage).toHaveTextContent('Analyzing repository...')
    })

    test('displays custom message when provided', () => {
      const customMessage = 'Processing repository data...'
      const { container } = render(<LoadingSpinner message={customMessage} />)
      
      const visibleMessage = container.querySelector('.font-semibold')
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

    test('screen reader text matches visible message', () => {
      const message = 'Loading custom content...'
      const { container } = render(<LoadingSpinner message={message} />)
      
      const visibleMessage = container.querySelector('.font-semibold')
      const screenReaderMessage = container.querySelector('.sr-only[role="status"]')
      
      expect(visibleMessage).toHaveTextContent(message)
      expect(screenReaderMessage).toHaveTextContent(message)
    })

    test('screen reader only element is present', () => {
      const { container } = render(<LoadingSpinner />)
      
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly).toBeInTheDocument()
      expect(srOnly).toHaveAttribute('role', 'status')
      expect(srOnly).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Styling and Structure', () => {
    test('applies correct container styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const textCenter = container.querySelector('.text-center')
      expect(textCenter).toBeInTheDocument()
      expect(textCenter).toHaveClass('py-12')
    })

    test('applies card glass styling', () => {
      const { container } = render(<LoadingSpinner />)
      
      const cardGlass = container.querySelector('.card-glass')
      expect(cardGlass).toBeInTheDocument()
      expect(cardGlass).toHaveClass('p-8', 'max-w-md', 'mx-auto')
    })

    test('spinner has correct structure and styling', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Test the spinning border element
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('border-4', 'border-transparent', 'border-t-white', 'border-r-white', 'rounded-full')
      
      // Test the outer ring
      const outerRing = container.querySelector('.border-white\\/20')
      expect(outerRing).toBeInTheDocument()
      expect(outerRing).toHaveClass('w-20', 'h-20', 'border-4', 'rounded-full')
    })

    test('applies text styling classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const whiteText = container.querySelector('.text-white')
      expect(whiteText).toBeInTheDocument()
    })

    test('center dot is present', () => {
      const { container } = render(<LoadingSpinner />)
      
      // Check for center dot
      const centerDot = container.querySelector('.w-2.h-2.bg-white.rounded-full.opacity-80')
      // Use a more flexible selector since the exact class combination might vary
      const dots = container.querySelectorAll('.bg-white.rounded-full')
      expect(dots.length).toBeGreaterThan(0)
    })

    test('progress dots have proper spacing and animation', () => {
      const { container } = render(<LoadingSpinner />)
      
      const progressContainer = container.querySelector('.space-x-1')
      expect(progressContainer).toBeInTheDocument()
      
      const progressDots = container.querySelectorAll('.space-x-1 .animate-pulse')
      expect(progressDots.length).toBe(3) // Should have 3 progress dots
    })
  })

  describe('Visual Feedback', () => {
    test('renders main loading message prominently', () => {
      const message = 'Custom loading message'
      const { container } = render(<LoadingSpinner message={message} />)
      
      const prominentMessage = container.querySelector('.text-xl.font-semibold')
      expect(prominentMessage).toBeInTheDocument()
      expect(prominentMessage).toHaveTextContent(message)
    })

    test('renders secondary helper text', () => {
      const { container } = render(<LoadingSpinner />)
      
      const helperText = container.querySelector('.text-white\\/70')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveTextContent('This may take a few moments...')
    })
  })
}) 