import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect } from 'vitest';
import MetricBreakdown from '../components/MetricBreakdown';

describe('MetricBreakdown Component', () => {
  const mockBreakdown = {
    codeQuality: 95,
    readability: 80,
    collaboration: 90,
    innovation: 70,
    maintainability: 85,
    inclusivity: 75,
    security: 92,
    performance: 88,
    testingQuality: 78,
    communityHealth: 85,
    codeHealth: 90,
    releaseManagement: 82,
  };

  const mockWeights = {
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
  };

  test('renders the metric breakdown with the correct data', () => {
    render(<MetricBreakdown breakdown={mockBreakdown} weights={mockWeights} />);

    // Check that the metric labels are rendered
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    expect(screen.getByText('Readability')).toBeInTheDocument();
    expect(screen.getByText('Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();

    // Check that the metric values are rendered
    expect(screen.getAllByText('95').length).toBeGreaterThan(0);
    expect(screen.getAllByText('80').length).toBeGreaterThan(0);
    expect(screen.getAllByText('90').length).toBeGreaterThan(0);
    expect(screen.getAllByText('70').length).toBeGreaterThan(0);

    // Check that the metric weights are rendered
    expect(screen.getByText('16%')).toBeInTheDocument();
    expect(screen.getAllByText('12%').length).toBeGreaterThan(0);
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(<MetricBreakdown breakdown={{}} weights={{}} />);
    expect(screen.getByText('No Metrics Available')).toBeInTheDocument();
    expect(screen.getByText(/Metric breakdown data is not available for this repository/i)).toBeInTheDocument();
  });

  test('renders with fallback weights', () => {
    render(<MetricBreakdown breakdown={mockBreakdown} />);
    expect(screen.getByText('16%')).toBeInTheDocument();
  });

  test('toggles quick summary view', async () => {
    const user = userEvent.setup();
    render(<MetricBreakdown breakdown={mockBreakdown} weights={mockWeights} />);

    // Initially quick summary should be visible
    expect(screen.getByText('Metrics Overview')).toBeInTheDocument();
    expect(screen.getByText(/Most metrics are performing excellently!/i)).toBeInTheDocument();

    // Hide quick summary
    const hideButton = screen.getByRole('button', { name: /hide/i });
    await user.click(hideButton);

    // Quick summary should be hidden
    expect(screen.queryByText('Metrics Overview')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show overview/i })).toBeInTheDocument();

    // Show quick summary again
    const showButton = screen.getByRole('button', { name: /show overview/i });
    await user.click(showButton);

    // Quick summary should be visible again
    expect(screen.getByText('Metrics Overview')).toBeInTheDocument();
  });

  test('expands and collapses metric details', async () => {
    const user = userEvent.setup();
    render(<MetricBreakdown breakdown={mockBreakdown} weights={mockWeights} />);

    // Find the first expand button (Code Quality)
    const expandButtons = screen.getAllByRole('button', { name: /Show details for/i });
    const firstExpandButton = expandButtons[0];

    // Click to expand
    await user.click(firstExpandButton);

    // Check that detailed information is shown
    await waitFor(() => {
      expect(screen.getByText(/Evaluates testing frameworks, code structure, linting rules/i)).toBeInTheDocument();
    });
    
    // Check improvement suggestions based on score
    expect(screen.getByText(/Excellent work! Consider sharing your practices/i)).toBeInTheDocument();

    // Click to collapse
    await user.click(firstExpandButton);

    // Detailed information should be hidden
    await waitFor(() => {
      expect(screen.queryByText(/Evaluates testing frameworks, code structure, linting rules/i)).not.toBeInTheDocument();
    });
  });

  test('displays correct score classes for different score ranges', () => {
    const breakdownWithVariedScores = {
      codeQuality: 85,      // Excellent (>= 80)
      readability: 65,      // Good (60-79)
      collaboration: 45,    // Neutral (40-59)
      innovation: 35,       // Poor (< 40)
    };

    render(<MetricBreakdown breakdown={breakdownWithVariedScores} weights={mockWeights} />);

    // Check that scores have correct classes
    const scoreElements = screen.getAllByText(/\d+/).filter(el => 
      el.className.includes('vibe-score-')
    );

    // Find elements by their score values
    const excellentScore = scoreElements.find(el => el.textContent === '85');
    const goodScore = scoreElements.find(el => el.textContent === '65');
    const neutralScore = scoreElements.find(el => el.textContent === '45');
    const poorScore = scoreElements.find(el => el.textContent === '35');

    expect(excellentScore.className).toContain('vibe-score-excellent');
    expect(goodScore.className).toContain('vibe-score-good');
    expect(neutralScore.className).toContain('vibe-score-neutral');
    expect(poorScore.className).toContain('vibe-score-poor');
  });

  test('displays correct trend icons for different score ranges', () => {
    const breakdownWithVariedScores = {
      codeQuality: 80,      // Trending up (>= 75)
      readability: 60,      // Neutral (50-74)
      collaboration: 40,    // Trending down (< 50)
    };

    render(<MetricBreakdown breakdown={breakdownWithVariedScores} weights={mockWeights} />);

    // Check for trend icons (they are SVG elements with specific classes)
    const trendingUpIcons = document.querySelectorAll('svg.lucide-trending-up');
    const neutralIcons = document.querySelectorAll('svg.lucide-minus');
    const trendingDownIcons = document.querySelectorAll('svg.lucide-trending-down');

    // We should have 1 trending up (Code Quality: 80), 1 neutral (Innovation: 60), and 2 trending down
    expect(trendingUpIcons).toHaveLength(1);
    expect(neutralIcons).toHaveLength(1);
    expect(trendingDownIcons).toHaveLength(10); // All others are < 50
  });

  test('shows correct improvement suggestions for different score ranges', async () => {
    const user = userEvent.setup();
    const breakdownWithVariedScores = {
      codeQuality: 85,      // Excellent (>= 80)
      readability: 65,      // Good (60-79)
      collaboration: 45,    // Moderate (40-59)
      innovation: 35,       // Needs attention (< 40)
    };

    render(<MetricBreakdown breakdown={breakdownWithVariedScores} weights={mockWeights} />);

    // Expand all metrics to see their suggestions
    const expandButtons = screen.getAllByRole('button', { name: /Show details for/i });
    
    // Expand Code Quality (85 - Excellent)
    await user.click(expandButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Excellent work! Consider sharing your practices/i)).toBeInTheDocument();
    });

    // Expand Readability (65 - Good)
    await user.click(expandButtons[1]);
    await waitFor(() => {
      expect(screen.getByText(/Good foundation. Focus on consistency and advanced practices/i)).toBeInTheDocument();
    });

    // Expand Collaboration (45 - Moderate)
    await user.click(expandButtons[2]);
    await waitFor(() => {
      expect(screen.getByText(/Moderate performance. Implement best practices and monitoring/i)).toBeInTheDocument();
    });

    // Expand Innovation (35 - Needs attention)
    await user.click(expandButtons[3]);
    await waitFor(() => {
      // Check that improvement suggestions section exists
      expect(screen.getAllByText('Improvement Suggestions:').length).toBeGreaterThan(0);
    });
  });

  test('displays all metric categories correctly', () => {
    render(<MetricBreakdown breakdown={mockBreakdown} weights={mockWeights} />);

    // Check for category headers
    expect(screen.getByText('Core Metrics')).toBeInTheDocument();
    expect(screen.getByText('Enhancement Metrics')).toBeInTheDocument();
    expect(screen.getByText('Quality Metrics')).toBeInTheDocument();
  });

  test('handles metrics with undefined or null values', () => {
    const incompleteBreakdown = {
      codeQuality: 95,
      readability: null,
      collaboration: undefined,
      innovation: 0,
    };

    render(<MetricBreakdown breakdown={incompleteBreakdown} weights={mockWeights} />);

    // Should still render without crashing
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  test('calculates metric summary correctly', () => {
    render(<MetricBreakdown breakdown={mockBreakdown} weights={mockWeights} />);

    // Check for metric summary in quick overview
    // Count how many metrics are < 70 (needs attention)
    // None of the mockBreakdown values are < 70, so there should be 0 metrics needing attention
    expect(screen.getByText(/Most metrics are performing excellently!/i)).toBeInTheDocument();
  });

  test('displays weight information correctly', () => {
    render(<MetricBreakdown breakdown={mockBreakdown} weights={mockWeights} />);

    // Check that weights are displayed as percentages
    const weightElements = screen.getAllByText(/\d+%/);
    expect(weightElements.length).toBeGreaterThan(0);
    
    // Verify specific weights
    expect(screen.getByText('16%')).toBeInTheDocument(); // Code Quality
    expect(screen.getByText('15%')).toBeInTheDocument(); // Collaboration
  });

  test('handles edge case scores correctly', () => {
    const edgeCaseBreakdown = {
      codeQuality: 100,  // Maximum
      readability: 0,    // Minimum
      collaboration: 80, // Boundary between good and excellent
      innovation: 60,    // Boundary between neutral and good
      maintainability: 40, // Boundary between poor and neutral
    };

    render(<MetricBreakdown breakdown={edgeCaseBreakdown} weights={mockWeights} />);

    // Check that all scores are rendered
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('80').length).toBeGreaterThan(0);
    expect(screen.getAllByText('60').length).toBeGreaterThan(0);
    expect(screen.getAllByText('40').length).toBeGreaterThan(0);
  });
}); 