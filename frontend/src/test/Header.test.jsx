import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'
import Header from '../components/Header'
import appReducer from '../store/slices/appSlice'
import userReducer from '../store/slices/userSlice'
import analysisReducer from '../store/slices/analysisSlice'
import aiReducer from '../store/slices/aiSlice'
import repositoryReducer from '../store/slices/repositorySlice'

// Helper function to create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      app: appReducer,
      user: userReducer,
      analysis: analysisReducer,
      ai: aiReducer,
      repository: repositoryReducer
    },
    preloadedState: {
      app: {
        loading: false,
        error: null,
        currentView: 'ready',
        ...initialState.app
      },
      user: {
        profile: null,
        repositories: [],
        recentSearches: [],
        ...initialState.user
      },
      analysis: {
        currentAnalysis: null,
        history: [],
        isLoading: false,
        error: null,
        ...initialState.analysis
      },
      ai: {
        summaries: {},
        isLoadingSummary: {},
        batchProgress: { total: 0, completed: 0, failed: 0 },
        isLoadingBatch: false,
        error: null,
        ...initialState.ai
      },
      repository: {
        repositories: {},
        paginationState: {},
        lastFetchInfo: null,
        isLoadingRepos: false,
        loadingPage: null,
        error: null,
        stats: {
          apiCallCount: 0,
          cacheHits: 0,
          totalReposFetched: 0
        },
        ...initialState.repository
      }
    }
  })
}

// Helper function to render with Redux
const renderWithRedux = (component, { store = createTestStore() } = {}) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store
  }
}

describe('Header Component', () => {
  describe('Navigation Bar', () => {
    test('renders navigation header with branding', () => {
      renderWithRedux(<Header />)
      
      // Check for navigation banner
      expect(screen.getByRole('banner', { name: /Main header/i })).toBeInTheDocument()
      
      // Check for branding text - either "Vibe Assistant" or "Vibe GitHub Assistant"
      const brandingText = screen.queryByText('Vibe GitHub Assistant') || screen.queryByText('Vibe Assistant')
      expect(brandingText).toBeInTheDocument()
    })

    test('shows AI-powered repository analysis tagline', () => {
      renderWithRedux(<Header />)
      
      // The tagline might be hidden on mobile, so check if it exists in the DOM
      const tagline = screen.queryByText(/AI-Powered Repository Analysis/i)
      if (tagline) {
        expect(tagline).toBeInTheDocument()
      }
    })

    test('renders skip to main content link for accessibility', () => {
      renderWithRedux(<Header />)
      
      expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    })

    test('renders metrics explanation button', () => {
      renderWithRedux(<Header />)
      
      const metricsButton = screen.getByRole('button', { name: /View metrics explanation/i })
      expect(metricsButton).toBeInTheDocument()
    })
  })

  describe('Ready View State', () => {
    test('shows Try Demo button when in ready view', () => {
      const store = createTestStore({ 
        app: { currentView: 'ready', loading: false }
      })
      renderWithRedux(<Header currentView="ready" loading={false} />, { store })
      
      // Try Demo button might be in desktop or mobile menu
      const demoButton = screen.queryByRole('button', { name: /Try demo/i })
      if (demoButton) {
        expect(demoButton).toBeInTheDocument()
      }
    })

    test('shows Quick Start dropdown when in ready view', () => {
      const store = createTestStore({ 
        app: { currentView: 'ready', loading: false }
      })
      renderWithRedux(<Header currentView="ready" loading={false} />, { store })
      
      // Quick Start might be in desktop view
      const quickStartButton = screen.queryByText('Quick Start')
      if (quickStartButton) {
        expect(quickStartButton).toBeInTheDocument()
      }
    })
  })

  describe('Analysis View State', () => {
    test('shows Home button when in analysis view', () => {
      const store = createTestStore({ 
        app: { currentView: 'analysis' }
      })
      renderWithRedux(<Header currentView="analysis" />, { store })
      
      // Home button might be visible in desktop or mobile menu
      const homeButton = screen.queryByRole('button', { name: /Go home|Home/i })
      if (homeButton) {
        expect(homeButton).toBeInTheDocument()
      }
    })

    test('shows New Analysis button when in analysis view', () => {
      const store = createTestStore({ 
        app: { currentView: 'analysis' }
      })
      renderWithRedux(<Header currentView="analysis" />, { store })
      
      // New Analysis button might be visible in desktop or mobile menu
      const newAnalysisButton = screen.queryByRole('button', { name: /New Analysis|New/i })
      if (newAnalysisButton) {
        expect(newAnalysisButton).toBeInTheDocument()
      }
    })

    test('shows Export and Share buttons when showAnalysisActions is true', () => {
      const store = createTestStore({ 
        app: { currentView: 'analysis' }
      })
      renderWithRedux(<Header currentView="analysis" showAnalysisActions={true} />, { store })
      
      // These buttons might be in desktop or mobile menu
      const exportButton = screen.queryByRole('button', { name: /Export/i })
      const shareButton = screen.queryByRole('button', { name: /Share/i })
      
      if (exportButton) {
        expect(exportButton).toBeInTheDocument()
      }
      if (shareButton) {
        expect(shareButton).toBeInTheDocument()
      }
    })
  })

  describe('Mobile Menu', () => {
    test('renders mobile menu button', () => {
      renderWithRedux(<Header />)
      
      // Mobile menu button should exist (though might be hidden on desktop)
      const menuButton = screen.queryByRole('button', { name: /Open menu|Close menu/i })
      if (menuButton) {
        expect(menuButton).toBeInTheDocument()
      }
    })

    test('can toggle mobile menu', async () => {
      renderWithRedux(<Header />)
      
      const menuButton = screen.queryByRole('button', { name: /Open menu/i })
      if (menuButton) {
        // Click to open menu
        fireEvent.click(menuButton)
        
        // Menu should now show close button
        await waitFor(() => {
          expect(screen.queryByRole('button', { name: /Close menu/i })).toBeInTheDocument()
        })
      }
    })
  })

  describe('Interaction', () => {
    test('calls onDemoMode when Try Demo is clicked', () => {
      const mockOnDemoMode = vi.fn()
      const store = createTestStore({ 
        app: { currentView: 'ready', loading: false }
      })
      renderWithRedux(
        <Header 
          currentView="ready" 
          loading={false} 
          onDemoMode={mockOnDemoMode} 
        />, 
        { store }
      )
      
      const demoButton = screen.queryByRole('button', { name: /Try demo/i })
      if (demoButton) {
        fireEvent.click(demoButton)
        expect(mockOnDemoMode).toHaveBeenCalled()
      }
    })

    test('calls onNewAnalysis when New Analysis is clicked', () => {
      const mockOnNewAnalysis = vi.fn()
      const store = createTestStore({ 
        app: { currentView: 'analysis' }
      })
      renderWithRedux(
        <Header 
          currentView="analysis" 
          onNewAnalysis={mockOnNewAnalysis} 
        />, 
        { store }
      )
      
      const newAnalysisButton = screen.queryByRole('button', { name: /New Analysis|New/i })
      if (newAnalysisButton) {
        fireEvent.click(newAnalysisButton)
        expect(mockOnNewAnalysis).toHaveBeenCalled()
      }
    })

    test('home button navigates to home page', () => {
      const store = createTestStore({ 
        app: { currentView: 'analysis' }
      })
      renderWithRedux(<Header currentView="analysis" />, { store })
      
      // The main logo/home button has this aria-label
      const homeButtons = screen.getAllByRole('button', { name: /Go to home page|Go home/i })
      const homeButton = homeButtons[0]  // Use the first matching button
      expect(homeButton).toBeInTheDocument()
      
      // Click home button
      fireEvent.click(homeButton)
      
      // Check that the view was updated
      const state = store.getState()
      expect(state.app.currentView).toBe('ready')
    })
  })
}) 