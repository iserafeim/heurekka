---
title: Landlord Dashboard - User Journey
description: User journey mapping for landlord lead management dashboard
feature: landlord-dashboard
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./README.md
  - ./screen-states.md
  - ./implementation.md
status: approved
---

# Landlord Dashboard - User Journey

## Overview
Complete user journey for landlords managing tenant inquiries and property leads through the unified dashboard's tab-based navigation system. This feature focuses exclusively on lead management - not property creation or listing management.

## User Personas

### Small Property Owner (1-3 properties)
- **Goals**: Fill vacancies quickly, find quality tenants
- **Pain Points**: Time-consuming tenant screening, unqualified inquiries
- **Tech Level**: Medium, primarily mobile user
- **Success Criteria**: Reduce vacancy time, quality tenant placement

### Real Estate Agent (10-20 properties)
- **Goals**: Efficient lead management, quick response times
- **Pain Points**: High volume of inquiries, tracking multiple conversations
- **Tech Level**: High, uses multiple tools
- **Success Criteria**: Response time <30 min, high conversion rate

### Property Management Company (50+ properties)
- **Goals**: Scalable operations, team coordination
- **Pain Points**: Lead distribution, performance tracking
- **Tech Level**: High, needs integration capabilities
- **Success Criteria**: Automated workflows, detailed analytics

## Core User Flow

### Stage 1: Dashboard Access & Lead Reception
1. User navigates to `/dashboard` route
2. System renders role-appropriate tabs in sidebar
3. Landlord-only users: See Leads, Analytics, Mi Perfil tabs
4. Dual-context users: See tenant tabs + separator + landlord tabs
5. Default tab: "Leads" for landlord users
6. Receive notification of new lead (real-time update within active tab)
7. Lead appears in inbox with priority indicator
8. Quick review of tenant profile
9. Decision point: Respond or pass

### Stage 2: Lead Evaluation
1. Click to expand lead details
2. Review tenant profile completeness
3. Check budget vs. property price
4. Assess move-in timeline fit
5. View any previous interactions
6. Make response decision

### Stage 3: Response Initiation
1. Choose response method (WhatsApp preferred)
2. Select or customize message template
3. Include property details/photos
4. Send initial response
5. Log interaction in system
6. Set follow-up reminder

### Stage 4: Conversation Management
1. Track response from tenant
2. Answer additional questions
3. Schedule property viewing
4. Share required documents
5. Update lead status
6. Move to next stage or close

### Stage 5: Conversion Tracking
1. Mark viewing completed
2. Record tenant feedback
3. Process application if interested
4. Update property availability
5. Archive successful leads
6. Analyze conversion metrics

## Entry Points

### Unified Dashboard Navigation
- All users access `/dashboard` route
- Landlord users see "Leads" tab in sidebar
- Tab navigation for switching between Leads, Analytics, and Mi Perfil
- No separate context switching - all tabs visible simultaneously for dual-context users

### Push Notification
- Mobile app notification for new lead
- Click opens `/dashboard?tab=leads` with specific lead highlighted
- Quick action buttons in notification

### Email Alert
- Daily digest of new leads
- Click through to `/dashboard?tab=leads`
- Deep link to specific lead if applicable

### Direct Tab Access
- Bookmark to `/dashboard` (defaults to appropriate tab)
- Sidebar navigation between tabs
- Deep links to specific tabs (e.g., `/dashboard?tab=analytics`)

## Key Interactions

### Lead Filtering
- Status: New, In Progress, Closed
- Quality: High, Medium, Low
- Property: Specific property selection
- Date: Today, This Week, Custom
- Urgency: Immediate, Flexible

### Quick Actions
- Mark as Read/Unread
- Star/Favorite important leads
- Quick WhatsApp response
- Schedule viewing
- Archive/Delete

### Bulk Operations
- Select multiple leads
- Send bulk messages
- Update status for group
- Export selected data
- Assign to team member

## Success Metrics

### Efficiency Metrics
- Time to first response: <30 minutes
- Leads processed per day: 20+
- Template usage rate: >60%
- Mobile usage: >50%

### Quality Metrics
- Response rate: >70% for qualified leads
- Viewing conversion: >30%
- Application rate: >15%
- Tenant satisfaction: 4.5/5

### Business Metrics
- Vacancy reduction: -20%
- Revenue increase: +15%
- Cost per acquisition: -30%
- Lifetime value: +25%

## Pain Points & Solutions

### Too Many Unqualified Leads
**Solution**: Smart filters and priority indicators to surface best matches first

### Slow Response Times
**Solution**: Mobile notifications, quick templates, WhatsApp integration

### Lost in Conversation Threads
**Solution**: Unified inbox, conversation history, status tracking

### Difficulty Tracking Performance
**Solution**: Analytics dashboard, conversion funnel, exportable reports

## Related Documentation
- [Screen States](./screen-states.md)
- [Implementation Guide](./implementation.md)
- [Interactions](./interactions.md)