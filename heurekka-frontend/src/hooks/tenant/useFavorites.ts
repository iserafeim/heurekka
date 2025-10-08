/**
 * Favorites Hooks
 * Custom hooks para manejar las propiedades favoritas usando tRPC
 */

import { trpc } from '@/lib/trpc/client';

/**
 * Hook para listar todas las propiedades favoritas del usuario
 */
export function useFavorites() {
  return trpc.favorite.list.useQuery(undefined, {
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para verificar si una propiedad es favorita
 */
export function useIsFavorite(propertyId: string) {
  return trpc.favorite.isFavorite.useQuery(
    { propertyId },
    {
      retry: 1,
      enabled: !!propertyId,
      staleTime: 60 * 1000, // 1 minuto
    }
  );
}

/**
 * Hook para añadir una propiedad a favoritos
 */
export function useAddFavorite() {
  const utils = trpc.useContext();

  return trpc.favorite.add.useMutation({
    onSuccess: () => {
      utils.favorite.list.invalidate();
      utils.favorite.summary.invalidate();
      utils.tenantDashboard.getData.invalidate();
    },
  });
}

/**
 * Hook para quitar una propiedad de favoritos
 */
export function useRemoveFavorite() {
  const utils = trpc.useContext();

  return trpc.favorite.remove.useMutation({
    onSuccess: () => {
      utils.favorite.list.invalidate();
      utils.favorite.summary.invalidate();
      utils.tenantDashboard.getData.invalidate();
    },
  });
}

/**
 * Hook para toggle favorito (add si no existe, remove si existe)
 */
export function useToggleFavorite() {
  const utils = trpc.useContext();

  return trpc.favorite.toggle.useMutation({
    onSuccess: (data) => {
      utils.favorite.list.invalidate();
      utils.favorite.isFavorite.invalidate({ propertyId: data.propertyId });
      utils.favorite.summary.invalidate();
      utils.tenantDashboard.getData.invalidate();
    },
    // Optimistic update
    onMutate: async ({ propertyId }) => {
      await utils.favorite.list.cancel();
      const previousFavorites = utils.favorite.list.getData();

      // Actualizar optimísticamente
      utils.favorite.isFavorite.setData({ propertyId }, (old) => !old);

      return { previousFavorites };
    },
    onError: (_err, { propertyId }, context) => {
      // Revertir en caso de error
      if (context?.previousFavorites) {
        utils.favorite.list.setData(undefined, context.previousFavorites);
      }
      utils.favorite.isFavorite.invalidate({ propertyId });
    },
  });
}

/**
 * Hook para obtener el resumen de favoritos
 * (incluye estadísticas)
 */
export function useFavoritesSummary() {
  return trpc.favorite.summary.useQuery(undefined, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minuto
  });
}
