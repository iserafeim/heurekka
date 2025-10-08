/**
 * Tenant Dashboard Hooks
 * Custom hooks para manejar el dashboard de tenant usando tRPC
 */

import { trpc } from '@/lib/trpc/client';

/**
 * Hook para obtener todos los datos del dashboard
 * (profile, searches, favorites, stats, conversations)
 */
export function useTenantDashboard() {
  return trpc.tenantDashboard.getData.useQuery(undefined, {
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener solo las estadísticas rápidas del dashboard
 */
export function useDashboardStats() {
  return trpc.tenantDashboard.getStats.useQuery(undefined, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener el historial de conversaciones
 */
export function useConversations() {
  return trpc.tenantDashboard.getConversations.useQuery(undefined, {
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener propiedades vistas recientemente
 */
export function useRecentlyViewed() {
  return trpc.tenantDashboard.getRecentlyViewed.useQuery(undefined, {
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
