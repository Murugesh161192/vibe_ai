import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import AnalysisInsights from '../components/AnalysisInsights'

describe('AnalysisInsights Component', () => {
  const mockAnalysis = {
    insights: [
      'Good code quality with comprehensive testing',
      'Needs improvement in documentation',
      'Strong community engagement'
    ],
    testFiles: ['test/app.test.js', 'test/components.test.js', 'test/utils.test.js'],
    documentationFiles: ['README.md', 'CONTRIBUTING.md', 'API.md'],
    dependencies: ['react', 'axios', 'lodash', 'jest'],
    folderStructure: ['src/', 'test/', 'docs/']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders insights section', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      expect(screen.getByText(/Analysis Insights/i)).toBeInTheDocument()
      expect(screen.getByText(/Good code quality with comprehensive testing/i)).toBeInTheDocument()
    })

    test('renders smart recommendations section', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      expect(screen.getByText(/Smart Recommendations/i)).toBeInTheDocument()
    })

    test('renders test files information', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      // Find the Test Coverage heading in the cards section (not recommendations)
      const headings = screen.getAllByText('Test Coverage')
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText('Test Files')).toBeInTheDocument() // Test files label
      
      // Check that test files are rendered with emoji prefix
      expect(screen.getByText('📄 test/app.test.js')).toBeInTheDocument()
    })

    test('renders documentation files', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      // Find the Documentation heading in the cards section
      const headings = screen.getAllByText('Documentation')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check that documentation files are rendered with emoji prefix
      expect(screen.getByText('📖 README.md')).toBeInTheDocument()
      expect(screen.getByText('📖 CONTRIBUTING.md')).toBeInTheDocument()
    })

    test('renders dependencies', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      const headings = screen.getAllByText('Dependencies')
      expect(headings.length).toBeGreaterThan(0)
      // Dependencies are shown with emoji prefix
      expect(screen.getByText('📦 react')).toBeInTheDocument()
      expect(screen.getByText('📦 axios')).toBeInTheDocument()
    })
  })

  describe('Data Handling', () => {
    test('handles empty insights array', () => {
      const emptyAnalysis = { ...mockAnalysis, insights: [] }
      render(<AnalysisInsights analysis={emptyAnalysis} />)
      
      // Should not render insights section at all
      expect(screen.queryByText(/Analysis Insights/i)).not.toBeInTheDocument()
    })

    test('handles empty test files array', () => {
      const emptyAnalysis = { ...mockAnalysis, testFiles: [] }
      render(<AnalysisInsights analysis={emptyAnalysis} />)
      
      const headings = screen.getAllByText('Test Coverage')
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText(/No test files detected in the repository/i)).toBeInTheDocument()
    })

    test('handles empty documentation files array', () => {
      const noDocsAnalysis = { ...mockAnalysis, documentationFiles: [] }
      render(<AnalysisInsights analysis={noDocsAnalysis} />)
      
      const headings = screen.getAllByText('Documentation')
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText(/No documentation files detected/i)).toBeInTheDocument()
    })

    test('handles empty dependencies array', () => {
      const noDepsAnalysis = { ...mockAnalysis, dependencies: [] }
      render(<AnalysisInsights analysis={noDepsAnalysis} />)
      
      const headings = screen.getAllByText('Dependencies')
      expect(headings.length).toBeGreaterThan(0)
      expect(screen.getByText(/No dependencies detected/i)).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles empty analysis object', () => {
      expect(() => {
        render(<AnalysisInsights analysis={{}} />)
      }).not.toThrow()
    })

    test('handles missing analysis prop', () => {
      expect(() => {
        render(<AnalysisInsights />)
      }).not.toThrow()
    })

    test('returns null when analysis is null', () => {
      const { container } = render(<AnalysisInsights analysis={null} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings.length).toBeGreaterThan(0)
    })

    test('insights have proper icon accessibility', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      // Check that SVG icons are present (lucide icons are SVG elements)
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
      
      // Check that icons have proper lucide classes
      const lucideIcons = document.querySelectorAll('.lucide')
      expect(lucideIcons.length).toBeGreaterThan(0)
    })
  })
}) 