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
   * OPTIMIZED: Uses parallel queries and database aggregations
   */
  async calculateMetrics(
    landlordId: string,
    dateRange?: DateRange
  ): Promise<LeadAnalytics> {
    try {
      // Determine date range for trend
      const trendDateRange = dateRange || {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        to: new Date()
      };

      // Build date filters
      const dateFilters = dateRange ? {
        leadFrom: dateRange.from.toISOString(),
        leadTo: dateRange.to.toISOString(),
        viewFrom: dateRange.from.toISOString(),
        viewTo: dateRange.to.toISOString()
      } : null;

      const trendFilters = {
        leadFrom: trendDateRange.from.toISOString(),
        leadTo: trendDateRange.to.toISOString(),
        viewFrom: trendDateRange.from.toISOString(),
        viewTo: trendDateRange.to.toISOString()
      };

      // OPTIMIZATION 1: Execute all independent queries in parallel using Promise.all
      const [
        leadsResult,
        propertiesResult,
        totalViewsResult,
        propertyViewsAggResult,
        propertyLeadsAggResult,
        trendLeadsResult,
        trendViewsResult
      ] = await Promise.all([
        // Query 1: Get all leads with status filter
        this.buildLeadsQuery(landlordId, dateFilters).then(query => query),

        // Query 2: Get all properties with full details
        this.supabase
          .from('properties')
          .select('id, title, address')
          .eq('landlord_id', landlordId),

        // Query 3: Get total views count
        this.buildTotalViewsQuery(landlordId, dateFilters),

        // Query 4: Get views aggregated by property (using RPC for efficiency)
        this.buildPropertyViewsAggregation(landlordId, dateFilters),

        // Query 5: Get leads aggregated by property (using RPC for efficiency)
        this.buildPropertyLeadsAggregation(landlordId, dateFilters),

        // Query 6: Get leads by date for trend (with date truncation)
        this.buildLeadsTrendQuery(landlordId, trendFilters),

        // Query 7: Get views by date for trend (with date truncation)
        this.buildViewsTrendQuery(landlordId, trendFilters)
      ]);

      // Process results
      const { data: leads, error: leadsError } = leadsResult;
      if (leadsError) {
        throw new Error('Error fetching leads for analytics');
      }

      const { data: properties, error: propertiesError } = propertiesResult;
      if (propertiesError) {
        throw new Error('Error fetching properties for analytics');
      }

      const totalLeads = leads?.length || 0;
      const newLeads = (leads || []).filter((lead: any) => lead.status === 'new').length;
      const totalViews = totalViewsResult.count || 0;
      const contactRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      // OPTIMIZATION 2: Build properties performance from aggregated data (no loops)
      const propertyIds = (properties || []).map((p: any) => p.id);
      const viewsMap = new Map<string, number>();
      const leadsMap = new Map<string, number>();

      // Build maps from aggregated results
      (propertyViewsAggResult.data || []).forEach((row: any) => {
        viewsMap.set(row.property_id, row.count || 0);
      });

      (propertyLeadsAggResult.data || []).forEach((row: any) => {
        leadsMap.set(row.property_id, row.count || 0);
      });

      // Build properties performance array
      const propertiesPerformance: PropertyPerformance[] = (properties || []).map((property: any) => {
        const views = viewsMap.get(property.id) || 0;
        const propertyLeads = leadsMap.get(property.id) || 0;
        const propertyContactRate = views > 0 ? (propertyLeads / views) * 100 : 0;

        // Extract neighborhood from address JSON
        const address = property.address || {};
        const location = address.neighborhood || address.city || 'Sin ubicación';

        return {
          propertyId: property.id,
          name: property.title || 'Sin nombre',
          location: location,
          views,
          leads: propertyLeads,
          contactRate: parseFloat(propertyContactRate.toFixed(2))
        };
      });

      // Sort by leads descending, then by views descending
      propertiesPerformance.sort((a, b) => {
        if (b.leads !== a.leads) {
          return b.leads - a.leads;
        }
        return b.views - a.views;
      });

      // OPTIMIZATION 3: Build trend data from database aggregations
      const leadsDateMap = new Map<string, number>();
      (trendLeadsResult.data || []).forEach((row: any) => {
        leadsDateMap.set(row.date, row.count || 0);
      });

      const viewsDateMap = new Map<string, number>();
      (trendViewsResult.data || []).forEach((row: any) => {
        viewsDateMap.set(row.date, row.count || 0);
      });

      // Combine both maps - get all unique dates
      const allDates = new Set([...leadsDateMap.keys(), ...viewsDateMap.keys()]);
      const leadsTrend: LeadsTrendData[] = [];

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
   * Helper: Build leads query with filters
   */
  private async buildLeadsQuery(landlordId: string, dateFilters: any) {
    let query = this.supabase
      .from('leads')
      .select('id, status, created_at')
      .eq('landlord_id', landlordId);

    if (dateFilters) {
      query = query
        .gte('created_at', dateFilters.leadFrom)
        .lte('created_at', dateFilters.leadTo);
    }

    return query;
  }

  /**
   * Helper: Build total views count query
   */
  private async buildTotalViewsQuery(landlordId: string, dateFilters: any) {
    // First get property IDs
    const { data: properties } = await this.supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', landlordId);

    const propertyIds = (properties || []).map((p: any) => p.id);

    if (propertyIds.length === 0) {
      return { count: 0, error: null };
    }

    let query = this.supabase
      .from('property_views')
      .select('id', { count: 'exact', head: true })
      .in('property_id', propertyIds);

    if (dateFilters) {
      query = query
        .gte('viewed_at', dateFilters.viewFrom)
        .lte('viewed_at', dateFilters.viewTo);
    }

    return query;
  }

  /**
   * Helper: Build property views aggregation using raw query
   */
  private async buildPropertyViewsAggregation(landlordId: string, dateFilters: any) {
    // Get property IDs first
    const { data: properties } = await this.supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', landlordId);

    const propertyIds = (properties || []).map((p: any) => p.id);

    if (propertyIds.length === 0) {
      return { data: [], error: null };
    }

    // Use RPC or raw SQL for aggregation
    // Since Supabase doesn't have direct group by in JS client, we'll use a workaround
    // by fetching all and grouping in memory (still better than N queries)
    let query = this.supabase
      .from('property_views')
      .select('property_id')
      .in('property_id', propertyIds);

    if (dateFilters) {
      query = query
        .gte('viewed_at', dateFilters.viewFrom)
        .lte('viewed_at', dateFilters.viewTo);
    }

    const result = await query;

    // Group by property_id
    const aggregated = new Map<string, number>();
    (result.data || []).forEach((view: any) => {
      aggregated.set(view.property_id, (aggregated.get(view.property_id) || 0) + 1);
    });

    // Convert to array format
    const data = Array.from(aggregated.entries()).map(([property_id, count]) => ({
      property_id,
      count
    }));

    return { data, error: result.error };
  }

  /**
   * Helper: Build property leads aggregation
   */
  private async buildPropertyLeadsAggregation(landlordId: string, dateFilters: any) {
    let query = this.supabase
      .from('leads')
      .select('property_id')
      .eq('landlord_id', landlordId);

    if (dateFilters) {
      query = query
        .gte('created_at', dateFilters.leadFrom)
        .lte('created_at', dateFilters.leadTo);
    }

    const result = await query;

    // Group by property_id
    const aggregated = new Map<string, number>();
    (result.data || []).forEach((lead: any) => {
      if (lead.property_id) {
        aggregated.set(lead.property_id, (aggregated.get(lead.property_id) || 0) + 1);
      }
    });

    // Convert to array format
    const data = Array.from(aggregated.entries()).map(([property_id, count]) => ({
      property_id,
      count
    }));

    return { data, error: result.error };
  }

  /**
   * Helper: Build leads trend query with date grouping
   */
  private async buildLeadsTrendQuery(landlordId: string, trendFilters: any) {
    const { data: leads } = await this.supabase
      .from('leads')
      .select('created_at')
      .eq('landlord_id', landlordId)
      .gte('created_at', trendFilters.leadFrom)
      .lte('created_at', trendFilters.leadTo);

    // Group by date
    const dateMap = new Map<string, number>();
    (leads || []).forEach((lead: any) => {
      const date = lead.created_at.split('T')[0]; // Get YYYY-MM-DD
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    const data = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    return { data, error: null };
  }

  /**
   * Helper: Build views trend query with date grouping
   */
  private async buildViewsTrendQuery(landlordId: string, trendFilters: any) {
    // Get property IDs first
    const { data: properties } = await this.supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', landlordId);

    const propertyIds = (properties || []).map((p: any) => p.id);

    if (propertyIds.length === 0) {
      return { data: [], error: null };
    }

    const { data: views } = await this.supabase
      .from('property_views')
      .select('viewed_at')
      .in('property_id', propertyIds)
      .gte('viewed_at', trendFilters.viewFrom)
      .lte('viewed_at', trendFilters.viewTo);

    // Group by date
    const dateMap = new Map<string, number>();
    (views || []).forEach((view: any) => {
      const date = view.viewed_at.split('T')[0]; // Get YYYY-MM-DD
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    const data = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    return { data, error: null };
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
