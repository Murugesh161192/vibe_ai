import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Header from '../components/Header'

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render - Default State', () => {
    test('renders logo and main title', () => {
      render(<Header />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Vibe GitHub Assistant/i })).toBeInTheDocument()
    })

    test('renders feature cards with correct headings', () => {
      render(<Header />)
      
      expect(screen.getByRole('heading', { level: 3, name: /User Profiles/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Repository Analysis/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /AI Summaries/i })).toBeInTheDocument()
    })

    test('renders main title and subtitle correctly', () => {
      render(<Header />)
      
      expect(screen.getByRole('heading', { level: 2, name: /Your Friendly GitHub Companion/i })).toBeInTheDocument()
      expect(screen.getByText(/Search Users\. Explore Repos\./i)).toBeInTheDocument()
    })

    test('renders enhanced CTA description', () => {
      render(<Header />)
      
      expect(screen.getByText(/Discover GitHub profiles, explore repositories, and get AI-powered insights in a friendly, conversational interface/i)).toBeInTheDocument()
    })

    test('renders get started button in ready state', () => {
      render(<Header analysisState="ready" />)
      
      expect(screen.getByRole('button', { name: /Scroll to chat section/i })).toBeInTheDocument()
      expect(screen.getByText(/Get Started/i)).toBeInTheDocument()
    })

    test('renders feature descriptions correctly', () => {
      render(<Header />)
      
      expect(screen.getByText(/Explore detailed GitHub user profiles with stats and repositories/i)).toBeInTheDocument()
      expect(screen.getByText(/Deep insights into code quality and project health/i)).toBeInTheDocument()
      expect(screen.getByText(/Get intelligent summaries of repositories and projects/i)).toBeInTheDocument()
    })
  })

  describe('Results State', () => {
    test('renders compact header with new search button in results state', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Vibe GitHub Assistant/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Search another user or repository/i })).toBeInTheDocument()
      expect(screen.getByText(/New Search/i)).toBeInTheDocument()
    })

    test('does not render new search button when onNewAnalysis is not provided in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.queryByRole('button', { name: /Search another user or repository/i })).not.toBeInTheDocument()
      expect(screen.queryByText(/New Search/i)).not.toBeInTheDocument()
    })

    test('does not render feature cards in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.queryByRole('heading', { level: 3, name: /User Profiles/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /Repository Analysis/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /AI Summaries/i })).not.toBeInTheDocument()
    })

    test('does not render get started button in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.queryByText(/Get Started/i)).not.toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    test('renders sparkles icon in both states', () => {
      const { rerender } = render(<Header />)
      // In default state, there should be sparkles icon
      expect(document.querySelector('.lucide-sparkles')).toBeInTheDocument()
      
      // In results state, there should also be sparkles icon
      rerender(<Header analysisState="results" />)
      expect(document.querySelector('.lucide-sparkles')).toBeInTheDocument()
    })

    test('renders feature icons correctly', () => {
      render(<Header />)
      
      // Check for Users, Github, and Zap icons (feature cards)
      expect(document.querySelector('.lucide-users')).toBeInTheDocument()
      expect(document.querySelector('.lucide-github')).toBeInTheDocument()
      expect(document.querySelector('.lucide-zap')).toBeInTheDocument()
    })

    test('renders ArrowLeft icon in results state new search button', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      expect(document.querySelector('.lucide-arrow-left')).toBeInTheDocument()
    })
  })

  describe('State Transitions', () => {
    test('shows different layout for ready vs results state', () => {
      const { rerender } = render(<Header analysisState="ready" />)
      
      // In ready state, should show full header with get started
      expect(screen.getByText(/Get Started/i)).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /User Profiles/i })).toBeInTheDocument()
      
      // In results state, should show compact header with new search
      rerender(<Header analysisState="results" onNewAnalysis={() => {}} />)
      expect(screen.getByText(/New Search/i)).toBeInTheDocument()
      expect(screen.queryByText(/Get Started/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: /User Profiles/i })).not.toBeInTheDocument()
    })

    test('handles processing state like default state', () => {
      render(<Header analysisState="processing" />)
      
      // Processing state should show the full header like default
      expect(screen.getByRole('heading', { level: 3, name: /User Profiles/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Repository Analysis/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /AI Summaries/i })).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    test('new search button calls onNewAnalysis when clicked', () => {
      const mockOnNewAnalysis = vi.fn()
      render(<Header analysisState="results" onNewAnalysis={mockOnNewAnalysis} />)
      
      const newSearchButton = screen.getByRole('button', { name: /Search another user or repository/i })
      newSearchButton.click()
      
      expect(mockOnNewAnalysis).toHaveBeenCalledTimes(1)
    })
  })
}) 