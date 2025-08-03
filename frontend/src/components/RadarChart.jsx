import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import * as d3 from 'd3';

const RadarChart = memo(({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [isReady, setIsReady] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('RadarChart received data:', data);
  }, [data]);

  // Memoize chart configuration to prevent recalculation on every render
  const chartConfig = useMemo(() => {
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    const isMobile = containerWidth < 480;
    const isTablet = containerWidth < 768;
    
    // Use the smaller dimension to ensure the chart fits in the container
    const size = Math.min(containerWidth, containerHeight, 500);
    // Increase margins for better label visibility
    const margin = isMobile ? 60 : isTablet ? 80 : 100;
    
    return {
      width: size,
      height: size,
      margin: margin,
      levels: 5,
      maxValue: 100,
      roundStrokes: true,
      color: '#0ea5e9',
      labelFontSize: isMobile ? '11px' : isTablet ? '12px' : '14px',
      gridLabelFontSize: isMobile ? '9px' : '10px',
      pointRadius: isMobile ? 3 : 4,
      pointHoverRadius: isMobile ? 5 : 6,
      labelOffset: isMobile ? 10 : 15
    };
  }, [dimensions.width, dimensions.height]);

  // Memoize radar data processing
  const radarData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    const metrics = [
      { key: 'codeQuality', label: 'Code Quality', angle: 0 },
      { key: 'readability', label: 'Readability', angle: 30 },
      { key: 'collaboration', label: 'Collaboration', angle: 60 },
      { key: 'innovation', label: 'Innovation', angle: 90 },
      { key: 'maintainability', label: 'Maintainability', angle: 120 },
      { key: 'inclusivity', label: 'Inclusivity', angle: 150 },
      { key: 'security', label: 'Security', angle: 180 },
      { key: 'performance', label: 'Performance', angle: 210 },
      { key: 'testingQuality', label: 'Testing', angle: 240 },
      { key: 'communityHealth', label: 'Community', angle: 270 },
      { key: 'codeHealth', label: 'Code Health', angle: 300 },
      { key: 'releaseManagement', label: 'Releases', angle: 330 }
    ];

    return metrics.map(metric => ({
      axis: metric.label,
      value: Math.max(0, Math.min(100, data[metric.key] || 0)),
      angle: metric.angle
    }));
  }, [data]);

  // Optimized resize handler with debouncing
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 400;
      const containerHeight = rect.height || 400;
      console.log('Container dimensions:', containerWidth, containerHeight);
      
      setDimensions({ width: containerWidth, height: containerHeight });
      setIsReady(true);
    }
  }, []);

  // Memoize event handlers to prevent recreation
  const handleMouseOver = useCallback((event, d) => {
    setTooltip({
      show: true,
      content: `${d.axis}: ${Math.round(d.value)}/100`,
      x: event.pageX,
      y: event.pageY - 10
    });
  }, []);

  const handleMouseOut = useCallback(() => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  }, []);

  // Resize observer with debouncing
  useEffect(() => {
    // Add a small delay to ensure container is properly rendered
    const initTimeout = setTimeout(() => {
      handleResize(); // Set initial dimensions
      setIsReady(true);
    }, 100);
    
    // Use ResizeObserver for better performance
    let resizeObserver;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });
      resizeObserver.observe(containerRef.current);
    }
    
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150); // Debounce resize events
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(resizeTimeout);
      clearTimeout(initTimeout);
    };
  }, [handleResize]);

  // Optimized D3 rendering with memoization and performance optimizations
  useEffect(() => {
    if (!radarData.length || !svgRef.current || !isReady) {
      console.log('Chart not ready to render:', { 
        hasData: radarData.length > 0, 
        hasSvg: !!svgRef.current,
        isReady 
      });
      return;
    }

    try {
      console.log('Rendering radar chart with data:', radarData);
      
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous render

      const config = chartConfig;
      const radius = (Math.min(config.width, config.height) / 2) - config.margin;

      // Setup SVG with optimized attributes
      svg
        .attr('width', config.width)
        .attr('height', config.height)
        .attr('viewBox', `0 0 ${config.width} ${config.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      const g = svg.append('g')
        .attr('transform', `translate(${config.width / 2}, ${config.height / 2})`);

      // Scales
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, config.maxValue]);

      // Draw concentric circles (grid) - optimized
      const levels = d3.range(1, config.levels + 1).reverse();
      
      // Add subtle gradient background
      const defs = svg.append('defs');
      const radialGradient = defs.append('radialGradient')
        .attr('id', 'radar-gradient');
      
      radialGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(14, 165, 233, 0.05)');
      
      radialGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(14, 165, 233, 0)');
      
      // Background circle
      g.append('circle')
        .attr('r', radius)
        .style('fill', 'url(#radar-gradient)')
        .style('stroke', 'none');
      
      g.selectAll('.levels')
        .data(levels)
        .enter()
        .append('circle')
        .attr('r', d => radius / config.levels * d)
        .attr('class', 'radar-grid-line')
        .style('fill', 'none')
        .style('stroke', 'rgba(255, 255, 255, 0.1)')
        .style('stroke-width', '1px');

      // Create axis lines - optimized
      const axis = g.selectAll('.axis')
        .data(radarData)
        .enter()
        .append('g')
        .attr('class', 'axis');

      axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', d => rScale(config.maxValue) * Math.cos((d.angle - 90) * Math.PI / 180))
        .attr('y2', d => rScale(config.maxValue) * Math.sin((d.angle - 90) * Math.PI / 180))
        .style('stroke', 'rgba(255, 255, 255, 0.2)')
        .style('stroke-width', '1px');

      // Add labels - optimized positioning
      axis.append('text')
        .attr('x', d => {
          const labelDistance = radius + config.labelOffset;
          return labelDistance * Math.cos((d.angle - 90) * Math.PI / 180);
        })
        .attr('y', d => {
          const labelDistance = radius + config.labelOffset;
          return labelDistance * Math.sin((d.angle - 90) * Math.PI / 180);
        })
        .attr('text-anchor', d => {
          const angle = d.angle;
          if (angle === 0 || angle === 180) return 'middle';
          if (angle > 0 && angle < 180) return 'start';
          return 'end';
        })
        .attr('dominant-baseline', d => {
          const angle = d.angle;
          if (angle === 90) return 'text-after-edge';
          if (angle === 270) return 'text-before-edge';
          return 'middle';
        })
        .style('font-size', config.labelFontSize)
        .style('font-weight', '500')
        .style('fill', 'white')
        .style('text-shadow', '0 0 4px rgba(0,0,0,0.5)')
        .text(d => d.axis);

      // Add grid labels - optimized
      g.selectAll('.grid-label')
        .data(levels)
        .enter()
        .append('text')
        .attr('class', 'grid-label')
        .attr('x', 4)
        .attr('y', d => -radius / config.levels * d)
        .attr('dy', '0.4em')
        .style('font-size', config.gridLabelFontSize)
        .style('fill', 'rgba(255, 255, 255, 0.4)')
        .text(d => (config.maxValue / config.levels * d).toFixed(0));

      // Create line generator - optimized
      const lineGenerator = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle(d => (d.angle - 90) * Math.PI / 180)
        .curve(d3.curveLinearClosed);

      // Draw radar area - optimized with single path
      g.append('path')
        .datum(radarData)
        .attr('d', lineGenerator)
        .style('fill', 'rgba(14, 165, 233, 0.15)')
        .style('stroke', config.color)
        .style('stroke-width', '2.5px')
        .style('opacity', 0)
        .transition()
        .duration(600)
        .style('opacity', 1);

      // Create data points - optimized event handling
      const points = g.selectAll('.radar-point')
        .data(radarData)
        .enter()
        .append('circle')
        .attr('class', 'radar-point')
        .attr('cx', d => rScale(d.value) * Math.cos((d.angle - 90) * Math.PI / 180))
        .attr('cy', d => rScale(d.value) * Math.sin((d.angle - 90) * Math.PI / 180))
        .attr('r', 0)
        .style('fill', config.color)
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.5))')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('focus', handleMouseOver)
        .on('blur', handleMouseOut)
        .attr('tabindex', 0);

      // Animate points
      points
        .transition()
        .duration(800)
        .delay((d, i) => i * 30)
        .attr('r', config.pointRadius);

      // Add center point
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 3)
        .style('fill', config.color)
        .style('opacity', 0.8);

    } catch (e) {
      console.error('Error rendering radar chart:', e);
      setError('Error rendering chart: ' + e.message);
    }
  }, [radarData, chartConfig, handleMouseOver, handleMouseOut, isReady]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60">
        <p>No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4" ref={containerRef}>
      <div className="w-full max-w-md mx-auto" style={{ minHeight: '300px' }}>
        <svg ref={svgRef} className="w-full h-full" style={{ display: 'block' }} />
      </div>
      
      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px',
            pointerEvents: 'none'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
});

RadarChart.displayName = 'RadarChart';

export default RadarChart; 