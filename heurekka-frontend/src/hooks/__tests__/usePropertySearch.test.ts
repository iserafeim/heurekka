import { renderHook, act, waitFor } from '@testing-library/react';
import { usePropertySearch } from '../usePropertySearch';
import { SearchFilters, Property, PropertyType, SortOption } from '@/types/property';

// Mock tRPC
const mockFetch = jest.fn();
const mockUtils = {
  property: {
    search: {
      fetch: mockFetch
    }
  }
};

jest.mock('@/lib/trpc/react', () => ({
  trpc: {
    useUtils: () => mockUtils
  }
}));

// Mock data
const mockProperty: Property = {
  id: '1',
  address: 'Calle Principal 123',
  neighborhood: 'Centro',
  city: 'Tegucigalpa',
  price: 15000,
  bedrooms: 2,
  bathrooms: 1,
  area: 80,
  propertyType: PropertyType.APARTMENT,
  images: ['image1.jpg', 'image2.jpg'],
  description: 'Hermoso apartamento en el centro',
  amenities: ['Parking', 'Security'],
  coordinates: { lat: 14.0723, lng: -87.1921 },
  landlord: {
    id: 'landlord1',
    name: 'Juan Pérez'
  },
  listing: {
    listedDate: '2025-01-01',
    status: 'active' as const,
    daysOnMarket: 30
  },
  stats: {
    views: 100,
    favorites: 10,
    inquiries: 5
  }
};

const mockSearchResponse = {
  properties: [mockProperty],
  total: 1,
  hasMore: false,
  nextCursor: undefined
};

const mockFilters: SearchFilters = {
  location: 'Tegucigalpa',
  priceMin: 10000,
  priceMax: 20000,
  bedrooms: [2],
  propertyTypes: [PropertyType.APARTMENT],
  amenities: [],
  sortBy: SortOption.RELEVANCE,
  radiusKm: 5,
  limit: 24
};

describe('usePropertySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(mockSearchResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => usePropertySearch());

      expect(result.current.properties).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.search).toBe('function');
      expect(typeof result.current.loadMore).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('Search Functionality', () => {
    it('should perform search successfully', async () => {
      const { result } = renderHook(() => usePropertySearch());

      act(() => {
        result.current.search(mockFilters);
      });

      // Check loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check results
      expect(mockFetch).toHaveBeenCalledWith({
        ...mockFilters,
        cursor: undefined
      });
      expect(result.current.properties).toEqual([mockProperty]);
      expect(result.current.total).toBe(1);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle search errors', async () => {
      const { result } = renderHook(() => usePropertySearch());
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValue(mockError);

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Error al buscar propiedades. Por favor, intenta de nuevo.');
      expect(result.current.properties).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
    });

    it('should reset cursor on new search', async () => {
      const { result } = renderHook(() => usePropertySearch());

      const filtersWithCursor = { ...mockFilters, cursor: 'existing-cursor' };

      act(() => {
        result.current.search(filtersWithCursor);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith({
        ...filtersWithCursor,
        cursor: undefined // Should be reset
      });
    });
  });

  describe('Load More Functionality', () => {
    it('should load more properties when available', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // First search with hasMore = true
      const initialResponse = {
        ...mockSearchResponse,
        hasMore: true,
        nextCursor: 'cursor-1'
      };
      mockFetch.mockResolvedValueOnce(initialResponse);

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);

      // Load more
      const moreProperties = [{...mockProperty, id: '2'}];
      const loadMoreResponse = {
        properties: moreProperties,
        total: 2,
        hasMore: false,
        nextCursor: undefined
      };
      mockFetch.mockResolvedValueOnce(loadMoreResponse);

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenLastCalledWith({
        ...mockFilters,
        cursor: 'cursor-1'
      });
      expect(result.current.properties).toHaveLength(2);
      expect(result.current.hasMore).toBe(false);
    });

    it('should not load more when no more available', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // Search with hasMore = false
      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = mockFetch.mock.calls.length;

      act(() => {
        result.current.loadMore();
      });

      // Should not make additional calls
      expect(mockFetch).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should not load more when already loading', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // Start initial search
      act(() => {
        result.current.search(mockFilters);
      });

      // Try to load more while loading
      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have been called once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle load more errors', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // Initial successful search
      const initialResponse = {
        ...mockSearchResponse,
        hasMore: true,
        nextCursor: 'cursor-1'
      };
      mockFetch.mockResolvedValueOnce(initialResponse);

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load more with error
      mockFetch.mockRejectedValueOnce(new Error('Load more error'));

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar más propiedades. Por favor, intenta de nuevo.');
      expect(result.current.properties).toEqual([mockProperty]); // Should keep existing properties
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh current search', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // Initial search
      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockFetch.mockClear();

      // Refresh
      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith({
        ...mockFilters,
        cursor: undefined
      });
    });

    it('should not refresh if no current filters', async () => {
      const { result } = renderHook(() => usePropertySearch());

      act(() => {
        result.current.refresh();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response', async () => {
      const { result } = renderHook(() => usePropertySearch());
      mockFetch.mockResolvedValue({
        properties: [],
        total: 0,
        hasMore: false
      });

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.properties).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle null response', async () => {
      const { result } = renderHook(() => usePropertySearch());
      mockFetch.mockResolvedValue(null);

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.properties).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle undefined properties in response', async () => {
      const { result } = renderHook(() => usePropertySearch());
      mockFetch.mockResolvedValue({
        total: 0,
        hasMore: false
      });

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.properties).toEqual([]);
    });
  });

  describe('State Management', () => {
    it('should maintain correct loading states during multiple operations', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // Start search
      act(() => {
        result.current.search(mockFilters);
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start load more
      mockFetch.mockResolvedValueOnce({
        ...mockSearchResponse,
        hasMore: true,
        nextCursor: 'cursor-1'
      });

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        properties: [{...mockProperty, id: '2'}],
        total: 2,
        hasMore: false
      });

      act(() => {
        result.current.loadMore();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should clear error on successful operations', async () => {
      const { result } = renderHook(() => usePropertySearch());

      // First search fails
      mockFetch.mockRejectedValueOnce(new Error('Error'));

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second search succeeds
      mockFetch.mockResolvedValueOnce(mockSearchResponse);

      act(() => {
        result.current.search(mockFilters);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(null);
    });
  });
});