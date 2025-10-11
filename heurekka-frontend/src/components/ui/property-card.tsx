'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Heart, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Property as HomepageProperty } from '@/types/homepage'
import type { Property } from '@/types/property'

// Unified props interface that supports both property formats and all functionality
interface UnifiedPropertyCardProps {
  // Core property data (supports both formats)
  property: Property | HomepageProperty;

  // Visual variants
  variant?: 'default' | 'compact' | 'large';
  viewMode?: 'grid' | 'list';

  // Functionality
  isFavorited?: boolean;
  isFavorite?: boolean; // Alias for property discovery compatibility
  isHovered?: boolean;
  onFavorite?: (() => void) | ((propertyId: string) => void);
  onClick?: (property?: Property) => void;
  onHover?: (id: string | null) => void;

  // Customization
  className?: string;
  locale?: 'es' | 'en';
}

/**
 * Unified PropertyCard component that works across the entire application
 * Uses homepage PropertyCard as the foundation design authority
 * Supports all functionality from both homepage and property-discovery components
 */
export function PropertyCard({
  property,
  variant = 'default',
  viewMode = 'grid',
  isFavorited = false,
  isFavorite = false, // Alias for property discovery
  isHovered = false,
  onFavorite,
  onClick,
  onHover,
  className,
  locale = 'es'
}: UnifiedPropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [retryCount, setRetryCount] = useState(0)

  // Determine the actual favorited state (supports both prop names)
  const actualIsFavorited = isFavorited || isFavorite;

  // Reset image states when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
    setImageLoading(true);
    setFailedImages(new Set());
    setRetryCount(0);
  }, [property.id]);

  // Check if this is a Property Discovery property
  const isPropertyDiscoveryFormat = (prop: any): prop is Property => {
    return prop && typeof prop.price === 'number' && !prop.images?.[0]?.url;
  };

  // Get property type label in Spanish
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

  // Utility function to ensure image URL is properly formatted with fallbacks
  const ensureValidImageUrl = (url: string, withFallback: boolean = true): string => {
    if (!url || url.trim() === '') {
      return withFallback ? getDefaultImageUrl() : '';
    }

    // If it's already a complete URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's just a photo ID, convert to full Unsplash URL
    if (url.startsWith('photo-')) {
      const cleanId = url.replace(/^photo-/, '');
      return `https://images.unsplash.com/photo-${cleanId}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80`;
    }

    // If it's some other format, return as-is (might be a relative URL)
    return url;
  };

  // Get a default image URL for fallback
  const getDefaultImageUrl = (): string => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };

  // Find next working image index
  const findNextWorkingImage = (startIndex: number): number => {
    const totalImages = normalizedProperty.images?.length || 0;
    if (totalImages === 0) return -1;

    for (let i = 0; i < totalImages; i++) {
      const nextIndex = (startIndex + i) % totalImages;
      if (!failedImages.has(nextIndex)) {
        return nextIndex;
      }
    }
    return -1; // All images failed
  };

  // Data transformation to normalize Property Discovery format to Homepage format
  const normalizeProperty = useCallback((property: Property | HomepageProperty): HomepageProperty => {
    // If already homepage format, ensure URLs are valid
    if ('images' in property && Array.isArray(property.images) && property.images[0]?.url) {
      const homepageProperty = property as HomepageProperty;
      return {
        ...homepageProperty,
        images: homepageProperty.images.map(img => ({
          ...img,
          url: ensureValidImageUrl(img.url),
          thumbnailUrl: ensureValidImageUrl(img.thumbnailUrl || img.url)
        }))
      };
    }

    // Transform Property Discovery format to Homepage format
    const discoveryProperty = property as Property;
    return {
      id: discoveryProperty.id,
      title: `${getPropertyTypeLabel(discoveryProperty.propertyType)} en ${discoveryProperty.neighborhood}`,
      description: discoveryProperty.description || '',
      type: discoveryProperty.propertyType as 'apartment' | 'house' | 'room' | 'commercial',
      address: {
        street: discoveryProperty.address || 'Sin dirección',
        neighborhood: discoveryProperty.neighborhood,
        city: discoveryProperty.city,
        state: 'Francisco Morazán',
        country: 'Honduras',
        postalCode: ''
      },
      coordinates: discoveryProperty.coordinates,
      price: {
        amount: discoveryProperty.price,
        currency: 'HNL',
        period: 'month'
      },
      size: {
        value: discoveryProperty.area,
        unit: 'm2'
      },
      bedrooms: discoveryProperty.bedrooms,
      bathrooms: discoveryProperty.bathrooms,
      amenities: discoveryProperty.amenities || [],
      images: discoveryProperty.images?.map((img, index) => ({
        id: `${discoveryProperty.id}-${index}`,
        url: ensureValidImageUrl(img),
        thumbnailUrl: ensureValidImageUrl(img),
        alt: `${getPropertyTypeLabel(discoveryProperty.propertyType)} - ${discoveryProperty.neighborhood}`,
        width: 400,
        height: 300,
        order: index
      })) || [],
      virtualTour: (discoveryProperty as any).virtualTourUrl,
      availableFrom: new Date(),
      createdAt: new Date(discoveryProperty.listing?.listedDate || Date.now()),
      updatedAt: new Date(),
      viewCount: discoveryProperty.stats?.views || 0,
      saveCount: discoveryProperty.stats?.favorites || 0,
      responseTime: 60,
      verificationStatus: 'verified',
      landlord: {
        id: discoveryProperty.landlord.id,
        name: discoveryProperty.landlord.name,
        rating: 4.8,
        responseRate: 95,
        whatsappEnabled: true
      }
    };
  }, []);

  // Format price to match homepage style
  const formatPrice = (price: { amount: number; currency: string; period: string } | number) => {
    // Handle both number and object formats
    const amount = typeof price === 'number' ? price : price.amount;
    const currency = typeof price === 'number' ? 'HNL' : price.currency;

    const formatter = new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    return formatter.format(amount)
  }

  // Get responsive card height based on variant and view mode
  const getCardHeight = (variant: string, viewMode: string) => {
    if (viewMode === 'list') {
      return 'h-[450px]'; // Desktop full list (4 columns) - increased for better spacing
    }

    switch (variant) {
      case 'compact':
        return 'h-[360px]'; // Compact variant - increased for better spacing
      case 'large':
        return 'h-[470px]'; // Large variant - increased for better spacing
      case 'default':
      default:
        return 'h-[430px] md:h-[410px] lg:h-[430px]'; // Responsive default - increased for better spacing
    }
  };

  // Normalize property data
  const normalizedProperty = normalizeProperty(property);

  // Event handlers for Property Discovery compatibility
  const handleMouseEnter = useCallback(() => {
    if (onHover) {
      onHover(normalizedProperty.id);
    }
  }, [onHover, normalizedProperty.id]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      // If it's Property Discovery format, pass the original property
      if (isPropertyDiscoveryFormat(property)) {
        onClick(property as Property);
      } else {
        onClick();
      }
    }
  }, [onClick, property]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      // Support both callback signatures
      if (typeof onFavorite === 'function' && onFavorite.length === 0) {
        // Homepage signature: () => void
        (onFavorite as () => void)();
      } else {
        // Property Discovery signature: (propertyId: string) => void
        (onFavorite as (propertyId: string) => void)(normalizedProperty.id);
      }
    }
  }, [onFavorite, normalizedProperty.id]);

  const currentImage = normalizedProperty.images?.[currentImageIndex] || normalizedProperty.images?.[0];
  const hasMultipleImages = normalizedProperty.images && normalizedProperty.images.length > 1;

  // Image navigation functions
  const goToPrevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    // Reset image states when changing images
    setImageError(false);
    setImageLoading(true);
    setCurrentImageIndex(prev =>
      prev > 0 ? prev - 1 : (normalizedProperty.images?.length || 1) - 1
    );
  }, [hasMultipleImages, normalizedProperty.images?.length]);

  const goToNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    // Reset image states when changing images
    setImageError(false);
    setImageLoading(true);
    setCurrentImageIndex(prev =>
      prev < (normalizedProperty.images?.length || 1) - 1 ? prev + 1 : 0
    );
  }, [hasMultipleImages, normalizedProperty.images?.length]);

  const goToImage = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Reset image states when changing images
    setImageError(false);
    setImageLoading(true);
    setCurrentImageIndex(index);
  }, []);

  // Determine if card should be clickable
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 shadow-sm font-sans",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300",
        getCardHeight(variant, viewMode),
        "p-0 gap-0 rounded-xl",
        isClickable && "cursor-pointer",
        "bg-white",
        className
      )}
      aria-label={`Propiedad: ${normalizedProperty.title}`}
      onClick={isClickable ? handleCardClick : undefined}
      onMouseEnter={onHover ? handleMouseEnter : undefined}
      onMouseLeave={onHover ? handleMouseLeave : undefined}
    >
      {/* Image section - rectangular 3:2 aspect ratio */}
      <div className="relative aspect-[3/2] bg-neutral-100">
        {currentImage && currentImage.url && currentImage.url.trim() !== '' && !imageError ? (
          <>
            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            <Image
              src={currentImage.url}
              alt={currentImage.alt || normalizedProperty.title}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              quality={75}
              onLoad={() => {
                setImageLoading(false)
                setImageError(false)
              }}
              onError={() => {
                console.warn(`Image failed to load: ${currentImage?.url} for property: ${normalizedProperty.title}`)
                setImageLoading(false)

                // Mark current image as failed
                setFailedImages(prev => new Set([...prev, currentImageIndex]))

                // Try to find next working image
                const nextWorkingIndex = findNextWorkingImage(currentImageIndex + 1)

                if (nextWorkingIndex !== -1 && retryCount < 3) {
                  console.log(`Trying next working image (${nextWorkingIndex}) for property: ${normalizedProperty.title}`)
                  setCurrentImageIndex(nextWorkingIndex)
                  setImageError(false)
                  setImageLoading(true)
                  setRetryCount(prev => prev + 1)
                } else {
                  // All images failed or too many retries, show error state
                  console.log(`All images failed or max retries reached for property: ${normalizedProperty.title}`)
                  setImageError(true)
                }
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {imageLoading ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">Sin imagen</span>
              </div>
            )}
          </div>
        )}

        {/* Favorite button top-right */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-0 bg-transparent hover:bg-transparent border-0 cursor-pointer outline-none"
          aria-label={actualIsFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Bookmark
            className={cn(
              "w-8 h-8 transition-all duration-200 stroke-2 drop-shadow-lg",
              actualIsFavorited
                ? "fill-blue-500 stroke-white text-white"
                : "fill-white/20 stroke-white text-white hover:fill-white/40"
            )}
          />
        </button>

        {/* Image navigation buttons - only show if multiple images */}
        {hasMultipleImages && (
          <>
            {/* Previous button */}
            <button
              onClick={goToPrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next button */}
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image position indicators (dots) */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {normalizedProperty.images?.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentImageIndex
                    ? "bg-white shadow-lg"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}


        {/* Amenity badge top-left */}
        {normalizedProperty.amenities && normalizedProperty.amenities.length > 0 && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white text-gray-700 hover:bg-gray-50 capitalize px-3 py-1 font-medium shadow-sm border-0">
              {normalizedProperty.amenities[0]}
            </Badge>
          </div>
        )}

        {/* Brand badge bottom-right */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-white text-primary font-bold border-primary/20">
            HEUREKKA
          </Badge>
        </div>

      </div>

      {/* Content section - following Zillow schema */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        {/* Verified badge - only for verified properties */}
        {normalizedProperty.verificationStatus === 'verified' && (
          <div className="mb-2">
            <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50">
              Verificado
            </Badge>
          </div>
        )}

        {/* Price */}
        <div className="mb-2">
          <div className="text-xl font-bold text-black">
            {formatPrice(normalizedProperty.price)}
          </div>
        </div>

        {/* Property details line with pipe separators */}
        <div className="mb-2">
          <span className="text-sm text-neutral-600">
            {normalizedProperty.bedrooms} hab | {normalizedProperty.bathrooms} baños | {normalizedProperty.size.value}m² - {getPropertyTypeLabel(normalizedProperty.type)}
          </span>
        </div>

        {/* Location - neighborhood and city only */}
        <div className="flex-1">
          <div className="text-sm text-black font-semibold truncate">
            {normalizedProperty.address.neighborhood ?
              `${normalizedProperty.address.neighborhood}, Tegucigalpa` :
              'Tegucigalpa'}
          </div>
        </div>

        {/* Real estate info at bottom */}
        <div className="text-xs text-neutral-500 mt-2">
          <div className="truncate">HEUREKKA REALTY, {normalizedProperty.landlord.name}</div>
        </div>

      </CardContent>
    </Card>
  )
}