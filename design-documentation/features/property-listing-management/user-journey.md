---
title: Property Listing Management - User Journey
description: User journey mapping for property listing creation and management
feature: property-listing-management
last-updated: 2025-09-29
version: 2.0.0
related-files:
  - ./README.md
  - ./screen-states.md
  - ./implementation.md
  - ../user-authentication/landlord-authentication.md
  - ../landlord-dashboard/README.md
status: approved
---

# Property Listing Management - User Journey

## Overview
Complete user journey for authenticated landlords creating and managing property listings on the platform. This flow begins after successful landlord authentication and profile completion.

## User Personas

### First-Time Landlord
- **Goals**: List property quickly, attract quality tenants
- **Pain Points**: Unfamiliar with process, photo requirements unclear
- **Tech Level**: Low-medium, needs guidance
- **Success Criteria**: Published listing in <15 minutes

### Experienced Property Owner
- **Goals**: Efficient multi-property management
- **Pain Points**: Repetitive data entry, maintaining multiple listings
- **Tech Level**: Medium-high, wants shortcuts
- **Success Criteria**: Bulk operations, template reuse

### Real Estate Professional
- **Goals**: Professional presentation, high volume management
- **Pain Points**: Client approval workflows, brand consistency
- **Tech Level**: High, uses multiple tools
- **Success Criteria**: API access, white-label options

## Prerequisites

### Authentication Requirements
- **Completed Landlord Authentication**: User must have successfully completed the landlord authentication flow (see `/user-authentication/landlord-authentication.md`)
- **Verified Landlord Profile**: Basic landlord information must be complete
- **Active Session**: Valid authentication token with landlord role

### Entry Points
1. **From Landlord Dashboard**: "Publicar Nueva Propiedad" button
2. **From Landlord Authentication Success**: Direct redirect after profile completion
3. **From Navigation Menu**: "Mis Propiedades" → "Agregar Nueva"
4. **From Empty State**: First-time landlords see prominent CTA

## Core User Flow

### Stage 1: Listing Initiation
1. Landlord clicks "Publicar Nueva Propiedad" from dashboard
2. System verifies landlord authentication status
3. Choose property type (Apartamento/Casa/Estudio/Habitación)
4. Enter property address with autocomplete
5. Verify location on interactive map
6. Begin property details entry with auto-save enabled

### Stage 2: Property Information
1. Specify bedrooms/bathrooms
2. Enter square meters/footage
3. Select amenities checklist
4. Add special features
5. Note any restrictions
6. Save progress (auto-save active)

### Stage 3: Media Upload
1. Access camera/gallery
2. Capture/select photos (min 3)
3. Set primary photo
4. Order photos by importance
5. Add captions (optional)
6. Upload and process

### Stage 4: Pricing & Availability
1. Set monthly rent amount
2. Specify deposit requirements
3. Choose availability date
4. Set minimum lease term
5. Add included utilities
6. Review pricing competitiveness

### Stage 5: Description & Requirements
1. Write property description
   - Use template or write custom
   - Highlight key features
   - Mention nearby amenities
2. Set tenant requirements
   - Income verification
   - References needed
   - Pet policy
   - Maximum occupants

### Stage 6: Review & Publish
1. Preview listing appearance
2. Check quality score
3. Review all information
4. Make final edits
5. Agree to terms
6. Publish listing

## Alternative Paths

### Quick Listing (Returning User)
1. Select "Create similar listing"
2. Choose template from previous
3. Update address and photos
4. Adjust price if needed
5. Quick review
6. Publish

### Bulk Upload (Professional)
1. Access bulk upload tool
2. Download CSV template
3. Fill property data
4. Upload spreadsheet
5. Bulk photo assignment
6. Review and publish all

### Mobile Photo-First Flow
1. Open camera directly
2. Capture all photos first
3. Save to draft
4. Complete details later
5. Desktop finishing option

## Key Decision Points

### Photo Quality Check
**Scenario**: Uploaded photo is low quality
**Options**:
- Retake photo
- Continue anyway
- Get tips for better photos
- Schedule professional photographer

### Pricing Guidance
**Scenario**: Price outside market range
**Options**:
- Keep current price
- Adjust to suggested range
- View comparable listings
- Add value justification

### Incomplete Listing
**Scenario**: Missing required information
**Options**:
- Save as draft
- Complete now
- Set reminder
- Get help

## Edge Cases


### Photo Upload Failure
**Trigger**: Network issue during upload
**Handling**:
- Retry automatically
- Queue for later
- Save locally
- Show progress status

### Session Timeout
**Trigger**: Inactivity during creation
**Handling**:
- Auto-save all progress
- Show timeout warning
- Offer to extend session
- Easy resume option

## Success Patterns

### High-Performance Listings
- 8-12 high-quality photos
- Detailed description (200+ words)
- Complete amenity list
- Competitive pricing
- Quick response commitment

### Conversion Optimization
- Professional photos
- Virtual tour option
- Detailed neighborhood info
- Flexible viewing times
- Clear requirements


## Pain Points & Solutions

### "Too many steps"
**Solution**: Progressive disclosure, save and return, quick mode

### "Photo upload is slow"
**Solution**: Background upload, queue system, compression

### "Don't know what to write"
**Solution**: Templates and examples

### "Pricing uncertainty"
**Solution**: Market analysis, comparables, pricing tool

## Integration with Authentication System

### From Landlord Authentication
When a user completes landlord authentication and chooses to list their first property:

1. **Authentication Success**: User completes landlord profile
2. **Immediate Redirect**: System navigates to property listing wizard
3. **Pre-filled Information**: Owner details auto-populated from landlord profile
4. **Guided Experience**: First-time tooltips and help bubbles active
5. **Success Celebration**: Special confirmation after first listing

### Profile Data Carryover
Information from landlord authentication that pre-fills listing forms:
- Owner name and contact details
- Preferred communication method (WhatsApp/Phone/Email)
- Property management experience level
- Response time commitment

### Dashboard Integration
After publishing a listing:
1. Redirect to landlord dashboard
2. Show new listing in "Mis Propiedades" section
3. Display performance metrics (views, contacts)
4. Provide management tools (edit, pause, boost)
5. Offer tips for improving listing performance

## Related Documentation
- [Landlord Authentication Flow](../user-authentication/landlord-authentication.md)
- [Landlord Dashboard](../landlord-dashboard/README.md)
- [User Authentication System](../user-authentication/README.md)
- [Screen States](./screen-states.md)
- [Implementation Guide](./implementation.md)
- [Interactions](./interactions.md)