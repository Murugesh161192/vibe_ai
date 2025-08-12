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

  // Memoize chart configuration to prevent recalculation on every render
  const chartConfig = useMemo(() => {
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    const isMobile = containerWidth < 480;
    const isMediumMobile = containerWidth >= 480 && containerWidth < 540;
    const isSmallTablet = containerWidth >= 540 && containerWidth < 768;
    const isTablet = containerWidth >= 768 && containerWidth < 1024;
    const isDesktop = containerWidth >= 1024;
    
    // Enhanced responsive sizing with better breakpoints for 540px and 768px
    let basePadding, maxSize, size, margin;
    
    if (isMobile) {
      basePadding = 20;
      maxSize = Math.min(containerWidth - basePadding, containerHeight - basePadding);
      size = Math.min(maxSize, 260);
      margin = 40;
    } else if (isMediumMobile) {
      basePadding = 25;
      maxSize = Math.min(containerWidth - basePadding, containerHeight - basePadding);
      size = Math.min(maxSize, 320);
      margin = 50;
    } else if (isSmallTablet) {
      basePadding = 30;
      maxSize = Math.min(containerWidth - basePadding, containerHeight - basePadding);
      size = Math.min(maxSize, 360);
      margin = 60;
    } else if (isTablet) {
      basePadding = 35;
      maxSize = Math.min(containerWidth - basePadding, containerHeight - basePadding);
      size = Math.min(maxSize, 400);
      margin = 70;
    } else {
      basePadding = 40;
      maxSize = Math.min(containerWidth - basePadding, containerHeight - basePadding);
      size = Math.min(maxSize, isDesktop ? 500 : 450);
      margin = 90;
    }
    
    return {
      width: size,
      height: size,
      margin: margin,
      levels: 5,
      maxValue: 100,
      roundStrokes: true,
      color: '#0ea5e9',
      labelFontSize: isMobile ? '8px' : isMediumMobile ? '9px' : isSmallTablet ? '10px' : isTablet ? '11px' : '12px',
      gridLabelFontSize: isMobile ? '6px' : isMediumMobile ? '7px' : '8px',
      pointRadius: isMobile ? 1.5 : isMediumMobile ? 2 : isSmallTablet ? 2.5 : isTablet ? 3 : 3.5,
      pointHoverRadius: isMobile ? 3 : isMediumMobile ? 3.5 : isSmallTablet ? 4 : isTablet ? 4.5 : 5,
      labelOffset: isMobile ? 8 : isMediumMobile ? 10 : isSmallTablet ? 12 : isTablet ? 14 : 15,
      strokeWidth: isMobile ? '1.5px' : isMediumMobile ? '2px' : '2.5px'
    };
  }, [dimensions.width, dimensions.height]);

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

  // Optimized resize handler with debouncing
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || 400;
      const containerHeight = rect.height || 400;
      console.log('Container dimensions:', containerWidth, containerHeight);
      
      // Ensure minimum dimensions
      const width = Math.max(containerWidth, 200);
      const height = Math.max(containerHeight, 200);
      
      setDimensions({ width, height });
      setIsReady(true);
    }
  }, []);

  // Memoize event handlers to prevent recreation
  const handleMouseOver = useCallback((event, d) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    setTooltip({
      show: true,
      content: `${d.axis}: ${Math.round(d.value)}/100`,
      x: isMobile ? rect.left + rect.width / 2 : event.pageX,
      y: isMobile ? rect.top - 10 : event.pageY - 10
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
      if (typeof window !== 'undefined') {
        setIsReady(true);
      }
    }, 100);
    
    // Use ResizeObserver for better performance
    let resizeObserver;
    if (containerRef.current && typeof window !== 'undefined' && window.ResizeObserver) {
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

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedResize);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(resizeTimeout);
      clearTimeout(initTimeout);
    };
  }, [handleResize]);

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
        .on('touchstart', handleMouseOver)
        .on('touchend', handleMouseOut)
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
    <div 
      className="w-full h-full flex items-center justify-center p-2 md:p-4" 
      ref={containerRef}
      style={{
        minHeight: '200px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          maxWidth: '500px',
          maxHeight: '500px',
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
        />
      </div>
      
      <div
        data-testid="radar-chart-tooltip"
        className="tooltip"
        style={{
          position: 'fixed',
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
          pointerEvents: 'none',
          zIndex: 1000,
          opacity: tooltip.show ? 1 : 0,
          visibility: tooltip.show ? 'visible' : 'hidden',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s'
        }}
      >
        {tooltip.content}
      </div>
    </div>
  );
});

RadarChart.displayName = 'RadarChart';

export default RadarChart; 