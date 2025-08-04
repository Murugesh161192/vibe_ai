import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import Header from '../components/Header'

describe('Header Component', () => {
  describe('Content Based on State', () => {
    test('displays default content when analysisState is not provided', () => {
      render(<Header />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Vibe GitHub Analyzer/i })).toBeInTheDocument()
      expect(screen.getByText(/Built for Cognizant Vibe Coding 2025/i)).toBeInTheDocument()
    })

    test('displays processing content when analysisState is processing', () => {
      render(<Header analysisState="processing" />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Analysis in Progress/i })).toBeInTheDocument()
      expect(screen.getByText(/Analyzing repository structure and metrics.../i)).toBeInTheDocument()
    })

    test('displays results content when analysisState is results', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      expect(screen.getByRole('heading', { level: 1, name: /📊 Analysis Complete/i })).toBeInTheDocument()
      expect(screen.getByText(/Repository insights generated successfully/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🔄 New Analysis/i })).toBeInTheDocument()
    })
  })

  describe('Capabilities Section', () => {
    test('shows capabilities in default state', () => {
      render(<Header />)
      
      expect(screen.getByRole('heading', { level: 3, name: /Smart Analysis/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /12\+ Metrics/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Instant Results/i })).toBeInTheDocument()
    })

    test('hides capabilities in processing state', () => {
      render(<Header analysisState="processing" />)
      
      expect(screen.queryByRole('heading', { level: 3, name: /Smart Analysis/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /12\+ Metrics/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /Instant Results/i })).not.toBeInTheDocument()
    })

    test('hides capabilities in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.queryByRole('heading', { level: 3, name: /Smart Analysis/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /12\+ Metrics/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /Instant Results/i })).not.toBeInTheDocument()
    })
  })

  describe('Button Behavior', () => {
    test('shows new analysis button in results state', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      expect(screen.getByRole('button', { name: /🔄 New Analysis/i })).toBeInTheDocument()
    })

    test('does not show button in default state', () => {
      render(<Header />)
      
      expect(screen.queryByRole('button', { name: /🔄 New Analysis/i })).not.toBeInTheDocument()
    })

    test('does not show button in processing state', () => {
      render(<Header analysisState="processing" />)
      
      expect(screen.queryByRole('button', { name: /🔄 New Analysis/i })).not.toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    test('renders sparkles icon in default state', () => {
      render(<Header />)
      
      expect(document.querySelector('.lucide-sparkles')).toBeInTheDocument()
    })

    test('renders bar chart icon in processing state', () => {
      render(<Header analysisState="processing" />)
      
      expect(document.querySelector('.lucide-bar-chart3')).toBeInTheDocument()
    })

    test('renders bar chart icon in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(document.querySelector('.lucide-bar-chart3')).toBeInTheDocument()
    })

    test('renders feature icons correctly in default state', () => {
      render(<Header />)

      // Check for Bot, BarChart3, and Zap icons (feature cards)
      expect(document.querySelector('.lucide-bot')).toBeInTheDocument()
      expect(document.querySelector('.lucide-bar-chart3')).toBeInTheDocument()
      expect(document.querySelector('.lucide-zap')).toBeInTheDocument()
    })
  })

  describe('State Transitions', () => {
    test('shows different layout for default vs results state', () => {
      const { rerender } = render(<Header />)
      
      // In default state, should show full header with capabilities
      expect(screen.getByRole('heading', { level: 3, name: /Smart Analysis/i })).toBeInTheDocument()
      
      // Rerender with results state
      rerender(<Header analysisState="results" />)
      
      // In results state, should show minimal header
      expect(screen.queryByRole('heading', { level: 3, name: /Smart Analysis/i })).not.toBeInTheDocument()
    })

    test('handles processing state correctly', () => {
      render(<Header analysisState="processing" />)
      
      // Processing state should show Analysis in Progress
      expect(screen.getByRole('heading', { level: 1, name: /Analysis in Progress/i })).toBeInTheDocument()
      expect(screen.getByText(/Analyzing repository structure and metrics.../i)).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    test('new analysis button calls onNewAnalysis when clicked', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      const newAnalysisButton = screen.getByRole('button', { name: /🔄 New Analysis/i })
      fireEvent.click(newAnalysisButton)
      
      expect(mockOnNewAnalysis).toHaveBeenCalled()
    })
  })
}) 