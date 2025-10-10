/**
 * Saved Search Results Page
 * Página para ver los resultados de una búsqueda guardada
 */

'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSavedSearch, useExecuteSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { useAddFavorite, useFavorites } from '@/hooks/tenant/useFavorites';
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
  const searchId = (params?.id as string) || '';

  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Debug: Log the searchId and params
  console.log('SavedSearchResultsPage - params:', params);
  console.log('SavedSearchResultsPage - searchId:', searchId);

  const { data: savedSearch, isLoading: isLoadingSearch, error: searchError } = useSavedSearch(searchId);
  const { data: results, isLoading: isLoadingResults } = useExecuteSavedSearch(searchId);
  const { data: favoritesData } = useFavorites();
  const addFavorite = useAddFavorite();

  // Debug: Log the search results
  console.log('SavedSearchResultsPage - savedSearch:', savedSearch);
  console.log('SavedSearchResultsPage - results:', results);
  console.log('SavedSearchResultsPage - searchError:', searchError);

  // Show loading if searchId is not yet available
  if (!searchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleEditSearch = () => {
    router.push(`/tenant/searches/${searchId}/edit`);
  };

  const handleAddToFavorites = async (propertyId: string) => {
    try {
      await addFavorite.mutateAsync({ propertyId });
      toast.success('Propiedad añadida a favoritos');
    } catch (error) {
      toast.error('Error al añadir a favoritos');
    }
  };

  // Sort results
  const sortedResults = React.useMemo(() => {
    if (!results) return [];

    // Handle both wrapped and unwrapped response formats
    const properties = Array.isArray(results) ? results : (results.properties || results.data?.properties || []);

    const sorted = [...properties];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a: any, b: any) => {
          const priceA = a.priceAmount || a.price || 0;
          const priceB = b.priceAmount || b.price || 0;
          return priceA - priceB;
        });
      case 'price_desc':
        return sorted.sort((a: any, b: any) => {
          const priceA = a.priceAmount || a.price || 0;
          const priceB = b.priceAmount || b.price || 0;
          return priceB - priceA;
        });
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
    if (!favoritesData || !Array.isArray(favoritesData)) return [];
    return favoritesData.map((f: any) => f.propertyId);
  }, [favoritesData]);

  // Loading state
  if (isLoadingSearch || isLoadingResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando resultados...</p>
          <p className="text-sm text-gray-500 mt-2">Solo un momento</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!savedSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
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

  // Unwrap savedSearch if needed (handle both wrapped and unwrapped formats)
  const searchData = savedSearch.data || savedSearch;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <button
                onClick={() => router.push('/tenant/dashboard')}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Dashboard
              </button>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <button
                onClick={() => router.push('/tenant/searches')}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Búsquedas
              </button>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-semibold truncate max-w-xs" title={searchData.name}>
              {searchData.name}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          {/* Back Button - Separate for clear hierarchy */}
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="mb-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          {/* Title Section with Clear Visual Weight */}
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                {searchData.name}
              </h1>
              <p className="text-lg font-semibold text-blue-600">
                {sortedResults.length} {sortedResults.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </p>
            </div>

            <Button
              onClick={handleEditSearch}
              className="gap-2 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold px-6"
            >
              <Edit className="h-4 w-4" />
              Editar Criterios
            </Button>
          </div>

          {/* Criteria Badges */}
          <div className="mb-5">
            <SearchCriteriaBadges criteria={searchData.searchCriteria} />
          </div>

          {/* Status Card - Elevated Design */}
          {(searchData.notificationEnabled || searchData.lastExecutedAt) && (
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
              {searchData.notificationEnabled && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm bg-blue-50 text-blue-700 border border-blue-200">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notificaciones activadas</span>
                </div>
              )}

              {searchData.lastExecutedAt && (
                <div className="text-sm text-gray-500 ml-auto">
                  Última actualización: <span className="font-medium text-gray-700">{new Date(searchData.lastExecutedAt).toLocaleDateString('es-HN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          )}
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
