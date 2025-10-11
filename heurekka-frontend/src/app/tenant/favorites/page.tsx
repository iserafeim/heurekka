/**
 * Favorites Page
 * Página para ver y gestionar propiedades favoritas
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites, useToggleFavorite } from '@/hooks/tenant/useFavorites';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/ui/property-card';
import { ArrowLeft, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const router = useRouter();
  const { data: favoritesResponse, isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  // Extract favorites array from response
  const favorites = favoritesResponse?.data || [];

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync({ propertyId });
      toast.success('Favorito actualizado');
    } catch (error) {
      toast.error('Error al actualizar favorito');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando favoritos...</p>
          <p className="text-sm text-gray-500 mt-2">Solo un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Propiedades Favoritas
            </h1>
            <p className="text-gray-600 mt-1">
              {favorites.length} propiedades guardadas
            </p>
          </div>
        </div>

        {/* Empty State */}
        {!favorites.length ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos aún
            </h2>
            <p className="text-gray-600 mb-6">
              Explora propiedades y guarda las que te gusten
            </p>
            <Button onClick={() => router.push('/propiedades')}>
              Explorar Propiedades
            </Button>
          </div>
        ) : (
          /* Grid de Favoritos con PropertyCard */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite: any) => {
              // Transform backend favorite format to PropertyCard Property format
              const property = favorite.property;

              // Extract neighborhood from address object
              const neighborhood = property.address?.neighborhood || '';
              const city = property.address?.city || 'Tegucigalpa';
              const street = property.address?.street || '';

              const normalizedProperty = {
                id: property.id,
                address: street,
                neighborhood,
                city,
                price: property.priceAmount,
                bedrooms: property.bedrooms || 0,
                bathrooms: typeof property.bathrooms === 'string'
                  ? parseFloat(property.bathrooms)
                  : property.bathrooms || 0,
                area: property.areaSqm || 0,
                propertyType: property.type,
                images: Array.isArray(property.images)
                  ? property.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
                  : [],
                description: property.title || '',
                amenities: property.amenities || [],
                coordinates: { lat: 0, lng: 0 },
                landlord: {
                  id: property.landlordId || '',
                  name: 'Propietario',
                },
                listing: {
                  listedDate: property.createdAt || new Date().toISOString(),
                  status: 'active',
                  daysOnMarket: 0,
                },
                stats: {
                  views: 0,
                  favorites: 0,
                  inquiries: 0,
                },
              };

              return (
                <PropertyCard
                  key={favorite.id}
                  property={normalizedProperty}
                  isFavorite={true}
                  onFavorite={() => handleToggleFavorite(property.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
