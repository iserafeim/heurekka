'use client'

import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/hero-section'
import { ValueProposition } from '@/components/sections/value-proposition'
import { HowItWorks } from '@/components/sections/how-it-works'
import { FeaturedProperties } from '@/components/sections/featured-properties'
import type { SearchQuery } from '@/types/homepage'

// Loading components
function SectionSkeleton() {
  return (
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
}

export default function HomePage() {
  // Handle search from hero section
  const handleSearch = (query: SearchQuery) => {
    // Build search URL with query parameters
    const searchParams = new URLSearchParams({
      q: query.text,
      timestamp: query.timestamp.toString()
    })

    // Add location if available
    if (query.location) {
      searchParams.set('lat', query.location.lat.toString())
      searchParams.set('lng', query.location.lng.toString())
    }

    // Add filters if available
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

    // Navigate to search results page
    if (typeof window !== 'undefined') {
      window.location.href = `/search?${searchParams.toString()}`
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        onSearch={handleSearch}
        popularSearches={[
          'Apartamento Tegucigalpa',
          'Casa Colonia Palmira',
          'Con estacionamiento', 
          '2 habitaciones'
        ]}
      />

      {/* Value Proposition Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <ValueProposition />
      </Suspense>

      {/* How It Works Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorks />
      </Suspense>

      {/* Featured Properties Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProperties
          onPropertyContact={(propertyId) => {
            console.log('Contact property:', propertyId)
            // Track analytics event
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'property_contact', {
                property_id: propertyId,
                contact_method: 'whatsapp'
              })
            }
          }}
          onPropertyFavorite={(propertyId, isFavorited) => {
            console.log('Favorite property:', propertyId, isFavorited)
            // Track analytics event
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'property_favorite', {
                property_id: propertyId,
                favorited: isFavorited
              })
            }
          }}
        />
      </Suspense>

      {/* Future sections will be added here:
          - Trust Indicators/Social Proof  
          - Testimonials
          - Footer
      */}
    </main>
  )
}
