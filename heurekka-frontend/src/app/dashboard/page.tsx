/**
 * Unified Dashboard Page
 * Serves both tenants and landlords through tab-based navigation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useLandlordProfile } from '@/hooks/landlord/useLandlordProfile';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { TenantHeader } from '@/components/tenant/TenantHeader';
import { LeadsTab } from '@/components/landlord/LeadsTab';
import { AnalyticsTab } from '@/components/landlord/AnalyticsTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDefaultTab, UserRole } from '@/lib/dashboard-tabs';

// Import tenant tab components
import { SavedSearchesTab } from '@/components/tenant/tabs/SavedSearchesTab';
import { FavoritesTab } from '@/components/tenant/tabs/FavoritesTab';
import { ConversationsTab } from '@/components/tenant/tabs/ConversationsTab';

export default function UnifiedDashboardPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Fetch both profiles, don't let errors block the UI
  const { data: landlordData, isLoading: landlordLoading, error: landlordError } = useLandlordProfile();
  const { data: dashboardData, isLoading: tenantLoading, error: tenantError } = useTenantDashboard();

  // Determine user role from actual backend data
  const userRole: UserRole = React.useMemo(() => {
    const hasTenantProfile = !!dashboardData?.data?.profile;
    // CRITICAL FIX: Check for actual landlord profile AND no error
    // If there's an error, it means the user doesn't have a landlord profile
    const hasLandlordProfile = !landlordError && !!landlordData?.data && landlordData.data !== null;

    if (hasTenantProfile && hasLandlordProfile) return 'dual-context';
    if (hasLandlordProfile) return 'landlord-only';
    if (hasTenantProfile) return 'tenant-only';

    // If loading, wait
    if (tenantLoading || landlordLoading) return 'tenant-only';

    // If landlord query errored but we have tenant profile, user is tenant-only
    if (landlordError && hasTenantProfile) return 'tenant-only';

    // If tenant query errored but we have landlord profile, user is landlord-only
    if (tenantError && hasLandlordProfile) return 'landlord-only';

    // If no profiles found after loading, default to tenant
    return 'tenant-only';
  }, [dashboardData, landlordData, tenantLoading, landlordLoading, tenantError, landlordError]);

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

  // Update active tab when user role changes (after data loads)
  useEffect(() => {
    if (!tabFromUrl && !isLoading) {
      const defaultTab = getDefaultTab(userRole);
      setActiveTab(defaultTab);
    }
  }, [userRole, isLoading, tabFromUrl]);

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

  // Get user name and email from appropriate profile
  const userName =
    landlordData?.data?.fullName ||
    landlordData?.data?.companyName ||
    dashboardData?.data?.profile?.fullName ||
    'Usuario';

  const userEmail =
    landlordData?.data?.email ||
    landlordData?.data?.phone ||
    dashboardData?.data?.profile?.phone ||
    '';

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

              {/* Tenant Tabs */}
              {activeTab === 'saved-searches' && <SavedSearchesTab />}
              {activeTab === 'favorites' && <FavoritesTab />}
              {activeTab === 'conversations' && <ConversationsTab />}

              {/* Shared Profile Tab */}
              {activeTab === 'profile' && <ProfileTab userRole={userRole} />}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
