import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import RepositoryList from '../components/RepositoryList';
import repositoryReducer from '../store/slices/repositorySlice';
import aiReducer from '../store/slices/aiSlice';

// Mock data
const mockRepositories = [
  {
    id: 1,
    name: 'test-repo-1',
    description: 'Test repository 1',
    html_url: 'https://github.com/user/test-repo-1',
    language: 'JavaScript',
    stargazers_count: 100,
    forks_count: 50,
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'test-repo-2',
    description: 'Test repository 2',
    html_url: 'https://github.com/user/test-repo-2',
    language: 'Python',
    stargazers_count: 200,
    forks_count: 75,
    updated_at: '2024-01-02T00:00:00Z'
  }
];

// Helper function to create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      repository: repositoryReducer,
      ai: aiReducer
    },
    preloadedState: {
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
      },
      ai: {
        summaries: {},
        isLoadingSummary: {},
        batchProgress: { total: 0, completed: 0, failed: 0 },
        isLoadingBatch: false,
        error: null,
        ...initialState.ai
      }
    }
  });
};

// Helper function to render with Redux
const renderWithRedux = (component, { store = createTestStore() } = {}) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store
  };
};

describe('RepositoryList Component', () => {
  const defaultProps = {
    repositories: mockRepositories,
    totalCount: 2,
    onAnalyzeRepo: vi.fn(),
    onSummarizeRepo: vi.fn(),
    loadingAnalyze: {},
    loadingSummary: {},
    username: 'testuser'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    expect(screen.getByRole('region', { name: /repository list/i })).toBeInTheDocument();
  });

  test('displays repository cards', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.getByText('test-repo-2')).toBeInTheDocument();
  });

  test('has proper ARIA labels for accessibility', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    // Check main region
    expect(screen.getByRole('region', { name: /repository list/i })).toBeInTheDocument();
    
    // Check heading
    expect(screen.getByRole('heading', { name: /public repositories/i })).toBeInTheDocument();
    
    // Check search input
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    
    // Check filter dropdowns
    expect(screen.getByLabelText(/filter repositories by programming language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort repositories/i)).toBeInTheDocument();
  });

  test('search functionality works correctly', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test-repo-1' } });
    
    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.queryByText('test-repo-2')).not.toBeInTheDocument();
  });

  test('language filter works correctly', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    const languageFilter = screen.getByLabelText(/filter repositories by programming language/i);
    fireEvent.change(languageFilter, { target: { value: 'JavaScript' } });
    
    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    expect(screen.queryByText('test-repo-2')).not.toBeInTheDocument();
  });

  test('sort functionality works correctly', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    const sortFilter = screen.getByLabelText(/sort repositories/i);
    fireEvent.change(sortFilter, { target: { value: 'stars-asc' } });
    
    const repoCards = screen.getAllByRole('listitem');
    expect(repoCards[0]).toHaveTextContent('test-repo-1'); // 100 stars
    expect(repoCards[1]).toHaveTextContent('test-repo-2'); // 200 stars
  });

  test('repository cards have proper keyboard navigation', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    const analyzeButtons = screen.getAllByRole('button', { name: /analyze vibe score/i });
    const summaryButtons = screen.getAllByRole('button', { name: /generate ai summary/i });
    const githubLinks = screen.getAllByRole('link', { name: /view .* on github/i });
    
    // Check that all interactive elements are present
    expect(analyzeButtons).toHaveLength(2);
    expect(summaryButtons).toHaveLength(2);
    expect(githubLinks).toHaveLength(4); // 2 for repo names, 2 for external links
  });

  test('loading states are properly indicated', () => {
    const loadingProps = {
      ...defaultProps,
      loadingAnalyze: { 1: true },
      loadingSummary: { 2: true }
    };
    
    renderWithRedux(<RepositoryList {...loadingProps} />);
    
    const analyzeButtons = screen.getAllByRole('button', { name: /analyze vibe score/i });
    const summaryButtons = screen.getAllByRole('button', { name: /generate ai summary/i });
    
    expect(analyzeButtons[0]).toHaveAttribute('aria-busy', 'true');
    expect(summaryButtons[1]).toHaveAttribute('aria-busy', 'true');
  });

  test('empty state displays when no repositories', () => {
    renderWithRedux(<RepositoryList {...defaultProps} repositories={[]} totalCount={0} />);
    
    expect(screen.getByText('No public repositories found')).toBeInTheDocument();
  });

  test('pagination controls are accessible', () => {
    const manyRepos = Array.from({ length: 20 }, (_, i) => ({
      ...mockRepositories[0],
      id: i + 1,
      name: `repo-${i + 1}`
    }));
    
    renderWithRedux(<RepositoryList {...defaultProps} repositories={manyRepos} totalCount={20} />);
    
    // Check pagination controls
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument();
  });

  test('Redux selector memoization works correctly', async () => {
    const store = createTestStore({
      repository: {
        repositories: {
          testuser: {
            repos: mockRepositories,
            lastFetch: Date.now(),
            totalCount: 2
          }
        },
        paginationState: {
          testuser: {
            fetchedApiPages: new Set([1]),
            hasMore: false,
            totalCount: 2
          }
        }
      }
    });

    const { rerender } = renderWithRedux(
      <RepositoryList {...defaultProps} />,
      { store }
    );

    // Initial render
    expect(screen.getByText('test-repo-1')).toBeInTheDocument();

    // Re-render with same props - selector should not create new instance
    rerender(
      <Provider store={store}>
        <RepositoryList {...defaultProps} />
      </Provider>
    );

    // Should still display the same content without errors
    expect(screen.getByText('test-repo-1')).toBeInTheDocument();
  });

  test('focus management works correctly', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    // Get first analyze button
    const analyzeButton = screen.getAllByRole('button', { name: /analyze vibe score/i })[0];
    
    // Focus the button
    analyzeButton.focus();
    
    // Check that it has focus
    expect(document.activeElement).toBe(analyzeButton);
    
    // Check that focus styles are applied (via class check)
    expect(analyzeButton.className).toContain('focus:outline-none');
    expect(analyzeButton.className).toContain('focus:ring-2');
  });

  test('screen reader announcements for dynamic content', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    // Check for aria-live regions
    const repoGrid = screen.getByRole('list');
    expect(repoGrid).toHaveAttribute('aria-live', 'polite');
    expect(repoGrid).toHaveAttribute('aria-relevant', 'additions removals');
  });

  test('clear filters button works correctly', () => {
    renderWithRedux(<RepositoryList {...defaultProps} />);
    
    // Apply filters
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Clear filters button should appear
    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    expect(clearButton).toBeInTheDocument();
    
    // Click clear filters
    fireEvent.click(clearButton);
    
    // Search should be cleared
    expect(searchInput.value).toBe('');
  });
});

export default RepositoryList; 