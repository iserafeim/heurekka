import { useState, useCallback } from 'react';

/**
 * Hook for synchronizing split-view interactions
 * Manages hover states between property cards and map markers
 */
export function useSplitViewSync() {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(true);

  // Sync card hover with map marker
  const syncCardWithMap = useCallback((propertyId: string | null) => {
    if (!syncEnabled) return;
    
    setHoveredCardId(propertyId);
    
    // Additional logic for highlighting map marker
    // This could trigger map marker highlight animations
    if (propertyId) {
      // Emit custom event for map to listen to
      window.dispatchEvent(new CustomEvent('highlightMapMarker', {
        detail: { propertyId }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('unhighlightMapMarkers'));
    }
  }, [syncEnabled]);

  // Sync map marker hover with card
  const syncMapWithCard = useCallback((propertyId: string | null) => {
    if (!syncEnabled) return;
    
    setHoveredMarkerId(propertyId);
    
    // Additional logic for highlighting property card
    // This could trigger card highlight animations or scrolling
    if (propertyId) {
      // Emit custom event for cards panel to listen to
      window.dispatchEvent(new CustomEvent('highlightPropertyCard', {
        detail: { propertyId }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('unhighlightPropertyCards'));
    }
  }, [syncEnabled]);

  // Toggle synchronization
  const toggleSync = useCallback(() => {
    setSyncEnabled(prev => !prev);
    
    // Clear all highlights when disabling sync
    if (syncEnabled) {
      setHoveredCardId(null);
      setHoveredMarkerId(null);
      window.dispatchEvent(new CustomEvent('unhighlightMapMarkers'));
      window.dispatchEvent(new CustomEvent('unhighlightPropertyCards'));
    }
  }, [syncEnabled]);

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    setHoveredCardId(null);
    setHoveredMarkerId(null);
    window.dispatchEvent(new CustomEvent('unhighlightMapMarkers'));
    window.dispatchEvent(new CustomEvent('unhighlightPropertyCards'));
  }, []);

  return {
    hoveredCardId,
    hoveredMarkerId,
    syncEnabled,
    syncCardWithMap,
    syncMapWithCard,
    toggleSync,
    clearHighlights
  };
}