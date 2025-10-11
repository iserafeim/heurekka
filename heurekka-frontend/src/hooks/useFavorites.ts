import { useState, useEffect, useCallback, useMemo } from 'react';
import { UseFavoritesResult } from '@/types/property';
import { secureStorage } from '@/lib/security/secureStorage';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/stores/auth';

/**
 * Hook for managing user favorites
 * Uses tRPC with secure storage fallback for unauthenticated users
 */
export function useFavorites(): UseFavoritesResult {
  const { isAuthenticated } = useAuthStore();
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set());

  // Load favorites from tRPC if authenticated
  const { data: favoritesData, isLoading } = trpc.favorite.list.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Get utils for invalidation
  const utils = trpc.useContext();

  // Toggle favorite mutation with optimistic updates
  const toggleMutation = trpc.favorite.toggle.useMutation({
    onMutate: async ({ propertyId }) => {
      // Cancel outgoing refetches
      await utils.favorite.list.cancel();

      // Snapshot the previous value
      const previousFavorites = utils.favorite.list.getData();

      // Optimistically update
      utils.favorite.list.setData(undefined, (old) => {
        if (!old?.data) return old;

        const isFavorited = old.data.some((fav: any) => fav.propertyId === propertyId);

        if (isFavorited) {
          // Remove from favorites
          return {
            ...old,
            data: old.data.filter((fav: any) => fav.propertyId !== propertyId)
          };
        } else {
          // Add to favorites (we don't have full property data here, but that's ok)
          return {
            ...old,
            data: [...old.data, { propertyId, property: { id: propertyId } }]
          };
        }
      });

      return { previousFavorites };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        utils.favorite.list.setData(undefined, context.previousFavorites);
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      utils.favorite.list.invalidate();
    },
  });

  // Load favorites from secure storage for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const storedFavorites = secureStorage.getItem('property-favorites');
        if (storedFavorites && Array.isArray(storedFavorites)) {
          setLocalFavorites(new Set(storedFavorites));
        }
      } catch (storageError) {
        console.error('Error loading favorites from secure storage:', storageError);
        secureStorage.removeItem('property-favorites');
      }
    }
  }, [isAuthenticated]);

  // Save local favorites to secure storage whenever they change (for unauthenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        secureStorage.setItem('property-favorites', Array.from(localFavorites));
      } catch (error) {
        console.error('Error saving favorites to secure storage:', error);
      }
    }
  }, [localFavorites, isAuthenticated]);

  // Get favorites set based on authentication status
  const favorites = useMemo(() => {
    if (isAuthenticated && favoritesData?.data) {
      return new Set(favoritesData.data.map((fav: any) => fav.propertyId));
    }
    return localFavorites;
  }, [isAuthenticated, favoritesData, localFavorites]);

  // Toggle favorite function
  const toggleFavorite = useCallback(async (propertyId: string): Promise<void> => {
    // Basic validation
    if (!propertyId || typeof propertyId !== 'string') {
      throw new Error('Invalid property ID');
    }

    if (isAuthenticated) {
      // Use tRPC mutation for authenticated users
      try {
        await toggleMutation.mutateAsync({ propertyId });
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }
    } else {
      // Use local storage for unauthenticated users
      const wasLiked = localFavorites.has(propertyId);
      const newFavorites = new Set(localFavorites);

      if (wasLiked) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }

      setLocalFavorites(newFavorites);

      try {
        secureStorage.setItem('property-favorites', Array.from(newFavorites));
      } catch (storageError) {
        console.error('Failed to save to local storage:', storageError);
      }
    }
  }, [isAuthenticated, localFavorites, toggleMutation]);

  // Check if property is favorite
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.has(propertyId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    loading: isAuthenticated ? isLoading : false
  };
}