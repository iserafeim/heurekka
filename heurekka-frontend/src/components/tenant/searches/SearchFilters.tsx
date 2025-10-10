/**
 * Search Filters
 * Filtros rápidos para ordenar y filtrar resultados
 */

'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'date_newest' | 'date_oldest';

interface SearchFiltersProps {
  onSortChange: (sort: SortOption) => void;
  currentSort?: SortOption;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia', icon: '🎯' },
  { value: 'price_asc', label: 'Precio: Menor a Mayor', icon: '↑' },
  { value: 'price_desc', label: 'Precio: Mayor a Menor', icon: '↓' },
  { value: 'date_newest', label: 'Más Recientes', icon: '🆕' },
  { value: 'date_oldest', label: 'Más Antiguas', icon: '📅' },
];

export function SearchFilters({ onSortChange, currentSort = 'relevance' }: SearchFiltersProps) {
  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort);

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Current sort indicator */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ArrowUpDown className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ordenar resultados</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {currentOption?.icon} {currentOption?.label}
            </p>
          </div>
        </div>

        {/* Right side - Sort selector */}
        <Select value={currentSort} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-56 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-200 shadow-sm">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 shadow-lg">
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{option.icon}</span>
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
