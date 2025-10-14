/**
 * Landlord Analytics Hook
 * Fetches and manages dashboard analytics with simplified, actionable metrics
 */

import { trpc } from '@/lib/trpc/client';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PropertyPerformance {
  propertyId: string;
  name: string;
  location: string;
  views: number;
  leads: number;
  contactRate: number;
}

export interface LeadsTrendData {
  date: string;
  leads: number;
  views: number;
}

export interface AnalyticsMetrics {
  totalLeads: number;
  newLeads: number; // Leads with status 'new' (unread)
  totalViews: number; // Total property views
  contactRate: number; // (totalLeads / totalViews) * 100
  propertiesPerformance: PropertyPerformance[];
  leadsTrend: LeadsTrendData[]; // Leads by date for the last 30 days
}

export function useLandlordAnalytics(dateRange?: DateRange) {
  const { data, isLoading, error, refetch } = trpc.landlordDashboard.getAnalytics.useQuery(
    {
      dateRange,
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 2,
    }
  );

  const metrics: AnalyticsMetrics | null = data?.data || null;

  return {
    metrics,
    isLoading,
    error,
    refetch,
    // Convenience accessors
    totalLeads: metrics?.totalLeads || 0,
    newLeads: metrics?.newLeads || 0,
    totalViews: metrics?.totalViews || 0,
    contactRate: metrics?.contactRate || 0,
    propertiesPerformance: metrics?.propertiesPerformance || [],
    leadsTrend: metrics?.leadsTrend || [],
  };
}
