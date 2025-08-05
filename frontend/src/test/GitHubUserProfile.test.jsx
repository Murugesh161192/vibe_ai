import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import GitHubUserProfile from '../components/GitHubUserProfile'

// Mock the API service
vi.mock('../services/api', () => ({
  summarizeReadme: vi.fn()
}))

import { summarizeReadme } from '../services/api'

describe('GitHubUserProfile Component', () => {
  const mockOnAnalyzeRepo = vi.fn()
  const mockSummarizeReadme = vi.mocked(summarizeReadme)

  const mockUser = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/identicons/testuser.png',
    html_url: 'https://github.com/testuser',
    bio: 'Test bio',
    location: 'Test City',
    company: 'Test Company',
    email: 'test@example.com',
    blog: 'https://testblog.com',
    public_repos: 25,
    followers: 1000,
    following: 50,
    public_gists: 10,
    created_at: '2020-01-01T00:00:00Z'
  }

  const mockRepositories = [
    {
      id: 1,
      name: 'test-repo-1',
      full_name: 'testuser/test-repo-1',
      html_url: 'https://github.com/testuser/test-repo-1',
      description: 'Test repository 1',
      language: 'JavaScript',
      stargazers_count: 100,
      forks_count: 20,
      owner: { login: 'testuser' }
    },
    {
      id: 2,
      name: 'test-repo-2',
      full_name: 'testuser/test-repo-2',
      html_url: 'https://github.com/testuser/test-repo-2',
      description: 'Test repository 2',
      language: 'Python',
      stargazers_count: 50,
      forks_count: 10,
      owner: { login: 'testuser' }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.alert to prevent jsdom errors
    window.alert = vi.fn()
    mockOnAnalyzeRepo.mockClear()
    mockSummarizeReadme.mockClear()
  })

  afterEach(() => {
    // Restore window.alert
    delete window.alert
  })

  describe('Initial Render', () => {
    test('renders user profile with complete data', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('@testuser')).toBeInTheDocument()
      expect(screen.getByText('Test bio')).toBeInTheDocument()
    })

    test('renders user avatar', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const avatar = screen.getByAltText("testuser's avatar")
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://github.com/identicons/testuser.png')
    })

    test('renders user statistics', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('25')).toBeInTheDocument() // public_repos
      expect(screen.getByText('1.0K')).toBeInTheDocument() // followers
      expect(screen.getAllByText('50')).toHaveLength(2) // following (appears in user stats and repo stats)
      expect(screen.getAllByText('10')).toHaveLength(2) // public_gists (appears in user stats and repo stats)
    })

    test('renders user details', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('Test City')).toBeInTheDocument()
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('https://testblog.com')).toBeInTheDocument()
      expect(screen.getByText(/Joined January 1, 2020/)).toBeInTheDocument()
    })

    test('renders GitHub profile link', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const githubLink = screen.getByRole('link', { name: /view on github/i })
      expect(githubLink).toBeInTheDocument()
      expect(githubLink).toHaveAttribute('href', 'https://github.com/testuser')
    })
  })

  describe('User Data Handling', () => {
    test('handles missing user data gracefully', () => {
      render(<GitHubUserProfile user={null} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('Unknown User')).toBeInTheDocument()
      expect(screen.getByText('@unknown')).toBeInTheDocument()
    })

    test('handles partial user data', () => {
      const partialUser = {
        login: 'partialuser',
        avatar_url: 'https://github.com/identicons/partialuser.png'
      }
      
      render(<GitHubUserProfile user={partialUser} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('partialuser')).toBeInTheDocument()
      expect(screen.getByText('@partialuser')).toBeInTheDocument()
    })

    test('handles missing optional fields', () => {
      const minimalUser = {
        login: 'minimaluser',
        avatar_url: 'https://github.com/identicons/minimaluser.png'
      }
      
      render(<GitHubUserProfile user={minimalUser} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('minimaluser')).toBeInTheDocument()
      expect(screen.queryByText('Test City')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Company')).not.toBeInTheDocument()
    })
  })

  describe('Number Formatting', () => {
    test('formats large numbers correctly', () => {
      const userWithLargeNumbers = {
        ...mockUser,
        followers: 1500000,
        following: 2500,
        public_repos: 500
      }
      
      render(<GitHubUserProfile user={userWithLargeNumbers} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('1.5M')).toBeInTheDocument() // followers
      expect(screen.getByText('2.5K')).toBeInTheDocument() // following
      expect(screen.getByText('500')).toBeInTheDocument() // public_repos
    })

    test('handles zero values', () => {
      const userWithZeros = {
        ...mockUser,
        followers: 0,
        following: 0,
        public_repos: 0,
        public_gists: 0
      }
      
      render(<GitHubUserProfile user={userWithZeros} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getAllByText('0')).toHaveLength(4)
    })

    test('handles invalid number values', () => {
      const userWithInvalidNumbers = {
        ...mockUser,
        followers: null,
        following: undefined,
        public_repos: 'invalid'
      }
      
      render(<GitHubUserProfile user={userWithInvalidNumbers} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getAllByText('0')).toHaveLength(3)
    })
  })

  describe('Date Formatting', () => {
    test('formats valid dates correctly', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText(/Joined January 1, 2020/)).toBeInTheDocument()
    })

    test('handles missing date', () => {
      const userWithoutDate = { ...mockUser, created_at: null }
      
      render(<GitHubUserProfile user={userWithoutDate} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('Joined Unknown')).toBeInTheDocument()
    })

    test('handles invalid date', () => {
      const userWithInvalidDate = { ...mockUser, created_at: 'invalid-date' }
      render(<GitHubUserProfile user={userWithInvalidDate} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // The formatDate function will fail to parse 'invalid-date' and return 'Invalid date'
      // But `new Date('invalid-date').toLocaleDateString()` might not throw, it returns "Invalid Date"
      // Let's check what actually gets rendered
      const joinedElement = screen.getByText(/Joined/)
      expect(joinedElement.textContent).toMatch(/Joined (Invalid Date|Invalid date)/)
    })
  })

  describe('Repositories Section', () => {
    test('renders repositories when available', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('Public Repositories (2)')).toBeInTheDocument()
      expect(screen.getByText('test-repo-1')).toBeInTheDocument()
      expect(screen.getByText('test-repo-2')).toBeInTheDocument()
    })

    test('renders repository details correctly', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('Test repository 1')).toBeInTheDocument()
      expect(screen.getByText('Test repository 2')).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument() // stars
      expect(screen.getAllByText('50')).toHaveLength(2) // stars (appears in user stats and repo stats)
      expect(screen.getByText('20')).toBeInTheDocument() // forks
      expect(screen.getAllByText('10')).toHaveLength(2) // forks (appears in user stats and repo stats)
    })

    test('renders no repositories message when empty', () => {
      render(<GitHubUserProfile user={mockUser} repositories={[]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      expect(screen.getByText('No Public Repositories')).toBeInTheDocument()
      expect(screen.getByText(/This user hasn't published any public repositories yet/)).toBeInTheDocument()
    })

    test('handles null repositories', () => {
      render(<GitHubUserProfile user={mockUser} repositories={null} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // When repositories is null, the repositories section should not be rendered at all
      expect(screen.queryByText(/Public Repositories/)).not.toBeInTheDocument()
    })
  })

  describe('Repository Actions', () => {
    test('calls onAnalyzeRepo when analyze button is clicked', async () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const analyzeButtons = screen.getAllByText('Analyze Vibe')
      fireEvent.click(analyzeButtons[0])
      
      await waitFor(() => {
        expect(mockOnAnalyzeRepo).toHaveBeenCalledWith('https://github.com/testuser/test-repo-1')
      })
    })

    test('calls summarizeReadme when summary button is clicked', async () => {
      mockSummarizeReadme.mockResolvedValue({ summary: 'Test summary', isMock: false })
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const summaryButtons = screen.getAllByText('Smart Summary')
      fireEvent.click(summaryButtons[0])
      
      await waitFor(() => {
        expect(mockSummarizeReadme).toHaveBeenCalledWith('testuser', 'test-repo-1')
      })
    })

    test('handles repository analysis error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      mockOnAnalyzeRepo.mockRejectedValue(new Error('Analysis failed'))
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const analyzeButtons = screen.getAllByText('Analyze Vibe')
      fireEvent.click(analyzeButtons[0])
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Analysis failed for test-repo-1'))
      })
      
      consoleSpy.mockRestore()
      alertSpy.mockRestore()
    })

    test('handles summarization error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      mockSummarizeReadme.mockRejectedValue(new Error('Summarization failed'))
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const summaryButtons = screen.getAllByText('Smart Summary')
      fireEvent.click(summaryButtons[0])
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Summary Failed for test-repo-1'))
      })
      
      consoleSpy.mockRestore()
      alertSpy.mockRestore()
    })

    test('shows loading state during analysis', async () => {
      mockOnAnalyzeRepo.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const analyzeButtons = screen.getAllByText('Analyze Vibe')
      fireEvent.click(analyzeButtons[0])
      
      expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    })

    test('shows loading state during summarization', async () => {
      mockSummarizeReadme.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const summaryButtons = screen.getAllByText('Smart Summary')
      fireEvent.click(summaryButtons[0])
      
      expect(screen.getByText('Summarizing...')).toBeInTheDocument()
    })
  })

  describe('Repository URL Construction', () => {
    test('constructs URL from owner and name', async () => {
      const repoWithOwner = {
        id: 1,
        name: 'test-repo',
        owner: { login: 'testuser' },
        html_url: 'https://github.com/testuser/test-repo'
      }
      
      render(<GitHubUserProfile user={mockUser} repositories={[repoWithOwner]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const analyzeButton = screen.getByText('Analyze Vibe')
      fireEvent.click(analyzeButton)
      
      await waitFor(() => {
        expect(mockOnAnalyzeRepo).toHaveBeenCalledWith('https://github.com/testuser/test-repo')
      })
    })

    test('constructs URL from full_name', async () => {
      const repoWithFullName = {
        id: 1,
        name: 'test-repo',
        full_name: 'testuser/test-repo',
        html_url: 'https://github.com/testuser/test-repo'
      }
      
      render(<GitHubUserProfile user={mockUser} repositories={[repoWithFullName]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const analyzeButton = screen.getByText('Analyze Vibe')
      fireEvent.click(analyzeButton)
      
      await waitFor(() => {
        expect(mockOnAnalyzeRepo).toHaveBeenCalledWith('https://github.com/testuser/test-repo')
      })
    })

    test('handles missing repository data', async () => {
      const mockRepoWithoutFullName = {
        ...mockRepositories[0],
        owner: null,
        name: 'incomplete-repo'
      }
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<GitHubUserProfile user={mockUser} repositories={[mockRepoWithoutFullName]} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      // The button is labeled "Smart Summary" not "Get Summary"
      const summarizeButton = screen.getAllByRole('button', { name: /Smart Summary/i })[0]
      fireEvent.click(summarizeButton)
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Summary Failed for incomplete-repo'))
      })
      
      consoleSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })

  describe('Summary Functionality', () => {
    test('displays mock summary with demo mode warning', async () => {
      mockSummarizeReadme.mockResolvedValue({ summary: 'Test summary', isMock: true })
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const summaryButtons = screen.getAllByText('Smart Summary')
      fireEvent.click(summaryButtons[0])
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️ Demo Mode: Configure API key for full capabilities'))
      })
      
      alertSpy.mockRestore()
    })

    test('displays real summary with timestamp', async () => {
      mockSummarizeReadme.mockResolvedValue({ summary: 'Test summary', isMock: false })
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const summaryButtons = screen.getAllByText('Smart Summary')
      fireEvent.click(summaryButtons[0])
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('📝 Generated:'))
      })
      
      alertSpy.mockRestore()
    })
  })

  describe('Avatar Error Handling', () => {
    test('handles avatar load error', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const avatar = screen.getByAltText("testuser's avatar")
      fireEvent.error(avatar)
      
      expect(avatar).toHaveAttribute('src', 'https://github.com/identicons/default.png')
    })
  })

  describe('Link Handling', () => {
    test('renders email link correctly', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const emailLink = screen.getByText('test@example.com')
      expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com')
    })

    test('renders blog link with https prefix', () => {
      const userWithHttpBlog = { ...mockUser, blog: 'https://testblog.com' }
      
      render(<GitHubUserProfile user={userWithHttpBlog} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const blogLink = screen.getByText('https://testblog.com')
      expect(blogLink).toHaveAttribute('href', 'https://testblog.com')
    })

    test('renders blog link without https prefix', () => {
      const userWithoutHttpBlog = { ...mockUser, blog: 'testblog.com' }
      
      render(<GitHubUserProfile user={userWithoutHttpBlog} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const blogLink = screen.getByText('testblog.com')
      expect(blogLink).toHaveAttribute('href', 'https://testblog.com')
    })
  })

  describe('Accessibility', () => {
    test('has proper alt text for avatar', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const avatar = screen.getByAltText("testuser's avatar")
      expect(avatar).toBeInTheDocument()
    })

    test('has proper target and rel attributes for external links', () => {
      render(<GitHubUserProfile user={mockUser} repositories={mockRepositories} onAnalyzeRepo={mockOnAnalyzeRepo} />)
      
      const githubLink = screen.getByRole('link', { name: /view on github/i })
      expect(githubLink).toHaveAttribute('target', '_blank')
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
}) 