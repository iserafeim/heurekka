/**
 * Empty Search Results
 * Empty state cuando no hay resultados
 */

'use client';

import React from 'react';
import { Search, Edit, Bell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptySearchResultsProps {
  onEditCriteria?: () => void;
}

export function EmptySearchResults({ onEditCriteria }: EmptySearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Illustration Container - Enhanced with subtle animation */}
      <div className="relative mb-8">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl blur-2xl opacity-50 animate-pulse" />

        {/* Icon container */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-3xl flex items-center justify-center shadow-xl border-2 border-blue-100">
          <Search className="h-12 w-12 text-blue-600" strokeWidth={2.5} />
        </div>

        {/* Decorative sparkle */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Heading */}
      <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
        No se encontraron propiedades
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-md mb-8 text-lg leading-relaxed">
        No hay propiedades que coincidan con tus criterios de búsqueda en este momento.
        <br />
        <span className="text-gray-500">Intenta ajustar los filtros o ampliar tu búsqueda.</span>
      </p>

      {/* Primary CTA */}
      {onEditCriteria && (
        <Button
          onClick={onEditCriteria}
          className="gap-2 px-8 py-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
        >
          <Edit className="h-5 w-5" />
          Editar Criterios de Búsqueda
        </Button>
      )}

      {/* Info Card with Enhanced Design */}
      <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-2xl max-w-lg border-2 border-blue-200 shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              ¡Te mantendremos informado!
            </p>
            <p className="text-sm text-blue-800 leading-relaxed">
              Recibirás una notificación por correo electrónico cuando aparezcan nuevas propiedades que coincidan con esta búsqueda.
            </p>
          </div>
        </div>
      </div>

      {/* Secondary helpful tips */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Amplía el área</p>
          <p className="text-xs text-gray-500">Busca en zonas cercanas</p>
        </div>

        <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-2xl mb-2">💰</div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Ajusta el presupuesto</p>
          <p className="text-xs text-gray-500">Flexibiliza tu rango</p>
        </div>

        <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-2xl mb-2">🏠</div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Tipos de propiedad</p>
          <p className="text-xs text-gray-500">Considera más opciones</p>
        </div>
      </div>
    </div>
  );
}
