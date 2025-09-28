'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { PropertyDetails, Property, SPANISH_TEXT } from '@/types/property';
import { validatePhoneNumber, sanitizeText } from '@/lib/security/validation';
import { PropertyMiniMap } from './PropertyMiniMap';
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
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [swipeProgress, setSwipeProgress] = useState(0);

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

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Get improved icon and label for amenity - More descriptive icons
  const getAmenityInfo = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();

    if (amenityLower.includes('parking') || amenityLower.includes('estacionamiento')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        ),
        label: 'Estacionamiento'
      };
    }

    if (amenityLower.includes('air') || amenityLower.includes('aire') || amenityLower.includes('conditioning')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.59 3.41L5 5l5.5 5.5L9 12l1.5 1.5L16 8l-1.41-1.41L12 9.17 6.59 3.41zM17 6.25l1.41 1.41L16.84 9.23C18.61 10.89 20 13.28 20 16c0 2.76-2.24 5-5 5h-2v2h-2v-2H9c-2.76 0-5-2.24-5-5 0-2.72 1.39-5.11 3.16-6.77L5.59 7.66L4 6.25l2-2L17 6.25zm-2 4.84c-1.22 0-2.44.52-3.29 1.46L11 13.29c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.71-.71C13.56 13.52 14.22 13.25 15 13.25s1.44.27 1.88.74l.71.71c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.71-.74C17.44 11.61 16.22 11.09 15 11.09z"/>
          </svg>
        ),
        label: 'Aire Acondicionado'
      };
    }

    if (amenityLower.includes('security') || amenityLower.includes('seguridad')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.8C8,12.2 8.6,11.6 9.2,11.6V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
          </svg>
        ),
        label: 'Seguridad'
      };
    }

    if (amenityLower.includes('reception') || amenityLower.includes('recepción') || amenityLower.includes('reception_area')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M20,16H4V8H20V16M6,10V14H8V10H6M10,10V14H14V10H10M16,10V14H18V10H16Z"/>
          </svg>
        ),
        label: 'Área de Recepción'
      };
    }

    if (amenityLower.includes('pool') || amenityLower.includes('piscina')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2,15C3.67,15.17 4.33,16.83 6,17C7.67,16.83 8.33,15.17 10,15C11.67,15.17 12.33,16.83 14,17C15.67,16.83 16.33,15.17 18,15C19.67,15.17 20.33,16.83 22,17V19C20.33,18.83 19.67,17.17 18,17C16.33,17.17 15.67,18.83 14,19C12.33,18.83 11.67,17.17 10,17C8.33,17.17 7.67,18.83 6,19C4.33,18.83 3.67,17.17 2,17V15M18,8A2,2 0 0,1 16,10A2,2 0 0,1 14,8C14,7.45 14.22,6.95 14.59,6.59L16.42,4.76C17,4.95 17.55,5.19 18.08,5.5C18.03,5.83 18,6.15 18,6.5V8M6,18A2,2 0 0,1 4,16A2,2 0 0,1 6,14A2,2 0 0,1 8,16A2,2 0 0,1 6,18Z"/>
          </svg>
        ),
        label: 'Piscina'
      };
    }

    if (amenityLower.includes('gym') || amenityLower.includes('gimnasio') || amenityLower.includes('fitness')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.57,14.86L22,13.43L20.57,12L17,15.57L8.43,7L12,3.43L10.57,2L9.14,3.43L7.71,2L5.57,4.14L4.14,2.71L2.71,4.14L4.14,5.57L2,7.71L3.43,9.14L5.57,7L14.14,15.57L10.57,19.14L12,20.57L13.43,19.14L14.86,20.57L17,18.43L18.43,19.86L19.86,18.43L18.43,17L20.57,14.86Z"/>
          </svg>
        ),
        label: 'Gimnasio'
      };
    }

    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,21L15.6,17.42C14.63,16.44 13.38,15.9 12,15.9C10.62,15.9 9.37,16.44 8.4,17.42L12,21M12,3C7.95,3 4.21,4.34 1.2,6.6L3,8.4C5.5,6.82 8.62,6 12,6C15.38,6 18.5,6.82 21,8.4L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.2C8.1,12.29 9.97,11.85 12,11.85C14.03,11.85 15.9,12.29 17.4,13.2L19.2,11.4C17.19,9.89 14.7,9 12,9Z"/>
          </svg>
        ),
        label: 'WiFi'
      };
    }

    if (amenityLower.includes('elevator') || amenityLower.includes('ascensor')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7,2H17A2,2 0 0,1 19,4V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V4A2,2 0 0,1 7,2M7,4V20H17V4H7M8,6H16V8H8V6M12,9L15,12H13V15H11V12H9L12,9Z"/>
          </svg>
        ),
        label: 'Ascensor'
      };
    }

    if (amenityLower.includes('balcony') || amenityLower.includes('balcón')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10,10V15H8V10H10M16,10V15H14V10H16M22,8V10H20V17H22V19H2V17H4V10H2V8H22Z"/>
          </svg>
        ),
        label: 'Balcón'
      };
    }

    if (amenityLower.includes('garden') || amenityLower.includes('jardín') || amenityLower.includes('jardin')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C10,20 12,18 12,16C12,13 10,12 9,12C8,12 8,11 8,10C8,8 9,8 10,8C12,8 14,9 16,11C20,6.68 17.5,5 17,8Z"/>
          </svg>
        ),
        label: 'Jardín'
      };
    }

    if (amenityLower.includes('laundry') || amenityLower.includes('lavandería')) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18,2.01L6,2C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V4C20,2.89 19.11,2.01 18,2.01M18,20H6V4H18V20M7,6A1,1 0 0,0 8,7A1,1 0 0,0 9,6A1,1 0 0,0 8,5A1,1 0 0,0 7,6M10.5,6A1,1 0 0,0 11.5,7A1,1 0 0,0 12.5,6A1,1 0 0,0 11.5,5A1,1 0 0,0 10.5,6M12,19A6,6 0 0,1 6,13A6,6 0 0,1 12,7A6,6 0 0,1 18,13A6,6 0 0,1 12,19M12,17A4,4 0 0,0 16,13A4,4 0 0,0 12,9A4,4 0 0,0 8,13A4,4 0 0,0 12,17Z"/>
          </svg>
        ),
        label: 'Lavandería'
      };
    }

    // Default icon for unlisted amenities
    return {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
        </svg>
      ),
      label: amenity
    };
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle touch events for mobile swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isMobile) return;

    const deltaY = e.touches[0].clientY - touchStart.y;
    const deltaX = e.touches[0].clientX - touchStart.x;

    // Pull-to-dismiss (vertical swipe down from header)
    if (deltaY > 0 && Math.abs(deltaX) < Math.abs(deltaY)) {
      setSwipeProgress(Math.min(deltaY / 200, 1));
      if (deltaY > 150) {
        onClose();
      }
    }

    // Image gallery swipe (horizontal)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        navigateGallery(-1); // Swipe right = previous
      } else {
        navigateGallery(1); // Swipe left = next
      }
    }
  };

  const handleTouchEnd = () => {
    setSwipeProgress(0);
  };

  // Add touch event listeners for mobile
  useEffect(() => {
    if (!isMobile || !modalRef.current) return;

    const modal = modalRef.current;
    modal.addEventListener('touchstart', handleTouchStart as any);
    modal.addEventListener('touchmove', handleTouchMove as any);
    modal.addEventListener('touchend', handleTouchEnd);

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart as any);
      modal.removeEventListener('touchmove', handleTouchMove as any);
      modal.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, touchStart, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.propertyModalOverlay} property-modal-overlay fixed inset-0 z-50 font-sans`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`${styles.propertyModal} ${isMobile ? styles.mobileModal : ''} property-modal bg-white w-full max-w-[1400px] h-[95vh] mx-auto my-[2.5vh] overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        style={isMobile ? { transform: `translateY(${swipeProgress * 50}px)` } : {}}
      >
        {/* Modal Header - Responsive */}
        {isMobile ? (
          /* Mobile Header - Sticky */
          <div className={`${styles.mobileHeader} flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10`}>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Volver"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 id="modal-title" className="text-base font-semibold text-gray-900 truncate flex-1 text-center px-4">
              Detalles de propiedad
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Desktop Header */
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
        )}

        {/* Modal Body - Scrollable */}
        <div className={`flex flex-col flex-1 overflow-y-auto ${isMobile ? styles.mobileContent : ''}`}>
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
              {/* Image Section - Mobile vs Desktop */}
              {isMobile ? (
                /* Mobile Hero Image + Horizontal Thumbnails */
                <div className={`${styles.mobileHeroSection}`}>
                  {property.images && property.images.length > 0 && property.images[0] && (
                    (typeof property.images[0] === 'string' ? property.images[0].trim() !== '' :
                     ((property.images[0] as any).url && (property.images[0] as any).url.trim() !== ''))
                  ) ? (
                    <>
                      {/* Hero Image - Full Width */}
                      <div className="relative w-full h-60 bg-black">
                        <Image
                          src={typeof property.images[activeImageIndex] === 'string'
                            ? property.images[activeImageIndex] || ''
                            : property.images[activeImageIndex]?.url || ''}
                          alt={typeof property.images[activeImageIndex] === 'string'
                            ? `${getPropertyTypeLabel(property.propertyType)} - Imagen ${activeImageIndex + 1}`
                            : property.images[activeImageIndex]?.alt || `${getPropertyTypeLabel(property.propertyType)} - Imagen ${activeImageIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="100vw"
                          priority
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                          {activeImageIndex + 1} / {property.images.length}
                        </div>
                      </div>

                      {/* Horizontal Thumbnail Strip + Swipe Dots */}
                      <div className={`${styles.mobileThumbnailSection} px-4 py-3 bg-white border-b border-gray-100`}>
                        {/* Horizontal Scrolling Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {property.images.filter(img => img && (
                            typeof img === 'string' ? img.trim() !== '' : ((img as any).url && (img as any).url.trim() !== '')
                          )).slice(0, 4).map((image, index) => (
                            <div
                              key={index}
                              className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden cursor-pointer transition-all ${
                                index === activeImageIndex ? 'border-blue-500' : 'border-gray-200'
                              }`}
                              onClick={() => {
                                setActiveImageIndex(index);
                                setImagesViewed(prev => new Set([...prev, index]));
                              }}
                            >
                              <Image
                                src={typeof image === 'string' ? image : (image as any)?.url || ''}
                                alt={`Thumbnail ${index + 1}`}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}

                          {/* +X más button if more than 4 images */}
                          {property.images.length > 4 && (
                            <button
                              onClick={() => setGalleryFullscreen(true)}
                              className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              +{property.images.length - 4}
                            </button>
                          )}
                        </div>

                        {/* Swipe Dots Indicator */}
                        <div className="flex justify-center gap-1 mt-2">
                          {property.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setActiveImageIndex(index);
                                setImagesViewed(prev => new Set([...prev, index]));
                              }}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === activeImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                              aria-label={`Ir a imagen ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 h-60">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop Zillow-Style Image Grid */
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
              )}

              {isMobile ? (
                <>
                {/* Mobile Content */}
                <div className={`${styles.mobileContentGrid} px-4 pb-20`}>
                  {/* Green Status Badge */}
                  <div className="py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      EN RENTA
                    </span>
                  </div>

                  {/* Large Price Display */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(property.price)}
                    </div>

                    {/* Inline Compact Stats */}
                    <div className="text-base text-gray-600 mb-3">
                      {property.bedrooms > 0 ? `${property.bedrooms} hab` : '0 hab'} • {property.bathrooms} baño{property.bathrooms !== 1 ? 's' : ''} • {property.area} m²
                    </div>

                    {/* Address */}
                    <div className="text-sm text-gray-600">
                      {property.address || `${property.neighborhood}, ${property.city}`}
                    </div>
                  </div>

                  {/* Mobile Amenities Grid (2×2) */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Comodidades</h4>
                      <div className={`${styles.mobileAmenitiesGrid} grid grid-cols-2 gap-3 mb-3`}>
                        {property.amenities.slice(0, amenitiesExpanded ? undefined : 4).map((amenity, index) => {
                          const amenityInfo = getAmenityInfo(amenity);
                          return (
                            <div key={index} className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors duration-200 min-h-[64px] justify-center text-center">
                              <div className="w-8 h-8 text-blue-600 mb-2">
                                {amenityInfo.icon}
                              </div>
                              <span className="text-xs font-medium text-gray-900 leading-tight">{amenityInfo.label}</span>
                            </div>
                          );
                        })}
                      </div>
                      {property.amenities.length > 4 && (
                        <button
                          onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                        >
                          {amenitiesExpanded ? 'Ver menos' : `Ver más (${property.amenities.length - 4} más)`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {property.description && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h4>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        {descriptionExpanded ? property.description : `${property.description.slice(0, 150)}${property.description.length > 150 ? '...' : ''}`}
                      </p>
                      {property.description.length > 150 && (
                        <button
                          onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {descriptionExpanded ? 'Leer menos' : 'Leer más'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mobile Map Section */}
                  <div className={`${styles.mobileMapSection} mb-6`}>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h4>
                    <div className="h-40 bg-gray-100 rounded-lg overflow-hidden">
                      {property.coordinates &&
                       typeof property.coordinates.lat === 'number' &&
                       typeof property.coordinates.lng === 'number' &&
                       !isNaN(property.coordinates.lat) &&
                       !isNaN(property.coordinates.lng) &&
                       property.coordinates.lat >= -90 && property.coordinates.lat <= 90 &&
                       property.coordinates.lng >= -180 && property.coordinates.lng <= 180 ? (
                        <PropertyMiniMap
                          coordinates={property.coordinates}
                          address={property.address || `${property.neighborhood}, ${property.city}`}
                          height="160px"
                          className="w-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-xs text-gray-500">{property.neighborhood}, {property.city}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${property.neighborhood}, ${property.city}`)}`,'_blank')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      Ver en mapa completo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
                </>
              ) : (
                <>
                {/* Desktop Split Content Section */}
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

                      {/* Amenities - Improved Design */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Comodidades incluidas</h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {property.amenities.slice(0, amenitiesExpanded ? undefined : 6).map((amenity, index) => {
                              const amenityInfo = getAmenityInfo(amenity);
                              return (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 border border-gray-100">
                                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    {amenityInfo.icon}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{amenityInfo.label}</span>
                                </div>
                              );
                            })}
                          </div>
                          {property.amenities.length > 6 && (
                            <button
                              onClick={() => setAmenitiesExpanded(!amenitiesExpanded)}
                              className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                            >
                              {amenitiesExpanded ? (
                                <>
                                  Ver menos
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  Ver todas las comodidades ({property.amenities.length})
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
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

                    {/* Mini Map Component */}
                    <div className="mt-4">
                      {property.coordinates &&
                       typeof property.coordinates.lat === 'number' &&
                       typeof property.coordinates.lng === 'number' &&
                       !isNaN(property.coordinates.lat) &&
                       !isNaN(property.coordinates.lng) &&
                       property.coordinates.lat >= -90 && property.coordinates.lat <= 90 &&
                       property.coordinates.lng >= -180 && property.coordinates.lng <= 180 ? (
                        <PropertyMiniMap
                          coordinates={property.coordinates}
                          address={property.address || `${property.neighborhood}, ${property.city}`}
                          height="240px"
                          className="w-full shadow-sm"
                        />
                      ) : (
                        // Fallback for missing coordinates
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-60">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm text-gray-500 mb-1">Mapa no disponible</p>
                            <p className="text-xs text-gray-400">{property.neighborhood}, {property.city}</p>
                            <button
                              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${property.neighborhood}, ${property.city}`)}`)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Ver en Google Maps
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Neighborhood Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium text-gray-900">Área</span>
                      </div>
                      <p className="text-sm text-gray-700">{property.neighborhood}, {property.city}</p>
                      {property.area && (
                        <p className="text-xs text-gray-500 mt-1">Superficie: {property.area} m²</p>
                      )}
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
                </>
              )}

              {/* Mobile Sticky Bottom CTA - Shows only on mobile */}
              {isMobile ? (
                <div className={`${styles.mobileStickyCTA} fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20 shadow-lg`}>
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 min-h-[56px]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Contactar ahora
                  </button>
                </div>
              ) : (
                <>
                {/* Desktop/Tablet Contact Section - Shows below content on non-mobile */}
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
              )}
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