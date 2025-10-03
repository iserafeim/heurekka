/**
 * Verification Hooks
 * Custom hooks para manejar verificaciones de landlord
 */

import { trpc } from '@/lib/trpc/react';

/**
 * Hook para obtener estado de verificación
 */
export function useVerificationStatus() {
  return trpc.landlordProfile.getVerificationStatus.useQuery(undefined, {
    retry: 1,
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para solicitar verificación de teléfono
 */
export function useRequestPhoneVerification() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.requestPhoneVerification.useMutation({
    onSuccess: () => {
      utils.landlordProfile.getVerificationStatus.invalidate();
    },
  });
}

/**
 * Hook para verificar código de teléfono
 */
export function useVerifyPhone() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.verifyPhone.useMutation({
    onSuccess: () => {
      // Invalidar verificación y badges
      utils.landlordProfile.getVerificationStatus.invalidate();
      utils.landlordProfile.getBadges.invalidate();
      utils.landlordProfile.getCurrent.invalidate();
    },
  });
}

/**
 * Hook para solicitar verificación de email
 */
export function useRequestEmailVerification() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.requestEmailVerification.useMutation({
    onSuccess: () => {
      utils.landlordProfile.getVerificationStatus.invalidate();
    },
  });
}

/**
 * Hook para verificar token de email
 */
export function useVerifyEmail() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.verifyEmail.useMutation({
    onSuccess: () => {
      // Invalidar verificación y badges
      utils.landlordProfile.getVerificationStatus.invalidate();
      utils.landlordProfile.getBadges.invalidate();
      utils.landlordProfile.getCurrent.invalidate();
    },
  });
}
