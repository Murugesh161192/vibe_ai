import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { useViewport, useDeviceType, useChartDimensions } from '../utils/responsive';
import { usePrefersReducedMotion, useAnnouncement, generateRadarChartDescription, generateNavigationAnnouncement } from '../utils/accessibility';

const RadarChart = memo(({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [focusedDataIndex, setFocusedDataIndex] = useState(-1);
  const [isChartFocused, setIsChartFocused] = useState(false);
  
  // Use responsive hooks
  const viewport = useViewport();
  const deviceType = useDeviceType();
  const dimensions = useChartDimensions(containerRef, 1);
  const prefersReducedMotion = usePrefersReducedMotion();
  const announce = useAnnouncement();



  // Enhanced data processing with better accessibility labels
  const radarData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];
    
    const metricLabels = {
      codeQuality: 'Code Quality',
      readability: 'Readability', 
      collaboration: 'Collaboration',
      innovation: 'Innovation',
      maintainability: 'Maintainability',
      inclusivity: 'Inclusivity',
      security: 'Security',
      performance: 'Performance',
      testingQuality: 'Testing Quality',
      communityHealth: 'Community Health',
      codeHealth: 'Code Health',
      releaseManagement: 'Release Management'
    };

    return Object.entries(data).map(([key, value], index) => ({
      axis: metricLabels[key] || key.replace(/([A-Z])/g, ' $1').trim(),
      value: Math.max(0, Math.min(100, value)),
      angle: (360 / Object.keys(data).length) * index,
      key,
      index
    }));
  }, [data]);

  // Memoize chart configuration based on device type
  const chartConfig = useMemo(() => {
    const { width, height } = dimensions;
    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';
    
    // Enhanced responsive sizing based on device type and viewport size
    const basePadding = isMobile ? 8 : isTablet ? 25 : 40;
    
    // Improved maximum size calculation with better mobile optimization
    let maxSize;
    if (isMobile) {
      // Mobile: Use more of the available space for better readability
      const availableWidth = Math.min(width - basePadding, viewport.width - 32);
      const availableHeight = height - basePadding;
      maxSize = Math.min(availableWidth, availableHeight, 340); // Increased from 280 to 340
    } else if (isTablet) {
      maxSize = Math.min(width - basePadding, height - basePadding, 380);
    } else {
      // Desktop: scale with viewport size, with intelligent limits
      const viewportScale = Math.min(viewport.width / 1280, viewport.height / 720);
      const scaledMaxSize = 420 + (viewportScale - 1) * 120; // Base 420px, scale up for larger screens
      maxSize = Math.min(width - basePadding, height - basePadding, Math.max(420, Math.min(scaledMaxSize, 600)));
    }
    
    const size = maxSize;
    // Optimized margins for mobile - reduced margin for more chart space
    const margin = isMobile ? 25 : isTablet ? 55 : Math.min(85, Math.max(75, size * 0.15));
    
    return {
      width: size,
      height: size,
      margin: margin,
      radius: (size - margin * 2) / 2,
      color: '#0EA5E9',
      strokeWidth: isMobile ? 2 : 3,
      pointRadius: isMobile ? 4 : 6,
      animationDuration: prefersReducedMotion ? 0 : 1000,
      animationDelay: prefersReducedMotion ? 0 : 100,
      labelOffset: isMobile ? 12 : 18,
      fontSize: isMobile ? '11px' : isTablet ? '12px' : '13px',
      fontWeight: '500'
    };
  }, [dimensions, deviceType, viewport.width, viewport.height, prefersReducedMotion]);

  // Create summary for screen readers using enhanced utility
  const chartSummary = useMemo(() => {
    return generateRadarChartDescription(radarData);
  }, [radarData]);

  // Enhanced navigation announcements - moved before handleKeyDown
  const announceNavigation = useCallback((index) => {
    if (index >= 0 && index < radarData.length) {
      const dataPoint = radarData[index];
      const navigationStatus = generateNavigationAnnouncement(index, radarData.length, 'metric');
      const valueInfo = `${dataPoint.axis}: ${Math.round(dataPoint.value)} out of 100`;
      announce(`${navigationStatus}. ${valueInfo}`);
    }
  }, [radarData, announce]);

  // Enhanced keyboard navigation with better announcements
  const handleKeyDown = useCallback((e) => {
    if (!isChartFocused || radarData.length === 0) return;
    
    let newIndex = focusedDataIndex;
    const maxIndex = radarData.length - 1;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = focusedDataIndex < maxIndex ? focusedDataIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = focusedDataIndex > 0 ? focusedDataIndex - 1 : maxIndex;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        announce('Moved to first metric');
        break;
      case 'End':
        e.preventDefault();
        newIndex = maxIndex;
        announce('Moved to last metric');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedDataIndex >= 0) {
          const dataPoint = radarData[focusedDataIndex];
          const detailedInfo = `${dataPoint.axis}: ${Math.round(dataPoint.value)} out of 100 points. Press Escape to close this information.`;
          announce(detailedInfo);
          setTooltip({
            show: true,
            content: `${dataPoint.axis}: ${Math.round(dataPoint.value)}`,
            x: viewport.width / 2,
            y: viewport.height / 2
          });
          setTimeout(() => setTooltip(prev => ({ ...prev, show: false })), 5000);
        }
        break;
      case 'Escape':
        setTooltip({ show: false, content: '', x: 0, y: 0 });
        announce('Information closed');
        break;
      default:
        return;
    }
    
    if (newIndex !== focusedDataIndex) {
      setFocusedDataIndex(newIndex);
      announceNavigation(newIndex);
    }
  }, [isChartFocused, focusedDataIndex, radarData, announce, announceNavigation, viewport.width, viewport.height]);

  // Enhanced mouse/touch handlers with better accessibility
  const handleMouseOver = useCallback((event, d) => {
    if (!d) return;
    
    const rect = event.target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setTooltip({
        show: true,
        content: `${d.axis}: ${Math.round(d.value)}`,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 10
      });
    }

    // Update focused index for consistency
    setFocusedDataIndex(d.index);
  }, []);

  const handleMouseOut = useCallback(() => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  }, []);

  const handleFocus = useCallback(() => {
    setIsChartFocused(true);
    if (focusedDataIndex === -1 && radarData.length > 0) {
      setFocusedDataIndex(0);
      announce(`Radar chart focused. ${chartSummary} Use arrow keys to navigate between data points. Press Enter or Space to hear detailed values. Press Home or End to jump to first or last metric.`);
    }
  }, [focusedDataIndex, radarData.length, announce, chartSummary]);

  const handleBlur = useCallback(() => {
    setIsChartFocused(false);
    setFocusedDataIndex(-1);
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  }, []);

  // Chart rendering effect with enhanced accessibility
  useEffect(() => {
    if (!radarData.length || !svgRef.current || !chartConfig) return;

    try {
      setError(null);
      
      const svg = d3.select(svgRef.current);
      
      // Ensure svg selection is valid
      if (!svg.node()) {
        return; // SVG element not found
      }
      
      svg.selectAll('*').remove();

      const config = chartConfig;
      
      // Set up SVG
      svg
        .attr('width', config.width)
        .attr('height', config.height)
        .attr('viewBox', `0 0 ${config.width} ${config.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Create main group
      const g = svg
        .append('g')
        .attr('transform', `translate(${config.width / 2}, ${config.height / 2})`);

      // Enhanced scales
      const rScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, config.radius]);

      // Create grid circles with better accessibility
      const gridLevels = [20, 40, 60, 80, 100];
      gridLevels.forEach((level, i) => {
        g.append('circle')
          .attr('r', rScale(level))
          .style('fill', 'none')
          .style('stroke', 'rgba(255, 255, 255, 0.1)')
          .style('stroke-width', '1px')
          .attr('role', 'presentation')
          .attr('aria-hidden', 'true');
      });

      // Create axis lines with better labels
      radarData.forEach((d, i) => {
        const lineCoords = {
          x: rScale(100) * Math.cos((d.angle - 90) * Math.PI / 180),
          y: rScale(100) * Math.sin((d.angle - 90) * Math.PI / 180)
        };

        // Axis line
        g.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', lineCoords.x)
          .attr('y2', lineCoords.y)
          .style('stroke', 'rgba(255, 255, 255, 0.2)')
          .style('stroke-width', '1px')
          .attr('role', 'presentation')
          .attr('aria-hidden', 'true');

        // Enhanced labels with better positioning
        const labelDistance = config.radius + config.labelOffset;
        const labelX = labelDistance * Math.cos((d.angle - 90) * Math.PI / 180);
        const labelY = labelDistance * Math.sin((d.angle - 90) * Math.PI / 180);

        g.append('text')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('fill', '#e5e7eb')
          .style('font-size', config.fontSize)
          .style('font-weight', config.fontWeight)
          .style('font-family', 'system-ui, -apple-system, sans-serif')
          .text(d.axis)
          .attr('role', 'presentation')
          .attr('aria-hidden', 'true');
      });

      // Create data visualization path
      const lineGenerator = d3.line()
        .x(d => rScale(d.value) * Math.cos((d.angle - 90) * Math.PI / 180))
        .y(d => rScale(d.value) * Math.sin((d.angle - 90) * Math.PI / 180))
        .curve(d3.curveLinearClosed);

      // Draw radar area - optimized with single path
      if (radarData && radarData.length > 0) {
        const pathElement = g.append('path');
        if (pathElement.datum) {
          pathElement
            .datum(radarData)
            .attr('d', lineGenerator)
            .style('fill', 'rgba(14, 165, 233, 0.15)')
            .style('stroke', config.color)
            .style('stroke-width', config.strokeWidth)
            .style('opacity', 0)
            .attr('role', 'presentation')
            .attr('aria-hidden', 'true')
            .transition()
            .duration(config.animationDuration)
            .style('opacity', 1);
        }
      }

      // Create enhanced data points with better accessibility
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
        .on('touchstart', (event, d) => {
          event.preventDefault();
          handleMouseOver(event, d);
        })
        .on('touchend', handleMouseOut)
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', d => `${d.axis}: ${Math.round(d.value)} out of 100. Press Enter for details.`)
        .each(function(d, i) {
          // Enhanced focus ring for better visibility
          d3.select(this)
            .style('outline', focusedDataIndex === i ? '2px solid #60a5fa' : 'none')
            .style('outline-offset', '2px');
        });

      // Animate points
      points
        .transition()
        .duration(config.animationDuration)
        .delay((d, i) => i * config.animationDelay)
        .attr('r', config.pointRadius);

      // Add center point
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 3)
        .style('fill', config.color)
        .style('opacity', 0.8)
        .attr('role', 'presentation')
        .attr('aria-hidden', 'true');

      setIsReady(true);

    } catch (e) {
      console.error('Error rendering radar chart:', e);
      setError('Error rendering chart: ' + e.message);
    }
  }, [radarData, chartConfig, handleMouseOver, handleMouseOut, focusedDataIndex]);

  // Update focus indicators when focusedDataIndex changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('.radar-point')
      .style('outline', (d, i) => focusedDataIndex === i ? '2px solid #60a5fa' : 'none')
      .style('outline-offset', '2px');
  }, [focusedDataIndex]);

  // Keyboard event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focus', handleFocus);
    container.addEventListener('blur', handleBlur);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focus', handleFocus);
      container.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleFocus, handleBlur]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60" role="status">
        <p>No data available for chart</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-2 sm:p-3 md:p-4" 
      ref={containerRef}
      style={{
        minHeight: deviceType === 'mobile' ? '280px' : deviceType === 'tablet' ? '380px' : viewport.width >= 1920 ? '500px' : '420px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite">
        {chartSummary}
      </div>
      
      <div 
        className="relative w-full h-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        style={{ 
          maxWidth: deviceType === 'mobile' ? '280px' : deviceType === 'tablet' ? '380px' : '600px',
          maxHeight: deviceType === 'mobile' ? '280px' : deviceType === 'tablet' ? '380px' : '600px',
          aspectRatio: '1 / 1',
          margin: '0 auto'
        }}
        tabIndex={0}
        role="img"
        aria-label={`Interactive radar chart. ${chartSummary} Use arrow keys to navigate between data points.`}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full" 
          style={{ 
            display: 'block', 
            maxWidth: '100%', 
            maxHeight: '100%',
            margin: '0 auto'
          }}
          aria-hidden="true"
        />
      </div>
      
      {/* Enhanced tooltip with better positioning and accessibility */}
      <div
        className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 border border-white/20 rounded-lg shadow-xl pointer-events-none transition-all duration-200 ${
          tooltip.show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          transform: 'translateX(-50%) translateY(-100%)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(17, 24, 39, 0.95)'
        }}
        role="tooltip"
        aria-live="polite"
        aria-atomic="true"
      >
        {tooltip.content}
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
          aria-hidden="true"
        />
      </div>

      {/* Keyboard instructions for screen readers */}
      <div className="sr-only" aria-live="polite">
        Chart navigation: Use arrow keys to move between data points. Press Enter or Space to announce values. Press Escape to close tooltip.
      </div>
    </div>
  );
});

RadarChart.displayName = 'RadarChart';

export default RadarChart; 