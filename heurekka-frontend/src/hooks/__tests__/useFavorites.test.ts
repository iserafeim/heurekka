import { renderHook, act, waitFor } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock tRPC
const mockMutate = jest.fn();
const mockUtils = {
  property: {
    toggleFavorite: {
      mutate: mockMutate
    }
  }
};

jest.mock('@/lib/trpc/react', () => ({
  trpc: {
    useUtils: () => mockUtils
  }
}));

// Mock console methods to avoid noise in tests
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

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockMutate.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(new Set());
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.toggleFavorite).toBe('function');
      expect(typeof result.current.isFavorite).toBe('function');
    });

    it('should load favorites from localStorage on mount', () => {
      const storedFavorites = ['prop1', 'prop2', 'prop3'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites));

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(new Set(storedFavorites));
      expect(localStorageMock.getItem).toHaveBeenCalledWith('property-favorites');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(new Set());
      expect(console.error).toHaveBeenCalledWith(
        'Error loading favorites from localStorage:',
        expect.any(Error)
      );
    });

    it('should handle null localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(new Set());
    });
  });

  describe('localStorage Integration', () => {
    it('should save favorites to localStorage when favorites change', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'property-favorites',
        JSON.stringify(['prop1'])
      );
    });

    it('should handle localStorage save errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error saving favorites to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('toggleFavorite Functionality', () => {
    it('should add property to favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('prop1')).toBe(false);

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(result.current.isFavorite('prop1')).toBe(true);
      expect(result.current.favorites.has('prop1')).toBe(true);
      expect(mockMutate).toHaveBeenCalledWith({ propertyId: 'prop1' });
    });

    it('should remove property from favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      // First add
      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(result.current.isFavorite('prop1')).toBe(true);

      // Then remove
      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(result.current.isFavorite('prop1')).toBe(false);
      expect(result.current.favorites.has('prop1')).toBe(false);
    });

    it('should manage loading state correctly', async () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.loading).toBe(false);

      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockMutate.mockReturnValue(promise);

      const togglePromise = act(async () => {
        result.current.toggleFavorite('prop1');
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      resolvePromise!();
      await togglePromise;

      // Should not be loading
      expect(result.current.loading).toBe(false);
    });

    it('should perform optimistic update', async () => {
      const { result } = renderHook(() => useFavorites());

      // Mock a slow backend response
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockMutate.mockReturnValue(promise);

      act(() => {
        result.current.toggleFavorite('prop1');
      });

      // Should immediately update local state
      expect(result.current.isFavorite('prop1')).toBe(true);

      resolvePromise!();
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Backend Integration', () => {
    it('should handle unauthorized backend errors gracefully', async () => {
      const { result } = renderHook(() => useFavorites());
      
      const unauthorizedError = {
        data: { code: 'UNAUTHORIZED' }
      };
      mockMutate.mockRejectedValue(unauthorizedError);

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      // Should keep the local state even if backend fails due to auth
      expect(result.current.isFavorite('prop1')).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to sync favorite with backend:',
        unauthorizedError
      );
    });

    it('should revert optimistic update on server errors', async () => {
      const { result } = renderHook(() => useFavorites());
      
      const serverError = {
        data: { code: 'INTERNAL_SERVER_ERROR' }
      };
      mockMutate.mockRejectedValue(serverError);

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.toggleFavorite('prop1');
        } catch (error) {
          thrownError = error;
        }
      });

      // Should revert the optimistic update
      expect(result.current.isFavorite('prop1')).toBe(false);
      expect(thrownError.message).toBe('Error al sincronizar favorito con el servidor');
    });

    it('should handle network errors appropriately', async () => {
      const { result } = renderHook(() => useFavorites());
      
      const networkError = new Error('Network error');
      mockMutate.mockRejectedValue(networkError);

      let thrownError: any;
      await act(async () => {
        try {
          await result.current.toggleFavorite('prop1');
        } catch (error) {
          thrownError = error;
        }
      });

      expect(result.current.isFavorite('prop1')).toBe(false);
      expect(thrownError.message).toBe('Error al sincronizar favorito con el servidor');
    });
  });

  describe('isFavorite Function', () => {
    it('should return false for non-favorite properties', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('prop1')).toBe(false);
      expect(result.current.isFavorite('nonexistent')).toBe(false);
    });

    it('should return true for favorite properties', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(result.current.isFavorite('prop1')).toBe(true);
    });

    it('should update when favorites change', async () => {
      const { result } = renderHook(() => useFavorites());

      // Add favorite
      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });
      expect(result.current.isFavorite('prop1')).toBe(true);

      // Remove favorite
      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });
      expect(result.current.isFavorite('prop1')).toBe(false);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple favorites correctly', async () => {
      const { result } = renderHook(() => useFavorites());

      // Add multiple favorites
      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });
      await act(async () => {
        await result.current.toggleFavorite('prop2');
      });
      await act(async () => {
        await result.current.toggleFavorite('prop3');
      });

      expect(result.current.favorites.size).toBe(3);
      expect(result.current.isFavorite('prop1')).toBe(true);
      expect(result.current.isFavorite('prop2')).toBe(true);
      expect(result.current.isFavorite('prop3')).toBe(true);
      expect(result.current.isFavorite('prop4')).toBe(false);
    });

    it('should remove specific favorites without affecting others', async () => {
      const { result } = renderHook(() => useFavorites());

      // Add multiple favorites
      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });
      await act(async () => {
        await result.current.toggleFavorite('prop2');
      });
      await act(async () => {
        await result.current.toggleFavorite('prop3');
      });

      // Remove one
      await act(async () => {
        await result.current.toggleFavorite('prop2');
      });

      expect(result.current.favorites.size).toBe(2);
      expect(result.current.isFavorite('prop1')).toBe(true);
      expect(result.current.isFavorite('prop2')).toBe(false);
      expect(result.current.isFavorite('prop3')).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across hook re-renders', async () => {
      const { result, rerender } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });

      expect(result.current.isFavorite('prop1')).toBe(true);

      rerender();

      expect(result.current.isFavorite('prop1')).toBe(true);
    });

    it('should properly save array format to localStorage', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.toggleFavorite('prop1');
      });
      await act(async () => {
        await result.current.toggleFavorite('prop2');
      });

      const expectedData = expect.arrayContaining(['prop1', 'prop2']);
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
        'property-favorites',
        JSON.stringify(expectedData)
      );
    });
  });
});