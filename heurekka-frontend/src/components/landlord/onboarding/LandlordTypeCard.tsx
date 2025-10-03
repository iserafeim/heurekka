/**
 * LandlordTypeCard Component
 * Card seleccionable para tipo de arrendador
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LandlordType } from '@/types/landlord';

interface LandlordTypeCardProps {
  type: LandlordType;
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function LandlordTypeCard({
  icon,
  title,
  description,
  selected,
  onClick,
  className,
}: LandlordTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full p-6 rounded-xl border-2 transition-all duration-200',
        'flex flex-col items-center text-center gap-3',
        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        selected
          ? 'border-blue-600 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300',
        className
      )}
      aria-pressed={selected}
    >
      <div className="text-5xl mb-2">{icon}</div>

      <h3 className={cn(
        'text-lg font-semibold transition-colors',
        selected ? 'text-blue-900' : 'text-gray-900'
      )}>
        {title}
      </h3>

      <p className={cn(
        'text-sm transition-colors',
        selected ? 'text-blue-700' : 'text-gray-600'
      )}>
        {description}
      </p>

      {selected && (
        <div className="mt-2 flex items-center gap-1 text-blue-600">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Seleccionado</span>
        </div>
      )}
    </button>
  );
}
