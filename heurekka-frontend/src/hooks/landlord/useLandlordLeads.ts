/**
 * Landlord Leads Hook
 * Manages lead fetching, filtering, and mutations
 */

import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export interface LeadFilters {
  status?: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
  priority?: ('high' | 'medium' | 'low')[];
  quality?: ('high' | 'medium' | 'low')[];
  propertyId?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  searchQuery?: string;
}

export interface LeadPagination {
  page?: number;
  limit?: number;
}

export interface LeadSorting {
  field?: 'createdAt' | 'updatedAt' | 'priority' | 'quality';
  direction?: 'asc' | 'desc';
}

export function useLandlordLeads(
  filters?: LeadFilters,
  pagination?: LeadPagination,
  sorting?: LeadSorting
) {
  const utils = trpc.useUtils();

  // Fetch leads
  const { data, isLoading, error, refetch } = trpc.landlordDashboard.getLeads.useQuery(
    {
      filters,
      pagination: pagination || { page: 1, limit: 20 },
      sorting: sorting || { field: 'createdAt', direction: 'desc' },
    },
    {
      staleTime: 30 * 1000, // Cache for 30 seconds
      retry: 2,
    }
  );

  // Mark as read mutation
  const markAsRead = trpc.landlordDashboard.markLeadAsRead.useMutation({
    onMutate: async ({ leadId }) => {
      // Cancel outgoing refetches
      await utils.landlordDashboard.getLeads.cancel();

      // Snapshot previous value
      const previousLeads = utils.landlordDashboard.getLeads.getData({
        filters,
        pagination,
        sorting,
      });

      // Optimistically update
      if (previousLeads) {
        utils.landlordDashboard.getLeads.setData(
          { filters, pagination, sorting },
          {
            ...previousLeads,
            data: {
              ...previousLeads.data,
              leads: previousLeads.data.leads.map(lead =>
                lead.id === leadId
                  ? { ...lead, unreadCount: 0, status: lead.status === 'new' ? 'viewed' : lead.status }
                  : lead
              ),
            },
          }
        );
      }

      return { previousLeads };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        utils.landlordDashboard.getLeads.setData(
          { filters, pagination, sorting },
          context.previousLeads
        );
      }
      toast.error('Error al marcar como leído');
    },
    onSuccess: () => {
      toast.success('Marcado como leído');
    },
    onSettled: () => {
      // Refetch to sync with server
      utils.landlordDashboard.getLeads.invalidate();
    },
  });

  // Update status mutation
  const updateStatus = trpc.landlordDashboard.updateLeadStatus.useMutation({
    onMutate: async ({ leadId, status }) => {
      await utils.landlordDashboard.getLeads.cancel();

      const previousLeads = utils.landlordDashboard.getLeads.getData({
        filters,
        pagination,
        sorting,
      });

      if (previousLeads) {
        utils.landlordDashboard.getLeads.setData(
          { filters, pagination, sorting },
          {
            ...previousLeads,
            data: {
              ...previousLeads.data,
              leads: previousLeads.data.leads.map(lead =>
                lead.id === leadId ? { ...lead, status } : lead
              ),
            },
          }
        );
      }

      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        utils.landlordDashboard.getLeads.setData(
          { filters, pagination, sorting },
          context.previousLeads
        );
      }
      toast.error('Error al actualizar estado');
    },
    onSuccess: () => {
      toast.success('Estado actualizado');
    },
    onSettled: () => {
      utils.landlordDashboard.getLeads.invalidate();
    },
  });

  // Respond to lead mutation
  const respond = trpc.landlordDashboard.respondToLead.useMutation({
    onSuccess: () => {
      toast.success('Respuesta enviada exitosamente');
      utils.landlordDashboard.getLeads.invalidate();
    },
    onError: () => {
      toast.error('Error al enviar respuesta');
    },
  });

  // Bulk update mutation
  const bulkUpdate = trpc.landlordDashboard.bulkUpdateLeads.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.data.updatedCount} leads actualizados`);
      utils.landlordDashboard.getLeads.invalidate();
    },
    onError: () => {
      toast.error('Error al actualizar leads');
    },
  });

  return {
    leads: data?.data?.leads || [],
    totalCount: data?.data?.total || 0,
    page: data?.data?.page || 1,
    limit: data?.data?.limit || 20,
    hasMore: data?.data?.hasMore || false,
    isLoading,
    error,
    refetch,
    markAsRead: markAsRead.mutate,
    markAsReadAsync: markAsRead.mutateAsync,
    updateStatus: updateStatus.mutate,
    updateStatusAsync: updateStatus.mutateAsync,
    respond: respond.mutate,
    respondAsync: respond.mutateAsync,
    bulkUpdate: bulkUpdate.mutate,
    bulkUpdateAsync: bulkUpdate.mutateAsync,
    isMarkingAsRead: markAsRead.isLoading,
    isUpdatingStatus: updateStatus.isLoading,
    isResponding: respond.isLoading,
    isBulkUpdating: bulkUpdate.isLoading,
  };
}

/**
 * Hook for single lead details
 */
export function useLandlordLead(leadId: string | null) {
  const { data, isLoading, error } = trpc.landlordDashboard.getLead.useQuery(
    { leadId: leadId! },
    {
      enabled: !!leadId,
      staleTime: 10 * 1000,
    }
  );

  return {
    lead: data?.data || null,
    isLoading,
    error,
  };
}
