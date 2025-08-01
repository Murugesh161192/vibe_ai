import { render, screen } from '@testing-library/react';
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
    expect(screen.queryByText('Code Quality')).toBeInTheDocument();
  });

  test('renders with fallback weights', () => {
    render(<MetricBreakdown breakdown={mockBreakdown} />);
    expect(screen.getByText('16%')).toBeInTheDocument();
  });
}); 