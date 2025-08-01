import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import RadarChart from '../components/RadarChart';
import * as d3 from 'd3';

// Create a more comprehensive mock for d3
vi.mock('d3', async () => {
  const originalD3 = await vi.importActual('d3');
  
  // Mock chainable object for selections
  const createMockSelection = () => ({
    selectAll: vi.fn(() => createMockSelection()),
    select: vi.fn(() => createMockSelection()),
    remove: vi.fn(() => createMockSelection()),
    data: vi.fn(() => createMockEnterSelection()),
    enter: vi.fn(() => createMockEnterSelection()),
    append: vi.fn(() => createMockSelection()),
    attr: vi.fn(() => createMockSelection()),
    style: vi.fn(() => createMockSelection()),
    text: vi.fn(() => createMockSelection()),
    on: vi.fn(() => createMockSelection()),
    datum: vi.fn(() => createMockSelection()),
    forEach: vi.fn(() => createMockSelection()),
  });

  const createMockEnterSelection = () => ({
    enter: vi.fn(() => createMockEnterSelection()),
    append: vi.fn(() => createMockSelection()),
    data: vi.fn(() => createMockEnterSelection()),
  });

  // Mock scale functions that are both callable and chainable
  const createMockScale = () => {
    const scaleFunction = vi.fn((value) => value * 2); // Simple scaling function
    scaleFunction.domain = vi.fn(() => scaleFunction);
    scaleFunction.range = vi.fn(() => scaleFunction);
    return scaleFunction;
  };

  const createMockOrdinalScale = () => {
    const ordinalScale = vi.fn((value) => '#0ea5e9'); // Return a color
    ordinalScale.range = vi.fn(() => ordinalScale);
    return ordinalScale;
  };

  return {
    ...originalD3,
    select: vi.fn(() => createMockSelection()),
    selectAll: vi.fn(() => createMockSelection()),
    scaleLinear: vi.fn(() => createMockScale()),
    scaleOrdinal: vi.fn(() => createMockOrdinalScale()),
    range: vi.fn(() => [1, 2, 3, 4, 5]),
    lineRadial: vi.fn(() => ({
      radius: vi.fn(() => ({
        angle: vi.fn(() => ({
          curve: vi.fn(() => vi.fn(() => 'mocked-path'))
        }))
      }))
    })),
    curveLinearClosed: 'mocked-curve',
  };
});

describe('RadarChart Component', () => {
  const mockData = {
    codeQuality: 95,
    readability: 80,
    collaboration: 90,
    innovation: 70,
  };

  test('renders the chart with the correct data', () => {
    const { container } = render(<RadarChart data={mockData} />);

    // Check that the chart container is rendered
    const chartContainer = container.querySelector('.radar-chart');
    expect(chartContainer).toBeTruthy();
    
    // Check that it's not showing error state
    expect(screen.queryByText(/Error rendering chart/i)).not.toBeInTheDocument();
    
    // Check that it's not showing empty state
    expect(screen.queryByText(/No data available for chart/i)).not.toBeInTheDocument();
    
    // Check that the relative container exists (the main component wrapper)
    const relativeContainer = container.querySelector('.relative');
    expect(relativeContainer).toBeTruthy();
  });

  test('handles empty data gracefully', () => {
    render(<RadarChart data={{}} />);
    expect(screen.getByText(/No data available for chart/i)).toBeInTheDocument();
  });

  test('handles d3 errors gracefully', () => {
    const originalError = console.error;
    console.error = vi.fn();

    // Reset and mock d3.select to throw an error
    vi.mocked(d3.select).mockImplementation(() => {
      throw new Error('d3 error');
    });

    render(<RadarChart data={mockData} />);
    expect(screen.getByText(/Error rendering chart/i)).toBeInTheDocument();

    console.error = originalError;
  });
}); 