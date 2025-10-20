/**
 * Landlord Profile Upgrade Page
 * Entry point for tenants who want to become landlords
 * Redirects to type selection with tenant data pre-filled
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantProfile } from '@/hooks/tenant/useTenantProfile';

export default function LandlordUpgradePage() {
  const router = useRouter();
  const { data: tenantProfile, isLoading } = useTenantProfile();

  useEffect(() => {
    console.log('🚀 Landlord Upgrade Page - Effect Running:', {
      isLoading,
      tenantProfile: tenantProfile, // Log entire response
      tenantProfileData: tenantProfile?.data, // Check if data is nested
      tenantProfileProfile: tenantProfile?.profile, // Check original path
      hasTenantProfile: !!tenantProfile?.profile,
    });

    if (!isLoading) {
      // Check both possible structures
      const profile = tenantProfile?.profile || tenantProfile?.data?.profile;

      console.log('🔍 Checking profile structure:', {
        hasDirectProfile: !!tenantProfile?.profile,
        hasNestedProfile: !!tenantProfile?.data?.profile,
        profile,
      });

      // If tenant profile exists, redirect to landlord type selection
      // The onboarding flow will detect and pre-fill tenant data
      if (profile) {
        console.log('✅ Tenant profile found, setting up upgrade flow');

        // Store flag to indicate this is an upgrade flow
        sessionStorage.setItem('landlord_upgrade_from_tenant', 'true');

        // Store tenant data for pre-filling landlord form
        const tenantData = {
          fullName: profile.fullName,
          phone: profile.phone,
          email: profile.user?.email || tenantProfile?.data?.email || '',
        };

        console.log('💾 Storing tenant data:', tenantData);
        sessionStorage.setItem('tenant_profile_data', JSON.stringify(tenantData));

        console.log('➡️  Redirecting to /landlord/onboarding/type');
        router.push('/landlord/onboarding/type');
      } else {
        console.log('⚠️  No tenant profile, redirecting to regular onboarding');
        // If no tenant profile, redirect to regular onboarding
        router.push('/landlord/onboarding/welcome');
      }
    }
  }, [tenantProfile, isLoading, router]);

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
        <p className="text-lg font-medium text-gray-900">Preparando tu perfil de arrendador...</p>
        <p className="text-sm text-gray-500 mt-2">
          {isLoading ? 'Cargando tu información...' : 'Redirigiendo...'}
        </p>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && tenantProfile?.profile && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-600">Nombre: {tenantProfile.profile.fullName}</p>
            <p className="text-xs text-gray-600">Teléfono: {tenantProfile.profile.phone}</p>
            <p className="text-xs text-gray-600">Email: {tenantProfile.profile.user?.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
