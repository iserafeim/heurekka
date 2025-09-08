'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Square, MessageCircle, Star, Clock, Eye } from 'lucide-react'
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

// Verification badge component
function VerificationBadge({ status, className }: { status: 'verified' | 'pending' | 'unverified', className?: string }) {
  if (status === 'unverified') return null

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
      status === 'verified' 
        ? "bg-green-100 text-green-700 border border-green-200" 
        : "bg-yellow-100 text-yellow-700 border border-yellow-200",
      className
    )}>
      <Star className="w-3 h-3" />
      {status === 'verified' ? 'Verificado' : 'En revisión'}
    </div>
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
    
    const periodMap = {
      month: '/mes',
      week: '/semana',
      day: '/día'
    }
    
    return `${formatter.format(price.amount)}${periodMap[price.period as keyof typeof periodMap] || ''}`
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `${hours}h`
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
        "group bg-white border border-border rounded-xl overflow-hidden shadow-sm",
        "hover:shadow-lg hover:-translate-y-1 transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50",
        className
      )}
      aria-label={`Propiedad: ${property.title}`}
    >
      {/* Image Gallery */}
      <div className="relative aspect-video bg-neutral-100">
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
            <div className="text-center text-neutral-400">
              <Image 
                src="/placeholder-property.svg" 
                alt="Sin imagen disponible" 
                width={64} 
                height={64}
                className="mx-auto mb-2 opacity-50"
              />
              <span className="text-sm">Sin imagen</span>
            </div>
          </div>
        )}
        
        {/* Image overlay elements */}
        <div className="absolute top-2 left-2">
          <VerificationBadge status={property.verificationStatus} />
        </div>
        
        <div className="absolute top-2 right-2 flex gap-2">
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white/95 backdrop-blur-sm"
            onClick={onFavorite}
            aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isFavorited}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-neutral-600"
              )} 
            />
          </Button>
        </div>

        {/* Image count indicator */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
            1/{property.images.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price & Property Type */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold text-primary">
              {formatPrice(property.price)}
            </p>
            <p className="text-sm text-neutral-600 capitalize">
              {property.type === 'apartment' ? 'Apartamento' : 
               property.type === 'house' ? 'Casa' : 
               property.type === 'room' ? 'Habitación' : 'Comercial'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Eye className="w-3 h-3" />
            {property.viewCount}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-neutral-900 line-clamp-2 leading-tight">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-neutral-600 text-sm">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {property.address.neighborhood}, {property.address.city}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-neutral-500 text-sm">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            {property.size.value}m²
          </span>
        </div>

        {/* Landlord Info */}
        <div className="flex items-center justify-between py-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
              {property.landlord.photo ? (
                <Image
                  src={property.landlord.photo}
                  alt={property.landlord.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-neutral-600">
                  {property.landlord.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {property.landlord.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {property.landlord.rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatResponseTime(property.responseTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <Button 
          variant="whatsapp"
          className="w-full"
          onClick={handleWhatsAppContact}
          disabled={!property.landlord.whatsappEnabled}
        >
          <WhatsAppIcon className="mr-2 h-4 w-4" />
          Contactar por WhatsApp
        </Button>
      </div>
    </article>
  )
}