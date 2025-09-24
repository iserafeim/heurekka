'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { PropertyDetails, Property, SPANISH_TEXT } from '@/types/property';
import { validatePhoneNumber, sanitizeText } from '@/lib/security/validation';
import styles from './PropertyDetailModal.module.css';

interface PropertyDetailModalProps {
  isOpen: boolean;
  property: PropertyDetails | Property | null;
  loading: boolean;
  onClose: () => void;
  locale?: 'es' | 'en';
}

/**
 * PropertyDetailModal component with Zillow-style gallery and sticky action bar
 * Features hero image gallery at top, 75/25 split content layout below
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
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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
      setAmenitiesExpanded(false);
      setDescriptionExpanded(false);
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
      const cleanPhone = phoneNumber.replace(/[-\\s().+]/g, '');
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

  // Get icon for amenity
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();

    if (amenityLower.includes('parking') || amenityLower.includes('estacionamiento')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7h3m-3 3h3m-3 3h3m-10 3H5a2 2 0 01-2-2V9a2 2 0 012-2h4m6 8h2a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
        </svg>
      );
    }

    if (amenityLower.includes('air') || amenityLower.includes('aire') || amenityLower.includes('conditioning')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (amenityLower.includes('security') || amenityLower.includes('seguridad')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }

    if (amenityLower.includes('pool') || amenityLower.includes('piscina')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }

    if (amenityLower.includes('gym') || amenityLower.includes('gimnasio') || amenityLower.includes('fitness')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }

    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      );
    }

    if (amenityLower.includes('elevator') || amenityLower.includes('ascensor')) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    // Default icon for unlisted amenities
    return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
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
      className={`${styles.propertyModalOverlay} property-modal-overlay fixed inset-0 z-50`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`${styles.propertyModal} property-modal bg-white w-full max-w-[1400px] h-[95vh] mx-auto my-[2.5vh] overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 lg:p-6 border-b border-gray-200 bg-white">
          <h2 id="modal-title" className="text-lg lg:text-xl font-bold text-gray-900 truncate">
            {property?.address || `${property?.neighborhood}, ${property?.city}` || 'Detalles de la propiedad'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Fullscreen toggle for desktop */}
            <button
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setGalleryFullscreen(!isGalleryFullscreen)}
              aria-label="Ver galería completa"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando detalles de la propiedad...</p>
              </div>
            </div>
          ) : property ? (
            <>
              {/* Zillow-Style Image Grid Section */}
              <div className={`${styles.imageGridContainer} image-grid-container p-2`}>
                {property.images && property.images.length > 0 && property.images[0] && (
                  (typeof property.images[0] === 'string' ? property.images[0].trim() !== '' :
                   ((property.images[0] as any).url && (property.images[0] as any).url.trim() !== ''))
                ) ? (
                  <div className={`${styles.imageGrid} image-grid grid grid-cols-12 gap-2 lg:gap-6`}>
                    {/* Main Image - Left Side (60% - 7 columns) */}
                    <div className={`${styles.mainImageContainer} main-image-container col-span-12 lg:col-span-7 relative`}>
                      <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer group">
                        <Image
                          src={typeof property.images[activeImageIndex] === 'string'
                            ? property.images[activeImageIndex] || ''
                            : property.images[activeImageIndex]?.url || ''}
                          alt={typeof property.images[activeImageIndex] === 'string'
                            ? `${getPropertyTypeLabel(property.propertyType)} - Imagen ${activeImageIndex + 1}`
                            : property.images[activeImageIndex]?.alt || `${getPropertyTypeLabel(property.propertyType)} - Imagen ${activeImageIndex + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          priority
                          onClick={() => setGalleryFullscreen(true)}
                        />

                        {/* Image Navigation Controls */}
                        {property.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateGallery(-1);
                              }}
                              disabled={activeImageIndex === 0}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                              aria-label="Imagen anterior"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateGallery(1);
                              }}
                              disabled={activeImageIndex === property.images.length - 1}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                              aria-label="Siguiente imagen"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {activeImageIndex + 1} / {property.images.length}
                        </div>
                      </div>
                    </div>

                    {/* Grid Images - Right Side (40% - 5 columns) */}
                    <div className={`${styles.gridImagesContainer} grid-images-container col-span-12 lg:col-span-5 grid grid-cols-2 gap-2`}>
                      {property.images.filter(img => img && (
                        typeof img === 'string' ? img.trim() !== '' : ((img as any).url && (img as any).url.trim() !== '')
                      )).slice(1, 5).map((image, index) => {
                        const imageIndex = index + 1;
                        return (
                          <div
                            key={imageIndex}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => {
                              setActiveImageIndex(imageIndex);
                              setImagesViewed(prev => new Set([...prev, imageIndex]));
                            }}
                          >
                            <Image
                              src={typeof image === 'string' ? image : (image as any)?.url || ''}
                              alt={typeof image === 'string' ? `Imagen ${imageIndex + 1}` : (image as any)?.alt || `Imagen ${imageIndex + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 1024px) 50vw, 20vw"
                            />
                            {imageIndex === activeImageIndex && (
                              <div className="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
                            )}
                          </div>
                        );
                      })}

                      {/* "Ver todas las fotos" button in bottom-right grid position */}
                      {property.images.length > 4 && (
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                          {property.images[4] && (
                            <Image
                              src={typeof property.images[4] === 'string' ? property.images[4] : (property.images[4] as any)?.url || ''}
                              alt="Ver más fotos"
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 50vw, 20vw"
                            />
                          )}
                          <button
                            onClick={() => setGalleryFullscreen(true)}
                            className="absolute inset-0 bg-black/60 hover:bg-black/70 flex flex-col items-center justify-center text-white text-sm font-medium transition-all duration-200"
                          >
                            <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ver todas las {property.images.length} fotos
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg h-80 lg:h-96">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Split Content Section - Desktop (1024px+) */}
              <div className={`${styles.modalContentSplit} modal-content-split`}>
                {/* Property Information Panel (Left - 75%) */}
                <div className={`${styles.propertyInfoPanel} property-info-panel flex-1 space-y-1`}>
                  {/* Property Header Container - Zillow Style for Rentals */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6  ">
                    {/* Rental Status Badge */}
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        EN RENTA
                      </span>
                    </div>

                    {/* Large Price */}
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">
                        {formatCurrency(property.price)}
                      </div>
                    </div>

                    {/* Compact Stats */}
                    <div className="text-lg text-gray-600 mb-4">
                      {property.bedrooms > 0 ? `${property.bedrooms} habitaciones` : 'Sin habitaciones'} • {property.bathrooms} baños • {property.area} m²
                    </div>

                    {/* Address */}
                    <div className="text-base text-gray-600">
                      {property.address || `${property.neighborhood}, ${property.city}`}
                    </div>
                  </div>

                  {/* Sobre esta propiedad Section - Combined Description and Amenities */}
                  {(property.description || (property.amenities && property.amenities.length > 0)) && (
                    <div className={`${styles.aboutPropertySection} bg-white border border-gray-200 rounded-lg p-6  `}>
                      <h3 className={`${styles.sectionTitle} section-title`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 11h8" />
                        </svg>
                        Sobre esta propiedad
                      </h3>

                      {/* Description */}
                      {property.description && (
                        <div className="mb-6">
                          <p className={`${styles.descriptionText} description-text`}>
                            {descriptionExpanded ? property.description : `${property.description.slice(0, 200)}${property.description.length > 200 ? '...' : ''}`}
                          </p>
                          {property.description.length > 200 && (
                            <button
                              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                              className={`${styles.expandButton} expand-button`}
                            >
                              {descriptionExpanded ? 'Leer menos' : 'Leer más'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Amenities */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {property.amenities.slice(0, amenitiesExpanded ? undefined : 6).map((amenity, index) => (
                              <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <div className="text-gray-600 mb-2">
                                  {getAmenityIcon(amenity)}
                                </div>
                                <span className="text-sm text-gray-800 font-medium text-center">{amenity}</span>
                              </div>
                            ))}
                          </div>
                          {property.amenities.length > 6 && (
                            <button
                              onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
                              className={`${styles.expandButton} expand-button mt-3`}
                            >
                              {amenitiesExpanded ? 'Ver menos' : `Ver todas las amenidades (${property.amenities.length})`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Map Section */}
                  <div className={`${styles.largeMapSection} large-map-section bg-white border border-gray-200 rounded-lg p-6  `}>
                    <h3 className={`${styles.sectionTitle} section-title`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ubicación y Área
                    </h3>
                    <div className={`${styles.interactiveMap} ${styles.miniMap} interactive-map mini-map`}>
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto  text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">Mapa interactivo</p>
                        <p className="text-xs text-gray-400">{property.neighborhood}, {property.city}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Sticky Contact Bar (Right - 25%) - Desktop Only */}
                <div className="hidden lg:block">
                  <div className={`${styles.stickyActionBar} sticky-action-bar`}>
                    {/* Primary WhatsApp Button - Blue Zillow Style */}
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-base"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Contactar por WhatsApp
                    </button>

                    {/* Secondary Call Button - White with Blue Border Zillow Style */}
                    <button
                      onClick={() => window.open(`tel:${property.contactPhone || '+50497041550'}`, '_self')}
                      className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-6 rounded-lg border-2 border-blue-600 transition-all duration-200 flex items-center justify-center gap-3 text-base"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Llamar ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Contact Section - Shows below content on mobile/tablet */}
              <div className="lg:hidden p-6 border-t border-gray-200 bg-white space-y-3">
                {/* Primary WhatsApp Button - Blue Zillow Style */}
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 "
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Contactar por WhatsApp
                </button>

                {/* Secondary Call Button - White with Blue Border Zillow Style */}
                <button
                  onClick={() => window.open(`tel:${property.contactPhone || '+50497041550'}`, '_self')}
                  className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-6 rounded-lg border-2 border-blue-600 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Llamar ahora
                </button>
              </div>
            </>
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