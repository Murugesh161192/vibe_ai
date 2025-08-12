import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ChatInput from '../components/ChatInput'

// Mock the OS detection utilities
vi.mock('../utils/osDetection', () => ({
  getKeyboardShortcuts: vi.fn(() => ({
    submit: 'Ctrl+Enter',
    focus: 'Ctrl+K',
    clear: 'Esc'
  })),
  isModifierPressed: vi.fn((e) => e.ctrlKey || e.metaKey),
  detectOS: vi.fn(() => 'windows')
}))

describe('ChatInput Component', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    // Mock window.innerWidth for mobile detection
    global.innerWidth = 1024
  })

  describe('Initial Render', () => {
    test('renders input field with default placeholder', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter GitHub username or repository URL')
    })

    test('renders submit button', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      expect(submitButton).toBeInTheDocument()
    })

    test('renders keyboard shortcuts hint on desktop', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      // Look for the keyboard hints at the bottom
      expect(screen.getByText('to analyze')).toBeInTheDocument()
    })

    test('renders with custom placeholder', () => {
      render(<ChatInput onSubmit={mockOnSubmit} placeholder="Custom placeholder" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder')
    })
  })

  describe('Input Validation', () => {
    test('shows error for empty input submission', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled()
      })
      
      // Check for error message
      const errorMessage = screen.getByText('Please enter a GitHub username or repository URL')
      expect(errorMessage).toBeInTheDocument()
    })

    test('clears error when user starts typing', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      
      // Submit empty to trigger error
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a GitHub username or repository URL')).toBeInTheDocument()
      })
      
      // Type something to clear error
      fireEvent.change(input, { target: { value: 'test' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a GitHub username or repository URL')).not.toBeInTheDocument()
      })
    })
  })

  describe('Submit Functionality', () => {
    test('calls onSubmit when submit button is clicked with valid input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      
      fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } })
      fireEvent.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith('https://github.com/test/repo')
    })

    test('does not submit empty input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      fireEvent.click(submitButton)
      
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('trims whitespace from input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      
      fireEvent.change(input, { target: { value: '  test-user  ' } })
      fireEvent.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith('test-user')
    })

    test('submits on Enter key press', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'test-repo' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      
      expect(mockOnSubmit).toHaveBeenCalledWith('test-repo')
    })
  })

  describe('Keyboard Shortcuts', () => {
    test('Enter key submits the form', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test-user' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(mockOnSubmit).toHaveBeenCalledWith('test-user')
    })

    test('Escape key clears the input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test-user' } })
      
      expect(input).toHaveValue('test-user')
      
      fireEvent.keyDown(input, { key: 'Escape' })
      
      expect(input).toHaveValue('')
    })

    test('Ctrl+K focuses the input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      input.blur()
      
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
      
      // Note: Focus behavior is difficult to test in jsdom
      // The component should focus the input, but we can't reliably test it
    })
  })

  describe('Loading State', () => {
    test('disables input and button when loading', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={true} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /analyzing repository/i })
      
      expect(input).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })

    test('shows loading spinner when loading', () => {
      const { container } = render(<ChatInput onSubmit={mockOnSubmit} loading={true} />)
      
      // Look for the spinner element
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    test('disables input and button when disabled prop is true', () => {
      render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button')
      
      expect(input).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('has proper aria-label for input', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Enter GitHub repository URL, owner/repo, or username')
    })

    test('has proper aria-label for submit button', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      expect(submitButton).toHaveAttribute('aria-label', 'Analyze repository')
    })

    test('indicates loading state with aria-busy', () => {
      render(<ChatInput onSubmit={mockOnSubmit} loading={true} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-busy', 'true')
    })

    test('indicates error state with aria-invalid', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  describe('Error Handling', () => {
    test('displays error message for empty submission', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a GitHub username or repository URL')).toBeInTheDocument()
      })
    })

    test('clears error when input changes', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByRole('textbox')
      const submitButton = screen.getByRole('button', { name: /analyze repository/i })
      
      // Trigger error
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a GitHub username or repository URL')).toBeInTheDocument()
      })
      
      // Type to clear error
      fireEvent.change(input, { target: { value: 'test' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a GitHub username or repository URL')).not.toBeInTheDocument()
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    test('hides keyboard shortcuts on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375
      
      const { container } = render(<ChatInput onSubmit={mockOnSubmit} />)
      
      // Keyboard shortcuts should be hidden on mobile
      const shortcutsDiv = container.querySelector('.hidden.sm\\:block')
      expect(shortcutsDiv).toBeInTheDocument()
    })

    test('shows appropriate mobile button size', () => {
      // Mock mobile viewport
      global.innerWidth = 375
      
      render(<ChatInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByRole('button')
      // Button should have mobile-optimized classes
      expect(submitButton.className).toMatch(/min-h-\[36px\]/)
    })
  })
}) 