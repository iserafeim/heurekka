'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { PropertyCard } from '@/components/ui/property-card'
import { Button } from '@/components/ui/button'
import type { Property } from '@/types/homepage'


// This will be loaded from the API client
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento moderno en Colonia Palmira',
    description: 'Hermoso apartamento de 2 habitaciones en excelente ubicación',
    type: 'apartment',
    address: {
      street: 'Calle Principal #123',
      neighborhood: 'Colonia Palmira',
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
    amenities: ['estacionamiento', 'seguridad', 'piscina'],
    images: [
      {
        id: '1',
        url: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        alt: 'Vista principal del apartamento',
        width: 400,
        height: 300,
        order: 1
      }
    ],
    availableFrom: new Date('2024-02-01'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    viewCount: 45,
    saveCount: 8,
    responseTime: 15,
    verificationStatus: 'verified',
    landlord: {
      id: 'landlord1',
      name: 'María González',
      rating: 4.8,
      responseRate: 95,
      whatsappEnabled: true
    }
  },
  {
    id: '2',
    title: 'Casa familiar en Lomas del Guijarro',
    description: 'Amplia casa de 3 habitaciones con jardín y garage',
    type: 'house',
    address: {
      street: 'Boulevard Los Próceres #456',
      neighborhood: 'Lomas del Guijarro',
      city: 'Tegucigalpa',
      state: 'Francisco Morazán',
      country: 'Honduras',
      postalCode: '11102'
    },
    coordinates: { lat: 14.0833, lng: -87.1833 },
    price: { amount: 25000, currency: 'HNL', period: 'month' },
    size: { value: 150, unit: 'm2' },
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['jardín', 'garage', 'terraza'],
    images: [
      {
        id: '2',
        url: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        alt: 'Fachada de la casa',
        width: 400,
        height: 300,
        order: 1
      }
    ],
    availableFrom: new Date('2024-02-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    viewCount: 32,
    saveCount: 12,
    responseTime: 8,
    verificationStatus: 'verified',
    landlord: {
      id: 'landlord2',
      name: 'Carlos Rodríguez',
      rating: 4.9,
      responseRate: 98,
      whatsappEnabled: true
    }
  },
  {
    id: '3',
    title: 'Estudio amueblado en Centro Histórico',
    description: 'Acogedor estudio completamente amueblado, ideal para profesionales',
    type: 'apartment',
    address: {
      street: 'Avenida Cervantes #789',
      neighborhood: 'Centro Histórico',
      city: 'Tegucigalpa',
      state: 'Francisco Morazán',
      country: 'Honduras',
      postalCode: '11103'
    },
    coordinates: { lat: 14.0969, lng: -87.2063 },
    price: { amount: 8500, currency: 'HNL', period: 'month' },
    size: { value: 35, unit: 'm2' },
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['amueblado', 'internet', 'servicios incluidos'],
    images: [
      {
        id: '3',
        url: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        alt: 'Interior del estudio',
        width: 400,
        height: 300,
        order: 1
      }
    ],
    availableFrom: new Date('2024-01-25'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    viewCount: 67,
    saveCount: 15,
    responseTime: 25,
    verificationStatus: 'pending',
    landlord: {
      id: 'landlord3',
      name: 'Ana Martínez',
      rating: 4.7,
      responseRate: 92,
      whatsappEnabled: true
    }
  }
]

interface FeaturedPropertiesProps {
  properties?: Property[]
  onPropertyContact?: (propertyId: string) => void
  onPropertyFavorite?: (propertyId: string, isFavorited: boolean) => void
}

export function FeaturedProperties({
  properties = mockProperties,
  onPropertyContact,
  onPropertyFavorite
}: FeaturedPropertiesProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: true })
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  

  const handleFavorite = (propertyId: string) => {
    const isFavorited = favorites.has(propertyId)
    const newFavorites = new Set(favorites)
    
    if (isFavorited) {
      newFavorites.delete(propertyId)
    } else {
      newFavorites.add(propertyId)
    }
    
    setFavorites(newFavorites)
    onPropertyFavorite?.(propertyId, !isFavorited)
  }

  const handleContact = (propertyId: string) => {
    onPropertyContact?.(propertyId)
  }

  const handleViewAll = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/search'
    }
  }

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      const canScrollLeft = scrollLeft > 0
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1
      
      // Only update state if values have changed to prevent unnecessary re-renders
      setScrollState(prevState => {
        if (prevState.canScrollLeft !== canScrollLeft || prevState.canScrollRight !== canScrollRight) {
          return { canScrollLeft, canScrollRight }
        }
        return prevState
      })
    }
  }, [])

  // Throttled scroll handler that only updates button state after scroll ends
  const handleScroll = useCallback(() => {
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Set new timeout to update buttons only after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      updateScrollButtons()
    }, 150) // 150ms delay after scroll ends
  }, [updateScrollButtons])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 1.0 // Full viewport width for aggressive scroll
      container.scrollTo({ 
        left: container.scrollLeft - scrollAmount, 
        behavior: 'auto' 
      })
      // Update buttons immediately for button clicks
      setTimeout(updateScrollButtons, 50)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 1.0 // Full viewport width for aggressive scroll
      container.scrollTo({ 
        left: container.scrollLeft + scrollAmount, 
        behavior: 'auto' 
      })
      // Update buttons immediately for button clicks
      setTimeout(updateScrollButtons, 50)
    }
  }


  // Keyboard navigation and wheel scroll support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scrollContainerRef.current?.matches(':focus-within')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          scrollLeft()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          scrollRight()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Initialize scroll buttons state
  useEffect(() => {
    updateScrollButtons()
  }, [properties, updateScrollButtons])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  if (properties.length === 0) {
    return null
  }

  return (
    <section className="relative pb-16 lg:pb-24 bg-gray-50">
      {/* Background extension to cover white space */}
      <div className="absolute -top-48 left-0 right-0 h-48 bg-gray-50" />
      <div className="container-wide relative">
        {/* Header with controls like Zillow */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 pr-8">
            <h2 className="text-2xl font-semibold mb-1 leading-tight">
              Propiedades para ti en Tegucigalpa, Honduras
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Basado en propiedades que has visto recientemente
            </p>
          </div>
          
          {/* Navigation arrows only */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={scrollLeft}
              disabled={!scrollState.canScrollLeft}
              className={`w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
                scrollState.canScrollLeft ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={scrollRight}
              disabled={!scrollState.canScrollRight}
              className={`w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
                scrollState.canScrollRight ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Carousel container with floating button */}
        <div className="relative">
          {/* Properties carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 sm:gap-8 pb-4 focus:outline-none scrollbar-hide"
            tabIndex={0}
            role="region"
            aria-label="Carrusel de propiedades"
          >
            {properties.map((property, index) => (
              <div 
                key={property.id} 
                className="flex-none w-[280px] sm:w-[320px]"
              >
                <PropertyCard
                  property={property}
                  isFavorited={favorites.has(property.id)}
                  onFavorite={() => handleFavorite(property.id)}
                  onContact={() => handleContact(property.id)}
                />
              </div>
            ))}
          </div>

          {/* Floating 'Ver más' button - square with white bg and blue border */}
          <Button
            onClick={handleViewAll}
            variant="outline"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg shadow-lg hidden md:flex items-center"
          >
            Ver más
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}