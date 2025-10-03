/**
 * ProgressIndicator Component
 * Indicador de progreso con dots
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-2 w-2 rounded-full transition-all duration-300',
            index === currentStep
              ? 'bg-blue-600 w-6' // Activo: más ancho y azul
              : index < currentStep
              ? 'bg-blue-400' // Completado: azul claro
              : 'bg-gray-300' // Pendiente: gris
          )}
          aria-label={`Paso ${index + 1}${index === currentStep ? ' (actual)' : index < currentStep ? ' (completado)' : ''}`}
        />
      ))}
    </div>
  );
}
