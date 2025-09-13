/**
 * Favorites API Service
 * Direct API calls to backend favorites endpoints
 */

import { httpClient } from './httpClient';

interface FavoriteResponse {
  success: boolean;
  message?: string;
}

interface UserFavoritesResponse {
  favorites: string[];
}

export class FavoritesService {
  /**
   * Get user's favorite properties
   */
  async getUserFavorites(): Promise<string[]> {
    try {
      const response = await httpClient.get<UserFavoritesResponse>('/favorites');
      return response.favorites;
    } catch (error) {
      console.error('Get favorites error:', {
        message: error instanceof Error ? error.message : (error as any)?.message || 'Unknown error',
        status: (error as any)?.status,
        code: (error as any)?.code,
        error: error
      });
      throw new Error('Error al cargar favoritos. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Add property to favorites
   */
  async addToFavorites(propertyId: string): Promise<void> {
    try {
      if (!propertyId || typeof propertyId !== 'string') {
        throw new Error('ID de propiedad inválido');
      }

      await httpClient.post<FavoriteResponse>('/favorites', { propertyId });
    } catch (error) {
      console.error('Add favorite error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      throw new Error('Error al agregar a favoritos. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Remove property from favorites
   */
  async removeFromFavorites(propertyId: string): Promise<void> {
    try {
      if (!propertyId || typeof propertyId !== 'string') {
        throw new Error('ID de propiedad inválido');
      }

      await httpClient.delete<FavoriteResponse>(`/favorites/${propertyId}`);
    } catch (error) {
      console.error('Remove favorite error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      throw new Error('Error al quitar de favoritos. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(propertyId: string, isCurrentlyFavorite: boolean): Promise<void> {
    if (isCurrentlyFavorite) {
      await this.removeFromFavorites(propertyId);
    } else {
      await this.addToFavorites(propertyId);
    }
  }
}

export const favoritesService = new FavoritesService();