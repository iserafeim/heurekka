'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { PropertyDetails, Property, SPANISH_TEXT } from '@/types/property';
import { validatePhoneNumber, sanitizeText } from '@/lib/security/validation';

interface PropertyDetailModalProps {
  isOpen: boolean;
  property: PropertyDetails | Property | null;
  loading: boolean;
  onClose: () => void;
  locale?: 'es' | 'en';
}

/**
 * PropertyDetailModal component with gallery and WhatsApp contact
 * Full-featured modal for property details
 */
export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  property,
  loading,
  onClose,
  locale = 'es'
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryFullscreen, setGalleryFullscreen] = useState(false);
  const [timeInModal, setTimeInModal] = useState(0);
  const [imagesViewed, setImagesViewed] = useState(new Set<number>());
  
  const modalRef = useRef<HTMLDivElement>(null);
  const timeStartRef = useRef<number>(Date.now());

  // Track time in modal
  useEffect(() => {
    if (isOpen) {
      timeStartRef.current = Date.now();
      const interval = setInterval(() => {
        setTimeInModal(Date.now() - timeStartRef.current);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setActiveImageIndex(0);
      setImagesViewed(new Set());
      setTimeInModal(0);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigateGallery(-1);
          break;
        case 'ArrowRight':
          navigateGallery(1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeImageIndex, property]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, loading]);

  // Navigate gallery
  const navigateGallery = useCallback((direction: number) => {
    if (!property?.images?.length) return;
    
    const newIndex = activeImageIndex + direction;
    if (newIndex >= 0 && newIndex < property.images.length) {
      setActiveImageIndex(newIndex);
      setImagesViewed(prev => new Set([...prev, newIndex]));
    }
  }, [activeImageIndex, property?.images?.length]);

  // Handle WhatsApp contact
  const handleWhatsAppClick = useCallback(() => {
    if (!property) return;

    // Get and validate phone number
    const phoneNumber = property.contactPhone || property.landlord?.phone || '50400000000';
    
    if (!validatePhoneNumber(phoneNumber)) {
      console.error('Invalid phone number format:', phoneNumber);
      alert('Número de teléfono inválido. Por favor contacte al administrador.');
      return;
    }

    // Track conversion with full context
    const contactData = {
      property_id: property.id,
      price: property.price,
      location: property.neighborhood,
      time_in_modal: timeInModal,
      images_viewed: imagesViewed.size,
      contact_method: 'whatsapp'
    };

    // Generate rich WhatsApp message in Spanish with sanitized content
    const sanitizedAddress = sanitizeText(property.address || `${property.neighborhood}, ${property.city}`);
    const sanitizedType = sanitizeText(getPropertyTypeLabel(property.propertyType));
    
    const message = `Hola! Vi esta propiedad en Heurekka:

📍 ${sanitizedAddress}
💰 ${formatCurrency(property.price)}/mes
🏠 ${sanitizedType}
🛏️ ${property.bedrooms} habitaciones
🚿 ${property.bathrooms} baños
📐 ${property.area} m²

¿Podría darme más información o agendar una visita?

Gracias!`;

    // Create safe WhatsApp URL
    try {
      const cleanPhone = phoneNumber.replace(/[-\s().+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      // Validate URL length (WhatsApp has URL limits)
      if (whatsappUrl.length > 2000) {
        console.warn('WhatsApp URL too long, using simplified message');
        const simpleMessage = `Hola! Estoy interesado en esta propiedad en Heurekka: ${sanitizedAddress} - ${formatCurrency(property.price)}/mes`;
        const simpleUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(simpleMessage)}`;
        window.open(simpleUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      
      // TODO: Track analytics event
      console.log('WhatsApp contact initiated:', contactData);
      
    } catch (error) {
      console.error('Error creating WhatsApp URL:', error);
      alert('Error al abrir WhatsApp. Por favor intente de nuevo.');
    }
  }, [property, timeInModal, imagesViewed.size]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get property type label
  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Apartamento';
      case 'house': return 'Casa';
      case 'room': return 'Habitación';
      case 'office': return 'Oficina';
      default: return type;
    }
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="property-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="property-detail-modal bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">
            {property?.address || `${property?.neighborhood}, ${property?.city}` || 'Detalles de la propiedad'}
          </h2>
          <button 
            className="modal-close p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando detalles de la propiedad...</p>
              </div>
            </div>
          ) : property ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Gallery Section */}
              <div className="gallery-section">
                {property.images && property.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main image */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={property.images[activeImageIndex]}
                        alt={`${getPropertyTypeLabel(property.propertyType)} - Imagen ${activeImageIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                      
                      {/* Navigation arrows */}
                      {property.images.length > 1 && (
                        <>
                          <button
                            onClick={() => navigateGallery(-1)}
                            disabled={activeImageIndex === 0}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            aria-label="Imagen anterior"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => navigateGallery(1)}
                            disabled={activeImageIndex === property.images.length - 1}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            aria-label="Siguiente imagen"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Image counter */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {activeImageIndex + 1} / {property.images.length}
                      </div>
                    </div>
                    
                    {/* Thumbnail strip */}
                    {property.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {property.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setActiveImageIndex(index);
                              setImagesViewed(prev => new Set([...prev, index]));
                            }}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              index === activeImageIndex
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            aria-label={`Ver imagen ${index + 1}`}
                          >
                            <Image
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Information Section */}
              <div className="info-section space-y-6">
                {/* Price and basic info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(property.price)}
                    <span className="text-lg font-normal text-gray-600">/mes</span>
                  </div>
                  <div className="text-lg text-gray-700 mb-4">
                    {getPropertyTypeLabel(property.propertyType)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.neighborhood}, {property.city}
                  </div>
                </div>

                {/* Property specs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Habitaciones</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Baños</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Amenidades
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {property.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Descripción
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* WhatsApp Contact Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Contactar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Error state
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">No se pudieron cargar los detalles de la propiedad</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;