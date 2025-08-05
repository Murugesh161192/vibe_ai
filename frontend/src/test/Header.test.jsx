import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Header from '../components/Header'

describe('Header Component', () => {
  describe('Default State', () => {
    test('shows default title', () => {
      render(<Header />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Vibe GitHub Analyzer/i })).toBeInTheDocument()
    })

    test('shows default subtitle', () => {
      render(<Header />)
      
      expect(screen.getByText(/Discover the vibe of any GitHub repository/i)).toBeInTheDocument()
    })

    test('shows quick example buttons', () => {
      render(<Header />)
      
      expect(screen.getByRole('button', { name: /⚛️ React/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /💚 Vue.js/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🟢 Node.js/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🐍 Python/i })).toBeInTheDocument()
    })

    test('shows AI powered text', () => {
      render(<Header />)
      
      expect(screen.getByText(/Powered by AI/i)).toBeInTheDocument()
    })
  })

  describe('Processing State', () => {
    test('shows processing title', () => {
      render(<Header analysisState="processing" />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Vibe GitHub Analyzer/i })).toBeInTheDocument()
    })

    test('shows processing subtitle', () => {
      render(<Header analysisState="processing" />)
      
      expect(screen.getByText(/Discover the vibe of any GitHub repository/i)).toBeInTheDocument()
    })

    test('does not show quick example buttons in processing state', () => {
      render(<Header analysisState="processing" />)
      
      expect(screen.queryByRole('button', { name: /⚛️ React/i })).not.toBeInTheDocument()
    })
  })

  describe('Results State', () => {
    test('shows results title', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.getByRole('heading', { level: 1, name: /Analysis Complete/i })).toBeInTheDocument()
    })

    test('shows results subtitle', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.getByText(/View your repository analysis below/i)).toBeInTheDocument()
    })

    test('does not show new analysis button in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.queryByRole('button', { name: /New Analysis/i })).not.toBeInTheDocument()
    })

    test('does not show quick example buttons in results state', () => {
      render(<Header analysisState="results" />)
      
      expect(screen.queryByRole('button', { name: /⚛️ React/i })).not.toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    test('renders sparkles icon for AI powered text', () => {
      const { container } = render(<Header />)
      
      const sparklesIcon = container.querySelector('.icon-sm')
      expect(sparklesIcon).toBeInTheDocument()
    })

    test('renders github icon in header', () => {
      const { container } = render(<Header />)
      
      const githubIcon = container.querySelector('.icon-xl.text-white')
      expect(githubIcon).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    test('quick example buttons call onAnalyzeRepo when clicked', () => {
      const mockOnAnalyzeRepo = vi.fn()
      render(<Header onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const reactButton = screen.getByRole('button', { name: /⚛️ React/i })
      fireEvent.click(reactButton)
      
      expect(mockOnAnalyzeRepo).toHaveBeenCalledWith('https://github.com/facebook/react')
    })

    test('vue button calls with correct URL', () => {
      const mockOnAnalyzeRepo = vi.fn()
      render(<Header onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const vueButton = screen.getByRole('button', { name: /💚 Vue.js/i })
      fireEvent.click(vueButton)
      
      expect(mockOnAnalyzeRepo).toHaveBeenCalledWith('https://github.com/vuejs/vue')
    })
  })
}) 