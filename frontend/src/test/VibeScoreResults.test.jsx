import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import VibeScoreResults from '../components/VibeScoreResults';

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
    expect(screen.getByText('80-100: Excellent')).toBeInTheDocument();
    expect(screen.getByText('60-79: Good')).toBeInTheDocument();
    expect(screen.getByText('40-59: Fair')).toBeInTheDocument();
    expect(screen.getByText('0-39: Poor')).toBeInTheDocument();
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
}); 