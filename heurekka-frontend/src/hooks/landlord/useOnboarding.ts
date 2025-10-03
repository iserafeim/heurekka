/**
 * Onboarding Hooks
 * Custom hooks para manejar el flujo de onboarding
 */

import { trpc } from '@/lib/trpc/react';
import type { LandlordFormData } from '@/types/landlord';

/**
 * Hook para guardar progreso del onboarding
 */
export function useSaveOnboardingProgress() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.saveOnboardingProgress.useMutation({
    onSuccess: () => {
      utils.landlordProfile.getOnboardingProgress.invalidate();
    },
  });
}

/**
 * Hook para obtener progreso del onboarding
 */
export function useOnboardingProgress() {
  return trpc.landlordProfile.getOnboardingProgress.useQuery(undefined, {
    retry: false,
    staleTime: 60 * 1000, // 1 minuto
    refetchOnWindowFocus: false,
    // Permitir que la query falle silenciosamente si no hay perfil
    useErrorBoundary: false,
  });
}

/**
 * Hook para completar onboarding
 */
export function useCompleteOnboarding() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.completeOnboarding.useMutation({
    onSuccess: () => {
      // Invalidar todo el cache del perfil
      utils.landlordProfile.invalidate();
    },
  });
}
