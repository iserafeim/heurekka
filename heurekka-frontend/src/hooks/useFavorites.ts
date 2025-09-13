import { useState, useEffect, useCallback } from 'react';
import { UseFavoritesResult } from '@/types/property';
import { secureStorage } from '@/lib/security/secureStorage';
import { trpc } from '@/lib/trpc';

/**
 * Hook for managing user favorites
 * Uses tRPC with secure storage fallback
 */
export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from secure storage on mount (tRPC will be added when routes are available)
  useEffect(() => {
    try {
      const storedFavorites = secureStorage.getItem('property-favorites');
      if (storedFavorites && Array.isArray(storedFavorites)) {
        setFavorites(new Set(storedFavorites));
      }
    } catch (storageError) {
      console.error('Error loading favorites from secure storage:', storageError);
      // Clear corrupted data
      secureStorage.removeItem('property-favorites');
    }
  }, []);

  // Save favorites to secure storage whenever favorites change
  useEffect(() => {
    try {
      secureStorage.setItem('property-favorites', Array.from(favorites));
    } catch (error) {
      console.error('Error saving favorites to secure storage:', error);
    }
  }, [favorites]);

  // Toggle favorite function with local storage (tRPC will be added when routes are available)
  const toggleFavorite = useCallback(async (propertyId: string): Promise<void> => {
    // Basic validation
    if (!propertyId || typeof propertyId !== 'string') {
      throw new Error('Invalid property ID');
    }
    
    const wasLiked = favorites.has(propertyId);
    const newFavorites = new Set(favorites);
    
    if (wasLiked) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    
    // Optimistic update
    setFavorites(newFavorites);
    
    try {
      // Update local storage
      secureStorage.setItem('property-favorites', Array.from(newFavorites));
    } catch (storageError) {
      console.error('Failed to save to local storage:', storageError);
    }
  }, [favorites]);

  // Check if property is favorite
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.has(propertyId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    loading: false // Will be updated when tRPC routes are available
  };
}