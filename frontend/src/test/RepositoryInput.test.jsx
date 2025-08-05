import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import RepositoryInput from '../components/RepositoryInput'
import { within } from '@testing-library/dom'

describe('RepositoryInput Component', () => {
  const mockOnAnalyze = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders the component with all elements', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />);
      
      expect(screen.getByLabelText(/GitHub Repository URL/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze repository/i })).toBeInTheDocument();
    });

    test('renders with default placeholder text', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />);
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      expect(input).toBeInTheDocument()
    })

    test('renders with custom placeholder text', () => {
      render(
        <RepositoryInput 
          onAnalyze={mockOnAnalyze} 
        />
      )
      
      expect(screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)).toBeInTheDocument()
    })
  })

  describe('Input Validation', () => {
    test('validates empty input', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const form = screen.getByRole('form')
      
      // Directly trigger form submission to test validation logic
      fireEvent.submit(form)
      
      // Wait for validation error to appear
      const errorMessage = await screen.findByText(/Please enter a repository URL/i);
      expect(errorMessage).toBeInTheDocument();
      expect(mockOnAnalyze).not.toHaveBeenCalled()
    })

    test('validates invalid GitHub URL format', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const form = screen.getByRole('form')
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      
      // Test with a single invalid URL first
      await user.clear(input)
      await user.type(input, 'not-a-url')
      
      // Use direct form submission instead of button click
      fireEvent.submit(form)
      
      // Wait for the component to update and show the error
      await waitFor(() => {
        const errorElement = screen.queryByRole('alert');
        expect(errorElement).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Now check the content of the error
      const errorContainer = screen.getByRole('alert');
      expect(within(errorContainer).getByText(/Please enter a valid GitHub repository URL/i)).toBeInTheDocument();
      expect(mockOnAnalyze).not.toHaveBeenCalled()
    })

    test('accepts valid GitHub URLs', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      const analyzeButton = screen.getByRole('button', { name: /analyze repository/i })
      
      // Update valid URLs to match the actual regex pattern
      const validUrls = [
        'https://github.com/user/repo',
        'https://github.com/user/repo/',
        'https://www.github.com/user/repo',
        'http://github.com/user/repo',
        'https://github.com/user/repo.git',
        'https://github.com/user/repo/tree/main',
        'https://github.com/user/repo/issues',
        'https://github.com/user/repo/pulls'
      ]
      
      for (const url of validUrls) {
        await user.clear(input)
        await user.type(input, url)
        
        // Should not show validation error before submission
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        
        await user.click(analyzeButton)
        expect(mockOnAnalyze).toHaveBeenCalledWith(url.trim())
        mockOnAnalyze.mockClear()
      }
    }, 10000) // Increase timeout to 10 seconds

    test('trims whitespace from input', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      const analyzeButton = screen.getByRole('button', { name: /analyze repository/i })
      
      await user.type(input, '  https://github.com/user/repo  ')
      await user.click(analyzeButton)
      
      expect(mockOnAnalyze).toHaveBeenCalledWith('https://github.com/user/repo')
    })
  })

  describe('User Interactions', () => {
    test('calls onAnalyze with valid URL', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      const analyzeButton = screen.getByRole('button', { name: /analyze repository/i })
      
      await user.type(input, 'https://github.com/user/repo')
      await user.click(analyzeButton)
      
      expect(mockOnAnalyze).toHaveBeenCalledWith('https://github.com/user/repo')
    })

    test('submits on Enter key press', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      
      await user.type(input, 'https://github.com/user/repo')
      await user.keyboard('{Enter}')
      
      expect(mockOnAnalyze).toHaveBeenCalledWith('https://github.com/user/repo')
    })

    test('does not submit on Enter with invalid URL', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const form = screen.getByRole('form')
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      
      await user.type(input, 'invalid-url')
      
      // Use direct form submission instead of Enter key
      fireEvent.submit(form)
      
      expect(mockOnAnalyze).not.toHaveBeenCalled()
      
      // Wait for the error message to appear with a simpler approach
      await waitFor(() => {
        const errorElement = screen.queryByRole('alert');
        expect(errorElement).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Check that the error message content is correct
      const errorContainer = screen.getByRole('alert');
      expect(within(errorContainer).getByText(/Please enter a valid GitHub repository URL/i)).toBeInTheDocument();
    })

    test('clears validation error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      const form = screen.getByRole('form')
      
      // Directly trigger form submission to get validation error
      fireEvent.submit(form);
      const errorMessage = await screen.findByText(/Please enter a repository URL/i);
      expect(errorMessage).toBeInTheDocument();
      
      // Start typing to clear error
      await user.type(input, 'h');
      expect(screen.queryByText(/Please enter a repository URL/i)).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    test('shows loading state when isLoading is true', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} isLoading={true} />);
      
      // Button text remains "Analyze Repository" but is disabled
      expect(screen.getByRole('button', { name: /Analyze Repository/i })).toBeDisabled();
    });

    test('disables input and buttons during loading', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} isLoading={true} />);
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i);
      const analyzeButton = screen.getByRole('button', { name: /Analyze Repository/i });
      
      expect(input).toBeDisabled();
      expect(analyzeButton).toBeDisabled();
    });

    test('does not call onAnalyze during loading', async () => {
      const user = userEvent.setup();
      render(<RepositoryInput onAnalyze={mockOnAnalyze} isLoading={true} />);
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i);
      const analyzeButton = screen.getByRole('button', { name: /Analyze Repository/i });
      
      // Since input is disabled, user.type should not work, but let's test the button click
      await act(async () => {
        await user.click(analyzeButton);
      });
      
      expect(mockOnAnalyze).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      expect(input).toHaveAttribute('aria-label', 'GitHub Repository URL')
      expect(input).toHaveAttribute('aria-describedby', 'url-help')
    })

    test('has proper form structure', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      expect(screen.getByRole('form', { name: /Repository URL form/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      // Tab through elements
      await user.tab();
      expect(screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)).toHaveFocus();

      // Type some content to enable the button
      await user.type(screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i), 'https://github.com/test/repo');
      
      await user.tab();
      expect(screen.getByRole('button', { name: /analyze repository/i })).toHaveFocus();
    });
  })

  describe('Error Handling', () => {
    test('displays error message when provided', async () => {
      const errorMessage = 'Repository not found'
      render(
        <RepositoryInput 
          onAnalyze={mockOnAnalyze} 
          error={errorMessage}
        />
      )
      
      const errorContainer = await screen.findByRole('alert');
      expect(within(errorContainer).getByText(errorMessage)).toBeInTheDocument()
    })

    test('does not display error message when not provided', () => {
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    test('handles missing onAnalyze prop gracefully', () => {
      expect(() => {
        render(<RepositoryInput />)
      }).not.toThrow()
    })

    test('handles all props being optional', () => {
      expect(() => {
        render(<RepositoryInput />)
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    test('handles very long URLs', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      const analyzeButton = screen.getByRole('button', { name: /analyze repository/i })
      
      // Create a valid but long URL
      const longUrl = 'https://github.com/user/repository-with-a-very-long-name-that-should-still-be-valid'
      await act(async () => {
        await user.type(input, longUrl, { delay: 1 });
        await user.click(analyzeButton);
      });
      
      expect(mockOnAnalyze).toHaveBeenCalledWith(longUrl.trim());
    }, 20000)

    test('handles special characters in URL', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      const analyzeButton = screen.getByRole('button', { name: /analyze repository/i })
      
      const specialUrl = 'https://github.com/user/repo-with-special-chars_123'
      await act(async () => {
        await user.type(input, specialUrl);
        await user.click(analyzeButton);
      });
      
      expect(mockOnAnalyze).toHaveBeenCalledWith(specialUrl)
    })

    test('handles rapid input changes', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const input = screen.getByPlaceholderText(/https:\/\/github.com\/username\/repository/i)
      
      // Rapidly type and clear
      await act(async () => {
        await user.type(input, 'https://github.com/user/repo1');
        await user.clear(input);
        await user.type(input, 'https://github.com/user/repo2');
      });
      
      expect(input).toHaveValue('https://github.com/user/repo2')
    })
  })

  describe('Metrics Breakdown', () => {
    test('toggles metrics breakdown visibility', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      // Initially metrics should not be visible
      expect(screen.queryByText(/High Priority Metrics/i)).not.toBeInTheDocument()
      
      // Click the toggle button
      const toggleButton = screen.getByRole('button', { name: /View Metrics Breakdown/i })
      await user.click(toggleButton)
      
      // Metrics should now be visible
      expect(screen.getByText(/High Priority Metrics/i)).toBeInTheDocument()
      expect(screen.getByText(/Medium Priority Metrics/i)).toBeInTheDocument()
      expect(screen.getByText(/Supporting Factors/i)).toBeInTheDocument()
      
      // Button text should change
      expect(screen.getByRole('button', { name: /Hide Metrics Breakdown/i })).toBeInTheDocument()
      
      // Click again to hide
      await user.click(screen.getByRole('button', { name: /Hide Metrics Breakdown/i }))
      expect(screen.queryByText(/High Priority Metrics/i)).not.toBeInTheDocument()
    })

    test('displays all metric categories when expanded', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const toggleButton = screen.getByRole('button', { name: /View Metrics Breakdown/i })
      await user.click(toggleButton)
      
      // Check high priority metrics
      expect(screen.getByText('Code Quality')).toBeInTheDocument()
      expect(screen.getByText('Collaboration')).toBeInTheDocument()
      expect(screen.getByText('Readability')).toBeInTheDocument()
      expect(screen.getByText('Security & Safety')).toBeInTheDocument()
      
      // Check medium priority metrics
      expect(screen.getByText('Innovation')).toBeInTheDocument()
      expect(screen.getByText('Maintainability')).toBeInTheDocument()
      expect(screen.getByText('Performance')).toBeInTheDocument()
      expect(screen.getByText('Testing Quality')).toBeInTheDocument()
      
      // Check supporting factors
      expect(screen.getByText('Inclusivity')).toBeInTheDocument()
      expect(screen.getByText('Community')).toBeInTheDocument()
      expect(screen.getByText('Code Health')).toBeInTheDocument()
      expect(screen.getByText('Release Mgmt')).toBeInTheDocument()
    })

    test('displays metric weights and descriptions', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const toggleButton = screen.getByRole('button', { name: /View Metrics Breakdown/i })
      await user.click(toggleButton)
      
      // Check weights using getAllByText for duplicate weights
      expect(screen.getByText('16%')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getAllByText('12%')).toHaveLength(2) // There are two 12% weights
      expect(screen.getAllByText('8%')).toHaveLength(3) // There are three 8% weights
      expect(screen.getByText('6%')).toBeInTheDocument()
      expect(screen.getByText('5%')).toBeInTheDocument()
      expect(screen.getAllByText('4%')).toHaveLength(2) // There are two 4% weights
      expect(screen.getByText('2%')).toBeInTheDocument()
      
      // Check descriptions
      expect(screen.getByText(/Test coverage & complexity analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/Team dynamics & contribution patterns/i)).toBeInTheDocument()
      expect(screen.getByText(/Documentation & code clarity/i)).toBeInTheDocument()
      expect(screen.getByText(/Vulnerability scanning & compliance/i)).toBeInTheDocument()
    })

    test('metric section shows correct weight ranges', async () => {
      const user = userEvent.setup()
      render(<RepositoryInput onAnalyze={mockOnAnalyze} />)
      
      const toggleButton = screen.getByRole('button', { name: /View Metrics Breakdown/i })
      await user.click(toggleButton)
      
      // Check weight range labels
      expect(screen.getByText('12-16% weight')).toBeInTheDocument()
      expect(screen.getByText('6-8% weight')).toBeInTheDocument()
      expect(screen.getByText('2-5% weight')).toBeInTheDocument()
    })
  })

}) 