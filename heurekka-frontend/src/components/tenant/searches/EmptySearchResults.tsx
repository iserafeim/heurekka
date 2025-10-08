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
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No se encontraron propiedades
      </h3>

      <p className="text-gray-600 text-center max-w-md mb-6">
        No hay propiedades que coincidan con tus criterios de búsqueda en este momento.
        Intenta ajustar los filtros o ampliar tu búsqueda.
      </p>

      {onEditCriteria && (
        <Button onClick={onEditCriteria} className="gap-2">
          <Edit className="h-4 w-4" />
          Editar Criterios de Búsqueda
        </Button>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md">
        <p className="text-sm text-blue-900">
          <strong>Consejo:</strong> Te notificaremos por email cuando haya nuevas propiedades
          que coincidan con esta búsqueda.
        </p>
      </div>
    </div>
  );
}
