'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
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

  if (properties.length === 0) {
    return null
  }

  return (
    <section className="section-spacing bg-neutral-50/30">
      <div className="container-wide">
        {/* Header like reference */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-headline">
            Propiedades para ti en Tegucigalpa, Honduras
          </h2>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Mostrando {properties.slice(0, 8).length} de {properties.length}</span>
          </div>
        </div>

        {/* Properties grid like reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.slice(0, 8).map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorited={favorites.has(property.id)}
              onFavorite={() => handleFavorite(property.id)}
              onContact={() => handleContact(property.id)}
            />
          ))}
        </div>

        {/* Simple CTA */}
        <div className="text-center mt-12">
          <Button 
            onClick={handleViewAll}
            variant="outline"
            size="lg"
          >
            Ver todas las propiedades
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}