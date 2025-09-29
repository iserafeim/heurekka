'use client';

import { useState, useCallback, useRef } from 'react';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationResult {
  coordinates: LocationCoordinates;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationError {
  code: number;
  message: string;
  type: 'permission_denied' | 'position_unavailable' | 'timeout' | 'not_supported' | 'reverse_geocoding_failed';
}

const DEFAULT_LOCATION: LocationResult = {
  coordinates: { lat: 14.0723, lng: -87.1921 }, // Tegucigalpa, Honduras
  address: 'Tegucigalpa',
  city: 'Tegucigalpa',
  country: 'Honduras'
};

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Check if geolocation is supported
  const isGeolocationSupported = useCallback((): boolean => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }, []);

  // Reverse geocoding using a public API
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<Partial<LocationResult>> => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      // This is free and doesn't require an API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'HEUREKKA Property Search App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        return {
          address: data.display_name || 'Ubicación actual',
          city: address.city || address.town || address.village || address.county || 'Ciudad desconocida',
          country: address.country || 'Honduras'
        };
      }

      return {};
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {};
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationResult> => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!isGeolocationSupported()) {
        const error: LocationError = {
          code: 0,
          message: 'La geolocalización no es compatible con este navegador',
          type: 'not_supported'
        };
        reject(error);
        return;
      }

      setLoading(true);
      setError(null);

      // Create abort controller for this request
      abortController.current = new AbortController();

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes cache
      };

      const successCallback = async (position: GeolocationPosition) => {
        try {
          const coordinates: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Try to get address information
          const geocodeResult = await reverseGeocode(coordinates.lat, coordinates.lng);

          const result: LocationResult = {
            coordinates,
            address: geocodeResult.address || 'Ubicación actual',
            city: geocodeResult.city || 'Ciudad actual',
            country: geocodeResult.country || 'Honduras'
          };

          setLocation(result);
          setLoading(false);
          resolve(result);
        } catch (geocodeError) {
          // Even if reverse geocoding fails, we can still use the coordinates
          const result: LocationResult = {
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            address: 'Ubicación actual',
            city: 'Ciudad actual',
            country: 'Honduras'
          };

          setLocation(result);
          setLoading(false);
          resolve(result);
        }
      };

      const errorCallback = (error: GeolocationPositionError) => {
        setLoading(false);

        let errorType: LocationError['type'];
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = 'permission_denied';
            errorMessage = 'Acceso a la ubicación denegado. Por favor, habilita los permisos de ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorType = 'position_unavailable';
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorType = 'timeout';
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
          default:
            errorType = 'position_unavailable';
            errorMessage = 'Error desconocido al obtener la ubicación.';
            break;
        }

        const locationError: LocationError = {
          code: error.code,
          message: errorMessage,
          type: errorType
        };

        setError(locationError);
        reject(locationError);
      };

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    });
  }, [isGeolocationSupported, reverseGeocode]);

  // Request location with fallback to default
  const requestLocation = useCallback(async (): Promise<LocationResult> => {
    try {
      return await getCurrentLocation();
    } catch (error) {
      console.warn('Failed to get current location, using default:', error);

      // Return default location (Tegucigalpa) as fallback
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return DEFAULT_LOCATION;
    }
  }, [getCurrentLocation]);

  // Cancel any ongoing location request
  const cancelLocationRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setLoading(false);
  }, []);

  // Clear current location and error
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Get permission status (if supported)
  const getPermissionStatus = useCallback(async (): Promise<PermissionState | null> => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      } catch (error) {
        console.warn('Failed to check geolocation permission:', error);
      }
    }
    return null;
  }, []);

  return {
    location,
    loading,
    error,
    isSupported: isGeolocationSupported(),
    getCurrentLocation,
    requestLocation,
    cancelLocationRequest,
    clearLocation,
    getPermissionStatus,
    defaultLocation: DEFAULT_LOCATION
  };
};

export default useCurrentLocation;