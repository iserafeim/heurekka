---
title: Property Discovery - User Journey
description: Comprehensive user journey mapping for the property discovery feature
feature: property-discovery
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./screen-states.md
  - ./interactions.md
  - ./implementation.md
status: approved
---

# Property Discovery - User Journey

## Overview
This document maps the complete user journey for discovering and exploring properties in Heurekka, from initial search through property details and contact initiation.

## Table of Contents
1. [User Personas](#user-personas)
2. [Journey Stages](#journey-stages)
3. [Entry Points](#entry-points)
4. [Core User Flow](#core-user-flow)
5. [Alternative Paths](#alternative-paths)
6. [Edge Cases](#edge-cases)
7. [Exit Points](#exit-points)

## User Personas

### Primary Persona: First-Time Buyer
- **Goals**: Find affordable starter home, understand market options
- **Pain Points**: Overwhelming choices, complex search filters, information overload
- **Technical Proficiency**: Medium
- **Time Availability**: Evenings and weekends
- **Key Motivations**: Find perfect home, stay within budget, move-in ready properties

### Secondary Persona: Relocating Professional
- **Goals**: Quick property search, virtual tours, remote decision making
- **Pain Points**: Limited local knowledge, time constraints, remote viewing challenges
- **Technical Proficiency**: High
- **Time Availability**: Limited, urgent timeline
- **Key Motivations**: Efficiency, comprehensive information, trusted data

### Tertiary Persona: Property Investor
- **Goals**: Identify investment opportunities, analyze ROI, track multiple markets
- **Pain Points**: Need for detailed analytics, market comparisons, portfolio management
- **Technical Proficiency**: High
- **Time Availability**: Regular monitoring
- **Key Motivations**: Investment returns, market trends, opportunity identification

## Journey Stages

### Stage 1: Initial Discovery
**User State**: Browsing without specific criteria
**Touchpoints**: 
- Homepage featured properties
- Trending searches
- Neighborhood guides
- Quick search bar

**Emotional State**: Curious, exploratory
**Success Metrics**: 
- Engagement rate with featured content
- Search initiation rate
- Time to first meaningful interaction

### Stage 2: Search Refinement
**User State**: Actively filtering and refining results
**Touchpoints**:
- Search filters panel
- Map view toggle
- Sort options
- Saved searches prompt

**Emotional State**: Focused, analytical
**Success Metrics**:
- Filter usage rate
- Results relevance score
- Save search conversion

### Stage 3: Property Evaluation
**User State**: Comparing specific properties
**Touchpoints**:
- Property cards
- Quick view modal
- Comparison tool
- Favorite button

**Emotional State**: Evaluative, decisive
**Success Metrics**:
- Property view depth
- Comparison tool usage
- Favorite rate

### Stage 4: Deep Dive
**User State**: Examining property details
**Touchpoints**:
- Photo gallery
- Virtual tour
- Neighborhood info
- School data
- Transit scores

**Emotional State**: Interested, scrutinizing
**Success Metrics**:
- Time on property page
- Media engagement rate
- Information completeness score

### Stage 5: Action Taking
**User State**: Ready to engage
**Touchpoints**:
- Contact agent button
- Schedule viewing
- Save property
- Share options
- Mortgage calculator

**Emotional State**: Committed, action-oriented
**Success Metrics**:
- Contact initiation rate
- Viewing schedule rate
- Lead quality score

## Entry Points

### Primary Entry: Homepage Search
**Trigger**: Direct site visit
**Flow**:
1. Land on homepage
2. See hero search interface
3. Enter location or criteria
4. View initial results
5. Begin refinement process

### Secondary Entry: Saved Search Alert
**Trigger**: Email/push notification
**Flow**:
1. Receive new match alert
2. Click through to results
3. View pre-filtered matches
4. Explore new properties
5. Update search if needed

### Tertiary Entry: Direct Property Link
**Trigger**: Shared link or external reference
**Flow**:
1. Access specific property page
2. View property details
3. Explore similar properties
4. Initiate broader search
5. Save search criteria

## Core User Flow

### Step 1: Search Initiation
**Screen**: Homepage/Search Landing
**User Actions**:
- Enter location (city, zip, neighborhood)
- Select property type
- Set initial price range
- Click search button

**System Response**:
- Auto-suggest locations
- Show popular searches
- Display recent searches
- Load results instantly

**Decision Points**:
- Use current location
- Browse without searching
- Use saved search

### Step 2: Results Exploration
**Screen**: Search Results Grid/Map
**User Actions**:
- Toggle between grid and map views
- Apply filters:
  - Price range adjustment
  - Bedrooms/bathrooms
  - Property features
  - Listing date
  - More filters expansion
- Sort results:
  - Price (low to high/high to low)
  - Newest listings
  - Most popular
  - Best match

**System Response**:
- Real-time result updates
- Result count indicator
- Map markers update
- Loading states for changes
- No results messaging

**Progressive Disclosure**:
- Basic filters visible
- Advanced filters hidden initially
- Custom search areas on map
- Agent-listed properties filter

### Step 3: Property Preview
**Screen**: Quick View Modal/Card Expansion
**User Actions**:
- Hover for quick info
- Click for quick view
- Navigate photos
- View key details
- Save to favorites
- Compare checkbox

**System Response**:
- Smooth modal animation
- Preload adjacent properties
- Update recently viewed
- Sync favorite status

### Step 4: Property Details
**Screen**: Full Property Page
**User Actions**:
- Browse photo gallery
- View virtual tour
- Read description
- Check specifications
- Explore neighborhood:
  - Schools ratings
  - Transit options
  - Local amenities
  - Crime statistics
- Calculate mortgage
- Check price history

**System Response**:
- Lazy load images
- Progressive data loading
- Interactive maps
- Dynamic calculations
- Related properties suggestion

### Step 5: Engagement Actions
**Screen**: Contact/Action Panel
**User Actions**:
- Contact agent:
  - Send message
  - Request info
  - Schedule showing
- Save property
- Share property:
  - Email
  - Social media
  - Copy link
- Print details
- Report issue

**System Response**:
- Confirmation messages
- Calendar integration
- Email notifications
- Share tracking
- Lead routing

## Alternative Paths

### Map-First Search
**For**: Location-focused users
**Flow**:
1. Start with map view
2. Draw search area
3. See results in area
4. Refine with filters
5. Drill into properties

### Commute-Based Search
**For**: Working professionals
**Flow**:
1. Enter work address
2. Set commute time limit
3. Choose transport mode
4. View properties in range
5. Optimize for commute

### School-District Search
**For**: Families with children
**Flow**:
1. Search by school name/rating
2. View district boundaries
3. Filter by school performance
4. See eligible properties
5. Compare school options

### Investment Analysis Path
**For**: Property investors
**Flow**:
1. Set investment criteria
2. View ROI calculations
3. Compare cap rates
4. Analyze trends
5. Track opportunities

## Edge Cases

### No Results Found
**Situation**: Search criteria too restrictive
**Handling**:
- Show "No results" message
- Suggest relaxing filters
- Recommend similar areas
- Offer to save search for alerts
- Show nearest matches

### Single Result
**Situation**: Highly specific search
**Handling**:
- Auto-expand property details
- Show similar properties
- Suggest broadening search
- Highlight unique match
- Emphasize property features

### Overwhelming Results (1000+)
**Situation**: Broad search criteria
**Handling**:
- Suggest refinement options
- Show best matches first
- Enable smart filtering
- Provide guided refinement
- Use pagination/infinite scroll

### Outdated Listing
**Situation**: Property no longer available
**Handling**:
- Clear status indicator
- Suggest similar available properties
- Offer to save search
- Update notification preference
- Remove from results option

### Technical Issues
**Situation**: Map/images not loading
**Handling**:
- Fallback to list view
- Show placeholder images
- Provide text descriptions
- Enable basic functionality
- Clear error messages

## Exit Points

### Successful Contact
**Outcome**: User contacts agent/owner
**Next Actions**:
- Confirmation message
- Email follow-up
- Save to contacted list
- Track in dashboard
- Related property suggestions

### Search Saved
**Outcome**: User saves search for alerts
**Next Actions**:
- Configure alert preferences
- Show saved search manager
- First alert preview
- Suggest profile completion
- Tutorial for features

### Property Favorited
**Outcome**: User saves properties for later
**Next Actions**:
- Add to favorites list
- Compare prompt
- Share collection option
- Track price changes
- Similar property alerts

### Session Abandonment
**Save Points**:
- Search criteria
- Viewed properties
- Applied filters
- Map position
- Sort preferences

**Return Mechanisms**:
- "Continue where you left off" prompt
- Email reminder with saved search
- Push notification for new matches
- Saved search in account
- Recently viewed section

## Success Metrics & KPIs

### Engagement Metrics
- Search-to-results rate: >90%
- Filter usage rate: >60%
- Map view adoption: >40%
- Property view depth: >3 per session

### Discovery Metrics
- Average properties viewed: 8-12 per session
- Favorite rate: >20% of users
- Comparison tool usage: >30%
- Return visitor rate: >50%

### Conversion Metrics
- Contact initiation rate: >5%
- Viewing schedule rate: >2%
- Search save rate: >35%
- Share rate: >10%

### Performance Metrics
- Search results load time: <2s
- Image load time: <1s
- Map interaction latency: <100ms
- Filter application time: <500ms

## Accessibility Considerations

### Screen Reader Support
- Property cards fully navigable
- Image descriptions provided
- Map alternatives available
- Filter states announced

### Keyboard Navigation
- Full keyboard support
- Logical tab order
- Skip to results link
- Map keyboard controls

### Visual Accessibility
- High contrast mode
- Zoom to 200% support
- Color-blind friendly
- Focus indicators visible

### Motor Accessibility
- Large touch targets
- Gesture alternatives
- Simplified interactions
- Voice search option

### Cognitive Accessibility
- Clear labeling
- Progressive disclosure
- Simplified language
- Help readily available

## Related Documentation
- [Screen States Documentation](./screen-states.md)
- [Interaction Specifications](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)