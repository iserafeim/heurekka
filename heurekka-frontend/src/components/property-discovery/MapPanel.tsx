'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Property, Coordinates, MapBounds, SPANISH_TEXT } from '@/types/property';
import { validateUrl, sanitizeText } from '@/lib/security/validation';

// Mapbox CSS - import this in your main CSS file or layout
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapPanelProps {
  properties: Property[];
  center?: Coordinates;
  zoom?: number;
  bounds?: MapBounds;
  hoveredPropertyId?: string | null;
  onMarkerClick: (property: Property) => void;
  onMarkerHover: (propertyId: string | null) => void;
  onBoundsChange: (bounds: MapBounds) => void;
  fullscreen?: boolean;
  className?: string;
}

/**
 * MapPanel component with Mapbox GL integration
 * Displays properties as markers with clustering and tooltips
 */
export const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  center = { lat: 14.0723, lng: -87.1921 }, // Tegucigalpa, Honduras
  zoom = 12,
  bounds,
  hoveredPropertyId,
  onMarkerClick,
  onMarkerHover,
  onBoundsChange,
  fullscreen = false,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Set Mapbox access token
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Store onBoundsChange in a ref to avoid re-initialization
  const onBoundsChangeRef = useRef(onBoundsChange);
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxgl.accessToken || mapboxgl.accessToken === '') {
      console.warn('Mapbox access token is missing. Map functionality will be limited.');
      setMapError('Configuración del mapa requerida para mostrar propiedades en el mapa');
      return;
    }

    // Check for default/example token
    if (mapboxgl.accessToken.includes('pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ')) {
      console.warn('Using default Mapbox token. Please configure a valid token for production use.');
      setMapError('Token de Mapbox por defecto en uso. Configurar token válido para producción.');
      return;
    }

    // Check if token looks valid (basic validation)
    if (!mapboxgl.accessToken.startsWith('pk.')) {
      console.warn('Mapbox access token appears to be invalid.');
      setMapError('Token de acceso del mapa inválido');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.lng, center.lat],
        zoom: zoom,
        antialias: true,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Handle map load
      map.current.on('load', () => {
        console.log('🗺️ Map loaded, setting up clustering...');
        setMapLoaded(true);

        // Setup clustering immediately after map loads (bypass mapLoaded check since we know it's loaded)
        if (map.current && !map.current.getSource('properties')) {
          setupClusteringDirectly();
        }
      });

      // Handle map move
      map.current.on('moveend', () => {
        if (map.current) {
          const bounds = map.current.getBounds();
          if (bounds) {
            onBoundsChangeRef.current({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            });
          }
        }
      });

      // Handle map errors
      map.current.on('error', (e: any) => {
        console.error('Map error details:', {
          type: e.type || 'unknown',
          error: e.error || e,
          message: e.error?.message || e.message || 'Unknown error',
          source: e.source || 'unknown',
          sourceId: e.sourceId || 'unknown',
          isEmpty: Object.keys(e).length === 0
        });

        // Provide more specific error messages
        let errorMessage = 'Error al cargar el mapa';
        const errorMsg = e.error?.message || e.message || '';

        // Check if it's an empty error object (common with invalid tokens)
        if (Object.keys(e).length === 0 || (!e.error && !e.message && !e.type)) {
          errorMessage = 'Token de Mapbox inválido o no configurado. Verifica la configuración del mapa.';
        } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('401') || errorMsg.includes('Invalid access token')) {
          errorMessage = 'Token de acceso del mapa inválido o expirado';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMessage = 'Error de conexión al cargar el mapa';
        } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
          errorMessage = 'Límite de uso del mapa excedido';
        } else if (e.source || e.sourceId) {
          errorMessage = `Error al cargar datos del mapa: ${e.source || e.sourceId}`;
        }

        setMapError(errorMessage);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center.lat, center.lng, zoom]); // Only re-initialize when center or zoom props change

  // Show property tooltip
  const showPropertyTooltip = useCallback((e: mapboxgl.MapMouseEvent, properties: any) => {
    if (!map.current) return;

    // Remove existing tooltip
    if (popup.current) {
      popup.current.remove();
      popup.current = null;
    }

    const coordinates = (e.lngLat as mapboxgl.LngLatLike);
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Create tooltip DOM element safely
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'property-tooltip p-3 max-w-sm';

    // Create and append image if valid
    if (properties.image) {
      const validImageUrl = validateUrl(properties.image);
      if (validImageUrl) {
        const img = document.createElement('img');
        img.src = validImageUrl;
        img.alt = 'Property image';
        img.className = 'w-full h-32 object-cover rounded-lg mb-3';
        img.loading = 'lazy';
        
        // Add error handling for broken images
        img.onerror = () => {
          img.style.display = 'none';
        };
        
        tooltipDiv.appendChild(img);
      }
    }

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'space-y-2';

    // Price element
    const priceDiv = document.createElement('div');
    priceDiv.className = 'font-bold text-lg text-gray-900';
    priceDiv.textContent = `${formatCurrency(properties.price)}/mes`;
    contentDiv.appendChild(priceDiv);

    // Address element
    const addressDiv = document.createElement('div');
    addressDiv.className = 'text-sm text-gray-600';
    addressDiv.textContent = sanitizeText(properties.address || '');
    contentDiv.appendChild(addressDiv);

    // Property details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'flex items-center gap-4 text-sm text-gray-600';

    const bedroomsSpan = document.createElement('span');
    bedroomsSpan.textContent = `🛏️ ${properties.bedrooms} hab`;
    detailsDiv.appendChild(bedroomsSpan);

    const bathroomsSpan = document.createElement('span');
    bathroomsSpan.textContent = `🚿 ${properties.bathrooms} baños`;
    detailsDiv.appendChild(bathroomsSpan);

    const areaSpan = document.createElement('span');
    areaSpan.textContent = `📐 ${properties.area} m²`;
    detailsDiv.appendChild(areaSpan);

    contentDiv.appendChild(detailsDiv);

    // Click instruction
    const clickDiv = document.createElement('div');
    clickDiv.className = 'text-xs text-blue-600 font-medium mt-2';
    clickDiv.textContent = 'Click para ver detalles';
    contentDiv.appendChild(clickDiv);

    tooltipDiv.appendChild(contentDiv);

    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15
    })
      .setLngLat(coordinates)
      .setDOMContent(tooltipDiv)
      .addTo(map.current);
  }, []);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (popup.current) {
      popup.current.remove();
      popup.current = null;
    }
  }, []);

  // Setup clustering directly (bypasses mapLoaded check for immediate setup)
  const setupClusteringDirectly = useCallback(() => {
    if (!map.current) return;
    
    const mapInstance = map.current;
    console.log('🔧 setupClusteringDirectly called, style loaded:', mapInstance.isStyleLoaded());

    // Check if style is loaded
    if (!mapInstance.isStyleLoaded()) {
      console.warn('⏳ Map style not loaded yet, retrying clustering setup...');
      setTimeout(() => setupClusteringDirectly(), 100);
      return;
    }

    doClusteringSetup(mapInstance);
  }, []);

  // Setup clustering for better performance with many markers
  const setupClustering = useCallback(() => {
    console.log('🔧 setupClustering called, mapLoaded:', mapLoaded, 'map.current:', !!map.current);
    
    if (!map.current || !mapLoaded) {
      console.log('❌ setupClustering: early return - map not ready');
      return;
    }

    const mapInstance = map.current;

    // Check if style is loaded
    if (!mapInstance.isStyleLoaded()) {
      console.warn('⏳ Map style not loaded yet, retrying clustering setup...');
      setTimeout(() => setupClustering(), 100);
      return;
    }

    doClusteringSetup(mapInstance);
  }, [mapLoaded]);

  // Actual clustering setup logic (shared between both setup functions)
  const doClusteringSetup = useCallback((mapInstance: mapboxgl.Map) => {

    try {
      // Add clustering source
      if (!mapInstance.getSource('properties')) {
        console.log('🏗️ Creating properties source and layers...');
        mapInstance.addSource('properties', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });

      // Add cluster circles
      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1c40f',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      // Add cluster count labels
      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Add individual property points
      console.log('🔵 Creating unclustered-point layer...');
      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#2563eb',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Click handlers
      mapInstance.on('click', 'clusters', (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties?.cluster_id;
        if (clusterId) {
          (mapInstance.getSource('properties') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;
              if (features[0].geometry.type === 'Point') {
                mapInstance.easeTo({
                  center: features[0].geometry.coordinates as [number, number],
                  zoom: zoom || undefined
                });
              }
            }
          );
        }
      });

      mapInstance.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.propertyId) {
          const property = properties.find(p => p.id === feature.properties?.propertyId);
          if (property) {
            onMarkerClick(property);
          }
        }
      });

      // Mouse events for hover effects
      mapInstance.on('mouseenter', 'unclustered-point', (e) => {
        mapInstance.getCanvas().style.cursor = 'pointer';
        const feature = e.features?.[0];
        if (feature?.properties?.propertyId) {
          onMarkerHover(feature.properties.propertyId);
          showPropertyTooltip(e, feature.properties);
        }
      });

      mapInstance.on('mouseleave', 'unclustered-point', () => {
        mapInstance.getCanvas().style.cursor = '';
        onMarkerHover(null);
        hideTooltip();
      });

      mapInstance.on('mouseenter', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'clusters', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    }
    } catch (error) {
      console.error('Error setting up map clustering:', error);
    }
  }, [onMarkerClick, onMarkerHover]);

  // Note: Clustering setup is now handled directly in the map 'load' event

  // Update map data when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const updateMapData = () => {
      const mapInstance = map.current;
      if (!mapInstance) return;

      const source = mapInstance.getSource('properties') as mapboxgl.GeoJSONSource;
      
      // Ensure source exists and all required layers are created
      if (!source || 
          !mapInstance.getLayer('unclustered-point') || 
          !mapInstance.getLayer('clusters') || 
          !mapInstance.getLayer('cluster-count')) {
        console.log('⏳ Waiting for all layers to be created before updating data...');
        setTimeout(updateMapData, 100);
        return;
      }

      try {
        const geojsonData = {
          type: 'FeatureCollection' as const,
          features: properties.map(property => ({
            type: 'Feature' as const,
            properties: {
              propertyId: property.id,
              price: property.price,
              address: property.address,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              area: property.area,
              propertyType: property.propertyType,
              image: property.images?.[0] || null
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [property.coordinates.lng, property.coordinates.lat]
            }
          }))
        };

        console.log('🗺️ MapPanel updating with', properties.length, 'properties');
        console.log('📍 GeoJSON features:', geojsonData.features.map(f => ({ 
          id: f.properties.propertyId, 
          coords: f.geometry.coordinates 
        })));
        
        source.setData(geojsonData);
      } catch (error) {
        console.warn('Error updating map data:', error);
      }
    };

    updateMapData();
  }, [properties, mapLoaded]);

  // Handle hovered property highlight
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const updatePropertyHighlight = () => {
      const mapInstance = map.current;
      if (!mapInstance) return;

      const sourceExists = mapInstance.getSource('properties');
      const layerExists = mapInstance.getLayer('unclustered-point');
      
      if (!sourceExists || !layerExists) {
        console.log('⏳ Waiting for layers to exist before updating highlight...');
        setTimeout(updatePropertyHighlight, 100);
        return;
      }

      try {
        // Update marker styles based on hover state
        if (hoveredPropertyId) {
          mapInstance.setFilter('unclustered-point', [
            'case',
            ['==', ['get', 'propertyId'], hoveredPropertyId],
            true,
            false
          ]);
          
          mapInstance.setPaintProperty('unclustered-point', 'circle-radius', [
            'case',
            ['==', ['get', 'propertyId'], hoveredPropertyId],
            12,
            8
          ]);
          
          mapInstance.setPaintProperty('unclustered-point', 'circle-color', [
            'case',
            ['==', ['get', 'propertyId'], hoveredPropertyId],
            '#ef4444',
            '#2563eb'
          ]);
        } else {
          mapInstance.setFilter('unclustered-point', ['!', ['has', 'point_count']]);
          mapInstance.setPaintProperty('unclustered-point', 'circle-radius', 8);
          mapInstance.setPaintProperty('unclustered-point', 'circle-color', '#2563eb');
        }
      } catch (error) {
        console.warn('Error updating property highlight:', error);
      }
    };

    updatePropertyHighlight();
  }, [hoveredPropertyId, mapLoaded]);

  // Error state
  if (mapError) {
    return (
      <div className={`map-panel ${className}`}>
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar el mapa
            </h3>
            <p className="text-gray-600 mb-4">
              {mapError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-panel relative h-full ${className}`}>
      {/* Map container - Fixed height, stays in place */}
      <div
        ref={mapContainer}
        className="w-full h-full bg-gray-100 sticky top-0"
        style={{ minHeight: '400px' }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Properties count overlay */}
      {mapLoaded && properties.length > 0 && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-900 shadow-md">
          {properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'}
        </div>
      )}

      {/* Map legend */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-600 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Propiedades individuales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Grupo de propiedades</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPanel;