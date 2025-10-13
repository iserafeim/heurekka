import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for leads
export interface Lead {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  inquiryId?: string;

  // Status & Priority
  status: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
  priority: 'high' | 'medium' | 'low';
  quality: 'high' | 'medium' | 'low';
  source: 'direct' | 'marketplace' | 'search' | 'referral';
  urgency: 'immediate' | 'planned' | 'flexible';

  // Conversation
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;

  // Metadata
  relevanceScore?: number;
  firstViewedAt?: string;
  respondedAt?: string;
  responseTimeMinutes?: number;

  // Contact info
  contactPhone?: string;
  contactEmail?: string;
  inquiryMessage?: string;

  // Snapshots
  tenantSnapshot: any;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  closedAt?: string;

  // Relationships (populated)
  tenant?: any;
  property?: any;
  landlord?: any;
}

export interface LeadFilters {
  status?: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
  priority?: 'high' | 'medium' | 'low'[];
  quality?: 'high' | 'medium' | 'low'[];
  propertyId?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  searchQuery?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortingOptions {
  field?: 'createdAt' | 'updatedAt' | 'priority' | 'quality';
  direction?: 'asc' | 'desc';
}

export interface GetLeadsOptions {
  filters?: LeadFilters;
  pagination?: PaginationOptions;
  sorting?: SortingOptions;
}

export interface GetLeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class LeadService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for lead service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Lead service initialized');
  }

  /**
   * Get leads for a landlord with filtering, pagination, and sorting
   */
  async getLeadsForLandlord(
    landlordId: string,
    options: GetLeadsOptions = {}
  ): Promise<GetLeadsResponse> {
    try {
      const {
        filters = {},
        pagination = { page: 1, limit: 20 },
        sorting = { field: 'createdAt', direction: 'desc' }
      } = options;

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Build query
      let query = this.supabase
        .from('leads')
        .select(`
          *,
          tenant:tenant_profiles!leads_tenant_id_fkey (
            id,
            full_name,
            phone,
            occupation,
            profile_photo_url,
            budget_min,
            budget_max,
            move_date,
            occupants,
            preferred_areas,
            property_types,
            has_pets,
            pet_details,
            profile_completion_percentage,
            is_verified
          ),
          property:properties!leads_property_id_fkey (
            id,
            title,
            type,
            price_amount,
            price_currency,
            bedrooms,
            bathrooms,
            address
          )
        `, { count: 'exact' })
        .eq('landlord_id', landlordId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters.quality && filters.quality.length > 0) {
        query = query.in('quality', filters.quality);
      }

      if (filters.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      // Text search
      if (filters.searchQuery) {
        // Search in tenant name, property title, and inquiry message
        query = query.or(`
          tenant_snapshot->fullName.ilike.%${filters.searchQuery}%,
          inquiry_message.ilike.%${filters.searchQuery}%
        `);
      }

      // Apply sorting
      const sortField = sorting.field === 'createdAt' ? 'created_at' :
                       sorting.field === 'updatedAt' ? 'updated_at' :
                       sorting.field;
      query = query.order(sortField, { ascending: sorting.direction === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener los leads'
        });
      }

      const leads = (data || []).map(this.transformLead);
      const total = count || 0;

      return {
        leads,
        total,
        page,
        limit,
        hasMore: offset + limit < total
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in getLeadsForLandlord:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener los leads'
      });
    }
  }

  /**
   * Get a single lead by ID
   */
  async getLeadById(leadId: string, landlordId: string): Promise<Lead> {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select(`
          *,
          tenant:tenant_profiles!leads_tenant_id_fkey (
            id,
            user_id,
            full_name,
            phone,
            email,
            occupation,
            profile_photo_url,
            budget_min,
            budget_max,
            move_date,
            occupants,
            preferred_areas,
            property_types,
            has_pets,
            pet_details,
            has_references,
            message_to_landlords,
            profile_completion_percentage,
            is_verified,
            phone_verified
          ),
          property:properties!leads_property_id_fkey (
            id,
            title,
            description,
            type,
            price_amount,
            price_currency,
            bedrooms,
            bathrooms,
            amenities,
            address,
            available_from
          ),
          landlord:landlords!leads_landlord_id_fkey (
            id,
            full_name,
            business_name,
            email,
            phone,
            whatsapp_number
          )
        `)
        .eq('id', leadId)
        .eq('landlord_id', landlordId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lead no encontrado'
        });
      }

      return this.transformLead(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in getLeadById:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener el lead'
      });
    }
  }

  /**
   * Mark a lead as read
   */
  async markAsRead(leadId: string, landlordId: string): Promise<Lead> {
    try {
      // First verify ownership
      await this.verifyLeadOwnership(leadId, landlordId);

      const updates: any = {
        unread_count: 0,
        updated_at: new Date().toISOString()
      };

      // Set first_viewed_at if not already set
      const { data: currentLead } = await this.supabase
        .from('leads')
        .select('first_viewed_at, status')
        .eq('id', leadId)
        .single();

      if (!currentLead?.first_viewed_at) {
        updates.first_viewed_at = new Date().toISOString();
      }

      // Update status from 'new' to 'viewed'
      if (currentLead?.status === 'new') {
        updates.status = 'viewed';
      }

      const { data, error } = await this.supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al marcar como leído'
        });
      }

      return this.transformLead(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in markAsRead:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al marcar como leído'
      });
    }
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(
    leadId: string,
    status: Lead['status'],
    landlordId: string
  ): Promise<Lead> {
    try {
      await this.verifyLeadOwnership(leadId, landlordId);

      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // If status is 'contacted', set responded_at and calculate response time
      if (status === 'contacted') {
        const { data: currentLead } = await this.supabase
          .from('leads')
          .select('responded_at, created_at')
          .eq('id', leadId)
          .single();

        if (!currentLead?.responded_at) {
          const now = new Date();
          updates.responded_at = now.toISOString();

          // Calculate response time in minutes
          const createdAt = new Date(currentLead.created_at);
          const responseTimeMinutes = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60));
          updates.response_time_minutes = responseTimeMinutes;
        }
      }

      // If status is completed or rejected, set closed_at
      if (status === 'completed' || status === 'rejected') {
        updates.closed_at = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar el estado'
        });
      }

      return this.transformLead(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in updateLeadStatus:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el estado'
      });
    }
  }

  /**
   * Respond to a lead
   */
  async respondToLead(
    input: {
      leadId: string;
      method: 'whatsapp' | 'email' | 'phone';
      message: string;
      templateId?: string;
    },
    landlordId: string
  ): Promise<{ success: boolean; lead: Lead }> {
    try {
      await this.verifyLeadOwnership(input.leadId, landlordId);

      // Update lead status to 'contacted' if not already
      const lead = await this.updateLeadStatus(input.leadId, 'contacted', landlordId);

      // Log the response (could be extended to create a conversation record)
      await this.supabase
        .from('leads')
        .update({
          last_message: input.message,
          last_message_at: new Date().toISOString()
        })
        .eq('id', input.leadId);

      // If template was used, increment its usage count
      if (input.templateId) {
        await this.supabase.rpc('increment_template_usage', {
          template_id: input.templateId
        });
      }

      return { success: true, lead };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in respondToLead:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al responder al lead'
      });
    }
  }

  /**
   * Bulk update leads
   */
  async bulkUpdateLeads(
    leadIds: string[],
    updates: {
      status?: Lead['status'];
      priority?: Lead['priority'];
    },
    landlordId: string
  ): Promise<{ success: boolean; updatedCount: number }> {
    try {
      // Verify all leads belong to landlord
      const { data: leads, error: verifyError } = await this.supabase
        .from('leads')
        .select('id')
        .in('id', leadIds)
        .eq('landlord_id', landlordId);

      if (verifyError || !leads || leads.length !== leadIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No tienes permiso para actualizar estos leads'
        });
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;

      const { error } = await this.supabase
        .from('leads')
        .update(updateData)
        .in('id', leadIds);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar los leads'
        });
      }

      return { success: true, updatedCount: leadIds.length };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in bulkUpdateLeads:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar los leads'
      });
    }
  }

  /**
   * Calculate lead priority based on tenant profile and property match
   */
  async calculateLeadPriority(lead: any): Promise<'high' | 'medium' | 'low'> {
    let score = 0;
    const weights = {
      verified: 30,
      budgetMatch: 25,
      urgency: 20,
      profileCompleteness: 15,
      hasReferences: 10
    };

    // Tenant verification
    if (lead.tenant?.is_verified || lead.tenant_snapshot?.isVerified) {
      score += weights.verified;
    }

    // Budget match
    const propertyPrice = lead.property?.price_amount;
    const tenantBudgetMin = lead.tenant?.budget_min || lead.tenant_snapshot?.budgetMin;
    const tenantBudgetMax = lead.tenant?.budget_max || lead.tenant_snapshot?.budgetMax;

    if (propertyPrice && tenantBudgetMin && tenantBudgetMax) {
      if (propertyPrice >= tenantBudgetMin && propertyPrice <= tenantBudgetMax) {
        score += weights.budgetMatch;
      } else if (propertyPrice <= tenantBudgetMax * 1.1) {
        score += weights.budgetMatch * 0.5;
      }
    }

    // Move date urgency
    const moveDate = lead.tenant?.move_date || lead.tenant_snapshot?.moveDate;
    if (moveDate === 'menos de 1 mes' || lead.urgency === 'immediate') {
      score += weights.urgency;
    } else if (moveDate === '1-3 meses' || lead.urgency === 'planned') {
      score += weights.urgency * 0.6;
    }

    // Profile completeness
    const completionPercentage = lead.tenant?.profile_completion_percentage ||
                                 lead.tenant_snapshot?.profileCompletionPercentage || 0;
    if (completionPercentage >= 80) {
      score += weights.profileCompleteness;
    } else if (completionPercentage >= 60) {
      score += weights.profileCompleteness * 0.6;
    }

    // Has references
    if (lead.tenant?.has_references || lead.tenant_snapshot?.hasReferences) {
      score += weights.hasReferences;
    }

    // Determine priority based on score
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Verify lead ownership
   */
  private async verifyLeadOwnership(leadId: string, landlordId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('landlord_id', landlordId)
      .single();

    if (error || !data) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para acceder a este lead'
      });
    }
  }

  /**
   * Transform database lead to API lead
   */
  private transformLead(data: any): Lead {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      landlordId: data.landlord_id,
      propertyId: data.property_id,
      inquiryId: data.inquiry_id,

      status: data.status,
      priority: data.priority,
      quality: data.quality,
      source: data.source,
      urgency: data.urgency,

      unreadCount: data.unread_count || 0,
      lastMessage: data.last_message,
      lastMessageAt: data.last_message_at,

      relevanceScore: data.relevance_score,
      firstViewedAt: data.first_viewed_at,
      respondedAt: data.responded_at,
      responseTimeMinutes: data.response_time_minutes,

      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      inquiryMessage: data.inquiry_message,

      tenantSnapshot: data.tenant_snapshot || {},

      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,

      // Populated relationships
      tenant: data.tenant,
      property: data.property,
      landlord: data.landlord
    };
  }
}

// Export singleton instance
let leadServiceInstance: LeadService | null = null;

export function getLeadService(): LeadService {
  if (!leadServiceInstance) {
    leadServiceInstance = new LeadService();
  }
  return leadServiceInstance;
}

export default LeadService;
