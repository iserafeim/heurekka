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

### Primary Persona: Young Professional Renter
- **Goals**: Find affordable apartment near work, quick WhatsApp contact
- **Pain Points**: Limited time to search, need visual property comparison, Spanish-language preference
- **Technical Proficiency**: High on mobile, medium on desktop
- **Time Availability**: Lunch breaks and evenings
- **Key Motivations**: Location convenience, price within budget, quick move-in

### Secondary Persona: Family Seeking Rental
- **Goals**: Find house with multiple bedrooms, safe neighborhood, schools nearby
- **Pain Points**: Need to see properties on map, compare neighborhoods, coordinate viewing times
- **Technical Proficiency**: Medium
- **Time Availability**: Weekends primarily
- **Key Motivations**: Safety, space, amenities, school proximity

### Tertiary Persona: Property Owner/Landlord
- **Goals**: List properties, find qualified tenants, manage inquiries
- **Pain Points**: Need to showcase properties effectively, qualify leads, manage multiple listings
- **Technical Proficiency**: Medium to High
- **Time Availability**: Business hours
- **Key Motivations**: Quick tenant placement, qualified leads, property visibility

## Journey Stages

### Stage 1: Initial Discovery
**User State**: Browsing without specific criteria
**Touchpoints**: 
- Integrated navbar search
- Split-view property display (70/30)
- Interactive map exploration
- Quick filter dropdowns

**Emotional State**: Curious, exploratory
**Success Metrics**: 
- Engagement rate with featured content
- Search initiation rate
- Time to first meaningful interaction

### Stage 2: Search Refinement
**User State**: Actively filtering and refining results
**Touchpoints**:
- Horizontal filter bar dropdowns
- Split-view real-time updates
- Map-based area selection
- Advanced filters modal
- View toggle (List/Split/Map)

**Emotional State**: Focused, analytical
**Success Metrics**:
- Filter usage rate
- Results relevance score
- Save search conversion

### Stage 3: Property Evaluation
**User State**: Comparing specific properties
**Touchpoints**:
- Property cards (clickable for details)
- Property detail modal
- Photo gallery in modal
- Comparison tool
- Favorite button

**Emotional State**: Evaluative, decisive
**Success Metrics**:
- Modal open rate
- Gallery interaction rate
- Time spent in modal
- Comparison tool usage
- Favorite rate

### Stage 4: Deep Dive
**User State**: Examining property details in modal
**Touchpoints**:
- Full photo gallery in modal
- Virtual tour (if available)
- Complete property description
- Amenities list
- Location mini-map
- Neighborhood info

**Emotional State**: Interested, scrutinizing
**Success Metrics**:
- Modal dwell time
- Gallery navigation depth
- Description expansion rate
- Map interaction in modal

### Stage 5: Action Taking
**User State**: Ready to engage after viewing full details
**Touchpoints**:
- WhatsApp contact button (in modal only)
- Save property from modal
- Share modal link
- Schedule viewing
- Close modal to continue browsing

**Emotional State**: Informed, action-oriented
**Success Metrics**:
- Contact rate from modal
- Modal-to-contact conversion
- Properties viewed before contact
- Lead quality score

## Entry Points

### Primary Entry: Direct Search Page
**Trigger**: Direct site visit or navigation
**Flow**:
1. Land on property search page
2. See split-view with properties and map
3. Use navbar search or filters
4. View real-time filtered results
5. Explore properties visually on map

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
**Screen**: Split-View Search Results (70/30)
**User Actions**:
- Toggle between List/Split/Map views
- Apply filters via horizontal bar:
  - Precio (dropdown with slider)
  - Habitaciones (multi-select)
  - Tipo de propiedad (checkboxes)
  - Más filtros (modal)
- Sort results:
  - Más recientes
  - Precio (menor a mayor/mayor a menor)
  - Más relevantes
- Interact with map:
  - Pan to explore areas
  - Zoom for detail
  - Click clusters
  - Hover for property preview

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

### Step 3: Property Card Interaction
**Screen**: Property Cards in Split View
**User Actions**:
- Hover for visual feedback
- Click anywhere on card to open modal
- View basic info on card (price, location, specs)
- No contact button on cards

**System Response**:
- Card hover animation
- Click triggers modal opening
- Preload property details
- Track interaction for analytics

### Step 4: Property Details Modal
**Screen**: Full-Screen Property Modal
**User Actions**:
- Browse complete photo gallery
- Navigate thumbnails
- Read full description
- Check all specifications
- View amenities list
- Interact with location map
- Scroll for more details
- Click WhatsApp contact button
- Close modal to continue browsing

**System Response**:
- Smooth modal animation
- Gallery image preloading
- Responsive layout adjustment
- WhatsApp deep link preparation
- Maintain scroll position on close

### Step 5: Contact Initiation
**Screen**: WhatsApp Contact from Modal
**User Actions**:
- Click WhatsApp button in modal
- Auto-generated Spanish message
- Direct to WhatsApp with property details
- Return to modal or browse

**System Response**:
- Generate contextual message
- Include property address and price
- Open WhatsApp in new tab
- Track conversion event
- Maintain modal state

## Alternative Paths

### Split-View Exploration
**For**: Visual comparison users
**Flow**:
1. Default split-view (70/30)
2. Browse cards while seeing locations
3. Hover card → map pin highlights
4. Click card → open detail modal
5. View full details in modal
6. Contact via WhatsApp from modal
7. Close modal to continue browsing

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
- Show "No se encontraron propiedades" message
- Suggest relaxing filters in Spanish
- Expand map search radius automatically
- Show properties just outside criteria
- Clear filters button prominent

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
- Filter usage rate: >70%
- Split-view usage: >80%
- Map interaction rate: >60%
- Property view depth: >5 per session
- Card hover-to-click: >40%

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
- Property cards fully navigable with ARIA labels
- Spanish and English descriptions
- Map data available in list format
- Filter states announced in Spanish
- Split-view panels independently navigable

### Keyboard Navigation
- Full keyboard support for split-view
- Tab between panels (cards/map)
- Arrow keys for map navigation
- Enter to select property
- Escape to close modals
- Shortcuts: M (map), L (list), S (split)

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