/**
 * Search Filters
 * Filtros rápidos para ordenar y filtrar resultados
 */

'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'date_newest' | 'date_oldest';

interface SearchFiltersProps {
  onSortChange: (sort: SortOption) => void;
  currentSort?: SortOption;
}

export function SearchFilters({ onSortChange, currentSort = 'relevance' }: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="text-sm font-medium">Filtros</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Ordenar por:</label>
          <Select value={currentSort} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="date_newest">Más Recientes</SelectItem>
              <SelectItem value="date_oldest">Más Antiguas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
