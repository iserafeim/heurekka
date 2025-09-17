import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyCard } from '@/components/ui/property-card'
import type { Property } from '@/types/homepage'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, ...props }: any) => {
    return (
      <img
        {...props}
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="property-image"
      />
    )
  },
}))

describe('PropertyCard', () => {
  const mockProperty: Property = {
    id: 'prop-123',
    title: 'Apartamento moderno en Tegucigalpa Centro',
    description: 'Hermoso apartamento con vista panorámica',
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
    amenities: ['parking', 'pool', 'gym'],
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        alt: 'Vista del apartamento',
        width: 800,
        height: 600,
        order: 1
      },
      {
        id: 'img-2',
        url: 'https://example.com/image2.jpg',
        thumbnailUrl: 'https://example.com/thumb2.jpg',
        alt: 'Cocina moderna',
        width: 800,
        height: 600,
        order: 2
      }
    ],
    availableFrom: new Date('2024-02-01'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    viewCount: 245,
    saveCount: 12,
    responseTime: 25,
    verificationStatus: 'verified',
    landlord: {
      id: 'landlord-456',
      name: 'María González',
      photo: 'https://example.com/maria.jpg',
      rating: 4.8,
      responseRate: 95,
      whatsappEnabled: true
    }
  }

  const mockOnFavorite = jest.fn()
  const mockOnContact = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.open for WhatsApp tests
    global.open = jest.fn()
  })

  describe('Basic Rendering', () => {
    it('renders property card with all essential information', () => {
      render(<PropertyCard property={mockProperty} />)
      
      expect(screen.getByText('Apartamento moderno en Tegucigalpa Centro')).toBeInTheDocument()
      expect(screen.getByText('L 15,000/mes')).toBeInTheDocument()
      expect(screen.getByText('Apartamento')).toBeInTheDocument()
      expect(screen.getByText('Centro, Tegucigalpa')).toBeInTheDocument()
      expect(screen.getByText('María González')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('25 min')).toBeInTheDocument()
    })

    it('renders property image with correct alt text', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const image = screen.getByTestId('property-image')
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
      expect(image).toHaveAttribute('alt', 'Vista del apartamento')
    })

    it('shows verification badge for verified properties', () => {
      render(<PropertyCard property={mockProperty} />)
      
      expect(screen.getByText('Verificado')).toBeInTheDocument()
    })

    it('shows pending verification badge', () => {
      const pendingProperty = { ...mockProperty, verificationStatus: 'pending' as const }
      render(<PropertyCard property={pendingProperty} />)
      
      expect(screen.getByText('En revisión')).toBeInTheDocument()
    })

    it('does not show verification badge for unverified properties', () => {
      const unverifiedProperty = { ...mockProperty, verificationStatus: 'unverified' as const }
      render(<PropertyCard property={unverifiedProperty} />)
      
      expect(screen.queryByText('Verificado')).not.toBeInTheDocument()
      expect(screen.queryByText('En revisión')).not.toBeInTheDocument()
    })
  })

  describe('Spanish Content Validation', () => {
    it('displays property types in Spanish', () => {
      const testCases = [
        { type: 'apartment' as const, expected: 'Apartamento' },
        { type: 'house' as const, expected: 'Casa' },
        { type: 'room' as const, expected: 'Habitación' },
        { type: 'commercial' as const, expected: 'Comercial' }
      ]

      testCases.forEach(({ type, expected }) => {
        const property = { ...mockProperty, type }
        const { unmount } = render(<PropertyCard property={property} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })

    it('formats price correctly for different currencies', () => {
      // HNL currency test
      render(<PropertyCard property={mockProperty} />)
      expect(screen.getByText('L 15,000/mes')).toBeInTheDocument()
      
      // USD currency test
      const usdProperty = {
        ...mockProperty,
        price: { amount: 500, currency: 'USD' as const, period: 'month' as const }
      }
      const { rerender } = render(<PropertyCard property={usdProperty} />)
      rerender(<PropertyCard property={usdProperty} />)
      expect(screen.getByText('$500/mes')).toBeInTheDocument()
    })

    it('formats price for different periods in Spanish', () => {
      const testCases = [
        { period: 'month' as const, expected: '/mes' },
        { period: 'week' as const, expected: '/semana' },
        { period: 'day' as const, expected: '/día' }
      ]

      testCases.forEach(({ period, expected }) => {
        const property = {
          ...mockProperty,
          price: { ...mockProperty.price, period }
        }
        const { unmount } = render(<PropertyCard property={property} />)
        expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
        unmount()
      })
    })

    it('has WhatsApp button with Spanish text', () => {
      render(<PropertyCard property={mockProperty} />)
      
      expect(screen.getByText('Contactar por WhatsApp')).toBeInTheDocument()
    })
  })

  describe('Property Details Display', () => {
    it('shows correct property specifications', () => {
      render(<PropertyCard property={mockProperty} />)
      
      expect(screen.getByText('2')).toBeInTheDocument() // bedrooms
      expect(screen.getByText('2')).toBeInTheDocument() // bathrooms  
      expect(screen.getByText('85m²')).toBeInTheDocument() // size
      expect(screen.getByText('245')).toBeInTheDocument() // view count
    })

    it('shows landlord information correctly', () => {
      render(<PropertyCard property={mockProperty} />)
      
      expect(screen.getByText('María González')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('25 min')).toBeInTheDocument()
    })

    it('handles missing landlord photo gracefully', () => {
      const propertyWithoutPhoto = {
        ...mockProperty,
        landlord: { ...mockProperty.landlord, photo: undefined }
      }
      
      render(<PropertyCard property={propertyWithoutPhoto} />)
      
      // Should show landlord's initial
      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('shows response time in correct format', () => {
      const testCases = [
        { responseTime: 30, expected: '30 min' },
        { responseTime: 90, expected: '1h' },
        { responseTime: 150, expected: '2h' }
      ]

      testCases.forEach(({ responseTime, expected }) => {
        const property = { ...mockProperty, responseTime }
        const { unmount } = render(<PropertyCard property={property} />)
        expect(screen.getByText(expected)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Image Handling', () => {
    it('shows image count indicator for multiple images', () => {
      render(<PropertyCard property={mockProperty} />)
      
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('does not show image count for single image', () => {
      const singleImageProperty = {
        ...mockProperty,
        images: [mockProperty.images[0]]
      }
      
      render(<PropertyCard property={singleImageProperty} />)
      
      expect(screen.queryByText('1/1')).not.toBeInTheDocument()
    })

    it('shows placeholder when no images available', () => {
      const noImageProperty = { ...mockProperty, images: [] }
      render(<PropertyCard property={noImageProperty} />)
      
      expect(screen.getByText('Sin imagen')).toBeInTheDocument()
      expect(screen.getByAltText('Sin imagen disponible')).toBeInTheDocument()
    })

    it('handles image loading error gracefully', async () => {
      render(<PropertyCard property={mockProperty} />)
      
      const image = screen.getByTestId('property-image')
      fireEvent.error(image)
      
      await waitFor(() => {
        expect(screen.getByText('Sin imagen')).toBeInTheDocument()
      })
    })

    it('handles image loading completion', async () => {
      render(<PropertyCard property={mockProperty} />)
      
      const image = screen.getByTestId('property-image')
      fireEvent.load(image)
      
      // Image should be visible after loading
      expect(image).toBeInTheDocument()
    })
  })

  describe('Favorite Functionality', () => {
    it('shows unfavorited heart icon by default', () => {
      render(<PropertyCard property={mockProperty} onFavorite={mockOnFavorite} />)
      
      const favoriteButton = screen.getByLabelText('Agregar a favoritos')
      expect(favoriteButton).toBeInTheDocument()
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('shows favorited heart icon when isFavorited is true', () => {
      render(<PropertyCard property={mockProperty} isFavorited={true} onFavorite={mockOnFavorite} />)
      
      const favoriteButton = screen.getByLabelText('Quitar de favoritos')
      expect(favoriteButton).toBeInTheDocument()
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('calls onFavorite when favorite button is clicked', async () => {
      const user = userEvent.setup()
      render(<PropertyCard property={mockProperty} onFavorite={mockOnFavorite} />)
      
      const favoriteButton = screen.getByLabelText('Agregar a favoritos')
      await user.click(favoriteButton)
      
      expect(mockOnFavorite).toHaveBeenCalledTimes(1)
    })

    it('works without onFavorite callback', async () => {
      const user = userEvent.setup()
      render(<PropertyCard property={mockProperty} />)
      
      const favoriteButton = screen.getByLabelText('Agregar a favoritos')
      await user.click(favoriteButton)
      
      // Should not throw error
      expect(favoriteButton).toBeInTheDocument()
    })
  })

  describe('WhatsApp Integration', () => {
    beforeEach(() => {
      global.open = jest.fn()
    })

    it('opens WhatsApp with correct message when button is clicked', async () => {
      const user = userEvent.setup()
      render(<PropertyCard property={mockProperty} onContact={mockOnContact} />)
      
      const whatsappButton = screen.getByText('Contactar por WhatsApp')
      await user.click(whatsappButton)
      
      expect(global.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank',
        'noopener,noreferrer'
      )
      expect(mockOnContact).toHaveBeenCalledTimes(1)
    })

    it('includes property details in WhatsApp message', async () => {
      const user = userEvent.setup()
      render(<PropertyCard property={mockProperty} onContact={mockOnContact} />)
      
      const whatsappButton = screen.getByText('Contactar por WhatsApp')
      await user.click(whatsappButton)
      
      const expectedMessage = encodeURIComponent(
        `Hola, me interesa la propiedad "Apartamento moderno en Tegucigalpa Centro" (ID: prop-123). ¿Podrías darme más información?`
      )
      
      expect(global.open).toHaveBeenCalledWith(
        `https://wa.me/?text=${expectedMessage}`,
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('disables WhatsApp button when landlord has WhatsApp disabled', () => {
      const propertyWithoutWhatsApp = {
        ...mockProperty,
        landlord: { ...mockProperty.landlord, whatsappEnabled: false }
      }
      
      render(<PropertyCard property={propertyWithoutWhatsApp} />)
      
      const whatsappButton = screen.getByText('Contactar por WhatsApp')
      expect(whatsappButton).toBeDisabled()
    })

    it('does not open WhatsApp when disabled button is clicked', async () => {
      const user = userEvent.setup()
      const propertyWithoutWhatsApp = {
        ...mockProperty,
        landlord: { ...mockProperty.landlord, whatsappEnabled: false }
      }
      
      render(<PropertyCard property={propertyWithoutWhatsApp} onContact={mockOnContact} />)
      
      const whatsappButton = screen.getByText('Contactar por WhatsApp')
      await user.click(whatsappButton)
      
      expect(global.open).not.toHaveBeenCalled()
      expect(mockOnContact).not.toHaveBeenCalled()
    })

    it('works without onContact callback', async () => {
      const user = userEvent.setup()
      render(<PropertyCard property={mockProperty} />)
      
      const whatsappButton = screen.getByText('Contactar por WhatsApp')
      await user.click(whatsappButton)
      
      expect(global.open).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper article structure with accessible name', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveAttribute('aria-label', 'Propiedad: Apartamento moderno en Tegucigalpa Centro')
    })

    it('has accessible favorite button', () => {
      render(<PropertyCard property={mockProperty} onFavorite={mockOnFavorite} />)
      
      const favoriteButton = screen.getByRole('button', { name: 'Agregar a favoritos' })
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('has accessible WhatsApp button', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const whatsappButton = screen.getByRole('button', { name: 'Contactar por WhatsApp' })
      expect(whatsappButton).toBeInTheDocument()
    })

    it('provides proper alt text for landlord photo', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const landlordPhoto = screen.getByAltText('María González')
      expect(landlordPhoto).toBeInTheDocument()
    })

    it('has proper focus management', async () => {
      const user = userEvent.setup()
      render(<PropertyCard property={mockProperty} onFavorite={mockOnFavorite} />)
      
      // Tab to favorite button
      await user.tab()
      expect(screen.getByLabelText('Agregar a favoritos')).toHaveFocus()
      
      // Tab to WhatsApp button
      await user.tab()
      expect(screen.getByText('Contactar por WhatsApp')).toHaveFocus()
    })
  })

  describe('Responsive Behavior', () => {
    it('applies correct CSS classes for responsive layout', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveClass('group', 'bg-white', 'border', 'rounded-xl')
    })

    it('handles long property titles gracefully', () => {
      const longTitleProperty = {
        ...mockProperty,
        title: 'Apartamento súper moderno con vista panorámica increíble en el centro de Tegucigalpa con todas las comodidades imaginables'
      }
      
      render(<PropertyCard property={longTitleProperty} />)
      
      const title = screen.getByText(longTitleProperty.title)
      expect(title).toHaveClass('line-clamp-2')
    })

    it('handles long neighborhood names', () => {
      const longNeighborhoodProperty = {
        ...mockProperty,
        address: {
          ...mockProperty.address,
          neighborhood: 'Residencial Los Profesionales de Tegucigalpa'
        }
      }
      
      render(<PropertyCard property={longNeighborhoodProperty} />)
      
      const location = screen.getByText(/Residencial Los Profesionales de Tegucigalpa/)
      expect(location.parentElement).toHaveClass('truncate')
    })
  })

  describe('Hover and Animation Effects', () => {
    it('applies hover classes for card interactions', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveClass('hover:shadow-lg', 'hover:-translate-y-1', 'transition-all')
    })

    it('applies focus-within styles for accessibility', () => {
      render(<PropertyCard property={mockProperty} />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveClass('focus-within:ring-2', 'focus-within:ring-primary')
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<PropertyCard property={mockProperty} className="custom-card-class" />)
      
      const article = screen.getByRole('article')
      expect(article).toHaveClass('custom-card-class')
    })

    it('preserves all callback props', async () => {
      const user = userEvent.setup()
      render(
        <PropertyCard
          property={mockProperty}
          isFavorited={true}
          onFavorite={mockOnFavorite}
          onContact={mockOnContact}
        />
      )
      
      const favoriteButton = screen.getByLabelText('Quitar de favoritos')
      const whatsappButton = screen.getByText('Contactar por WhatsApp')
      
      await user.click(favoriteButton)
      await user.click(whatsappButton)
      
      expect(mockOnFavorite).toHaveBeenCalledTimes(1)
      expect(mockOnContact).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing optional properties gracefully', () => {
      const minimalProperty = {
        ...mockProperty,
        images: [],
        landlord: {
          ...mockProperty.landlord,
          photo: undefined
        }
      }
      
      render(<PropertyCard property={minimalProperty} />)
      
      // Should render without errors
      expect(screen.getByText('Apartamento moderno en Tegucigalpa Centro')).toBeInTheDocument()
      expect(screen.getByText('Sin imagen')).toBeInTheDocument()
      expect(screen.getByText('M')).toBeInTheDocument() // Landlord initial
    })

    it('handles zero values correctly', () => {
      const zeroValuesProperty = {
        ...mockProperty,
        bedrooms: 0,
        bathrooms: 0,
        viewCount: 0,
        responseTime: 0
      }
      
      render(<PropertyCard property={zeroValuesProperty} />)
      
      expect(screen.getByText('0')).toBeInTheDocument() // bedrooms
      expect(screen.getByText('0 min')).toBeInTheDocument() // response time
    })

    it('handles very large numbers correctly', () => {
      const expensiveProperty = {
        ...mockProperty,
        price: { amount: 1000000, currency: 'HNL' as const, period: 'month' as const },
        viewCount: 999999
      }
      
      render(<PropertyCard property={expensiveProperty} />)
      
      expect(screen.getByText('L 1,000,000/mes')).toBeInTheDocument()
      expect(screen.getByText('999999')).toBeInTheDocument()
    })
  })
})