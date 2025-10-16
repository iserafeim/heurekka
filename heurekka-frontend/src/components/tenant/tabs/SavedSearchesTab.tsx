'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useDeleteSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/ui/property-card';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

export function SavedSearchesTab() {
  const router = useRouter();
  const { data: dashboardData } = useTenantDashboard();
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);

  const handleFavoriteToggle = async (propertyId: string) => {
    // Implement favorite toggle
    console.log('Toggle favorite:', propertyId);
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Búsquedas Guardadas
        </h2>
        <Button
          onClick={() => router.push('/tenant/searches/new')}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Nueva Búsqueda
        </Button>
      </div>

      {!dashboardData?.data?.savedSearches?.length ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
            <Search className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Comienza tu búsqueda!
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Crea búsquedas personalizadas y recibe notificaciones cuando aparezcan propiedades que coincidan con tus criterios
          </p>
          <Button
            onClick={() => router.push('/tenant/searches/new')}
            size="lg"
            className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Primera Búsqueda
          </Button>
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md mx-auto border border-blue-100 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
            <p className="text-sm text-gray-700">
              Puedes crear múltiples búsquedas con diferentes criterios y áreas de interés
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {dashboardData.data.savedSearches.slice(0, 3).map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              isExpanded={expandedSearchId === search.id}
              onToggleExpand={(id) => setExpandedSearchId(expandedSearchId === id ? null : id)}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
          {dashboardData.data.savedSearches.length > 3 && (
            <Button
              onClick={() => router.push('/tenant/searches')}
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Ver Todas ({dashboardData.data.savedSearches.length})
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function SavedSearchCard({ search, isExpanded, onToggleExpand, onFavoriteToggle }: {
  search: any;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onFavoriteToggle: (propertyId: string) => void;
}) {
  const router = useRouter();
  const deleteSearch = useDeleteSavedSearch();

  const { data: searchResults, isLoading: loadingResults } = trpc.savedSearch.execute.useQuery(
    { searchId: search.id },
    {
      enabled: isExpanded,
      retry: 1,
      staleTime: 30 * 1000,
    }
  );
  const properties = searchResults?.data?.properties || [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!search.id) return;

    const searchName = search.profileName || search.name || 'esta búsqueda';
    if (!confirm(`¿Eliminar la búsqueda "${searchName}"?`)) return;

    try {
      await deleteSearch.mutateAsync({ searchId: search.id });
      toast.success('Búsqueda eliminada');
    } catch (error) {
      toast.error('Error al eliminar búsqueda');
    }
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ease-out hover:border-gray-300 hover:shadow-sm">
      <div
        className={cn(
          "px-3 py-3 sm:px-4 sm:py-3.5 cursor-pointer relative transition-all duration-200",
          isExpanded
            ? "bg-blue-50/30 border-b border-blue-100"
            : "hover:bg-gray-50/50"
        )}
        onClick={() => onToggleExpand(search.id)}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors duration-150 truncate">
                {search.profileName || search.name || 'Búsqueda sin nombre'}
              </h3>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-blue-600 flex-shrink-0 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-transform duration-200" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-1.5">
              L.{search.searchCriteria?.budgetMin?.toLocaleString('es-HN') || '0'} - L.{search.searchCriteria?.budgetMax?.toLocaleString('es-HN') || '0'}
            </p>
            {search.newMatchCount > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-2 sm:mt-2.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {search.newMatchCount} {search.newMatchCount === 1 ? 'nueva' : 'nuevas'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 p-0 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation();
                if (search.id) router.push(`/tenant/searches/${search.id}/edit`);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 p-0 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-colors duration-150"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 py-4 sm:px-6 sm:py-5 bg-white border-t border-gray-100">
          {loadingResults ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[3/2] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No se encontraron propiedades</p>
              <p className="text-xs text-gray-500">
                Intenta ajustar los criterios de búsqueda
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                {properties.length} {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {properties.map((property: any) => {
                  const normalizedProperty = {
                    id: property.id,
                    address: property.address?.street || '',
                    neighborhood: property.address?.neighborhood || '',
                    city: property.address?.city || 'Tegucigalpa',
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
                      key={property.id}
                      property={normalizedProperty}
                      isFavorite={false}
                      onFavorite={() => onFavoriteToggle(property.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
