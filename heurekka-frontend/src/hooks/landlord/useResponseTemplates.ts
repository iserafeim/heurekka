/**
 * Response Templates Hook
 * Manages response template CRUD operations
 */

import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export type TemplateCategory = 'greeting' | 'viewing_invitation' | 'follow_up' | 'document_request' | 'rejection' | 'general';

export function useResponseTemplates(category?: TemplateCategory) {
  const utils = trpc.useUtils();

  // Fetch templates
  const { data, isLoading, error, refetch } = trpc.landlordDashboard.getResponseTemplates.useQuery(
    { category },
    {
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
      retry: 2,
    }
  );

  // Create template mutation
  const create = trpc.landlordDashboard.createResponseTemplate.useMutation({
    onSuccess: () => {
      toast.success('Plantilla creada exitosamente');
      utils.landlordDashboard.getResponseTemplates.invalidate();
    },
    onError: () => {
      toast.error('Error al crear plantilla');
    },
  });

  // Update template mutation
  const update = trpc.landlordDashboard.updateResponseTemplate.useMutation({
    onSuccess: () => {
      toast.success('Plantilla actualizada');
      utils.landlordDashboard.getResponseTemplates.invalidate();
    },
    onError: () => {
      toast.error('Error al actualizar plantilla');
    },
  });

  // Delete template mutation
  const deleteTemplate = trpc.landlordDashboard.deleteResponseTemplate.useMutation({
    onSuccess: () => {
      toast.success('Plantilla eliminada');
      utils.landlordDashboard.getResponseTemplates.invalidate();
    },
    onError: () => {
      toast.error('Error al eliminar plantilla');
    },
  });

  return {
    templates: data?.data || [],
    isLoading,
    error,
    refetch,
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    deleteTemplate: deleteTemplate.mutate,
    deleteTemplateAsync: deleteTemplate.mutateAsync,
    isCreating: create.isLoading,
    isUpdating: update.isLoading,
    isDeleting: deleteTemplate.isLoading,
  };
}
