import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for response templates
export interface ResponseTemplate {
  id: string;
  landlordId: string;
  name: string;
  category: 'greeting' | 'viewing_invitation' | 'follow_up' | 'document_request' | 'rejection' | 'general';
  content: string;
  variables: string[];
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  category: ResponseTemplate['category'];
  content: string;
  variables?: string[];
}

export interface UpdateTemplateInput {
  name?: string;
  content?: string;
  variables?: string[];
}

class ResponseTemplateService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for response template service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Response Template service initialized');
  }

  /**
   * Get templates for landlord, optionally filtered by category
   */
  async getTemplatesForLandlord(
    landlordId: string,
    category?: ResponseTemplate['category']
  ): Promise<ResponseTemplate[]> {
    try {
      let query = this.supabase
        .from('response_templates')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('usage_count', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener las plantillas'
        });
      }

      return (data || []).map(this.transformTemplate);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in getTemplatesForLandlord:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener las plantillas'
      });
    }
  }

  /**
   * Get a single template by ID
   */
  async getTemplateById(templateId: string, landlordId: string): Promise<ResponseTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('response_templates')
        .select('*')
        .eq('id', templateId)
        .eq('landlord_id', landlordId)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plantilla no encontrada'
        });
      }

      return this.transformTemplate(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in getTemplateById:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener la plantilla'
      });
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(
    landlordId: string,
    input: CreateTemplateInput
  ): Promise<ResponseTemplate> {
    try {
      // Extract variables from content
      const extractedVariables = this.extractVariables(input.content);
      const variables = input.variables || extractedVariables;

      const { data, error } = await this.supabase
        .from('response_templates')
        .insert({
          landlord_id: landlordId,
          name: input.name,
          category: input.category,
          content: input.content,
          variables: variables
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al crear la plantilla'
        });
      }

      return this.transformTemplate(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in createTemplate:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al crear la plantilla'
      });
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    templateId: string,
    updates: UpdateTemplateInput,
    landlordId: string
  ): Promise<ResponseTemplate> {
    try {
      // Verify ownership
      await this.verifyTemplateOwnership(templateId, landlordId);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.content) {
        updateData.content = updates.content;
        // Re-extract variables if content changed
        updateData.variables = updates.variables || this.extractVariables(updates.content);
      }

      const { data, error } = await this.supabase
        .from('response_templates')
        .update(updateData)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al actualizar la plantilla'
        });
      }

      return this.transformTemplate(data);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in updateTemplate:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar la plantilla'
      });
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string, landlordId: string): Promise<{ success: boolean }> {
    try {
      // Verify ownership
      await this.verifyTemplateOwnership(templateId, landlordId);

      const { error } = await this.supabase
        .from('response_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al eliminar la plantilla'
        });
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error in deleteTemplate:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al eliminar la plantilla'
      });
    }
  }

  /**
   * Replace variables in template content with actual values
   */
  replaceVariables(template: string, leadData: any): string {
    let result = template;

    // Common variable replacements
    const replacements: Record<string, string> = {
      '{{tenant_name}}': leadData.tenant?.full_name || leadData.tenantSnapshot?.fullName || 'Estimado/a',
      '{{property_address}}': leadData.property?.address?.neighborhood || 'la propiedad',
      '{{property_price}}': leadData.property?.price_amount
        ? `L.${leadData.property.price_amount.toLocaleString()}`
        : '',
      '{{landlord_name}}': leadData.landlord?.full_name || leadData.landlord?.business_name || '',
      '{{landlord_phone}}': leadData.landlord?.phone || leadData.landlord?.whatsapp_number || '',
      '{{tenant_budget}}': leadData.tenant?.budget_max
        ? `L.${leadData.tenant.budget_max.toLocaleString()}`
        : '',
      '{{tenant_move_date}}': leadData.tenant?.move_date || leadData.tenantSnapshot?.moveDate || '',
      '{{property_bedrooms}}': leadData.property?.bedrooms?.toString() || '',
      '{{property_bathrooms}}': leadData.property?.bathrooms?.toString() || '',
      '{{property_type}}': this.translatePropertyType(leadData.property?.type) || ''
    };

    // Replace all variables
    for (const [variable, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(variable, 'g'), value);
    }

    return result;
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Verify template ownership
   */
  private async verifyTemplateOwnership(templateId: string, landlordId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('response_templates')
      .select('id')
      .eq('id', templateId)
      .eq('landlord_id', landlordId)
      .single();

    if (error || !data) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para acceder a esta plantilla'
      });
    }
  }

  /**
   * Translate property type to Spanish
   */
  private translatePropertyType(type: string): string {
    const translations: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      room: 'Habitación',
      office: 'Oficina'
    };
    return translations[type] || type;
  }

  /**
   * Transform database template to API template
   */
  private transformTemplate(data: any): ResponseTemplate {
    return {
      id: data.id,
      landlordId: data.landlord_id,
      name: data.name,
      category: data.category,
      content: data.content,
      variables: data.variables || [],
      usageCount: data.usage_count || 0,
      lastUsedAt: data.last_used_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Export singleton instance
let responseTemplateServiceInstance: ResponseTemplateService | null = null;

export function getResponseTemplateService(): ResponseTemplateService {
  if (!responseTemplateServiceInstance) {
    responseTemplateServiceInstance = new ResponseTemplateService();
  }
  return responseTemplateServiceInstance;
}

export default ResponseTemplateService;
