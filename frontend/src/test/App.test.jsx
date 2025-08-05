import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../App'
import * as api from '../services/api'

// Mock the API module
vi.mock('../services/api', () => ({
  analyzeRepository: vi.fn(),
  getUserProfile: vi.fn(),
  getUserRepositories: vi.fn(),
  generateInsights: vi.fn(),
}))

// Mock the child components with simpler implementations
vi.mock('../components/Header', () => ({
  default: ({ analysisState, onNewAnalysis, onDemoMode }) => {
    return (
      <div data-testid="header-content">
        <h1>{analysisState === 'results' ? '📊 Analysis Complete' : 'Vibe GitHub Analyzer'}</h1>
        {analysisState === 'results' && onNewAnalysis && (
          <button onClick={onNewAnalysis}>🔄 New Analysis</button>
        )}
        {(analysisState === 'ready' || !analysisState) && onDemoMode && (
          <button onClick={onDemoMode}>Try Demo</button>
        )}
      </div>
    )
  }
}))

vi.mock('../components/ChatInput', () => ({
  default: ({ onSubmit, loading, isFirstAnalysis }) => {
    const [value, setValue] = React.useState('')
    return (
      <div data-testid="chat-input">
        <input
          placeholder="Enter GitHub username (e.g., 'torvalds') or repository URL"
          disabled={loading}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="chat-input-field"
        />
        <button 
          onClick={() => onSubmit && onSubmit(value)} 
          disabled={loading}
          data-testid="chat-submit-button"
        >
          Send
        </button>
      </div>
    )
  }
}))

vi.mock('../components/VibeScoreResults', () => ({
  default: ({ result, repoUrl, onNewAnalysis }) => (
    <div data-testid="vibe-score-results-content">
      <h2>{result?.repoInfo?.name}</h2>
      <div>Score: {result?.vibeScore?.total}</div>
      {result?.aiInsights && <div>AI Insights Available</div>}
      {result?.aiInsightsError && <div>AI Error: {result?.aiInsightsError}</div>}
    </div>
  )
}))

vi.mock('../components/GitHubUserProfile', () => ({
  default: ({ user, repositories, onAnalyzeRepo, onNewSearch }) => (
    <div data-testid="github-user-profile">
      <h2>{user?.login}</h2>
      <div>Repos: {repositories?.length || 0}</div>
      <button onClick={() => onAnalyzeRepo('https://github.com/test/repo')}>
        Analyze Repo
      </button>
      <button onClick={onNewSearch}>New Search</button>
    </div>
  )
}))

vi.mock('../components/DemoMode', () => ({
  default: ({ onExitDemo, onAnalyzeRepo }) => (
    <div data-testid="demo-mode">
      <h2>Demo Mode</h2>
      <button onClick={onExitDemo}>Exit Demo</button>
      <button onClick={() => onAnalyzeRepo('https://github.com/demo/repo')}>
        Analyze Demo Repo
      </button>
    </div>
  )
}))

vi.mock('../components/LoadingSpinner', () => ({
  default: ({ message }) => <div data-testid="loading-spinner">{message}</div>
}))

vi.mock('../components/ErrorMessage', () => ({
  default: ({ message, onRetry }) => (
    <>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </>
  )
}))

// Add React import for the mocked component
import React from 'react'

describe('App Component', () => {
  const setup = () => {
    const user = userEvent.setup()
    render(<App />)
    return { user }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
    
    // Mock window.scrollTo
    window.scrollTo = vi.fn()
    
    // Reset API mocks
    api.analyzeRepository.mockReset()
    api.getUserProfile.mockReset()
    api.getUserRepositories.mockReset()
    api.generateInsights.mockReset()
    
    // Default mocks to prevent errors
    api.getUserProfile.mockResolvedValue({
      data: { 
        login: 'test-user',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    })
    api.getUserRepositories.mockResolvedValue([])
    api.generateInsights.mockResolvedValue({ 
      data: { insights: 'AI insights' } 
    })
  })

  describe('Initial Render', () => {
    test('renders header and main components', async () => {
      setup()

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument()
        expect(screen.getByText(/Vibe GitHub Analyzer/i)).toBeInTheDocument()
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })
    })

    test('renders chat input by default', async () => {
      setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Enter GitHub username.*or repository URL/i)).toBeInTheDocument()
      })
    })
  })

  describe('Repository Analysis Flow', () => {
    test('can analyze a repository successfully', async () => {
      const mockSuccessResponse = {
        success: true,
        data: {
          repoInfo: { name: 'test-repo', description: 'Test repo', stars: 1000, forks: 100, createdAt: '2020-01-01', contributors: 10 },
          vibeScore: { 
            total: 85, 
            breakdown: { codeQuality: 90, readability: 80, collaboration: 75, innovation: 85, maintainability: 90, inclusivity: 70, security: 95, performance: 80, testingQuality: 88, communityHealth: 78, codeHealth: 85, releaseManagement: 92 }
          },
          analysis: { insights: ['Great code'], recommendations: ['Keep it up'], documentationFiles: [], testFiles: [], dependencies: [], folderStructure: [] }
        }
      }
      api.analyzeRepository.mockResolvedValue(mockSuccessResponse)

      const { user } = setup()

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Type a repository URL
      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'https://github.com/test/repo')

      // Trigger analysis
      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      expect(screen.getByText('test-repo')).toBeInTheDocument()
      expect(screen.getByText('Score: 85')).toBeInTheDocument()
    })

    test('handles repository analysis errors', async () => {
      api.analyzeRepository.mockRejectedValue(new Error('Repository not found'))

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'https://github.com/test/repo')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      // The error should show in the ready view
      await waitFor(() => {
        expect(screen.getByText(/Repository not found/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('handles parallel AI insights correctly', async () => {
      const mockSuccessResponse = {
        data: {
          repoInfo: { name: 'test-repo' },
          vibeScore: { total: 85 },
          analysis: {}
        }
      }
      const mockInsightsResponse = {
        data: { insights: 'AI generated insights' }
      }
      
      api.analyzeRepository.mockResolvedValue(mockSuccessResponse)
      api.generateInsights.mockResolvedValue(mockInsightsResponse)

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'https://github.com/test/repo')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      })

      expect(screen.getByText('AI Insights Available')).toBeInTheDocument()
    })

    test('handles AI insights failure gracefully', async () => {
      const mockSuccessResponse = {
        data: {
          repoInfo: { name: 'test-repo' },
          vibeScore: { total: 85 },
          analysis: {}
        }
      }
      
      api.analyzeRepository.mockResolvedValue(mockSuccessResponse)
      api.generateInsights.mockRejectedValue(new Error('AI service unavailable'))

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'https://github.com/test/repo')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      })

      expect(screen.getByText(/AI Error:/)).toBeInTheDocument()
    })
  })

  describe('User Profile Flow', () => {
    test('can search for user profiles successfully', async () => {
      const mockUserProfile = { 
        data: { 
          login: 'testuser', 
          name: 'Test User', 
          public_repos: 10 
        } 
      }
      const mockUserRepos = [
        { name: 'repo1' }, 
        { name: 'repo2' }
      ]
      
      api.getUserProfile.mockResolvedValue(mockUserProfile)
      api.getUserRepositories.mockResolvedValue(mockUserRepos)

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Type just a username
      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'testuser')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('github-user-profile')).toBeInTheDocument()
      })

      expect(screen.getByText('testuser')).toBeInTheDocument()
      expect(screen.getByText('Repos: 2')).toBeInTheDocument()
    })

    test('handles invalid username "user"', async () => {
      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'user')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Please enter a specific GitHub username/i)).toBeInTheDocument()
      })
    })

    test('handles user not found error', async () => {
      api.getUserProfile.mockRejectedValue(new Error('No user found'))

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'nonexistentuser')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByText(/No GitHub user found with username "nonexistentuser"/i)).toBeInTheDocument()
      })
    })
  })

  describe('Input Parsing', () => {
    test('handles owner/repo format', async () => {
      const mockResponse = {
        data: {
          repoInfo: { name: 'repo' },
          vibeScore: { total: 85 },
          analysis: {}
        }
      }
      api.analyzeRepository.mockResolvedValue(mockResponse)

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'owner/repo')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(api.analyzeRepository).toHaveBeenCalledWith('https://github.com/owner/repo')
      })
    })

    test('handles invalid repository format', async () => {
      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'invalid/format/repo')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Invalid repository format/i)).toBeInTheDocument()
      })
    })

    test('handles empty input', async () => {
      const { user } = setup()

      // Don't type anything, just click submit
      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      // Should not make any API calls
      expect(api.analyzeRepository).not.toHaveBeenCalled()
      expect(api.getUserProfile).not.toHaveBeenCalled()
    })

    test('trims whitespace from input', async () => {
      const mockUserProfile = { 
        data: { login: 'testuser' } 
      }
      
      api.getUserProfile.mockResolvedValue(mockUserProfile)
      api.getUserRepositories.mockResolvedValue([])

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, '  testuser  ')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(api.getUserProfile).toHaveBeenCalledWith('testuser')
      })
    })
  })

  describe('Demo Mode', () => {
    test('can enter and exit demo mode', async () => {
      setup()

      // Enter demo mode
      const demoButtons = await screen.findAllByText('Try Demo')
      await userEvent.click(demoButtons[0])  // Click the first Try Demo button (in header)

      await waitFor(() => {
        expect(screen.getByTestId('demo-mode')).toBeInTheDocument()
      })

      // Exit demo mode
      const exitButton = screen.getByText('Exit Demo')
      await userEvent.click(exitButton)

      await waitFor(() => {
        expect(screen.queryByTestId('demo-mode')).not.toBeInTheDocument()
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })
    })

    test('can analyze repo from demo mode', async () => {
      const mockResponse = {
        data: {
          repoInfo: { name: 'demo-repo' },
          vibeScore: { total: 90 },
          analysis: {}
        }
      }
      api.analyzeRepository.mockResolvedValue(mockResponse)
      
      setup()

      // Enter demo mode
      const demoButtons = await screen.findAllByText('Try Demo')
      await userEvent.click(demoButtons[0])  // Click the first Try Demo button (in header)

      await waitFor(() => {
        expect(screen.getByTestId('demo-mode')).toBeInTheDocument()
      })

      // Analyze demo repo
      await userEvent.click(screen.getByText('Analyze Demo Repo'))

      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      })

      expect(api.analyzeRepository).toHaveBeenCalledWith('https://github.com/demo/repo')
    })
  })

  describe('About Section and Scrolling', () => {
    test('renders about section in ready state', () => {
      setup()

      expect(screen.getByText('Why Choose Vibe?')).toBeInTheDocument()
      expect(screen.getByText('Advanced')).toBeInTheDocument()
      expect(screen.getByText('12+')).toBeInTheDocument()
      expect(screen.getByText('Multi-Lang')).toBeInTheDocument()
      expect(screen.getByText('Real-time')).toBeInTheDocument()
    })

    test('scrolls to analysis section when clicking start button', async () => {
      const { user } = setup()

      const scrollButton = screen.getByText('Start Your Analysis')
      await user.click(scrollButton)

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      })
    })
  })

  describe('Profile View Navigation', () => {
    test('can navigate from profile to repository analysis', async () => {
      const mockUserProfile = { 
        data: { login: 'testuser' } 
      }
      const mockRepoResponse = {
        data: {
          repoInfo: { name: 'analyzed-repo' },
          vibeScore: { total: 88 },
          analysis: {}
        }
      }
      
      api.getUserProfile.mockResolvedValue(mockUserProfile)
      api.getUserRepositories.mockResolvedValue([{ name: 'repo1' }])
      api.analyzeRepository.mockResolvedValue(mockRepoResponse)

      const { user } = setup()

      // Search for user
      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'testuser')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('github-user-profile')).toBeInTheDocument()
      })

      // Analyze a repository from profile
      await user.click(screen.getByText('Analyze Repo'))

      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      })

      expect(screen.getByText('analyzed-repo')).toBeInTheDocument()
    })

    test('can start new search from profile view', async () => {
      const mockUserProfile = { 
        data: { login: 'testuser' } 
      }
      
      api.getUserProfile.mockResolvedValue(mockUserProfile)
      api.getUserRepositories.mockResolvedValue([])

      const { user } = setup()

      // Search for user
      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'testuser')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('github-user-profile')).toBeInTheDocument()
      })

      // Start new search
      await user.click(screen.getByText('New Search'))

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Edge Cases', () => {
    test('handles network errors', async () => {
      api.analyzeRepository.mockRejectedValue(new Error('Network error'))

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Input repository URL
      const input = screen.getByTestId('chat-input-field')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      })

      await act(async () => {
        fireEvent.click(screen.getByText('Send'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('handles API rate limiting', async () => {
      api.analyzeRepository.mockRejectedValue(new Error('API rate limit exceeded'))

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Input repository URL
      const input = screen.getByTestId('chat-input-field')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      })

      await act(async () => {
        fireEvent.click(screen.getByText('Send'))
      })

      await waitFor(() => {
        expect(screen.getByText(/rate limit/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Component Integration', () => {
    test('integrates with ChatInput component', async () => {
      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      expect(screen.getByPlaceholderText(/Enter GitHub username/)).toBeInTheDocument()
    })

    test('integrates with VibeScoreResults component', async () => {
      const mockResponse = {
        success: true,
        data: {
          repoInfo: { name: 'test-repo', stars: 100 },
          vibeScore: { total: 90 },
          analysis: {}
        }
      }
      api.analyzeRepository.mockResolvedValue(mockResponse)
      api.generateInsights = vi.fn().mockResolvedValue({ success: true, data: {} })

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Input repository URL
      const input = screen.getByTestId('chat-input-field')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      })

      await act(async () => {
        fireEvent.click(screen.getByText('Send'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('can start new analysis from results state', async () => {
      const mockResponse = {
        success: true,
        data: {
          repoInfo: { name: 'test-repo' },
          vibeScore: { total: 85 },
          analysis: {}
        }
      }
      api.analyzeRepository.mockResolvedValue(mockResponse)
      api.generateInsights = vi.fn().mockResolvedValue({ success: true, data: {} })

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // First analysis
      const input = screen.getByTestId('chat-input-field')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      })
      
      await act(async () => {
        fireEvent.click(screen.getByText('Send'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      }, { timeout: 3000 })

      // Start new analysis
      await act(async () => {
        fireEvent.click(screen.getByText('🔄 New Analysis'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })
    })
  })

  describe('State Management', () => {
    test('maintains proper state transitions', async () => {
      const mockResponse = {
        success: true,
        data: {
          repoInfo: { name: 'test-repo' },
          vibeScore: { total: 85 },
          analysis: {}
        }
      }
      api.analyzeRepository.mockResolvedValue(mockResponse)
      api.generateInsights = vi.fn().mockResolvedValue({ success: true, data: {} })

      const { user } = setup()

      // Initial state - ready
      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Input repository URL
      const input = screen.getByTestId('chat-input-field')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      })

      // Trigger analysis
      await act(async () => {
        fireEvent.click(screen.getByText('Send'))
      })

      // Results state
      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    test('handles loading states correctly', async () => {
      // Create a promise that we can control
      let resolveAnalysis
      const analysisPromise = new Promise((resolve) => {
        resolveAnalysis = resolve
      })
      api.analyzeRepository.mockReturnValue(analysisPromise)

      const { user } = setup()

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeInTheDocument()
      })

      // Button should be enabled before analysis
      expect(screen.getByText('Send')).toBeEnabled()

      // Input repository URL
      const input = screen.getByTestId('chat-input-field')
      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      })

      // Trigger analysis but don't resolve yet
      await act(async () => {
        fireEvent.click(screen.getByText('Send'))
      })

      // Loading spinner should appear
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      })

      // Resolve the analysis
      await act(async () => {
        resolveAnalysis({
          success: true,
          data: {
            repoInfo: { name: 'test-repo' },
            vibeScore: { total: 85 },
            analysis: {}
          }
        })
      })

      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('vibe-score-results-content')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Loading States', () => {
    test('shows correct loading message for user search', async () => {
      // Create a controlled promise for user profile
      let resolveUserProfile
      const userProfilePromise = new Promise((resolve) => {
        resolveUserProfile = resolve
      })
      api.getUserProfile.mockReturnValue(userProfilePromise)

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'testuser')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      // Should show loading with user profile message
      await waitFor(() => {
        expect(screen.getByText('Loading user profile...')).toBeInTheDocument()
      })

      // Resolve the promise
      await act(async () => {
        resolveUserProfile({ data: { login: 'testuser' } })
      })
    })

    test('shows correct loading message for repository analysis', async () => {
      // Create a controlled promise for repository analysis
      let resolveAnalysis
      const analysisPromise = new Promise((resolve) => {
        resolveAnalysis = resolve
      })
      api.analyzeRepository.mockReturnValue(analysisPromise)

      const { user } = setup()

      const input = screen.getByTestId('chat-input-field')
      await user.type(input, 'https://github.com/test/repo')

      await act(async () => {
        fireEvent.click(screen.getByTestId('chat-submit-button'))
      })

      // Should show loading with repository analysis message
      await waitFor(() => {
        expect(screen.getByText('Analyzing repository...')).toBeInTheDocument()
      })

      // Resolve the promise
      await act(async () => {
        resolveAnalysis({
          data: {
            repoInfo: { name: 'test-repo' },
            vibeScore: { total: 85 },
            analysis: {}
          }
        })
      })
    })
  })
})