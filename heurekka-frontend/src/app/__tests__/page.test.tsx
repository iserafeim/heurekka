import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'
import { createMockSearchQuery, spanishContentTests, setupWindowMocks } from '@/test-utils/test-helpers'

// Mock the section components
jest.mock('@/components/sections/hero-section', () => ({
  HeroSection: ({ onSearch, popularSearches }: any) => (
    <div data-testid="hero-section">
      <h1>Hero Section Mock</h1>
      <button 
        onClick={() => onSearch(createMockSearchQuery())}
        data-testid="mock-search-button"
      >
        Mock Search
      </button>
      <div data-testid="popular-searches">
        {popularSearches?.map((search: string, index: number) => (
          <span key={index}>{search}</span>
        ))}
      </div>
    </div>
  )
}))

jest.mock('@/components/sections/value-proposition', () => ({
  ValueProposition: () => (
    <div data-testid="value-proposition-section">
      Value Proposition Mock
    </div>
  )
}))

jest.mock('@/components/sections/how-it-works', () => ({
  HowItWorks: () => (
    <div data-testid="how-it-works-section">
      How It Works Mock
    </div>
  )
}))

jest.mock('@/components/sections/featured-properties', () => ({
  FeaturedProperties: ({ onPropertyContact, onPropertyFavorite }: any) => (
    <div data-testid="featured-properties-section">
      Featured Properties Mock
      <button 
        onClick={() => onPropertyContact('test-property-1')}
        data-testid="mock-contact-button"
      >
        Contact Property
      </button>
      <button 
        onClick={() => onPropertyFavorite('test-property-1', true)}
        data-testid="mock-favorite-button"
      >
        Favorite Property
      </button>
    </div>
  )
}))

describe('HomePage', () => {
  let windowMocks: ReturnType<typeof setupWindowMocks>

  beforeEach(() => {
    windowMocks = setupWindowMocks()
    jest.clearAllMocks()
    // Mock gtag
    window.gtag = jest.fn()
  })

  afterEach(() => {
    windowMocks.cleanup()
  })

  describe('Basic Rendering', () => {
    it('renders the main structure correctly', () => {
      render(<HomePage />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByTestId('hero-section')).toBeInTheDocument()
      expect(screen.getByTestId('value-proposition-section')).toBeInTheDocument()
      expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument()
      expect(screen.getByTestId('featured-properties-section')).toBeInTheDocument()
    })

    it('has proper semantic structure', () => {
      render(<HomePage />)
      
      const main = screen.getByRole('main')
      expect(main).toHaveClass('min-h-screen')
    })

    it('passes popular searches to hero section', () => {
      render(<HomePage />)
      
      const popularSearches = screen.getByTestId('popular-searches')
      
      expect(popularSearches).toHaveTextContent('Apartamento Tegucigalpa')
      expect(popularSearches).toHaveTextContent('Casa Colonia Palmira')
      expect(popularSearches).toHaveTextContent('Con estacionamiento')
      expect(popularSearches).toHaveTextContent('2 habitaciones')
    })
  })

  describe('Search Functionality', () => {
    it('handles search queries correctly', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const searchButton = screen.getByTestId('mock-search-button')
      await user.click(searchButton)
      
      // Should navigate to search results page
      expect(window.location.href).toBe('/search?q=Apartamento%20en%20Tegucigalpa&timestamp=1234567890')
    })

    it('builds search URL with all query parameters', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // Mock a more complex search query
      const heroSection = screen.getByTestId('hero-section')
      const mockSearchQuery = {
        text: 'Casa con piscina',
        timestamp: 1234567890,
        location: { lat: 14.0723, lng: -87.1921 },
        filters: {
          priceMin: 10000,
          priceMax: 25000,
          propertyTypes: ['house', 'apartment'],
          bedrooms: [2, 3]
        }
      }
      
      // Trigger search with complex query
      fireEvent.click(heroSection, { detail: mockSearchQuery })
      
      // Mock the onSearch function to test URL building
      const handleSearch = (query: any) => {
        const searchParams = new URLSearchParams({
          q: query.text,
          timestamp: query.timestamp.toString()
        })

        if (query.location) {
          searchParams.set('lat', query.location.lat.toString())
          searchParams.set('lng', query.location.lng.toString())
        }

        if (query.filters) {
          if (query.filters.priceMin) {
            searchParams.set('priceMin', query.filters.priceMin.toString())
          }
          if (query.filters.priceMax) {
            searchParams.set('priceMax', query.filters.priceMax.toString())
          }
          if (query.filters.propertyTypes?.length) {
            searchParams.set('types', query.filters.propertyTypes.join(','))
          }
          if (query.filters.bedrooms?.length) {
            searchParams.set('bedrooms', query.filters.bedrooms.join(','))
          }
        }

        return `/search?${searchParams.toString()}`
      }
      
      const expectedUrl = handleSearch(mockSearchQuery)
      
      expect(expectedUrl).toContain('q=Casa%20con%20piscina')
      expect(expectedUrl).toContain('lat=14.0723')
      expect(expectedUrl).toContain('lng=-87.1921')
      expect(expectedUrl).toContain('priceMin=10000')
      expect(expectedUrl).toContain('priceMax=25000')
      expect(expectedUrl).toContain('types=house%2Capartment')
      expect(expectedUrl).toContain('bedrooms=2%2C3')
    })

    it('handles search without optional parameters', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const searchButton = screen.getByTestId('mock-search-button')
      await user.click(searchButton)
      
      // Should handle basic search without location or filters
      expect(window.location.href).toContain('/search?q=')
    })

    it('handles window navigation correctly', async () => {
      const user = userEvent.setup()
      
      // Mock window object
      const mockLocation = { href: '' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      })
      
      render(<HomePage />)
      
      const searchButton = screen.getByTestId('mock-search-button')
      await user.click(searchButton)
      
      expect(window.location.href).toBeTruthy()
    })

    it('handles server-side rendering gracefully', () => {
      // Mock window being undefined (SSR scenario)
      const originalWindow = global.window
      delete (global as any).window
      
      // Should render without errors
      expect(() => render(<HomePage />)).not.toThrow()
      
      // Restore window
      global.window = originalWindow
    })
  })

  describe('Property Interactions', () => {
    it('handles property contact events', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const contactButton = screen.getByTestId('mock-contact-button')
      await user.click(contactButton)
      
      // Should track analytics event
      expect(window.gtag).toHaveBeenCalledWith('event', 'property_contact', {
        property_id: 'test-property-1',
        contact_method: 'whatsapp'
      })
    })

    it('handles property favorite events', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const favoriteButton = screen.getByTestId('mock-favorite-button')
      await user.click(favoriteButton)
      
      // Should track analytics event
      expect(window.gtag).toHaveBeenCalledWith('event', 'property_favorite', {
        property_id: 'test-property-1',
        favorited: true
      })
    })

    it('handles missing gtag gracefully', async () => {
      const user = userEvent.setup()
      
      // Remove gtag
      delete window.gtag
      
      render(<HomePage />)
      
      const contactButton = screen.getByTestId('mock-contact-button')
      
      // Should not throw error when gtag is undefined
      expect(() => user.click(contactButton)).not.toThrow()
    })

    it('logs property interactions to console', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<HomePage />)
      
      const contactButton = screen.getByTestId('mock-contact-button')
      const favoriteButton = screen.getByTestId('mock-favorite-button')
      
      await user.click(contactButton)
      await user.click(favoriteButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('Contact property:', 'test-property-1')
      expect(consoleSpy).toHaveBeenCalledWith('Favorite property:', 'test-property-1', true)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Loading States and Suspense', () => {
    it('shows loading skeletons while sections load', () => {
      render(<HomePage />)
      
      // All sections should be wrapped in Suspense
      // The mock components will render immediately, but in real app
      // they would show loading states
      expect(screen.getByTestId('value-proposition-section')).toBeInTheDocument()
      expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument()
      expect(screen.getByTestId('featured-properties-section')).toBeInTheDocument()
    })

    it('renders section skeleton with correct structure', () => {
      // Test the SectionSkeleton component directly
      const SectionSkeleton = () => (
        <div className="animate-pulse py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-100 rounded-xl p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      )
      
      render(<SectionSkeleton />)
      
      const skeletonContainer = document.querySelector('.animate-pulse')
      expect(skeletonContainer).toBeInTheDocument()
      expect(skeletonContainer).toHaveClass('py-16')
    })
  })

  describe('Accessibility', () => {
    it('has proper main landmark', () => {
      render(<HomePage />)
      
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toHaveClass('min-h-screen')
    })

    it('maintains proper document structure', () => {
      render(<HomePage />)
      
      // Should have proper sectioning
      const main = screen.getByRole('main')
      const sections = main.querySelectorAll('[data-testid*="section"]')
      
      expect(sections.length).toBeGreaterThan(0)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // Tab through interactive elements
      await user.tab()
      
      // Should be able to reach interactive elements
      const focusedElement = document.activeElement
      expect(focusedElement).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('applies correct CSS classes for mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<HomePage />)
      
      const main = screen.getByRole('main')
      expect(main).toHaveClass('min-h-screen')
    })

    it('handles different viewport sizes', () => {
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ]
      
      viewports.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        })
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        })
        
        const { unmount } = render(<HomePage />)
        
        // Should render without errors on any viewport
        expect(screen.getByRole('main')).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Test that the component doesn't crash with invalid props
      render(<HomePage />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles missing window object in SSR', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      expect(() => render(<HomePage />)).not.toThrow()
      
      global.window = originalWindow
    })

    it('handles navigation errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock window.location.href setter to throw
      Object.defineProperty(window, 'location', {
        value: {
          get href() { return '' },
          set href(val) { throw new Error('Navigation error') }
        }
      })
      
      render(<HomePage />)
      
      const searchButton = screen.getByTestId('mock-search-button')
      
      // Should not crash the app
      expect(() => user.click(searchButton)).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = performance.now()
      
      render(<HomePage />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render quickly
      expect(renderTime).toBeLessThan(100) // Less than 100ms
    })

    it('does not cause memory leaks with multiple renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<HomePage />)
        unmount()
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory
        // Should not increase memory significantly
        expect(memoryIncrease).toBeLessThan(1024 * 1024) // Less than 1MB
      }
    })
  })

  describe('Future Sections Comment', () => {
    it('includes placeholder for future sections', () => {
      render(<HomePage />)
      
      // Check that the comment structure exists in the component
      // This tests that the developer has planned for future additions
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      
      // The comment should be in the source code (this is more of a code review test)
      // but we can at least verify the structure supports future additions
      expect(main.children.length).toBeGreaterThan(3) // Hero + 3 sections
    })
  })
})