'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Property, SPANISH_TEXT } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  isHovered?: boolean;
  onFavorite: (propertyId: string) => void;
  onHover: (propertyId: string | null) => void;
  onClick: (property: Property) => void;
  viewMode?: 'grid' | 'list';
  locale?: 'es' | 'en';
  className?: string;
}

/**
 * PropertyCard component for displaying individual property listings
 * No contact button - entire card is clickable to open modal
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite,
  isHovered = false,
  onFavorite,
  onHover,
  onClick,
  viewMode = 'grid',
  locale = 'es',
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format currency in Honduran Lempiras
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-HN' : 'en-US', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const listingDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    onHover(property.id);
  }, [onHover, property.id]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  // Handle card click
  const handleCardClick = useCallback(() => {
    onClick(property);
  }, [onClick, property]);

  // Handle favorite toggle
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onFavorite(property.id);
  }, [onFavorite, property.id]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Get property type in Spanish
  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Apartamento';
      case 'house':
        return 'Casa';
      case 'room':
        return 'Habitación';
      case 'office':
        return 'Oficina';
      default:
        return type;
    }
  };

  return (
    <article
      className={`property-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
        isHovered ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
      } ${className}`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={`Propiedad: ${property.address}`}
      data-property-id={property.id}
    >
      {/* Image Container */}
      <div className="relative">
        <div className={`${viewMode === 'list' ? 'h-32' : 'h-48'} bg-gray-200 relative overflow-hidden`}>
          {property.images && property.images.length > 0 && !imageError ? (
            <Image
              src={property.images[0]}
              alt={`${getPropertyTypeLabel(property.propertyType)} en ${property.neighborhood}`}
              fill
              className={`object-cover transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes={viewMode === 'list' ? '(max-width: 768px) 100vw, 300px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Nuevo
            </span>
          )}
          {property.isFeatured && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
              Destacado
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorite
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white bg-opacity-90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Image count indicator */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-full">
            📷 {property.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {formatCurrency(property.price)}
            <span className="text-sm font-normal text-gray-500">/mes</span>
          </h3>
          <span className="text-sm text-gray-500">
            {getPropertyTypeLabel(property.propertyType)}
          </span>
        </div>

        {/* Address */}
        <address className="text-gray-600 text-sm mb-3 not-italic line-clamp-2">
          {property.address || `${property.neighborhood}, ${property.city}`}
        </address>

        {/* Property specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
            </svg>
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'hab' : 'hab'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
            </svg>
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>{property.area} m²</span>
          </div>
        </div>

        {/* Amenities preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{property.amenities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>
            {formatRelativeTime(property.listing.listedDate)}
          </span>
          <span className="text-blue-600 font-medium">
            Click para ver detalles
          </span>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;