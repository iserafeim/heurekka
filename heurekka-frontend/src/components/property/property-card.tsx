'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PropertyCardProps } from '@/types/homepage'


export function PropertyCard({ 
  property, 
  isFavorited = false, 
  onFavorite, 
  onContact,
  className 
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const formatPrice = (price: { amount: number; currency: string; period: string }) => {
    const formatter = new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    
    return `${formatter.format(price.amount)}/mes`
  }


  const primaryImage = property.images?.[0]

  return (
    <Card 
      className={cn(
        "group overflow-hidden border-0 bg-white shadow-sm",
        "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
        "h-[360px] md:h-[380px] p-0 gap-0 rounded-xl",
        className
      )}
      aria-label={`Propiedad: ${property.title}`}
    >
      {/* Image like reference - rectangular, not square */}
      <div className="relative aspect-[4/3] bg-neutral-100">
        {primaryImage && !imageError ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || property.title}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <span className="text-neutral-400">Sin imagen</span>
          </div>
        )}
        
        {/* Favorite button top-right like reference */}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white/95 backdrop-blur-sm rounded-full"
            onClick={onFavorite}
            aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-neutral-600"
              )} 
            />
          </Button>
        </div>

        {/* Price tag bottom-left - blue theme */}
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded text-base font-bold shadow-md">
          {formatPrice(property.price)}
        </div>

        {/* Special badges for amenities - using shadcn badge */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-slate-600 text-white hover:bg-slate-700 capitalize">
              {property.amenities[0]}
            </Badge>
          </div>
        )}

        {/* Brand/Badge like MARIS in reference */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-white text-primary font-bold border-primary/20">
            HEUREKKA
          </Badge>
        </div>
      </div>

      {/* Content section - compact for carousel */}
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
        {/* Property details - inline format with status badge */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs text-neutral-700 font-medium">
            {property.bedrooms} hab | {property.bathrooms} baños | {property.size.value}m²
          </span>
          <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50">
            Activo
          </Badge>
        </div>

        {/* Address - truncated */}
        <div className="flex-1">
          <div className="text-sm text-neutral-800 font-semibold truncate">
            {property.address.street}
          </div>
          
          <div className="text-xs text-neutral-600 truncate">
            {property.address.neighborhood}, {property.address.city}
          </div>
        </div>

        {/* Real estate info - expanded like Zillow */}
        <div className="text-xs text-neutral-500 mt-2">
          <div className="truncate">MLS ID #{property.id}, HEUREKKA REALTY, {property.landlord.name}</div>
        </div>
      </CardContent>
    </Card>
  )
}