# Tenant Dashboard
## Central Hub for Property Search Management

---

## Overview

The Tenant Dashboard is the personalized command center for authenticated tenants, providing comprehensive tools to manage their property search journey. This mobile-first interface consolidates saved searches, favorite properties, conversation history, and profile management into an intuitive, efficient experience.

## Prerequisites

- User authenticated as tenant via `/user-authentication/tenant-authentication.md`
- Complete tenant profile with search preferences
- Active session with valid authentication token

---

## Dashboard Architecture

### Information Hierarchy

```
Dashboard Home
├── Quick Stats Bar
│   ├── Active Searches
│   ├── Favorite Properties
│   └── Recent Contacts
├── Primary Actions
│   ├── Search Properties
│   └── Update Preferences
├── Content Sections
│   ├── Saved Searches
│   ├── Favorite Properties
│   ├── Recent Conversations
│   └── Profile Management
└── Upgrade Path
    └── Become a Landlord CTA
```

---

## Screen Layouts

### Mobile Layout (320-767px)

```
┌─────────────────────────┐
│ ☰ HEUREKKA    👤 María  │ Header
├─────────────────────────┤
│                         │
│ ¡Hola, María! 👋        │ Greeting
│                         │
│ ┌─────┬─────┬─────┐    │ Quick Stats
│ │  3  │ 12  │  5  │    │
│ │Búsq.│Favs.│Conv.│    │
│ └─────┴─────┴─────┘    │
│                         │
│ [🔍 Buscar Propiedades] │ Primary CTA
│                         │
├─── Búsquedas Guardadas ─┤
│ ┌─────────────────────┐ │
│ │ Apartamentos Lomas  │ │
│ │ L.8,000-12,000     │ │
│ │ 3 nuevas • Editar   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Casas Los Próceres  │ │
│ │ L.15,000-20,000    │ │
│ │ 1 nueva • Editar    │ │
│ └─────────────────────┘ │
│ [+ Nueva Búsqueda]      │
│                         │
├─── Propiedades Favoritas┤
│ ┌─────────────────────┐ │
│ │ [IMG]               │ │
│ │ Apto. 2 hab - Lomas │ │
│ │ L.10,500/mes       │ │
│ │ ♥ ✉ Contactado     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ [IMG]               │ │
│ │ Casa 3 hab - Centro │ │
│ │ L.18,000/mes       │ │
│ │ ♥ [Contactar]      │ │
│ └─────────────────────┘ │
│ [Ver Todas (12)]       │
│                         │
├─── Conversaciones ──────┤
│ ┌─────────────────────┐ │
│ │ Juan Pérez          │ │
│ │ Apto. Los Próceres  │ │
│ │ Última: hace 2 días │ │
│ │ [WhatsApp]         │ │
│ └─────────────────────┘ │
│ [Ver Historial]        │
│                         │
├─── Mi Perfil ───────────┤
│ Presupuesto:           │
│ L.10,000 - L.15,000    │
│                        │
│ Mudanza: Nov 2024      │
│ Zonas: 3 seleccionadas │
│                        │
│ [Editar Preferencias]  │
│                        │
├─────────────────────────┤
│ ¿Tienes una propiedad? │ Upgrade
│ Publica gratis y       │
│ encuentra inquilinos   │
│                        │
│ [Publicar Propiedad →] │
│                        │
└─────────────────────────┘
```

### Tablet Layout (768-1023px)

```
┌──────────────────────────────────────┐
│ ☰ HEUREKKA           🔍  👤 María    │
├──────────────────────────────────────┤
│                                      │
│ Dashboard de María                   │
│ ┌──────────┬──────────┬──────────┐  │
│ │ 3 Búsq.  │ 12 Favs. │ 5 Conv.  │  │
│ └──────────┴──────────┴──────────┘  │
│                                      │
│ ┌─────────────────┬─────────────────┐│
│ │ Búsquedas       │ Favoritos       ││
│ │ ┌─────────────┐ │ ┌──────┬──────┐││
│ │ │ Apto. Lomas │ │ │ [IMG]│ [IMG]│││
│ │ │ 3 nuevas    │ │ │ Apto │ Casa │││
│ │ └─────────────┘ │ │ L.10k│ L.18k│││
│ │ ┌─────────────┐ │ └──────┴──────┘││
│ │ │ Casas Centro│ │ ┌──────┬──────┐││
│ │ │ 1 nueva     │ │ │ [IMG]│ [IMG]│││
│ │ └─────────────┘ │ └──────┴──────┘││
│ │                 │                 ││
│ │ [+ Nueva]       │ [Ver Todas]     ││
│ └─────────────────┴─────────────────┘│
│                                      │
│ ┌─────────────────┬─────────────────┐│
│ │ Conversaciones  │ Mi Perfil       ││
│ │ • Juan Pérez    │ Presupuesto:    ││
│ │   Apto. Lomas   │ L.10-15k        ││
│ │   Hace 2 días   │                 ││
│ │ • Ana García    │ Mudanza:        ││
│ │   Casa Centro   │ Noviembre 2024  ││
│ │   Hace 5 días   │                 ││
│ │                 │ [Editar]        ││
│ └─────────────────┴─────────────────┘│
│                                      │
│ [━━━━━ Publicar mi Propiedad ━━━━━] │
└──────────────────────────────────────┘
```

### Desktop Layout (1024px+)

```
┌────────────────────────────────────────────────────┐
│ HEUREKKA     Inicio  Buscar  Favoritos  👤 María  │
├────────────────────────────────────────────────────┤
│                                                    │
│ Dashboard de María          [🔍 Nueva Búsqueda]   │
│                                                    │
│ ┌──────────┬──────────┬──────────┬──────────────┐│
│ │ Búsquedas│ Favoritos│ Mensajes │ Perfil       ││
│ │ Activas  │          │          │              ││
│ │    3     │    12    │    5     │ 85% Completo││
│ └──────────┴──────────┴──────────┴──────────────┘│
│                                                    │
│ ┌───────────────────────────┬─────────────────────┐│
│ │ Búsquedas Guardadas       │ Propiedades Favoritas││
│ │                           │                     ││
│ │ ┌───────────────────────┐ │ ┌─────┬─────┬─────┐││
│ │ │ Apartamentos en Lomas │ │ │[IMG]│[IMG]│[IMG]│││
│ │ │ L.8,000 - L.12,000    │ │ │Apto │Casa │Studio││
│ │ │ 2-3 habitaciones      │ │ │L.10k│L.18k│L.8k │││
│ │ │ 🔔 3 nuevas coincid.  │ │ │ ♥ ✉ │ ♥   │ ♥   │││
│ │ │ [Ver] [Editar] [🗑]   │ │ └─────┴─────┴─────┘││
│ │ └───────────────────────┘ │ ┌─────┬─────┬─────┐││
│ │ ┌───────────────────────┐ │ │[IMG]│[IMG]│[IMG]│││
│ │ │ Casas en Los Próceres │ │ └─────┴─────┴─────┘││
│ │ │ L.15,000 - L.20,000   │ │                     ││
│ │ │ 3-4 habitaciones      │ │ [Ver Todas (12)]    ││
│ │ │ 🔔 1 nueva coincid.   │ │ [Comparar Selección]││
│ │ │ [Ver] [Editar] [🗑]   │ │                     ││
│ │ └───────────────────────┘ │                     ││
│ │                           │                     ││
│ │ [+ Crear Nueva Búsqueda] │                     ││
│ └───────────────────────────┴─────────────────────┘│
│                                                    │
│ ┌───────────────────────────┬─────────────────────┐│
│ │ Conversaciones Recientes  │ Mi Perfil           ││
│ │                           │                     ││
│ │ Juan Pérez - Apto. Lomas  │ María Rodríguez     ││
│ │ Última: hace 2 días       │ ✉ maria@email.com   ││
│ │ [WhatsApp] [Ver Propiedad]│ 📱 +504 9999-9999   ││
│ │                           │                     ││
│ │ Ana García - Casa Centro  │ Preferencias:       ││
│ │ Última: hace 5 días       │ • L.10,000-15,000   ││
│ │ [WhatsApp] [Ver Propiedad]│ • Mudanza: Nov 2024 ││
│ │                           │ • Zonas: 3 selec.   ││
│ │ [Ver Todo el Historial]   │                     ││
│ │                           │ [Editar Perfil]     ││
│ └───────────────────────────┴─────────────────────┘│
│                                                    │
│ ┌──────────────────────────────────────────────────┐│
│ │ 🏠 ¿Eres propietario? Publica tu propiedad      ││
│ │ [Comenzar →]                                     ││
│ └──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Quick Stats Bar

#### Visual Design
- **Container**: `#F9FAFB` background
- **Border Radius**: `12px`
- **Padding**: `16px`
- **Grid**: 3 equal columns on mobile, inline on desktop

#### Stat Cards
- **Number**: `24px, 700, #111827`
- **Label**: `12px, 500, #6B7280`
- **Divider**: `1px solid #E5E7EB`
- **Clickable**: Navigate to respective section

### Saved Searches Section

#### Search Card
```
┌──────────────────────┐
│ Apartamentos Lomas   │ Title
│ L.8,000 - L.12,000  │ Price range
│ 2-3 habitaciones    │ Details
│ ─────────────────── │
│ 🔔 3 nuevas         │ Notifications
│ [Ver] [Editar] [🗑] │ Actions
└──────────────────────┘
```

#### Specifications
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E7EB`
- **Border Radius**: `8px`
- **Padding**: `16px`
- **Shadow**: `0 1px 2px rgba(0,0,0,0.05)`

#### States
- **New Matches**: Red badge with count
- **No Matches**: Grayed out appearance
- **Active**: Blue border on hover/focus

#### Actions
- **View**: Execute search with saved filters
- **Edit**: Open filter modification modal
- **Delete**: Confirmation before removal
- **Pause/Resume**: Toggle search notifications

### Favorite Properties Grid

#### Property Card
```
┌────────────┐
│   [IMAGE]  │
│ Apto 2 hab │
│ Los Lomas  │
│ L.10,500   │
│ ♥ ✉ Nuevo │
└────────────┘
```

#### Card Specifications
- **Width**: Responsive (full on mobile, 3-col on desktop)
- **Image**: 16:9 ratio with lazy loading
- **Title**: `14px, 600, #111827`
- **Price**: `16px, 700, #2563EB`
- **Location**: `12px, 400, #6B7280`

#### Interaction States
- **Hover**: Elevate with shadow, show quick actions
- **Favorited**: Filled heart icon `#EF4444`
- **Contacted**: Envelope icon with checkmark
- **New**: Badge indicator for recent additions

#### Quick Actions
- **Remove Favorite**: One-click with confirmation
- **Contact**: Open WhatsApp message modal
- **View Details**: Navigate to property page
- **Compare**: Add to comparison tool (desktop)

### Conversation History

#### Conversation Item
```
┌─────────────────────────┐
│ [Avatar] Juan Pérez     │
│ Apartamento Los Próceres│
│ "Sí, está disponible..." │
│ Última: hace 2 días     │
│ [WhatsApp] [Propiedad]  │
└─────────────────────────┘
```

#### Specifications
- **Avatar**: 40px circle with initials
- **Name**: `14px, 600, #111827`
- **Property**: `12px, 400, #6B7280`
- **Preview**: `13px, 400, #374151` (truncated)
- **Timestamp**: `11px, 400, #9CA3AF`

#### Status Indicators
- **Unread**: Bold text with blue dot
- **Pending Response**: Clock icon
- **Property Unavailable**: Strike-through with red badge

### Profile Management Widget

#### Compact View (Mobile/Tablet)
```
┌─────────────────────────┐
│ Presupuesto:           │
│ L.10,000 - L.15,000    │
│                        │
│ Mudanza: Noviembre 2024│
│ Zonas: 3 seleccionadas │
│                        │
│ [Editar Preferencias]  │
└─────────────────────────┘
```

#### Expanded View (Desktop)
```
┌─────────────────────────────┐
│ María Rodríguez            │
│ ✉ maria@email.com          │
│ 📱 +504 9999-9999          │
│ ────────────────────────── │
│ Preferencias de Búsqueda:  │
│ • Presupuesto: L.10-15k    │
│ • Mudanza: Noviembre 2024  │
│ • Zonas: Lomas, Centro...  │
│ • Tipos: Apto, Casa        │
│                            │
│ Perfil: 85% completo       │
│ [████████░░] Completar     │
│                            │
│ [Editar Todo]              │
└─────────────────────────────┘
```

#### Edit Modal
- **Inline Editing**: For individual fields
- **Full Form**: For comprehensive updates
- **Auto-save**: With debounce on changes
- **Validation**: Real-time feedback

### Landlord Upgrade CTA

#### Mobile/Tablet
```
┌─────────────────────────┐
│ 🏠 ¿Tienes propiedad?  │
│                        │
│ Publica GRATIS y       │
│ encuentra inquilinos   │
│                        │
│ ✓ Sin comisiones      │
│ ✓ Alcance directo     │
│ ✓ Gestión simple      │
│                        │
│ [Publicar Ahora →]     │
└─────────────────────────┘
```

#### Desktop (Banner)
```
┌────────────────────────────────────────────┐
│ 🏠 Convierte tu propiedad en ingresos     │
│ Publica gratis • Sin comisiones • Fácil   │
│                             [Comenzar →]   │
└────────────────────────────────────────────┘
```

#### Specifications
- **Background**: Gradient `#2563EB` to `#3B82F6`
- **Text**: White with high contrast
- **Button**: White background, blue text
- **Animation**: Subtle pulse on button
- **Dismissible**: X button stores preference

---

## Interaction Patterns

### Navigation Flow
```
Dashboard Entry
    ↓
Quick Stats Overview
    ↓
Primary Action Decision
    ├── New Search → Property Discovery
    ├── View Favorites → Property Grid
    ├── Check Messages → Conversation List
    └── Edit Profile → Profile Form
```

### Search Management Flow
```
Saved Search Card
    ↓
User clicks "Ver"
    ↓
Load search filters
    ↓
Navigate to Property Discovery
    ↓
Results pre-filtered
    ↓
Option to modify/save
```

### Property Contact Flow
```
Favorite Property Card
    ↓
User clicks "Contactar"
    ↓
[Profile Complete?]
    ├── Yes → Generate WhatsApp message
    └── No → Complete profile modal
    ↓
Open WhatsApp with message
    ↓
Update conversation history
```

---

## Mobile-Specific Features

### Bottom Navigation
```
┌─────────────────────────┐
│                         │
│     Main Content        │
│                         │
├─────────────────────────┤
│ 🏠   🔍   ♥   💬   👤  │
│Inicio|Buscar|Favs|Chat|Perfil│
└─────────────────────────┘
```

- **Fixed Position**: Always visible
- **Active State**: Blue icon and label
- **Badge Notifications**: For new items
- **Smooth Transitions**: Between sections

### Swipe Gestures
- **Property Cards**: Swipe left to remove favorite
- **Search Cards**: Swipe left for quick actions
- **Pull to Refresh**: Update all sections

### Progressive Disclosure
- **Collapsed Sections**: Expand on tap
- **Load More**: Pagination for lists
- **Skeleton Screens**: While loading content

---

## Performance Optimizations

### Data Loading Strategy
```javascript
// Initial Load Priority
1. User greeting and stats (cached)
2. First 3 saved searches
3. First 6 favorite properties
4. Recent conversations (last 5)
5. Profile completion status

// Lazy Load
- Additional favorites on scroll
- Older conversations on demand
- Property images with intersection observer
```

### Caching Strategy
- **Local Storage**: User preferences, saved searches
- **Session Storage**: Recent property views
- **Service Worker**: Offline dashboard access
- **Image CDN**: Optimized property images

### Real-time Updates
- **WebSocket**: For new property matches
- **Push Notifications**: Critical updates
- **Background Sync**: Conversation status

---

## Accessibility Features

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: For all interactive elements
- **Live Regions**: For dynamic updates
- **Skip Links**: Navigation shortcuts

### Keyboard Navigation
```
Tab Order:
1. Main navigation
2. Quick stats
3. Primary CTAs
4. Saved searches (interactive)
5. Favorite properties (grid)
6. Conversations list
7. Profile section
8. Landlord CTA
```

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible outlines
- **Text Scaling**: Responsive to user preferences
- **Dark Mode**: Optional theme (future)

---

## Integration Points

### API Endpoints
```
GET    /api/tenant/dashboard
GET    /api/tenant/stats
GET    /api/tenant/saved-searches
GET    /api/tenant/favorites
GET    /api/tenant/conversations
PUT    /api/tenant/preferences
DELETE /api/tenant/saved-search/{id}
DELETE /api/tenant/favorite/{propertyId}
POST   /api/tenant/contact/{propertyId}
```

### State Management
```typescript
interface DashboardState {
  user: TenantProfile;
  stats: {
    savedSearches: number;
    favorites: number;
    conversations: number;
  };
  savedSearches: SavedSearch[];
  favoriteProperties: Property[];
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
}
```

### Analytics Events
```javascript
// Page Views
'dashboard_viewed'
'dashboard_section_expanded'

// Interactions
'saved_search_executed'
'saved_search_edited'
'saved_search_deleted'
'property_favorited'
'property_unfavorited'
'property_contacted'
'profile_edited'

// Conversion
'landlord_cta_clicked'
'landlord_signup_started'
```

---

## Success Metrics

### Engagement KPIs
- **Daily Active Users**: >40% of tenant base
- **Session Duration**: >3 minutes average
- **Actions per Session**: >5 interactions
- **Return Rate**: >60% weekly

### Feature Adoption
- **Saved Searches**: >50% create at least one
- **Favorites**: >70% save properties
- **Profile Completion**: >85% fully complete
- **Landlord Conversion**: >3% monthly

### Performance Targets
- **Page Load**: <2 seconds on 3G
- **Interaction Response**: <100ms
- **Search Execution**: <1 second
- **Image Loading**: Progressive with placeholders

---

## Future Enhancements

### Phase 2 Features
- **Smart Recommendations**: AI-powered property suggestions
- **Virtual Tours**: 360° property views integration
- **Appointment Scheduling**: Direct booking with landlords
- **Document Management**: Lease agreements and documents

### Phase 3 Features
- **Tenant Verification**: Background check integration
- **Payment Integration**: Deposit and rent payments
- **Reviews System**: Landlord and property ratings
- **Community Features**: Tenant forums and advice

---

## Related Documentation

- [User Authentication](../user-authentication/README.md)
- [Tenant Authentication Flow](../user-authentication/tenant-authentication.md)
- [Tenant Profile Management](./README.md)
- [Property Discovery](../property-discovery/README.md)
- [WhatsApp Integration](../whatsapp-integration/README.md)

---

*Document Version: 1.0.0 | Last Updated: September 29, 2025*
*Component of the Tenant Profile Management System*