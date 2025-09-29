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
  console.log('🗺️ MapPanel render - Properties count:', properties.length, 'Fullscreen:', fullscreen);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popup = useRef<mapboxgl.Popup | null>(null);
  const currentPopupPropertyId = useRef<string | null>(null);
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
            console.log('🗺️ MapPanel moveend - Calling onBoundsChange');
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
  const showPropertyTooltip = useCallback((e: mapboxgl.MapMouseEvent, markerProperties: any, fromClick: boolean = false) => {
    if (!map.current || !fromClick) return;

    // Remove existing tooltip
    if (popup.current) {
      popup.current.remove();
      popup.current = null;
    }

    const coordinates = (e.lngLat as mapboxgl.LngLatLike);

    // Find the complete property data from the properties array
    console.log('🔍 Popup Debug - Properties array length:', properties.length);
    console.log('🔍 Popup Debug - Looking for propertyId:', markerProperties.propertyId);
    const fullPropertyData = properties.find(p => p.id === markerProperties.propertyId);
    console.log('🔍 Popup Debug - Found fullPropertyData:', !!fullPropertyData);
    console.log('🔍 Popup Debug - FullPropertyData images:', fullPropertyData?.images?.length || 0);

    const allImages = fullPropertyData?.images || [markerProperties.image].filter(Boolean);
    const hasMultipleImages = allImages.length > 1;
    console.log('🔍 Popup Debug - AllImages length:', allImages.length, 'hasMultipleImages:', hasMultipleImages);
    let currentImageIndex = 0;

    // Store the property ID for later auto-refresh
    currentPopupPropertyId.current = markerProperties.propertyId;
    
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
    tooltipDiv.className = 'property-tooltip bg-white rounded-xl shadow-lg overflow-hidden max-w-sm border-0';

    // Create image slider container
    if (allImages.length > 0) {
      // Create main image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'relative w-full h-32 overflow-hidden group';

      // Create main image element
      const img = document.createElement('img');
      img.className = 'w-full h-32 object-cover';
      img.loading = 'lazy';

      // Create dots array for later use
      const dots: HTMLElement[] = [];

      // Function to update dots
      const updateDots = (activeIndex: number) => {
        dots.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.className = 'w-2 h-2 rounded-full bg-white shadow-lg transition-all duration-200';
          } else {
            dot.className = 'w-2 h-2 rounded-full bg-white/50 hover:bg-white/75 transition-all duration-200';
          }
        });
      };

      // Function to update image
      const updateImage = (index: number) => {
        const imageUrl = typeof allImages[index] === 'string' ? allImages[index] : allImages[index]?.url;
        if (imageUrl) {
          const validImageUrl = validateUrl(imageUrl);
          if (validImageUrl) {
            img.src = validImageUrl;
            img.alt = `Property image ${index + 1}`;
            currentImageIndex = index;
          }
        }
      };

      // Initialize with first image
      updateImage(0);
      imageContainer.appendChild(img);

      // Add navigation buttons if multiple images
      if (hasMultipleImages) {
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';
        prevButton.innerHTML = '‹';
        prevButton.onclick = (e) => {
          e.stopPropagation();
          const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
          updateImage(newIndex);
          updateDots(newIndex);
        };

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200';
        nextButton.innerHTML = '›';
        nextButton.onclick = (e) => {
          e.stopPropagation();
          const newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
          updateImage(newIndex);
          updateDots(newIndex);
        };

        imageContainer.appendChild(prevButton);
        imageContainer.appendChild(nextButton);

        // Add dots indicators
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1';

        // Create dots
        allImages.forEach((_, index) => {
          const dot = document.createElement('button');
          dot.onclick = (e) => {
            e.stopPropagation();
            updateImage(index);
            updateDots(index);
          };
          dots.push(dot);
          dotsContainer.appendChild(dot);
        });

        // Initialize dots
        updateDots(0);
        imageContainer.appendChild(dotsContainer);
      }

      // Add error handling for broken images
      img.onerror = () => {
        img.style.display = 'none';
      };

      tooltipDiv.appendChild(imageContainer);
    }

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-3 space-y-2';

    // Verified badge
    const badgeDiv = document.createElement('div');
    badgeDiv.className = 'mb-2';
    const badge = document.createElement('span');
    badge.className = 'inline-block px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-600/30 rounded';
    badge.textContent = 'Verificado';
    badgeDiv.appendChild(badge);
    contentDiv.appendChild(badgeDiv);

    // Price element (without /mes)
    const priceDiv = document.createElement('div');
    priceDiv.className = 'font-bold text-xl text-black mb-2';
    priceDiv.textContent = formatCurrency(markerProperties.price);
    contentDiv.appendChild(priceDiv);

    // Property details line with pipe separators
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'text-sm text-neutral-600 mb-2';
    detailsDiv.textContent = `${markerProperties.bedrooms} hab | ${markerProperties.bathrooms} baños | ${markerProperties.area}m²`;
    contentDiv.appendChild(detailsDiv);

    // Location - neighborhood and city only
    const locationDiv = document.createElement('div');
    locationDiv.className = 'text-sm text-black font-semibold mb-2';
    // Use neighborhood and always show Tegucigalpa as city
    const neighborhood = markerProperties.neighborhood || 'Centro';
    locationDiv.textContent = `${neighborhood}, Tegucigalpa`;
    contentDiv.appendChild(locationDiv);

    // Real estate info
    const realtyDiv = document.createElement('div');
    realtyDiv.className = 'text-xs text-neutral-500';
    realtyDiv.textContent = 'HEUREKKA REALTY, Property Owner';
    contentDiv.appendChild(realtyDiv);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200';
    closeButton.innerHTML = '×';
    closeButton.onclick = (e) => {
      e.stopPropagation();
      hideTooltip();
    };

    tooltipDiv.appendChild(contentDiv);
    tooltipDiv.appendChild(closeButton);
    tooltipDiv.style.position = 'relative';

    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      offset: 15,
      className: 'custom-popup-transparent'
    })
      .setLngLat(coordinates)
      .setDOMContent(tooltipDiv)
      .addTo(map.current);

    // Force remove any default styles that might have been applied
    const popupElement = popup.current.getElement();
    if (popupElement) {
      const content = popupElement.querySelector('.mapboxgl-popup-content');
      if (content) {
        (content as HTMLElement).style.background = 'transparent';
        (content as HTMLElement).style.boxShadow = 'none';
        (content as HTMLElement).style.border = 'none';
        (content as HTMLElement).style.padding = '0';
        (content as HTMLElement).style.margin = '0';
      }
    }
  }, [properties]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (popup.current) {
      popup.current.remove();
      popup.current = null;
    }
    // Clear popup property ID and hover state when closing popup
    currentPopupPropertyId.current = null;
    onMarkerHover(null);
  }, [onMarkerHover]);

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
          clusterRadius: 25
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
          // Show tooltip on click
          showPropertyTooltip(e, feature.properties, true);
          onMarkerHover(feature.properties.propertyId);
        }
      });

      // Mouse events for hover effects (just cursor, no tooltip)
      mapInstance.on('mouseenter', 'unclustered-point', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'unclustered-point', () => {
        mapInstance.getCanvas().style.cursor = '';
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

  // Update event listeners when showPropertyTooltip changes to fix stale closure
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;

    // Check if unclustered-point layer exists
    if (!mapInstance.getLayer('unclustered-point')) {
      console.log('⏳ Waiting for unclustered-point layer before updating event listeners...');
      return;
    }

    console.log('🔄 Updating event listeners with current showPropertyTooltip...');

    // Remove old click listener
    mapInstance.off('click', 'unclustered-point');

    // Add new click listener with current showPropertyTooltip
    mapInstance.on('click', 'unclustered-point', (e) => {
      const feature = e.features?.[0];
      if (feature?.properties?.propertyId) {
        console.log('🎯 Click event with current properties array length:', properties.length);
        showPropertyTooltip(e, feature.properties, true);
        onMarkerHover(feature.properties.propertyId);
      }
    });

  }, [showPropertyTooltip, mapLoaded, properties.length, onMarkerHover]);

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
              neighborhood: property.neighborhood,
              city: property.city,
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

  // Auto-refresh popup when properties data loads
  useEffect(() => {
    if (!popup.current || !currentPopupPropertyId.current || !map.current) return;

    // Check if we now have data for the currently open property
    const propertyData = properties.find(p => p.id === currentPopupPropertyId.current);

    if (propertyData && propertyData.images && propertyData.images.length > 1) {
      console.log('🔄 Properties data loaded, refreshing popup with complete image data');

      // Store current popup coordinates
      const currentLngLat = popup.current.getLngLat();

      // Create synthetic marker properties for the refresh
      const syntheticMarkerProps = {
        propertyId: propertyData.id,
        image: propertyData.images[0],
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        neighborhood: propertyData.neighborhood
      };

      // Create synthetic event for showPropertyTooltip
      const syntheticEvent = {
        lngLat: currentLngLat
      } as mapboxgl.MapMouseEvent;

      // Recreate the popup with complete data
      showPropertyTooltip(syntheticEvent, syntheticMarkerProps, true);
    }
  }, [properties, showPropertyTooltip]);

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
        // Update marker styles based on hover state - keep all properties visible
        if (hoveredPropertyId) {
          // Only change visual properties, don't hide other properties
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
          // Reset to default styles when no property is hovered
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