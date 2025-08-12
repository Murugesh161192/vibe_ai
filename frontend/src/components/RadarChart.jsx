import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import * as d3 from 'd3';
import { useViewport, useDeviceType, useChartDimensions } from '../utils/responsive';
import { usePrefersReducedMotion } from '../utils/accessibility';

const RadarChart = memo(({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  // Use responsive hooks
  const viewport = useViewport();
  const deviceType = useDeviceType();
  const dimensions = useChartDimensions(containerRef, 1);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Debug logging
  useEffect(() => {
    console.log('🎯 RadarChart - Using Genuine API Data:');
    console.log('  Data received from parent:', data);
    console.log('  Data type:', typeof data);
    console.log('  Data keys:', data ? Object.keys(data) : 'null');
    console.log('  Data values:', data ? Object.values(data) : 'null');
    
    // Check for specific expected keys
    if (data) {
      const expectedKeys = ['codeQuality', 'readability', 'collaboration', 'innovation', 
                           'maintainability', 'inclusivity', 'security', 'performance',
                           'testingQuality', 'communityHealth', 'codeHealth', 'releaseManagement'];
      const presentKeys = expectedKeys.filter(key => key in data && data[key] !== undefined);
      const missingKeys = expectedKeys.filter(key => !(key in data) || data[key] === undefined);
      
      console.log('  ✅ Present metrics:', presentKeys.length, presentKeys);
      if (missingKeys.length > 0) {
        console.log('  ❌ Missing metrics:', missingKeys.length, missingKeys);
      }
      console.log('  All values are valid numbers?', Object.values(data).every(v => typeof v === 'number' && !isNaN(v)));
    }
  }, [data]);

  // Memoize chart configuration based on device type
  const chartConfig = useMemo(() => {
    const { width, height } = dimensions;
    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';
    
    // Enhanced responsive sizing based on device type and viewport size
    const basePadding = isMobile ? 15 : isTablet ? 25 : 40;
    
    // Improved maximum size calculation for larger screens
    let maxSize;
    if (isMobile) {
      maxSize = Math.min(width - basePadding, height - basePadding, 280);
    } else if (isTablet) {
      maxSize = Math.min(width - basePadding, height - basePadding, 380);
    } else {
      // Desktop: scale with viewport size, with intelligent limits
      const viewportScale = Math.min(viewport.width / 1280, viewport.height / 720);
      const scaledMaxSize = 420 + (viewportScale - 1) * 120; // Base 420px, scale up for larger screens
      maxSize = Math.min(width - basePadding, height - basePadding, Math.max(420, Math.min(scaledMaxSize, 600)));
    }
    
    const size = maxSize;
    const margin = isMobile ? 35 : isTablet ? 55 : Math.min(85, Math.max(75, size * 0.15));
    
          return {
        width: size,
        height: size,
        margin: margin,
        levels: 5,
        maxValue: 100,
        roundStrokes: true,
        color: '#0ea5e9',
        labelFontSize: isMobile ? '9px' : isTablet ? '11px' : size > 500 ? '15px' : '13px',
        gridLabelFontSize: isMobile ? '7px' : isTablet ? '8px' : size > 500 ? '10px' : '9px',
        pointRadius: isMobile ? 2 : isTablet ? 2.5 : size > 500 ? 4.5 : 3.5,
        pointHoverRadius: isMobile ? 3.5 : isTablet ? 4.5 : size > 500 ? 6.5 : 5.5,
        labelOffset: isMobile ? 10 : isTablet ? 14 : size > 500 ? 22 : 18,
        strokeWidth: isMobile ? '1.5px' : isTablet ? '2px' : size > 500 ? '3px' : '2.5px',
        animationDuration: prefersReducedMotion ? 0 : isMobile ? 400 : 600,
        animationDelay: prefersReducedMotion ? 0 : isMobile ? 20 : 30
      };
  }, [dimensions, deviceType, prefersReducedMotion]);

  // Memoize radar data processing
  const radarData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      console.log('📊 RadarChart: No API data available');
      return [];
    }

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

    console.log('📊 Processing genuine API metrics:');
    console.log('  Input data keys:', Object.keys(data));
    console.log('  Input data:', data);
    
    const processedData = metrics.map(metric => {
      const value = data[metric.key];
      // Handle both undefined and null values, and ensure it's a number
      const numericValue = typeof value === 'number' ? value : 0;
      const processedValue = Math.max(0, Math.min(100, numericValue));
      
      if (value !== undefined && value !== null) {
        console.log(`  ✅ ${metric.key}: ${value} (API) → ${processedValue}`);
      } else {
        console.log(`  ⚠️ ${metric.key}: undefined/null (API) → ${processedValue} (defaulted to 0)`);
      }
      
      return {
        axis: metric.label,
        value: processedValue,
        angle: metric.angle,
        originalValue: value // Keep original value for debugging
      };
    });
    
    console.log('📊 RadarChart data ready with', processedData.filter(d => d.value > 0).length, 'non-zero metrics out of 12');
    console.log('  All 12 metrics processed:', processedData.length === 12);
    
    return processedData;
  }, [data]);

  // Initialize dimensions
  useEffect(() => {
    if (containerRef.current) {
      setIsReady(true);
    }
  }, []);

  // Memoize event handlers to prevent recreation
  const handleMouseOver = useCallback((event, d) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isMobile = deviceType === 'mobile';
    
    setTooltip({
      show: true,
      content: `${d.axis}: ${Math.round(d.value)}/100`,
      x: isMobile ? rect.left + rect.width / 2 : event.pageX,
      y: isMobile ? rect.top - 10 : event.pageY - 10
    });
  }, [deviceType]);

  const handleMouseOut = useCallback(() => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  }, []);

  // Optimized D3 rendering with memoization and performance optimizations
  useEffect(() => {
    console.log('🎨 D3 Rendering Check:');
    console.log('  Has radarData:', radarData.length > 0);
    console.log('  Has svgRef:', !!svgRef.current);
    console.log('  Is ready:', isReady);
    
    if (!radarData.length || !svgRef.current || !isReady) {
      console.log('❌ Chart not ready to render:', { 
        hasData: radarData.length > 0, 
        hasSvg: !!svgRef.current,
        isReady 
      });
      return;
    }

    try {
      console.log('✅ Rendering radar chart with data:', radarData);
      console.log('  Data points:', radarData.length);
      console.log('  First data point:', radarData[0]);
      
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
        .style('stroke-width', config.strokeWidth)
        .style('opacity', 0)
        .transition()
        .duration(config.animationDuration)
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
        .on('touchstart', handleMouseOver)
        .on('touchend', handleMouseOut)
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', d => `${d.axis}: ${Math.round(d.value)} out of 100`);

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
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          maxWidth: deviceType === 'mobile' ? '280px' : deviceType === 'tablet' ? '380px' : '600px',
          maxHeight: deviceType === 'mobile' ? '280px' : deviceType === 'tablet' ? '380px' : '600px',
          aspectRatio: '1 / 1',
          margin: '0 auto'
        }}
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
          aria-label="Repository metrics radar chart"
          role="img"
        />
      </div>
      
      <div
        data-testid="radar-chart-tooltip"
        className={`tooltip fixed z-50 ${tooltip.show ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
          pointerEvents: 'none',
          padding: '6px 10px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          borderRadius: '6px',
          fontSize: deviceType === 'mobile' ? '11px' : '12px',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s, visibility 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
        role="tooltip"
      >
        {tooltip.content}
      </div>
    </div>
  );
});

RadarChart.displayName = 'RadarChart';

export default RadarChart; 