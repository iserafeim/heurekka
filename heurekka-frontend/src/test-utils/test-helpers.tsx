import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { Property, Suggestion, SearchQuery } from '@/types/homepage'

// Mock data generators for consistent testing

export const createMockProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'test-property-1',
  title: 'Apartamento moderno en Tegucigalpa',
  description: 'Hermoso apartamento con excelente ubicación',
  type: 'apartment',
  address: {
    street: 'Calle Principal 123',
    neighborhood: 'Centro',
    city: 'Tegucigalpa',
    state: 'Francisco Morazán',
    country: 'Honduras',
    postalCode: '11101'
  },
  coordinates: { lat: 14.0723, lng: -87.1921 },
  price: { amount: 15000, currency: 'HNL', period: 'month' },
  size: { value: 85, unit: 'm2' },
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'pool', 'security'],
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/image1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      alt: 'Vista del apartamento',
      width: 800,
      height: 600,
      order: 1
    }
  ],
  availableFrom: new Date('2024-02-01'),
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  viewCount: 125,
  saveCount: 8,
  responseTime: 25,
  verificationStatus: 'verified',
  landlord: {
    id: 'landlord-1',
    name: 'María González',
    photo: 'https://example.com/maria.jpg',
    rating: 4.8,
    responseRate: 95,
    whatsappEnabled: true
  },
  ...overrides
})

export const createMockSuggestion = (overrides: Partial<Suggestion> = {}): Suggestion => ({
  id: 'suggestion-1',
  text: 'Tegucigalpa Centro',
  type: 'location',
  icon: '📍',
  metadata: {
    propertyCount: 25,
    coordinates: { lat: 14.0723, lng: -87.1921, source: 'manual' }
  },
  ...overrides
})

export const createMockSearchQuery = (overrides: Partial<SearchQuery> = {}): SearchQuery => ({
  text: 'Apartamento en Tegucigalpa',
  timestamp: Date.now(),
  ...overrides
})

export const createMockSuggestions = (): Suggestion[] => [
  createMockSuggestion({
    id: 'suggestion-1',
    text: 'Tegucigalpa Centro',
    type: 'location'
  }),
  createMockSuggestion({
    id: 'suggestion-2',
    text: 'Casa en Colonia Palmira',
    type: 'property',
    metadata: { propertyCount: 12 }
  }),
  createMockSuggestion({
    id: 'suggestion-3',
    text: 'Apartamento 2 habitaciones',
    type: 'recent'
  })
]

// Mock functions
export const createMockOnSearch = () => jest.fn<void, [SearchQuery]>()
export const createMockOnFavorite = () => jest.fn<void, []>()
export const createMockOnContact = () => jest.fn<void, []>()

// Test utilities for Spanish content validation
export const spanishContentTests = {
  propertyTypes: {
    apartment: 'Apartamento',
    house: 'Casa',
    room: 'Habitación',
    commercial: 'Comercial'
  },
  
  pricePeriods: {
    month: '/mes',
    week: '/semana',
    day: '/día'
  },
  
  currencies: {
    HNL: 'L',
    USD: '$'
  },
  
  verificationStatus: {
    verified: 'Verificado',
    pending: 'En revisión',
    unverified: null // Should not display
  },
  
  commonPhrases: {
    popularSearches: 'Búsquedas populares:',
    whatsappContact: 'Contactar por WhatsApp',
    createProfile: 'Crear Perfil Gratuito',
    exploreProperties: 'Explorar Propiedades',
    clearSearch: 'Limpiar búsqueda',
    voiceSearch: 'Búsqueda por voz',
    addToFavorites: 'Agregar a favoritos',
    removeFromFavorites: 'Quitar de favoritos',
    noImage: 'Sin imagen'
  }
}

// Accessibility test helpers
export const accessibilityTestHelpers = {
  checkAriaLabels: (element: Element) => {
    const ariaLabel = element.getAttribute('aria-label')
    const ariaDescribedBy = element.getAttribute('aria-describedby')
    const textContent = element.textContent
    
    return ariaLabel || ariaDescribedBy || textContent
  },
  
  checkKeyboardNavigation: async (element: HTMLElement) => {
    // Helper to test if element can receive focus
    element.focus()
    return document.activeElement === element
  }
}

// Performance test helpers
export const performanceTestHelpers = {
  measureRenderTime: async (renderFn: () => void) => {
    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    return endTime - startTime
  },
  
  checkMemoryLeak: (fn: () => void, iterations: number = 100) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    for (let i = 0; i < iterations; i++) {
      fn()
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    return finalMemory - initialMemory
  }
}

// Custom render function with common providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any context providers here
}

export const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  // Wrapper component that provides all necessary contexts
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      // Add any providers here (Theme, Router, etc.)
      <>{children}</>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Mock window methods commonly used in components
export const setupWindowMocks = () => {
  const originalLocation = window.location
  const originalOpen = window.open
  
  // Mock window.location with a simple object that won't conflict with JSDOM
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true
  })
  
  // Mock window.open
  global.open = jest.fn()
  
  // Mock gtag
  window.gtag = jest.fn()
  
  return {
    cleanup: () => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
      window.open = originalOpen
      delete window.gtag
    }
  }
}

// Animation testing helpers
export const animationTestHelpers = {
  mockFramerMotion: () => {
    // Framer Motion is already mocked in jest.setup.js
    // This helper can be extended for specific animation tests
  },
  
  disableAnimations: () => {
    // Helper to disable animations for faster tests
    const style = document.createElement('style')
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: 0.01ms !important;
        transition-duration: 0.01ms !important;
        transition-delay: 0.01ms !important;
      }
    `
    document.head.appendChild(style)
    
    return () => document.head.removeChild(style)
  }
}

// Responsive design test helpers
export const responsiveTestHelpers = {
  mockViewport: (width: number, height: number = 768) => {
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
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
  },
  
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  }
}

// Error boundary test helper
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }

    return this.props.children
  }
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }