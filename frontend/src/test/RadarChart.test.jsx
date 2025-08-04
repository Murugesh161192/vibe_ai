import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import RadarChart from '../components/RadarChart';

// Mock d3 module
vi.mock('d3', () => ({
  default: {
    select: vi.fn(() => ({
      selectAll: vi.fn(() => ({ remove: vi.fn() })),
      attr: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      classed: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
    })),
    scaleLinear: vi.fn(() => ({ domain: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis() })),
    line: vi.fn(() => ({ curve: vi.fn().mockReturnThis() })),
    curveLinearClosed: vi.fn(),
  },
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({ remove: vi.fn() })),
    attr: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    classed: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
  })),
  scaleLinear: vi.fn(() => ({ domain: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis() })),
  line: vi.fn(() => ({ curve: vi.fn().mockReturnThis() })),
  curveLinearClosed: vi.fn(),
}));

describe('RadarChart Component', () => {
  const mockData = {
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
  };

  test('renders the chart with the correct data', () => {
    const { container } = render(<RadarChart data={mockData} />);

    // Check that the chart container is rendered
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // Check that it's not showing error state
    expect(screen.queryByText(/Error rendering chart/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No data available for chart/i)).not.toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    render(<RadarChart data={{}} />);
    expect(screen.getByText('No data available for chart')).toBeInTheDocument();
  });

  test('handles d3 errors gracefully', async () => {
    const originalError = console.error;
    console.error = vi.fn(); // Suppress error logs

    // Temporarily modify the mocked d3.select to throw an error
    const d3Module = await import('d3');
    const originalSelect = d3Module.select;
    
    d3Module.select = vi.fn(() => {
      throw new Error('D3 rendering error');
    });

    render(<RadarChart data={mockData} />);
    
    // Wait for the component to mount and render error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error rendering radar chart:', expect.any(Error));
    }, { timeout: 1000 });

    // The error should be displayed
    expect(screen.getByText(/Error rendering chart/)).toBeInTheDocument();

    // Restore mocks
    console.error = originalError;
    d3Module.select = originalSelect;
  });
}); 