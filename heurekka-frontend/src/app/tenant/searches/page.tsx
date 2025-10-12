/**
 * Saved Searches Page
 * Página para ver y gestionar búsquedas guardadas
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSavedSearches, useDeleteSavedSearch, useToggleSavedSearchStatus } from '@/hooks/tenant/useSavedSearches';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Search, Edit, Eye, Trash2, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedSearchesPage() {
  const router = useRouter();
  const { data: searches, isLoading } = useSavedSearches();
  const deleteSearch = useDeleteSavedSearch();
  const toggleStatus = useToggleSavedSearchStatus();

  const handleDelete = async (id: string, name: string, profileName?: string) => {
    const searchName = profileName || name || 'esta búsqueda';
    if (!confirm(`¿Eliminar la búsqueda "${searchName}"?`)) return;

    try {
      await deleteSearch.mutateAsync({ searchId: id });
      toast.success('Búsqueda eliminada');
    } catch (error) {
      toast.error('Error al eliminar búsqueda');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus.mutateAsync({ searchId: id });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando búsquedas...</p>
          <p className="text-sm text-gray-500 mt-2">Solo un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button onClick={() => router.back()} variant="ghost" size="sm" className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">
                Búsquedas Guardadas
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">
                {searches?.length || 0} búsquedas configuradas
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/tenant/searches/new')}
            className="flex items-center gap-2 w-full sm:w-auto justify-center flex-shrink-0"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nueva Búsqueda
          </Button>
        </div>

        {/* Empty State */}
        {!searches?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              No tienes búsquedas guardadas
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Crea una búsqueda y recibe notificaciones de nuevas propiedades
            </p>
            <Button onClick={() => router.push('/tenant/searches/new')} className="w-full sm:w-auto px-6 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Búsqueda
            </Button>
          </div>
        ) : (
          /* Grid de Búsquedas */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {searches.map((search) => (
              <div
                key={search.id}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                      {search.profileName || search.name || 'Búsqueda sin nombre'}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded ${
                          search.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {search.isActive ? 'Activa' : 'Pausada'}
                      </span>
                      {search.newMatchCount > 0 && (
                        <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {search.newMatchCount} nuevas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Criteria Summary */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <CriteriaItem
                    label="Presupuesto"
                    value={`L.${search.searchCriteria?.budgetMin?.toLocaleString() || '0'} - L.${search.searchCriteria?.budgetMax?.toLocaleString() || '0'}`}
                  />
                  {search.searchCriteria?.locations && search.searchCriteria.locations.length > 0 && (
                    <CriteriaItem
                      label="Zonas"
                      value={search.searchCriteria.locations.slice(0, 2).join(', ') + (search.searchCriteria.locations.length > 2 ? '...' : '')}
                    />
                  )}
                  {search.searchCriteria?.propertyTypes && search.searchCriteria.propertyTypes.length > 0 && (
                    <CriteriaItem
                      label="Tipos"
                      value={search.searchCriteria.propertyTypes.join(', ')}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => router.push(`/tenant/searches/${search.id}`)}
                    size="sm"
                    variant="outline"
                    className="flex-1 w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="sm:inline">Ver Resultados</span>
                  </Button>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      onClick={() => handleToggleStatus(search.id)}
                      size="sm"
                      variant="ghost"
                      title={search.isActive ? 'Pausar' : 'Activar'}
                      className="flex-1 sm:flex-none"
                    >
                      {search.isActive ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => router.push(`/tenant/searches/${search.id}/edit`)}
                      size="sm"
                      variant="ghost"
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(search.id, search.name, search.profileName)}
                      size="sm"
                      variant="ghost"
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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

function CriteriaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
      <span className="text-gray-600 flex-shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium truncate">{value}</span>
    </div>
  );
}
