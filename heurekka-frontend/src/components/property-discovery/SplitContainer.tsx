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
  resizable = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRatio, setDragStartRatio] = useState(ratio.cards);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const [leftChild, rightChild] = children;

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
      className={`split-container flex h-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Left Panel - Property Cards */}
      <div 
        className="split-panel-left flex-shrink-0 relative"
        style={{ width: `${ratio.cards}%` }}
      >
        {leftChild}
      </div>

      {/* Divider */}
      {resizable && (
        <div
          ref={dividerRef}
          className={`split-divider flex-shrink-0 w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize relative group transition-colors duration-200 ${
            isDragging ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar paneles"
          aria-valuenow={Math.round(ratio.cards)}
          aria-valuemin={20}
          aria-valuemax={80}
          aria-valuetext={`${Math.round(ratio.cards)}% tarjetas, ${Math.round(ratio.map)}% mapa`}
        >
          {/* Hover indicator */}
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-1 h-8 bg-blue-500 rounded-full shadow-md"></div>
          </div>
          
          {/* Focus indicator */}
          <div className="absolute inset-y-0 -left-2 -right-2 rounded focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50"></div>
        </div>
      )}

      {/* Right Panel - Map */}
      <div 
        className="split-panel-right flex-1 relative"
        style={{ width: `${ratio.map}%` }}
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