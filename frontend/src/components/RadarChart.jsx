import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

const RadarChart = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Responsive chart configuration
  const getResponsiveConfig = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || 400;
    const isMobile = containerWidth < 480;
    const isTablet = containerWidth < 768;
    
    // Base size on container width with reasonable constraints
    const size = Math.min(containerWidth - 40, isMobile ? 350 : isTablet ? 450 : 500);
    
    return {
      width: size,
      height: size,
      margin: isMobile ? 50 : isTablet ? 60 : 70,
      levels: 5,
      maxValue: 100,
      roundStrokes: true,
      color: d3.scaleOrdinal().range(['#0ea5e9']),
      format: '.0f',
      labelFontSize: isMobile ? '10px' : isTablet ? '11px' : '12px',
      gridLabelFontSize: isMobile ? '8px' : '9px',
      pointRadius: isMobile ? 3 : 4,
      pointHoverRadius: isMobile ? 5 : 6
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newConfig = getResponsiveConfig();
        setDimensions({ width: newConfig.width, height: newConfig.height });
      }
    };

    // Set initial dimensions
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Optional: Use ResizeObserver for more precise container size tracking
    let resizeObserver;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [getResponsiveConfig]);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    try {
      // Get responsive configuration
      const config = getResponsiveConfig();
      
      // Clear previous chart
      d3.select(svgRef.current).selectAll('*').remove();

      // Setup dimensions
      const width = config.width;
      const height = config.height;
      const radius = Math.min(width, height) / 2 - config.margin;

      // Create SVG with responsive viewBox
      const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('aria-label', 'Vibe Score Radar Chart')
        .attr('role', 'img');

      // Create chart group
      const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      // Define metrics and their angles (12 metrics evenly distributed)
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

      // Scale for radius
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, config.maxValue]);

      // Create axis lines
      const axis = g.selectAll('.axis')
        .data(metrics)
        .enter()
        .append('g')
        .attr('class', 'axis')
        .attr('aria-label', d => `${d.label} axis`);

      // Draw axis lines
      axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', d => rScale(config.maxValue) * Math.cos((d.angle - 90) * Math.PI / 180))
        .attr('y2', d => rScale(config.maxValue) * Math.sin((d.angle - 90) * Math.PI / 180))
        .attr('class', 'radar-axis')
        .attr('stroke-width', 1);

      // Add axis labels with responsive positioning and font size
      axis.append('text')
        .attr('x', d => {
          const labelDistance = rScale(config.maxValue) + (width < 480 ? 15 : 20);
          return labelDistance * Math.cos((d.angle - 90) * Math.PI / 180);
        })
        .attr('y', d => {
          const labelDistance = rScale(config.maxValue) + (width < 480 ? 15 : 20);
          return labelDistance * Math.sin((d.angle - 90) * Math.PI / 180);
        })
        .attr('text-anchor', d => {
          const angle = d.angle;
          if (angle > 90 && angle < 270) return 'end';
          if (angle === 90 || angle === 270) return 'middle';
          return 'start';
        })
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-sm font-medium text-gray-700')
        .style('font-size', config.labelFontSize)
        .style('fill', 'rgba(255, 255, 255, 0.9)')
        .text(d => {
          // Truncate labels on very small screens
          if (width < 400 && d.label.length > 8) {
            return d.label.substring(0, 8) + '...';
          }
          return d.label;
        })
        .attr('aria-label', d => `${d.label} label`);

      // Create circular grid lines
      const gridLevels = d3.range(1, config.levels + 1);
      const gridValue = config.maxValue / config.levels;

      gridLevels.forEach(level => {
        const gridRadius = rScale(gridValue * level);
        
        // Create circular grid
        g.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', gridRadius)
          .attr('class', 'radar-grid-line')
          .attr('fill', 'none')
          .attr('aria-label', `Grid level ${level}`);

        // Add grid labels with responsive font size
        g.append('text')
          .attr('x', 0)
          .attr('y', -gridRadius - 5)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'bottom')
          .attr('class', 'text-xs text-gray-500')
          .style('font-size', config.gridLabelFontSize)
          .style('fill', 'rgba(255, 255, 255, 0.7)')
          .text(Math.round(gridValue * level))
          .attr('aria-label', `Grid value ${Math.round(gridValue * level)}`);
      });

      // Prepare data for radar chart
      const radarData = metrics.map(metric => ({
        axis: metric.label,
        value: data[metric.key] || 0,
        angle: metric.angle,
        key: metric.key
      }));

      // Create radar line
      const lineGenerator = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle(d => (d.angle - 90) * Math.PI / 180)
        .curve(d3.curveLinearClosed);

      // Draw radar area
      g.append('path')
        .datum(radarData)
        .attr('d', lineGenerator)
        .attr('class', 'radar-data-line')
        .attr('fill', 'rgba(14, 165, 233, 0.1)')
        .attr('stroke', '#0ea5e9')
        .attr('stroke-width', width < 480 ? 1.5 : 2)
        .attr('aria-label', 'Radar chart data area');

      // Create data points
      const points = g.selectAll('.radar-point')
        .data(radarData)
        .enter()
        .append('g')
        .attr('class', 'radar-point-group')
        .attr('aria-label', d => `${d.axis}: ${Math.round(d.value)} out of 100`);

      // Draw points with responsive sizing
      points.append('circle')
        .attr('cx', d => rScale(d.value) * Math.cos((d.angle - 90) * Math.PI / 180))
        .attr('cy', d => rScale(d.value) * Math.sin((d.angle - 90) * Math.PI / 180))
        .attr('r', config.pointRadius)
        .attr('class', 'radar-point')
        .attr('fill', '#0ea5e9')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', config.pointHoverRadius);
          setTooltip({
            show: true,
            content: `${d.axis}: ${Math.round(d.value)}/100`,
            x: event.pageX,
            y: event.pageY - 10
          });
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', config.pointRadius);
          setTooltip({ show: false, content: '', x: 0, y: 0 });
        })
        .on('focus', function(event, d) {
          d3.select(this).attr('r', config.pointHoverRadius);
          setTooltip({
            show: true,
            content: `${d.axis}: ${Math.round(d.value)}/100`,
            x: event.pageX,
            y: event.pageY - 10
          });
        })
        .on('blur', function() {
          d3.select(this).attr('r', config.pointRadius);
          setTooltip({ show: false, content: '', x: 0, y: 0 });
        })
        .attr('tabindex', 0);

      // Add center point with responsive sizing
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', width < 480 ? 2 : 3)
        .attr('fill', '#0ea5e9')
        .attr('aria-label', 'Chart center point');
    } catch (e) {
      console.error('Error rendering radar chart:', e);
      setError('Error rendering chart');
    }
  }, [data, dimensions, getResponsiveConfig]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data || Object.keys(data).length === 0) {
    return <div className="text-gray-500">No data available for chart.</div>;
  }

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div className="w-full h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          className="radar-chart max-w-full max-h-full"
          style={{ 
            width: `${dimensions.width}px`, 
            height: `${dimensions.height}px`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          aria-describedby="radar-chart-description"
        />
      </div>
      
      {/* Screen reader description */}
      <div id="radar-chart-description" className="sr-only">
        Radar chart showing vibe score breakdown. The chart has twelve axes representing different metrics: 
        Code Quality, Readability, Collaboration, Innovation, Maintainability, Inclusivity, Security, 
        Performance, Testing, Community Health, Code Health, and Release Management. 
        Each metric is scored from 0 to 100. Use tab to navigate between data points.
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
          role="tooltip"
          aria-live="polite"
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default RadarChart; 