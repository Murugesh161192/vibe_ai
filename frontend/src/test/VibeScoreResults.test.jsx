import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import VibeScoreResults from '../components/VibeScoreResults';

describe('VibeScoreResults Component', () => {
  const mockRepoInfo = {
    name: 'test-repo',
    description: 'A test repository',
    stars: 100,
    forks: 50,
    contributors: 10,
    url: 'https://github.com/test/test-repo',
  };

  const mockVibeScore = {
    total: 85,
    breakdown: {
      community: 90,
      documentation: 80,
      testing: 70,
      code_quality: 95,
    },
  };

  const mockAnalysis = {
    insights: [
      'Great community engagement.',
      'Comprehensive documentation.',
      'Good test coverage.',
      'High code quality.',
    ],
    recommendations: ['Consider adding more integration tests'],
    documentationFiles: [],
    testFiles: [],
    dependencies: [],
    folderStructure: [],
  };

  const mockResult = {
    repoInfo: mockRepoInfo,
    vibeScore: mockVibeScore,
    analysis: mockAnalysis,
  };

  test('renders the main components', () => {
    render(<VibeScoreResults result={mockResult} onAnalyzeAnother={() => {}} />);

    expect(screen.getByText(/Vibe Score Results/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'test-repo' })).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Excellent Vibes!/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Detailed Metrics/i })).toBeInTheDocument();
    expect(screen.getByText(/Analysis Insights/i)).toBeInTheDocument();
    expect(screen.getByText(/Repository Statistics/i)).toBeInTheDocument();
  });

  test('displays the correct vibe message for different scores', () => {
    const scores = {
      95: /Excellent Vibes!/i,
      85: /Excellent Vibes!/i,
      75: /Good Vibes!/i,
      65: /Good Vibes!/i,
      45: /Decent Vibes/i,
      25: /Room for Improvement/i,
    };

    let rerender;

    for (const [score, message] of Object.entries(scores)) {
      const vibeScore = { ...mockVibeScore, total: Number(score) };
      if (rerender) {
        rerender(
          <VibeScoreResults
            result={{
              repoInfo: mockRepoInfo,
              vibeScore: vibeScore,
              analysis: mockAnalysis,
            }}
            onAnalyzeAnother={() => {}}
          />
        );
      } else {
        ({ rerender } = render(
          <VibeScoreResults
            result={{
              repoInfo: mockRepoInfo,
              vibeScore: vibeScore,
              analysis: mockAnalysis,
            }}
            onAnalyzeAnother={() => {}}
          />
        ));
      }
      expect(screen.getByText(message, { selector: 'div:not(.sr-only)' })).toBeInTheDocument();
    }
  });

  test('shows loading state when analysis is not available', () => {
    render(<VibeScoreResults result={{ ...mockResult, analysis: null }} onAnalyzeAnother={() => {}} />);
    expect(screen.queryByText(/Analysis Insights/i)).not.toBeInTheDocument();
  });


}); 