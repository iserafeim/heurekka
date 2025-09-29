---
title: Landlord Onboarding Process
description: Post-authentication onboarding flow for new landlords
feature: landlord-profile
last-updated: 2025-01-29
version: 1.0.0
related-files:
  - ./README.md
  - ./property-type-selection.md
  - ./verification-levels.md
  - ../user-authentication/landlord-authentication.md
dependencies:
  - Landlord authentication completed
  - Profile type selection system
status: approved
---

# Landlord Onboarding Process

## Overview
The landlord onboarding process guides newly authenticated landlords through profile setup, ensuring they have all necessary information to start listing properties successfully. The flow emphasizes progressive disclosure and quick time-to-value.

## Table of Contents
1. [Onboarding Architecture](#onboarding-architecture)
2. [Post-Authentication Flow](#post-authentication-flow)
3. [Progressive Profile Completion](#progressive-profile-completion)
4. [Required vs Optional Information](#required-vs-optional-information)
5. [Verification Requirements](#verification-requirements)
6. [First Listing Guidance](#first-listing-guidance)
7. [Mobile Experience](#mobile-experience)
8. [Implementation Guidelines](#implementation-guidelines)

## Onboarding Architecture

### Flow Principles
- **Time to First Value**: <3 minutes to first listing
- **Progressive Enhancement**: Start simple, add complexity
- **Smart Defaults**: Pre-fill when possible
- **Clear Value Proposition**: Show benefits at each step
- **Escape Hatches**: Allow skipping non-critical steps

### Onboarding Stages
```
Authentication Complete
    ↓
Welcome & Context Setting
    ↓
Profile Type Selection
    ↓
Essential Information
    ↓
Optional Enhancements
    ↓
Verification Options
    ↓
First Listing Prompt
    ↓
Dashboard Introduction
```

## Post-Authentication Flow

### Step 1: Welcome Screen
**Screen: Landlord Welcome**
```
┌─────────────────────────────────┐
│                                 │
│      🏠                         │
│                                 │
│ ¡Bienvenido a Heurekka!        │
│                                 │
│ Configura tu perfil en solo     │
│ 3 minutos y comienza a         │
│ recibir inquilinos hoy         │
│                                 │
│ ✓ Publicación gratuita          │
│ ✓ Inquilinos verificados        │
│ ✓ Gestión simplificada          │
│                                 │
│ [Comenzar] (Primary)            │
│                                 │
│ [Ya tengo una cuenta] (Text)    │
└─────────────────────────────────┐
```

**Visual Design**:
- **Background**: Subtle gradient with property imagery
- **Icon**: Animated entrance (scale + fade)
- **Typography**: H1 welcome, body for benefits
- **Progress Indicator**: Not shown on first screen

**Interaction**:
- Auto-advance after 5 seconds if no interaction
- Swipe gesture to continue (mobile)
- Skip option for returning users

### Step 2: Profile Type Selection
**Screen: Landlord Type**
```
┌─────────────────────────────────┐
│ ← Tipo de Cuenta         ○○●○○  │
│                                 │
│ ¿Qué tipo de arrendador eres?  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      👤                      │ │
│ │ Propietario Individual       │ │
│ │ Tengo mis propias           │ │
│ │ propiedades                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      🏢                      │ │
│ │ Agente Inmobiliario         │ │
│ │ Gestiono propiedades de     │ │
│ │ clientes                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      🏛                      │ │
│ │ Empresa de Gestión          │ │
│ │ Administramos múltiples     │ │
│ │ propiedades                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Disabled → Active) │
└─────────────────────────────────┘
```

**Selection Cards**:
- **Visual State**: Border highlight on selection
- **Animation**: Subtle scale on tap
- **Content**: Icon + title + description
- **Interaction**: Single selection required

### Step 3: Essential Information
**Screen: Basic Profile - Individual Owner**
```
┌─────────────────────────────────┐
│ ← Información Básica     ○○○●○  │
│                                 │
│ Completa tu perfil              │
│                                 │
│ Nombre Completo *               │
│ ┌─────────────────────────────┐ │
│ │ Juan Pérez                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ WhatsApp de Contacto *          │
│ ┌─────────────────────────────┐ │
│ │ +504 9999-9999              │ │
│ └─────────────────────────────┘ │
│                                 │
│ Ubicación Principal *           │
│ ┌─────────────────────────────┐ │
│ │ 📍 Tegucigalpa, FM          │ │
│ └─────────────────────────────┘ │
│                                 │
│ Número de Propiedades          │
│ ┌─────────────────────────────┐ │
│ │ ○ 1  ○ 2-3  ○ 4-5  ○ 5+   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Primary)           │
│ [Completar después] (Text)      │
└─────────────────────────────────┘
```

**Form Behavior**:
- **Auto-fill**: From authentication data
- **Validation**: Real-time, inline
- **Required Fields**: Marked with asterisk
- **Location**: Auto-detect with override
- **Progress**: Continue enabled when required complete

**Screen: Basic Profile - Real Estate Agent**
```
┌─────────────────────────────────┐
│ ← Información Profesional ○○○●○ │
│                                 │
│ Datos del Agente                │
│                                 │
│ Nombre Profesional *            │
│ ┌─────────────────────────────┐ │
│ │ Lic. María González         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Número de Licencia *            │
│ ┌─────────────────────────────┐ │
│ │ RAH-2024-1234               │ │
│ └─────────────────────────────┘ │
│                                 │
│ Agencia (Opcional)              │
│ ┌─────────────────────────────┐ │
│ │ Century 21 Honduras         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Años de Experiencia             │
│ ┌─────────────────────────────┐ │
│ │ ○ <1  ○ 1-3  ○ 3-5  ○ 5+  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Áreas de Servicio *             │
│ ┌─────────────────────────────┐ │
│ │ + Tegucigalpa               │ │
│ │ + San Pedro Sula            │ │
│ │ + Agregar otra...           │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

### Step 4: Profile Photo (Optional)
**Screen: Photo Upload**
```
┌─────────────────────────────────┐
│ ← Foto de Perfil         ○○○○● │
│                                 │
│ Agrega una foto profesional     │
│ Los perfiles con foto reciben   │
│ 3x más consultas                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │      📷                     │ │
│ │                             │ │
│ │   [Subir Foto]              │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Recomendaciones:                │
│ • Usa una foto profesional      │
│ • Muestra tu rostro claramente  │
│ • Evita logos o imágenes       │
│                                 │
│ [Continuar] (Primary)           │
│ [Omitir por ahora] (Text)       │
└─────────────────────────────────┘
```

**Upload Behavior**:
- **Sources**: Camera, gallery, web
- **Crop Tool**: Square aspect ratio
- **Optimization**: Auto-compress, resize
- **Preview**: Show before confirming

## Progressive Profile Completion

### Completion Tracking
```
┌─────────────────────────────────┐
│ Tu Perfil: 60% Completo         │
│ ████████████░░░░░░░░            │
│                                 │
│ Completado:                     │
│ ✓ Información básica            │
│ ✓ Tipo de arrendador            │
│ ✓ Contacto verificado           │
│                                 │
│ Por completar:                  │
│ ○ Foto de perfil (+10%)         │
│ ○ Verificación ID (+20%)        │
│ ○ Primera propiedad (+10%)      │
│                                 │
│ [Completar Perfil]              │
└─────────────────────────────────┘
```

### Completion Incentives
| Completion % | Benefit |
|-------------|---------|
| 40% | Can create listings |
| 60% | Appears in search results |
| 80% | "Verified" badge |
| 100% | Priority placement |

### Smart Prompts
```typescript
// Contextual completion prompts
const prompts = {
  afterFirstListing: "Completa tu perfil para destacar",
  afterFirstLead: "Verifica tu ID para más confianza",
  afterWeek: "Los perfiles completos reciben 2x más leads",
  afterPhoto: "¡Genial! Solo falta verificar tu identidad"
};
```

## Required vs Optional Information

### Required Fields (Must have to list)
| Field | Individual | Agent | Company |
|-------|------------|-------|---------|
| Full Name | ✓ | ✓ | ✓ |
| Contact Phone | ✓ | ✓ | ✓ |
| Email | ✓ | ✓ | ✓ |
| Location | ✓ | ✓ | ✓ |
| License # | - | ✓ | - |
| Business Reg | - | - | ✓ |

### Optional Fields (Enhance profile)
| Field | Purpose | Impact |
|-------|---------|--------|
| Photo | Trust building | +3x inquiries |
| Bio | Personal connection | +15% response |
| WhatsApp | Quick communication | +40% contact rate |
| Social Links | Credibility | +10% trust score |
| Languages | Wider audience | +25% international |

### Progressive Disclosure Strategy
```
Immediate (Required)
    ↓
First Listing (Encouraged)
    ↓
After First Lead (Suggested)
    ↓
Performance-Based (Recommended)
```

## Verification Requirements

### Verification Options Screen
**Screen: Build Trust**
```
┌─────────────────────────────────┐
│ ← Verificación           ○○○○○  │
│                                 │
│ Construye Confianza             │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✓ Email                     │ │
│ │   Verificado                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📱 Teléfono                 │ │
│ │   [Verificar ahora]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🆔 Identidad                │ │
│ │   Obtén el badge verificado │ │
│ │   [Comenzar] (5 min)        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📄 Documentos de Propiedad  │ │
│ │   Para premium              │ │
│ │   [Más información]         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Primary)           │
│ [Verificar después] (Text)      │
└─────────────────────────────────┘
```

### Verification Process
1. **Phone**: SMS code (immediate)
2. **ID**: Photo upload + selfie (5 min)
3. **Property**: Document upload (manual review)
4. **Professional**: License validation (agent only)

## First Listing Guidance

### Listing Prompt Screen
**Screen: First Property**
```
┌─────────────────────────────────┐
│                                 │
│ ¡Tu perfil está listo!          │
│                                 │
│     🎉                          │
│                                 │
│ Publica tu primera propiedad    │
│ y comienza a recibir            │
│ inquilinos calificados          │
│                                 │
│ Tiempo estimado: 2 minutos      │
│                                 │
│ [Publicar Propiedad] (Primary)  │
│                                 │
│ [Explorar Dashboard] (Secondary)│
│                                 │
│ [Ver Tutorial] (Text)           │
└─────────────────────────────────┘
```

### Quick Start Guide
```
┌─────────────────────────────────┐
│ Guía Rápida                 1/3 │
│                                 │
│ 📸 Fotos que Venden             │
│                                 │
│ • Usa luz natural               │
│ • Muestra cada habitación       │
│ • Incluye áreas comunes         │
│ • Mínimo 5 fotos                │
│                                 │
│ [Siguiente →]                   │
└─────────────────────────────────┘
```

### Listing Templates
- **Quick**: Pre-filled common values
- **Detailed**: All options available
- **Import**: From other platforms
- **Duplicate**: Copy existing listing

## Mobile Experience

### Touch Optimizations
- **Input Fields**: 48px minimum height
- **Buttons**: Full-width on mobile
- **Spacing**: Increased touch targets
- **Keyboard**: Smart type switching

### Gesture Support
```typescript
// Swipe navigation
const gestureHandlers = {
  swipeLeft: nextStep,
  swipeRight: previousStep,
  swipeDown: showProgress,
  longPress: showHelp
};
```

### Offline Capability
```typescript
// Cache onboarding progress
const saveProgress = async (step, data) => {
  await AsyncStorage.setItem('onboarding_progress', {
    currentStep: step,
    formData: data,
    timestamp: Date.now()
  });
};
```

### Mobile-Specific UI
```
┌─────────────────────────────────┐
│ 📱 Mobile Onboarding             │
│                                 │
│ • Vertical flow                 │
│ • Single column                 │
│ • Large touch targets           │
│ • Minimal scrolling             │
│ • Auto-save progress            │
│ • Resume capability             │
└─────────────────────────────────┘
```

## Implementation Guidelines

### State Management
```typescript
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  profileType: 'individual' | 'agent' | 'company';
  formData: Partial<LandlordProfile>;
  completionScore: number;
  skippedSteps: string[];
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    documents: boolean;
  };
}
```

### API Integration
```typescript
// Progressive save
async function saveOnboardingProgress(data: Partial<OnboardingState>) {
  return api.post('/landlord/onboarding/progress', {
    ...data,
    timestamp: Date.now()
  });
}

// Complete onboarding
async function completeOnboarding(profileId: string) {
  const result = await api.post('/landlord/onboarding/complete', {
    profileId,
    completedAt: Date.now()
  });

  // Trigger welcome email
  await api.post('/notifications/welcome-landlord', { profileId });

  return result;
}
```

### Analytics Tracking
```typescript
// Track onboarding events
const trackingEvents = {
  ONBOARDING_START: 'landlord_onboarding_start',
  TYPE_SELECTED: 'landlord_type_selected',
  STEP_COMPLETED: 'onboarding_step_completed',
  FIELD_FILLED: 'onboarding_field_filled',
  VERIFICATION_STARTED: 'verification_started',
  PHOTO_UPLOADED: 'profile_photo_uploaded',
  ONBOARDING_COMPLETE: 'landlord_onboarding_complete',
  FIRST_LISTING_STARTED: 'first_listing_started'
};

// Track drop-off points
const trackDropOff = (step: string, reason?: string) => {
  analytics.track('onboarding_abandoned', {
    step,
    reason,
    timeSpent: calculateTimeSpent(),
    completionPercentage: calculateCompletion()
  });
};
```

### Error Handling
```typescript
// Graceful error recovery
const handleOnboardingError = (error: Error, step: string) => {
  // Save progress locally
  saveLocalProgress(step);

  // Show appropriate message
  if (error.type === 'NETWORK') {
    showMessage('Sin conexión. Tu progreso se guardó.');
  } else if (error.type === 'VALIDATION') {
    highlightErrors(error.fields);
  } else {
    showMessage('Algo salió mal. Intenta de nuevo.');
  }

  // Allow retry
  enableRetry();
};
```

### A/B Testing Variables
```typescript
const testVariables = {
  // Number of required fields
  minimalFields: ['name', 'phone', 'location'],
  standardFields: [...minimalFields, 'propertyCount', 'experience'],

  // Verification timing
  verificationTiming: 'immediate' | 'afterFirstListing' | 'optional',

  // Photo requirement
  photoRequired: boolean,

  // Progress indicators
  progressStyle: 'dots' | 'bar' | 'steps',

  // Skip options
  allowSkip: boolean
};
```

## Related Documentation
- [Profile System Overview](./README.md)
- [Property Type Selection](./property-type-selection.md)
- [Verification Levels](./verification-levels.md)
- [Landlord Authentication](../user-authentication/landlord-authentication.md)
- [First Listing Flow](../property-listing-management/listing-creation.md)

## Last Updated
- 2025-01-29: Initial onboarding documentation created
- Defined post-authentication flow
- Established progressive completion strategy
- Created mobile-first experience