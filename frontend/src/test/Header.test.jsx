import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Header from '../components/Header'

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders logo and navigation', () => {
      render(<Header />)
      
      expect(screen.getByText(/Vibe AI/i)).toBeInTheDocument()
    })

    test('renders feature cards', () => {
      render(<Header />)
      
      expect(screen.getByText(/Code Quality Analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/Team Collaboration/i)).toBeInTheDocument()
      // Use getAllByText for text that appears multiple times
      expect(screen.getAllByText(/Innovation Metrics/i).length).toBeGreaterThan(0)
    })

    test('renders main title and subtitle', () => {
      render(<Header />)
      
      expect(screen.getByText(/Analyze GitHub Repositories/i)).toBeInTheDocument()
      expect(screen.getByText(/Discover Their Vibe/i)).toBeInTheDocument()
    })

    test('renders get started button in ready state', () => {
      render(<Header analysisState="ready" />)
      
      expect(screen.getByRole('button', { name: /Scroll to repository analysis section/i })).toBeInTheDocument()
    })

    test('renders compact header with new analysis button in results state', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      expect(screen.getByText(/Vibe AI/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Analyze another repository/i })).toBeInTheDocument()
    })
  })
}) 