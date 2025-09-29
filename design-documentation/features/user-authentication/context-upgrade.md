---
title: Context Upgrade Flows
description: Seamless transition paths for users expanding between tenant and landlord contexts
feature: user-authentication
last-updated: 2025-01-29
version: 1.0.0
related-files:
  - ./README.md
  - ./tenant-authentication.md
  - ./landlord-authentication.md
  - ../landlord-profile/README.md
dependencies:
  - Authentication system implementation
  - Profile management system
status: approved
---

# Context Upgrade Flows

## Overview
This document details the upgrade paths for users who want to expand their account capabilities from single-context (tenant OR landlord) to dual-context (tenant AND landlord) functionality. The system emphasizes progressive enhancement and data reuse to minimize friction.

## Table of Contents
1. [Upgrade Path Architecture](#upgrade-path-architecture)
2. [Tenant to Landlord Upgrade](#tenant-to-landlord-upgrade)
3. [Landlord to Tenant Upgrade](#landlord-to-tenant-upgrade)
4. [Data Reuse Strategies](#data-reuse-strategies)
5. [Progressive Profile Completion](#progressive-profile-completion)
6. [Cross-Promotion Patterns](#cross-promotion-patterns)
7. [Success Metrics](#success-metrics)
8. [Implementation Guidelines](#implementation-guidelines)

## Upgrade Path Architecture

### System Design Principles
- **Single Account, Multiple Contexts**: One authentication, multiple roles
- **Progressive Enhancement**: Add capabilities without disrupting existing functionality
- **Data Continuity**: Maximize reuse of verified information
- **Minimal Friction**: Streamlined upgrade with smart defaults
- **Clear Context Switching**: Obvious UI indicators for current mode

### Context Model
```
User Account
├── Core Profile (Shared)
│   ├── Name
│   ├── Email (verified)
│   ├── Phone (verified)
│   └── Profile Photo
├── Tenant Context
│   ├── Search Preferences
│   ├── Saved Properties
│   └── Inquiry History
└── Landlord Context
    ├── Business Information
    ├── Property Listings
    └── Lead Management
```

## Tenant to Landlord Upgrade

### Entry Points
1. **Profile Menu**: "Convertirte en Arrendador" option
2. **Empty State Prompts**: When viewing landlord features
3. **Contextual CTAs**: In relevant content areas
4. **Marketing Campaigns**: Targeted upgrade promotions

### Upgrade Flow

#### Step 1: Upgrade Initiation
**Screen: Upgrade Landing**
```
┌─────────────────────────────────┐
│ ← Volver                        │
│                                 │
│    🏠                           │
│                                 │
│ Publica tus Propiedades        │
│                                 │
│ Comienza a recibir inquilinos  │
│ calificados hoy mismo          │
│                                 │
│ ✓ Mantén tu perfil de inquilino│
│ ✓ Publicación gratuita          │
│ ✓ Gestión simplificada          │
│                                 │
│ [Comenzar] (Primary)            │
│                                 │
│ [Más información] (Text link)   │
└─────────────────────────────────┘
```

**Visual Specifications**:
- Background: Gradient overlay on property image
- Icon: 48px landlord icon with subtle animation
- Typography: H2 for title, Body for benefits
- Button: Full-width primary CTA

#### Step 2: Information Reuse
**Screen: Profile Confirmation**
```
┌─────────────────────────────────┐
│ ← Configuración de Arrendador   │
│                                 │
│ Información Personal            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Juan Pérez ✓                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ juan@email.com ✓            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ +504 9999-9999 ✓            │ │
│ └─────────────────────────────┘ │
│                                 │
│ ℹ️ Usaremos tu información      │
│ existente para tu perfil        │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

**Interaction Pattern**:
- Pre-filled fields are read-only with checkmark
- Tap to edit if needed
- Smart validation skips verified data

#### Step 3: Landlord-Specific Information
**Screen: Business Details**
```
┌─────────────────────────────────┐
│ ← Tipo de Arrendador            │
│                                 │
│ ¿Cómo describes tu actividad?  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ○ Propietario Individual    │ │
│ │   1-3 propiedades           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ○ Agente Inmobiliario       │ │
│ │   Múltiples clientes        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ○ Empresa de Gestión        │ │
│ │   Portfolio profesional     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

**Selection Logic**:
- Each option triggers different data requirements
- Visual feedback on selection
- Help text explains implications

#### Step 4: Completion
**Screen: Success State**
```
┌─────────────────────────────────┐
│                                 │
│        ✓                        │
│                                 │
│ ¡Bienvenido como Arrendador!   │
│                                 │
│ Tu cuenta ahora tiene acceso   │
│ completo a ambos perfiles      │
│                                 │
│ [Publicar Primera Propiedad]   │
│         (Primary)               │
│                                 │
│ [Explorar Dashboard]            │
│      (Secondary)                │
│                                 │
│ [Volver a Mi Perfil]           │
│      (Text link)                │
└─────────────────────────────────┘
```

**Animation Sequence**:
1. Checkmark scales in with bounce
2. Text fades in sequentially
3. Buttons slide up from bottom

### Mobile-First Considerations
- **Touch Targets**: Minimum 48px height for all interactive elements
- **Scroll Behavior**: Step indicator stays fixed at top
- **Keyboard**: Auto-advance on field completion
- **Loading States**: Inline progress during verification

## Landlord to Tenant Upgrade

### Entry Points
1. **Search Bar**: Prominent in landlord dashboard
2. **Navigation Toggle**: Context switcher in header
3. **Empty States**: "Buscar para Ti" prompts
4. **Cross-Sell**: After successful rental

### Upgrade Flow

#### Step 1: Search Initiation
**Screen: Tenant Mode Prompt**
```
┌─────────────────────────────────┐
│ Dashboard de Arrendador     🔄  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Buscar propiedades...    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ╭─────────────────────────────╮ │
│ │ ¿Buscando para ti?          │ │
│ │                             │ │
│ │ Activa tu perfil de         │ │
│ │ inquilino para guardar      │ │
│ │ favoritos y contactar       │ │
│ │ arrendadores                │ │
│ │                             │ │
│ │ [Activar] [Ahora no]        │ │
│ ╰─────────────────────────────╯ │
└─────────────────────────────────┘
```

**Interaction Pattern**:
- Tooltip appears on first search attempt
- Dismissible but reappears after 30 days
- Quick activation without leaving context

#### Step 2: Preference Setup
**Screen: Quick Preferences**
```
┌─────────────────────────────────┐
│ ← Preferencias de Búsqueda      │
│                                 │
│ ¿Qué estás buscando?           │
│                                 │
│ Tipo de Propiedad               │
│ [Casa] [Apartamento] [Cuarto]  │
│                                 │
│ Presupuesto Mensual             │
│ ┌─────────────────────────────┐ │
│ │ L. 5,000 — L. 25,000        │ │
│ └─────────────────────────────┘ │
│                                 │
│ Ubicación Preferida             │
│ ┌─────────────────────────────┐ │
│ │ 📍 Tegucigalpa, FM          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Guardar y Buscar] (Primary)    │
│                                 │
│ [Omitir por ahora] (Text)       │
└─────────────────────────────────┘
```

**Smart Defaults**:
- Location from landlord properties
- Price range from market average
- Property type from portfolio

#### Step 3: Context Switch Confirmation
**Screen: Dual Mode Activated**
```
┌─────────────────────────────────┐
│                                 │
│    👤 ←→ 🏠                     │
│                                 │
│ Modo Dual Activado              │
│                                 │
│ Ahora puedes cambiar entre      │
│ perfiles con un toque           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Inquilino | Arrendador      │ │
│ │    ✓           ✓            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Comenzar Búsqueda] (Primary)   │
│                                 │
│ [Ver Tutorial] (Secondary)       │
└─────────────────────────────────┘
```

**Visual Feedback**:
- Animated toggle demonstration
- Both checkmarks light up
- Subtle celebration animation

## Data Reuse Strategies

### Shared Data Points
| Data Field | Tenant Use | Landlord Use | Reuse Strategy |
|------------|------------|--------------|----------------|
| Full Name | Contact info | Business name | Direct copy |
| Email | Account access | Lead reception | Shared verification |
| Phone | Contact number | Business line | Optional separation |
| Photo | Profile image | Professional photo | Separate uploads |
| Location | Search area | Property location | Smart suggestion |
| ID Verification | Trust signal | Required verification | One-time process |

### Progressive Data Collection
```
Initial Registration (Shared)
    ↓
Context Selection
    ↓
Minimal Context Data
    ↓
Usage-Based Prompts
    ↓
Complete Profile
```

### Data Privacy Considerations
- **Separate Contact Options**: Different phone/email per context
- **Privacy Toggles**: Control what's visible in each mode
- **Clear Indicators**: Which data is shared vs separate
- **Audit Trail**: Track context-specific activities

## Progressive Profile Completion

### Completion Levels

#### Level 1: Basic (Required)
- Name + Email verification
- Password setup
- Context selection

#### Level 2: Enhanced (Encouraged)
- Phone verification
- Profile photo
- Location preferences

#### Level 3: Complete (Rewarded)
- ID verification
- Detailed preferences
- Business information (landlords)

### Incentive Structure
```
┌─────────────────────────────────┐
│ Completa tu Perfil              │
│                                 │
│ ████████░░░░░░░ 60%             │
│                                 │
│ Próximos pasos:                 │
│ □ Verificar teléfono (+10%)     │
│ □ Agregar foto (+15%)           │
│ □ Verificar identidad (+15%)    │
│                                 │
│ 🎁 Al 100%: Badge verificado    │
└─────────────────────────────────┘
```

### Contextual Prompts
- **After First Search**: "Guarda tus favoritos"
- **After Property View**: "Contacta más rápido"
- **After Listing Creation**: "Aumenta tu visibilidad"

## Cross-Promotion Patterns

### Tenant → Landlord Triggers
1. **Behavioral Signals**:
   - Viewing same property repeatedly
   - Searching in owned property area
   - Extended platform usage (6+ months)

2. **Contextual Moments**:
   - After lease signing
   - Property investment content
   - Market opportunity alerts

3. **Promotional UI**:
```
┌─────────────────────────────────┐
│ 💡 ¿Sabías que...?              │
│                                 │
│ El 30% de nuestros inquilinos   │
│ también publican propiedades    │
│                                 │
│ [Conocer más] [Cerrar]          │
└─────────────────────────────────┘
```

### Landlord → Tenant Triggers
1. **Use Case Signals**:
   - Using search frequently
   - Viewing competitor properties
   - Location changes

2. **Natural Moments**:
   - Post-rental success
   - Slow season periods
   - Feature discovery

3. **Subtle Integration**:
```
┌─────────────────────────────────┐
│ Búsqueda Rápida                 │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Ciudad, zona o código    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Guardadas: 0 | [Activar perfil] │
└─────────────────────────────────┘
```

## Success Metrics

### Conversion Metrics
- **Upgrade Rate**: % of single-context converting to dual
- **Time to Upgrade**: Average days from registration
- **Completion Rate**: % completing upgrade flow
- **Drop-off Points**: Where users abandon

### Engagement Metrics
- **Context Switching**: Frequency of mode changes
- **Cross-Context Activity**: Actions in both modes
- **Feature Adoption**: Usage of context-specific features
- **Retention Impact**: Dual vs single context retention

### Business Metrics
- **Revenue per User**: Dual-context vs single
- **Listing Quality**: From tenant-turned-landlords
- **Lead Quality**: From landlord-turned-tenants
- **Network Effects**: Referral rates

### Target KPIs
| Metric | Target | Current | Timeline |
|--------|--------|---------|----------|
| Tenant→Landlord | 15% | Baseline | 6 months |
| Landlord→Tenant | 25% | Baseline | 6 months |
| Dual-Context Active | 40% | Baseline | 12 months |
| Profile Completion | 70% | Baseline | 3 months |

## Implementation Guidelines

### Technical Architecture
```javascript
// Context Management
interface UserContext {
  userId: string;
  activeContext: 'tenant' | 'landlord';
  contexts: {
    tenant?: TenantProfile;
    landlord?: LandlordProfile;
  };
  sharedData: SharedProfile;
  preferences: ContextPreferences;
}

// Context Switching
function switchContext(targetContext: ContextType) {
  // Animate transition
  // Update navigation
  // Load context data
  // Track event
}
```

### State Management
- **Persistent Context**: Remember last active mode
- **Quick Switch**: Single tap context change
- **Data Sync**: Real-time updates across contexts
- **Cache Strategy**: Preload both contexts

### UI Components
```typescript
// Context Switcher Component
<ContextSwitcher
  currentContext={activeContext}
  availableContexts={['tenant', 'landlord']}
  onSwitch={handleContextSwitch}
  showLabels={true}
/>

// Upgrade Prompt Component
<UpgradePrompt
  fromContext="tenant"
  toContext="landlord"
  trigger="behavioral"
  onAccept={startUpgradeFlow}
  onDismiss={trackDismissal}
/>
```

### A/B Testing Strategy
- **Trigger Timing**: When to show upgrade prompts
- **Copy Variations**: Different value propositions
- **Flow Length**: Full vs quick upgrade
- **Incentives**: Testing different rewards

### Mobile Optimization
- **Gesture Support**: Swipe to switch contexts
- **Deep Linking**: Direct links to context upgrade
- **Offline Support**: Cache upgrade flow
- **Background Sync**: Complete upgrade asynchronously

## Related Documentation
- [Authentication Overview](./README.md)
- [Tenant Authentication](./tenant-authentication.md)
- [Landlord Authentication](./landlord-authentication.md)
- [Landlord Profile System](../landlord-profile/README.md)

## Last Updated
- 2025-01-29: Initial documentation for context upgrade flows
- Defined upgrade paths for both directions
- Established data reuse strategies
- Created cross-promotion patterns