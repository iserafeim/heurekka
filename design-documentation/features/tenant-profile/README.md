# Tenant Profile Management
## Post-Authentication Profile & Preferences System

---

## Overview

The Tenant Profile Management system is HEUREKKA's core differentiator - a reusable tenant profile that eliminates repetitive information sharing when contacting landlords. This feature manages the tenant's search preferences, saved properties, and profile data after successful authentication through the user-authentication system.

## Prerequisites

- User must be authenticated as a tenant (see `/user-authentication/tenant-authentication.md`)
- Authentication state managed by the user-authentication feature
- User intent determined to be "searching for property" during authentication

## User Experience Goals

### Primary Objectives
1. **Streamline Property Contact**: One-click contact with pre-filled information
2. **Personalized Experience**: Dashboard tailored to search preferences
3. **Efficient Management**: Easy access to saved searches and favorites
4. **Progressive Enhancement**: Smooth path to becoming a landlord

### Success Metrics
- **Profile Completion Rate**: >90% of authenticated tenants
- **Profile Reuse**: >5 properties contacted per profile
- **Dashboard Engagement**: >3 visits per week
- **Saved Search Utilization**: >60% of users create saved searches

---

## Integration Points

### Entry Points (Post-Authentication)
1. **After Tenant Authentication**: Redirect from successful login/signup
2. **Property Contact Flow**: When clicking "Contactar" on any property
3. **Navigation Menu**: "Mi Perfil" option for authenticated tenants
4. **Tenant Dashboard**: Direct access from homepage for logged-in users

### Dependencies
- **Authentication System**: `/user-authentication/` for login state
- **Property Discovery**: Integration with property search and filtering
- **WhatsApp Integration**: Message generation with profile data
- **Landlord Dashboard**: Upgrade path for tenants becoming landlords

---

## Core Features

## Feature: Tenant Dashboard

The central hub for authenticated tenants to manage their property search experience.

### Components

#### 1. Profile Management Section
- **Personal Information**: Name, phone, email
- **Search Preferences**: Budget, areas, property types
- **Move-in Timeline**: Preferred dates
- **Quick Edit**: Inline editing with auto-save

#### 2. Saved Searches
- **Active Filters**: Saved search criteria combinations
- **Alert Settings**: Notification preferences for new matches
- **Quick Access**: One-click to run saved searches
- **Management**: Edit, delete, or pause searches

#### 3. Favorite Properties
- **Visual Grid**: Property cards with key information
- **Status Tracking**: Contacted/not contacted indicators
- **Quick Actions**: Contact, remove, share
- **Comparison Tool**: Side-by-side property comparison

#### 4. Conversation History
- **Landlord Contacts**: List of contacted properties
- **Message History**: WhatsApp conversation references
- **Follow-up Reminders**: Scheduled viewing reminders
- **Status Updates**: Property availability tracking

#### 5. Upgrade Path
- **Landlord Benefits**: Clear value proposition
- **CTA Button**: "Publicar mi Propiedad"
- **Seamless Transition**: Profile data carries over

---

## Feature: Profile Completion Flow

### When Profile is Incomplete

For tenants who authenticated but haven't completed their profile:

#### Profile Completion Modal
```
┌─────────────────────────┐
│ Completa tu Perfil     │
├─────────────────────────┤
│                         │
│ 📍 Propiedad: Los Próceres│
│     Apartamento 2 Hab   │
│                         │
├─────────────────────────┤
│ Tu Información          │
│                         │
│ Nombre Completo *       │
│ [_________________]     │
│                         │
│ Teléfono *              │
│ [+504][__________]      │
│                         │
├─────────────────────────┤
│ Preferencias de Búsqueda│
│                         │
│ Presupuesto Mensual *   │
│ [L.____] - [L.____]     │
│                         │
│ Fecha de Mudanza *      │
│ [📅 Seleccionar]        │
│                         │
│ Zonas Preferidas        │
│ [+ Agregar zona]        │
│                         │
│ Tipo de Propiedad       │
│ ☑ Apartamento           │
│ ☑ Casa                  │
│ ☐ Estudio               │
│                         │
├─────────────────────────┤
│ [Completar Perfil →]    │
│                         │
└─────────────────────────┘
```

### Form Specifications

#### Personal Information
- **Name**: Required, 2-50 characters
- **Phone**: Honduras format (+504 XXXX-XXXX)
- **Auto-fill**: From authentication data when available

#### Search Preferences
- **Budget Range**: L.1,000 - L.100,000
- **Move Date**: Today to 6 months future
- **Areas**: Autocomplete from neighborhood database
- **Property Types**: Multiple selection allowed

#### Validation Rules
- All required fields must be completed
- Phone number must be valid Honduras format
- Budget max must exceed minimum
- At least one property type selected

---

## Feature: WhatsApp Message Generation

### Automatic Message Composition

When a tenant with a complete profile contacts a property:

#### Message Template
```
¡Hola! 👋

Vi su propiedad en HEUREKKA y estoy interesado/a.

🏠 *Propiedad*: [Property Title]
📍 *Ubicación*: [Property Location]
💰 *Precio*: [Property Price]

*Mi perfil:*
👤 [Tenant Name]
📱 [Tenant Phone]
💰 Presupuesto: [Budget Range]/mes
📅 Fecha de mudanza: [Move Date]
📍 Zonas preferidas: [Preferred Areas]
🏘️ Buscando: [Property Types]

¿Podríamos coordinar una visita?

_Mensaje enviado desde HEUREKKA.com_
```

### Profile Reuse Flow

For returning users contacting a new property:

```
Usuario hace clic en "Contactar"
    ↓
[Autenticado + Perfil Completo]
    ↓
Mostrar vista previa del mensaje
    ↓
[Enviar] / [Editar Perfil]
    ↓
Abrir WhatsApp con mensaje
```

#### Profile Preview Modal
```
┌─────────────────────────┐
│ Tu Perfil Guardado      │
├─────────────────────────┤
│ María Rodríguez         │
│ +504 9999-9999          │
│ L.10,000-15,000/mes     │
│ Mudanza: Nov 1, 2024    │
│ Zonas: Lomas, Próceres  │
├─────────────────────────┤
│ [Usar Este] [Editar]    │
└─────────────────────────┘
```

---

## Visual Design System

### Color Palette (Tenant-Specific)
- **Primary Blue**: `#2563EB` - CTAs and active states
- **Success Green**: `#10B981` - Saved/favorited indicators
- **Info Blue**: `#3B82F6` - Information badges
- **Background**: `#F9FAFB` - Dashboard sections

### Typography
- **Section Headers**: `18px, 600, #111827`
- **Card Titles**: `16px, 500, #374151`
- **Body Text**: `14px, 400, #6B7280`
- **Labels**: `12px, 500, #6B7280`

### Component Specifications

#### Dashboard Cards
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `12px`
- **Padding**: `20px`
- **Shadow**: `0 1px 3px rgba(0,0,0,0.1)`

#### Form Fields
- **Height**: `48px`
- **Border**: `1px solid #D1D5DB`
- **Border Radius**: `8px`
- **Focus Border**: `#2563EB`
- **Error Border**: `#EF4444`

#### Action Buttons
- **Primary**: `#2563EB` background, white text
- **Secondary**: White background, `#2563EB` text
- **Height**: `44px`
- **Border Radius**: `8px`
- **Font Weight**: `600`

---

## Responsive Design

### Mobile (320-767px)
- Full-width dashboard cards
- Stacked layout for all sections
- Bottom navigation for quick access
- Swipeable property cards

### Tablet (768-1023px)
- 2-column grid for dashboard sections
- Side-by-side property comparisons
- Persistent navigation sidebar

### Desktop (1024px+)
- 3-column layout for dashboard
- Expanded property cards with more details
- Inline editing for profile fields
- Advanced filtering options visible

---

## State Management

### Profile State Structure
```typescript
interface TenantProfile {
  id: string;
  userId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
  };
  searchPreferences: {
    budgetMin: number;
    budgetMax: number;
    moveDate: Date;
    preferredAreas: string[];
    propertyTypes: string[];
  };
  savedSearches: SavedSearch[];
  favoriteProperties: Property[];
  contactHistory: ContactRecord[];
  createdAt: Date;
  updatedAt: Date;
}
```

### API Integration
```
GET /api/tenant/profile
PUT /api/tenant/profile
GET /api/tenant/saved-searches
POST /api/tenant/saved-searches
GET /api/tenant/favorites
POST /api/tenant/favorites/{propertyId}
DELETE /api/tenant/favorites/{propertyId}
GET /api/tenant/contact-history
```

---

## Accessibility Requirements

### WCAG AA Compliance
- All form fields properly labeled
- Error messages associated with inputs
- Keyboard navigation throughout dashboard
- Screen reader announcements for state changes
- Focus management in modals

### Mobile Accessibility
- Touch targets minimum 44×44px
- Adequate spacing between interactive elements
- Clear visual feedback for all actions
- High contrast mode support

---

## Performance Targets

### Load Times
- Dashboard initial load: <2 seconds
- Profile update: <500ms
- Property favorite toggle: <200ms
- Search execution: <1 second

### Optimization Strategies
- Lazy load property images
- Cache profile data locally
- Debounce search inputs
- Paginate property lists
- Progressive image loading

---

## Success Metrics

### Key Performance Indicators
- **Profile Completion**: >90% within first session
- **Dashboard Return Rate**: >60% weekly
- **Saved Search Creation**: >40% of users
- **Contact Conversion**: >30% of viewed properties
- **Upgrade to Landlord**: >5% of tenant base

### Analytics Events
- `tenant_profile_completed`
- `tenant_dashboard_viewed`
- `saved_search_created`
- `property_favorited`
- `property_contacted`
- `landlord_upgrade_clicked`

---

## Integration with Landlord Flow

### Upgrade Path
When a tenant decides to list a property:

1. Click "Publicar mi Propiedad" from dashboard
2. Redirect to landlord authentication flow
3. Existing profile data pre-fills landlord information
4. Maintain access to both tenant and landlord dashboards
5. Unified account with role-based access

See `/user-authentication/landlord-authentication.md` for detailed flow.

---

## Related Documentation

- [User Authentication System](../user-authentication/README.md)
- [Tenant Authentication Flow](../user-authentication/tenant-authentication.md)
- [Property Discovery](../property-discovery/README.md)
- [WhatsApp Integration](../whatsapp-integration/README.md)
- [Property Listing Management](../property-listing-management/README.md)

---

*Feature Version: 2.0.0 | Last Updated: September 29, 2025*
*Major revision: Separated authentication from profile management*