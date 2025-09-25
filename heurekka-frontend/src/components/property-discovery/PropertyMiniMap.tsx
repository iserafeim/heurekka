'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Coordinates } from '@/types/property';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface PropertyMiniMapProps {
  coordinates: Coordinates;
  address?: string;
  height?: string;
  className?: string;
  onMapClick?: () => void;
}

/**
 * PropertyMiniMap - Lightweight map component for property modals
 * Optimized to show a single property location with minimal controls
 */
export const PropertyMiniMap: React.FC<PropertyMiniMapProps> = ({
  coordinates,
  address = '',
  height = '200px',
  className = '',
  onMapClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Set Mapbox access token
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Validate coordinates
  const isValidCoordinates = (coords: Coordinates): boolean => {
    return (
      coords &&
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      coords.lat >= -90 && coords.lat <= 90 &&
      coords.lng >= -180 && coords.lng <= 180 &&
      !isNaN(coords.lat) && !isNaN(coords.lng)
    );
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Wait for modal and container to be properly positioned in DOM
    const initializeMap = () => {
      // Advanced debugging
      console.log('🗺️ PropertyMiniMap Debug:', {
        token: mapboxgl.accessToken ? `${mapboxgl.accessToken.substring(0, 10)}...` : 'MISSING',
        tokenValid: mapboxgl.accessToken?.startsWith('pk.'),
        coordinates: coordinates,
        isValidCoords: isValidCoordinates(coordinates),
        container: mapContainer.current,
        containerBounds: mapContainer.current?.getBoundingClientRect(),
        mapboxVersion: mapboxgl.version
      });

      // Validate token and coordinates
      if (!mapboxgl.accessToken || mapboxgl.accessToken === '') {
        console.error('❌ Mapbox token missing');
        setMapError('Token de Mapbox no configurado');
        return;
      }

      if (!mapboxgl.accessToken.startsWith('pk.')) {
        console.error('❌ Invalid Mapbox token format:', mapboxgl.accessToken.substring(0, 20));
        setMapError('Token de Mapbox inválido');
        return;
      }

      if (!isValidCoordinates(coordinates)) {
        console.error('❌ Invalid coordinates:', coordinates);
        setMapError('Coordenadas inválidas');
        return;
      }

      try {
        // Use provided coordinates, but fallback to Tegucigalpa center if problematic
        let mapCenter = [coordinates.lng, coordinates.lat];

        // If coordinates are exactly (0,0) or seem invalid, use Tegucigalpa center
        if (coordinates.lat === 0 && coordinates.lng === 0) {
          console.warn('⚠️ Coordinates are (0,0), using Tegucigalpa fallback');
          mapCenter = [-87.1921, 14.0723]; // Tegucigalpa center
        }

        console.log('🌍 Using map center:', mapCenter);

        // Initialize map with fallback configurations
        const mapConfig = {
          container: mapContainer.current,
          center: mapCenter,
          zoom: 16,
          antialias: true,
          attributionControl: false,
          logoPosition: 'bottom-right' as const,
          scrollZoom: true,
          boxZoom: false,
          dragRotate: false,
          dragPan: true,
          keyboard: false,
          doubleClickZoom: false,
          touchZoomRotate: true
        };

        // Try multiple map styles as fallback
        const mapStyles = [
          'mapbox://styles/mapbox/streets-v11',
          'mapbox://styles/mapbox/streets-v12',
          'mapbox://styles/mapbox/outdoors-v11',
          'mapbox://styles/mapbox/satellite-streets-v11'
        ];

        map.current = new mapboxgl.Map({
          ...mapConfig,
          style: mapStyles[0] // Start with streets-v11
        });

        console.log('🗺️ Map initialized with style:', mapStyles[0]);

      // Add zoom control in top-right
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true
        }),
        'top-right'
      );

      // Set a timeout to detect if map doesn't load
      const loadTimeout = setTimeout(() => {
        if (!mapLoaded) {
          console.error('❌ Map load timeout - tiles may not be loading');
          setMapError('El mapa está tardando mucho en cargar. Verifica tu conexión.');
        }
      }, 10000); // 10 second timeout

      // Enhanced event handling with detailed logging
      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        clearTimeout(loadTimeout);
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on('idle', () => {
        console.log('✅ Map idle - tiles should be loaded');
      });

      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded) {
          console.log('✅ Source data loaded:', e.sourceId);
        }
      });

      map.current.on('data', (e) => {
        if (e.dataType === 'style') {
          console.log('✅ Style data loaded');
        }
      });

      map.current.on('error', (e) => {
        console.error('❌ Mapbox error:', {
          error: e.error,
          type: e.type,
          sourceId: e.sourceId,
          message: e.error?.message
        });

        // More specific error messages
        if (e.error?.message?.includes('401')) {
          setMapError('Token de Mapbox inválido o sin permisos');
        } else if (e.error?.message?.includes('403')) {
          setMapError('Acceso denegado - verificar configuración del token');
        } else if (e.error?.message?.includes('404')) {
          setMapError('Estilo de mapa no encontrado');
        } else {
          setMapError(`Error del mapa: ${e.error?.message || 'Error desconocido'}`);
        }
      });

      // Monitor tile loading errors specifically
      map.current.on('sourcedataloading', (e) => {
        console.log('📡 Loading source data:', e.sourceId);
      });

      // Check for style loading errors
      map.current.on('styleimagemissing', (e) => {
        console.warn('⚠️ Style image missing:', e.id);
      });

      // Add click handler if provided
      if (onMapClick) {
        map.current.on('click', onMapClick);
      }

      // Create enhanced marker
      const markerElement = document.createElement('div');
      markerElement.className = 'property-mini-marker';
      markerElement.innerHTML = `
        <div style="position: relative;">
          <!-- Outer ring for prominence -->
          <div style="
            width: 40px;
            height: 40px;
            background: rgba(37, 99, 235, 0.2);
            border: 2px solid #2563eb;
            border-radius: 50%;
            position: absolute;
            top: -4px;
            left: -4px;
            animation: pulse 2s infinite;
          "></div>
          <!-- Main marker -->
          <div style="
            width: 32px;
            height: 32px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            cursor: ${onMapClick ? 'pointer' : 'default'};
            position: relative;
            z-index: 1;
          "></div>
        </div>
      `;

      // Add pulsing animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);

      // Add marker (use actual coordinates or fallback center)
      const markerCoords = (coordinates.lat === 0 && coordinates.lng === 0)
        ? [-87.1921, 14.0723]
        : [coordinates.lng, coordinates.lat];

      marker.current = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat(markerCoords)
        .addTo(map.current);

      console.log('📍 Marker placed at:', markerCoords);

      // Add enhanced popup with address if provided
      if (address) {
        const popup = new mapboxgl.Popup({
          offset: 35,
          closeButton: false,
          closeOnClick: false,
          className: 'property-mini-popup'
        })
          .setHTML(`
            <div style="
              padding: 12px 16px;
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              border: 1px solid #e5e7eb;
              max-width: 200px;
              text-align: center;
            ">
              <div style="color: #2563eb; font-size: 12px; margin-bottom: 4px;">📍 UBICACIÓN</div>
              ${address}
            </div>
          `);

        marker.current.setPopup(popup);
        // Show popup automatically after map loads
        map.current.on('idle', () => {
          if (popup && !popup.isOpen()) {
            popup.addTo(map.current!);
          }
        });
      }

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Error al inicializar el mapa');
      }
    };

    // Wait for modal to be properly positioned, then initialize map
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates.lat, coordinates.lng, address, onMapClick]);

  // Show error state
  if (mapError || !isValidCoordinates(coordinates)) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-500">
            {mapError || 'Ubicación no disponible'}
          </p>
          {address && (
            <p className="text-xs text-gray-400 mt-1">
              {address}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height, position: 'relative', zIndex: 1 }}>
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{
          opacity: mapLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1
        }}
      />

      {/* Click overlay for interaction feedback */}
      {onMapClick && (
        <div
          className="absolute inset-0 cursor-pointer hover:bg-black hover:bg-opacity-5 transition-all duration-200"
          onClick={onMapClick}
        />
      )}
    </div>
  );
};

export default PropertyMiniMap;