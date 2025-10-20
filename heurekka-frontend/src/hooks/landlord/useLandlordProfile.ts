/**
 * Landlord Profile Hooks
 * Custom hooks para manejar el perfil de landlord usando tRPC
 */

import { trpc } from '@/lib/trpc/react';
import type { LandlordType, LandlordFormData } from '@/types/landlord';

/**
 * Hook para obtener el perfil actual del landlord
 * No muestra error si el usuario no tiene perfil de landlord
 */
export function useLandlordProfile() {
  return trpc.landlordProfile.getCurrent.useQuery(undefined, {
    retry: false, // Don't retry if profile doesn't exist
    staleTime: 0, // Always fetch fresh - important for role detection after onboarding
    refetchOnMount: true, // Always refetch on mount
    // Don't log errors to console - expected for tenant-only users
    useErrorBoundary: false,
    onError: () => {
      // Silently handle error - this is expected for tenant-only users
    }
  });
}

/**
 * Hook para verificar si existe un perfil de landlord
 */
export function useLandlordProfileExists() {
  return trpc.landlordProfile.exists.useQuery(undefined, {
    retry: 1,
  });
}

/**
 * Hook para crear un perfil de landlord
 */
export function useCreateLandlordProfile() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.create.useMutation({
    onSuccess: () => {
      // Invalidar queries relacionadas
      utils.landlordProfile.getCurrent.invalidate();
      utils.landlordProfile.exists.invalidate();
    },
  });
}

/**
 * Hook para actualizar el perfil de landlord
 */
export function useUpdateLandlordProfile() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.update.useMutation({
    onSuccess: () => {
      utils.landlordProfile.getCurrent.invalidate();
    },
    // Optimistic update opcional
    onMutate: async (newData) => {
      await utils.landlordProfile.getCurrent.cancel();
      const previousData = utils.landlordProfile.getCurrent.getData();

      utils.landlordProfile.getCurrent.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, ...newData };
      });

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        utils.landlordProfile.getCurrent.setData(undefined, context.previousData);
      }
    },
  });
}

/**
 * Hook para eliminar perfil de landlord
 */
export function useDeleteLandlordProfile() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.delete.useMutation({
    onSuccess: () => {
      utils.landlordProfile.invalidate();
    },
  });
}

/**
 * Hook para subir foto de perfil
 */
export function useUploadProfilePhoto() {
  const utils = trpc.useContext();

  return trpc.landlordProfile.uploadProfilePhoto.useMutation({
    onSuccess: () => {
      utils.landlordProfile.getCurrent.invalidate();
    },
  });
}

/**
 * Hook para obtener estadísticas del portfolio
 */
export function usePortfolioStats() {
  return trpc.landlordProfile.getPortfolioStats.useQuery(undefined, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener conteo de propiedades
 */
export function usePropertiesCount() {
  return trpc.landlordProfile.getPropertiesCount.useQuery(undefined, {
    retry: 1,
  });
}
