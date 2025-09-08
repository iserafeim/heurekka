import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: 'apartment' | 'house' | 'condo' | 'studio' | 'room';
  location?: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
  features?: string[];
  areaSqmMin?: number;
  areaSqmMax?: number;
}

export interface SearchState {
  query: string;
  filters: PropertyFilters;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'area_asc' | 'area_desc';
  page: number;
  limit: number;
}

interface PropertyStore {
  // Search state
  searchState: SearchState;
  recentSearches: string[];
  savedSearches: Array<{
    id: string;
    name: string;
    searchState: SearchState;
    createdAt: string;
  }>;

  // Favorites
  favoriteIds: string[];

  // UI state
  viewMode: 'list' | 'grid' | 'map';
  mapViewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  };

  // Actions - Search
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  clearFilters: () => void;
  setLocation: (location: { lat: number; lng: number; address: string }) => void;
  setSortBy: (sortBy: SearchState['sortBy']) => void;
  setPage: (page: number) => void;
  resetSearch: () => void;

  // Actions - History & Saves
  addToRecentSearches: (query: string) => void;
  saveCurrentSearch: (name: string) => void;
  removeSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => void;

  // Actions - Favorites
  addToFavorites: (propertyId: string) => void;
  removeFromFavorites: (propertyId: string) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;

  // Actions - UI
  setViewMode: (mode: 'list' | 'grid' | 'map') => void;
  setMapViewport: (viewport: Partial<PropertyStore['mapViewport']>) => void;
}

const defaultSearchState: SearchState = {
  query: '',
  filters: {},
  sortBy: 'newest',
  page: 1,
  limit: 20,
};

const defaultMapViewport = {
  latitude: 14.0723, // Tegucigalpa, Honduras
  longitude: -87.1921,
  zoom: 10,
};

export const usePropertyStore = create<PropertyStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        searchState: defaultSearchState,
        recentSearches: [],
        savedSearches: [],
        favoriteIds: [],
        viewMode: 'grid',
        mapViewport: defaultMapViewport,

        // Search actions
        setQuery: (query) =>
          set(
            (state) => ({
              searchState: { ...state.searchState, query, page: 1 },
            }),
            false,
            'property/setQuery'
          ),

        setFilters: (filters) =>
          set(
            (state) => ({
              searchState: {
                ...state.searchState,
                filters: { ...state.searchState.filters, ...filters },
                page: 1,
              },
            }),
            false,
            'property/setFilters'
          ),

        clearFilters: () =>
          set(
            (state) => ({
              searchState: {
                ...state.searchState,
                filters: {},
                page: 1,
              },
            }),
            false,
            'property/clearFilters'
          ),

        setLocation: (location) =>
          set(
            (state) => ({
              searchState: {
                ...state.searchState,
                location,
                page: 1,
              },
              mapViewport: {
                ...state.mapViewport,
                latitude: location.lat,
                longitude: location.lng,
              },
            }),
            false,
            'property/setLocation'
          ),

        setSortBy: (sortBy) =>
          set(
            (state) => ({
              searchState: { ...state.searchState, sortBy, page: 1 },
            }),
            false,
            'property/setSortBy'
          ),

        setPage: (page) =>
          set(
            (state) => ({
              searchState: { ...state.searchState, page },
            }),
            false,
            'property/setPage'
          ),

        resetSearch: () =>
          set(
            {
              searchState: defaultSearchState,
            },
            false,
            'property/resetSearch'
          ),

        // History & Saves actions
        addToRecentSearches: (query) =>
          set(
            (state) => {
              if (!query.trim()) return state;
              
              const recentSearches = [
                query,
                ...state.recentSearches.filter((s) => s !== query),
              ].slice(0, 10); // Keep only last 10 searches

              return { recentSearches };
            },
            false,
            'property/addToRecentSearches'
          ),

        saveCurrentSearch: (name) =>
          set(
            (state) => {
              const newSearch = {
                id: `search-${Date.now()}`,
                name,
                searchState: state.searchState,
                createdAt: new Date().toISOString(),
              };

              return {
                savedSearches: [newSearch, ...state.savedSearches],
              };
            },
            false,
            'property/saveCurrentSearch'
          ),

        removeSavedSearch: (id) =>
          set(
            (state) => ({
              savedSearches: state.savedSearches.filter((s) => s.id !== id),
            }),
            false,
            'property/removeSavedSearch'
          ),

        loadSavedSearch: (id) =>
          set(
            (state) => {
              const savedSearch = state.savedSearches.find((s) => s.id === id);
              if (!savedSearch) return state;

              return {
                searchState: savedSearch.searchState,
              };
            },
            false,
            'property/loadSavedSearch'
          ),

        // Favorites actions
        addToFavorites: (propertyId) =>
          set(
            (state) => {
              if (state.favoriteIds.includes(propertyId)) return state;
              return {
                favoriteIds: [...state.favoriteIds, propertyId],
              };
            },
            false,
            'property/addToFavorites'
          ),

        removeFromFavorites: (propertyId) =>
          set(
            (state) => ({
              favoriteIds: state.favoriteIds.filter((id) => id !== propertyId),
            }),
            false,
            'property/removeFromFavorites'
          ),

        toggleFavorite: (propertyId) =>
          set(
            (state) => {
              const isFavorite = state.favoriteIds.includes(propertyId);
              return {
                favoriteIds: isFavorite
                  ? state.favoriteIds.filter((id) => id !== propertyId)
                  : [...state.favoriteIds, propertyId],
              };
            },
            false,
            'property/toggleFavorite'
          ),

        isFavorite: (propertyId) => {
          return get().favoriteIds.includes(propertyId);
        },

        // UI actions
        setViewMode: (viewMode) =>
          set({ viewMode }, false, 'property/setViewMode'),

        setMapViewport: (viewport) =>
          set(
            (state) => ({
              mapViewport: { ...state.mapViewport, ...viewport },
            }),
            false,
            'property/setMapViewport'
          ),
      }),
      {
        name: 'heurekka-property-store',
        // Persist all state except sensitive data
        partialize: (state) => ({
          recentSearches: state.recentSearches,
          savedSearches: state.savedSearches,
          favoriteIds: state.favoriteIds,
          viewMode: state.viewMode,
          mapViewport: state.mapViewport,
          searchState: {
            ...state.searchState,
            // Don't persist the current search query
            query: '',
          },
        }),
      }
    ),
    {
      name: 'property-store',
    }
  )
);