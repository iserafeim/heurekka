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
Complete technical implementation guide for developers building the landlord dashboard feature, including lead management, real-time updates, WhatsApp integration, and analytics.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [Data Models](#data-models)
5. [Real-time Implementation](#real-time-implementation)
6. [WhatsApp Integration](#whatsapp-integration)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)

## Component Architecture

### Component Hierarchy
```typescript
// Main component structure
LandlordDashboard/
├── Dashboard.tsx                   // Main container
├── components/
│   ├── Header/
│   │   ├── DashboardHeader.tsx
│   │   ├── MetricsBar.tsx
│   │   └── NotificationBell.tsx
│   ├── Sidebar/
│   │   ├── Navigation.tsx
│   │   ├── PropertySelector.tsx
│   │   └── QuickStats.tsx
│   ├── LeadInbox/
│   │   ├── LeadList.tsx
│   │   ├── LeadCard.tsx
│   │   ├── LeadFilters.tsx
│   │   ├── BulkActions.tsx
│   │   └── EmptyState.tsx
│   ├── LeadDetails/
│   │   ├── DetailPanel.tsx
│   │   ├── TenantProfile.tsx
│   │   ├── PropertyMatch.tsx
│   │   ├── ConversationThread.tsx
│   │   └── QuickResponse.tsx
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── ResponseTimeChart.tsx
│   │   ├── QualityDistribution.tsx
│   │   ├── ConversionFunnel.tsx
│   │   └── PropertyPerformance.tsx
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
│   ├── useAnalytics.ts
│   └── useNotifications.ts
├── services/
│   ├── leadAPI.ts
│   ├── websocketService.ts
│   ├── whatsappService.ts
│   ├── notificationService.ts
│   └── analyticsService.ts
└── utils/
    ├── leadScoring.ts
    ├── dateHelpers.ts
    ├── formatters.ts
    └── validators.ts
```

### Core Components Implementation

#### Main Dashboard Component
```typescript
interface DashboardProps {
  userId: string;
  propertyId?: string;
  initialView?: 'inbox' | 'analytics' | 'settings';
}

const LandlordDashboard: React.FC<DashboardProps> = ({
  userId,
  propertyId,
  initialView = 'inbox'
}) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [selectedProperty, setSelectedProperty] = useState(propertyId);
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
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <MetricsBar metrics={metrics} loading={metricsLoading} />
        <NotificationBell userId={userId} />
      </DashboardHeader>
      
      <DashboardLayout>
        <Sidebar>
          <Navigation 
            currentView={currentView}
            onChange={setCurrentView}
          />
          <PropertySelector
            selected={selectedProperty}
            onChange={setSelectedProperty}
          />
        </Sidebar>
        
        <MainContent>
          {currentView === 'inbox' && (
            <LeadInbox
              leads={filteredLeads}
              filters={filters}
              onFilterChange={setFilters}
              onLeadSelect={setSelectedLead}
              selectedLead={selectedLead}
            />
          )}
          
          {currentView === 'analytics' && (
            <AnalyticsDashboard
              propertyId={selectedProperty}
              dateRange={filters.dateRange}
            />
          )}
          
          {currentView === 'settings' && (
            <SettingsPanel userId={userId} />
          )}
        </MainContent>
        
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onRespond={handleRespond}
          />
        )}
      </DashboardLayout>
    </DashboardContainer>
  );
};
```

#### Lead Card Component
```typescript
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
  const qualityScore = useLeadQualityScore(lead);
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
        'lead-card',
        {
          'selected': isSelected,
          'unread': !lead.isRead,
          'high-quality': qualityScore >= 80
        }
      )}
      onClick={() => onSelect(lead)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Lead from ${lead.tenant.name}`}
    >
      {!lead.isRead && <UnreadIndicator />}
      
      <CardHeader>
        <TenantInfo>
          <Avatar 
            src={lead.tenant.avatar}
            alt={lead.tenant.name}
            fallback={lead.tenant.initials}
          />
          <div>
            <TenantName>{lead.tenant.name}</TenantName>
            <TenantOccupation>{lead.tenant.occupation}</TenantOccupation>
          </div>
        </TenantInfo>
        
        <Timestamp>{timeAgo}</Timestamp>
        
        <QualityBadge score={qualityScore} />
      </CardHeader>
      
      <CardDetails>
        <DetailItem>
          <Icon name="calendar" />
          <span>Move: {formatDate(lead.moveDate)}</span>
        </DetailItem>
        <DetailItem>
          <Icon name="currency" />
          <span>Budget: {formatCurrency(lead.budget)}</span>
        </DetailItem>
        <DetailItem>
          <Icon name="users" />
          <span>{lead.occupants} occupants</span>
        </DetailItem>
      </CardDetails>
      
      <PropertyReference>
        <PropertyThumb src={lead.property.image} />
        <div>
          <PropertyTitle>{lead.property.title}</PropertyTitle>
          <MatchScore score={lead.matchScore} />
        </div>
      </PropertyReference>
      
      {isHovered && (
        <QuickActions>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction('whatsapp', lead);
            }}
            aria-label="Send WhatsApp message"
          >
            <WhatsAppIcon />
          </ActionButton>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction('email', lead);
            }}
            aria-label="Send email"
          >
            <EmailIcon />
          </ActionButton>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction('schedule', lead);
            }}
            aria-label="Schedule viewing"
          >
            <CalendarIcon />
          </ActionButton>
        </QuickActions>
      )}
    </Card>
  );
});
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
        const score = calculateQualityScore(lead);
        const quality = getQualityLevel(score);
        if (!filters.quality.includes(quality)) return false;
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
          return calculateQualityScore(b) - calculateQualityScore(a);
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
  scoring: QualityScoring;
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
  matchScore: number;
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

interface QualityScoring {
  overall: number; // 0-100
  factors: {
    budgetMatch: number;
    profileCompleteness: number;
    verification: number;
    urgency: number;
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