import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';

// Types for analytics
export interface PropertyPerformance {
  propertyId: string;
  name: string;
  location: string;
  views: number;
  leads: number;
  contactRate: number;
}

export interface LeadsTrendData {
  date: string;
  leads: number;
  views: number;
}

export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number; // Leads with status 'new' (unread)
  totalViews: number; // Total property views
  contactRate: number; // (totalLeads / totalViews) * 100
  propertiesPerformance: PropertyPerformance[];
  leadsTrend: LeadsTrendData[]; // Leads by date
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
   * Calculate metrics from leads and property views
   */
  async calculateMetrics(
    landlordId: string,
    dateRange?: DateRange
  ): Promise<LeadAnalytics> {
    try {
      // 1. Get Total Leads and New Leads
      let leadsQuery = this.supabase
        .from('leads')
        .select('*')
        .eq('landlord_id', landlordId);

      if (dateRange) {
        leadsQuery = leadsQuery
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data: leads, error: leadsError } = await leadsQuery;

      if (leadsError) {
        throw new Error('Error fetching leads for analytics');
      }

      const totalLeads = leads?.length || 0;
      const newLeads = (leads || []).filter((lead: any) => lead.status === 'new').length;

      // 2. Get Total Views
      // First, get all properties for this landlord
      const { data: properties, error: propertiesError } = await this.supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', landlordId);

      if (propertiesError) {
        throw new Error('Error fetching properties for analytics');
      }

      const propertyIds = (properties || []).map((p: any) => p.id);

      let totalViews = 0;
      if (propertyIds.length > 0) {
        let viewsQuery = this.supabase
          .from('property_views')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds);

        if (dateRange) {
          viewsQuery = viewsQuery
            .gte('viewed_at', dateRange.from.toISOString())
            .lte('viewed_at', dateRange.to.toISOString());
        }

        const { count, error: viewsError } = await viewsQuery;

        if (viewsError) {
          console.error('Error fetching property views:', viewsError);
        } else {
          totalViews = count || 0;
        }
      }

      // 3. Calculate Contact Rate
      const contactRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      // 4. Get Properties Performance
      const propertiesPerformance: PropertyPerformance[] = [];

      if (propertyIds.length > 0) {
        const { data: propertiesData, error: propertiesDataError } = await this.supabase
          .from('properties')
          .select('id, title, address')
          .eq('landlord_id', landlordId);

        if (propertiesDataError) {
          console.error('Error fetching properties data:', propertiesDataError);
        } else {
          for (const property of propertiesData || []) {
            // Get views for this property
            let propertyViewsQuery = this.supabase
              .from('property_views')
              .select('id', { count: 'exact', head: true })
              .eq('property_id', property.id);

            if (dateRange) {
              propertyViewsQuery = propertyViewsQuery
                .gte('viewed_at', dateRange.from.toISOString())
                .lte('viewed_at', dateRange.to.toISOString());
            }

            const { count: viewsCount } = await propertyViewsQuery;

            // Get leads for this property
            let propertyLeadsQuery = this.supabase
              .from('leads')
              .select('id', { count: 'exact', head: true })
              .eq('property_id', property.id);

            if (dateRange) {
              propertyLeadsQuery = propertyLeadsQuery
                .gte('created_at', dateRange.from.toISOString())
                .lte('created_at', dateRange.to.toISOString());
            }

            const { count: leadsCount } = await propertyLeadsQuery;

            const views = viewsCount || 0;
            const propertyLeads = leadsCount || 0;
            const propertyContactRate = views > 0 ? (propertyLeads / views) * 100 : 0;

            // Extract neighborhood from address JSON
            const address = property.address || {};
            const location = address.neighborhood || address.city || 'Sin ubicación';

            propertiesPerformance.push({
              propertyId: property.id,
              name: property.title || 'Sin nombre',
              location: location,
              views,
              leads: propertyLeads,
              contactRate: parseFloat(propertyContactRate.toFixed(2))
            });
          }

          // Sort by leads descending, then by views descending
          propertiesPerformance.sort((a, b) => {
            if (b.leads !== a.leads) {
              return b.leads - a.leads;
            }
            return b.views - a.views;
          });
        }
      }

      // 5. Get Leads Trend and Views Trend (time series)
      const leadsTrend: LeadsTrendData[] = [];

      // Determine date range for trend
      const trendDateRange = dateRange || {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        to: new Date()
      };

      // Get leads by date
      let trendLeadsQuery = this.supabase
        .from('leads')
        .select('created_at')
        .eq('landlord_id', landlordId)
        .gte('created_at', trendDateRange.from.toISOString())
        .lte('created_at', trendDateRange.to.toISOString())
        .order('created_at', { ascending: true });

      const { data: trendLeads, error: trendError } = await trendLeadsQuery;

      // Get views by date
      let trendViewsQuery;
      if (propertyIds.length > 0) {
        trendViewsQuery = this.supabase
          .from('property_views')
          .select('viewed_at')
          .in('property_id', propertyIds)
          .gte('viewed_at', trendDateRange.from.toISOString())
          .lte('viewed_at', trendDateRange.to.toISOString())
          .order('viewed_at', { ascending: true });
      }

      const { data: trendViews } = trendViewsQuery ? await trendViewsQuery : { data: [] };

      // Group leads by date
      const leadsDateMap = new Map<string, number>();
      (trendLeads || []).forEach((lead: any) => {
        const date = lead.created_at.split('T')[0]; // Get YYYY-MM-DD
        leadsDateMap.set(date, (leadsDateMap.get(date) || 0) + 1);
      });

      // Group views by date
      const viewsDateMap = new Map<string, number>();
      (trendViews || []).forEach((view: any) => {
        const date = view.viewed_at.split('T')[0]; // Get YYYY-MM-DD
        viewsDateMap.set(date, (viewsDateMap.get(date) || 0) + 1);
      });

      // Combine both maps - get all unique dates
      const allDates = new Set([...leadsDateMap.keys(), ...viewsDateMap.keys()]);

      allDates.forEach((date) => {
        leadsTrend.push({
          date,
          leads: leadsDateMap.get(date) || 0,
          views: viewsDateMap.get(date) || 0,
        });
      });

      // Sort by date
      leadsTrend.sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalLeads,
        newLeads,
        totalViews,
        contactRate: parseFloat(contactRate.toFixed(2)),
        propertiesPerformance,
        leadsTrend,
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
          total_views: analytics.totalViews,
          contact_rate: analytics.contactRate,
          properties_performance: analytics.propertiesPerformance,
          leads_trend: analytics.leadsTrend,
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
      totalViews: data.total_views || 0,
      contactRate: parseFloat(data.contact_rate || 0),
      propertiesPerformance: data.properties_performance || [],
      leadsTrend: data.leads_trend || [],
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
