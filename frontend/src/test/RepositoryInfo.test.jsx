import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import RepositoryInfo from '../components/RepositoryInfo'

describe('RepositoryInfo Component', () => {
  const mockRepoInfo = {
    name: 'test-repo',
    description: 'A test repository for testing purposes',
    language: 'JavaScript',
    createdAt: '2020-01-01',
    updatedAt: '2023-07-21',
    fullName: 'user/test-repo'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders repository name and description', () => {
      render(<RepositoryInfo repoInfo={mockRepoInfo} />)
      
      expect(screen.getByText('test-repo')).toBeInTheDocument()
      expect(screen.getByText(/A test repository for testing purposes/i)).toBeInTheDocument()
    })

    test('renders repository metadata', () => {
      render(<RepositoryInfo repoInfo={mockRepoInfo} />)
      
      expect(screen.getByText(/JavaScript/i)).toBeInTheDocument()
      expect(screen.getByText(/Created January 1, 2020/i)).toBeInTheDocument()
      expect(screen.getByText(/Updated July 21, 2023/i)).toBeInTheDocument()
    })

    test('renders view on GitHub button', () => {
      render(<RepositoryInfo repoInfo={mockRepoInfo} />)
      
      expect(screen.getByRole('link', { name: /view test-repo on github/i })).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    test('handles missing description', () => {
      const repoInfoWithoutDesc = { ...mockRepoInfo, description: '' }
      render(<RepositoryInfo repoInfo={repoInfoWithoutDesc} />)
      
      expect(screen.getByText('test-repo')).toBeInTheDocument()
      expect(screen.queryByText(/A test repository for testing purposes/i)).not.toBeInTheDocument()
    })

    test('handles missing language', () => {
      const repoInfoWithoutLang = { ...mockRepoInfo, language: null }
      render(<RepositoryInfo repoInfo={repoInfoWithoutLang} />)
      
      expect(screen.getByText(/Not specified/i)).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles empty repoInfo object', () => {
      expect(() => {
        render(<RepositoryInfo repoInfo={{}} />)
      }).not.toThrow()
    })

    test('handles missing repoInfo prop', () => {
      render(<RepositoryInfo />)
      expect(screen.queryByText('test-repo')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<RepositoryInfo repoInfo={mockRepoInfo} />)
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })
  })
}) 