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
    // Optimistic update mejorado
    onMutate: async ({ propertyId }) => {
      // Cancelar queries en curso
      await utils.favorite.list.cancel();
      await utils.favorite.isFavorite.cancel({ propertyId });

      // Guardar estado anterior
      const previousFavorites = utils.favorite.list.getData();
      const previousIsFavorite = utils.favorite.isFavorite.getData({ propertyId });

      // Actualizar estado isFavorite inmediatamente
      utils.favorite.isFavorite.setData({ propertyId }, (old) => !old);

      // Actualizar lista de favoritos inmediatamente
      if (previousIsFavorite) {
        // Si era favorito, quitarlo de la lista
        utils.favorite.list.setData(undefined, (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((fav: any) => fav.property.id !== propertyId)
          };
        });
      }

      return { previousFavorites, previousIsFavorite };
    },
    onError: (_err, { propertyId }, context) => {
      // Revertir en caso de error
      if (context?.previousFavorites) {
        utils.favorite.list.setData(undefined, context.previousFavorites);
      }
      if (context?.previousIsFavorite !== undefined) {
        utils.favorite.isFavorite.setData({ propertyId }, context.previousIsFavorite);
      }
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
