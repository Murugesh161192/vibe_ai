import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import VibeScoreResults from '../components/VibeScoreResults';

// Mock RepositoryInsights component
vi.mock('../components/RepositoryInsights', () => ({
  default: ({ repoUrl, preloadedInsights, preloadedError, hideTitle }) => (
    <div data-testid="repository-insights">
      <div>Repository Insights for {repoUrl}</div>
      {preloadedInsights && <div>Insights: {JSON.stringify(preloadedInsights)}</div>}
      {preloadedError && <div>Error: {preloadedError}</div>}
      {hideTitle && <div>Title Hidden</div>}
    </div>
  )
}));

describe('VibeScoreResults Component', () => {
  const mockRepoInfo = {
    name: 'test-repo',
    fullName: 'test/test-repo',
    description: 'A test repository',
    language: 'JavaScript',
    stars: 100,
    forks: 50,
    openIssues: 15,
    watchers: 25,
    contributors: 10,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-01T00:00:00Z',
    url: 'https://github.com/test/test-repo',
    owner: 'test',
  };

  const mockVibeScore = {
    total: 85,
    breakdown: {
      codeQuality: 90,
      readability: 80,
      collaboration: 70,
      innovation: 85,
      maintainability: 75,
      inclusivity: 65,
      security: 88,
      performance: 82,
      testingQuality: 78,
      communityHealth: 72,
      codeHealth: 80,
      releaseManagement: 68,
    },
    weights: {
      codeQuality: 16,
      readability: 12,
      collaboration: 15,
      innovation: 8,
      maintainability: 8,
      inclusivity: 5,
      security: 12,
      performance: 8,
      testingQuality: 6,
      communityHealth: 4,
      codeHealth: 4,
      releaseManagement: 2,
    },
  };

  const mockAnalysis = {
    insights: [
      'Great community engagement.',
      'Comprehensive documentation.',
      'Good test coverage.',
      'High code quality.',
    ],
    testFiles: [],
    documentationFiles: [],
    dependencies: [],
    folderStructure: [],
  };

  const mockResult = {
    repoInfo: mockRepoInfo,
    vibeScore: mockVibeScore,
    analysis: mockAnalysis,
  };

  test('renders the main components', () => {
    render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

    expect(screen.getByText(/Vibe Score Analysis/i)).toBeInTheDocument();
    expect(screen.getAllByText('test-repo').length).toBeGreaterThan(0);
    // There are multiple score displays, so check that at least one exists
    expect(screen.getAllByText('85').length).toBeGreaterThan(0);
  });

  test('displays repository information', () => {
    render(
      <VibeScoreResults
        result={mockResult}
        onNewAnalysis={() => {}}
      />
    );

    expect(screen.getAllByText('test-repo').length).toBeGreaterThan(0);
    expect(screen.getByText('A test repository')).toBeInTheDocument();
  });

  test('displays repository statistics correctly', () => {
    render(
      <VibeScoreResults
        result={mockResult}
        onNewAnalysis={() => {}}
      />
    );

    // Check that all stats are displayed
    expect(screen.getAllByText('100').length).toBeGreaterThan(0); // Stars
    expect(screen.getByText('50')).toBeInTheDocument(); // Forks
    expect(screen.getByText('15')).toBeInTheDocument(); // Issues
    expect(screen.getByText('10')).toBeInTheDocument(); // Contributors
    
    // Check stat labels
    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(screen.getByText('Issues')).toBeInTheDocument();
    expect(screen.getByText('Contributors')).toBeInTheDocument();
  });

  test('displays score interpretation guide', () => {
    render(
      <VibeScoreResults
        result={mockResult}
        onNewAnalysis={() => {}}
      />
    );

    expect(screen.getByText(/Score Interpretation Guide/i)).toBeInTheDocument();
    expect(screen.getByText('55+: Enterprise Grade')).toBeInTheDocument();
    expect(screen.getByText('45-54: High Quality')).toBeInTheDocument();
    expect(screen.getByText('35-44: Good Standard')).toBeInTheDocument();
    expect(screen.getByText('Below 35: Needs Work')).toBeInTheDocument();
  });

  test('displays vibe score breakdown', () => {
    render(
      <VibeScoreResults
        result={mockResult}
        onNewAnalysis={() => {}}
      />
    );

    expect(screen.getByText(/Score Breakdown/i)).toBeInTheDocument();
  });

  test('displays analysis insights', () => {
    render(
      <VibeScoreResults
        result={mockResult}
        onNewAnalysis={() => {}}
      />
    );

    expect(screen.getByText('Great community engagement.')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive documentation.')).toBeInTheDocument();
    expect(screen.getByText('Good test coverage.')).toBeInTheDocument();
    expect(screen.getByText('High code quality.')).toBeInTheDocument();
  });

  test('handles missing data gracefully', () => {
    const resultWithMissingData = {
      ...mockResult,
      repoInfo: {
        ...mockRepoInfo,
        openIssues: undefined,
        watchers: undefined,
      },
      analysis: null,
    };
    
    render(<VibeScoreResults result={resultWithMissingData} onNewAnalysis={() => {}} />);

    expect(screen.getByText(/Vibe Score Analysis/i)).toBeInTheDocument();
    expect(screen.getAllByText('85').length).toBeGreaterThan(0);
    // Should display 0 for undefined values
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  describe('Vibe Score Color and Message', () => {
    test('displays excellent score message and color for score >= 80', () => {
      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);
      
      // Check for the emoji and text that's actually shown
      expect(screen.getByText('🎉 Enterprise-Grade Repository!')).toBeInTheDocument();
      expect(screen.getByText(/This repository meets the highest standards/)).toBeInTheDocument();
      
      // Check that the score has the correct color class
      // There might be multiple elements with text '85', so get all and check the main score
      const scoreElements = screen.getAllByText('85');
      const mainScore = scoreElements.find(el => el.className.includes('text-5xl') || el.className.includes('text-6xl'));
      expect(mainScore).toBeTruthy();
      expect(mainScore.className).toContain('vibe-score-excellent');
    });

    test('displays good score message and color for score 60-79', () => {
      const goodScoreResult = {
        ...mockResult,
        vibeScore: { ...mockVibeScore, total: 70 }
      };
      
      render(<VibeScoreResults result={goodScoreResult} onNewAnalysis={() => {}} />);
      
      // Check for the actual message displayed
      expect(screen.getByText('🎉 Enterprise-Grade Repository!')).toBeInTheDocument();
      expect(screen.getByText(/This repository meets the highest standards/)).toBeInTheDocument();
      
      const scoreElements = screen.getAllByText('70');
      // The main score display is the first one with the larger text
      expect(scoreElements[0].className).toContain('vibe-score-excellent');
    });

    test('displays fair score message and color for score 40-59', () => {
      const fairScoreResult = {
        ...mockResult,
        vibeScore: { ...mockVibeScore, total: 50 }
      };
      
      render(<VibeScoreResults result={fairScoreResult} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('👍 High-Quality Repository!')).toBeInTheDocument();
      expect(screen.getByText(/This repository shows strong engineering practices/)).toBeInTheDocument();
      
      const scoreElements = screen.getAllByText('50');
      // The main score display is the first one with the larger text
      expect(scoreElements[0].className).toContain('vibe-score-good');
    });

    test('displays poor score message and color for score < 40', () => {
      const poorScoreResult = {
        ...mockResult,
        vibeScore: { ...mockVibeScore, total: 30 }
      };
      
      render(<VibeScoreResults result={poorScoreResult} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('💪 Growth Opportunity')).toBeInTheDocument();
      expect(screen.getByText(/This repository has potential/)).toBeInTheDocument();
      
      const scoreElement = screen.getByText('30');
      expect(scoreElement.className).toContain('vibe-score-poor');
    });
  });

  describe('AI Insights Section', () => {
    test('shows AI insights preview when collapsed', () => {
      const resultWithAIInsights = {
        ...mockResult,
        aiInsights: {
          insights: {
            hotspotFiles: ['file1.js', 'file2.js'],
            codeQuality: { score: 85 },
            developmentPatterns: { active: true },
            recommendations: ['Rec 1', 'Rec 2', 'Rec 3']
          }
        }
      };
      
      render(<VibeScoreResults result={resultWithAIInsights} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('2 code hotspots identified')).toBeInTheDocument();
      expect(screen.getByText('Code quality assessment ready')).toBeInTheDocument();
      expect(screen.getByText('Development patterns analyzed')).toBeInTheDocument();
      expect(screen.getByText('3 actionable insights')).toBeInTheDocument();
    });

    test('expands and collapses AI insights', () => {
      const resultWithAIInsights = {
        ...mockResult,
        aiInsights: {
          insights: {
            hotspotFiles: ['file1.js'],
            recommendations: ['Rec 1']
          }
        }
      };
      
      render(<VibeScoreResults result={resultWithAIInsights} onNewAnalysis={() => {}} />);
      
      // Initially collapsed
      expect(screen.queryByTestId('repository-insights')).not.toBeInTheDocument();
      
      // Click to expand - button text is "View Details"
      const expandButton = screen.getByRole('button', { name: /View Details/i });
      fireEvent.click(expandButton);
      
      // Should show RepositoryInsights component
      expect(screen.getByTestId('repository-insights')).toBeInTheDocument();
      expect(screen.getByText(/Repository Insights for/)).toBeInTheDocument();
      
      // Click to collapse - button text changes to "Hide Details"
      const collapseButton = screen.getByRole('button', { name: /Hide Details/i });
      fireEvent.click(collapseButton);
      
      // Should hide again
      expect(screen.queryByTestId('repository-insights')).not.toBeInTheDocument();
    });

    test('shows AI insights error state with API key message', () => {
      const resultWithError = {
        ...mockResult,
        aiInsightsError: 'Missing API key configuration'
      };
      
      render(<VibeScoreResults result={resultWithError} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('AI insights require Gemini API configuration')).toBeInTheDocument();
    });

    test('shows AI insights error state with overloaded message', () => {
      const resultWithError = {
        ...mockResult,
        aiInsightsError: 'Service overloaded - 503 error'
      };
      
      render(<VibeScoreResults result={resultWithError} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('AI insights temporarily unavailable due to high demand • Basic analysis complete')).toBeInTheDocument();
    });

    test('shows generic AI insights error message', () => {
      const resultWithError = {
        ...mockResult,
        aiInsightsError: 'Unknown error occurred'
      };
      
      render(<VibeScoreResults result={resultWithError} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('AI insights temporarily unavailable • Basic analysis complete')).toBeInTheDocument();
    });

    test('shows fallback state for AI insights', () => {
      const resultWithFallback = {
        ...mockResult,
        aiInsights: {
          fallback: true,
          insights: {}
        }
      };
      
      render(<VibeScoreResults result={resultWithFallback} onNewAnalysis={() => {}} />);
      
      expect(screen.getByText('AI insights temporarily unavailable due to high demand • Showing basic analysis')).toBeInTheDocument();
    });

    test('does not show expand button when no AI insights or error', () => {
      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);
      
      expect(screen.queryByRole('button', { name: /View AI Analysis/i })).not.toBeInTheDocument();
    });
  });

  describe('Repository Actions', () => {
    test('calls onNewAnalysis when clicking new analysis button', () => {
      const mockOnNewAnalysis = vi.fn();
      render(<VibeScoreResults result={mockResult} onNewAnalysis={mockOnNewAnalysis} />);
      
      const button = screen.getByRole('button', { name: /New Analysis/i });
      fireEvent.click(button);
      
      expect(mockOnNewAnalysis).toHaveBeenCalled();
    });

    test('shows GitHub link in RepositoryInfo section', () => {
      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);
      
      // The link text is exactly "View on GitHub"
      const link = screen.getByText('View on GitHub').closest('a');
      expect(link).toHaveAttribute('href', `https://github.com/${mockResult.repoInfo.fullName}`);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // Share functionality tests
  describe('Share Functionality', () => {
    let mockWindowOpen;
    let mockClipboard;
    
    beforeEach(() => {
      // Mock window.open
      mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;
      
      // Mock clipboard API
      mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
      Object.assign(navigator, {
        clipboard: mockClipboard
      });
      
      // Mock window.location
      delete window.location;
      window.location = {
        origin: 'http://localhost:3000',
        pathname: '/',
        href: 'http://localhost:3000/'
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('displays share button', () => {
      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);
      expect(screen.getByText('Share Results')).toBeInTheDocument();
    });

    it('opens share menu when share button is clicked', () => {
      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      const shareButton = screen.getByText('Share Results');
      fireEvent.click(shareButton);

      expect(screen.getByText('Copy GitHub URL')).toBeInTheDocument();
      expect(screen.getByText('Copy Results Summary')).toBeInTheDocument();
      expect(screen.getByText('Copy Analysis Link')).toBeInTheDocument();
      expect(screen.getByText('Share on Twitter')).toBeInTheDocument();
      expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Share on WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Share by Email')).toBeInTheDocument();
    });

    it('copies repository link to clipboard', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue() };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Copy GitHub URL'));

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('https://github.com/test/test-repo');
      });
    });

    it('copies results summary to clipboard', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue() };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Copy Results Summary'));

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
        const copiedText = mockClipboard.writeText.mock.calls[0][0];
        expect(copiedText).toContain('Vibe Score Analysis for test-repo');
        expect(copiedText).toContain('Overall Score: 85/100');
      });
    });

    it('copies shareable URL to clipboard', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue() };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Copy Analysis Link'));

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
        const copiedText = mockClipboard.writeText.mock.calls[0][0];
        expect(copiedText).toContain('http://localhost:3000');
        expect(copiedText).toContain('?repo=test/test-repo');
      });
    });

    it('opens Twitter share dialog', () => {
      const mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Share on Twitter'));

      expect(mockWindowOpen).toHaveBeenCalled();
      const twitterUrl = mockWindowOpen.mock.calls[0][0];
      expect(twitterUrl).toContain('twitter.com/intent/tweet');
    });

    it('opens LinkedIn share dialog', () => {
      const mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Share on LinkedIn'));

      expect(mockWindowOpen).toHaveBeenCalled();
      const linkedInUrl = mockWindowOpen.mock.calls[0][0];
      expect(linkedInUrl).toContain('linkedin.com/sharing/share-offsite');
      expect(linkedInUrl).toContain('http%3A%2F%2Flocalhost%3A3000%3Frepo%3Dtest%2Ftest-repo');
    });

    it('opens WhatsApp share dialog', () => {
      const mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Share on WhatsApp'));

      expect(mockWindowOpen).toHaveBeenCalled();
      const whatsAppUrl = mockWindowOpen.mock.calls[0][0];
      expect(whatsAppUrl).toContain('wa.me/?text=');
    });

    it('creates email with results', async () => {
      const mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Share by Email'));

      // The component should now show email modal after a delay (since mailto might not work in test env)
      await waitFor(() => {
        expect(screen.getByText('Share via Email')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('closes share menu when clicking outside', () => {
      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      expect(screen.getByText('Copy GitHub URL')).toBeInTheDocument();

      // Click on the overlay
      const overlay = document.querySelector('.fixed.inset-0');
      fireEvent.click(overlay);

      expect(screen.queryByText('Copy GitHub URL')).not.toBeInTheDocument();
    });

    it('shows checkmark when item is copied', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue() };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      render(<VibeScoreResults result={mockResult} onNewAnalysis={() => {}} />);

      fireEvent.click(screen.getByText('Share Results'));
      fireEvent.click(screen.getByText('Copy GitHub URL'));

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });

      // Check for checkmark icon presence after copying
      await waitFor(() => {
        const checkCircles = document.querySelectorAll('.text-green-400');
        expect(checkCircles.length).toBeGreaterThan(0);
      });
    });
  });
}); 