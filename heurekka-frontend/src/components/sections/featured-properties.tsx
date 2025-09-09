'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { PropertyCard } from '@/components/property/property-card'
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320 + 32 // Card width + gap
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' })
      setTimeout(updateScrollButtons, 100)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320 + 32 // Card width + gap
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
      setTimeout(updateScrollButtons, 100)
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

    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current && scrollContainerRef.current.contains(e.target as Node)) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          // Horizontal scroll detected
          e.preventDefault()
          scrollContainerRef.current.scrollLeft += e.deltaX
          updateScrollButtons()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Initialize scroll buttons state
  useEffect(() => {
    updateScrollButtons()
  }, [properties])

  if (properties.length === 0) {
    return null
  }

  return (
    <section className="section-spacing bg-neutral-50/30">
      <div className="container-wide">
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
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
                canScrollLeft ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
                canScrollRight ? 'opacity-100' : 'opacity-30 cursor-not-allowed'
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
            onScroll={updateScrollButtons}
            className="flex overflow-x-auto gap-8 pb-4 scroll-smooth focus:outline-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            tabIndex={0}
            role="region"
            aria-label="Carrusel de propiedades"
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {properties.map((property, index) => (
              <div key={property.id} className="flex-none w-[320px]">
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