# Backend Requirements for Simplified Analytics Tab

## Overview
The Analytics tab has been redesigned to show only actionable, measurable metrics that align with Heurekka's core functionality: property views and lead generation.

## Required Endpoint

### `landlordDashboard.getAnalytics`

**Purpose**: Return simplified analytics metrics for landlord dashboard

**Input Parameters**:
```typescript
{
  dateRange?: {
    from: Date;
    to: Date;
  }
}
```

**Expected Output**:
```typescript
{
  success: boolean;
  data: {
    // Basic Metrics
    totalLeads: number;           // Total leads received (filtered by dateRange if provided)
    newLeads: number;             // Leads with status = 'new' (unread)
    totalViews: number;           // Total property views (all landlord's properties)
    contactRate: number;          // (totalLeads / totalViews) * 100

    // Property Performance
    propertiesPerformance: Array<{
      propertyId: string;
      name: string;               // Property name/title
      location: string;           // Property location (e.g., "Col. Tepeyac")
      views: number;              // Views for this property
      leads: number;              // Leads generated from this property
      contactRate: number;        // (leads / views) * 100 for this property
    }>;

    // Leads Trend (Time Series)
    leadsTrend: Array<{
      date: string;               // ISO date string (e.g., "2025-10-01")
      leads: number;              // Number of leads received on that date
    }>;
  };
}
```

## SQL Queries Needed

### 1. Total Leads
```sql
SELECT COUNT(*) as totalLeads
FROM leads
WHERE landlord_id = ?
AND (created_at BETWEEN ? AND ?)  -- if dateRange provided
```

### 2. New Leads (Unread)
```sql
SELECT COUNT(*) as newLeads
FROM leads
WHERE landlord_id = ?
AND status = 'new'
AND (created_at BETWEEN ? AND ?)  -- if dateRange provided
```

### 3. Total Views
```sql
SELECT COUNT(*) as totalViews
FROM property_views pv
JOIN properties p ON pv.property_id = p.id
WHERE p.landlord_id = ?
AND (pv.viewed_at BETWEEN ? AND ?)  -- if dateRange provided
```

### 4. Properties Performance
```sql
SELECT
  p.id as propertyId,
  p.name,
  p.location,
  COUNT(DISTINCT pv.id) as views,
  COUNT(DISTINCT l.id) as leads,
  CASE
    WHEN COUNT(DISTINCT pv.id) > 0
    THEN (COUNT(DISTINCT l.id)::float / COUNT(DISTINCT pv.id) * 100)
    ELSE 0
  END as contactRate
FROM properties p
LEFT JOIN property_views pv ON p.id = pv.property_id
LEFT JOIN leads l ON p.id = l.property_id
WHERE p.landlord_id = ?
AND (pv.viewed_at BETWEEN ? AND ? OR pv.viewed_at IS NULL)  -- if dateRange
AND (l.created_at BETWEEN ? AND ? OR l.created_at IS NULL)  -- if dateRange
GROUP BY p.id, p.name, p.location
ORDER BY leads DESC, views DESC
```

### 5. Leads Trend (Last 30 days or custom range)
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as leads
FROM leads
WHERE landlord_id = ?
AND created_at BETWEEN ? AND ?  -- dateRange (default: last 30 days)
GROUP BY DATE(created_at)
ORDER BY date ASC
```

## Database Schema Assumptions

The backend queries assume the following tables exist:

### `leads` table
- `id` (uuid)
- `landlord_id` (uuid) - foreign key
- `property_id` (uuid) - foreign key
- `tenant_id` (uuid) - foreign key
- `status` (enum: 'new', 'viewed', 'contacted', etc.)
- `created_at` (timestamp)

### `properties` table
- `id` (uuid)
- `landlord_id` (uuid) - foreign key
- `name` (text)
- `location` (text)

### `property_views` table (NEW - needs to be created if doesn't exist)
- `id` (uuid)
- `property_id` (uuid) - foreign key
- `viewer_id` (uuid) - nullable (tenant who viewed, can be null for anonymous)
- `viewed_at` (timestamp)

## Important Notes

1. **Property Views Tracking**: If `property_views` table doesn't exist, you need to create it and start tracking when users view property detail pages.

2. **Default Date Range**: If no `dateRange` is provided, use:
   - For `leadsTrend`: last 30 days
   - For all other metrics: all time

3. **Performance**: Consider adding indexes on:
   - `leads.landlord_id`
   - `leads.created_at`
   - `property_views.property_id`
   - `property_views.viewed_at`

4. **Contact Rate Calculation**: Always handle division by zero (when views = 0, contactRate = 0)

## Migration Needed

If `property_views` table doesn't exist:

```sql
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at);
```

## Frontend Implementation Complete

The following files have been updated:
- ✅ `/heurekka-frontend/src/components/landlord/AnalyticsTab/index.tsx` - Redesigned UI
- ✅ `/heurekka-frontend/src/hooks/landlord/useLandlordAnalytics.ts` - Updated hook with new types
- ✅ Installed shadcn chart component for the line chart

## Next Steps for Backend Team

1. ✅ Verify `property_views` table exists (create if needed)
2. ✅ Implement tracking of property views in property detail endpoint
3. ✅ Update `landlordDashboard.getAnalytics` endpoint to return new structure
4. ✅ Test with sample data to ensure metrics are calculated correctly
5. ✅ Add proper error handling for edge cases (no leads, no views, etc.)
