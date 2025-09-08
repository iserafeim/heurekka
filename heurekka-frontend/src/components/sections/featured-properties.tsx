'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Eye } from 'lucide-react'
import { PropertyCard } from '@/components/property/property-card'
import { Container } from '@/components/common/container'
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? Math.max(0, properties.length - 3) : prev - 1))
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev >= properties.length - 3 ? 0 : prev + 1))
  }

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
    <section className="py-16 sm:py-24 bg-white">
      <Container>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Propiedades{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Destacadas
              </span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Descubre algunas de las mejores propiedades disponibles en Tegucigalpa. 
              Todas verificadas y listas para contactar.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-6 sm:mt-0">
            {/* Navigation arrows - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentSlide === 0}
                className="h-10 w-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentSlide >= properties.length - 3}
                className="h-10 w-10"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button onClick={handleViewAll} className="group">
              Ver Todas
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Properties grid/carousel */}
        <div className="relative overflow-hidden">
          {/* Desktop: Grid layout */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.slice(0, 6).map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard
                  property={property}
                  isFavorited={favorites.has(property.id)}
                  onFavorite={() => handleFavorite(property.id)}
                  onContact={() => handleContact(property.id)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile: Horizontal scroll */}
          <div className="sm:hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-80"
                >
                  <PropertyCard
                    property={property}
                    isFavorited={favorites.has(property.id)}
                    onFavorite={() => handleFavorite(property.id)}
                    onContact={() => handleContact(property.id)}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Mobile scroll indicator */}
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: Math.min(properties.length, 5) }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-neutral-300"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary mb-1">
              <Eye className="w-5 h-5" />
              {properties.reduce((acc, p) => acc + p.viewCount, 0)}
            </div>
            <div className="text-sm text-neutral-600">Visualizaciones totales</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {properties.filter(p => p.verificationStatus === 'verified').length}
            </div>
            <div className="text-sm text-neutral-600">Verificadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(properties.reduce((acc, p) => acc + p.responseTime, 0) / properties.length)}min
            </div>
            <div className="text-sm text-neutral-600">Respuesta promedio</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(properties.reduce((acc, p) => acc + p.landlord.rating, 0) / properties.length * 10) / 10}
            </div>
            <div className="text-sm text-neutral-600">Calificación promedio</div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-neutral-600 mb-6">
            ¿No encuentras lo que buscas? Crea tu perfil y recibe notificaciones 
            de nuevas propiedades que coincidan con tus criterios.
          </p>
          <Button 
            size="lg"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/profile/create'
              }
            }}
          >
            Crear Mi Perfil de Búsqueda
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}