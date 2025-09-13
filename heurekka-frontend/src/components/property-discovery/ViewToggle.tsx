'use client';

import React from 'react';
import { ViewMode, SPANISH_TEXT } from '@/types/property';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isTransitioning?: boolean;
  className?: string;
}

/**
 * ViewToggle component for switching between List/Split/Map views
 * Provides accessible view mode switching with visual feedback
 */
export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  isTransitioning = false,
  className = ''
}) => {
  const viewOptions = [
    {
      mode: ViewMode.LIST,
      label: SPANISH_TEXT.views.list,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      description: 'Vista de lista completa'
    },
    {
      mode: ViewMode.SPLIT,
      label: SPANISH_TEXT.views.split,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      description: 'Vista dividida con mapa'
    },
    {
      mode: ViewMode.MAP,
      label: SPANISH_TEXT.views.map,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      description: 'Vista de mapa completa'
    }
  ];

  const handleViewChange = (newView: ViewMode) => {
    if (newView !== currentView && !isTransitioning) {
      onViewChange(newView);
    }
  };

  return (
    <div className={`view-toggle ${className}`}>
      <div className="flex bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Cambiar vista">
        {viewOptions.map((option) => (
          <button
            key={option.mode}
            onClick={() => handleViewChange(option.mode)}
            disabled={isTransitioning}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === option.mode
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            } ${
              isTransitioning
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
            role="tab"
            aria-selected={currentView === option.mode}
            aria-controls={`${option.mode}-panel`}
            aria-label={`${option.label}: ${option.description}`}
            title={option.description}
          >
            <span className={`transition-transform duration-200 ${
              currentView === option.mode ? 'scale-110' : 'scale-100'
            }`}>
              {option.icon}
            </span>
            <span className="hidden sm:inline">
              {option.label}
            </span>
            
            {/* Loading indicator for active transitioning view */}
            {isTransitioning && currentView === option.mode && (
              <div className="ml-1">
                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isTransitioning
          ? `Cambiando a vista ${viewOptions.find(opt => opt.mode === currentView)?.label.toLowerCase()}`
          : `Vista actual: ${viewOptions.find(opt => opt.mode === currentView)?.label.toLowerCase()}`
        }
      </div>
    </div>
  );
};

export default ViewToggle;