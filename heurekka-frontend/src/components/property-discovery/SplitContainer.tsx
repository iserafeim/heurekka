'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SplitContainerProps {
  children: [React.ReactNode, React.ReactNode]; // Exactly two children
  ratio: { cards: number; map: number };
  onRatioChange?: (ratio: { cards: number; map: number }) => void;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  className?: string;
}

/**
 * SplitContainer component for property discovery split-view
 * Provides a resizable 70/30 layout for cards and map panels
 */
export const SplitContainer: React.FC<SplitContainerProps> = ({
  children,
  ratio,
  onRatioChange,
  minWidth = 300,
  maxWidth = 80,
  resizable = false, // Disable resizing to enforce fixed 70/30 layout
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRatio, setDragStartRatio] = useState(ratio.cards);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [leftChild, rightChild] = children;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mouse down on divider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartRatio(ratio.cards);
    
    // Add cursor style to body
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [resizable, ratio.cards]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const deltaX = e.clientX - dragStartX;
    const deltaPercent = (deltaX / containerWidth) * 100;
    
    let newCardsRatio = dragStartRatio + deltaPercent;
    
    // Apply constraints
    const minCardsPercent = (minWidth / containerWidth) * 100;
    const maxCardsPercent = maxWidth;
    
    newCardsRatio = Math.max(minCardsPercent, Math.min(maxCardsPercent, newCardsRatio));
    
    const newMapRatio = 100 - newCardsRatio;
    
    // Update ratio
    const newRatio = { cards: newCardsRatio, map: newMapRatio };
    
    if (onRatioChange) {
      onRatioChange(newRatio);
    }
  }, [isDragging, dragStartX, dragStartRatio, minWidth, maxWidth, onRatioChange]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Remove cursor style from body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isDragging]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!resizable) return;
    
    const step = 5; // 5% step for keyboard navigation
    let newCardsRatio = ratio.cards;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newCardsRatio = Math.max(20, ratio.cards - step);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newCardsRatio = Math.min(80, ratio.cards + step);
        break;
      case 'Home':
        e.preventDefault();
        newCardsRatio = 70; // Default ratio
        break;
      default:
        return;
    }
    
    const newRatio = { cards: newCardsRatio, map: 100 - newCardsRatio };
    
    if (onRatioChange) {
      onRatioChange(newRatio);
    }
  }, [resizable, ratio.cards, onRatioChange]);

  return (
    <div
      ref={containerRef}
      className={`split-container h-full grid grid-cols-1 md:grid-cols-[60%_40%] lg:grid-cols-[70%_30%] ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Left Panel - Property Cards (70%) */}
      <div
        className="split-panel-left relative overflow-hidden"
      >
        {leftChild}
      </div>

      {/* Right Panel - Map (30%) - Hidden on mobile */}
      <div
        className={`split-panel-right relative overflow-hidden ${isMobile ? 'hidden' : 'block'}`}
      >
        {rightChild}
      </div>

      {/* Resize feedback */}
      {isDragging && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-medium pointer-events-none z-50">
          {Math.round(ratio.cards)}% / {Math.round(ratio.map)}%
        </div>
      )}
    </div>
  );
};

export default SplitContainer;