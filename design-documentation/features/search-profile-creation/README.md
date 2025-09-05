# Search Profile Creation Feature
## User Journey & Design Specifications

---

## Overview

The Search Profile Creation is HEUREKKA's core differentiator - a reusable tenant profile that eliminates repetitive information sharing. This feature activates when users attempt to contact a property, converting browsers into qualified leads through a streamlined 2-step process.

## User Experience Goals

### Primary Objectives
1. **Reduce Friction**: Complete profile in <2 minutes
2. **Build Trust**: Clear value proposition and data usage
3. **Maximize Completion**: Progressive disclosure prevents overwhelm
4. **Enable Reuse**: One profile works across all properties

### Success Metrics
- **Completion Rate**: >75% of started profiles
- **Time to Complete**: <120 seconds average
- **Field Error Rate**: <5% validation errors
- **Profile Reuse**: >3 properties contacted per profile

---

## User Journey

### Entry Points
1. **Property Card**: "Contact" button
2. **Property Detail**: "WhatsApp Contact" CTA
3. **Landlord Listing**: "I'm Interested" action
4. **Homepage**: "Create Your Profile" hero CTA

### Flow Diagram
```
User clicks "Contact"
    ↓
[Not Logged In?] → Authentication Modal (Step 1)
    ↓
[Profile Incomplete?] → Profile Form (Step 2)
    ↓
Generate WhatsApp Message
    ↓
Open WhatsApp with Pre-filled Message
    ↓
Profile Saved for Reuse
```

---

## Screen Specifications

## Modal: Authentication (Step 1)

### Layout Structure

#### Mobile (Full Screen)
```
┌─────────────────────────┐
│ ← Back          Step 1/2 │ Header
├─────────────────────────┤
│                         │
│    Create Your Profile  │ Title
│    to Contact Landlords │
│                         │
│ Save time by creating   │ Value prop
│ one profile that works  │
│ for all properties      │
│                         │
│ ──────────────────────  │
│                         │
│ [G] Continue with Google│ OAuth
│                         │
│ ─────── OR ──────       │ Divider
│                         │
│ Email                   │ Input
│ [email@example.com    ] │
│                         │
│ [Continue with Email →] │ Primary CTA
│                         │
│ By continuing, you agree│ Legal
│ to our Terms & Privacy  │
│                         │
└─────────────────────────┘
```

#### Desktop (Modal: 480px wide)
```
┌─────────────────────────────┐
│ Create Profile        [X]   │ Modal header
├─────────────────────────────┤
│                             │
│ Create Your Tenant Profile  │
│                             │
│ 🚀 Save hours of repetitive │ Benefits
│    form filling             │
│ ✓ One profile for all props │
│ 🔒 Your data stays secure   │
│                             │
│ ──────────────────────────  │
│                             │
│ [G] Continue with Google    │
│                             │
│ ─────── OR ──────           │
│                             │
│ Email Address               │
│ [________________________]  │
│                             │
│ [Continue →]                │
│                             │
│ Already have an account?    │
│ Sign in                     │
│                             │
└─────────────────────────────┘
```

### Visual Specifications

#### Container
- **Mobile**: Full screen with slide-up animation
- **Desktop**: Centered modal with backdrop
- **Background**: `#FFFFFF`
- **Backdrop**: `rgba(0, 0, 0, 0.5)`

#### Header
- **Height**: `56px`
- **Border Bottom**: `1px solid #E5E7EB`
- **Back Button**: `24px` arrow icon
- **Step Indicator**: `14px, 500, #6B7280`

#### Title Section
- **Title**: `24px/32px, 700, #111827`
- **Subtitle**: `16px/24px, 400, #6B7280`
- **Margin**: `24px 0`

#### Value Proposition
- **Background**: `#F9FAFB`
- **Border Radius**: `8px`
- **Padding**: `16px`
- **Icon**: `20px` with `8px` right margin
- **Text**: `14px/20px, 400, #374151`

#### OAuth Button
- **Height**: `48px`
- **Background**: `#FFFFFF`
- **Border**: `1px solid #D1D5DB`
- **Icon**: Google logo `20px`
- **Text**: `16px, 500, #374151`
- **Hover**: Background `#F9FAFB`

#### Email Input
- **Height**: `48px`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `8px`
- **Font**: `16px, 400`
- **Focus**: Border `#2563EB`

#### Continue Button
- **Height**: `48px`
- **Background**: `#2563EB`
- **Text**: `16px, 600, #FFFFFF`
- **Full width on mobile**
- **Loading state with spinner**

### Interaction States

#### Field Validation
- **Email Format**: Real-time validation on blur
- **Error Message**: Below field in red
- **Success Indicator**: Green checkmark in field

#### Loading States
```
Button: "Continue →"
    ↓ (on submit)
Button: "⟳ Verifying..."
    ↓ (on success)
Transition to Step 2
```

---

## Modal: Profile Details (Step 2)

### Layout Structure

#### Mobile (Full Screen)
```
┌─────────────────────────┐
│ ← Back          Step 2/2 │
├─────────────────────────┤
│                         │
│ Complete Your Profile   │ Title
│                         │
│ 📍 Property: Los Próceres│ Context
│     2BR Apartment       │
│                         │
├─────────────────────────┤
│ Your Information        │ Section
│                         │
│ Full Name *             │
│ [María Rodriguez      ] │
│                         │
│ Phone Number *          │
│ [+504 ][9999-9999    ] │
│                         │
├─────────────────────────┤
│ Search Preferences      │ Section
│                         │
│ Monthly Budget *        │
│ [L.10,000] - [L.15,000]│ Range
│                         │
│ Move-in Date *          │
│ [📅 November 1, 2024 ] │ Date picker
│                         │
│ Preferred Areas         │
│ [+ Add neighborhood   ] │ Tag input
│ • Lomas del Guijarro  X│
│ • Los Próceres        X│
│                         │
│ Property Type           │
│ ☑ Apartment            │ Checkboxes
│ ☑ House                │
│ ☐ Studio               │
│                         │
├─────────────────────────┤
│ [Create Profile →]      │ Primary CTA
│                         │
└─────────────────────────┘
```

### Visual Specifications

#### Sections
- **Background**: `#FFFFFF`
- **Section Divider**: `#F9FAFB` background
- **Section Padding**: `20px 16px`
- **Section Title**: `16px, 600, #111827`

#### Form Fields

##### Text Inputs
- **Height**: `48px`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `8px`
- **Label**: `14px, 500, #374151`
- **Required Asterisk**: `#EF4444`
- **Helper Text**: `12px, 400, #6B7280`

##### Phone Number
- **Country Code**: Locked to `+504`
- **Format**: Auto-format as `9999-9999`
- **Validation**: Honduras phone pattern

##### Budget Range
- **Min/Max Inputs**: Side by side
- **Currency Symbol**: `L.` prefix
- **Thousands Separator**: Auto-format
- **Validation**: Min < Max

##### Date Picker
- **Min Date**: Today
- **Max Date**: 6 months future
- **Format**: "Month DD, YYYY"
- **Calendar**: Native on mobile

##### Area Tags
- **Input**: Autocomplete from neighborhoods
- **Tags**: Chips with remove button
- **Max Tags**: 5
- **Chip Style**: `#EFF6FF` background

##### Property Type
- **Layout**: Vertical stack
- **Checkbox Size**: `20×20px`
- **Label Spacing**: `12px` from checkbox
- **At least one required**

### Form Validation

#### Real-time Validation
- Phone number format
- Budget range logic
- Date selection limits

#### On Submit Validation
```javascript
errors = {
  name: "Name is required",
  phone: "Please enter a valid phone number",
  budget: "Maximum budget must be higher than minimum",
  moveDate: "Please select a move-in date",
  areas: "Please select at least one area"
}
```

#### Error Display
- **Field Border**: `#EF4444`
- **Error Text**: `12px, 400, #EF4444`
- **Icon**: Error icon in field
- **Focus**: Auto-scroll to first error

### Success State

#### After Profile Creation
```
┌─────────────────────────┐
│                         │
│     ✓                   │ Success icon
│                         │
│ Profile Created!        │
│                         │
│ Opening WhatsApp...     │
│                         │
│ [⟳⟳⟳⟳⟳⟳⟳⟳⟳⟳⟳⟳⟳⟳]       │ Progress
│                         │
└─────────────────────────┘
```

---

## WhatsApp Message Generation

### Message Template
```
Hola! 👋 

Vi su propiedad en HEUREKKA y estoy interesado/a.

🏠 *Propiedad*: Apartamento 2 habitaciones en Los Próceres

*Mi perfil:*
👤 María Rodriguez
💰 Presupuesto: L.10,000 - L.15,000/mes
📅 Fecha de mudanza: 1 de Noviembre 2024
📍 Zonas preferidas: Lomas del Guijarro, Los Próceres
🏘️ Tipo: Apartamento, Casa

¿Podríamos coordinar una visita?

_Mensaje enviado desde HEUREKKA.com_
```

### URL Structure
```
https://wa.me/504XXXXXXXX?text={encoded_message}
```

---

## Returning User Experience

### Profile Reuse Flow
```
User clicks "Contact" on new property
    ↓
[Logged In] → Check existing profile
    ↓
[Profile Complete] → Show preview modal
    ↓
"Use this profile?" → [Yes] / [Edit]
    ↓
Generate WhatsApp message with existing data
```

### Profile Preview Modal
```
┌─────────────────────────┐
│ Your Saved Profile      │
├─────────────────────────┤
│ María Rodriguez         │
│ L.10,000-15,000/mes     │
│ Move: Nov 1, 2024       │
│ Areas: Lomas, Próceres  │
├─────────────────────────┤
│ [Use This] [Edit]       │
└─────────────────────────┘
```

---

## Responsive Behavior

### Mobile Optimizations
- Full-screen modals with native feel
- Large touch targets (48px minimum)
- Native date pickers
- Autofocus on first field
- Keyboard avoidance for bottom CTAs

### Desktop Enhancements
- Modal with optimal 480px width
- Rich date picker calendar
- Inline validation messages
- Hover states on all interactive elements
- Keyboard shortcuts (Tab, Enter)

---

## Accessibility Features

### Screen Reader Support
- Form sections announced
- Required fields indicated
- Error messages associated with fields
- Success confirmation announced

### Keyboard Navigation
- Tab through all fields
- Enter submits form
- Escape closes modal
- Space toggles checkboxes

### Visual Accessibility
- High contrast mode support
- Focus indicators on all inputs
- Error states not color-dependent
- Clear label associations

---

## Performance Optimizations

### Progressive Enhancement
1. Basic HTML form fallback
2. Client-side validation enhancement
3. Autosave draft to localStorage
4. Offline capability with sync

### Loading Performance
- Lazy load Google OAuth SDK
- Debounced input validation
- Optimistic UI updates
- Skeleton screens during fetch

---

## Implementation Notes

### State Management
```typescript
interface ProfileState {
  step: 1 | 2;
  email: string;
  profile: {
    name: string;
    phone: string;
    budgetMin: number;
    budgetMax: number;
    moveDate: Date;
    areas: string[];
    propertyTypes: string[];
  };
  validation: {
    [key: string]: string;
  };
  isLoading: boolean;
}
```

### API Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/profile/create
GET /api/profile/current
PUT /api/profile/update
```

### Analytics Events
- `profile_creation_started`
- `profile_step_completed`
- `profile_field_error`
- `profile_created`
- `whatsapp_message_sent`

---

## Success Criteria

### Metrics to Track
- Step 1 → Step 2 conversion: >85%
- Profile completion rate: >75%
- Average time to complete: <2 minutes
- Profile reuse rate: >80%
- WhatsApp message send rate: >90%

### A/B Testing Opportunities
- Single vs two-step flow
- OAuth-first vs email-first
- Required vs optional fields
- Message template variations

---

*Feature Version: 1.0.0 | Last Updated: September 4, 2025*