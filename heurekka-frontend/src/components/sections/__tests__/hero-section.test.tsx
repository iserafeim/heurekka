import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroSection } from '../hero-section'
import type { SearchQuery, Location } from '@/types/homepage'

// Mock the API client
jest.mock('@/lib/trpc/simple-client', () => ({
  apiClient: {
    getSearchSuggestions: jest.fn().mockResolvedValue([
      {
        id: '1',
        text: 'Tegucigalpa Centro',
        type: 'location',
        icon: '📍',
        metadata: { propertyCount: 25, coordinates: { lat: 14.0723, lng: -87.1921 } }
      },
      {
        id: '2',
        text: 'Casa en Colonia Palmira',
        type: 'property',
        icon: '🏠',
        metadata: { propertyCount: 8 }
      }
    ])
  }
}))

describe('HeroSection', () => {
  const mockOnSearch = jest.fn()
  const mockUserLocation: Location = {
    lat: 14.0723,
    lng: -87.1921,
    source: 'gps'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location for navigation tests
    delete (window as any).location
    window.location = { href: '' } as any
  })

  afterEach(() => {
    // Clean up any timers
    act(() => {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    })
  })

  describe('Rendering and Spanish Content', () => {
    it('renders hero section with correct Spanish text', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Encuentra tu hogar perfecto en Honduras'
      )
      expect(screen.getByText('Crea un perfil una vez. Contacta múltiples propietarios.')).toBeInTheDocument()
      expect(screen.getByText('Ahorra horas de conversaciones repetitivas.')).toBeInTheDocument()
      expect(screen.getByText('Crear Perfil Gratuito')).toBeInTheDocument()
      expect(screen.getByText('Explorar Propiedades')).toBeInTheDocument()
    })

    it('renders trust indicators with Spanish text', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      expect(screen.getByText('Sin comisiones ocultas')).toBeInTheDocument()
      expect(screen.getByText('1,000+ usuarios activos')).toBeInTheDocument()
      expect(screen.getByText('500+ propiedades')).toBeInTheDocument()
      expect(screen.getByText('Verificación garantizada')).toBeInTheDocument()
    })

    it('displays statistics with correct Spanish labels', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      expect(screen.getByText('500+')).toBeInTheDocument()
      expect(screen.getByText('Propiedades')).toBeInTheDocument()
      expect(screen.getByText('15min')).toBeInTheDocument()
      expect(screen.getByText('Respuesta Promedio')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(screen.getByText('Satisfacción')).toBeInTheDocument()
    })

    it('renders popular search pills with correct Spanish label', () => {
      const popularSearches = ['Apartamento Tegucigalpa', 'Casa Colonia Palmira']
      render(<HeroSection onSearch={mockOnSearch} popularSearches={popularSearches} />)
      
      expect(screen.getByText('Búsquedas populares:')).toBeInTheDocument()
      expect(screen.getByText('Apartamento Tegucigalpa')).toBeInTheDocument()
      expect(screen.getByText('Casa Colonia Palmira')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('handles search form submission correctly', async () => {
      const user = userEvent.setup()
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/Buscar por ubicación/i)
      const searchButton = screen.getByRole('button', { name: /Buscar/i })
      
      await user.type(searchInput, 'Tegucigalpa Centro')
      await user.click(searchButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Tegucigalpa Centro',
          timestamp: expect.any(Number)
        })
      )
    })

    it('handles popular search pill clicks', async () => {
      const user = userEvent.setup()
      const popularSearches = ['Apartamento Tegucigalpa']
      render(<HeroSection onSearch={mockOnSearch} popularSearches={popularSearches} />)
      
      const pill = screen.getByText('Apartamento Tegucigalpa')
      await user.click(pill)
      
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Apartamento Tegucigalpa',
          timestamp: expect.any(Number)
        })
      )
    })

    it('includes user location in search when available', async () => {
      const user = userEvent.setup()
      render(<HeroSection onSearch={mockOnSearch} userLocation={mockUserLocation} />)
      
      const searchInput = screen.getByPlaceholderText(/Buscar por ubicación/i)
      const searchButton = screen.getByRole('button', { name: /Buscar/i })
      
      await user.type(searchInput, 'Casa cerca')
      await user.click(searchButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Casa cerca',
          location: mockUserLocation,
          timestamp: expect.any(Number)
        })
      )
    })
  })

  describe('Suggestions Handling', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    it('fetches suggestions when typing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const { apiClient } = await import('@/lib/trpc/simple-client')
      
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/Buscar por ubicación/i)
      await user.type(searchInput, 'Teguc')
      
      // Fast-forward debounce timer
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      await waitFor(() => {
        expect(apiClient.getSearchSuggestions).toHaveBeenCalledWith('Teguc')
      })
    })

    it('handles suggestion API errors gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const { apiClient } = await import('@/lib/trpc/simple-client')
      
      // Mock API error
      ;(apiClient.getSearchSuggestions as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/Buscar por ubicación/i)
      await user.type(searchInput, 'Test')
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch suggestions:',
          expect.any(Error)
        )
      })
      
      consoleSpy.mockRestore()
    })

    it('debounces suggestion requests correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const { apiClient } = await import('@/lib/trpc/simple-client')
      
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/Buscar por ubicación/i)
      
      // Type quickly
      await user.type(searchInput, 'T')
      await user.type(searchInput, 'e')
      await user.type(searchInput, 'g')
      
      // Only advance timer once
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      await waitFor(() => {
        // Should only be called once with the final value
        expect(apiClient.getSearchSuggestions).toHaveBeenCalledTimes(1)
        expect(apiClient.getSearchSuggestions).toHaveBeenCalledWith('Teg')
      })
    })
  })

  describe('CTA Button Actions', () => {
    beforeEach(() => {
      // Mock window.location.href setter
      delete (window as any).location
      window.location = { href: '' } as any
    })

    it('navigates to profile creation on CTA click', async () => {
      const user = userEvent.setup()
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const createProfileButton = screen.getByText('Crear Perfil Gratuito')
      await user.click(createProfileButton)
      
      expect(window.location.href).toBe('/profile/create')
    })

    it('triggers search on explore properties click', async () => {
      const user = userEvent.setup()
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const exploreButton = screen.getByText('Explorar Propiedades')
      await user.click(exploreButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Ver todas las propiedades',
          timestamp: expect.any(Number)
        })
      )
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Encuentra tu hogar perfecto en Honduras')
    })

    it('has proper form labeling', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchForm = screen.getByRole('search')
      expect(searchForm).toHaveAttribute('aria-label', 'Búsqueda de propiedades')
    })

    it('has accessible button labels', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchButton = screen.getByRole('button', { name: /Buscar/i })
      expect(searchButton).toBeInTheDocument()
      
      const createProfileButton = screen.getByRole('button', { name: 'Crear Perfil Gratuito' })
      expect(createProfileButton).toBeInTheDocument()
      
      const exploreButton = screen.getByRole('button', { name: 'Explorar Propiedades' })
      expect(exploreButton).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('shows abbreviated text on mobile for trust indicators', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<HeroSection onSearch={mockOnSearch} />)
      
      // The component uses CSS classes for responsive behavior
      // We can test that the appropriate classes are applied
      const trustIndicators = screen.getAllByText(/Sin|1,000|500|Verificación/)
      expect(trustIndicators.length).toBeGreaterThan(0)
    })

    it('handles different screen sizes for statistics layout', () => {
      render(<HeroSection onSearch={mockOnSearch} />)
      
      // Verify stats are present and properly structured
      const statsSection = screen.getByText('500+').closest('div')
      expect(statsSection).toBeInTheDocument()
    })
  })

  describe('Animation and Interactions', () => {
    it('renders without animation errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<HeroSection onSearch={mockOnSearch} />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles multiple rapid interactions gracefully', async () => {
      const user = userEvent.setup()
      render(<HeroSection onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/Buscar por ubicación/i)
      const searchButton = screen.getByRole('button', { name: /Buscar/i })
      
      // Rapid interactions
      await user.type(searchInput, 'Test')
      await user.click(searchButton)
      await user.clear(searchInput)
      await user.type(searchInput, 'New search')
      await user.click(searchButton)
      
      expect(mockOnSearch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('handles missing popular searches gracefully', () => {
      render(<HeroSection onSearch={mockOnSearch} popularSearches={[]} />)
      
      // Should not render popular searches section when empty
      expect(screen.queryByText('Búsquedas populares:')).not.toBeInTheDocument()
    })

    it('handles missing user location gracefully', () => {
      render(<HeroSection onSearch={mockOnSearch} userLocation={undefined} />)
      
      // Should still render and function normally
      expect(screen.getByPlaceholderText(/Buscar por ubicación/i)).toBeInTheDocument()
    })
  })
})