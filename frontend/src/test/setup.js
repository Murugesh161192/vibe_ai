import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Suppress act() warnings for cleaner test output
const originalError = console.error
beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterEach(() => {
  console.error = originalError
})

// Mock D3 for tests
global.d3 = {
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(),
      attr: vi.fn(() => ({
        append: vi.fn(() => ({
          attr: vi.fn(() => ({
            style: vi.fn(() => ({
              on: vi.fn(() => ({
                attr: vi.fn(() => ({
                  style: vi.fn(() => ({
                    on: vi.fn()
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    })),
    attr: vi.fn(() => ({
      append: vi.fn(() => ({
        attr: vi.fn(() => ({
          style: vi.fn(() => ({
            on: vi.fn(() => ({
              attr: vi.fn(() => ({
                style: vi.fn(() => ({
                  on: vi.fn()
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  })),
  scaleOrdinal: vi.fn(() => ({
    range: vi.fn(() => ({
      domain: vi.fn()
    }))
  })),
  scaleLinear: vi.fn(() => ({
    domain: vi.fn(() => ({
      range: vi.fn()
    }))
  }))
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
} 