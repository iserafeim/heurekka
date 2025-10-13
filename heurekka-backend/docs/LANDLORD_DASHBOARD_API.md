# Landlord Dashboard API Documentation

## Overview

The Landlord Dashboard API provides comprehensive lead management capabilities for property owners and agents. It enables landlords to view, filter, respond to tenant inquiries, track analytics, and manage response templates.

**Important**: This API focuses EXCLUSIVELY on lead management - viewing tenant inquiries, reviewing profiles, and responding to contacts. Property listing creation and management are handled separately.

## Architecture

### Database Schema

#### Tables Created

1. **`leads`** - Main lead management table
   - Tracks tenant inquiries as leads
   - Stores status, priority, quality indicators
   - Links to tenant profiles, properties, and landlords
   - Includes conversation tracking and response metrics
   - RLS enabled for landlord-specific access

2. **`response_templates`** - Message templates
   - Stores reusable message templates for landlords
   - Categorized by type (greeting, viewing_invitation, follow_up, etc.)
   - Tracks usage statistics
   - RLS enabled for landlord-specific access

3. **`lead_analytics`** - Analytics cache
   - Pre-calculated metrics for performance
   - Cached for 15 minutes to reduce database load
   - Includes response rates, conversion rates, distributions
   - RLS enabled for landlord-specific access

### Services

1. **`lead.service.ts`** - Core lead management
   - Lead CRUD operations
   - Filtering, pagination, sorting
   - Status management and tracking
   - Priority calculation
   - Bulk operations

2. **`lead-analytics.service.ts`** - Metrics and analytics
   - Calculate response rates, conversion rates
   - Aggregate quality/priority/source distributions
   - Cache management (15-minute TTL)
   - Date range filtering

3. **`response-template.service.ts`** - Template management
   - Template CRUD operations
   - Variable extraction and replacement
   - Usage tracking
   - Category filtering

## API Endpoints

All endpoints are under the `landlordDashboard` namespace and require authentication.

### Lead Management

#### `getLeads`

Get leads for the authenticated landlord with filtering, pagination, and sorting.

**Input**:
```typescript
{
  filters?: {
    status?: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
    priority?: ('high' | 'medium' | 'low')[];
    quality?: ('high' | 'medium' | 'low')[];
    propertyId?: string; // UUID
    dateRange?: {
      from?: Date;
      to?: Date;
    };
    searchQuery?: string; // Search in tenant name, inquiry message
  };
  pagination?: {
    page?: number; // Default: 1
    limit?: number; // Default: 20, Max: 100
  };
  sorting?: {
    field?: 'createdAt' | 'updatedAt' | 'priority' | 'quality'; // Default: 'createdAt'
    direction?: 'asc' | 'desc'; // Default: 'desc'
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

**Example**:
```typescript
const result = await trpc.landlordDashboard.getLeads.query({
  filters: {
    status: 'new',
    priority: ['high', 'medium']
  },
  pagination: {
    page: 1,
    limit: 20
  }
});
```

#### `getLead`

Get a single lead by ID with full details.

**Input**:
```typescript
{
  leadId: string; // UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  data: Lead; // Includes tenant, property, landlord relationships
}
```

#### `markLeadAsRead`

Mark a lead as read and update its status.

**Input**:
```typescript
{
  leadId: string; // UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  data: Lead;
  message: string;
}
```

**Side Effects**:
- Sets `unread_count` to 0
- Sets `first_viewed_at` if not already set
- Updates status from 'new' to 'viewed' if applicable

#### `updateLeadStatus`

Update the status of a lead.

**Input**:
```typescript
{
  leadId: string; // UUID
  status: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
}
```

**Response**:
```typescript
{
  success: boolean;
  data: Lead;
  message: string;
}
```

**Side Effects**:
- If status is 'contacted': Sets `responded_at` and calculates `response_time_minutes`
- If status is 'completed' or 'rejected': Sets `closed_at`

#### `respondToLead`

Send a response to a lead.

**Input**:
```typescript
{
  leadId: string; // UUID
  method: 'whatsapp' | 'email' | 'phone';
  message: string;
  templateId?: string; // UUID - Optional template used
}
```

**Response**:
```typescript
{
  success: boolean;
  data: Lead;
  message: string;
}
```

**Side Effects**:
- Updates lead status to 'contacted'
- Sets `responded_at` and `response_time_minutes`
- Updates `last_message` and `last_message_at`
- Increments template usage count if templateId provided

#### `bulkUpdateLeads`

Update multiple leads at once.

**Input**:
```typescript
{
  leadIds: string[]; // UUID[] - Minimum 1 lead
  updates: {
    status?: 'new' | 'viewed' | 'contacted' | 'scheduled' | 'completed' | 'rejected' | 'expired';
    priority?: 'high' | 'medium' | 'low';
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    success: boolean;
    updatedCount: number;
  };
  message: string;
}
```

### Analytics

#### `getAnalytics`

Get analytics for the landlord's leads with optional date range.

**Input**:
```typescript
{
  dateRange?: {
    from: Date;
    to: Date;
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    totalLeads: number;
    newLeads: number;
    viewedLeads: number;
    contactedLeads: number;
    scheduledLeads: number;
    completedLeads: number;
    rejectedLeads: number;

    responseRate: number; // Percentage
    avgResponseTimeMinutes: number;
    conversionRate: number; // Percentage

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

    calculatedAt: string; // ISO timestamp
  };
}
```

**Caching**: Results are cached for 15 minutes based on landlord ID and date range.

### Response Templates

#### `getResponseTemplates`

Get all response templates for the landlord, optionally filtered by category.

**Input**:
```typescript
{
  category?: 'greeting' | 'viewing_invitation' | 'follow_up' | 'document_request' | 'rejection' | 'general';
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ResponseTemplate[]; // Ordered by usage count DESC
}
```

#### `createResponseTemplate`

Create a new response template.

**Input**:
```typescript
{
  name: string; // Required, min 1 character
  category: 'greeting' | 'viewing_invitation' | 'follow_up' | 'document_request' | 'rejection' | 'general';
  content: string; // Required, min 1 character
  variables?: string[]; // Optional, auto-extracted if not provided
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ResponseTemplate;
  message: string;
}
```

**Variable Extraction**: Variables in format `{{variable_name}}` are automatically extracted from content.

#### `updateResponseTemplate`

Update an existing response template.

**Input**:
```typescript
{
  templateId: string; // UUID
  name?: string;
  content?: string;
  variables?: string[]; // Auto-extracted if content changes
}
```

**Response**:
```typescript
{
  success: boolean;
  data: ResponseTemplate;
  message: string;
}
```

#### `deleteResponseTemplate`

Delete a response template.

**Input**:
```typescript
{
  templateId: string; // UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

## Data Models

### Lead

```typescript
interface Lead {
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

  // Populated relationships
  tenant?: TenantProfile;
  property?: Property;
  landlord?: Landlord;
}
```

### ResponseTemplate

```typescript
interface ResponseTemplate {
  id: string;
  landlordId: string;
  name: string;
  category: 'greeting' | 'viewing_invitation' | 'follow_up' | 'document_request' | 'rejection' | 'general';
  content: string;
  variables: string[]; // e.g., ['tenant_name', 'property_address']
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Template Variables

Available variables for response templates:

- `{{tenant_name}}` - Tenant's full name
- `{{property_address}}` - Property neighborhood/address
- `{{property_price}}` - Property price (formatted)
- `{{landlord_name}}` - Landlord's name or business name
- `{{landlord_phone}}` - Landlord's phone or WhatsApp number
- `{{tenant_budget}}` - Tenant's maximum budget (formatted)
- `{{tenant_move_date}}` - Tenant's move date preference
- `{{property_bedrooms}}` - Number of bedrooms
- `{{property_bathrooms}}` - Number of bathrooms
- `{{property_type}}` - Property type (translated to Spanish)

**Example Template**:
```
Hola {{tenant_name}},

Gracias por tu interés en {{property_address}}. La propiedad está disponible por L.{{property_price}} mensuales.

Me gustaría agendar una visita. ¿Cuándo te vendría bien?

Saludos,
{{landlord_name}}
{{landlord_phone}}
```

## Authorization

All endpoints require:
1. User authentication (via `ctx.auth.isAuthenticated`)
2. Active landlord profile (queried via `landlords` table)
3. Ownership verification (leads/templates must belong to authenticated landlord)

RLS policies enforce:
- Landlords can only access their own leads
- Landlords can only access their own templates
- Landlords can only view analytics for their own leads

## Error Handling

### Common Error Codes

- `UNAUTHORIZED` (401) - User not authenticated
- `FORBIDDEN` (403) - User lacks permission to access resource
- `NOT_FOUND` (404) - Resource not found (lead, template, landlord profile)
- `BAD_REQUEST` (400) - Invalid input parameters
- `INTERNAL_SERVER_ERROR` (500) - Server error

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
  }
}
```

## Performance Considerations

### Caching

- **Analytics**: Cached for 15 minutes per landlord and date range
- **Cache Invalidation**: Automatic on lead status updates

### Pagination

- Default page size: 20 leads
- Maximum page size: 100 leads
- Use pagination for large lead lists to reduce load

### Indexes

Optimized indexes on:
- `landlord_id + status + created_at` (most common query pattern)
- `property_id`, `tenant_id`, `status`, `priority`, `created_at`

### Query Optimization

- Leads query uses selective joins (only tenant and property basics)
- Full lead details only loaded on `getLead` (single lead view)
- Analytics use aggregations with pre-calculated cache

## Implementation Decisions

### 1. Simplified Conversation Tracking

**Decision**: Store conversation fields directly in `leads` table instead of separate `conversations` table.

**Rationale**:
- Reduces complexity for MVP
- Most leads have minimal conversation history
- Can migrate to separate table later if needed
- Improves query performance for lead lists

### 2. Lead Priority Calculation

**Decision**: Calculate priority based on multiple factors:
- Tenant verification (30%)
- Budget match with property (25%)
- Move date urgency (20%)
- Profile completeness (15%)
- Has references (10%)

**Rationale**:
- Surfaces highest-quality leads first
- Balances multiple quality indicators
- Encourages tenant profile completion

### 3. Analytics Caching Strategy

**Decision**: Cache analytics for 15 minutes with automatic invalidation.

**Rationale**:
- Reduces database load for frequently accessed metrics
- 15 minutes balances freshness with performance
- Cache key includes date range for flexibility
- Automatic invalidation not implemented for MVP (manual refresh acceptable)

### 4. Response Templates

**Decision**: Store templates per landlord (not shared/global).

**Rationale**:
- Each landlord has unique communication style
- Privacy - avoid exposing one landlord's messages to another
- Simpler permissions (landlord owns templates)
- Can add shared/marketplace templates later

### 5. RLS Policies

**Decision**: Enable RLS on all new tables with landlord-specific policies.

**Rationale**:
- Database-level security enforcement
- Prevents accidental data leaks
- Complements application-level authorization
- Supabase best practice

## Testing Recommendations

### Unit Tests

Test service methods:
- `leadService.getLeadsForLandlord()` - filtering, pagination, sorting
- `leadService.calculateLeadPriority()` - priority algorithm
- `analyticsService.calculateMetrics()` - aggregations
- `templateService.replaceVariables()` - variable substitution

### Integration Tests

Test router endpoints:
- Lead CRUD operations with authentication
- Authorization (landlord can only access own leads)
- Bulk operations
- Template management

### Performance Tests

- Load test with 1000+ leads
- Pagination stress test
- Analytics calculation with large datasets
- Concurrent user scenarios

## Future Enhancements

### Planned Features

1. **Conversation System**
   - Separate `conversations` and `messages` tables
   - Full conversation threading
   - Read receipts
   - Message attachments

2. **Real-time Notifications**
   - WebSocket/Supabase Realtime integration
   - Push notifications for new leads
   - Live lead status updates

3. **Advanced Analytics**
   - Lead source tracking
   - Conversion funnel visualization
   - A/B testing for response templates
   - Predictive lead scoring (ML)

4. **Template Marketplace**
   - Shared/curated templates
   - Template ratings and reviews
   - Language/region-specific templates

5. **Lead Automation**
   - Auto-response for common inquiries
   - Lead routing rules
   - Scheduled follow-ups
   - Integration with calendar for viewings

6. **Team Management**
   - Multiple users per landlord account
   - Lead assignment
   - Team performance metrics
   - Role-based permissions

## Database Migrations

Location: `heurekka-backend/migrations/`

Migrations applied:
1. `create_leads_table` - Creates `leads` table with indexes and RLS
2. `create_response_templates_table` - Creates `response_templates` table with RLS
3. `create_lead_analytics_table` - Creates `lead_analytics` cache table with RLS

To rollback (if needed):
```sql
DROP TABLE IF EXISTS lead_analytics CASCADE;
DROP TABLE IF EXISTS response_templates CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP FUNCTION IF EXISTS update_leads_updated_at CASCADE;
DROP FUNCTION IF EXISTS update_response_templates_updated_at CASCADE;
```

## Security Notes

### Warnings from Supabase Advisors

1. **Function Search Path Mutable** - Trigger functions lack explicit search_path
   - Impact: Low - triggers operate in controlled context
   - Recommendation: Add `SET search_path = public, extensions` to function definitions

2. **Spatial Ref Sys RLS** - PostGIS system table without RLS
   - Impact: None - System table, read-only
   - Action: None required

3. **Extensions in Public Schema** - PostGIS, pg_trgm in public schema
   - Impact: Low - Standard practice for these extensions
   - Action: None required for MVP

### Best Practices Implemented

- ✅ RLS enabled on all user-facing tables
- ✅ Landlord-specific policies for data isolation
- ✅ Service role key used for admin operations
- ✅ Input validation via Zod schemas
- ✅ Authorization checks at service layer
- ✅ SQL injection prevention via parameterized queries

## Support & Contact

For questions or issues:
- Review design documentation: `/design-documentation/features/landlord-dashboard/`
- Check implementation guide: `/design-documentation/features/landlord-dashboard/implementation.md`
- Backend services: `/heurekka-backend/src/services/`
- API routers: `/heurekka-backend/src/routers/`
