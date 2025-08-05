import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScoreTransparency from '../components/ScoreTransparency';

// Mock the VibeIcon component
vi.mock('../components/VibeIcon', () => ({
  default: ({ className }) => <div className={className}>VibeIcon</div>
}));

// Mock the BenchmarkComparison component
vi.mock('../components/BenchmarkComparison', () => ({
  default: ({ showTitle }) => (
    <div data-testid="benchmark-comparison">
      {!showTitle && <div>Benchmark Comparison Content</div>}
    </div>
  )
}));

describe('ScoreTransparency Component', () => {
  const mockVibeScore = 85;
  const mockBreakdown = {
    codeQuality: 88,
    readability: 82,
    collaboration: 90,
    security: 75,
    innovation: 85,
    maintainability: 80,
    inclusivity: 70,
    performance: 85,
    testingQuality: 90,
    communityHealth: 85,
    codeHealth: 80,
    releaseManagement: 75
  };

  it('renders with initial collapsed state', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    expect(screen.getByText('Score Transparency')).toBeInTheDocument();
    expect(screen.getByText('Show How Score is Calculated')).toBeInTheDocument();
    expect(screen.queryByText(/Enterprise-Grade Methodology:/)).not.toBeInTheDocument();
  });

  it('expands to show detailed breakdown when clicked', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    const expandButton = screen.getByText('Show How Score is Calculated');
    fireEvent.click(expandButton);
    
    expect(screen.getByText('Hide Details')).toBeInTheDocument();
    expect(screen.getByText(/Enterprise-Grade Methodology:/)).toBeInTheDocument();
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  it('displays all metric breakdowns with scores', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    // Check key metrics are displayed
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    expect(screen.getByText('Readability & Documentation')).toBeInTheDocument();
    expect(screen.getByText('Collaboration & Activity')).toBeInTheDocument();
    expect(screen.getByText('Security & Safety')).toBeInTheDocument();
    
    // Check scores are displayed
    expect(screen.getByText('88')).toBeInTheDocument(); // Code Quality score
    expect(screen.getByText('82')).toBeInTheDocument(); // Readability score
    expect(screen.getByText('90')).toBeInTheDocument(); // Collaboration score
    expect(screen.getByText('75')).toBeInTheDocument(); // Security score
  });

  it('shows metric details when a metric is clicked', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    // Find and click on Code Quality metric
    const codeQualitySection = screen.getByText('Code Quality').closest('div').parentElement.parentElement;
    fireEvent.click(codeQualitySection);
    
    // Check calculation details are shown
    expect(screen.getByText("How it's calculated:")).toBeInTheDocument();
    expect(screen.getByText('Test Coverage')).toBeInTheDocument();
    expect(screen.getByText('File Complexity')).toBeInTheDocument();
    expect(screen.getByText('Best Practices')).toBeInTheDocument();
  });

  it('displays industry backing information', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    const codeQualitySection = screen.getByText('Code Quality').closest('div').parentElement.parentElement;
    fireEvent.click(codeQualitySection);
    
    expect(screen.getByText(/Based on Google Code Review Guidelines/)).toBeInTheDocument();
  });

  it('shows benchmark comparisons', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    expect(screen.getByText('Benchmark Comparison')).toBeInTheDocument();
    expect(screen.getByTestId('benchmark-comparison')).toBeInTheDocument();
  });

  it('applies correct gradient classes based on scores', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    // Check that scores have gradient classes
    const highScore = screen.getByText('90');
    expect(highScore.className).toMatch(/bg-gradient-to-r/);
    expect(highScore.className).toMatch(/from-green-500/);
    
    const mediumScore = screen.getByText('75');
    expect(mediumScore.className).toMatch(/bg-gradient-to-r/);
    expect(mediumScore.className).toMatch(/from-yellow-500/);
  });

  it('toggles metric details on repeated clicks', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    const codeQualitySection = screen.getByText('Code Quality').closest('div').parentElement.parentElement;
    
    // First click - expand
    fireEvent.click(codeQualitySection);
    expect(screen.getByText("How it's calculated:")).toBeInTheDocument();
    
    // Second click - collapse
    fireEvent.click(codeQualitySection);
    expect(screen.queryByText("How it's calculated:")).not.toBeInTheDocument();
  });

  it('displays weight information for each metric', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    expect(screen.getByText('Weight: 16%')).toBeInTheDocument(); // Code Quality weight
    expect(screen.getAllByText('Weight: 12%').length).toBe(2); // Readability and Security weights
    expect(screen.getByText('Weight: 15%')).toBeInTheDocument(); // Collaboration weight
  });

  it('opens methodology modal when button is clicked', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    const methodologyButton = screen.getByText('Read Full Methodology Documentation');
    expect(methodologyButton).toBeInTheDocument();
    
    // Click the button to open modal
    fireEvent.click(methodologyButton);
    
    // Check modal is displayed
    expect(screen.getByText('Vibe Score™ Methodology')).toBeInTheDocument();
    expect(screen.getByText('Enterprise-Grade Repository Analytics')).toBeInTheDocument();
  });

  it('closes methodology modal when close button is clicked', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    fireEvent.click(screen.getByText('Read Full Methodology Documentation'));
    
    // Modal should be open
    expect(screen.getByText('Vibe Score™ Methodology')).toBeInTheDocument();
    
    // Find and click close button (the X button)
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    // Modal should be closed
    expect(screen.queryByText('Vibe Score™ Methodology')).not.toBeInTheDocument();
  });

  it('closes methodology modal when backdrop is clicked', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    fireEvent.click(screen.getByText('Read Full Methodology Documentation'));
    
    // Modal should be open
    expect(screen.getByText('Vibe Score™ Methodology')).toBeInTheDocument();
    
    // Click the backdrop
    const backdrop = document.querySelector('.bg-black\\/70');
    fireEvent.click(backdrop);
    
    // Modal should be closed
    expect(screen.queryByText('Vibe Score™ Methodology')).not.toBeInTheDocument();
  });

  it('handles missing breakdown data gracefully', () => {
    const partialBreakdown = {
      codeQuality: 88,
      readability: 82
    };
    
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={partialBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    // Should only show metrics that exist in breakdown
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    expect(screen.getByText('Readability & Documentation')).toBeInTheDocument();
    
    // Should not show metrics not in breakdown
    expect(screen.queryByText('Innovation & Creativity')).not.toBeInTheDocument();
  });

  it('maintains hover state on metric cards', () => {
    render(<ScoreTransparency vibeScore={mockVibeScore} breakdown={mockBreakdown} />);
    
    fireEvent.click(screen.getByText('Show How Score is Calculated'));
    
    // Find the parent card-secondary div that contains the hover classes
    const codeQualityText = screen.getByText('Code Quality');
    const metricCard = codeQualityText.closest('.card-secondary');
    
    expect(metricCard).toHaveClass('hover:bg-white/5');
    expect(metricCard).toHaveClass('cursor-pointer');
  });
}); 