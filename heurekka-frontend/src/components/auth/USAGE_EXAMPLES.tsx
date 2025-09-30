/**
 * Usage Examples for Authentication Components
 *
 * This file contains example implementations showing how to integrate
 * the authentication flows into different parts of the application.
 */

'use client';

import React, { useState } from 'react';
import { TenantAuthFlow, LandlordAuthFlow } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// =============================================================================
// Example 1: Property Card with Contact Button (Tenant Intent)
// =============================================================================

export function PropertyCardWithAuth({ property }: { property: any }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleContactClick = () => {
    // Check if user is already authenticated
    // If not, show auth modal
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // After successful authentication and profile creation,
    // generate WhatsApp message and redirect
    generateWhatsAppMessage(property);
  };

  const generateWhatsAppMessage = (property: any) => {
    // This will be implemented as part of WhatsApp integration
    const message = `Hola! Vi su propiedad en HEUREKKA...`;
    const phone = property.landlordPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/504${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="property-card">
      {/* Property details... */}

      <Button
        variant="primary"
        onClick={handleContactClick}
        className="w-full"
      >
        Contactar Propietario
      </Button>

      <TenantAuthFlow
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        propertyId={property.id}
        propertyDetails={{
          title: property.title,
          price: property.price,
          location: property.location,
          landlordPhone: property.landlordPhone
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

// =============================================================================
// Example 2: Header with "Publicar Propiedad" Button (Landlord Intent)
// =============================================================================

export function HeaderWithPublishButton() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handlePublishClick = () => {
    // Check if user is already authenticated and has landlord profile
    // If not, show auth modal
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // After successful authentication and profile creation,
    // redirect to property listing wizard
    router.push('/listing/create');
  };

  return (
    <header className="header">
      {/* Logo and navigation... */}

      <Button
        variant="primary"
        onClick={handlePublishClick}
      >
        Publicar Propiedad
      </Button>

      <LandlordAuthFlow
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
}

// =============================================================================
// Example 3: With Authentication State Check
// =============================================================================

export function SmartAuthButton() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const checkTenantProfile = async () => {
    const result = await trpc.tenantProfile.exists.query();
    return result.data.exists;
  };

  const handleContactProperty = async (property: any) => {
    // If not authenticated, show auth modal
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // If authenticated but no tenant profile, show profile creation
    const hasTenantProfile = await checkTenantProfile();
    if (!hasTenantProfile) {
      setShowAuthModal(true);
      return;
    }

    // If authenticated with profile, go directly to WhatsApp
    generateWhatsAppMessage(property);
  };

  return (
    <>
      <Button onClick={() => handleContactProperty(property)}>
        Contactar
      </Button>

      {showAuthModal && (
        <TenantAuthFlow
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          propertyId={property.id}
          propertyDetails={property}
          onSuccess={() => generateWhatsAppMessage(property)}
        />
      )}
    </>
  );
}

// =============================================================================
// Example 4: Multiple Properties Contact (Bulk Action)
// =============================================================================

export function SavedPropertiesList({ properties }: { properties: any[] }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const handleContactAll = () => {
    if (selectedProperties.length === 0) return;

    // Show auth modal if not authenticated
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // Generate WhatsApp messages for all selected properties
    selectedProperties.forEach((propertyId) => {
      const property = properties.find((p) => p.id === propertyId);
      if (property) {
        setTimeout(() => {
          generateWhatsAppMessage(property);
        }, 1000); // Stagger messages
      }
    });
  };

  return (
    <div>
      {/* Property list with checkboxes... */}

      <Button
        onClick={handleContactAll}
        disabled={selectedProperties.length === 0}
      >
        Contactar Todos ({selectedProperties.length})
      </Button>

      <TenantAuthFlow
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

// =============================================================================
// Example 5: Auth Modal with Custom Property Context
// =============================================================================

export function PropertyDetailPageWithAuth({ property }: { property: any }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="property-detail">
      {/* Property images and details... */}

      <div className="sticky-cta">
        <Button
          variant="whatsapp"
          size="lg"
          onClick={() => setShowAuthModal(true)}
          className="w-full"
        >
          <WhatsAppIcon className="mr-2" />
          Contactar por WhatsApp
        </Button>
      </div>

      <TenantAuthFlow
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        propertyId={property.id}
        propertyDetails={{
          title: property.title,
          price: property.price,
          location: `${property.neighborhood}, ${property.city}`,
          landlordPhone: property.landlordPhone
        }}
        onSuccess={() => {
          // Custom success handler
          console.log('Profile created, generating message...');
          generateWhatsAppMessage(property);
        }}
      />
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

import { useAuthStore } from '@/lib/stores/auth';
import { trpc } from '@/lib/trpc/client';

function generateWhatsAppMessage(property: any) {
  // Get tenant profile
  const profile = getUserTenantProfile();

  const message = `
Hola! 👋 Vi su propiedad en HEUREKKA

🏠 *Propiedad*: ${property.title}
📍 *Ubicación*: ${property.location}
💰 *Precio*: L.${property.price.toLocaleString()}/mes

*Mi perfil de inquilino:*
👤 *Nombre*: ${profile?.fullName}
💼 *Ocupación*: ${profile?.occupation}
💰 *Presupuesto*: L.${profile?.budgetMin} - L.${profile?.budgetMax}
📅 *Fecha mudanza*: ${profile?.moveDate}
👥 *Ocupantes*: ${profile?.occupants}

Me gustaría programar una visita. ¿Cuándo sería posible?

_Perfil verificado por HEUREKKA_
  `.trim();

  const phone = property.landlordPhone.replace(/\D/g, '');
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);

  const whatsappUrl = isMobile
    ? `whatsapp://send?phone=504${phone}&text=${encodeURIComponent(message)}`
    : `https://wa.me/504${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
}

function getUserTenantProfile() {
  // This should fetch from your state management or API
  // Return mock data for example
  return {
    fullName: 'María García',
    occupation: 'Ingeniera en Sistemas',
    budgetMin: 10000,
    budgetMax: 20000,
    moveDate: '2025-02-01',
    occupants: '2 adultos'
  };
}

// =============================================================================
// Example 6: Landlord Type-Specific Dashboard Redirect
// =============================================================================

export function LandlordDashboardRouter() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleAuthSuccess = async () => {
    // Check landlord type and redirect to appropriate dashboard
    const profile = await trpc.landlordProfile.getCurrent.query();

    switch (profile.data.landlordType) {
      case 'individual_owner':
        router.push('/dashboard/owner');
        break;
      case 'real_estate_agent':
        router.push('/dashboard/agent');
        break;
      case 'property_company':
        router.push('/dashboard/company');
        break;
    }
  };

  return (
    <>
      <Button onClick={() => setShowAuthModal(true)}>
        Acceder al Dashboard
      </Button>

      <LandlordAuthFlow
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}