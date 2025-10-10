/**
 * Edit Saved Search Page
 * Página para editar una búsqueda guardada existente
 */

'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSavedSearch, useUpdateSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SavedSearchFormFields } from '@/components/tenant/searches/SavedSearchFormFields';
import type { SavedSearchFormData } from '@/types/tenant';

export default function EditSavedSearchPage() {
  const router = useRouter();
  const params = useParams();
  const searchId = params?.id as string;

  const { data: savedSearch, isLoading: isLoadingSearch } = useSavedSearch(searchId);
  const updateSearch = useUpdateSavedSearch();

  const handleSubmit = async (data: SavedSearchFormData) => {
    try {
      // Transform data to match backend schema
      const payload = {
        searchId: searchId,
        data: {
          profileName: data.name,
          searchCriteria: {
            propertyTypes: data.propertyTypes,
            locations: data.locations,
            budgetMin: data.budgetMin,
            budgetMax: data.budgetMax,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            amenities: data.amenities,
          },
        },
      };

      await updateSearch.mutateAsync(payload as any);
      toast.success('Búsqueda actualizada exitosamente');
      router.push('/tenant/dashboard');
    } catch (error) {
      toast.error('Error al actualizar la búsqueda');
    }
  };

  const handleCancel = () => {
    router.push('/tenant/dashboard');
  };

  // Loading state
  if (isLoadingSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando búsqueda...</p>
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
            La búsqueda que intentas editar no existe o fue eliminada.
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

  // Map saved search data to form data
  const defaultValues: Partial<SavedSearchFormData> = {
    name: searchData.name,
    propertyTypes: searchData.searchCriteria?.propertyTypes || [],
    locations: searchData.searchCriteria?.locations || [],
    budgetMin: searchData.searchCriteria?.budgetMin || 5000,
    budgetMax: searchData.searchCriteria?.budgetMax || 15000,
    bedrooms: searchData.searchCriteria?.bedrooms,
    bathrooms: searchData.searchCriteria?.bathrooms,
    amenities: searchData.searchCriteria?.amenities,
    notificationEnabled: searchData.notificationEnabled,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <span className="text-gray-900">Editar &quot;{searchData.name}&quot;</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={handleCancel} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Búsqueda</h1>
            <p className="text-gray-600 mt-1">
              Actualiza los criterios de búsqueda &quot;{searchData.name}&quot;
            </p>
          </div>
        </div>

        {/* Form */}
        <SavedSearchFormFields
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel="Actualizar Búsqueda"
          isLoading={updateSearch.isPending}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
