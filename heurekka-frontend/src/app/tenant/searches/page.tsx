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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la búsqueda "${name}"?`)) return;

    try {
      await deleteSearch.mutateAsync({ id });
      toast.success('Búsqueda eliminada');
    } catch (error) {
      toast.error('Error al eliminar búsqueda');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus.mutateAsync({ id });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando búsquedas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.back()} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Búsquedas Guardadas
              </h1>
              <p className="text-gray-600 mt-1">
                {searches?.length || 0} búsquedas configuradas
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/tenant/searches/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Búsqueda
          </Button>
        </div>

        {/* Empty State */}
        {!searches?.length ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes búsquedas guardadas
            </h2>
            <p className="text-gray-600 mb-6">
              Crea una búsqueda y recibe notificaciones de nuevas propiedades
            </p>
            <Button onClick={() => router.push('/tenant/searches/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Búsqueda
            </Button>
          </div>
        ) : (
          /* Grid de Búsquedas */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searches.map((search) => (
              <div
                key={search.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {search.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          search.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {search.isActive ? 'Activa' : 'Pausada'}
                      </span>
                      {search.newMatchCount > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {search.newMatchCount} nuevas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Criteria Summary */}
                <div className="space-y-2 mb-4">
                  <CriteriaItem
                    label="Presupuesto"
                    value={`L.${search.criteria.budgetMin?.toLocaleString()} - L.${search.criteria.budgetMax?.toLocaleString()}`}
                  />
                  {search.criteria.locations && search.criteria.locations.length > 0 && (
                    <CriteriaItem
                      label="Zonas"
                      value={search.criteria.locations.slice(0, 2).join(', ') + (search.criteria.locations.length > 2 ? '...' : '')}
                    />
                  )}
                  {search.criteria.propertyTypes && search.criteria.propertyTypes.length > 0 && (
                    <CriteriaItem
                      label="Tipos"
                      value={search.criteria.propertyTypes.join(', ')}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => router.push(`/tenant/searches/${search.id}`)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Resultados
                  </Button>
                  <Button
                    onClick={() => handleToggleStatus(search.id)}
                    size="sm"
                    variant="ghost"
                    title={search.isActive ? 'Pausar' : 'Activar'}
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
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(search.id, search.name)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
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
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
