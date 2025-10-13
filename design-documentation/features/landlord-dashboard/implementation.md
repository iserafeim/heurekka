---
title: Landlord Dashboard - Implementation Guide
description: Developer handoff documentation for implementing landlord dashboard
feature: landlord-dashboard
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./interactions.md
  - ./accessibility.md
  - ../../design-system/style-guide.md
status: approved
---

# Landlord Dashboard - Implementation Guide

## Overview
Complete technical implementation guide for developers building the landlord dashboard feature within the unified `/dashboard` route. Covers tab-based navigation, lead management, real-time updates, WhatsApp integration, and extensive use of shadcn/ui components for consistent, accessible UI patterns.

**Key Architecture**: This feature operates within a unified dashboard that serves multiple user roles via tab-based navigation. Landlord tabs (Leads, Analytics, Mi Perfil) integrate seamlessly with tenant tabs for dual-context users.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [shadcn Component Dependencies](#shadcn-component-dependencies)
3. [Tab Navigation System](#tab-navigation-system)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Data Models](#data-models)
7. [Real-time Implementation](#real-time-implementation)
8. [WhatsApp Integration](#whatsapp-integration)
9. [Performance Optimization](#performance-optimization)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)

## Component Architecture

### Component Hierarchy
```typescript
// Main component structure - Integrated with Unified Dashboard
UnifiedDashboard/
├── Dashboard.tsx                   // Main container (shared tenant/landlord)
├── components/
│   ├── Sidebar/
│   │   ├── TabNavigation.tsx      // Role-aware tab list
│   │   ├── RoleSeparator.tsx      // Visual divider for dual-context
│   │   └── ProfileIndicator.tsx   // Current context display
│   ├── TabContent/
│   │   ├── LeadsTab/              // Landlord Leads tab content
│   │   │   ├── LeadList.tsx
│   │   │   ├── LeadCard.tsx       // Uses shadcn Card, Badge, Avatar
│   │   │   ├── LeadFilters.tsx    // Uses shadcn Select, Input
│   │   │   ├── BulkActions.tsx    // Uses shadcn Button, Checkbox
│   │   │   └── EmptyState.tsx
│   │   ├── AnalyticsTab/          // Landlord Analytics tab content
│   │   │   ├── MetricsOverview.tsx
│   │   │   ├── ChartsSection.tsx
│   │   │   └── InsightsPanel.tsx
│   │   └── ProfileTab/            // Mi Perfil with context toggle
│   │       ├── ProfileView.tsx
│   │       ├── ContextToggle.tsx  // Uses shadcn Switch
│   │       └── ProfileForm.tsx
│   ├── LeadDetails/
│   │   ├── DetailPanel.tsx
│   │   ├── TenantProfile.tsx
│   │   ├── PropertyInfo.tsx
│   │   ├── ConversationThread.tsx
│   │   └── QuickResponse.tsx
│   ├── Response/
│   │   ├── ResponseModal.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── MessageComposer.tsx
│   │   └── WhatsAppLauncher.tsx
│   └── Settings/
│       ├── SettingsPanel.tsx
│       ├── NotificationSettings.tsx
│       ├── ResponseTemplates.tsx
│       └── TeamManagement.tsx
├── hooks/
│   ├── useLeadManagement.ts
│   ├── useRealtimeUpdates.ts
│   ├── useWhatsApp.ts
│   └── useNotifications.ts
├── services/
│   ├── leadAPI.ts
│   ├── websocketService.ts
│   ├── whatsappService.ts
│   ├── notificationService.ts
└── utils/
    ├── leadPriority.ts
    ├── dateHelpers.ts
    ├── formatters.ts
    └── validators.ts
```

## shadcn Component Dependencies

### Required shadcn Components from @shadcn Registry

Developers must install the following shadcn/ui components before implementing the landlord dashboard features:

#### Core Layout Components
```bash
# Tab navigation system
npx shadcn-ui@latest add tabs

# Sidebar layout
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
```

#### Lead Management Components
```bash
# Lead cards and containers
npx shadcn-ui@latest add card
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge

# Lead filtering and search
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox

# Actions and buttons
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dropdown-menu
```

#### Response and Modal Components
```bash
# Response modal
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add textarea

# Template selector
npx shadcn-ui@latest add command
npx shadcn-ui@latest add popover
```

#### Profile and Settings Components
```bash
# Profile context toggle (dual-context users)
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add label

# Forms and inputs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add radio-group
```

#### Feedback and Loading States
```bash
# Loading states
npx shadcn-ui@latest add skeleton

# Notifications and toasts
npx shadcn-ui@latest add toast

# Progress indicators
npx shadcn-ui@latest add progress
```

#### Analytics Components
```bash
# Charts and data visualization
npx shadcn-ui@latest add chart

# Tables for data display
npx shadcn-ui@latest add table
```

### Component Usage Map

| Feature Area | shadcn Components Used |
|--------------|------------------------|
| **Tab Navigation** | Tabs, ScrollArea, Separator, Badge (for counts) |
| **Lead Cards** | Card, Avatar, Badge (status/priority) |
| **Lead Filtering** | Input (search), Select (dropdowns), Checkbox (multi-select) |
| **Bulk Actions** | Checkbox, Button, DropdownMenu |
| **Lead Details** | Card, Badge, Button, Separator |
| **Response Modal** | Dialog, Textarea, Button, Command (templates) |
| **Profile Toggle** | Switch, Label |
| **Loading States** | Skeleton |
| **Notifications** | Toast |
| **Analytics** | Chart, Table, Card |

### Component Customization Notes

- **Tabs Component**: Customize for vertical sidebar layout instead of default horizontal
- **Card Component**: Apply consistent shadows and hover states across all lead cards
- **Badge Component**: Create custom variants for lead priority (high/medium/low)
- **Switch Component**: Style to match brand colors for profile context toggle
- **Dialog Component**: Ensure responsive behavior for response modal on mobile

## Tab Navigation System

### Unified Dashboard Tab Structure

```typescript
interface TabConfiguration {
  id: string;
  label: string;
  icon: React.ComponentType;
  role: 'tenant' | 'landlord' | 'shared';
  component: React.ComponentType;
  badge?: number; // Notification count
}

const landlordTabs: TabConfiguration[] = [
  {
    id: 'leads',
    label: 'Leads',
    icon: InboxIcon,
    role: 'landlord',
    component: LeadsTab,
    badge: unreadLeadsCount
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartBarIcon,
    role: 'landlord',
    component: AnalyticsTab
  },
  {
    id: 'mi-perfil',
    label: 'Mi Perfil',
    icon: UserIcon,
    role: 'shared',
    component: ProfileTab
  }
];
```

### Core Components Implementation

#### Main Dashboard Component with Tab System
```typescript
interface DashboardProps {
  userId: string;
  userRole: 'tenant-only' | 'landlord-only' | 'dual-context';
  initialTab?: string;
}

const UnifiedDashboard: React.FC<DashboardProps> = ({
  userId,
  userRole,
  initialTab
}) => {
  // Determine visible tabs based on user role
  const visibleTabs = useMemo(() => {
    return getTabsForUserRole(userRole);
  }, [userRole]);

  // Parse initial tab from URL or prop
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromUrl || initialTab || getDefaultTab(userRole)
  );

  // Lead management state (for Leads tab)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
  
  // Custom hooks
  const { 
    filteredLeads, 
    applyFilters, 
    sortLeads 
  } = useLeadManagement(leads, filters);
  
  const { 
    isConnected, 
    subscribe 
  } = useRealtimeUpdates();
  
  const { 
    metrics, 
    loading: metricsLoading 
  } = useAnalytics(selectedProperty);
  
  // Real-time subscription
  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe('leads', (update) => {
        handleRealtimeUpdate(update);
      });
      
      return () => unsubscribe();
    }
  }, [isConnected]);
  
  // Load initial data
  useEffect(() => {
    loadLeads();
    loadMetrics();
  }, [selectedProperty]);
  
  const loadLeads = async () => {
    try {
      const data = await leadAPI.getLeads({
        propertyId: selectedProperty,
        ...filters
      });
      setLeads(data);
    } catch (error) {
      showError('Failed to load leads');
    }
  };
  
  const handleRealtimeUpdate = (update: RealtimeUpdate) => {
    switch (update.type) {
      case 'new_lead':
        setLeads(prev => [update.data, ...prev]);
        showNotification('New lead received');
        break;
      case 'lead_updated':
        setLeads(prev => prev.map(lead => 
          lead.id === update.data.id ? update.data : lead
        ));
        break;
      case 'lead_deleted':
        setLeads(prev => prev.filter(lead => 
          lead.id !== update.data.id
        ));
        break;
    }
  };
  
  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar with Tabs - uses shadcn Tabs component */}
      <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical">
        <div className="dashboard-sidebar">
          <ScrollArea className="h-full">
            <TabsList className="sidebar-tabs">
              {visibleTabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="tab-trigger"
                  aria-label={tab.label}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                  {tab.badge > 0 && (
                    <Badge className="ml-auto" variant="secondary">
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}

              {/* Role separator for dual-context users */}
              {userRole === 'dual-context' && (
                <>
                  <Separator className="role-separator" />
                  <p className="role-label">Sección de Inquilino</p>
                  {/* Tenant tabs would render here */}
                </>
              )}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Main Content Area - renders active tab */}
        <div className="dashboard-main">
          <TabsContent value="leads" className="tab-content">
            <LeadsTab
              leads={filteredLeads}
              filters={filters}
              onFilterChange={setFilters}
              onLeadSelect={setSelectedLead}
              selectedLead={selectedLead}
            />
          </TabsContent>

          <TabsContent value="analytics" className="tab-content">
            <AnalyticsTab userId={userId} />
          </TabsContent>

          <TabsContent value="mi-perfil" className="tab-content">
            <ProfileTab
              userId={userId}
              userRole={userRole}
              showContextToggle={userRole === 'dual-context'}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Lead Detail Panel (slides from right when lead selected) */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRespond={handleRespond}
        />
      )}
    </div>
  );
};

// Helper functions
function getTabsForUserRole(role: string): TabConfiguration[] {
  const landlordTabs = [
    { id: 'leads', label: 'Leads', icon: InboxIcon, role: 'landlord' },
    { id: 'analytics', label: 'Analytics', icon: ChartIcon, role: 'landlord' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: UserIcon, role: 'shared' }
  ];

  const tenantTabs = [
    { id: 'busquedas', label: 'Búsquedas Guardadas', icon: SearchIcon, role: 'tenant' },
    { id: 'favoritos', label: 'Favoritos', icon: HeartIcon, role: 'tenant' },
    { id: 'conversaciones', label: 'Conversaciones', icon: ChatIcon, role: 'tenant' },
    { id: 'mi-perfil', label: 'Mi Perfil', icon: UserIcon, role: 'shared' }
  ];

  switch(role) {
    case 'landlord-only':
      return landlordTabs;
    case 'tenant-only':
      return tenantTabs;
    case 'dual-context':
      return [...landlordTabs, ...tenantTabs]; // Show all tabs
    default:
      return [];
  }
}

function getDefaultTab(role: string): string {
  return role === 'tenant-only' ? 'busquedas' : 'leads';
}
```

#### Lead Card Component (Using shadcn Components)
**Required Components**: Card, Avatar, Badge, Button

```typescript
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (lead: Lead) => void;
  onQuickAction: (action: QuickAction, lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = memo(({
  lead,
  isSelected,
  onSelect,
  onQuickAction
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priorityLevel = useLeadPriority(lead);
  const timeAgo = useTimeAgo(lead.receivedAt);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onQuickAction('archive', lead),
    onSwipedRight: () => onQuickAction('respond', lead),
    trackMouse: false
  });

  return (
    <Card
      {...swipeHandlers}
      className={classNames(
        'lead-card cursor-pointer transition-all duration-200',
        {
          'ring-2 ring-primary': isSelected,
          'bg-blue-50 border-l-4 border-l-primary': !lead.isRead,
          'hover:shadow-lg hover:-translate-y-1': true
        }
      )}
      onClick={() => onSelect(lead)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Lead from ${lead.tenant.name}`}
    >
      {!lead.isRead && (
        <div className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* shadcn Avatar component */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={lead.tenant.avatar} alt={lead.tenant.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {lead.tenant.initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold text-base">{lead.tenant.name}</h3>
              <p className="text-sm text-muted-foreground">{lead.tenant.occupation}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {/* shadcn Badge for priority */}
            <Badge
              variant={priorityLevel === 'high' ? 'default' : 'secondary'}
              className={classNames({
                'bg-blue-100 text-blue-700': priorityLevel === 'high',
                'bg-yellow-100 text-yellow-700': priorityLevel === 'medium',
                'bg-gray-100 text-gray-700': priorityLevel === 'low'
              })}
            >
              {priorityLevel.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Lead details grid */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>Move: {formatDate(lead.moveDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyIcon className="w-4 h-4 text-muted-foreground" />
            <span>Budget: {formatCurrency(lead.budget)}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
            <span>{lead.occupants} occupants</span>
          </div>
        </div>

        {/* Property reference */}
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
          <img
            src={lead.property.image}
            alt={lead.property.title}
            className="w-16 h-16 rounded object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-sm">{lead.property.title}</p>
            <Badge variant="outline" className="mt-1">
              {lead.relevanceScore}% match
            </Badge>
          </div>
        </div>

        {/* Quick actions - shown on hover using shadcn Buttons */}
        {isHovered && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction('whatsapp', lead);
              }}
              aria-label="Send WhatsApp message"
            >
              <WhatsAppIcon className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction('email', lead);
              }}
              aria-label="Send email"
            >
              <EmailIcon className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default LeadCard;
```

## State Management

### Global State Structure
```typescript
// Redux/Context state structure
interface DashboardState {
  leads: {
    items: Lead[];
    filters: LeadFilters;
    sorting: SortOption;
    selectedIds: string[];
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  
  analytics: {
    metrics: DashboardMetrics;
    charts: {
      responseTime: ChartData;
      qualityDistribution: ChartData;
      conversionFunnel: ChartData;
      propertyPerformance: ChartData;
    };
    dateRange: DateRange;
    loading: boolean;
  };
  
  user: {
    id: string;
    properties: Property[];
    selectedProperty: string | null;
    settings: UserSettings;
    responseTemplates: ResponseTemplate[];
  };
  
  realtime: {
    connected: boolean;
    lastUpdate: Date | null;
    pendingUpdates: RealtimeUpdate[];
  };
  
  ui: {
    currentView: ViewType;
    detailPanelOpen: boolean;
    selectedLead: Lead | null;
    responseModalOpen: boolean;
    notifications: Notification[];
  };
}

// Actions
const leadActions = {
  FETCH_LEADS_REQUEST: 'leads/fetchRequest',
  FETCH_LEADS_SUCCESS: 'leads/fetchSuccess',
  FETCH_LEADS_FAILURE: 'leads/fetchFailure',
  UPDATE_LEAD: 'leads/update',
  DELETE_LEAD: 'leads/delete',
  MARK_AS_READ: 'leads/markAsRead',
  UPDATE_FILTERS: 'leads/updateFilters',
  SELECT_LEADS: 'leads/select',
  BULK_UPDATE: 'leads/bulkUpdate'
};
```

### Lead Management Hook
```typescript
const useLeadManagement = (initialLeads: Lead[], initialFilters: LeadFilters) => {
  const [leads, setLeads] = useState(initialLeads);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Quality filter
      if (filters.quality.length > 0) {
        const priority = calculateLeadPriority(lead);
        if (!filters.priority.includes(priority.level)) return false;
      }
      
      // Status filter
      if (filters.status && lead.status !== filters.status) {
        return false;
      }
      
      // Property filter
      if (filters.propertyId && lead.property.id !== filters.propertyId) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const leadDate = new Date(lead.receivedAt);
        const { from, to } = filters.dateRange;
        if (from && leadDate < from) return false;
        if (to && leadDate > to) return false;
      }
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          lead.tenant.name,
          lead.tenant.occupation,
          lead.property.title
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  }, [leads, filters]);
  
  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
        case 'oldest':
          return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
        case 'quality':
          return calculateLeadPriority(b).urgency - calculateLeadPriority(a).urgency;
        case 'urgency':
          return getUrgencyScore(a) - getUrgencyScore(b);
        default:
          return 0;
      }
    });
  }, [filteredLeads, sortBy]);
  
  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, ...updates } : lead
    ));
  }, []);
  
  const deleteLead = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  }, []);
  
  const bulkUpdate = useCallback((leadIds: string[], updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead =>
      leadIds.includes(lead.id) ? { ...lead, ...updates } : lead
    ));
  }, []);
  
  return {
    leads: sortedLeads,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    updateLead,
    deleteLead,
    bulkUpdate,
    totalCount: leads.length,
    filteredCount: filteredLeads.length
  };
};
```

## API Integration

### Lead API Service
```typescript
class LeadAPIService {
  private baseURL = process.env.REACT_APP_API_URL;
  private token = getAuthToken();
  
  // Fetch leads with filters
  async getLeads(params: LeadQueryParams): Promise<LeadResponse> {
    const queryString = new URLSearchParams(params).toString();
    
    const response = await fetch(`${this.baseURL}/leads?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }
  
  // Get single lead details
  async getLead(leadId: string): Promise<Lead> {
    const response = await fetch(`${this.baseURL}/leads/${leadId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    return response.json();
  }
  
  // Update lead status
  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead> {
    const response = await fetch(`${this.baseURL}/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    return response.json();
  }
  
  // Mark as read
  async markAsRead(leadId: string): Promise<void> {
    await fetch(`${this.baseURL}/leads/${leadId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
  
  // Send response
  async sendResponse(leadId: string, response: ResponseData): Promise<void> {
    await fetch(`${this.baseURL}/leads/${leadId}/respond`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    });
  }
  
  // Bulk operations
  async bulkUpdate(leadIds: string[], updates: Partial<Lead>): Promise<void> {
    await fetch(`${this.baseURL}/leads/bulk`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leadIds, updates })
    });
  }
  
  // Get analytics
  async getAnalytics(params: AnalyticsParams): Promise<AnalyticsData> {
    const queryString = new URLSearchParams(params).toString();
    
    const response = await fetch(`${this.baseURL}/analytics/leads?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    return response.json();
  }
}
```

## Data Models

### TypeScript Interfaces
```typescript
// Core lead model
interface Lead {
  id: string;
  tenant: TenantProfile;
  property: PropertyReference;
  metadata: LeadMetadata;
  status: LeadStatus;
  conversation: ConversationData;
  priority: LeadPriority;
  timestamps: {
    receivedAt: Date;
    firstViewedAt?: Date;
    respondedAt?: Date;
    closedAt?: Date;
  };
}

interface TenantProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  occupation: string;
  company?: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  moveDate: Date;
  urgency: 'immediate' | 'planned' | 'flexible';
  occupants: number;
  preferences: {
    propertyTypes: PropertyType[];
    neighborhoods: string[];
    amenities: string[];
  };
  verification: {
    email: boolean;
    phone: boolean;
    identity?: boolean;
  };
  searchProfile?: SearchProfile;
}

interface PropertyReference {
  id: string;
  title: string;
  address: string;
  price: number;
  image: string;
  availability: Date;
  relevanceScore: number;
}

interface LeadMetadata {
  source: 'direct' | 'marketplace' | 'search' | 'referral';
  channel: 'web' | 'mobile' | 'api';
  campaign?: string;
  referrer?: string;
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
}

interface ConversationData {
  threadId: string;
  messages: Message[];
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  responseTime?: number; // in minutes
  totalMessages: number;
}

interface LeadPriority {
  level: 'high' | 'medium' | 'low';
  factors: {
    urgency: number;
    profileCompleteness: number;
    verification: number;
    responseHistory: number;
  };
  tier: 'high' | 'medium' | 'low';
  insights: string[];
}

// Lead status enum
enum LeadStatus {
  NEW = 'new',
  VIEWED = 'viewed',
  CONTACTED = 'contacted',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Analytics models
interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  responseRate: number;
  avgResponseTime: number; // minutes
  conversionRate: number;
  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

interface AnalyticsData {
  metrics: DashboardMetrics;
  charts: {
    responseTime: TimeSeriesData[];
    conversionFunnel: FunnelData[];
    leadSources: PieChartData[];
    propertyPerformance: PropertyMetrics[];
  };
  insights: {
    peakHours: number[];
    bestDays: string[];
    recommendations: string[];
  };
}
```

## Real-time Implementation

### WebSocket Service
```typescript
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: number | null = null;
  private subscribers = new Map<string, Set<Function>>();
  
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${process.env.REACT_APP_WS_URL}/dashboard?userId=${userId}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };
    });
  }
  
  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      
      // Handle different message types
      switch (message.type) {
        case 'lead_update':
          this.notifySubscribers('leads', message.data);
          break;
        case 'notification':
          this.notifySubscribers('notifications', message.data);
          break;
        case 'metrics_update':
          this.notifySubscribers('metrics', message.data);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
  
  subscribe(channel: string, callback: Function): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(channel)?.delete(callback);
    };
  }
  
  private notifySubscribers(channel: string, data: any) {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect(getCurrentUserId());
    }, delay);
  }
  
  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### Real-time Updates Hook
```typescript
const useRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsService = useRef(new WebSocketService());
  
  useEffect(() => {
    const connect = async () => {
      try {
        await wsService.current.connect(getUserId());
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
      }
    };
    
    connect();
    
    return () => {
      wsService.current.disconnect();
    };
  }, []);
  
  const subscribe = useCallback((channel: string, callback: Function) => {
    return wsService.current.subscribe(channel, callback);
  }, []);
  
  return {
    isConnected,
    subscribe
  };
};
```

## WhatsApp Integration

### WhatsApp Service
```typescript
class WhatsAppService {
  private businessAPI = process.env.REACT_APP_WHATSAPP_API;
  private businessNumber = process.env.REACT_APP_WHATSAPP_NUMBER;
  
  // Generate WhatsApp link
  generateChatLink(phoneNumber: string, message?: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  }
  
  // Send message via Business API
  async sendMessage(to: string, message: string, templateId?: string): Promise<void> {
    const payload = templateId
      ? this.buildTemplatePayload(to, templateId, message)
      : this.buildTextPayload(to, message);
    
    const response = await fetch(`${this.businessAPI}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getWhatsAppToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }
  }
  
  private buildTextPayload(to: string, text: string) {
    return {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    };
  }
  
  private buildTemplatePayload(to: string, templateId: string, params: any) {
    return {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: templateId,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: params
          }
        ]
      }
    };
  }
  
  // Track message status
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    const response = await fetch(`${this.businessAPI}/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${getWhatsAppToken()}`
      }
    });
    
    return response.json();
  }
}

// WhatsApp hook
const useWhatsApp = () => {
  const whatsappService = useMemo(() => new WhatsAppService(), []);
  const [sending, setSending] = useState(false);
  
  const sendMessage = useCallback(async (
    lead: Lead,
    message: string,
    useTemplate = false
  ) => {
    setSending(true);
    
    try {
      if (useTemplate) {
        await whatsappService.sendMessage(
          lead.tenant.phone,
          message,
          'lead_response'
        );
      } else {
        // Open WhatsApp Web/App
        const link = whatsappService.generateChatLink(
          lead.tenant.phone,
          message
        );
        
        if (isMobile()) {
          window.location.href = link;
        } else {
          window.open(link, '_blank');
        }
      }
      
      // Track response
      await trackResponse(lead.id, 'whatsapp');
      
      return true;
    } catch (error) {
      console.error('WhatsApp error:', error);
      showError('Failed to send WhatsApp message');
      return false;
    } finally {
      setSending(false);
    }
  }, [whatsappService]);
  
  return {
    sendMessage,
    sending
  };
};
```

## Performance Optimization

### Virtual List Implementation
```typescript
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualLeadList: React.FC<{
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
}> = ({ leads, onLeadSelect }) => {
  const listRef = useRef<List>(null);
  const rowHeights = useRef<{[key: string]: number}>({});
  
  const getItemSize = (index: number) => {
    return rowHeights.current[index] || 140; // Default height
  };
  
  const setItemSize = (index: number, size: number) => {
    rowHeights.current[index] = size;
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  };
  
  const Row = ({ index, style }: { index: number; style: any }) => {
    const lead = leads[index];
    const rowRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        setItemSize(index, height);
      }
    }, [index]);
    
    return (
      <div style={style} ref={rowRef}>
        <LeadCard
          lead={lead}
          onSelect={onLeadSelect}
        />
      </div>
    );
  };
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          height={height}
          itemCount={leads.length}
          itemSize={getItemSize}
          width={width}
          overscanCount={5}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};
```

### Caching Strategy
```typescript
// Lead cache service
class LeadCacheService {
  private cache = new Map<string, CachedData>();
  private maxAge = 5 * 60 * 1000; // 5 minutes
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  invalidate(pattern?: string): void {
    if (pattern) {
      // Invalidate matching keys
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all
      this.cache.clear();
    }
  }
}

// Cached API hook
const useCachedLeads = (filters: LeadFilters) => {
  const cache = useMemo(() => new LeadCacheService(), []);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchLeads = async () => {
      const cacheKey = JSON.stringify(filters);
      const cached = cache.get(cacheKey);
      
      if (cached) {
        setLeads(cached);
        return;
      }
      
      setLoading(true);
      
      try {
        const data = await leadAPI.getLeads(filters);
        cache.set(cacheKey, data);
        setLeads(data);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [filters, cache]);
  
  return { leads, loading };
};
```

### Optimistic Updates
```typescript
// Optimistic update manager
class OptimisticUpdateManager {
  private pendingUpdates = new Map<string, PendingUpdate>();
  
  async update<T>(
    optimisticUpdate: () => void,
    apiCall: () => Promise<T>,
    rollback: () => void
  ): Promise<T> {
    const updateId = generateId();
    
    // Apply optimistic update
    optimisticUpdate();
    
    // Track pending update
    this.pendingUpdates.set(updateId, {
      rollback,
      timestamp: Date.now()
    });
    
    try {
      // Make API call
      const result = await apiCall();
      
      // Success - remove from pending
      this.pendingUpdates.delete(updateId);
      
      return result;
    } catch (error) {
      // Rollback on failure
      rollback();
      this.pendingUpdates.delete(updateId);
      
      throw error;
    }
  }
  
  rollbackAll(): void {
    for (const update of this.pendingUpdates.values()) {
      update.rollback();
    }
    this.pendingUpdates.clear();
  }
}
```

## Testing Strategy

### Component Tests
```typescript
// Lead Card test
describe('LeadCard', () => {
  const mockLead = createMockLead();
  const onSelect = jest.fn();
  const onQuickAction = jest.fn();
  
  it('should render lead information correctly', () => {
    const { getByText, getByRole } = render(
      <LeadCard
        lead={mockLead}
        isSelected={false}
        onSelect={onSelect}
        onQuickAction={onQuickAction}
      />
    );
    
    expect(getByText(mockLead.tenant.name)).toBeInTheDocument();
    expect(getByText(mockLead.tenant.occupation)).toBeInTheDocument();
    expect(getByRole('article')).toHaveAttribute(
      'aria-label',
      `Lead from ${mockLead.tenant.name}`
    );
  });
  
  it('should show unread indicator for new leads', () => {
    const unreadLead = { ...mockLead, isRead: false };
    const { container } = render(
      <LeadCard lead={unreadLead} />
    );
    
    expect(container.querySelector('.unread-dot')).toBeInTheDocument();
    expect(container.querySelector('.lead-card')).toHaveClass('unread');
  });
  
  it('should handle quick actions', async () => {
    const { getByLabelText } = render(
      <LeadCard
        lead={mockLead}
        onQuickAction={onQuickAction}
      />
    );
    
    const whatsappButton = getByLabelText('Send WhatsApp message');
    fireEvent.click(whatsappButton);
    
    expect(onQuickAction).toHaveBeenCalledWith('whatsapp', mockLead);
  });
  
  it('should support keyboard navigation', () => {
    const { container } = render(
      <LeadCard lead={mockLead} onSelect={onSelect} />
    );
    
    const card = container.querySelector('.lead-card');
    fireEvent.keyPress(card, { key: 'Enter' });
    
    expect(onSelect).toHaveBeenCalledWith(mockLead);
  });
});
```

### Integration Tests
```typescript
// Dashboard integration test
describe('Landlord Dashboard Integration', () => {
  beforeEach(() => {
    // Mock API responses
    fetchMock.get('/api/leads', mockLeadsResponse);
    fetchMock.get('/api/analytics', mockAnalyticsResponse);
  });
  
  it('should load and display leads on mount', async () => {
    const { findByText, findAllByRole } = render(
      <LandlordDashboard userId="123" />
    );
    
    // Wait for leads to load
    const leads = await findAllByRole('article');
    expect(leads).toHaveLength(mockLeadsResponse.data.length);
    
    // Check first lead is displayed
    await findByText(mockLeadsResponse.data[0].tenant.name);
  });
  
  it('should filter leads correctly', async () => {
    const { getByLabelText, findAllByRole } = render(
      <LandlordDashboard userId="123" />
    );
    
    // Apply quality filter
    const highQualityFilter = getByLabelText('High quality leads');
    fireEvent.click(highQualityFilter);
    
    // Check filtered results
    const filteredLeads = await findAllByRole('article');
    filteredLeads.forEach(lead => {
      expect(lead).toHaveClass('high-quality');
    });
  });
  
  it('should handle real-time updates', async () => {
    const { findByText } = render(
      <LandlordDashboard userId="123" />
    );
    
    // Simulate WebSocket message
    mockWebSocket.send({
      type: 'lead_update',
      data: {
        type: 'new_lead',
        lead: createMockLead({ tenant: { name: 'New Lead' } })
      }
    });
    
    // Check new lead appears
    await findByText('New Lead');
  });
});
```

### E2E Tests
```typescript
// Cypress E2E test
describe('Landlord Dashboard E2E', () => {
  beforeEach(() => {
    cy.login('landlord@example.com', 'password');
    cy.visit('/dashboard');
  });
  
  it('should complete lead response flow', () => {
    // Wait for dashboard to load
    cy.get('[data-testid="dashboard-container"]').should('be.visible');
    
    // Click on first lead
    cy.get('[data-testid="lead-card"]').first().click();
    
    // Check detail panel opens
    cy.get('[data-testid="lead-detail-panel"]').should('be.visible');
    
    // Click respond button
    cy.get('[data-testid="respond-button"]').click();
    
    // Select WhatsApp
    cy.get('[data-testid="whatsapp-option"]').click();
    
    // Select template
    cy.get('[data-testid="template-selector"]').select('viewing_invitation');
    
    // Customize message
    cy.get('[data-testid="message-composer"]').type(' Looking forward to meeting you!');
    
    // Send message
    cy.get('[data-testid="send-button"]').click();
    
    // Verify success
    cy.get('[data-testid="success-toast"]').should('contain', 'Message sent');
    
    // Check lead status updated
    cy.get('[data-testid="lead-status"]').should('contain', 'Contacted');
  });
  
  it('should update analytics in real-time', () => {
    // Navigate to analytics
    cy.get('[data-testid="nav-analytics"]').click();
    
    // Check charts loaded
    cy.get('[data-testid="response-time-chart"]').should('be.visible');
    
    // Note current response rate
    cy.get('[data-testid="response-rate-metric"]')
      .invoke('text')
      .then(initialRate => {
        // Respond to a lead
        cy.get('[data-testid="nav-inbox"]').click();
        cy.get('[data-testid="quick-respond"]').first().click();
        
        // Return to analytics
        cy.get('[data-testid="nav-analytics"]').click();
        
        // Check metric updated
        cy.get('[data-testid="response-rate-metric"]')
          .invoke('text')
          .should('not.equal', initialRate);
      });
  });
});
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing (>85% coverage)
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] API endpoints documented
- [ ] WebSocket infrastructure ready
- [ ] WhatsApp Business API configured
- [ ] Analytics tracking implemented
- [ ] Error tracking configured

### Performance Targets
- [ ] Initial load < 2 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] Lead list render < 500ms
- [ ] Real-time update latency < 1 second
- [ ] Memory usage < 100MB
- [ ] 60fps scrolling performance

### Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Web Vitals)
- [ ] Real-time connection monitoring
- [ ] API response time tracking
- [ ] User session recording
- [ ] Custom analytics events

### Production Configuration
```javascript
// Environment variables
REACT_APP_API_URL=https://api.heurekka.com
REACT_APP_WS_URL=wss://ws.heurekka.com
REACT_APP_WHATSAPP_API=https://graph.facebook.com/v15.0
REACT_APP_WHATSAPP_NUMBER=+50412345678
REACT_APP_SENTRY_DSN=https://sentry.io/dsn
REACT_APP_ANALYTICS_ID=G-XXXXXXXXXX

// Performance budgets
{
  "bundles": [
    {
      "name": "dashboard",
      "maxSize": "300kb"
    },
    {
      "name": "vendor",
      "maxSize": "450kb"
    }
  ],
  "metrics": {
    "FCP": 1500,
    "TTI": 3000,
    "CLS": 0.1,
    "FID": 100
  }
}

// WebSocket configuration
{
  "reconnect": true,
  "maxReconnectAttempts": 5,
  "reconnectInterval": 1000,
  "heartbeatInterval": 30000,
  "messageTimeout": 5000
}
```

## Related Documentation
- [User Journey](./user-journey.md)
- [Screen States](./screen-states.md)
- [Interactions](./interactions.md)
- [Accessibility](./accessibility.md)
- [Design System](../../design-system/style-guide.md)