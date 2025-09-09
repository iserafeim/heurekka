'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PropertyCardProps } from '@/types/homepage'

// WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role="img"
      aria-label="WhatsApp"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
    </svg>
  )
}


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

  const handleWhatsAppContact = () => {
    if (!property.landlord.whatsappEnabled) return
    
    const message = encodeURIComponent(
      `Hola, me interesa la propiedad "${property.title}" (ID: ${property.id}). ¿Podrías darme más información?`
    )
    
    // This would use the landlord's WhatsApp number from the backend
    const whatsappUrl = `https://wa.me/?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    
    onContact?.()
  }

  const primaryImage = property.images?.[0]

  return (
    <article 
      className={cn(
        "group bg-white border border-border rounded-lg overflow-hidden shadow-sm",
        "hover:shadow-md transition-all duration-200",
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

        {/* Price tag bottom-left like reference */}
        <div className="absolute bottom-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
          {formatPrice(property.price)}
        </div>

        {/* Brand/Badge like MARIS in reference */}
        <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded text-xs font-medium text-primary">
          HEUREKKA
        </div>
      </div>

      {/* Content section like reference */}
      <div className="p-4 space-y-2">
        {/* Property details like reference */}
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms} hab
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms} baños
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            {property.size.value}m²
          </span>
          <span className="text-green-600 font-medium">Activo</span>
        </div>

        {/* Address like reference */}
        <div className="text-sm text-neutral-800 font-medium">
          {property.address.street}
        </div>
        
        <div className="text-sm text-neutral-600">
          {property.address.neighborhood}, {property.address.city}
        </div>

        {/* Real estate info like reference */}
        <div className="text-xs text-neutral-500 pt-1">
          MLS #{property.id} - {property.landlord.name}
        </div>
      </div>
    </article>
  )
}