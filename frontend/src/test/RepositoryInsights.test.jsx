import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RepositoryInsights from '../components/RepositoryInsights';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api', () => ({
  generateInsights: vi.fn()
}));

describe('RepositoryInsights Component', () => {
  const mockRepoUrl = 'https://github.com/facebook/react';
  const mockRepoName = 'facebook/react';

  const mockInsightsData = {
    success: true,
    data: {
      insights: {
        hotspotFiles: [
          {
            file: 'src/index.js',
            reason: 'High complexity and frequent changes',
            recommendation: 'Consider refactoring into smaller modules'
          },
          {
            file: 'src/components/App.js',
            reason: 'Large file with multiple responsibilities',
            recommendation: 'Split into separate component files'
          }
        ],
        contributorInsights: {
          mostActive: ['user1', 'user2', 'user3'],
          collaborationPattern: 'Strong collaboration with regular code reviews',
          recommendation: 'Maintain current collaboration practices'
        },
        codeQuality: {
          strengths: ['Well-documented', 'Good test coverage', 'Clean architecture'],
          concerns: ['Some legacy code', 'Complex build process']
        },
        recommendations: [
          { priority: 'high', area: 'Performance', suggestion: 'Optimize bundle size by implementing code splitting' },
          { priority: 'medium', area: 'Testing', suggestion: 'Increase integration test coverage' },
          { priority: 'low', area: 'Documentation', suggestion: 'Add more inline code comments' }
        ]
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render the generate insights button initially', () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      const button = screen.getByRole('button', { name: /Generate AI Insights/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('backdrop-blur-md');
    });

    it('should display sparkles icon in the button', () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      const button = screen.getByRole('button');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when generating insights', async () => {
      api.generateInsights.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      const button = screen.getByRole('button', { name: /Generate AI Insights/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Generating AI-powered insights/i)).toBeInTheDocument();
      });
      
      // Should show loading spinner
      const spinner = screen.getByText(/Generating AI-powered insights/i).previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      api.generateInsights.mockResolvedValue(mockInsightsData);
    });

    it('should display insights after successful generation', async () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      const button = screen.getByRole('button', { name: /Generate AI Insights/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Powered Repository Insights')).toBeInTheDocument();
      });
    });

    it('should display hotspot files section', async () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Code Hotspots')).toBeInTheDocument();
        expect(screen.getByText('src/index.js')).toBeInTheDocument();
        expect(screen.getByText('High complexity and frequent changes')).toBeInTheDocument();
        expect(screen.getByText('💡 Consider refactoring into smaller modules')).toBeInTheDocument();
      });
    });

    it('should display contributor insights', async () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Team Insights')).toBeInTheDocument();
        expect(screen.getByText('user1, user2, user3')).toBeInTheDocument();
        expect(screen.getByText('Strong collaboration with regular code reviews')).toBeInTheDocument();
      });
    });

    it('should display code quality assessment', async () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Code Quality Assessment')).toBeInTheDocument();
        expect(screen.getByText('Strengths')).toBeInTheDocument();
        expect(screen.getByText('• Well-documented')).toBeInTheDocument();
        expect(screen.getByText('Areas of Concern')).toBeInTheDocument();
        expect(screen.getByText('• Some legacy code')).toBeInTheDocument();
      });
    });

    it('should display recommendations with priority badges', async () => {
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('📋 Actionable Recommendations')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
        expect(screen.getByText('LOW')).toBeInTheDocument();
        expect(screen.getByText('Optimize bundle size by implementing code splitting')).toBeInTheDocument();
      });
    });

    it('should show regenerate button after insights are displayed', async () => {
      const mockInsightsData = {
        success: true,
        data: {
          insights: {
            hotspotFiles: [
              {
                file: 'src/index.js',
                reason: 'High complexity and frequent changes',
                recommendation: 'Consider refactoring into smaller modules'
              },
              {
                file: 'src/components/App.js',
                reason: 'Large file with multiple responsibilities',
                recommendation: 'Split into separate component files'
              }
            ],
            contributorInsights: {
              mostActive: ['user1', 'user2', 'user3'],
              collaborationPattern: 'Strong collaboration with regular code reviews',
              recommendation: 'Maintain current collaboration practices'
            },
            codeQuality: {
              strengths: ['Well-documented', 'Good test coverage', 'Clean architecture'],
              concerns: ['Some legacy code', 'Complex build process']
            },
            recommendations: [
              {
                priority: 'high',
                area: 'Performance',
                suggestion: 'Optimize bundle size by implementing code splitting'
              },
              {
                priority: 'medium',
                area: 'Testing',
                suggestion: 'Increase integration test coverage'
              },
              {
                priority: 'low',
                area: 'Documentation',
                suggestion: 'Add more inline code comments'
              }
            ]
          }
        }
      };
      api.generateInsights.mockResolvedValue(mockInsightsData);
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      const button = screen.getByRole('button', { name: /Generate AI Insights/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      // Find the regenerate button by its title
      const regenerateButton = screen.getByRole('button', { name: /Regenerate insights/i });
      expect(regenerateButton).toBeInTheDocument();
    });

    it('should allow refreshing the insights', async () => {
      const mockInsightsData = {
        success: true,
        data: {
          insights: {
            hotspotFiles: [
              {
                file: 'src/index.js',
                reason: 'High complexity and frequent changes',
                recommendation: 'Consider refactoring into smaller modules'
              },
              {
                file: 'src/components/App.js',
                reason: 'Large file with multiple responsibilities',
                recommendation: 'Split into separate component files'
              }
            ],
            contributorInsights: {
              mostActive: ['user1', 'user2', 'user3'],
              collaborationPattern: 'Strong collaboration with regular code reviews',
              recommendation: 'Maintain current collaboration practices'
            },
            codeQuality: {
              strengths: ['Well-documented', 'Good test coverage', 'Clean architecture'],
              concerns: ['Some legacy code', 'Complex build process']
            },
            recommendations: [
              {
                priority: 'high',
                area: 'Performance',
                suggestion: 'Optimize bundle size by implementing code splitting'
              },
              {
                priority: 'medium',
                area: 'Testing',
                suggestion: 'Increase integration test coverage'
              },
              {
                priority: 'low',
                area: 'Documentation',
                suggestion: 'Add more inline code comments'
              }
            ]
          }
        }
      };
      api.generateInsights.mockResolvedValue(mockInsightsData);
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      const button = screen.getByRole('button', { name: /Generate AI Insights/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
      
      // Find and click the refresh button
      const refreshButton = screen.getByRole('button', { name: /Regenerate insights/i });
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(api.generateInsights).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to generate insights due to API error';
      api.generateInsights.mockRejectedValue(new Error(errorMessage));
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display generic error for unknown errors', async () => {
      api.generateInsights.mockRejectedValue({});
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to generate insights')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty insights data gracefully', async () => {
      const emptyInsights = {
        success: true,
        data: {
          insights: {
            hotspotFiles: [],
            contributorInsights: null,
            codeQuality: {
              strengths: [],
              concerns: []
            },
            recommendations: null
          }
        }
      };
      
      api.generateInsights.mockResolvedValue(emptyInsights);
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('AI-Powered Repository Insights')).toBeInTheDocument();
        // Should not show empty sections
        expect(screen.queryByText('Code Hotspots')).not.toBeInTheDocument();
        expect(screen.queryByText('📋 Actionable Recommendations')).not.toBeInTheDocument();
      });
    });

    it('should handle partial insights data', async () => {
      const partialInsights = {
        success: true,
        data: {
          insights: {
            hotspotFiles: [
              {
                file: 'test.js',
                reason: 'Needs attention',
                recommendation: 'Review this file'
              }
            ],
            // Other fields missing
          }
        }
      };
      
      api.generateInsights.mockResolvedValue(partialInsights);
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Code Hotspots')).toBeInTheDocument();
        expect(screen.getByText('test.js')).toBeInTheDocument();
        // Other sections should not crash
      });
    });

    it('should show loading state when regenerating insights', async () => {
      api.generateInsights.mockResolvedValue(mockInsightsData);
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Regenerate Insights/i })).toBeInTheDocument();
      });
      
      // Mock a slow second request
      let resolveFn;
      const slowPromise = new Promise((resolve) => { resolveFn = resolve; });
      api.generateInsights.mockReturnValue(slowPromise);
      
      fireEvent.click(screen.getByRole('button', { name: /Regenerate Insights/i }));
      
      // Check that loading state is shown
      expect(screen.getByText(/Generating AI-powered insights/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Regenerate insights/i })).toBeInTheDocument();
      
      // Clean up by resolving the promise
      resolveFn(mockInsightsData);
      
      // Wait for loading to complete and button to reappear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Regenerate Insights/i })).toBeInTheDocument();
      });
    });
  });

  describe('Priority Badge Colors', () => {
    it('should apply correct colors for different priorities', async () => {
      api.generateInsights.mockResolvedValue(mockInsightsData);
      
      render(<RepositoryInsights repoUrl={mockRepoUrl} repoName={mockRepoName} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Generate AI Insights/i }));
      
      await waitFor(() => {
        const highPriority = screen.getByText('HIGH');
        const mediumPriority = screen.getByText('MEDIUM');
        const lowPriority = screen.getByText('LOW');
        
        expect(highPriority).toHaveClass('bg-red-500/20', 'text-red-300');
        expect(mediumPriority).toHaveClass('bg-yellow-500/20', 'text-yellow-300');
        expect(lowPriority).toHaveClass('bg-green-500/20', 'text-green-300');
      });
    });
  });
}); 