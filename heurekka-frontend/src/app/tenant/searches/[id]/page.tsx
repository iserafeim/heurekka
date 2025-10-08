/**
 * Saved Search Results Page
 * Página para ver los resultados de una búsqueda guardada
 */

'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSavedSearch, useExecuteSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { useCreateFavorite, useFavorites } from '@/hooks/tenant/useFavorites';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Loader2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { SearchCriteriaBadges } from '@/components/tenant/searches/SearchCriteriaBadges';
import { SearchFilters, type SortOption } from '@/components/tenant/searches/SearchFilters';
import { PropertyGrid } from '@/components/tenant/searches/PropertyGrid';
import { EmptySearchResults } from '@/components/tenant/searches/EmptySearchResults';

export default function SavedSearchResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchId = params?.id as string;

  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const { data: savedSearch, isLoading: isLoadingSearch } = useSavedSearch(searchId);
  const { data: results, isLoading: isLoadingResults } = useExecuteSavedSearch(searchId);
  const { data: favorites } = useFavorites();
  const createFavorite = useCreateFavorite();

  const handleEditSearch = () => {
    router.push(`/tenant/searches/${searchId}/edit`);
  };

  const handleAddToFavorites = async (propertyId: string) => {
    try {
      await createFavorite.mutateAsync({ propertyId });
      toast.success('Propiedad añadida a favoritos');
    } catch (error) {
      toast.error('Error al añadir a favoritos');
    }
  };

  // Sort results
  const sortedResults = React.useMemo(() => {
    if (!results) return [];

    const sorted = [...results];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'date_newest':
        return sorted; // Asume que vienen ordenados por fecha
      case 'date_oldest':
        return sorted.reverse();
      case 'relevance':
      default:
        return sorted;
    }
  }, [results, sortBy]);

  // Get favorite property IDs
  const favoritePropertyIds = React.useMemo(() => {
    return favorites?.map((f) => f.propertyId) || [];
  }, [favorites]);

  // Loading state
  if (isLoadingSearch || isLoadingResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!savedSearch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Búsqueda no encontrada
          </h1>
          <p className="text-gray-600 mb-6">
            La búsqueda que intentas ver no existe o fue eliminada.
          </p>
          <Button onClick={() => router.push('/tenant/searches')}>
            Volver a Búsquedas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => router.push('/tenant/dashboard')}
            className="hover:text-gray-900"
          >
            Dashboard
          </button>
          <span>/</span>
          <button
            onClick={() => router.push('/tenant/searches')}
            className="hover:text-gray-900"
          >
            Búsquedas
          </button>
          <span>/</span>
          <span className="text-gray-900">{savedSearch.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.back()} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{savedSearch.name}</h1>
                <p className="text-gray-600 mt-1">
                  {sortedResults.length} {sortedResults.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                </p>
              </div>
            </div>

            <Button onClick={handleEditSearch} variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar Criterios
            </Button>
          </div>

          {/* Criteria Badges */}
          <SearchCriteriaBadges criteria={savedSearch.criteria} />

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${savedSearch.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-gray-600">
                {savedSearch.isActive ? 'Búsqueda activa' : 'Búsqueda pausada'}
              </span>
            </div>

            {savedSearch.notificationEnabled && (
              <div className="flex items-center gap-2 text-blue-600">
                <Heart className="h-4 w-4" />
                <span>Notificaciones activadas</span>
              </div>
            )}

            {savedSearch.lastExecutedAt && (
              <span className="text-gray-500">
                Última actualización: {new Date(savedSearch.lastExecutedAt).toLocaleDateString('es-HN')}
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        {sortedResults.length > 0 && (
          <SearchFilters onSortChange={setSortBy} currentSort={sortBy} />
        )}

        {/* Results Grid */}
        {sortedResults.length > 0 ? (
          <PropertyGrid
            properties={sortedResults}
            onFavorite={handleAddToFavorites}
            favoritePropertyIds={favoritePropertyIds}
          />
        ) : (
          <EmptySearchResults onEditCriteria={handleEditSearch} />
        )}
      </div>
    </div>
  );
}
