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

  // Render different view modes
  const renderContent = () => {
    switch (currentView) {
      case ViewMode.SPLIT:
        return (
          <SplitContainer 
            ratio={state.splitRatio}
            className="h-[calc(100vh-128px)]"
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
          <div className="h-[calc(100vh-128px)] overflow-hidden">
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
            />
          </div>
        );
      
      case ViewMode.MAP:
        return (
          <div className="h-[calc(100vh-128px)]">
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
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Heurekka
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar
                onSearch={handleSearch}
                initialLocation={state.filters.location}
                placeholder={SPANISH_TEXT.search.placeholder}
                locale={locale}
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex-shrink-0">
              <ViewToggle
                currentView={currentView}
                onViewChange={handleViewChange}
                isTransitioning={isTransitioning}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FilterBar
            filters={state.filters}
            onFiltersChange={handleFiltersChange}
            resultCount={total}
            loading={state.loading}
            locale={locale}
            className="py-4"
          />
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