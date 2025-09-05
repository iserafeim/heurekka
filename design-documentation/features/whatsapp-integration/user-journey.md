---
title: WhatsApp Integration - User Journey
description: Comprehensive user journey mapping for WhatsApp messaging integration
feature: whatsapp-integration
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./README.md
  - ./screen-states.md
  - ./interactions.md
  - ./implementation.md
status: approved
---

# WhatsApp Integration - User Journey

## Overview
This document maps the complete user journey for WhatsApp-based communication between tenants and landlords, from initial contact through conversation management.

## Table of Contents
1. [User Personas](#user-personas)
2. [Journey Stages](#journey-stages)
3. [Entry Points](#entry-points)
4. [Core User Flow](#core-user-flow)
5. [Alternative Paths](#alternative-paths)
6. [Edge Cases](#edge-cases)
7. [Exit Points](#exit-points)

## User Personas

### Primary Persona: Mobile-First Tenant
- **Goals**: Quick property inquiries, maintain conversation history, avoid repetitive information sharing
- **Pain Points**: Filling forms repeatedly, losing track of conversations, slow email responses
- **Technical Proficiency**: Medium (daily WhatsApp user)
- **Device Preference**: Smartphone (Android/iOS)
- **Communication Style**: Informal, expects quick responses

### Secondary Persona: Multi-Property Landlord
- **Goals**: Manage multiple inquiries, qualify leads quickly, maintain professional communication
- **Pain Points**: Unqualified inquiries, missing tenant information, conversation management across properties
- **Technical Proficiency**: Medium (WhatsApp Business user)
- **Device Preference**: Mixed (phone for quick responses, desktop for management)
- **Communication Style**: Professional, structured responses

### Tertiary Persona: Real Estate Agent
- **Goals**: Handle high volume efficiently, track lead sources, maintain response time SLA
- **Pain Points**: Context switching between conversations, lead qualification time, follow-up management
- **Technical Proficiency**: High (uses multiple tools)
- **Device Preference**: WhatsApp Business on desktop
- **Communication Style**: Professional templates with personalization

## Journey Stages

### Stage 1: Discovery & Interest
**User State**: Browsing properties, found interesting listing
**Touchpoints**: 
- Property card WhatsApp button
- Property details contact section
- Floating contact button on mobile
- Contact panel on desktop

**Emotional State**: Interested, motivated to inquire
**Success Metrics**: 
- Button visibility and prominence
- Click-through rate from property view
- Time to contact decision

### Stage 2: Profile Verification
**User State**: Ready to contact, may need authentication
**Touchpoints**:
- Login/registration modal
- Profile completion form
- Quick profile review
- Privacy consent checkbox

**Emotional State**: Slightly impatient, wants quick contact
**Success Metrics**:
- Profile completion rate
- Drop-off points in flow
- Time to complete profile

### Stage 3: Message Preparation
**User State**: Reviewing auto-generated message
**Touchpoints**:
- Message preview modal
- Edit capabilities
- Property reference inclusion
- Profile summary display

**Emotional State**: Evaluating message quality
**Success Metrics**:
- Message edit rate
- Preview time duration
- Send completion rate

### Stage 4: WhatsApp Handoff
**User State**: Transitioning to WhatsApp
**Touchpoints**:
- App detection and routing
- WhatsApp app launch
- Pre-filled message display
- Send button in WhatsApp

**Emotional State**: Committed to contact
**Success Metrics**:
- Successful app launches
- Message send rate
- Fallback method usage

### Stage 5: Conversation Management
**User State**: Engaged in property discussion
**Touchpoints**:
- WhatsApp conversation thread
- Property reference links
- Additional information requests
- Viewing scheduling

**Emotional State**: Engaged, evaluating responses
**Success Metrics**:
- Response times
- Conversation length
- Viewing conversion rate

## Entry Points

### Primary Entry: Property Details Page
**Trigger**: Detailed property exploration
**Flow**:
1. View property photos and details
2. Scroll to contact section
3. Click prominent WhatsApp button
4. Authenticate if needed
5. Review and send message

**Design Considerations**:
- Sticky WhatsApp button on mobile scroll
- Multiple contact points throughout page
- Clear value proposition messaging

### Secondary Entry: Property Card Quick Action
**Trigger**: Initial interest from browse view
**Flow**:
1. Browse property listings
2. Hover/tap for quick actions
3. Click WhatsApp icon
4. Quick profile check
5. Direct to WhatsApp

**Design Considerations**:
- Prominent WhatsApp icon
- Tooltip on hover (desktop)
- Quick action without leaving browse

### Tertiary Entry: Saved Properties Dashboard
**Trigger**: Returning to saved favorites
**Flow**:
1. Access saved properties
2. Review saved listings
3. Batch contact option
4. Sequential WhatsApp messages
5. Track contacted properties

**Design Considerations**:
- Bulk action capabilities
- Contact status indicators
- Message template variations

## Core User Flow

### Step 1: Contact Initiation
**Screen**: Property View (Card/Details)
**User Actions**:
- Identify WhatsApp contact button
- Click/tap to initiate contact
- Recognize WhatsApp branding

**System Response**:
- Button hover state (desktop)
- Loading indicator on click
- Check authentication status
- Route to appropriate flow

**Visual Design**:
```css
.whatsapp-button {
  background: #25D366;
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.whatsapp-button:hover {
  background: #20BD5C;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.whatsapp-icon {
  width: 20px;
  height: 20px;
}
```

### Step 2: Authentication Check
**Screen**: Modal or Inline Form
**User Actions**:
- Login if existing user
- Quick registration if new
- Complete search profile
- Consent to data sharing

**System Response**:
- Progressive form disclosure
- Auto-save on field completion
- Validation feedback
- Profile completeness indicator

**Decision Points**:
- Existing user → Skip to message prep
- New user → Profile creation
- Incomplete profile → Quick completion

### Step 3: Message Generation
**Screen**: Message Preview Modal
**User Actions**:
- Review auto-generated message
- Edit if needed
- Confirm property details
- Verify profile information
- Click send to WhatsApp

**System Response**:
- Generate personalized template
- Include property reference
- Add profile summary
- Format for readability
- Character count validation

**Message Template Structure**:
```
Hola! 👋

Vi tu propiedad en HEUREKKA:
📍 [Property Title]
💰 L.[Price]/mes
🔗 [Short Link]

Mi perfil:
• Presupuesto: L.[Min]-[Max]
• Mudanza: [Date]
• Ocupantes: [Number]
• Zonas preferidas: [Areas]

Me gustaría agendar una visita. ¿Cuándo podríamos coordinar?

Gracias!
[User Name]
```

### Step 4: WhatsApp Launch
**Screen**: WhatsApp App/Web
**User Actions**:
- Review pre-filled message
- Make final edits if needed
- Press send button
- Continue conversation

**System Response**:
- Detect WhatsApp availability
- Use appropriate deep link
- Handle app switching
- Track successful launch
- Provide fallback options

**Technical Implementation**:
```javascript
// Mobile deep link
whatsapp://send?phone=504XXXXXXXX&text=encoded_message

// Web fallback
https://wa.me/504XXXXXXXX?text=encoded_message

// Desktop web
https://web.whatsapp.com/send?phone=504XXXXXXXX&text=encoded_message
```

### Step 5: Conversation Tracking
**Screen**: User Dashboard
**User Actions**:
- View contacted properties
- Track conversation status
- Add notes about interactions
- Schedule follow-ups
- Mark as viewed/not interested

**System Response**:
- Update contact status
- Log interaction timestamp
- Send reminder notifications
- Track response metrics
- Suggest similar properties

## Alternative Paths

### WhatsApp Web Preference
**For**: Desktop users
**Flow**:
1. Click WhatsApp button
2. Choose "Open in Web"
3. QR code scan if needed
4. Message in browser
5. Continue on desktop

### Copy Message Fallback
**For**: Users without WhatsApp
**Flow**:
1. Click contact button
2. See "No WhatsApp?" option
3. Copy formatted message
4. Choose alternative channel
5. Paste and send manually

### Bulk Contact Flow
**For**: Serious searchers
**Flow**:
1. Save multiple properties
2. Access batch contact
3. Review all messages
4. Send sequentially
5. Manage responses

### Business Account Flow
**For**: Agents and landlords
**Flow**:
1. Receive inquiry
2. See tenant profile inline
3. Use quick replies
4. Access CRM integration
5. Track in dashboard

## Edge Cases

### WhatsApp Not Installed
**Situation**: Mobile user without WhatsApp
**Handling**:
- Detect app absence
- Show installation prompt
- Offer web WhatsApp option
- Provide copy-paste fallback
- Alternative contact methods

**UI Response**:
```
"WhatsApp no detectado"
[Instalar WhatsApp] [Usar WhatsApp Web] [Copiar Mensaje]
```

### Message Too Long
**Situation**: Profile + property exceeds character limit
**Handling**:
- Automatic truncation
- Essential info prioritization
- "More info" link inclusion
- Character counter display
- Edit suggestion prompts

### Invalid Phone Number
**Situation**: Landlord number incorrect/inactive
**Handling**:
- Pre-validation on listing
- Error message display
- Alternative contact search
- Report issue option
- Admin notification

### Network Connectivity Issues
**Situation**: Poor connection during handoff
**Handling**:
- Retry mechanism
- Message draft saving
- Offline mode support
- Queue for later sending
- Clear status indicators

### Multiple Property Inquiries
**Situation**: User wants to contact about several properties
**Handling**:
- Batch message preparation
- Property list in message
- Sequential sending option
- Conversation threading
- Contact history tracking

## Exit Points

### Successful Message Send
**Outcome**: Message delivered via WhatsApp
**Next Actions**:
- Return to property/browse
- Mark as contacted
- Set follow-up reminder
- View similar properties
- Track in dashboard

**Success Indicators**:
- Confirmation toast notification
- Updated contact badge
- Dashboard reflection
- Analytics tracking

### Conversation Started
**Outcome**: Active WhatsApp dialogue
**Next Actions**:
- Continue in WhatsApp
- Schedule property viewing
- Exchange additional info
- Negotiate terms
- Close deal

**Tracking**:
- Response time metrics
- Conversation quality score
- Viewing conversion rate
- Deal closure tracking

### Fallback Method Used
**Outcome**: Alternative contact method
**Next Actions**:
- Track fallback usage
- Provide method guidance
- Update contact status
- Monitor for issues
- Gather feedback

### Abandonment
**Save Points**:
- Partial profile data
- Property interest
- Message draft
- Contact attempt

**Recovery Strategies**:
- Reminder notification
- Email follow-up
- Simplified retry flow
- Progressive profile completion

## Success Metrics & KPIs

### Engagement Metrics
- WhatsApp button CTR: >15%
- Message preview completion: >85%
- Send completion rate: >90%
- Profile inclusion rate: 100%

### Quality Metrics
- Complete profile messages: >95%
- Landlord response rate: >60%
- Response time: <30 minutes average
- Conversation quality score: >4/5

### Technical Metrics
- WhatsApp launch success: >95%
- Fallback usage: <5%
- Message generation time: <500ms
- Deep link reliability: >98%

### Business Metrics
- Contact to viewing: >30%
- Viewing to application: >50%
- Application to lease: >25%
- User satisfaction: >4.5/5

## Accessibility Considerations

### Visual Accessibility
- WhatsApp green contrast ratio: 3.5:1
- Alternative text for icons
- Focus indicators visible
- Scalable interface elements

### Motor Accessibility
- Large touch targets (48x48px)
- Adequate spacing between buttons
- Gesture alternatives
- Keyboard shortcuts available

### Cognitive Accessibility
- Clear messaging flow
- Simple language use
- Progress indicators
- Help text available

### Screen Reader Support
- Semantic HTML structure
- ARIA labels complete
- Status announcements
- Navigation landmarks

## Related Documentation
- [Screen States Documentation](./screen-states.md)
- [Interaction Specifications](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)