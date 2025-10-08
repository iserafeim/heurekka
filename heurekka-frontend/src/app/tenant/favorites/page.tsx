/**
 * Favorites Page
 * Página para ver y gestionar propiedades favoritas
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites, useToggleFavorite } from '@/hooks/tenant/useFavorites';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageSquare, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const router = useRouter();
  const { data: favorites, isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const handleRemove = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync({ propertyId });
      toast.success('Propiedad removida de favoritos');
    } catch (error) {
      toast.error('Error al remover de favoritos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              {favorites?.length || 0} propiedades guardadas
            </p>
          </div>
        </div>

        {/* Empty State */}
        {!favorites?.length ? (
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
          /* Grid de Favoritos */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="aspect-video bg-gray-200 relative">
                  {favorite.isContacted && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                      Contactado
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {favorite.property?.title || 'Propiedad'}
                  </h3>
                  <p className="text-blue-600 font-bold text-lg mb-2">
                    L.{favorite.property?.price?.toLocaleString()}/mes
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {favorite.property?.location}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/propiedades/${favorite.propertyId}`)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      onClick={() => handleRemove(favorite.propertyId)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
