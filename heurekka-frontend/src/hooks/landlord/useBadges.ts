/**
 * Badges Hooks
 * Custom hooks para manejar el sistema de badges del landlord
 */

import { trpc } from '@/lib/trpc/react';

/**
 * Hook para obtener badges ganados
 */
export function useBadges() {
  return trpc.landlordProfile.getBadges.useQuery(undefined, {
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener todos los badges disponibles
 * (muestra tanto ganados como no ganados)
 */
export function useAvailableBadges() {
  return trpc.landlordProfile.getAvailableBadges.useQuery(undefined, {
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutos - los badges disponibles no cambian frecuentemente
  });
}
