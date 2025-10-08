/**
 * Tenant Profile Hooks
 * Custom hooks para manejar el perfil de tenant usando tRPC
 */

import { trpc } from '@/lib/trpc/client';
import type { ProfileUpdateInput } from '@/types/tenant';

/**
 * Hook para obtener el perfil actual del tenant
 */
export function useTenantProfile() {
  return trpc.tenantProfile.getCurrent.useQuery(undefined, {
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para verificar si existe un perfil de tenant
 */
export function useTenantProfileExists() {
  return trpc.tenantProfile.exists.useQuery(undefined, {
    retry: 1,
  });
}

/**
 * Hook para crear un perfil de tenant
 */
export function useCreateTenantProfile() {
  const utils = trpc.useContext();

  return trpc.tenantProfile.create.useMutation({
    onSuccess: () => {
      // Invalidar queries relacionadas
      utils.tenantProfile.getCurrent.invalidate();
      utils.tenantProfile.exists.invalidate();
      utils.tenantProfile.getCompletionStatus.invalidate();
    },
  });
}

/**
 * Hook para actualizar el perfil de tenant
 */
export function useUpdateTenantProfile() {
  const utils = trpc.useContext();

  return trpc.tenantProfile.update.useMutation({
    onSuccess: () => {
      utils.tenantProfile.getCurrent.invalidate();
      utils.tenantProfile.getCompletionStatus.invalidate();
    },
    // Optimistic update
    onMutate: async (newData) => {
      await utils.tenantProfile.getCurrent.cancel();
      const previousData = utils.tenantProfile.getCurrent.getData();

      utils.tenantProfile.getCurrent.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, ...newData };
      });

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        utils.tenantProfile.getCurrent.setData(undefined, context.previousData);
      }
    },
  });
}

/**
 * Hook para eliminar perfil de tenant
 */
export function useDeleteTenantProfile() {
  const utils = trpc.useContext();

  return trpc.tenantProfile.delete.useMutation({
    onSuccess: () => {
      utils.tenantProfile.invalidate();
    },
  });
}

/**
 * Hook para obtener el estado de completitud del perfil
 */
export function useProfileCompletionStatus() {
  return trpc.tenantProfile.getCompletionStatus.useQuery(undefined, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para verificar si el tenant puede contactar propiedades
 */
export function useCanContact() {
  return trpc.tenantProfile.canContact.useQuery(undefined, {
    retry: 1,
    staleTime: 30 * 1000, // 30 segundos
  });
}
