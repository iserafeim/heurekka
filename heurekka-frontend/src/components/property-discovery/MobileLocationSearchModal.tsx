'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SearchBar } from './SearchBar';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { SPANISH_TEXT } from '@/types/property';

interface MobileLocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string, coordinates?: { lat: number; lng: number }) => void;
  currentLocation?: string;
  locale?: 'es' | 'en';
}

export const MobileLocationSearchModal: React.FC<MobileLocationSearchModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation = '',
  locale = 'es'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    hasRecentSearches
  } = useRecentSearches();

  const {
    location: currentGeoLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    isSupported: isGeolocationSupported
  } = useCurrentLocation();

  // Handle search submission
  const handleSearch = useCallback((location: string) => {
    if (location.trim()) {
      addRecentSearch(location.trim());
      onLocationSelect(location.trim());
      onClose();
    }
  }, [addRecentSearch, onLocationSelect, onClose]);

  // Handle recent search selection
  const handleRecentSearchSelect = useCallback((search: any) => {
    addRecentSearch(search.location, search.coordinates);
    onLocationSelect(search.location, search.coordinates);
    onClose();
  }, [addRecentSearch, onLocationSelect, onClose]);

  // Handle current location request
  const handleCurrentLocationRequest = useCallback(async () => {
    try {
      const result = await requestLocation();
      if (result) {
        const locationName = result.address || result.city || 'Ubicación actual';
        addRecentSearch(locationName, result.coordinates);
        onLocationSelect(locationName, result.coordinates);
        onClose();
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      // Could show a toast notification here
    }
  }, [requestLocation, addRecentSearch, onLocationSelect, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle animation state
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Clean up body scroll after modal closes
      const timer = setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-search-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative h-full bg-white flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center h-14 px-4 border-b border-gray-200 transition-all duration-300 delay-100 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 ml-4">
            <SearchBar
              onSearch={handleSearch}
              initialLocation={searchQuery}
              placeholder="Ej: apartamentos 2 habitaciones, casa Tegucigalpa..."
              locale={locale}
              className="w-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Location Option */}
          {isGeolocationSupported && (
            <div className={`border-b border-gray-100 transition-all duration-300 delay-200 ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <button
                onClick={handleCurrentLocationRequest}
                disabled={locationLoading}
                className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-8 h-8 mr-4 flex items-center justify-center">
                  {locationLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
                  ) : (
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {locationLoading ? 'Obteniendo ubicación...' : 'Usar ubicación actual'}
                  </div>
                  {locationError && (
                    <div className="text-sm text-red-500 mt-1">
                      {locationError.message}
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Recent Searches */}
          {hasRecentSearches && (
            <div className={`py-4 transition-all duration-300 delay-300 ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Búsquedas Recientes
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <div
                    key={search.id}
                    className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${400 + index * 50}ms` }}
                    onClick={() => handleRecentSearchSelect(search)}
                  >
                    <div className="flex-shrink-0 w-8 h-8 mr-4 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {search.location}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(search.id);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      aria-label={`Eliminar ${search.location} del historial`}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasRecentSearches && !isGeolocationSupported && (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Busca una ubicación
                </h3>
                <p className="text-gray-500 text-sm">
                  Escribe el nombre de una ciudad, barrio o dirección
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileLocationSearchModal;