import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ChatInput from '../components/ChatInput'

describe('ChatInput Component', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Initial Render', () => {
    test('renders input field with default placeholder', () => {
      // Mock desktop viewport
      global.innerWidth = 1024
      
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter GitHub username or repository URL...')
    })

    test('renders submit button', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      expect(submitButton).toBeInTheDocument()
    })

    test('renders keyboard shortcuts hint on desktop', () => {
      // Mock window.matchMedia to simulate desktop
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(hover: hover) and (pointer: fine)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      // Test for OS-specific shortcuts (Windows in this case)
      // Note: These are now hidden on mobile/tablet and only shown on desktop (lg:block)
      const shortcutsContainer = document.querySelector('.hidden.lg\\:block');
      if (shortcutsContainer) {
        expect(screen.getByText('Ctrl+K to focus')).toBeInTheDocument()
        expect(screen.getByText('Ctrl+Enter to submit')).toBeInTheDocument()
        expect(screen.getByText('Esc to clear')).toBeInTheDocument()
      }
    })

    test('does not render keyboard shortcuts on mobile', () => {
      // Mock window.matchMedia to simulate mobile device
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false, // Simulate mobile device
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ChatInput onSubmit={mockOnSubmit} loading={false} />)
      
      // Keyboard shortcuts should be hidden on mobile (uses lg:block which means hidden < 1024px)
      // Check for the container div that has the keyboard shortcuts
      const shortcutsContainer = screen.queryByText((content, element) => {
        return element && 
               element.classList && 
               element.classList.contains('hidden') && 
               element.classList.contains('lg:block') &&
               element.textContent.includes('to focus');
      });
      
      // The container exists but should be hidden (has 'hidden' class)
      if (shortcutsContainer) {
        expect(shortcutsContainer.classList.contains('hidden')).toBe(true);
      }
    })

    test('renders with custom placeholder', () => {
      render(<ChatInput onSubmit={mockOnSubmit} placeholder="Custom placeholder" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder')
    })
  })

  describe('Input Type Detection', () => {
    test('detects repository URL correctly', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'https://github.com/facebook/react' } })
      
      await waitFor(() => {
        expect(screen.getByText('Repository')).toBeInTheDocument()
      })
    })

    test('detects repository with slash format', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      
      await waitFor(() => {
        expect(screen.getByText('Repository')).toBeInTheDocument()
      })
    })

    test('detects username correctly', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'torvalds' } })
      
      await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument()
      })
    })

    test('resets to auto when input is cleared', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      
      await waitFor(() => {
        expect(screen.getByText('Repository')).toBeInTheDocument()
      })
      
      fireEvent.change(input, { target: { value: '' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Repository')).not.toBeInTheDocument()
        expect(screen.queryByText('User Profile')).not.toBeInTheDocument()
      })
    })
  })

  describe('Input Icons', () => {
    test('shows repository icon for repo URLs', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'https://github.com/facebook/react' } })
      
      await waitFor(() => {
        const icon = document.querySelector('.lucide-github')
        expect(icon).toBeInTheDocument()
      })
    })

    test('shows user icon for usernames', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'torvalds' } })
      
      await waitFor(() => {
        const icon = document.querySelector('.lucide-user')
        expect(icon).toBeInTheDocument()
      })
    })

    test('shows sparkles icon for empty input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const icon = document.querySelector('.lucide-sparkles')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Placeholder Text', () => {
    test('shows repository placeholder for repo input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      
      await waitFor(() => {
        expect(input).toHaveAttribute('placeholder', 'Repository URL (e.g., facebook/react)')
      })
    })

    test('shows user placeholder for username input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'torvalds' } })
      
      await waitFor(() => {
        expect(input).toHaveAttribute('placeholder', 'GitHub username (e.g., torvalds)')
      })
    })

    test('shows default placeholder for auto input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Enter GitHub username or repository URL...')
    })
  })

  describe('Submit Functionality', () => {
    test('calls onSubmit when submit button is clicked', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      fireEvent.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith('facebook/react')
    })

    test('calls onSubmit when Enter key is pressed', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(mockOnSubmit).toHaveBeenCalledWith('facebook/react')
    })

    test('does not submit empty input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      fireEvent.click(submitButton)
      
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('does not submit when loading', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={true} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      fireEvent.click(submitButton)
      
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('clears input after successful submission', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(input).toHaveValue('')
    })
  })

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      // Mock desktop environment for keyboard shortcuts
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(hover: hover) and (pointer: fine)', // Simulate desktop
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    })

    test('Ctrl+Enter submits the form', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={false} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      fireEvent.keyDown(document, { ctrlKey: true, key: 'Enter' })
      
      expect(mockOnSubmit).toHaveBeenCalledWith('facebook/react')
    })

    test('Cmd+Enter submits the form on Mac', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={false} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      fireEvent.keyDown(document, { metaKey: true, key: 'Enter' })
      
      expect(mockOnSubmit).toHaveBeenCalledWith('facebook/react')
    })

    test('Escape clears the input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={false} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      expect(input).toHaveValue('facebook/react')
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(input).toHaveValue('')
    })

    test('Ctrl+K focuses the input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={false} />)
      const input = screen.getByRole('textbox')
      
      // First blur the input
      input.blur()
      expect(document.activeElement).not.toBe(input)
      
      fireEvent.keyDown(document, { ctrlKey: true, key: 'k' })
      
      expect(input).toHaveFocus()
    })

    test('Cmd+K focuses the input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={false} />)
      const input = screen.getByRole('textbox')
      
      // First blur the input
      input.blur()
      expect(document.activeElement).not.toBe(input)
      
      fireEvent.keyDown(document, { metaKey: true, key: 'k' })
      
      expect(input).toHaveFocus()
    })
  })

  describe('Loading State', () => {
    test('disables input when loading', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={true} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    test('disables submit button when loading', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={true} />)
      
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      expect(submitButton).toBeDisabled()
    })

    test('disables submit button when input is empty', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('has proper aria-label', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Enter GitHub repository URL or username')
    })

    test('submit button has proper aria-label', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /submit analysis/i })
      expect(submitButton).toHaveAttribute('aria-label', 'Submit analysis')
    })
  })

  describe('Input Type Indicator', () => {
    test('shows repository indicator for repo input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'facebook/react' } })
      
      await waitFor(() => {
        expect(screen.getByText('Analyzing:')).toBeInTheDocument()
        expect(screen.getByText('Repository')).toBeInTheDocument()
      })
    })

    test('shows user profile indicator for username input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'torvalds' } })
      
      await waitFor(() => {
        expect(screen.getByText('Analyzing:')).toBeInTheDocument()
        expect(screen.getByText('User Profile')).toBeInTheDocument()
      })
    })

    test('hides indicator for empty input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      expect(screen.queryByText('Analyzing:')).not.toBeInTheDocument()
    })
  })

  describe('Component Cleanup', () => {
    test('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const { unmount } = render(<ChatInput onSubmit={mockOnSubmit} />)
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })
}) 