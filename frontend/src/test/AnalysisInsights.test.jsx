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
    dependencies: ['react', 'axios', 'lodash', 'jest'],
    folderStructure: ['src/', 'test/', 'docs/'],
    languages: ['JavaScript', 'TypeScript']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders component with analysis data', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      expect(screen.getByText(/Basic Analysis Results/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Test Coverage/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Dependencies/i).length).toBeGreaterThan(0)
    })

    test('renders insights information', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      mockAnalysis.insights.forEach(insight => {
        expect(screen.getByText(insight)).toBeInTheDocument()
      })
    })

    test('renders test files information', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      // Find the Test Coverage heading in the cards section (not recommendations)
      const headings = screen.getAllByText('Test Coverage')
      expect(headings.length).toBeGreaterThan(0)
      
      // Check that test files are rendered with emoji prefix (🧪 not 📄)
      expect(screen.getAllByText(/🧪/).length).toBeGreaterThan(0)
    })

    test('renders dependencies information', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      // Check for Dependencies section using role
      expect(screen.getByRole('heading', { level: 4, name: /Dependencies/i })).toBeInTheDocument()
      expect(screen.getByText(/External packages and libraries/i)).toBeInTheDocument()
      
      // Check for Dependencies content
      expect(screen.getByText('4')).toBeInTheDocument() // Dependency count
      expect(screen.getByText('📦 react')).toBeInTheDocument()
      expect(screen.getByText('📦 axios')).toBeInTheDocument()
    })

    test('renders recommendations section', () => {
      render(<AnalysisInsights analysis={mockAnalysis} />)
      
      expect(screen.getByText(/Smart Recommendations/i)).toBeInTheDocument()
      expect(screen.getByText(/Improve Your Vibe Score/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('handles empty analysis gracefully', () => {
      const emptyAnalysis = {
        insights: [],
        testFiles: [],
        dependencies: [],
        languages: []
      }
      
      render(<AnalysisInsights analysis={emptyAnalysis} />)
      
      // Should still render other sections even with empty/missing data
      expect(screen.getAllByText(/Test Coverage/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Dependencies/i).length).toBeGreaterThan(0)
    })

    test('handles null analysis', () => {
      render(<AnalysisInsights analysis={null} />)
      
      // Component should not render anything
      expect(screen.queryByText(/Analysis Insights/i)).not.toBeInTheDocument()
    })

    test('handles missing dependencies data', () => {
      const analysisWithoutDependencies = {
        insights: ['Some insight'],
        testFiles: ['test.js'],
        dependencies: [],
        languages: []
      }
      
      render(<AnalysisInsights analysis={analysisWithoutDependencies} />)
      
      // Should show "No dependencies detected" message
      expect(screen.getByText(/No dependencies detected/i)).toBeInTheDocument()
      expect(screen.getByText(/This could be a standalone project or dependency detection failed/i)).toBeInTheDocument()
    })

    test('handles dependencies with large count', () => {
      const analysisWithManyDependencies = {
        insights: ['Some insight'],
        testFiles: ['test.js'],
        dependencies: ['react', 'vue', 'angular', 'svelte', 'ember', 'backbone', 'jquery', 'lodash'],
        languages: []
      }
      
      render(<AnalysisInsights analysis={analysisWithManyDependencies} />)
      
      // Should show dependencies with overflow count
      expect(screen.getByRole('heading', { level: 4, name: /Dependencies/i })).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument() // Total dependency count
      expect(screen.getByText('📦 react')).toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument() // Shows +2 for 8 deps (6 shown + 2 more)
    })

    test('handles small number of dependencies', () => {
      const analysisWithFewDependencies = {
        insights: ['Some insight'],
        testFiles: ['test.js'],
        dependencies: ['react', 'vue'],
        languages: []
      }
      
      render(<AnalysisInsights analysis={analysisWithFewDependencies} />)
      
      // Should show all dependencies without overflow
      expect(screen.getByRole('heading', { level: 4, name: /Dependencies/i })).toBeInTheDocument()
      expect(screen.getByText('📦 react')).toBeInTheDocument()
      expect(screen.getByText('📦 vue')).toBeInTheDocument()
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument() // No overflow indicator
    })
  })
}) 