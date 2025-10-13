/**
 * Dashboard Tab Configuration Utility
 * Handles role-aware tab visibility for unified dashboard
 */

import { LucideIcon, Search, BookmarkIcon, MessageSquare, Settings, Inbox, BarChart } from 'lucide-react';

export type UserRole = 'tenant-only' | 'landlord-only' | 'dual-context';

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  role: 'tenant' | 'landlord' | 'shared';
  badge?: number;
}

/**
 * Tenant-specific tabs
 */
const TENANT_TABS: TabConfig[] = [
  {
    id: 'saved-searches',
    label: 'Búsquedas Guardadas',
    icon: Search,
    role: 'tenant',
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: BookmarkIcon,
    role: 'tenant',
  },
  {
    id: 'conversations',
    label: 'Conversaciones',
    icon: MessageSquare,
    role: 'tenant',
  },
];

/**
 * Landlord-specific tabs
 */
const LANDLORD_TABS: TabConfig[] = [
  {
    id: 'leads',
    label: 'Leads',
    icon: Inbox,
    role: 'landlord',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart,
    role: 'landlord',
  },
];

/**
 * Shared tabs (profile)
 */
const SHARED_TABS: TabConfig[] = [
  {
    id: 'profile',
    label: 'Mi Perfil',
    icon: Settings,
    role: 'shared',
  },
];

/**
 * Get tabs based on user role
 */
export function getTabsForRole(role: UserRole, stats?: Record<string, number>): TabConfig[] {
  let tabs: TabConfig[] = [];

  switch (role) {
    case 'tenant-only':
      tabs = [...TENANT_TABS, ...SHARED_TABS];
      break;
    case 'landlord-only':
      tabs = [...LANDLORD_TABS, ...SHARED_TABS];
      break;
    case 'dual-context':
      tabs = [...LANDLORD_TABS, ...TENANT_TABS, ...SHARED_TABS];
      break;
    default:
      tabs = [...SHARED_TABS];
  }

  // Add badge counts if provided
  if (stats) {
    tabs = tabs.map(tab => ({
      ...tab,
      badge: stats[tab.id] || undefined,
    }));
  }

  return tabs;
}

/**
 * Get default tab based on user role
 */
export function getDefaultTab(role: UserRole): string {
  switch (role) {
    case 'landlord-only':
    case 'dual-context':
      return 'leads';
    case 'tenant-only':
      return 'saved-searches';
    default:
      return 'profile';
  }
}

/**
 * Check if user has landlord capabilities
 */
export function hasLandlordAccess(role: UserRole): boolean {
  return role === 'landlord-only' || role === 'dual-context';
}

/**
 * Check if user has tenant capabilities
 */
export function hasTenantAccess(role: UserRole): boolean {
  return role === 'tenant-only' || role === 'dual-context';
}

/**
 * Check if role should show separator (dual-context users)
 */
export function shouldShowRoleSeparator(role: UserRole): boolean {
  return role === 'dual-context';
}
