'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites, useToggleFavorite } from '@/hooks/tenant/useFavorites';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/ui/property-card';
import { Search, BookmarkIcon } from 'lucide-react';
import { toast } from 'sonner';

export function FavoritesTab() {
  const router = useRouter();
  const { data: favoritesResponse } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const favorites = favoritesResponse?.data || [];

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync({ propertyId });
      toast.success('Favorito actualizado');
    } catch (error) {
      toast.error('Error al actualizar favorito');
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Propiedades Favoritas
        </h2>
      </div>

      {!favorites.length ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
            <BookmarkIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Guarda tus favoritos!
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Explora propiedades y guarda las que más te gusten para verlas después
          </p>
          <Button
            onClick={() => router.push('/propiedades')}
            size="lg"
            className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-5 w-5 mr-2" />
            Explorar Propiedades
          </Button>
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md mx-auto border border-blue-100 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
            <p className="text-sm text-gray-700">
              Usa favoritos para comparar propiedades fácilmente y tenerlas siempre a mano
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite: any) => {
            const property = favorite.property;
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
    </section>
  );
}
