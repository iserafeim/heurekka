import { renderHook, act, waitFor } from '@testing-library/react';
import { usePropertyModal } from '../usePropertyModal';
import { PropertyDetails, PropertyType } from '@/types/property';

// Mock tRPC
const mockFetch = jest.fn();
const mockMutate = jest.fn();
const mockUtils = {
  property: {
    getById: {
      fetch: mockFetch
    },
    trackView: {
      mutate: mockMutate
    }
  }
};

jest.mock('@/lib/trpc/react', () => ({
  trpc: {
    useUtils: () => mockUtils
  }
}));

// Mock console to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock PropertyDetails data
const mockPropertyDetails: PropertyDetails = {
  id: 'prop-1',
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
    name: 'Juan Pérez',
    phone: '+504 9999-9999'
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
  },
  virtualTourUrl: 'https://example.com/tour',
  floorPlans: [{
    id: 'fp1',
    name: 'Main Floor',
    imageUrl: 'floor1.jpg',
    description: 'Main living area'
  }],
  documents: [],
  taxInfo: {
    annualTax: 5000,
    lastAssessment: '2024-01-01',
    taxRate: 0.02
  },
  schools: [{
    id: 'school1',
    name: 'Escuela Central',
    type: 'elementary',
    rating: 4.5,
    distance: 0.5
  }],
  walkScore: 85,
  transitScore: 70,
  crimeRate: {
    safetyScore: 8.5,
    crimeRate: 2.3,
    lastUpdated: '2024-12-01'
  },
  priceHistory: [{
    date: '2025-01-01',
    price: 15000,
    event: 'listed'
  }],
  similarProperties: []
};

describe('usePropertyModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(mockPropertyDetails);
    mockMutate.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => usePropertyModal());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.propertyId).toBe(null);
      expect(result.current.property).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.openModal).toBe('function');
      expect(typeof result.current.closeModal).toBe('function');
    });
  });

  describe('openModal Functionality', () => {
    it('should open modal and load property details successfully', async () => {
      const { result } = renderHook(() => usePropertyModal());

      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.propertyId).toBe('prop-1');
      expect(result.current.property).toEqual(mockPropertyDetails);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);

      expect(mockFetch).toHaveBeenCalledWith({ id: 'prop-1' });
      expect(mockMutate).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        source: 'modal'
      });
    });

    it('should set loading state correctly during fetch', async () => {
      const { result } = renderHook(() => usePropertyModal());

      let resolvePromise: (value: PropertyDetails) => void;
      const promise = new Promise<PropertyDetails>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValue(promise);

      const openModalPromise = act(async () => {
        result.current.openModal('prop-1');
      });

      // Should be loading immediately
      expect(result.current.loading).toBe(true);
      expect(result.current.isOpen).toBe(true);
      expect(result.current.propertyId).toBe('prop-1');

      resolvePromise!(mockPropertyDetails);
      await openModalPromise;

      expect(result.current.loading).toBe(false);
    });

    it('should handle property fetch errors', async () => {
      const { result } = renderHook(() => usePropertyModal());
      const fetchError = new Error('Network error');
      mockFetch.mockRejectedValue(fetchError);

      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.propertyId).toBe('prop-1');
      expect(result.current.property).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Error al cargar los detalles de la propiedad. Por favor, intenta de nuevo.');

      expect(console.error).toHaveBeenCalledWith(
        'Error loading property details:',
        fetchError
      );
    });

    it('should handle null property response', async () => {
      const { result } = renderHook(() => usePropertyModal());
      mockFetch.mockResolvedValue(null);

      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.property).toBe(null);
      expect(result.current.error).toBe('No se pudo cargar la información de la propiedad');
    });

    it('should handle view tracking errors gracefully', async () => {
      const { result } = renderHook(() => usePropertyModal());
      const trackError = new Error('Tracking error');
      mockMutate.mockRejectedValue(trackError);

      await act(async () => {
        await result.current.openModal('prop-1');
      });

      // Modal should still open successfully even if tracking fails
      expect(result.current.isOpen).toBe(true);
      expect(result.current.property).toEqual(mockPropertyDetails);
      expect(result.current.error).toBe(null);

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to track property view:',
        trackError
      );
    });

    it('should reset state when opening modal', async () => {
      const { result } = renderHook(() => usePropertyModal());

      // First open modal and set some error state
      mockFetch.mockRejectedValueOnce(new Error('First error'));
      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.error).toBeTruthy();

      // Open modal again - should reset error state
      mockFetch.mockResolvedValue(mockPropertyDetails);
      await act(async () => {
        await result.current.openModal('prop-2');
      });

      expect(result.current.propertyId).toBe('prop-2');
      expect(result.current.error).toBe(null);
      expect(result.current.property).toEqual(mockPropertyDetails);
    });
  });

  describe('closeModal Functionality', () => {
    it('should close modal and reset all state', async () => {
      const { result } = renderHook(() => usePropertyModal());

      // First open modal
      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.propertyId).toBe('prop-1');
      expect(result.current.property).toEqual(mockPropertyDetails);

      // Then close modal
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.propertyId).toBe(null);
      expect(result.current.property).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should reset error state when closing modal', async () => {
      const { result } = renderHook(() => usePropertyModal());

      // Open modal with error
      mockFetch.mockRejectedValue(new Error('Test error'));
      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.error).toBeTruthy();

      // Close modal
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Multiple Operations', () => {
    it('should handle opening different properties', async () => {
      const { result } = renderHook(() => usePropertyModal());

      const mockProperty2 = { ...mockPropertyDetails, id: 'prop-2', address: 'Different Address' };

      // Open first property
      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.propertyId).toBe('prop-1');
      expect(result.current.property?.address).toBe('Calle Principal 123');

      // Open second property
      mockFetch.mockResolvedValueOnce(mockProperty2);
      await act(async () => {
        await result.current.openModal('prop-2');
      });

      expect(result.current.propertyId).toBe('prop-2');
      expect(result.current.property?.address).toBe('Different Address');
      expect(mockFetch).toHaveBeenLastCalledWith({ id: 'prop-2' });
    });

    it('should handle rapid open/close operations', async () => {
      const { result } = renderHook(() => usePropertyModal());

      // Start opening modal
      let resolvePromise: (value: PropertyDetails) => void;
      const promise = new Promise<PropertyDetails>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValue(promise);

      const openPromise = act(async () => {
        result.current.openModal('prop-1');
      });

      // Immediately close modal before fetch completes
      act(() => {
        result.current.closeModal();
      });

      // Complete the fetch
      resolvePromise!(mockPropertyDetails);
      await openPromise;

      // Modal should be closed
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Property Data Management', () => {
    it('should clear property data when opening new modal', async () => {
      const { result } = renderHook(() => usePropertyModal());

      // Open first property
      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.property).toEqual(mockPropertyDetails);

      // Open second property - should clear previous data immediately
      const mockProperty2 = { ...mockPropertyDetails, id: 'prop-2' };
      mockFetch.mockResolvedValueOnce(mockProperty2);

      act(() => {
        result.current.openModal('prop-2');
      });

      // Property should be cleared immediately
      expect(result.current.property).toBe(null);
      expect(result.current.propertyId).toBe('prop-2');

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.property).toEqual(mockProperty2);
    });

    it('should handle property type casting', async () => {
      const { result } = renderHook(() => usePropertyModal());

      await act(async () => {
        await result.current.openModal('prop-1');
      });

      expect(result.current.property).toEqual(mockPropertyDetails);
      expect(result.current.property?.virtualTourUrl).toBeDefined();
      expect(result.current.property?.floorPlans).toBeDefined();
      expect(result.current.property?.taxInfo).toBeDefined();
    });
  });

  describe('Analytics Tracking', () => {
    it('should track property view with correct parameters', async () => {
      const { result } = renderHook(() => usePropertyModal());

      await act(async () => {
        await result.current.openModal('prop-123');
      });

      expect(mockMutate).toHaveBeenCalledWith({
        propertyId: 'prop-123',
        source: 'modal'
      });
    });

    it('should not fail modal operation if tracking fails', async () => {
      const { result } = renderHook(() => usePropertyModal());
      mockMutate.mockRejectedValue(new Error('Analytics service unavailable'));

      await act(async () => {
        await result.current.openModal('prop-1');
      });

      // Modal should still open successfully
      expect(result.current.isOpen).toBe(true);
      expect(result.current.property).toEqual(mockPropertyDetails);
      expect(result.current.error).toBe(null);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state during concurrent operations', async () => {
      const { result } = renderHook(() => usePropertyModal());

      // Start multiple open operations
      const promises = [
        act(async () => result.current.openModal('prop-1')),
        act(async () => result.current.openModal('prop-2')),
        act(async () => result.current.openModal('prop-3'))
      ];

      await Promise.all(promises);

      // Should end up with the last property
      expect(result.current.propertyId).toBe('prop-3');
      expect(result.current.isOpen).toBe(true);
    });
  });
});