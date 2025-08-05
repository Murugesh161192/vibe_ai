import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import DemoMode from '../components/DemoMode'

describe('DemoMode Component', () => {
  const mockOnExitDemo = vi.fn()
  const mockOnAnalyzeRepo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders demo header with title', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('heading', { level: 2, name: 'Demo Mode' })).toBeInTheDocument()
      expect(screen.getByText(/Preview sample repository analyses to understand Vibe's capabilities/)).toBeInTheDocument()
    })

    test('renders try real analysis button', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('button', { name: /Try Real Analysis/i })).toBeInTheDocument()
    })

    test('renders exit demo button', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const exitButtons = screen.getAllByRole('button', { name: /Exit Demo/i })
      expect(exitButtons.length).toBeGreaterThan(0)
    })

    test('renders only 2 demo repositories', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Vue.js')).toBeInTheDocument()
      // Node.js and Python are not rendered
      expect(screen.queryByText('Node.js')).not.toBeInTheDocument()
      expect(screen.queryByText((content, element) => {
        return content === 'Python' && element && element.tagName === 'H3'
      })).not.toBeInTheDocument()
    })

    test('renders demo features section', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('heading', { level: 4, name: 'AI Insights' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Community Health' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Security Analysis' })).toBeInTheDocument()
    })
  })

  describe('Demo Repositories', () => {
    test('displays repository information correctly', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // Check React repository
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('facebook/React')).toBeInTheDocument()
      expect(screen.getByText(/The library for web and native user interfaces/)).toBeInTheDocument()
      
      // Check Vue.js repository
      expect(screen.getByText('Vue.js')).toBeInTheDocument()
      expect(screen.getByText('vuejs/Vue.js')).toBeInTheDocument()
      expect(screen.getByText(/Progressive JavaScript framework/)).toBeInTheDocument()
    })

    test('displays star counts with proper formatting', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // Star counts are formatted with toLocaleString()
      // Find elements containing the star counts for React and Vue.js
      const reactCard = screen.getByText('React').closest('.card-glass')
      const vueCard = screen.getByText('Vue.js').closest('.card-glass')
      
      // Check that star counts are present in the cards
      // The numbers should be formatted with locale-specific separators
      // Handle different locale formats (e.g., 237,844 or 2,37,844)
      expect(reactCard.textContent).toMatch(/2[,.]?37[,.]?844/)
      expect(vueCard.textContent).toMatch(/2[,.]?09[,.]?222/)
      
      // Verify no other repositories are shown
      expect(screen.queryByText('Node.js')).not.toBeInTheDocument()
      expect(screen.queryByText('Python')).not.toBeInTheDocument()
    })
  })

  describe('Demo Metrics', () => {
    test('shows metrics when repository is clicked', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const reactCard = screen.getByText('React').closest('.card-glass')
      fireEvent.click(reactCard)
      
      expect(screen.getByText('Sample Metrics for React')).toBeInTheDocument()
    })

    test('displays metric values correctly', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const reactCard = screen.getByText('React').closest('.card-glass')
      fireEvent.click(reactCard)
      
      // Wait for metrics to appear
      expect(screen.getByText('Sample Metrics for React')).toBeInTheDocument()
      
      // Check for metric values - note that 100% appears twice (Readability and Innovation)
      expect(screen.getByText('30%')).toBeInTheDocument() // Code Quality
      expect(screen.getAllByText('100%')).toHaveLength(2) // Readability and Innovation
      expect(screen.getByText('85%')).toBeInTheDocument() // Collaboration
    })
  })

  describe('Demo Features', () => {
    test('displays AI Insights feature', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('heading', { level: 4, name: 'AI Insights' })).toBeInTheDocument()
      expect(screen.getByText(/Smart recommendations powered by Google Gemini/)).toBeInTheDocument()
    })

    test('displays Community Health feature', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('heading', { level: 4, name: 'Community Health' })).toBeInTheDocument()
      expect(screen.getByText(/Detailed contributor analysis and collaboration metrics/)).toBeInTheDocument()
    })

    test('displays Security Analysis feature', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('heading', { level: 4, name: 'Security Analysis' })).toBeInTheDocument()
      expect(screen.getByText(/Comprehensive vulnerability scanning and dependency analysis/)).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    test('calls onExitDemo when exit button is clicked', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const exitButtons = screen.getAllByRole('button', { name: /Exit Demo/i })
      fireEvent.click(exitButtons[0])
      
      expect(mockOnExitDemo).toHaveBeenCalled()
    })

    test('calls onAnalyzeRepo when repository analyze button is clicked', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const analyzeButtons = screen.getAllByRole('button', { name: /Analyze Full Repository/i })
      fireEvent.click(analyzeButtons[0])
      
      expect(mockOnAnalyzeRepo).toHaveBeenCalledWith('https://github.com/facebook/react')
    })
  })

  describe('Styling and Layout', () => {
    test('has proper grid layout for repositories', () => {
      const { container } = render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const repoGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3')
      expect(repoGrid).toBeInTheDocument()
    })

    test('has proper grid layout for metrics', () => {
      const { container } = render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const reactCard = screen.getByText('React').closest('.card-glass')
      fireEvent.click(reactCard)
      
      const metricsGrid = container.querySelector('.grid.grid-cols-2.md\\:grid-cols-4')
      expect(metricsGrid).toBeInTheDocument()
    })

    test('has hover effect on repository cards', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const reactCard = screen.getByText('React').closest('.card-glass')
      expect(reactCard).toHaveClass('hover:bg-white/10')
    })
  })

  describe('Icons', () => {
    test('renders play icon in header', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const playIcon = document.querySelector('svg.w-6.h-6.text-purple-400')
      expect(playIcon).toBeInTheDocument()
    })

    test('renders feature icons', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(document.querySelector('.w-8.h-8.text-purple-400')).toBeInTheDocument() // AI Insights
      expect(document.querySelector('.w-8.h-8.text-blue-400')).toBeInTheDocument() // Community Health
      expect(document.querySelector('.w-8.h-8.text-green-400')).toBeInTheDocument() // Security Analysis
    })
  })

  describe('Repository Card Details', () => {
    test('displays repository owner and name', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // Repository names are shown as headings
      expect(screen.getByRole('heading', { level: 3, name: 'React' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Vue.js' })).toBeInTheDocument()
      
      // Owner/name shown in format: owner/name
      expect(screen.getByText('facebook/React')).toBeInTheDocument()
      expect(screen.getByText('vuejs/Vue.js')).toBeInTheDocument()
    })

    test('displays repository descriptions', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText(/The library for web and native user interfaces/)).toBeInTheDocument()
      expect(screen.getByText(/Progressive JavaScript framework/)).toBeInTheDocument()
    })

    test('displays programming languages', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // Both repositories use JavaScript
      expect(screen.getAllByText('JavaScript')).toHaveLength(2)
    })

    test('displays vibe score as hidden', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getAllByText('Vibe Score Hidden')).toHaveLength(2)
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByRole('heading', { level: 2, name: 'Demo Mode' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'AI Insights' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Community Health' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Security Analysis' })).toBeInTheDocument()
    })

    test('has clickable repository cards', () => {
      render(<DemoMode onExitDemo={mockOnExitDemo} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const reactCard = screen.getByText('React').closest('.card-glass')
      expect(reactCard).toHaveClass('cursor-pointer')
    })
  })
}) 