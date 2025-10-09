/**
 * New Saved Search Page
 * Página para crear una nueva búsqueda guardada
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SavedSearchFormFields } from '@/components/tenant/searches/SavedSearchFormFields';
import type { SavedSearchFormData } from '@/types/tenant';

export default function NewSavedSearchPage() {
  const router = useRouter();
  const createSearch = useCreateSavedSearch();

  const handleSubmit = async (data: SavedSearchFormData) => {
    try {
      await createSearch.mutateAsync(data);
      toast.success('Búsqueda creada exitosamente');
      router.push('/tenant/searches');
    } catch (error) {
      toast.error('Error al crear la búsqueda');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Búsqueda</h1>
            <p className="text-gray-600 mt-1">
              Configura los criterios y recibe notificaciones de nuevas propiedades
            </p>
          </div>
        </div>

        {/* Form */}
        <SavedSearchFormFields
          onSubmit={handleSubmit}
          submitLabel="Crear Búsqueda"
          isLoading={createSearch.isPending}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
