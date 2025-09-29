'use client';

import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/security/secureStorage';

export interface RecentSearch {
  id: string;
  location: string;
  timestamp: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const STORAGE_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recent searches from storage on mount
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const stored = secureStorage.getItem<RecentSearch[]>(STORAGE_KEY);
        if (stored && Array.isArray(stored)) {
          // Sort by timestamp (most recent first) and ensure valid data
          const validSearches = stored
            .filter(search =>
              search &&
              typeof search.location === 'string' &&
              search.location.trim() !== '' &&
              typeof search.timestamp === 'number'
            )
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_RECENT_SEARCHES);

          setRecentSearches(validSearches);
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
        setRecentSearches([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentSearches();
  }, []);

  // Save searches to storage whenever they change
  useEffect(() => {
    if (!loading && recentSearches.length >= 0) {
      try {
        secureStorage.setItem(STORAGE_KEY, recentSearches);
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
    }
  }, [recentSearches, loading]);

  // Add a new search to recent searches
  const addRecentSearch = useCallback((location: string, coordinates?: { lat: number; lng: number }) => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) return;

    const newSearch: RecentSearch = {
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      location: trimmedLocation,
      timestamp: Date.now(),
      coordinates
    };

    setRecentSearches(prevSearches => {
      // Remove any existing search with the same location (case insensitive)
      const filteredSearches = prevSearches.filter(
        search => search.location.toLowerCase() !== trimmedLocation.toLowerCase()
      );

      // Add new search at the beginning
      const updatedSearches = [newSearch, ...filteredSearches];

      // Keep only the most recent MAX_RECENT_SEARCHES
      return updatedSearches.slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  // Remove a specific search
  const removeRecentSearch = useCallback((searchId: string) => {
    setRecentSearches(prevSearches =>
      prevSearches.filter(search => search.id !== searchId)
    );
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // Get formatted display text for a search
  const getDisplayText = useCallback((search: RecentSearch): string => {
    return search.location;
  }, []);

  // Check if a location is in recent searches
  const isLocationInRecent = useCallback((location: string): boolean => {
    const trimmedLocation = location.trim().toLowerCase();
    return recentSearches.some(
      search => search.location.toLowerCase() === trimmedLocation
    );
  }, [recentSearches]);

  return {
    recentSearches,
    loading,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    getDisplayText,
    isLocationInRecent,
    hasRecentSearches: recentSearches.length > 0
  };
};

export default useRecentSearches;