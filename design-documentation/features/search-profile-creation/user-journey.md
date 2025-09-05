---
title: Search Profile Creation - User Journey
description: Comprehensive user journey mapping for the search profile creation feature
feature: search-profile-creation
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./screen-states.md
  - ./interactions.md
  - ./implementation.md
status: approved
---

# Search Profile Creation - User Journey

## Overview
This document maps the complete user journey for creating and managing property search profiles in Heurekka, from initial entry through profile completion and ongoing management.

## Table of Contents
1. [User Personas](#user-personas)
2. [Journey Stages](#journey-stages)
3. [Entry Points](#entry-points)
4. [Core User Flow](#core-user-flow)
5. [Alternative Paths](#alternative-paths)
6. [Edge Cases](#edge-cases)
7. [Exit Points](#exit-points)

## User Personas

### Primary Persona: Active Property Seeker
- **Goals**: Find properties matching specific criteria quickly
- **Pain Points**: Repetitive searches, missing opportunities, information overload
- **Technical Proficiency**: Medium to high
- **Time Availability**: Limited, prefers efficiency
- **Key Motivations**: Save time, get personalized matches, early notifications

### Secondary Persona: Casual Browser
- **Goals**: Explore market options without commitment
- **Pain Points**: Not ready to commit, wants flexibility
- **Technical Proficiency**: Low to medium
- **Time Availability**: Sporadic engagement
- **Key Motivations**: Stay informed, low-pressure exploration

### Tertiary Persona: Investment Professional
- **Goals**: Track multiple property types and locations
- **Pain Points**: Need for multiple concurrent searches
- **Technical Proficiency**: High
- **Time Availability**: Regular monitoring
- **Key Motivations**: Portfolio diversification, market analysis

## Journey Stages

### Stage 1: Discovery & Awareness
**User State**: Unaware of search profiles
**Touchpoints**: 
- Homepage hero section
- Search results page prompt
- Property detail page suggestion

**Emotional State**: Curious but cautious
**Success Metrics**: 
- Click-through rate on profile creation prompts
- Time to first interaction

### Stage 2: Initial Engagement
**User State**: Interested in creating profile
**Touchpoints**:
- Profile creation modal/page
- Onboarding tooltip
- Feature explanation

**Emotional State**: Motivated but uncertain
**Success Metrics**:
- Form start rate
- Field completion rate
- Drop-off points analysis

### Stage 3: Profile Configuration
**User State**: Actively setting preferences
**Touchpoints**:
- Multi-step form wizard
- Preference selectors
- Location picker
- Budget calculator

**Emotional State**: Engaged and focused
**Success Metrics**:
- Average time per step
- Preference specificity
- Use of advanced options

### Stage 4: Confirmation & Activation
**User State**: Reviewing and confirming settings
**Touchpoints**:
- Summary screen
- Edit capabilities
- Save confirmation
- Notification preferences

**Emotional State**: Satisfied and anticipatory
**Success Metrics**:
- Profile completion rate
- Notification opt-in rate
- Immediate search execution

### Stage 5: Ongoing Management
**User State**: Active profile user
**Touchpoints**:
- Profile dashboard
- Edit interface
- Notification center
- Match results

**Emotional State**: Routine engagement
**Success Metrics**:
- Return visit frequency
- Profile modification rate
- Notification engagement

## Entry Points

### Primary Entry: Search Results Enhancement
**Trigger**: After 3+ similar searches
**Flow**:
1. System detects search pattern
2. Inline prompt appears: "Save this search to get instant notifications"
3. Quick-save option with pre-filled criteria
4. Expansion to full profile customization

### Secondary Entry: Homepage CTA
**Trigger**: Direct homepage visit
**Flow**:
1. Hero section CTA: "Create Your Perfect Property Alert"
2. Feature benefits preview
3. Start profile creation wizard
4. Guided onboarding experience

### Tertiary Entry: Property Detail Suggestion
**Trigger**: Viewing similar properties
**Flow**:
1. "Find more properties like this" prompt
2. Auto-generated profile based on current property
3. Refinement options
4. Save and activate

## Core User Flow

### Step 1: Profile Initiation
**Screen**: Profile Creation Landing
**User Actions**:
- Click "Create Search Profile"
- Review feature benefits
- Choose creation method (guided/quick)

**System Response**:
- Display creation wizard
- Pre-fill known user data
- Show progress indicator

**Decision Points**:
- Sign in/Register (if not authenticated)
- Skip for now
- Continue as guest (limited features)

### Step 2: Basic Criteria Selection
**Screen**: Criteria Selection Form
**User Actions**:
- Select property type(s)
- Choose location(s) via:
  - Map interface
  - Search box
  - Neighborhood selector
  - Draw custom area
- Set budget range with slider
- Define bedroom/bathroom requirements

**System Response**:
- Real-time match count preview
- Suggestion chips for popular criteria
- Auto-save progress
- Validation feedback

**Progressive Disclosure**:
- Basic options shown first
- "More filters" reveals advanced criteria
- Custom preferences section for power users

### Step 3: Advanced Preferences
**Screen**: Detailed Preferences
**User Actions**:
- Set property features:
  - Parking requirements
  - Outdoor space preferences
  - Pet policies
  - Amenities checklist
- Define deal-breakers
- Set urgency level

**System Response**:
- Contextual help tooltips
- Impact preview on match count
- Suggested combinations
- Compatibility warnings

### Step 4: Notification Configuration
**Screen**: Alert Preferences
**User Actions**:
- Choose notification channels:
  - Email (frequency: instant/daily/weekly)
  - Push notifications
  - SMS (premium)
  - In-app only
- Set quiet hours
- Define urgency thresholds

**System Response**:
- Channel verification
- Preview notification format
- Test notification option
- Privacy assurance messaging

### Step 5: Review & Confirmation
**Screen**: Profile Summary
**User Actions**:
- Review all settings
- Edit any section directly
- Name the profile
- Add optional notes
- Confirm creation

**System Response**:
- Complete profile visualization
- Estimated match frequency
- First matches preview
- Success confirmation
- Next steps guidance

## Alternative Paths

### Quick Save Path
**For**: Returning users with search history
**Flow**:
1. One-click save from search results
2. Auto-generated profile name
3. Default notification settings
4. Immediate activation
5. Edit later option

### Import Path
**For**: Users with saved searches elsewhere
**Flow**:
1. Upload CSV/JSON file
2. Field mapping interface
3. Bulk profile creation
4. Review and adjust
5. Batch activation

### Collaborative Path
**For**: Couples/Groups searching together
**Flow**:
1. Create shared profile
2. Invite collaborators
3. Vote on preferences
4. Consensus requirements
5. Shared notifications

## Edge Cases

### No Results Scenario
**Situation**: Profile criteria too restrictive
**Handling**:
- Alert user to zero matches
- Suggest relaxing specific criteria
- Show similar available properties
- Offer to save anyway for future matches
- Provide market insights

### Conflicting Criteria
**Situation**: Mutually exclusive preferences
**Handling**:
- Highlight conflicts visually
- Explain incompatibility
- Suggest alternatives
- Allow override with warning
- Document user choice

### Location Not Covered
**Situation**: Selected area not in service region
**Handling**:
- Clear messaging about coverage
- Suggest nearest covered areas
- Offer waitlist option
- Alternative notification when available
- Partner referral if applicable

### Payment Required
**Situation**: Premium features selected
**Handling**:
- Clear pricing display
- Feature comparison
- Free trial option
- Downgrade alternatives
- Transparent billing

## Exit Points

### Successful Completion
**Outcome**: Active search profile created
**Next Actions**:
- View first matches
- Share profile
- Create another profile
- Explore dashboard
- Browse properties

### Abandonment Recovery
**Save Progress Points**:
- After each major section
- On navigation away
- On session timeout

**Return Mechanisms**:
- Email reminder with progress link
- Push notification after 24 hours
- Homepage banner on return
- Simplified completion flow

### Profile Deactivation
**User Actions**:
- Pause notifications
- Archive profile
- Delete profile
- Export criteria

**System Response**:
- Confirmation request
- Data retention notice
- Reactivation instructions
- Feedback collection

## Success Metrics & KPIs

### Engagement Metrics
- Profile creation conversion rate: >40%
- Average time to complete: <3 minutes
- Field completion rate: >85%
- Advanced features usage: >30%

### Quality Metrics
- Profile edit frequency: 2-3 times/month
- Match satisfaction rate: >70%
- Notification engagement: >50%
- False positive rate: <10%

### Retention Metrics
- 30-day profile retention: >80%
- Active profile percentage: >60%
- Multi-profile users: >25%
- Reactivation rate: >40%

## Accessibility Considerations

### Keyboard Navigation
- Full keyboard accessibility
- Logical tab order
- Skip links for long forms
- Keyboard shortcuts for power users

### Screen Reader Optimization
- Descriptive labels for all inputs
- Progress announcements
- Error message association
- Success confirmation announcements

### Visual Accessibility
- High contrast mode support
- Focus indicators (3px minimum)
- Color-blind friendly indicators
- Text scalability to 200%

### Cognitive Accessibility
- Clear, simple language
- Step-by-step guidance
- Automatic save progress
- No time limits
- Clear error recovery

## Related Documentation
- [Screen States Documentation](design-documentation/features/search-profile-creation/screen-states.md)
- [Interaction Specifications](design-documentation/features/search-profile-creation/interactions.md)
- [Implementation Guide](design-documentation/features/search-profile-creation/implementation.md)
- [Accessibility Requirements](design-documentation/features/search-profile-creation/accessibility.md)