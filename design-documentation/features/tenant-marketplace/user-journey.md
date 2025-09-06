---
title: Tenant Marketplace - User Journey
description: Comprehensive user journey mapping for the tenant marketplace reverse discovery feature
feature: tenant-marketplace
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./README.md
  - ./screen-states.md
  - ./interactions.md
  - ./implementation.md
status: approved
---

# Tenant Marketplace - User Journey

## Overview
This document maps the complete user journey for tenants publishing their requirements and landlords discovering qualified prospects in the reverse marketplace.

## Table of Contents
1. [User Personas](#user-personas)
2. [Journey Stages](#journey-stages)
3. [Entry Points](#entry-points)
4. [Core User Flow](#core-user-flow)
5. [Alternative Paths](#alternative-paths)
6. [Edge Cases](#edge-cases)
7. [Exit Points](#exit-points)

## User Personas

### Primary Persona: Frustrated Searcher
- **Goals**: Find suitable housing after exhaustive search, get landlords to come to them
- **Pain Points**: Limited inventory, properties outside budget, poor locations, time wasted searching
- **Technical Proficiency**: Medium
- **Motivation**: Urgency to find housing, tired of active searching
- **Success Criteria**: Receive relevant property offers within budget

### Secondary Persona: Specific Needs Tenant
- **Goals**: Find property matching very specific requirements, communicate unique needs
- **Pain Points**: Standard filters don't capture needs, special requirements ignored
- **Technical Proficiency**: High
- **Motivation**: Quality match over quick match
- **Success Criteria**: Connect with understanding landlords

### Tertiary Persona: Proactive Landlord
- **Goals**: Fill vacancies before listing, find quality tenants, reduce vacancy time
- **Pain Points**: Passive waiting for inquiries, unqualified leads, last-minute vacancies
- **Technical Proficiency**: Medium
- **Motivation**: Consistent rental income, quality tenants
- **Success Criteria**: Find pre-qualified tenants ready to move

### Quaternary Persona: Portfolio Manager
- **Goals**: Match multiple properties to tenants, optimize occupancy across portfolio
- **Pain Points**: Managing multiple vacancies, varying property types, market timing
- **Technical Proficiency**: High
- **Motivation**: Portfolio optimization, reduced turnover
- **Success Criteria**: Multiple successful matches per month

## Journey Stages

### Stage 1: Recognition of Need
**User State**: Realized traditional search isn't working
**Touchpoints**: 
- "No results found" message
- "Can't find what you need?" prompt
- Marketplace discovery banner
- Email suggestion after failed searches

**Emotional State**: Frustrated but hopeful
**Success Metrics**: 
- Click-through rate on prompts
- Time from first search to marketplace entry
- Bounce rate on marketplace landing

### Stage 2: Exploration & Understanding
**User State**: Learning how reverse marketplace works
**Touchpoints**:
- Marketplace landing page
- How it works section
- Success stories carousel
- Sample posts browsing
- FAQ section

**Emotional State**: Curious, evaluating effort vs. benefit
**Success Metrics**:
- Page scroll depth
- Time on page
- Video completion rate
- FAQ engagement

### Stage 3: Decision to Post
**User State**: Committed to creating post
**Touchpoints**:
- "Create Post" CTA
- Benefit highlights
- Privacy assurances
- Quick start wizard
- Profile import option

**Emotional State**: Motivated, slightly apprehensive
**Success Metrics**:
- Conversion to post creation
- Profile import usage
- Drop-off points identified

### Stage 4: Post Creation
**User State**: Actively defining requirements
**Touchpoints**:
- Multi-step form
- Field validation
- Helpful suggestions
- Preview capability
- Save draft option

**Emotional State**: Focused, detail-oriented
**Success Metrics**:
- Form completion rate
- Average time to complete
- Field error rates
- Preview usage

### Stage 5: Post Management
**User State**: Monitoring and responding to interest
**Touchpoints**:
- Dashboard overview
- Response notifications
- Message center
- Analytics view
- Edit capabilities

**Emotional State**: Expectant, engaged
**Success Metrics**:
- Dashboard visit frequency
- Response time to landlords
- Message engagement rate
- Post edit frequency

### Stage 6: Connection & Resolution
**User State**: Evaluating offers and making decisions
**Touchpoints**:
- Landlord profiles
- Property presentations
- Scheduling tools
- Communication thread
- Status updates

**Emotional State**: Optimistic, decisive
**Success Metrics**:
- Response acceptance rate
- Viewing conversion rate
- Time to resolution
- Success rate

## Entry Points

### Primary Entry: Search Frustration
**Trigger**: Multiple failed searches
**Flow**:
1. User searches without finding matches
2. System detects pattern of no results
3. Presents marketplace option
4. User clicks to explore
5. Guided to post creation

**Design Requirements**:
- Smart detection of search frustration
- Contextual messaging
- Clear value proposition
- Seamless transition

### Secondary Entry: Direct Navigation
**Trigger**: Aware user seeking marketplace
**Flow**:
1. User navigates to marketplace section
2. Browses existing posts for inspiration
3. Clicks create post
4. Begins creation process

**Design Requirements**:
- Prominent navigation placement
- Clear section labeling
- Inspiring examples visible

### Tertiary Entry: Email Campaign
**Trigger**: Targeted email to inactive users
**Flow**:
1. User receives "Try something different" email
2. Clicks through to marketplace
3. Sees personalized benefits
4. Prompted to create post

**Design Requirements**:
- Compelling email design
- Personalized content
- Clear CTA
- Landing page continuity

## Core User Flow

### Step 1: Marketplace Discovery
**Screen**: Marketplace Landing Page
**User Actions**:
- Scroll through active posts
- Read how it works
- View success metrics
- Click "Create Your Post"

**System Response**:
- Show diverse post examples
- Display success statistics
- Highlight privacy features
- Present clear CTA

**Content Elements**:
```
Hero Section:
"Let Landlords Find You"
"Stop searching. Start receiving personalized property offers."
[Create Your Post] [See How It Works]

Success Banner:
"🎉 312 tenants found homes this month through the marketplace"

Sample Posts Grid:
[Post Card 1] [Post Card 2] [Post Card 3]
"Young professional, L.8,000-10,000, Las Colinas"
"Family of 4, L.15,000-18,000, need schools nearby"
"Remote worker, L.12,000, quiet neighborhood"
```

### Step 2: Post Creation - Basic Info
**Screen**: Creation Wizard Step 1
**User Actions**:
- Enter budget range
- Select move-in date
- Choose flexibility options
- Specify lease duration
- Continue to next step

**System Response**:
- Pre-fill from search profile
- Validate budget ranges
- Show market insights
- Calculate date ranges
- Auto-save progress

**Form Fields**:
```typescript
interface BasicInfoStep {
  budgetMin: number;        // Required, min 3000
  budgetMax: number;        // Required, max 100000
  moveInDate: Date;         // Required, future date
  dateFlexibility: 'exact' | 'week' | 'month';
  leaseDuration: 6 | 12 | 18 | 24; // months
  urgency: 'immediate' | 'planned' | 'flexible';
}
```

### Step 3: Post Creation - Property Preferences
**Screen**: Creation Wizard Step 2
**User Actions**:
- Select property types
- Choose bedroom/bathroom count
- Specify minimum area
- Select preferred neighborhoods
- Add nearby landmarks

**System Response**:
- Show popular selections
- Suggest based on budget
- Map integration for areas
- Landmark autocomplete
- Validate combinations

**Visual Design**:
```css
.property-preferences {
  display: grid;
  gap: 24px;
}

.property-type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.property-type-card {
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.property-type-card.selected {
  border-color: #6366F1;
  background: #EEF2FF;
}

.area-selector {
  position: relative;
}

.area-map {
  height: 300px;
  border-radius: 12px;
  margin-top: 12px;
}

.selected-areas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.area-chip {
  padding: 6px 12px;
  background: #F3F4F6;
  border-radius: 20px;
  font-size: 14px;
}
```

### Step 4: Post Creation - Tenant Details
**Screen**: Creation Wizard Step 3
**User Actions**:
- Specify occupant details
- Add occupation info
- Indicate pet ownership
- Select parking needs
- Write personal description

**System Response**:
- Character count for description
- Pet policy information
- Parking availability data
- Profile photo upload
- Verification options

### Step 5: Post Creation - Requirements
**Screen**: Creation Wizard Step 4
**User Actions**:
- Add must-have features
- List nice-to-have items
- Specify deal breakers
- Write additional notes
- Set post duration

**System Response**:
- Suggest common requirements
- Tag organization
- Duplicate detection
- Expiration date setting
- Quality score calculation

**Requirement Builder**:
```
Must-Haves (Required for consideration):
[+] Aire acondicionado
[+] Agua caliente
[+] Parqueo techado
[Add more...]

Nice-to-Haves (Preferred but flexible):
[+] Piscina
[+] Área de BBQ
[+] Gimnasio
[Add more...]

Deal Breakers (Absolutely no):
[+] Primer piso
[+] Sin seguridad
[+] Compartir entrada
[Add more...]
```

### Step 6: Preview & Publish
**Screen**: Post Preview
**User Actions**:
- Review all information
- Check privacy settings
- Edit if needed
- Accept terms
- Publish post

**System Response**:
- Generate preview
- Highlight missing info
- Privacy indicator
- Terms presentation
- Confirmation message

### Step 7: Post Live - Dashboard
**Screen**: Post Management Dashboard
**User Actions**:
- View post analytics
- Check responses
- Edit post details
- Pause/resume post
- Share post link

**System Response**:
- Real-time metrics
- Response notifications
- Edit capabilities
- Status controls
- Share functionality

**Dashboard Layout**:
```
Your Active Post
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Performance            🏠 Responses
Views: 127               Total: 8
Today: 23                New: 3
This week: 89            Pending: 5

⭐ Quality Score: 85/100
📅 Expires: March 15 (23 days)

[Edit Post] [Pause] [Share] [Boost]
```

### Step 8: Landlord Response Management
**Screen**: Response Inbox
**User Actions**:
- View landlord profiles
- Read property offers
- Accept/decline connections
- Send messages
- Schedule viewings

**System Response**:
- Sort by relevance
- Property preview cards
- Connection management
- Message threading
- Calendar integration

## Alternative Paths

### Quick Post Creation
**For**: Returning users with saved profile
**Flow**:
1. One-click post from profile
2. Auto-fill all fields
3. Quick review
4. Instant publish
5. Confirmation

### Guided Creation for Specific Needs
**For**: Users with accessibility requirements
**Flow**:
1. Select "Special needs" path
2. Additional fields appear
3. Accessibility requirements
4. Medical needs proximity
5. Enhanced privacy options

### Group/Family Posting
**For**: Multiple tenants together
**Flow**:
1. Select "Group rental"
2. Add co-tenant details
3. Combined requirements
4. Shared budget calculation
5. Group verification

### Emergency Housing Path
**For**: Urgent relocation needs
**Flow**:
1. Select "Urgent" flag
2. Simplified form
3. Immediate visibility boost
4. Priority notifications
5. Fast-track responses

## Edge Cases

### No Landlord Responses
**Situation**: Post active for 48 hours without responses
**Handling**:
- Send optimization tips email
- Suggest post improvements
- Offer visibility boost
- Review market conditions
- Provide alternative options

**UI Response**:
```
📭 No responses yet
Your post might need some adjustments:

✓ Try expanding your area preferences
✓ Consider adjusting your budget (+/- 10%)
✓ Add more details about yourself
✓ Verify your profile for trust

[Improve My Post] [Get Help]
```

### Overwhelming Responses
**Situation**: 20+ responses in first hour
**Handling**:
- Automatic response throttling
- Smart sorting by match quality
- Batch response tools
- Quick decline options
- Response templates

### Spam/Inappropriate Responses
**Situation**: Landlord sends spam or inappropriate content
**Handling**:
- One-click reporting
- Automatic blocking
- Content moderation
- User protection
- Follow-up support

### Post Expiration Approaching
**Situation**: 3 days before expiration
**Handling**:
- Email reminder
- In-app notification
- Renewal prompt
- Performance summary
- Success tips

### Technical Issues During Creation
**Situation**: Connection lost during form completion
**Handling**:
- Auto-save every 30 seconds
- Local storage backup
- Resume capability
- Draft recovery
- Progress preservation

## Exit Points

### Successful Match
**Outcome**: Tenant finds housing through marketplace
**Next Actions**:
- Mark post as fulfilled
- Success story prompt
- Review request
- Referral opportunity
- Archive post data

**Success Flow**:
```
🎉 Congratulations!
You've marked your post as fulfilled.

Would you like to:
[Share Your Success Story]
[Leave a Review]
[Refer a Friend]
[Close]
```

### Manual Post Removal
**Outcome**: User deletes post
**Next Actions**:
- Confirm deletion
- Ask for reason
- Preserve search profile
- Offer alternatives
- Feedback collection

### Post Expiration
**Outcome**: 30-day limit reached
**Next Actions**:
- Expiration notice
- Performance summary
- Renewal option
- Archive access
- Alternative suggestions

### Platform Abandonment
**Save Points**:
- Post draft
- Response history
- Landlord connections
- Analytics data
- Profile information

**Recovery Mechanisms**:
- Re-engagement emails
- Push notifications
- Special offers
- Success stories
- Market updates


## Accessibility Considerations

### Visual Accessibility
- High contrast mode support
- Screen reader optimization
- Focus management
- Color-blind friendly design

### Motor Accessibility
- Large touch targets (48x48px)
- Keyboard navigation
- Voice input support
- Gesture alternatives

### Cognitive Accessibility
- Simple language
- Progress indication
- Help available at each step
- Error recovery guidance

## Related Documentation
- [Screen States Documentation](./screen-states.md)
- [Interaction Specifications](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)