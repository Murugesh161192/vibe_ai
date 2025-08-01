import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Header from '../components/Header'

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders logo and navigation', () => {
      render(<Header />)
      
      expect(screen.getByText(/Vibe AI/i)).toBeInTheDocument()
    })

    test('renders feature cards', () => {
      render(<Header />)
      
      expect(screen.getByText(/Security & Safety/i)).toBeInTheDocument()
      expect(screen.getByText(/Performance & Scalability/i)).toBeInTheDocument()
      expect(screen.getByText(/Testing Quality/i)).toBeInTheDocument()
      expect(screen.getByText(/Community Health/i)).toBeInTheDocument()
    })
  })


}) 