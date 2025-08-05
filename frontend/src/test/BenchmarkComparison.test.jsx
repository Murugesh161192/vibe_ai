import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BenchmarkComparison from '../components/BenchmarkComparison';

describe('BenchmarkComparison Component', () => {
  it('renders with title when showTitle is true', () => {
    render(<BenchmarkComparison showTitle={true} />);
    
    expect(screen.getByText('Industry Benchmarks')).toBeInTheDocument();
    expect(screen.getByText('See how repositories compare against industry-leading projects')).toBeInTheDocument();
  });

  it('renders without title when showTitle is false', () => {
    render(<BenchmarkComparison showTitle={false} />);
    
    expect(screen.queryByText('Industry Benchmarks')).not.toBeInTheDocument();
    expect(screen.queryByText('See how repositories compare against industry-leading projects')).not.toBeInTheDocument();
  });

  it('displays all four benchmark categories', () => {
    render(<BenchmarkComparison />);
    
    // Check labels
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('High Quality')).toBeInTheDocument();
    expect(screen.getByText('Well Maintained')).toBeInTheDocument();
    expect(screen.getByText('Good Standard')).toBeInTheDocument();
  });

  it('displays correct score thresholds', () => {
    render(<BenchmarkComparison />);
    
    expect(screen.getByText('55+')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('45+')).toBeInTheDocument();
    expect(screen.getByText('40+')).toBeInTheDocument();
  });

  it('displays example repositories', () => {
    render(<BenchmarkComparison />);
    
    expect(screen.getByText('kubernetes')).toBeInTheDocument();
    expect(screen.getByText('vscode')).toBeInTheDocument();
    expect(screen.getByText('rails')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
  });

  it('applies correct color gradients to scores', () => {
    render(<BenchmarkComparison />);
    
    // High scores should have green gradient
    const enterpriseScore = screen.getByText('55+');
    expect(enterpriseScore.className).toMatch(/from-green-400/);
    expect(enterpriseScore.className).toMatch(/to-emerald-500/);
    
    // Medium scores should have yellow-orange gradient
    const wellMaintainedScore = screen.getByText('45+');
    expect(wellMaintainedScore.className).toMatch(/from-yellow-400/);
    expect(wellMaintainedScore.className).toMatch(/to-orange-500/);
  });

  it('displays calibration information', () => {
    render(<BenchmarkComparison />);
    
    expect(screen.getByText(/Vibe Score™/)).toBeInTheDocument();
    expect(screen.getByText(/calibrated against 10,000\+ repositories/)).toBeInTheDocument();
    expect(screen.getByText(/Google, Microsoft, and OWASP/)).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<BenchmarkComparison className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders icons for each benchmark category', () => {
    const { container } = render(<BenchmarkComparison />);
    
    // Check that SVG icons are rendered (lucide icons render as SVGs)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(4); // At least 4 icons for the benchmarks
  });

  it('applies hover effects to benchmark cards', () => {
    render(<BenchmarkComparison />);
    
    const benchmarkCards = document.querySelectorAll('.card-glass');
    benchmarkCards.forEach(card => {
      expect(card).toHaveClass('hover:bg-white/10');
      expect(card).toHaveClass('transition-all');
    });
  });

  it('renders with responsive grid layout', () => {
    render(<BenchmarkComparison />);
    
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-2');
    expect(gridContainer).toHaveClass('md:grid-cols-4');
  });

  it('displays proper styling for calibration section', () => {
    render(<BenchmarkComparison />);
    
    const calibrationSection = screen.getByText(/Vibe Score™/).closest('div');
    expect(calibrationSection).toHaveClass('bg-gradient-to-r');
    expect(calibrationSection).toHaveClass('from-purple-600/20');
    expect(calibrationSection).toHaveClass('to-blue-600/20');
    expect(calibrationSection).toHaveClass('border-purple-500/30');
  });
}); 