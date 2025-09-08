/**
 * Simplified API client for homepage functionality
 * This will be replaced with proper tRPC integration once backend is properly connected
 */

import type { Property, Suggestion, SearchQuery, HomepageData } from '@/types/homepage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class SimpleAPIClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getFeaturedProperties(limit = 6): Promise<Property[]> {
    try {
      // For now, return mock data
      return this.getMockProperties().slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch featured properties:', error)
      return this.getMockProperties().slice(0, limit)
    }
  }

  async getSearchSuggestions(query: string): Promise<Suggestion[]> {
    try {
      // For now, return mock suggestions
      return this.getMockSuggestions().filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error)
      return []
    }
  }

  async searchProperties(query: SearchQuery): Promise<{ properties: Property[], total: number }> {
    try {
      // For now, return filtered mock data
      const properties = this.getMockProperties().filter(p => 
        p.title.toLowerCase().includes(query.text.toLowerCase()) ||
        p.address.neighborhood.toLowerCase().includes(query.text.toLowerCase())
      )
      return { properties, total: properties.length }
    } catch (error) {
      console.error('Failed to search properties:', error)
      return { properties: [], total: 0 }
    }
  }

  private getMockProperties(): Property[] {
    return [
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
            url: 'https://picsum.photos/400/300?random=1',
            thumbnailUrl: 'https://picsum.photos/200/150?random=1',
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
            url: 'https://picsum.photos/400/300?random=2',
            thumbnailUrl: 'https://picsum.photos/200/150?random=2',
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
            url: 'https://picsum.photos/400/300?random=3',
            thumbnailUrl: 'https://picsum.photos/200/150?random=3',
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
  }

  private getMockSuggestions(): Suggestion[] {
    return [
      {
        id: 'loc-1',
        text: 'Colonia Palmira',
        type: 'location',
        icon: 'map-pin',
        metadata: { propertyCount: 45 }
      },
      {
        id: 'loc-2', 
        text: 'Lomas del Guijarro',
        type: 'location',
        icon: 'map-pin',
        metadata: { propertyCount: 32 }
      },
      {
        id: 'prop-1',
        text: 'Apartamento 2 habitaciones',
        type: 'property',
        icon: 'home',
        metadata: { propertyCount: 128 }
      },
      {
        id: 'prop-2',
        text: 'Casa con jardín',
        type: 'property',
        icon: 'home',
        metadata: { propertyCount: 64 }
      },
      {
        id: 'recent-1',
        text: 'Apartamento amueblado',
        type: 'recent',
        icon: 'history'
      }
    ]
  }
}

export const apiClient = new SimpleAPIClient()