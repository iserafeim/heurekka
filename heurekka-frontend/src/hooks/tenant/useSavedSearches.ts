/**
 * Saved Searches Hooks
 * Custom hooks para manejar las búsquedas guardadas usando tRPC
 */

import { trpc } from '@/lib/trpc/client';
import type { SavedSearchFormData } from '@/types/tenant';

/**
 * Hook para listar todas las búsquedas guardadas del usuario
 */
export function useSavedSearches() {
  return trpc.savedSearch.list.useQuery(undefined, {
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener una búsqueda guardada por ID
 */
export function useSavedSearch(id: string) {
  return trpc.savedSearch.getById.useQuery(
    { searchId: id },
    {
      retry: 1,
      enabled: !!id,
    }
  );
}

/**
 * Hook para crear una búsqueda guardada
 */
export function useCreateSavedSearch() {
  const utils = trpc.useContext();

  return trpc.savedSearch.create.useMutation({
    onSuccess: () => {
      utils.savedSearch.list.invalidate();
      utils.savedSearch.summary.invalidate();
      utils.tenantDashboard.getData.invalidate();
    },
  });
}

/**
 * Hook para actualizar una búsqueda guardada
 */
export function useUpdateSavedSearch() {
  const utils = trpc.useContext();

  return trpc.savedSearch.update.useMutation({
    onSuccess: (data) => {
      utils.savedSearch.list.invalidate();
      utils.savedSearch.getById.invalidate({ searchId: data.id });
      utils.savedSearch.summary.invalidate();
    },
  });
}

/**
 * Hook para eliminar una búsqueda guardada
 */
export function useDeleteSavedSearch() {
  const utils = trpc.useContext();

  return trpc.savedSearch.delete.useMutation({
    onSuccess: () => {
      utils.savedSearch.list.invalidate();
      utils.savedSearch.summary.invalidate();
      utils.tenantDashboard.getData.invalidate();
    },
  });
}

/**
 * Hook para activar/desactivar una búsqueda guardada
 */
export function useToggleSavedSearchStatus() {
  const utils = trpc.useContext();

  return trpc.savedSearch.toggleStatus.useMutation({
    onSuccess: (data) => {
      utils.savedSearch.list.invalidate();
      utils.savedSearch.getById.invalidate({ searchId: data.id });
    },
    // Optimistic update
    onMutate: async ({ searchId }) => {
      await utils.savedSearch.list.cancel();
      const previousSearches = utils.savedSearch.list.getData();

      utils.savedSearch.list.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((search) =>
          search.id === searchId
            ? { ...search, isActive: !search.isActive }
            : search
        );
      });

      return { previousSearches };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSearches) {
        utils.savedSearch.list.setData(undefined, context.previousSearches);
      }
    },
  });
}

/**
 * Hook para ejecutar una búsqueda y obtener resultados
 */
export function useExecuteSavedSearch(id: string) {
  return trpc.savedSearch.execute.useQuery(
    { searchId: id },
    {
      retry: 1,
      enabled: !!id,
      staleTime: 30 * 1000, // 30 segundos
    }
  );
}

/**
 * Hook para obtener el resumen de búsquedas guardadas
 * (incluye count de nuevos matches)
 */
export function useSavedSearchesSummary() {
  return trpc.savedSearch.summary.useQuery(undefined, {
    retry: 1,
    staleTime: 60 * 1000, // 1 minuto
  });
}
