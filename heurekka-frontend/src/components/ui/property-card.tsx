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

  // Determine the actual favorited state (supports both prop names)
  const actualIsFavorited = isFavorited || isFavorite;

  // Reset image states when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
    setImageLoading(true);
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

  // Utility function to ensure image URL is properly formatted
  const ensureValidImageUrl = (url: string): string => {
    if (!url || url.trim() === '') return '';

    // If it's already a complete URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's just a photo ID, convert to full Unsplash URL
    if (url.startsWith('photo-')) {
      const cleanId = url.replace(/^photo-/, '');
      return `https://images.unsplash.com/photo-${cleanId}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80`;
    }

    // If it's some other format, return as-is (might be a relative URL)
    return url;
  };

  // Data transformation to normalize Property Discovery format to Homepage format
  const normalizeProperty = (property: Property | HomepageProperty): HomepageProperty => {
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
  };

  // Format price to match homepage style
  const formatPrice = (price: { amount: number; currency: string; period: string }) => {
    const formatter = new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    return formatter.format(price.amount)
  }

  // Get responsive card height based on variant and view mode
  const getCardHeight = (variant: string, viewMode: string) => {
    if (viewMode === 'list') {
      return 'h-[420px]'; // Desktop full list (4 columns) - increased for verified badge
    }

    switch (variant) {
      case 'compact':
        return 'h-[340px]'; // Compact variant - increased for verified badge
      case 'large':
        return 'h-[440px]'; // Large variant - increased for verified badge
      case 'default':
      default:
        return 'h-[400px] md:h-[380px] lg:h-[400px]'; // Responsive default - increased for verified badge
    }
  };

  // Event handlers for Property Discovery compatibility
  const handleMouseEnter = useCallback(() => {
    if (onHover) {
      onHover(normalizedProperty.id);
    }
  }, [onHover, property]);

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
  }, [onFavorite, property]);

  // Normalize property data
  const normalizedProperty = normalizeProperty(property);
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
            onLoad={() => {
              setImageLoading(false)
              setImageError(false)
            }}
            onError={() => {
              console.warn(`Image failed to load: ${currentImage?.url} for property: ${normalizedProperty.title}`)
              setImageError(true)
              setImageLoading(false)

              // Enhanced fallback logic: try to find a working image
              const totalImages = normalizedProperty.images?.length || 0;

              // If we have multiple images, try the next one
              if (totalImages > 1 && currentImageIndex < totalImages - 1) {
                console.log(`Trying next image (${currentImageIndex + 1}) for property: ${normalizedProperty.title}`)
                setCurrentImageIndex(prev => prev + 1)
                setImageError(false) // Reset error state to try loading next image
                setImageLoading(true)
              }
              // If current image fails and it's not the first image, fallback to first image
              else if (currentImageIndex > 0) {
                console.log(`Falling back to first image for property: ${normalizedProperty.title}`)
                setCurrentImageIndex(0)
                setImageError(false) // Reset error state to try loading first image
                setImageLoading(true)
              }
              // If all else fails, the error state remains and "Sin imagen" will be shown
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <span className="text-neutral-400">Sin imagen</span>
          </div>
        )}

        {/* Favorite button top-right */}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-transparent hover:bg-transparent border-0 ring-0 outline-none"
            onClick={handleFavoriteClick}
            aria-label={actualIsFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Bookmark
              className={cn(
                "h-6 w-6 transition-colors stroke-2 stroke-white",
                actualIsFavorited ? "fill-blue-500 text-white" : "text-white"
              )}
            />
          </Button>
        </div>

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
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
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
            {normalizedProperty.address.neighborhood}, Tegucigalpa
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