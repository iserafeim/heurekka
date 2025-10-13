import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for analytics
export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  viewedLeads: number;
  contactedLeads: number;
  scheduledLeads: number;
  completedLeads: number;
  rejectedLeads: number;

  responseRate: number; // percentage
  avgResponseTimeMinutes: number;
  conversionRate: number; // percentage

  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
  };

  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };

  sourceDistribution: {
    direct: number;
    marketplace: number;
    search: number;
    referral: number;
  };

  calculatedAt: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

class LeadAnalyticsService {
  private supabase: SupabaseClient;
  private cacheExpiryMinutes = 15; // Cache analytics for 15 minutes

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for lead analytics service');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Lead Analytics service initialized');
  }

  /**
   * Get analytics for landlord with caching
   */
  async getAnalyticsForLandlord(
    landlordId: string,
    dateRange?: DateRange
  ): Promise<LeadAnalytics> {
    try {
      // Generate cache key from date range
      const cacheKey = this.generateCacheKey(landlordId, dateRange);

      // Try to get from cache first
      const cachedAnalytics = await this.getCachedAnalytics(landlordId, cacheKey);

      if (cachedAnalytics && this.isCacheValid(cachedAnalytics.calculatedAt)) {
        console.log('✅ Returning cached analytics');
        return this.transformAnalytics(cachedAnalytics);
      }

      // Calculate fresh analytics
      console.log('📊 Calculating fresh analytics');
      const analytics = await this.calculateMetrics(landlordId, dateRange);

      // Cache the results
      await this.cacheAnalytics(landlordId, cacheKey, analytics);

      return analytics;
    } catch (error) {
      console.error('Error in getAnalyticsForLandlord:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener analíticas'
      });
    }
  }

  /**
   * Calculate metrics from leads
   */
  async calculateMetrics(
    landlordId: string,
    dateRange?: DateRange
  ): Promise<LeadAnalytics> {
    try {
      // Build query for leads
      let query = this.supabase
        .from('leads')
        .select('*')
        .eq('landlord_id', landlordId);

      // Apply date range if provided
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data: leads, error } = await query;

      if (error) {
        throw new Error('Error fetching leads for analytics');
      }

      // Initialize counters
      const statusCounts = {
        new: 0,
        viewed: 0,
        contacted: 0,
        scheduled: 0,
        completed: 0,
        rejected: 0,
        expired: 0
      };

      const qualityDistribution = {
        high: 0,
        medium: 0,
        low: 0
      };

      const priorityDistribution = {
        high: 0,
        medium: 0,
        low: 0
      };

      const sourceDistribution = {
        direct: 0,
        marketplace: 0,
        search: 0,
        referral: 0
      };

      let totalResponseTime = 0;
      let responsiveLeadsCount = 0;

      // Process each lead
      (leads || []).forEach((lead: any) => {
        // Status counts
        if (statusCounts[lead.status as keyof typeof statusCounts] !== undefined) {
          statusCounts[lead.status as keyof typeof statusCounts]++;
        }

        // Quality distribution
        if (qualityDistribution[lead.quality as keyof typeof qualityDistribution] !== undefined) {
          qualityDistribution[lead.quality as keyof typeof qualityDistribution]++;
        }

        // Priority distribution
        if (priorityDistribution[lead.priority as keyof typeof priorityDistribution] !== undefined) {
          priorityDistribution[lead.priority as keyof typeof priorityDistribution]++;
        }

        // Source distribution
        if (sourceDistribution[lead.source as keyof typeof sourceDistribution] !== undefined) {
          sourceDistribution[lead.source as keyof typeof sourceDistribution]++;
        }

        // Response time
        if (lead.response_time_minutes) {
          totalResponseTime += lead.response_time_minutes;
          responsiveLeadsCount++;
        }
      });

      const totalLeads = leads?.length || 0;
      const respondedLeads = statusCounts.contacted + statusCounts.scheduled + statusCounts.completed;

      // Calculate rates
      const responseRate = totalLeads > 0 ? (respondedLeads / totalLeads) * 100 : 0;
      const avgResponseTimeMinutes = responsiveLeadsCount > 0 ? totalResponseTime / responsiveLeadsCount : 0;
      const conversionRate = totalLeads > 0 ? (statusCounts.completed / totalLeads) * 100 : 0;

      return {
        totalLeads,
        newLeads: statusCounts.new,
        viewedLeads: statusCounts.viewed,
        contactedLeads: statusCounts.contacted,
        scheduledLeads: statusCounts.scheduled,
        completedLeads: statusCounts.completed,
        rejectedLeads: statusCounts.rejected,

        responseRate: parseFloat(responseRate.toFixed(2)),
        avgResponseTimeMinutes: parseFloat(avgResponseTimeMinutes.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),

        qualityDistribution,
        priorityDistribution,
        sourceDistribution,

        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al calcular métricas'
      });
    }
  }

  /**
   * Get cached analytics
   */
  private async getCachedAnalytics(landlordId: string, cacheKey: string) {
    try {
      const { data, error } = await this.supabase
        .from('lead_analytics')
        .select('*')
        .eq('landlord_id', landlordId)
        .eq('date_range', cacheKey)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached analytics:', error);
      return null;
    }
  }

  /**
   * Cache analytics
   */
  private async cacheAnalytics(
    landlordId: string,
    cacheKey: string,
    analytics: LeadAnalytics
  ): Promise<void> {
    try {
      await this.supabase
        .from('lead_analytics')
        .upsert({
          landlord_id: landlordId,
          date_range: cacheKey,
          total_leads: analytics.totalLeads,
          new_leads: analytics.newLeads,
          viewed_leads: analytics.viewedLeads,
          contacted_leads: analytics.contactedLeads,
          scheduled_leads: analytics.scheduledLeads,
          completed_leads: analytics.completedLeads,
          rejected_leads: analytics.rejectedLeads,
          response_rate: analytics.responseRate,
          avg_response_time_minutes: analytics.avgResponseTimeMinutes,
          conversion_rate: analytics.conversionRate,
          quality_distribution: analytics.qualityDistribution,
          priority_distribution: analytics.priorityDistribution,
          source_distribution: analytics.sourceDistribution,
          calculated_at: analytics.calculatedAt
        }, {
          onConflict: 'landlord_id,date_range'
        });
    } catch (error) {
      console.error('Error caching analytics:', error);
      // Don't throw - caching failure shouldn't break the request
    }
  }

  /**
   * Invalidate cache for landlord
   */
  async invalidateCache(landlordId: string): Promise<void> {
    try {
      await this.supabase
        .from('lead_analytics')
        .delete()
        .eq('landlord_id', landlordId);

      console.log(`🗑️ Cache invalidated for landlord ${landlordId}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
      // Don't throw - cache invalidation failure shouldn't break the request
    }
  }

  /**
   * Generate cache key from date range
   */
  private generateCacheKey(landlordId: string, dateRange?: DateRange): string {
    if (!dateRange) {
      return 'all_time';
    }

    const fromStr = dateRange.from.toISOString().split('T')[0];
    const toStr = dateRange.to.toISOString().split('T')[0];
    return `${fromStr}_${toStr}`;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(calculatedAt: string): boolean {
    const cacheAge = Date.now() - new Date(calculatedAt).getTime();
    const cacheAgeMinutes = cacheAge / (1000 * 60);
    return cacheAgeMinutes < this.cacheExpiryMinutes;
  }

  /**
   * Transform database analytics to API analytics
   */
  private transformAnalytics(data: any): LeadAnalytics {
    return {
      totalLeads: data.total_leads || 0,
      newLeads: data.new_leads || 0,
      viewedLeads: data.viewed_leads || 0,
      contactedLeads: data.contacted_leads || 0,
      scheduledLeads: data.scheduled_leads || 0,
      completedLeads: data.completed_leads || 0,
      rejectedLeads: data.rejected_leads || 0,

      responseRate: parseFloat(data.response_rate || 0),
      avgResponseTimeMinutes: parseFloat(data.avg_response_time_minutes || 0),
      conversionRate: parseFloat(data.conversion_rate || 0),

      qualityDistribution: data.quality_distribution || { high: 0, medium: 0, low: 0 },
      priorityDistribution: data.priority_distribution || { high: 0, medium: 0, low: 0 },
      sourceDistribution: data.source_distribution || { direct: 0, marketplace: 0, search: 0, referral: 0 },

      calculatedAt: data.calculated_at
    };
  }
}

// Export singleton instance
let leadAnalyticsServiceInstance: LeadAnalyticsService | null = null;

export function getLeadAnalyticsService(): LeadAnalyticsService {
  if (!leadAnalyticsServiceInstance) {
    leadAnalyticsServiceInstance = new LeadAnalyticsService();
  }
  return leadAnalyticsServiceInstance;
}

export default LeadAnalyticsService;
