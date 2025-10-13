import { z } from 'zod';
import { router, protectedProcedure } from '../lib/trpc';
import { getLeadService } from '../services/lead.service';
import { getLeadAnalyticsService } from '../services/lead-analytics.service';
import { getResponseTemplateService } from '../services/response-template.service';
import { getLandlordProfileService } from '../services/landlord-profile.service';
import { TRPCError } from '@trpc/server';

// Initialize services
const leadService = getLeadService();
const analyticsService = getLeadAnalyticsService();
const templateService = getResponseTemplateService();
const landlordProfileService = getLandlordProfileService();

// Validation schemas
const LeadFiltersSchema = z.object({
  status: z.enum(['new', 'viewed', 'contacted', 'scheduled', 'completed', 'rejected', 'expired']).optional(),
  priority: z.array(z.enum(['high', 'medium', 'low'])).optional(),
  quality: z.array(z.enum(['high', 'medium', 'low'])).optional(),
  propertyId: z.string().uuid().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  searchQuery: z.string().optional(),
});

const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const SortingSchema = z.object({
  field: z.enum(['createdAt', 'updatedAt', 'priority', 'quality']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

const ResponseTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['greeting', 'viewing_invitation', 'follow_up', 'document_request', 'rejection', 'general']),
  content: z.string().min(1, 'El contenido es requerido'),
  variables: z.array(z.string()).optional(),
});

/**
 * Helper function to get landlord ID from user ID
 */
async function getLandlordId(userId: string): Promise<string> {
  const landlord = await landlordProfileService.getLandlordProfileByUserId(userId);

  if (!landlord) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Perfil de propietario no encontrado'
    });
  }

  return landlord.id;
}

/**
 * Landlord Dashboard router
 * Handles lead management, analytics, and response templates
 */
export const landlordDashboardRouter = router({
  /**
   * Get leads for landlord with filtering, pagination, and sorting
   */
  getLeads: protectedProcedure
    .input(z.object({
      filters: LeadFiltersSchema.optional(),
      pagination: PaginationSchema.optional(),
      sorting: SortingSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const result = await leadService.getLeadsForLandlord(landlordId, input);

        return {
          success: true,
          data: result
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error in getLeads:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener los leads'
        });
      }
    }),

  /**
   * Get single lead by ID
   */
  getLead: protectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const lead = await leadService.getLeadById(input.leadId, landlordId);

        return {
          success: true,
          data: lead
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener el lead'
        });
      }
    }),

  /**
   * Get analytics for landlord
   */
  getAnalytics: protectedProcedure
    .input(z.object({
      dateRange: z.object({
        from: z.date(),
        to: z.date(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const analytics = await analyticsService.getAnalyticsForLandlord(
          landlordId,
          input.dateRange
        );

        return {
          success: true,
          data: analytics
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener las analíticas'
        });
      }
    }),

  /**
   * Get response templates
   */
  getResponseTemplates: protectedProcedure
    .input(z.object({
      category: z.enum(['greeting', 'viewing_invitation', 'follow_up', 'document_request', 'rejection', 'general']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const templates = await templateService.getTemplatesForLandlord(
          landlordId,
          input.category
        );

        return {
          success: true,
          data: templates
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener las plantillas'
        });
      }
    }),

  /**
   * Mark lead as read
   */
  markLeadAsRead: protectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const lead = await leadService.markAsRead(input.leadId, landlordId);

        return {
          success: true,
          data: lead,
          message: 'Lead marcado como leído'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al marcar como leído'
        });
      }
    }),

  /**
   * Update lead status
   */
  updateLeadStatus: protectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      status: z.enum(['new', 'viewed', 'contacted', 'scheduled', 'completed', 'rejected', 'expired']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const lead = await leadService.updateLeadStatus(
          input.leadId,
          input.status,
          landlordId
        );

        return {
          success: true,
          data: lead,
          message: 'Estado actualizado exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el estado'
        });
      }
    }),

  /**
   * Respond to lead
   */
  respondToLead: protectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      method: z.enum(['whatsapp', 'email', 'phone']),
      message: z.string().min(1, 'El mensaje es requerido'),
      templateId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const result = await leadService.respondToLead(input, landlordId);

        return {
          success: true,
          data: result.lead,
          message: 'Respuesta enviada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al enviar la respuesta'
        });
      }
    }),

  /**
   * Bulk update leads
   */
  bulkUpdateLeads: protectedProcedure
    .input(z.object({
      leadIds: z.array(z.string().uuid()).min(1, 'Selecciona al menos un lead'),
      updates: z.object({
        status: z.enum(['new', 'viewed', 'contacted', 'scheduled', 'completed', 'rejected', 'expired']).optional(),
        priority: z.enum(['high', 'medium', 'low']).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const result = await leadService.bulkUpdateLeads(
          input.leadIds,
          input.updates,
          landlordId
        );

        return {
          success: true,
          data: result,
          message: `${result.updatedCount} leads actualizados exitosamente`
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar los leads'
        });
      }
    }),

  /**
   * Create response template
   */
  createResponseTemplate: protectedProcedure
    .input(ResponseTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const template = await templateService.createTemplate(landlordId, input);

        return {
          success: true,
          data: template,
          message: 'Plantilla creada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear la plantilla'
        });
      }
    }),

  /**
   * Update response template
   */
  updateResponseTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string().uuid(),
      name: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      variables: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        const { templateId, ...updates } = input;
        const template = await templateService.updateTemplate(
          templateId,
          updates,
          landlordId
        );

        return {
          success: true,
          data: template,
          message: 'Plantilla actualizada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar la plantilla'
        });
      }
    }),

  /**
   * Delete response template
   */
  deleteResponseTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.auth.isAuthenticated || !ctx.auth.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuario no autenticado'
          });
        }

        const landlordId = await getLandlordId(ctx.auth.user.id);
        await templateService.deleteTemplate(input.templateId, landlordId);

        return {
          success: true,
          message: 'Plantilla eliminada exitosamente'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al eliminar la plantilla'
        });
      }
    }),
});
