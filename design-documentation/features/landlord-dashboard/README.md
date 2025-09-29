---
title: Landlord Dashboard Feature
description: Complete design documentation for the landlord lead management dashboard with integrated authentication
feature: landlord-dashboard
last-updated: 2025-01-29
version: 1.1.0
related-files:
  - design-documentation/features/landlord-dashboard/user-journey.md
  - design-documentation/features/landlord-dashboard/screen-states.md
  - design-documentation/features/landlord-dashboard/interactions.md
  - design-documentation/features/landlord-dashboard/implementation.md
  - design-documentation/features/landlord-dashboard/accessibility.md
  - ../user-authentication/landlord-authentication.md
  - ../user-authentication/context-upgrade.md
  - ../landlord-profile/README.md
status: approved
---

# Landlord Dashboard Feature

## Overview

The Landlord Dashboard is a comprehensive lead management system that enables property owners and agents to view, filter, and respond to qualified tenant inquiries efficiently. It provides real-time lead delivery, quality indicators, and response tracking to maximize conversion rates. The dashboard now integrates seamlessly with the new authentication system and supports dual-context users who operate as both landlords and tenants.

## Feature Objectives

### Primary Goals
- Centralize all tenant inquiries in one manageable interface
- Display tenant profiles upfront for quick assessment
- Enable rapid response to high-quality leads
- Track conversation progress and outcomes
- Provide analytics on lead quality and response rates

### Success Metrics
- **Response Time**: <30 minutes average first response
- **Lead Response Rate**: >70% of leads receive timely responses
- **Conversion Rate**: >15% lead-to-viewing conversion
- **Dashboard Adoption**: >80% of landlords use daily
- **Response Rate**: >60% of qualified leads receive responses
- **Context Switching**: >40% of dual-context users utilize both modes monthly
- **Profile Completion**: >70% of landlords complete profile within first week
- **Upgrade Rate**: >20% of tenants upgrade to landlord accounts within 6 months

## Entry Points and Authentication

### Access Flow
The dashboard is accessed after successful landlord authentication:
1. **Direct Landlord Login**: Users who authenticate as landlords land directly on dashboard
2. **Context Switch**: Dual-context users can switch from tenant to landlord mode
3. **Upgrade Path**: Tenants can upgrade to landlord status and access dashboard
4. **Deep Links**: Direct property-specific dashboard access via shared links

### Context Awareness
```typescript
interface DashboardContext {
  userType: 'landlord-only' | 'dual-context';
  activeContext: 'landlord' | 'tenant';
  profileCompletion: number;
  verificationLevel: 'basic' | 'verified' | 'premium';
  canSwitchContext: boolean;
}
```

## Key User Stories

### Property Owner Perspective
"As a property owner, I want to see and manage qualified leads, so that I can respond to serious inquiries quickly and minimize vacancy time."

### Real Estate Agent Perspective
"As an agent managing multiple properties, I want to filter and prioritize leads, so that I can focus on the most promising opportunities first."

### Portfolio Manager Perspective
"As someone managing 10+ properties, I want bulk management tools, so that I can efficiently handle high volumes of inquiries."

### Dual-Context User Perspective
"As someone who both owns properties and looks for rentals, I want to easily switch between my landlord and tenant views without logging out."

## Design Principles

### Information Hierarchy
- Lead quality indicators prominent
- Critical tenant info above the fold
- Progressive disclosure of details
- Clear visual priority system

### Efficiency First
- One-click actions for common tasks
- Bulk operations for multiple leads
- Quick response templates
- Keyboard shortcuts for power users

### Real-time Responsiveness
- Live lead updates without refresh
- Instant notification system
- Status sync across devices
- Optimistic UI updates

## Technical Architecture

### Dashboard Components
- Lead inbox with filtering
- Lead detail panel
- Quick actions toolbar
- Analytics widgets
- Response templates manager
- WhatsApp quick launch

### Data Requirements
```typescript
interface LeadData {
  id: string;
  tenantProfile: {
    name: string;
    occupation: string;
    budget: { min: number; max: number };
    moveDate: Date;
    occupants: number;
    verified: boolean;
    searchProfile: SearchProfile;
  };
  property: {
    id: string;
    title: string;
    price: number;
    relevanceScore: number;
  };
  metadata: {
    receivedAt: Date;
    source: 'direct' | 'marketplace' | 'search';
    quality: 'high' | 'medium' | 'low';
    urgency: 'immediate' | 'planned' | 'flexible';
  };
  status: LeadStatus;
  conversation: {
    lastMessage: string;
    unreadCount: number;
    responseTime: number | null;
  };
}
```

## Component Structure

### Dashboard Layout
- **Header**: Metrics summary, quick filters, and context switcher for dual-role users
- **Sidebar**: Navigation, property selector, and upgrade CTA for tenant features
- **Main Area**: Lead list/grid view with verification badges
- **Detail Panel**: Expandable lead details with trust indicators
- **Action Bar**: Bulk actions and tools
- **Context Toggle**: Seamless switching between landlord/tenant modes (if applicable)

### Lead Card Design
- Tenant avatar and verification badge
- Budget range with compatibility indicator
- Move-in date with urgency flag
- Property reference
- Quick action buttons
- Unread message indicator

### Analytics Dashboard
- Response time trends
- Lead quality distribution
- Conversion funnel
- Property performance
- Peak inquiry times
- Source effectiveness

## User Experience Flow

### Dashboard Entry
1. Successful authentication as landlord
2. Profile completion check (prompt if incomplete)
3. Verification status display
4. Context indicator for dual-role users
5. Dashboard loads with personalized view

### Lead Reception
1. New lead notification received
2. Dashboard updates in real-time
3. Lead appears with "NEW" badge
4. Lead priority based on verification level
5. Urgency level assigned
6. Sound/vibration alert (optional)

### Lead Evaluation
1. Click lead to expand details
2. View complete tenant profile
3. Review tenant profile details
4. Assess property compatibility
5. See previous interactions
6. Make response decision

### Response Management
1. Choose response method (WhatsApp/Email/Call)
2. Use template or custom message
3. Track response status
4. Schedule follow-up
5. Update lead status
6. Log interaction notes

### Context Switching (Dual Users)
1. Access context switcher in header
2. Select "Modo Inquilino" option
3. Confirm context switch
4. Redirect to tenant search interface
5. Maintain authentication state
6. Quick return to landlord dashboard available

## Responsive Behavior

### Mobile (320-767px)
- Single column lead list
- Swipe actions for quick response
- Bottom sheet for details
- Floating action button
- Simplified metrics view

### Tablet (768-1023px)
- Two-column layout
- Side panel for details
- Touch-optimized controls
- Landscape optimization
- Multi-select support

### Desktop (1024px+)
- Three-panel layout
- Keyboard shortcuts enabled
- Hover previews
- Drag-and-drop organization
- Multi-monitor support

## Notification Strategy

### Real-time Alerts
- Desktop push notifications
- Mobile app notifications
- WhatsApp Business messages
- Email digests (configurable)
- SMS for urgent leads (optional)


## Response Templates

### Template Categories
- Initial greeting
- Property details
- Viewing invitation
- Document requirements
- Rejection (polite)
- Follow-up reminders

### Dynamic Variables
- {{tenant_name}}
- {{property_address}}
- {{viewing_slots}}
- {{agent_phone}}
- {{next_steps}}


## Integration Points

### WhatsApp Business
- One-click message launch
- Template synchronization
- Conversation threading
- Status updates
- Read receipts

### Property Management
- Inventory updates
- Availability status
- Pricing sync
- Photo updates
- Feature changes

## Performance Targets

### Speed Metrics
- Dashboard load: <2 seconds
- Lead list refresh: <500ms
- Search/filter: <200ms
- Status update: <100ms
- Real-time sync: <1 second

### Scalability
- Handle 1000+ leads per account
- 50+ concurrent users per organization
- 100 leads per second ingestion
- 10,000 daily notifications
- 1M monthly API calls

## Security & Privacy

### Data Protection
- Tenant PII encryption
- Secure API endpoints
- Session management
- Rate limiting
- Audit logging

### Access Control
- Role-based permissions
- Team member management
- Property-level access
- Read-only modes
- Activity tracking

## Success Patterns

### High Performers
- Respond within 5 minutes
- Use personalized templates
- Complete profile information
- Regular dashboard checks
- Proactive follow-ups
- Maintain verified status
- Leverage dual-context insights

### Optimization Tips
- Set up instant notifications
- Create response templates
- Use quality filters
- Track peak times
- Monitor conversion rates
- Complete verification process
- Utilize context switching for market insights

## Integration with Authentication System

### Profile-Based Features
```typescript
interface DashboardFeatures {
  basic: {
    maxLeads: 50,
    responseTemplates: 3,
    analytics: 'basic'
  },
  verified: {
    maxLeads: 200,
    responseTemplates: 10,
    analytics: 'advanced',
    prioritySupport: true
  },
  premium: {
    maxLeads: 'unlimited',
    responseTemplates: 'unlimited',
    analytics: 'custom',
    apiAccess: true,
    teamManagement: true
  }
}
```

### Context-Aware Navigation
- **Landlord-Only Users**: Standard dashboard navigation
- **Dual-Context Users**: Context switcher in header
- **Upgraded Tenants**: Onboarding prompts on first visit
- **Profile Incomplete**: Persistent completion reminder

### Upgrade Prompts
- **For Tenants**: "Publica tus propiedades" CTA in sidebar
- **For Basic Landlords**: "Verificate para más leads" banner
- **For Verified**: "Actualiza a Premium" for advanced features

## Related Documentation
- [User Journey](./user-journey.md)
- [Screen States](./screen-states.md)
- [Interactions](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)
- [Landlord Authentication](../user-authentication/landlord-authentication.md)
- [Context Upgrade Flow](../user-authentication/context-upgrade.md)
- [Landlord Profile System](../landlord-profile/README.md)