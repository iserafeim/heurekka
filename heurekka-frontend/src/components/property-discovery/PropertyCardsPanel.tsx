'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Property, SPANISH_TEXT } from '@/types/property';
import { PropertyCard } from '@/components/ui/property-card';
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
  totalResults?: number;
  currentLocation?: string;
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
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
  className = '',
  totalResults = 0,
  currentLocation = '',
  sortBy = 'relevancia',
  onSortChange
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

  // Get grid columns based on container width and design specifications
  const getGridClasses = () => {
    if (viewMode === 'list') {
      // Full List View: 4 columns on desktop (1024px+), 2 columns on tablet, 1 column on mobile
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6';
    }
    // Split View: Mobile: Single column full-width, Tablet: 2 columns, Desktop: 3 columns with 20px gap
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5';
  };

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: string) => {
    if (onSortChange) {
      onSortChange(newSortBy);
    }
  }, [onSortChange]);

  // Results Header Component
  const ResultsHeader = () => (
    <div className="pb-6">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between">
        <span className="text-sm text-gray-700">All rentals</span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-no-repeat bg-right pr-6"
            style={{
              backgroundImage: `url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>')`,
              backgroundSize: '16px 16px',
              backgroundPosition: 'right 4px center',
            }}
          >
            <option value="relevancia">Relevancia</option>
            <option value="recientes">Recientes</option>
            <option value="precio_asc">Precio ↑</option>
            <option value="precio_desc">Precio ↓</option>
            <option value="area_asc">Área ↑</option>
            <option value="area_desc">Área ↓</option>
          </select>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        {/* Title - Left side */}
        <div>
          {/* Dynamic Title */}
          <h1 className="text-lg font-semibold text-gray-900">
            {currentLocation ?
              `${currentLocation} propiedades en alquiler` :
              'Propiedades en alquiler'
            }
          </h1>
        </div>

        {/* Results count and Sort dropdown - Right side */}
        <div className="flex items-center gap-4">
          {/* Results count */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalResults}</span>{' '}
            {totalResults === 1 ? 'propiedad' : 'propiedades'}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border-none bg-transparent focus:outline-none cursor-pointer text-gray-900 font-medium pr-4 appearance-none"
              style={{
                backgroundImage: `url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>')`,
                backgroundSize: '16px 16px',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <option value="relevancia">Más relevantes</option>
              <option value="recientes">Más recientes</option>
              <option value="precio_asc">Precio ↑</option>
              <option value="precio_desc">Precio ↓</option>
              <option value="area_asc">Área ↑</option>
              <option value="area_desc">Área ↓</option>
            </select>
          </div>
          </div>
        </div>
      </div>
    </div>
  );

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
  const LoadingSkeleton = () => {
    // For full list view, show 12 skeleton cards (4x3 grid)
    // For split view, show 6 skeleton cards
    const skeletonCount = viewMode === 'list' ? 12 : 6;

    return (
      <div className={getGridClasses()}>
        {[...Array(skeletonCount)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
            <div className={`${viewMode === 'list' ? 'h-48' : 'h-48'} bg-gray-200`}></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              {/* Contact button skeleton */}
              <div className="h-8 bg-gray-200 rounded mt-3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`property-cards-panel flex flex-col h-full font-sans ${className}`}>
      {/* Scrollable Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto property-cards-split-view"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #F7FAFC'
        }}
      >
        <div className={`p-6 ${hoveredPropertyId ? 'bg-transparent' : ''}`}>
          {/* Results Header - Now inside scrollable content */}
          <ResultsHeader />
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
                  className="transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                />
              ))}
            </div>
          )}
          
          {/* Infinite scroll trigger */}
          {/*
            Infinite scroll optimized for:
            - Full List View: Initial load 12 properties (4×3 grid), load more in batches of 4 (one new row)
            - Split View: Initial load 6 properties (3 full + 3 partial), load more in batches of 3
          */}
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