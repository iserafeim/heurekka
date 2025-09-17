'use client';

import React from 'react';
import { ViewMode } from '@/types/property';

interface FloatingViewToggleProps {
  currentView: ViewMode;
  onToggle: (view: ViewMode) => void;
  className?: string;
}

/**
 * Floating View Toggle Button for mobile view
 * Dynamically switches between Map and List views
 * Positioned at the bottom of the screen
 */
export const FloatingViewToggle: React.FC<FloatingViewToggleProps> = ({
  currentView,
  onToggle,
  className = ''
}) => {
  // Determine button configuration based on current view
  const getButtonConfig = () => {
    if (currentView === ViewMode.MAP) {
      return {
        text: 'Lista',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        ),
        targetView: ViewMode.LIST,
        ariaLabel: 'Ver lista de propiedades'
      };
    } else {
      return {
        text: 'Mapa',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        ),
        targetView: ViewMode.MAP,
        ariaLabel: 'Ver mapa de propiedades'
      };
    }
  };

  const { text, icon, targetView, ariaLabel } = getButtonConfig();

  const handleClick = () => {
    onToggle(targetView);
  };

  return (
    <div className={`md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <button
        onClick={handleClick}
        className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
        aria-label={ariaLabel}
      >
        {icon}
        {text}
      </button>
    </div>
  );
};

// Export with new name
export const FloatingMapButton = FloatingViewToggle;
export default FloatingViewToggle;