'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuccessAnimationProps {
  title?: string;
  message?: string;
  onComplete?: () => void;
  autoCloseDelay?: number;
}

/**
 * Success Animation Component
 *
 * Animated success checkmark with optional auto-close
 */
export function SuccessAnimation({
  title = '¡Perfil Creado!',
  message = 'Redirigiendo...',
  onComplete,
  autoCloseDelay = 2000
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after delay
    if (onComplete && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [onComplete, autoCloseDelay]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Animated Checkmark Circle */}
      <div
        className={cn(
          'relative mb-6 flex items-center justify-center',
          'w-20 h-20 rounded-full bg-green-500',
          'transform transition-all duration-500 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-green-400',
            'animate-ping opacity-75'
          )}
        />
        <Check
          className={cn(
            'relative h-10 w-10 text-white',
            'transform transition-all duration-300 delay-300',
            isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          )}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-2xl font-bold text-neutral-900 mb-2 text-center',
          'transform transition-all duration-500 delay-200',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {title}
      </h3>

      {/* Message */}
      <p
        className={cn(
          'text-base text-neutral-600 text-center',
          'transform transition-all duration-500 delay-300',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      >
        {message}
      </p>

      {/* Progress Bar (optional) */}
      {autoCloseDelay > 0 && (
        <div className="mt-6 w-full max-w-xs">
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all ease-linear"
              style={{
                width: isVisible ? '100%' : '0%',
                transitionDuration: `${autoCloseDelay}ms`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Loading Animation Component
 */
export function LoadingAnimation({
  message = 'Cargando...'
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Spinner */}
      <div className="mb-6 relative">
        <div className="w-16 h-16 border-4 border-neutral-200 border-t-primary rounded-full animate-spin" />
      </div>

      {/* Message */}
      <p className="text-base text-neutral-600 text-center animate-pulse">
        {message}
      </p>
    </div>
  );
}