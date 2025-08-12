import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisInsights from '../components/AnalysisInsights';

describe('AnalysisInsights Component', () => {
  const mockAnalysis = {
    insights: [
      'High code quality with consistent patterns',
      'Active community engagement',
      'Regular updates and maintenance'
    ]
  };

  const mockAiInsights = {
    keyInsights: [
      'Excellent test coverage',
      'Well-documented codebase',
      'Strong security practices'
    ],
    smartRecommendations: [
      {
        title: 'Add Comprehensive Test Coverage',
        description: 'Implement unit and integration tests',
        priority: 'critical',
        category: 'testing'
      },
      {
        title: 'Enhance README Documentation',
        description: 'Clear documentation helps new users',
        priority: 'moderate',
        category: 'documentation'
      }
    ]
  };

  test('renders key insights section', () => {
    render(<AnalysisInsights analysis={mockAnalysis} />);
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
  });

  test('renders smart recommendations section', () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    expect(screen.getByText('Smart Recommendations')).toBeInTheDocument();
  });

  test('displays correct number of insights', () => {
    render(<AnalysisInsights analysis={mockAnalysis} />);
    expect(screen.getByText('3 analysis points found')).toBeInTheDocument();
  });

  test('collapses and expands sections on click', async () => {
    render(<AnalysisInsights analysis={mockAnalysis} />);
    
    const button = screen.getByRole('button', { name: /key insights/i });
    
    // Initially expanded
    expect(screen.getByText('High code quality with consistent patterns')).toBeVisible();
    
    // Click to collapse
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('High code quality with consistent patterns')).not.toBeInTheDocument();
    });
    
    // Click to expand
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('High code quality with consistent patterns')).toBeVisible();
    });
  });

  test('recommendation card opens modal on click', async () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    
    // Find and click the first recommendation card
    const recommendationCard = screen.getByText('Add Comprehensive Test Coverage').closest('article');
    fireEvent.click(recommendationCard);
    
    // Check if modal appears
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Implementation Steps')).toBeInTheDocument();
      expect(screen.getByText('Expected Benefits')).toBeInTheDocument();
    });
  });

  test('recommendation modal closes on button click', async () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    
    // Open modal
    const recommendationCard = screen.getByText('Add Comprehensive Test Coverage').closest('article');
    fireEvent.click(recommendationCard);
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click close button
    const closeButton = screen.getByText('Got it, thanks!');
    fireEvent.click(closeButton);
    
    // Check if modal disappears
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('recommendation modal closes on backdrop click', async () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    
    // Open modal
    const recommendationCard = screen.getByText('Add Comprehensive Test Coverage').closest('article');
    fireEvent.click(recommendationCard);
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click backdrop
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    
    // Check if modal disappears
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('recommendation card responds to keyboard navigation', async () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    
    // Find the first recommendation card
    const recommendationCard = screen.getByText('Add Comprehensive Test Coverage').closest('article');
    
    // Focus the card and press Enter
    recommendationCard.focus();
    fireEvent.keyDown(recommendationCard, { key: 'Enter', code: 'Enter' });
    
    // Check if modal appears
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByText('Got it, thanks!');
    fireEvent.click(closeButton);
    
    // Press Space to open again
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    fireEvent.keyDown(recommendationCard, { key: ' ', code: 'Space' });
    
    // Check if modal appears again
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('displays correct priority badges', () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('moderate')).toBeInTheDocument();
  });

  test('displays category badges', () => {
    render(<AnalysisInsights aiInsights={mockAiInsights} />);
    
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.getByText('documentation')).toBeInTheDocument();
  });
}); 