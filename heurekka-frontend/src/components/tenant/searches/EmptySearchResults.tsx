/**
 * Empty Search Results
 * Empty state cuando no hay resultados
 */

'use client';

import React from 'react';
import { Search, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptySearchResultsProps {
  onEditCriteria?: () => void;
}

export function EmptySearchResults({ onEditCriteria }: EmptySearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
        <Search className="h-10 w-10 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        No se encontraron propiedades
      </h3>

      <p className="text-gray-600 text-center max-w-md mb-6">
        No hay propiedades que coincidan con tus criterios de búsqueda en este momento.
        Intenta ajustar los filtros o ampliar tu búsqueda.
      </p>

      {onEditCriteria && (
        <Button onClick={onEditCriteria} className="gap-2 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl">
          <Edit className="h-4 w-4" />
          Editar Criterios de Búsqueda
        </Button>
      )}

      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl max-w-md border border-blue-200 shadow-sm">
        <p className="text-sm text-blue-900">
          <strong>Consejo:</strong> Te notificaremos por email cuando haya nuevas propiedades
          que coincidan con esta búsqueda.
        </p>
      </div>
    </div>
  );
}
