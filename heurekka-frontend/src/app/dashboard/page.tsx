/**
 * Unified Dashboard Page
 * Serves both tenants and landlords through tab-based navigation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useLandlordProfile } from '@/hooks/landlord/useLandlordProfile';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { TenantHeader } from '@/components/tenant/TenantHeader';
import { LeadsTab } from '@/components/landlord/LeadsTab';
import { AnalyticsTab } from '@/components/landlord/AnalyticsTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDefaultTab, UserRole, hasLandlordAccess } from '@/lib/dashboard-tabs';

// Import existing tenant tab content
// Note: For this example, I'm creating placeholder imports
// In production, you'd refactor the existing tenant dashboard components
import dynamic from 'next/dynamic';

// Dynamically import tenant components to avoid circular dependencies
const SavedSearchesContent = dynamic(() => import('@/app/tenant/dashboard/page').then(mod => ({ default: () => null })), { ssr: false });

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const { data: dashboardData, isLoading: tenantLoading } = useTenantDashboard();
  const { data: landlordData, isLoading: landlordLoading } = useLandlordProfile();

  // Determine user role from actual backend data
  const userRole: UserRole = React.useMemo(() => {
    const hasTenantProfile = !!dashboardData?.data?.profile;
    const hasLandlordProfile = !!landlordData?.data;

    if (hasTenantProfile && hasLandlordProfile) return 'dual-context';
    if (hasLandlordProfile) return 'landlord-only';
    if (hasTenantProfile) return 'tenant-only';

    // Default to tenant-only if no profiles found yet
    return 'tenant-only';
  }, [dashboardData, landlordData]);

  const isLoading = tenantLoading || landlordLoading;

  // Set initial tab based on role and URL param
  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl || getDefaultTab(userRole)
  );

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Solo un momento</p>
        </div>
      </div>
    );
  }

  const userName = dashboardData?.data?.profile?.fullName || 'Usuario';
  const userEmail = dashboardData?.data?.profile?.phone || '';

  const getTabTitle = () => {
    const titles: Record<string, string> = {
      'leads': 'Leads',
      'analytics': 'Analytics',
      'saved-searches': 'Búsquedas Guardadas',
      'favorites': 'Favoritos',
      'conversations': 'Conversaciones',
      'profile': 'Mi Perfil',
    };
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar
        variant="inset"
        user={{
          name: userName,
          email: userEmail,
          avatar: undefined,
          role: userRole,
        }}
        stats={dashboardData?.data?.stats}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <SidebarInset>
        <TenantHeader title={getTabTitle()} />
        <div className="flex flex-1 flex-col bg-white rounded-b-xl">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">

              {/* Landlord Tabs */}
              {activeTab === 'leads' && <LeadsTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}

              {/* Tenant Tabs - Placeholder for migration */}
              {activeTab === 'saved-searches' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Búsquedas Guardadas
                  </h2>
                  <p className="text-gray-600">
                    Este contenido se migrará del dashboard de inquilino existente.
                  </p>
                  <button
                    onClick={() => router.push('/tenant/dashboard')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ir al Dashboard de Inquilino (temporal)
                  </button>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Favoritos
                  </h2>
                  <p className="text-gray-600">
                    Este contenido se migrará del dashboard de inquilino existente.
                  </p>
                  <button
                    onClick={() => router.push('/tenant/dashboard')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ir al Dashboard de Inquilino (temporal)
                  </button>
                </div>
              )}

              {activeTab === 'conversations' && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Conversaciones
                  </h2>
                  <p className="text-gray-600">
                    Este contenido se migrará del dashboard de inquilino existente.
                  </p>
                </div>
              )}

              {activeTab === 'profile' && <ProfileTab userRole={userRole} />}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
