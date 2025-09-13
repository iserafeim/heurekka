'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Property, SPANISH_TEXT } from '@/types/property';
import { PropertyCard } from './PropertyCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface PropertyCardsPanelProps {
  properties: Property[];
  loading: boolean;
  favorites: Set<string>;
  hoveredPropertyId?: string | null;
  onPropertyClick: (property: Property) => void;
  onPropertyHover: (propertyId: string | null) => void;
  onFavoriteToggle: (propertyId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  locale?: 'es' | 'en';
  viewMode?: 'grid' | 'list';
  className?: string;
}

/**
 * PropertyCardsPanel component for displaying property listings
 * Supports infinite scroll and grid/list view modes
 */
export const PropertyCardsPanel: React.FC<PropertyCardsPanelProps> = ({
  properties,
  loading,
  favorites,
  hoveredPropertyId,
  onPropertyClick,
  onPropertyHover,
  onFavoriteToggle,
  onLoadMore,
  hasMore,
  locale = 'es',
  viewMode = 'grid',
  className = ''
}) => {
  const [isNearBottom, setIsNearBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll
  const { isIntersecting } = useIntersectionObserver(loadMoreRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Trigger load more when intersection is detected
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  // Handle scroll for near-bottom detection (alternative infinite scroll)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 200; // 200px threshold
    
    setIsNearBottom(nearBottom);
    
    if (nearBottom && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  // Throttled scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledScrollHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', throttledScrollHandler);
    return () => {
      container.removeEventListener('scroll', throttledScrollHandler);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Handle property card hover
  const handlePropertyHover = useCallback((propertyId: string | null) => {
    onPropertyHover(propertyId);
  }, [onPropertyHover]);

  // Handle property card click
  const handlePropertyClick = useCallback((property: Property) => {
    onPropertyClick(property);
  }, [onPropertyClick]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((propertyId: string) => {
    onFavoriteToggle(propertyId);
  }, [onFavoriteToggle]);

  // Get grid columns based on container width
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'grid grid-cols-1 gap-4';
    }
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {SPANISH_TEXT.search.noResults}
      </h3>
      <p className="text-gray-500 max-w-md">
        No se encontraron propiedades que coincidan con tus criterios de búsqueda. 
        Intenta ajustar los filtros o buscar en una ubicación diferente.
      </p>
    </div>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={getGridClasses()}>
      {[...Array(viewMode === 'list' ? 3 : 8)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`property-cards-panel ${className}`}>
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{ 
          scrollBehavior: 'smooth',
          // Custom scrollbar styling
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC'
        }}
      >
        <div className="p-6">
          {/* Loading state for initial load */}
          {loading && properties.length === 0 && <LoadingSkeleton />}
          
          {/* Empty state */}
          {!loading && properties.length === 0 && <EmptyState />}
          
          {/* Properties grid */}
          {properties.length > 0 && (
            <div className={getGridClasses()}>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={favorites.has(property.id)}
                  isHovered={hoveredPropertyId === property.id}
                  onFavorite={handleFavoriteToggle}
                  onHover={handlePropertyHover}
                  onClick={handlePropertyClick}
                  viewMode={viewMode}
                  locale={locale}
                  className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                />
              ))}
            </div>
          )}
          
          {/* Infinite scroll trigger */}
          {properties.length > 0 && hasMore && (
            <div 
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
            >
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm">
                    {locale === 'es' ? 'Cargando más propiedades...' : 'Loading more properties...'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onLoadMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {locale === 'es' ? 'Cargar más propiedades' : 'Load more properties'}
                </button>
              )}
            </div>
          )}
          
          {/* End of results indicator */}
          {properties.length > 0 && !hasMore && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="text-sm">
                  {locale === 'es' 
                    ? 'Has visto todas las propiedades disponibles'
                    : 'You\'ve seen all available properties'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCardsPanel;