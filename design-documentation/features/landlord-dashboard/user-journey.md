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
Complete user journey for landlords managing tenant inquiries and property leads through the dashboard.

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

### Stage 1: Lead Reception
1. Receive notification of new lead
2. Open dashboard (mobile/desktop)
3. View lead in inbox with priority indicator
4. Quick review of tenant profile
5. Decision point: Respond or pass

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

### Push Notification
- Mobile app notification
- Click to open specific lead
- Quick action buttons in notification

### Email Alert
- Daily digest of new leads
- Click through to dashboard
- Filtered view of urgent items

### Direct Dashboard Access
- Bookmark/saved login
- Homepage quick access
- Mobile app icon

### WhatsApp Message
- Direct inquiry via WhatsApp
- Link to view in dashboard
- Auto-import to lead system

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