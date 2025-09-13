import { useState, useCallback } from 'react';
import { ViewMode } from '@/types/property';

/**
 * Hook for managing view mode transitions
 * Handles smooth transitions between List/Split/Map views
 */
export function useViewToggle(initialView: ViewMode = ViewMode.SPLIT) {
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousView, setPreviousView] = useState<ViewMode>(initialView);

  // Transition to new view with animation
  const transitionToView = useCallback(async (newView: ViewMode) => {
    if (newView === currentView || isTransitioning) return;

    setIsTransitioning(true);
    setPreviousView(currentView);

    try {
      // Simulate transition delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentView(newView);
      
      // Track view change analytics
      try {
        // TODO: Implement analytics tracking
        console.log('View changed:', {
          from: currentView,
          to: newView,
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn('Failed to track view change:', error);
      }
      
      // Additional delay for exit animation
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error during view transition:', error);
      // Revert to previous view on error
      setCurrentView(currentView);
    } finally {
      setIsTransitioning(false);
    }
  }, [currentView, isTransitioning]);

  // Quick toggle between common views
  const toggleSplitMap = useCallback(() => {
    const newView = currentView === ViewMode.SPLIT ? ViewMode.MAP : ViewMode.SPLIT;
    transitionToView(newView);
  }, [currentView, transitionToView]);

  const toggleListSplit = useCallback(() => {
    const newView = currentView === ViewMode.LIST ? ViewMode.SPLIT : ViewMode.LIST;
    transitionToView(newView);
  }, [currentView, transitionToView]);

  // Reset to default view
  const resetToDefault = useCallback(() => {
    transitionToView(ViewMode.SPLIT);
  }, [transitionToView]);

  // Check if specific view is active
  const isViewActive = useCallback((view: ViewMode) => {
    return currentView === view;
  }, [currentView]);

  // Get view label for accessibility
  const getViewLabel = useCallback((view: ViewMode) => {
    switch (view) {
      case ViewMode.LIST:
        return 'Vista de lista';
      case ViewMode.SPLIT:
        return 'Vista dividida';
      case ViewMode.MAP:
        return 'Vista de mapa';
      default:
        return 'Vista desconocida';
    }
  }, []);

  return {
    currentView,
    previousView,
    isTransitioning,
    transitionToView,
    toggleSplitMap,
    toggleListSplit,
    resetToDefault,
    isViewActive,
    getViewLabel
  };
}