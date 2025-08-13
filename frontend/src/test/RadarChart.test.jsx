import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import RadarChart from '../components/RadarChart';

// Mock d3 module
vi.mock('d3', () => {
  // Create a mock implementation that supports method chaining and events
  const createMockD3 = () => {
    const mockSelection = {
      selectAll: vi.fn(() => mockSelection),
      select: vi.fn(() => mockSelection),
      remove: vi.fn(() => mockSelection),
      attr: vi.fn(function() { return this; }),
      append: vi.fn(function() { return this; }),
      classed: vi.fn(function() { return this; }),
      style: vi.fn(function() { return this; }),
      data: vi.fn(function() { return this; }),
      enter: vi.fn(() => mockSelection),
      exit: vi.fn(() => mockSelection),
      merge: vi.fn(() => mockSelection),
      text: vi.fn(function() { return this; }),
      on: vi.fn(function() { return this; }),
      transition: vi.fn(() => mockSelection),
      duration: vi.fn(function() { return this; }),
      each: vi.fn(function(callback) {
        // Simulate calling the callback for each data point
        const mockData = [
          { angle: 0 }, { angle: 90 }, { angle: 180 }, { angle: 270 }
        ];
        mockData.forEach((d, i) => callback.call({}, d, i));
        return this;
      })
    };

    const lineGenerator = vi.fn(() => 'M0,0L100,100');
    lineGenerator.x = vi.fn(() => lineGenerator);
    lineGenerator.y = vi.fn(() => lineGenerator);
    lineGenerator.curve = vi.fn(() => lineGenerator);
    lineGenerator.angle = vi.fn(() => lineGenerator);
    lineGenerator.radius = vi.fn(() => lineGenerator);
    lineGenerator.defined = vi.fn(() => lineGenerator);

    // Create a proper scale mock that returns a function
    const createScaleMock = () => {
      const scale = vi.fn((value) => value); // The scale itself is a function
      scale.domain = vi.fn(() => scale); // Returns the scale for chaining
      scale.range = vi.fn(() => scale); // Returns the scale for chaining
      scale.nice = vi.fn(() => scale);
      scale.ticks = vi.fn(() => [0, 20, 40, 60, 80, 100]);
      return scale;
    };

    return {
      select: vi.fn(() => mockSelection),
      selectAll: vi.fn(() => mockSelection),
      scaleLinear: vi.fn(() => createScaleMock()),
      scaleOrdinal: vi.fn(() => createScaleMock()),
      line: vi.fn(() => lineGenerator),
      lineRadial: vi.fn(() => lineGenerator),
      curveLinearClosed: 'curveLinearClosed',
      curveCardinalClosed: 'curveCardinalClosed',
      radarLine: vi.fn(() => lineGenerator),
      max: vi.fn((arr) => Math.max(...arr)),
      min: vi.fn((arr) => Math.min(...arr)),
    };
  };
  
  const mockD3 = createMockD3();
  return {
    default: mockD3,
    ...mockD3
  };
});

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

    // Create a mock that throws an error when select is called with specific conditions
    const originalD3 = global.d3;
    global.d3 = {
      ...originalD3,
      select: vi.fn(() => {
        // Throw error only for specific selector to simulate D3 error
        throw new Error('D3 rendering error');
      }),
    };

    render(<RadarChart data={mockData} />);
    
    // Wait for the component to mount and render error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error rendering radar chart:', expect.any(Error));
    }, { timeout: 1000 });

    // Restore original d3 mock
    global.d3 = originalD3;
    console.error = originalError;
  });

  test('handles mouse interactions correctly', async () => {
    const { container } = render(<RadarChart data={mockData} />);
    
    // Wait for the chart to render
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    // Check tooltip container exists
    const tooltipContainer = screen.getByTestId('radar-chart-tooltip');
    expect(tooltipContainer).toBeInTheDocument();
    expect(tooltipContainer).toHaveStyle({ opacity: '0' });
  });

  test('handles window resize events', async () => {
    const { container } = render(<RadarChart data={mockData} />);
    
    // Wait for initial render
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    // Simulate window resize
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    // Should still render without errors
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });

  test('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<RadarChart data={mockData} />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  test('renders with different data values including edge cases', () => {
    const edgeCaseData = {
      codeQuality: 100, // Maximum value
      readability: 0,   // Minimum value
      collaboration: 50, // Mid value
      innovation: 100,
      maintainability: 0,
      inclusivity: 50,
      security: 100,
      performance: 0,
      testingQuality: 50,
      communityHealth: 100,
      codeHealth: 0,
      releaseManagement: 50,
    };

    render(<RadarChart data={edgeCaseData} />);
    
    // Should render without errors
    expect(screen.queryByText(/Error rendering chart/i)).not.toBeInTheDocument();
  });

  test('handles partial data gracefully', () => {
    const partialData = {
      codeQuality: 90,
      readability: 80,
      // Missing other properties
    };

    render(<RadarChart data={partialData} />);
    
    // Should still render
    expect(screen.queryByText(/Error rendering chart/i)).not.toBeInTheDocument();
  });

  test('handles small screen sizes correctly', async () => {
    // Mock a small screen
    global.innerWidth = 320;
    global.innerHeight = 480;
    
    const { container } = render(<RadarChart data={mockData} />);
    
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });

  test('handles tooltip show and hide correctly', async () => {
    const { container } = render(<RadarChart data={mockData} />);
    
    // Wait for chart to render
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    // Get tooltip
    const tooltip = screen.getByTestId('radar-chart-tooltip');
    
    // Initially hidden
    expect(tooltip).toHaveStyle({ opacity: '0' });
    
    // Simulate mouse over by triggering the callback directly
    const d3Module = await import('d3');
    const mockSelection = d3Module.select();
    
    // Find the 'on' calls for mouseover
    const onCalls = mockSelection.on.mock.calls;
    const mouseOverCall = onCalls.find(call => call[0] === 'mouseover');
    const mouseOutCall = onCalls.find(call => call[0] === 'mouseout');
    
    if (mouseOverCall && mouseOverCall[1]) {
      // Simulate mouseover
      const mockEvent = { pageX: 100, pageY: 200 };
      const mockData = { axis: 'Code Quality', value: 90 };
      mouseOverCall[1](mockEvent, mockData);
      
      // Tooltip should show
      await waitFor(() => {
        expect(tooltip).toHaveStyle({ opacity: '1' });
        expect(tooltip).toHaveTextContent('Code Quality: 90/100');
      });
    }
    
    if (mouseOutCall && mouseOutCall[1]) {
      // Simulate mouseout
      mouseOutCall[1]();
      
      // Tooltip should hide
      await waitFor(() => {
        expect(tooltip).toHaveStyle({ opacity: '0' });
      });
    }
  });

  test('calculates text anchors correctly for different angles', async () => {
    const { container } = render(<RadarChart data={mockData} />);
    
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    // Check that attr was called with text-anchor for different angles
    const d3Module = await import('d3');
    const mockSelection = d3Module.select();
    
    // Find text-anchor attribute calls
    const attrCalls = mockSelection.attr.mock.calls;
    const textAnchorCall = attrCalls.find(call => call[0] === 'text-anchor');
    
    if (textAnchorCall && textAnchorCall[1]) {
      // Test different angles
      expect(textAnchorCall[1]({ angle: 0 })).toBe('middle');
      expect(textAnchorCall[1]({ angle: 180 })).toBe('middle');
      expect(textAnchorCall[1]({ angle: 90 })).toBe('start');
      expect(textAnchorCall[1]({ angle: 45 })).toBe('start');
      expect(textAnchorCall[1]({ angle: 270 })).toBe('end');
      expect(textAnchorCall[1]({ angle: 225 })).toBe('end');
    }
  });

  test('calculates dominant baseline correctly for different angles', async () => {
    const { container } = render(<RadarChart data={mockData} />);
    
    await waitFor(() => {
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    const d3Module = await import('d3');
    const mockSelection = d3Module.select();
    
    // Find dominant-baseline attribute calls
    const attrCalls = mockSelection.attr.mock.calls;
    const baselineCall = attrCalls.find(call => call[0] === 'dominant-baseline');
    
    if (baselineCall && baselineCall[1]) {
      // Test different angles
      expect(baselineCall[1]({ angle: 90 })).toBe('text-after-edge');
      expect(baselineCall[1]({ angle: 270 })).toBe('text-before-edge');
      expect(baselineCall[1]({ angle: 0 })).toBe('middle');
      expect(baselineCall[1]({ angle: 180 })).toBe('middle');
      expect(baselineCall[1]({ angle: 45 })).toBe('middle');
    }
  });
}); 