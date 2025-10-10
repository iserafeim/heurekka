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
import { MobileLocationSearchModal } from './MobileLocationSearchModal';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { TenantAuthFlow } from '@/components/auth/TenantAuthFlow';
import { useAuthStore } from '@/lib/stores/auth';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { useFavorites } from '@/hooks/useFavorites';
import { usePropertyModal } from '@/hooks/usePropertyModal';
import { useSplitViewSync } from '@/hooks/useSplitViewSync';
import { parseSmartSearch } from '@/utils/smartSearch';
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

  // Mobile location search modal state
  const [isMobileLocationModalOpen, setIsMobileLocationModalOpen] = useState(false);

  // Mobile menu dropdown state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Auth state
  const { isAuthenticated, user, signOut } = useAuthStore();

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
    console.log('🎯 PropertyDiscovery - Initial search on mount, filters:', state.filters);
    search(state.filters);
  }, []); // Only run on mount

  // Search when filters change (temporarily disabled for map bounds to prevent constant re-searching with mock data)
  useEffect(() => {
    console.log('🔍 Search effect triggered, filters:', state.filters);
    if (Object.keys(state.filters).length > 0) {
      // Only search if the change was NOT just bounds (to prevent map movement from clearing properties)
      const filtersWithoutBounds = { ...state.filters };
      delete filtersWithoutBounds.bounds;

      // Only trigger search if there are meaningful filter changes beyond just bounds
      const hasSignificantFilters = Object.keys(filtersWithoutBounds).some(key => {
        const value = (state.filters as any)[key];
        const defaultValue = (defaultFilters as any)[key];

        let isSignificant = false;

        if (Array.isArray(value)) {
          // For arrays, significant if not empty
          isSignificant = value.length > 0;
        } else if (typeof value === 'string') {
          // For strings, significant if not empty and not default
          isSignificant = value !== '' && value !== defaultValue;
        } else if (typeof value === 'number') {
          // For numbers, significant if different from default
          isSignificant = value !== defaultValue;
        } else {
          // For other types, significant if not undefined/null and not default
          isSignificant = value !== undefined && value !== null && value !== defaultValue;
        }

        console.log(`🔍 Filter ${key}:`, value, 'default:', defaultValue, 'significant:', isSignificant);
        return isSignificant;
      });

      console.log('🔍 Has significant filters:', hasSignificantFilters, 'Will search:', hasSignificantFilters);
      if (hasSignificantFilters) {
        search(state.filters);
      } else {
        // If no significant filters, search with empty/default filters to show all properties
        console.log('🔍 No significant filters, searching with defaults to show all properties');
        search(state.filters);
      }
    }
  }, [state.filters, search]);

  // Handle search from SearchBar with intelligent parsing
  // Examples of smart search queries:
  // - "apartamentos de 2 habitaciones" → filters: propertyTypes: ['apartamento'], bedrooms: [2]
  // - "casa con 3 cuartos en Tegucigalpa" → filters: propertyTypes: ['casa'], bedrooms: [3], location: 'Tegucigalpa'
  // - "studio bajo 15000 lempiras" → filters: propertyTypes: ['studio'], priceMax: 15000
  // - "apartamento amueblado con estacionamiento" → filters: propertyTypes: ['apartamento'], features: ['furnished', 'parking']
  const handleSearch = useCallback(async (searchQuery: string) => {
    // Parse the search query intelligently
    const parsedSearch = parseSmartSearch(searchQuery);

    // Build new filters based on parsed results
    const newFilters: Partial<SearchFilters> = {
      ...state.filters,
      cursor: undefined // Reset pagination when searching
    };

    // Apply location if found
    if (parsedSearch.location) {
      newFilters.location = parsedSearch.location;
    } else if (searchQuery && !parsedSearch.propertyTypes && !parsedSearch.bedrooms && !parsedSearch.minPrice && !parsedSearch.maxPrice) {
      // If no specific filters found, treat entire query as location
      newFilters.location = searchQuery;
    }

    // Apply property types if found
    if (parsedSearch.propertyTypes && parsedSearch.propertyTypes.length > 0) {
      newFilters.propertyTypes = parsedSearch.propertyTypes;
    }

    // Apply bedroom filters if found
    if (parsedSearch.bedrooms && parsedSearch.bedrooms.length > 0) {
      newFilters.bedrooms = parsedSearch.bedrooms;
    }

    // Apply price range if found
    if (parsedSearch.minPrice !== undefined) {
      newFilters.priceMin = parsedSearch.minPrice;
    }
    if (parsedSearch.maxPrice !== undefined) {
      newFilters.priceMax = parsedSearch.maxPrice;
    }

    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Smart Search Results:', {
        originalQuery: searchQuery,
        parsed: parsedSearch,
        appliedFilters: newFilters
      });
    }

    setState(prev => ({
      ...prev,
      filters: newFilters as SearchFilters
    }));
  }, [state.filters]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<SearchFilters>) => {
    console.log('🔍 Filter change:', newFilters);
    setState(prev => {
      const updatedFilters = {
        ...prev.filters,
        ...newFilters,
        cursor: undefined // Reset pagination when filters change
      };
      console.log('🔍 Updated filters:', updatedFilters);
      return {
        ...prev,
        filters: updatedFilters
      };
    });
  }, []);

  // Handle view mode changes
  const handleViewChange = useCallback((newView: ViewMode, isManualChange: boolean = true) => {
    // Prevent automatic view changes to map on mobile when scrolling
    // Only allow manual changes via button clicks
    const isMobile = window.innerWidth < 768;
    if (isMobile && newView === ViewMode.MAP && !isManualChange) {
      console.log('🚫 Automatic map view change prevented on mobile');
      return;
    }

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
    console.log('🌍 Map bounds changed, triggering search with new bounds:', bounds);
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

  // Handle mobile location modal
  const handleMobileLocationClick = useCallback(() => {
    setIsMobileLocationModalOpen(true);
  }, []);

  const handleMobileLocationClose = useCallback(() => {
    setIsMobileLocationModalOpen(false);
  }, []);

  const handleMobileLocationSelect = useCallback((location: string, coordinates?: { lat: number; lng: number }) => {
    handleSearch(location);
    setIsMobileLocationModalOpen(false);
  }, [handleSearch]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

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
              loading={searchLoading}
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
              loading={searchLoading}
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
    <div className={`property-discovery font-sans ${className}`}>
      {/* Mobile Header (320px-767px) */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo - Left */}
          <Link
            href="/"
            aria-label="Ir a la página principal"
            className="flex items-center transition-all duration-300 hover:scale-110 transform-gpu"
          >
            <LogoIcon />
          </Link>

          {/* Hamburger Menu */}
          <button
            onClick={handleMobileMenuToggle}
            aria-label={isMobileMenuOpen ? 'Cerrar Menú' : 'Abrir Menú'}
            className="relative z-20 block cursor-pointer p-2.5 transition-all duration-300 hover:scale-110 hover:bg-gray-100 rounded-full"
            data-state={isMobileMenuOpen ? 'active' : ''}
          >
            <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
            <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50"
             data-state="active">
          <div className="flex flex-col h-full">
            {/* Header with logo and close button */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
              <Link
                href="/"
                aria-label="Ir a la página principal"
                className="flex items-center transition-all duration-300 hover:scale-110 transform-gpu"
              >
                <LogoIcon />
              </Link>
              <button
                onClick={handleMobileMenuClose}
                aria-label="Cerrar Menú"
                className="relative z-20 block cursor-pointer p-2.5 transition-all duration-300 hover:scale-110 hover:bg-gray-100 rounded-full"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Menu content */}
            <div className="flex-1 p-6 space-y-6">
            {/* Navigation Links */}
            <ul className="space-y-4">
              <li>
                <Link
                  href="/publicar"
                  className="text-gray-700 hover:text-gray-900 block text-lg font-medium py-2"
                  onClick={handleMobileMenuClose}
                >
                  <span>Publicar</span>
                </Link>
              </li>
            </ul>

            {/* Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-700 font-medium">
                    {user?.email}
                  </div>
                  <Link href="/tenant/dashboard" onClick={handleMobileMenuClose} className="block">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full justify-start text-base">
                      <User className="h-4 w-4 mr-2" />
                      Mi Perfil
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      handleMobileMenuClose();
                    }}
                    variant="ghost"
                    size="lg"
                    className="w-full justify-start text-base text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => {
                    setShowLoginModal(true);
                    handleMobileMenuClose();
                  }}
                  className="w-full text-base font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: '#000000',
                    color: 'white',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000'
                  }}
                >
                  <span>Iniciar Sesión</span>
                </Button>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Bar (Mobile only) */}
      <div className="md:hidden bg-white sticky top-[3.5rem] z-40">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <button
            onClick={handleMobileLocationClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Buscar ubicación"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{state.filters.location || 'Tegucigalpa, HN'}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
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
              placeholder="Ej: apartamentos de 2 habitaciones, casa en Tegucigalpa..."
              locale={locale}
            />
          </div>

          {/* Authentication Section - Absolute Right */}
          <div className="absolute right-4 sm:right-6 lg:right-8 flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link href="/tenant/dashboard" onClick={() => setShowUserMenu(false)}>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Mi Perfil
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="text-sm font-medium transition-colors duration-200"
                style={{
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000'
                }}
              >
                <span>Iniciar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[121px] md:top-16 z-30">
        {/* Mobile Layout - Simple */}
        <div className="md:hidden px-4">
          <FilterBar
            filters={state.filters}
            onFiltersChange={handleFiltersChange}
            locale={locale}
            className="py-3"
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

      {/* Mobile Location Search Modal */}
      <MobileLocationSearchModal
        isOpen={isMobileLocationModalOpen}
        onClose={handleMobileLocationClose}
        onLocationSelect={handleMobileLocationSelect}
        currentLocation={state.filters.location}
        locale={locale}
      />

      {/* Floating View Toggle (Mobile only) - Hidden when mobile modal is open */}
      {!isMobileModalOpen && !isMobileLocationModalOpen && (
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

      {/* Login Modal */}
      <TenantAuthFlow
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          console.log('Login successful from property discovery');
        }}
      />
    </div>
  );
};

export default PropertyDiscovery;