/**
 * Landlord Analytics Hook
 * Fetches and manages dashboard analytics
 */

import { trpc } from '@/lib/trpc/client';

export interface DateRange {
  from: Date;
  to: Date;
}

export function useLandlordAnalytics(dateRange?: DateRange) {
  const { data, isLoading, error, refetch } = trpc.landlordDashboard.getAnalytics.useQuery(
    {
      dateRange,
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes (analytics don't change frequently)
      retry: 2,
    }
  );

  return {
    metrics: data?.data || null,
    isLoading,
    error,
    refetch,
    // Convenience accessors
    totalLeads: data?.data?.totalLeads || 0,
    newLeads: data?.data?.newLeads || 0,
    responseRate: data?.data?.responseRate || 0,
    avgResponseTime: data?.data?.avgResponseTimeMinutes || 0,
    conversionRate: data?.data?.conversionRate || 0,
    qualityDistribution: data?.data?.qualityDistribution || { high: 0, medium: 0, low: 0 },
    priorityDistribution: data?.data?.priorityDistribution || { high: 0, medium: 0, low: 0 },
    sourceDistribution: data?.data?.sourceDistribution || { direct: 0, marketplace: 0, search: 0, referral: 0 },
  };
}
