'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchFilters, ViewMode, Property, PropertyDiscoveryState, SPANISH_TEXT } from '@/types/property';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { SplitContainer } from './SplitContainer';
import { PropertyCardsPanel } from './PropertyCardsPanel';
import { MapPanel } from './MapPanel';
import { PropertyDetailModal } from './PropertyDetailModal';
import { ViewToggle } from './ViewToggle';
import { FloatingViewToggle } from './FloatingMapButton';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { useFavorites } from '@/hooks/useFavorites';
import { usePropertyModal } from '@/hooks/usePropertyModal';
import { useSplitViewSync } from '@/hooks/useSplitViewSync';
import { useViewToggle } from '@/hooks/useViewToggle';

interface PropertyDiscoveryProps {
  initialFilters?: Partial<SearchFilters>;
  initialViewMode?: ViewMode;
  locale?: 'es' | 'en';
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

/**
 * Main PropertyDiscovery component with split-view architecture
 * Implements the complete property search and discovery experience
 */
export const PropertyDiscovery: React.FC<PropertyDiscoveryProps> = ({
  initialFilters = {},
  initialViewMode = ViewMode.SPLIT,
  locale = 'es',
  onPropertySelect,
  className = ''
}) => {
  // Initialize filters with defaults
  const defaultFilters: SearchFilters = useMemo(() => ({
    location: '',
    priceMin: 0,
    priceMax: 100000,
    bedrooms: [],
    propertyTypes: [],
    amenities: [],
    sortBy: 'relevancia' as const,
    radiusKm: 5,
    limit: 24,
    ...initialFilters
  }), [initialFilters]);

  // Component state
  const [state, setState] = useState<PropertyDiscoveryState>({
    filters: defaultFilters,
    viewMode: initialViewMode,
    splitRatio: { cards: 70, map: 30 },
    hoveredPropertyId: null,
    selectedPropertyId: null,
    modalPropertyId: null,
    loading: false,
    error: null
  });

  // Mobile filter modal state
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Custom hooks
  const { 
    properties, 
    total, 
    hasMore, 
    loading: searchLoading, 
    error: searchError,
    search,
    loadMore,
    refresh
  } = usePropertySearch();

  const { 
    favorites, 
    toggleFavorite, 
    isFavorite 
  } = useFavorites();

  const { 
    isOpen: modalOpen, 
    propertyId: modalPropertyId, 
    property: modalProperty,
    loading: modalLoading,
    openModal, 
    closeModal 
  } = usePropertyModal();

  const { 
    syncCardWithMap, 
    syncMapWithCard,
    hoveredCardId,
    hoveredMarkerId
  } = useSplitViewSync();

  const { 
    currentView, 
    transitionToView,
    isTransitioning 
  } = useViewToggle(state.viewMode);

  // Update state when loading changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      loading: searchLoading,
      error: searchError
    }));
  }, [searchLoading, searchError]);

  // Initial search on mount
  useEffect(() => {
    search(state.filters);
  }, []); // Only run on mount

  // Search when filters change (temporarily disabled for map bounds to prevent constant re-searching with mock data)
  useEffect(() => {
    if (Object.keys(state.filters).length > 0) {
      // Only search if the change was NOT just bounds (to prevent map movement from clearing properties)
      const filtersWithoutBounds = { ...state.filters };
      delete filtersWithoutBounds.bounds;
      
      // Only trigger search if there are meaningful filter changes beyond just bounds
      if (Object.keys(filtersWithoutBounds).some(key => state.filters[key] !== undefined && state.filters[key] !== '' && state.filters[key] !== null)) {
        search(state.filters);
      }
    }
  }, [state.filters, search]);

  // Handle search from SearchBar
  const handleSearch = useCallback(async (location: string) => {
    const newFilters = {
      ...state.filters,
      location,
      cursor: undefined // Reset pagination
    };
    
    setState(prev => ({
      ...prev,
      filters: newFilters
    }));
  }, [state.filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        cursor: undefined // Reset pagination when filters change
      }
    }));
  }, []);

  // Handle view mode changes
  const handleViewChange = useCallback((newView: ViewMode) => {
    setState(prev => ({
      ...prev,
      viewMode: newView
    }));
    transitionToView(newView);
  }, [transitionToView]);

  // Handle property card hover (sync with map)
  const handlePropertyHover = useCallback((propertyId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredPropertyId: propertyId
    }));
    syncCardWithMap(propertyId);
  }, [syncCardWithMap]);

  // Handle map marker hover (sync with cards)
  const handleMapMarkerHover = useCallback((propertyId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredPropertyId: propertyId
    }));
    syncMapWithCard(propertyId);
  }, [syncMapWithCard]);

  // Handle property card click (open modal)
  const handlePropertyClick = useCallback((property: Property) => {
    setState(prev => ({
      ...prev,
      selectedPropertyId: property.id,
      modalPropertyId: property.id
    }));
    openModal(property.id);
    
    // Track property view
    // TODO: Implement analytics tracking
    
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  }, [openModal, onPropertySelect]);

  // Handle map bounds change
  const handleMapBoundsChange = useCallback((bounds: any) => {
    // Update filters with new bounds for map-based search
    const newFilters = {
      ...state.filters,
      bounds,
      cursor: undefined
    };
    
    setState(prev => ({
      ...prev,
      filters: newFilters
    }));
  }, [state.filters]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (propertyId: string) => {
    try {
      await toggleFavorite(propertyId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // TODO: Show error toast
    }
  }, [toggleFavorite]);

  // Handle infinite scroll
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !searchLoading) {
      await loadMore();
    }
  }, [hasMore, searchLoading, loadMore]);

  // Handle sort change from dropdown
  const handleSortChange = useCallback((newSortBy: string) => {
    const newFilters = {
      ...state.filters,
      sortBy: newSortBy as any,
      cursor: undefined // Reset pagination
    };

    setState(prev => ({
      ...prev,
      filters: newFilters
    }));
  }, [state.filters]);

  // Render different view modes
  const renderContent = () => {
    switch (currentView) {
      case ViewMode.SPLIT:
        return (
          <SplitContainer
            ratio={state.splitRatio}
            className="h-[calc(100vh-194px)] md:h-[calc(100vh-128px)]"
          >
            <PropertyCardsPanel
              properties={properties}
              loading={state.loading}
              favorites={favorites}
              hoveredPropertyId={state.hoveredPropertyId}
              onPropertyClick={handlePropertyClick}
              onPropertyHover={handlePropertyHover}
              onFavoriteToggle={handleFavoriteToggle}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              locale={locale}
              className="h-full overflow-hidden"
              totalResults={total}
              currentLocation={state.filters.location}
              sortBy={state.filters.sortBy}
              onSortChange={handleSortChange}
            />
            <MapPanel
              properties={properties}
              hoveredPropertyId={state.hoveredPropertyId}
              onMarkerClick={handlePropertyClick}
              onMarkerHover={handleMapMarkerHover}
              onBoundsChange={handleMapBoundsChange}
              className="h-full"
            />
          </SplitContainer>
        );
      
      case ViewMode.LIST:
        return (
          <div className="h-[calc(100vh-194px)] md:h-[calc(100vh-128px)] overflow-hidden">
            <PropertyCardsPanel
              properties={properties}
              loading={state.loading}
              favorites={favorites}
              hoveredPropertyId={state.hoveredPropertyId}
              onPropertyClick={handlePropertyClick}
              onPropertyHover={handlePropertyHover}
              onFavoriteToggle={handleFavoriteToggle}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              locale={locale}
              viewMode="list"
              className="h-full"
              totalResults={total}
              currentLocation={state.filters.location}
              sortBy={state.filters.sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        );
      
      case ViewMode.MAP:
        return (
          <div className="h-[calc(100vh-194px)] md:h-[calc(100vh-128px)]">
            <MapPanel
              properties={properties}
              hoveredPropertyId={state.hoveredPropertyId}
              onMarkerClick={handlePropertyClick}
              onMarkerHover={handleMapMarkerHover}
              onBoundsChange={handleMapBoundsChange}
              fullscreen={true}
              className="h-full"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`property-discovery ${className}`}>
      {/* Mobile Header (320px-767px) */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Notification Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <span className="text-lg">🔔</span>
          </button>

          {/* Brand */}
          <a
            href="/"
            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            aria-label="Ir a la página principal"
          >
            HEUREKKA
          </a>

          {/* Hamburger Menu */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <span className="text-lg">☰</span>
          </button>
        </div>
      </div>

      {/* Location Bar (Mobile only) */}
      <div className="md:hidden bg-gray-50 border-b border-gray-200 sticky top-14 z-30">
        <div className="text-center py-3 px-4">
          <span className="text-gray-700 font-medium">Tegucigalpa, HN</span>
        </div>
      </div>

      {/* Desktop Header (768px+) */}
      <div className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="relative w-full flex items-center justify-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo/Brand - Absolute Left */}
          <div className="absolute left-4 sm:left-6 lg:left-8">
            <Link
              href="/"
              aria-label="Ir a la página principal"
              className="flex items-center space-x-2 transition-all duration-300 hover:scale-110 transform-gpu"
            >
              <LogoIcon />
            </Link>
          </div>

          {/* Search Bar - Centered */}
          <div className="max-w-2xl w-full mx-auto px-16">
            <SearchBar
              onSearch={handleSearch}
              initialLocation={state.filters.location}
              placeholder={SPANISH_TEXT.search.placeholder}
              locale={locale}
            />
          </div>

          {/* Authentication Buttons - Absolute Right */}
          <div className="absolute right-4 sm:right-6 lg:right-8 flex items-center gap-3">
            <Link href="/iniciar-sesion">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
            <Link href="/registrarse">
              <Button
                size="sm"
                className="text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }}
              >
                <span>Registrarse</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[106px] md:top-16 z-30">
        {/* Mobile Layout - Simple */}
        <div className="md:hidden px-4">
          <FilterBar
            filters={state.filters}
            onFiltersChange={handleFiltersChange}
            locale={locale}
            className="py-4"
            onMobileModalStateChange={setIsMobileModalOpen}
          />
        </div>

        {/* Desktop Layout - With ViewToggle */}
        <div className="hidden md:flex w-full items-center justify-between">
          {/* Filters Section */}
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 flex-1">
            <FilterBar
              filters={state.filters}
              onFiltersChange={handleFiltersChange}
              locale={locale}
              className="py-4"
              onMobileModalStateChange={setIsMobileModalOpen}
            />
          </div>

          {/* View Toggle Section - Right Aligned */}
          <div className="flex items-center px-4 sm:px-6 lg:px-8">
            <ViewToggle
              currentView={currentView}
              onViewChange={handleViewChange}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {renderContent()}
        
        {/* Loading Overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                {locale === 'es' ? 'Cambiando vista...' : 'Changing view...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        isOpen={modalOpen}
        property={modalProperty}
        loading={modalLoading}
        onClose={closeModal}
        locale={locale}
      />

      {/* Floating View Toggle (Mobile only) - Hidden when mobile modal is open */}
      {!isMobileModalOpen && (
        <FloatingViewToggle
          currentView={currentView}
          onToggle={handleViewChange}
        />
      )}

      {/* Error State */}
      {state.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{state.error}</span>
            <button 
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDiscovery;