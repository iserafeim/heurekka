---
title: Tenant Authentication Flow
description: Complete design specifications for tenant-intent authentication and profile creation
feature: user-authentication
last-updated: 2025-01-29
version: 1.0.0
related-files:
  - design-documentation/features/user-authentication/README.md
  - design-documentation/features/user-authentication/landlord-authentication.md
  - design-documentation/features/search-profile-creation/README.md
  - design-documentation/features/whatsapp-integration/README.md
status: draft
---

# Tenant Authentication Flow

## Overview

The Tenant Authentication Flow activates when users express interest in contacting property owners. This intent-driven approach ensures users only see relevant profile fields and can quickly complete their goal of reaching out to landlords with a complete, professional tenant profile.

## User Journey

### Entry Points

#### Primary Triggers
1. **Property Card**: "Contactar" button on search results
2. **Property Details**: "Enviar Mensaje" or "WhatsApp" CTA
3. **Gallery View**: "Me Interesa" overlay button
4. **Saved Properties**: "Contactar Todos" bulk action

#### Context Preservation
```typescript
interface AuthenticationContext {
  trigger: 'contact_property';
  propertyId: string;
  propertyDetails: {
    title: string;
    price: number;
    location: string;
    landlordPhone: string;
  };
  returnUrl: string;
  timestamp: Date;
}
```

## Screen Specifications

## Step 1: Authentication Modal

### Mobile Layout (Full Screen)
```
┌─────────────────────────────┐
│ ← Volver                    │ Header (56px)
├─────────────────────────────┤
│                             │
│     HEUREKKA               │ Logo (32px)
│                             │
├─────────────────────────────┤
│                             │
│  Crea tu Cuenta para       │ Title (24px, bold)
│  Contactar al Propietario   │
│                             │
│ ┌─────────────────────────┐ │ Property Context
│ │ [IMG] Los Próceres      │ │ (Optional - if from
│ │       2 habitaciones    │ │  specific property)
│ │       L.15,000/mes      │ │
│ └─────────────────────────┘ │
│                             │
│ Tu perfil te permite        │ Value Prop
│ contactar múltiples         │ (14px, gray)
│ propiedades sin repetir     │
│ tu información             │
│                             │
├─────────────────────────────┤
│                             │
│ [G] Continuar con Google   │ OAuth Button (48px)
│                             │
│ ──────── o ────────        │ Divider
│                             │
│ Correo Electrónico *       │ Label (14px)
│ ┌─────────────────────────┐ │
│ │ tu@email.com           │ │ Input (48px)
│ └─────────────────────────┘ │
│                             │
│ Contraseña *               │
│ ┌─────────────────────────┐ │
│ │ ••••••••               │ │ Input (48px)
│ └─────────────────────────┘ │
│                             │
│ □ Recordarme               │ Checkbox
│                             │
│ [Crear Cuenta →]           │ Primary CTA (48px)
│                             │
│ ¿Ya tienes cuenta?         │ Link (14px)
│ Iniciar Sesión             │
│                             │
│ Al continuar, aceptas los  │ Legal (12px)
│ Términos y Privacidad      │
│                             │
└─────────────────────────────┘
```

### Desktop Layout (Modal: 480px)
```
┌───────────────────────────────────┐
│         Crear Cuenta        [X]   │ Modal Header
├───────────────────────────────────┤
│                                   │
│   [LOGO] HEUREKKA                 │ Branding
│                                   │
│   Únete para Contactar            │ Title (24px)
│   Propietarios                    │
│                                   │
│ ┌─────────────────────────────┐   │ Benefits Box
│ │ ✓ Un perfil para todas las  │   │ (Background: #F9FAFB)
│ │   propiedades                │   │
│ │ ✓ Mensajes personalizados   │   │
│ │   automáticos                │   │
│ │ ✓ Historial de contactos    │   │
│ │ ✓ Alertas de propiedades    │   │
│ └─────────────────────────────┘   │
│                                   │
│ ┌─────────────────────────────┐   │
│ │ [G] Continuar con Google    │   │ OAuth (48px)
│ └─────────────────────────────┘   │
│                                   │
│ ──────────── o ──────────────     │
│                                   │
│ Correo Electrónico                │
│ ┌─────────────────────────────┐   │
│ │ nombre@ejemplo.com          │   │
│ └─────────────────────────────┘   │
│                                   │
│ Contraseña                        │
│ ┌─────────────────────────────┐   │
│ │ ••••••••• [👁]              │   │ Show/Hide
│ └─────────────────────────────┘   │
│                                   │
│ ┌─────────────────────────────┐   │
│ │      Crear Cuenta →         │   │ Primary CTA
│ └─────────────────────────────┘   │
│                                   │
│ ¿Ya tienes cuenta? Iniciar Sesión │
│                                   │
└───────────────────────────────────┘
```

### Visual Specifications

#### Container Styles
- **Mobile**: Full screen, slide-up animation
- **Desktop**: Centered modal, 480px width
- **Background**: #FFFFFF
- **Backdrop**: rgba(0, 0, 0, 0.5)
- **Border Radius**: 12px (desktop only)
- **Shadow**: 0 20px 25px rgba(0,0,0,0.15)

#### Typography
- **Title**: 24px/32px, 700, #111827
- **Subtitle**: 16px/24px, 400, #6B7280
- **Labels**: 14px/20px, 500, #374151
- **Input Text**: 16px/24px, 400, #111827
- **Legal Text**: 12px/16px, 400, #9CA3AF

#### Form Elements
- **Input Height**: 48px
- **Border**: 1px solid #D1D5DB
- **Border Radius**: 8px
- **Focus Border**: 2px solid #2563EB
- **Error Border**: 2px solid #EF4444
- **Padding**: 12px 16px

#### Buttons
- **Primary CTA**:
  - Background: #2563EB
  - Text: #FFFFFF, 16px, 600
  - Hover: #1D4ED8
  - Active: #1E40AF
  - Disabled: #9CA3AF

- **OAuth Button**:
  - Background: #FFFFFF
  - Border: 1px solid #D1D5DB
  - Text: #374151, 16px, 500
  - Hover: Background #F9FAFB

### Interaction States

#### Field Validation
```typescript
interface ValidationRules {
  email: {
    required: true;
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    message: 'Ingresa un correo válido';
  };
  password: {
    required: true;
    minLength: 8;
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    messages: {
      length: 'Mínimo 8 caracteres';
      complexity: 'Incluye mayúsculas, minúsculas y números';
    };
  };
}
```

#### Error States
```
┌─────────────────────────────┐
│ Correo Electrónico         │
│ ┌─────────────────────────┐ │
│ │ invalido@              │ │ Red border
│ └─────────────────────────┘ │
│ ⚠ Ingresa un correo válido │ Error text (12px, red)
└─────────────────────────────┘
```

#### Loading States
- Button shows spinner: "⟳ Creando cuenta..."
- Inputs disabled during submission
- Modal prevents dismissal
- Progress bar for multi-step

### Existing User Login Flow
```
User enters email → Check if exists
    ↓ (if exists)
Switch to login mode
    ↓
Enter password only
    ↓
Verify credentials
    ↓ (if has tenant profile)
Skip to WhatsApp generation
    ↓ (if no tenant profile)
Continue to Step 2
```

## Step 2: Tenant Profile Creation

### Mobile Layout (Full Screen)
```
┌─────────────────────────────┐
│ ← Paso 1        Paso 2 de 2 │ Progress
├─────────────────────────────┤
│                             │
│  Completa tu Perfil de     │ Title
│  Inquilino                 │
│                             │
│ Este perfil se compartirá   │ Context
│ con los propietarios       │
│                             │
├─────────────────────────────┤
│ INFORMACIÓN PERSONAL        │ Section Header
├─────────────────────────────┤
│                             │
│ Nombre Completo *          │
│ ┌─────────────────────────┐ │
│ │ María García            │ │
│ └─────────────────────────┘ │
│                             │
│ Teléfono *                 │
│ ┌────┐ ┌─────────────────┐ │
│ │+504│ │ 9999-9999       │ │
│ └────┘ └─────────────────┘ │
│                             │
│ Ocupación *                │
│ ┌─────────────────────────┐ │
│ │ Ingeniera en Sistemas  │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ PREFERENCIAS DE BÚSQUEDA   │ Section Header
├─────────────────────────────┤
│                             │
│ Presupuesto Mensual *      │
│ Mínimo        Máximo       │
│ ┌──────────┐ ┌──────────┐  │
│ │L. 10,000 │ │L. 20,000 │  │
│ └──────────┘ └──────────┘  │
│                             │
│ Fecha de Mudanza *         │
│ ┌─────────────────────────┐ │
│ │ 📅 1 de Febrero, 2025  │ │
│ └─────────────────────────┘ │
│                             │
│ Número de Ocupantes *      │
│ ┌─────────────────────────┐ │
│ │ 2 adultos             ▼│ │
│ └─────────────────────────┘ │
│                             │
│ Zonas Preferidas           │
│ ┌─────────────────────────┐ │
│ │ + Agregar zona        │ │
│ └─────────────────────────┘ │
│ [Los Próceres ×]           │ Tags
│ [Lomas del Guijarro ×]     │
│                             │
│ Tipo de Propiedad          │
│ ☑ Apartamento              │
│ ☑ Casa                     │
│ ☐ Habitación               │
│                             │
├─────────────────────────────┤
│ INFORMACIÓN ADICIONAL      │ Section Header
├─────────────────────────────┤
│                             │
│ Mascotas                   │
│ ○ No tengo mascotas        │
│ ● Sí, tengo mascotas       │
│   ┌───────────────────┐    │
│   │ 1 perro pequeño  │    │
│   └───────────────────┘    │
│                             │
│ Referencias disponibles    │
│ ☑ Puedo proporcionar refs. │
│                             │
│ Mensaje para propietarios  │
│ ┌─────────────────────────┐ │
│ │ Soy una persona        │ │
│ │ responsable, busco un  │ │
│ │ lugar tranquilo...     │ │
│ │                        │ │
│ └─────────────────────────┘ │
│ 0/200 caracteres           │
│                             │
├─────────────────────────────┤
│                             │
│ [Crear Perfil y Contactar] │ Primary CTA
│                             │
│ Al crear tu perfil, este   │ Disclaimer
│ se compartirá con los      │
│ propietarios que contactes │
│                             │
└─────────────────────────────┘
```

### Desktop Layout (Modal: 600px)
```
┌─────────────────────────────────────┐
│   Completa tu Perfil       [X]     │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────┬───────────────────┐ │
│ │             │                   │ │
│ │ Información │ Preferencias      │ │ Two-column
│ │ Personal    │ de Búsqueda       │ │ layout
│ │             │                   │ │
│ │ Nombre *    │ Presupuesto *     │ │
│ │ [········] │ [····] - [····]   │ │
│ │             │                   │ │
│ │ Teléfono *  │ Fecha Mudanza *   │ │
│ │ [········] │ [·············]    │ │
│ │             │                   │ │
│ │ Ocupación * │ Ocupantes *       │ │
│ │ [········] │ [·············]    │ │
│ │             │                   │ │
│ │             │ Zonas Preferidas   │ │
│ │             │ [+ Agregar    ]    │ │
│ │             │ [Tag] [Tag] [Tag]  │ │
│ │             │                   │ │
│ └─────────────┴───────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Información Adicional           │ │
│ │                                 │ │
│ │ Mascotas: ○ No  ● Sí [·······] │ │
│ │ ☑ Puedo proporcionar referencias│ │
│ │                                 │ │
│ │ Mensaje (opcional):             │ │
│ │ [···························]  │ │
│ │ [···························]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancelar]  [Crear Perfil →]       │ Actions
│                                     │
└─────────────────────────────────────┘
```

### Form Specifications

#### Input Types & Validation

##### Personal Information
```typescript
interface PersonalInfo {
  fullName: {
    type: 'text';
    required: true;
    minLength: 3;
    maxLength: 100;
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/;
  };

  phone: {
    type: 'tel';
    required: true;
    format: '+504 ####-####';
    validation: /^[0-9]{4}-[0-9]{4}$/;
  };

  occupation: {
    type: 'text';
    required: true;
    maxLength: 50;
    suggestions: [
      'Empleado',
      'Empresario',
      'Estudiante',
      'Profesional independiente'
    ];
  };
}
```

##### Search Preferences
```typescript
interface SearchPreferences {
  budgetMin: {
    type: 'number';
    required: true;
    min: 3000;
    max: 100000;
    step: 500;
  };

  budgetMax: {
    type: 'number';
    required: true;
    min: 3000;
    max: 100000;
    step: 500;
    validation: 'must be > budgetMin';
  };

  moveDate: {
    type: 'date';
    required: true;
    min: 'today';
    max: 'today + 6 months';
  };

  occupants: {
    type: 'select';
    required: true;
    options: [
      '1 adulto',
      '2 adultos',
      '3+ adultos',
      'Familia con niños',
      'Estudiantes'
    ];
  };

  preferredAreas: {
    type: 'tags';
    required: false;
    maxTags: 5;
    autocomplete: true;
    source: '/api/neighborhoods';
  };

  propertyTypes: {
    type: 'checkbox';
    required: true;
    minSelection: 1;
    options: ['Apartamento', 'Casa', 'Habitación'];
  };
}
```

### Interaction Flows

#### Progressive Disclosure
```
Initial Load → Show required fields only
    ↓
User fills required → Enable optional section
    ↓
All required complete → Enable submit button
    ↓
Submit → Validation → Success
```

#### Auto-Save Draft
```javascript
// Save to localStorage every 5 seconds
const saveDraft = debounce(() => {
  localStorage.setItem('tenant_profile_draft', JSON.stringify({
    ...formData,
    timestamp: Date.now()
  }));
}, 5000);

// Restore on return
const restoreDraft = () => {
  const draft = localStorage.getItem('tenant_profile_draft');
  if (draft) {
    const { timestamp, ...data } = JSON.parse(draft);
    if (Date.now() - timestamp < 86400000) { // 24 hours
      setFormData(data);
      showMessage('Continuando donde lo dejaste');
    }
  }
};
```

## Step 3: WhatsApp Integration

### Message Generation
```
┌─────────────────────────────┐
│                             │
│         ✓                   │ Success animation
│                             │
│   ¡Perfil Creado!          │
│                             │
│   Preparando mensaje...     │
│                             │
│   [████████████░░░] 80%    │ Progress
│                             │
│   Abriendo WhatsApp...     │
│                             │
└─────────────────────────────┘
```

### Message Template
```
Hola! 👋 Vi su propiedad en HEUREKKA

🏠 *Propiedad*: [Property Title]
📍 *Ubicación*: [Property Location]
💰 *Precio*: L.[Price]/mes

*Mi perfil de inquilino:*
👤 *Nombre*: [Full Name]
💼 *Ocupación*: [Occupation]
💰 *Presupuesto*: L.[Min] - L.[Max]
📅 *Fecha mudanza*: [Move Date]
👥 *Ocupantes*: [Occupants]
📍 *Zonas preferidas*: [Areas]
🏘️ *Busco*: [Property Types]
🐾 *Mascotas*: [Pet Info]
✅ *Referencias*: [Available/Not Available]

[Optional Message]

Me gustaría programar una visita. ¿Cuándo sería posible?

_Perfil verificado por HEUREKKA_
```

### WhatsApp Redirect
```typescript
const generateWhatsAppLink = (landlordPhone: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = landlordPhone.replace(/\D/g, '');

  // Handle different platforms
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // Direct WhatsApp app link
    return `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
  } else {
    // WhatsApp Web
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
};
```

## Post-Authentication Experience

### Tenant Dashboard Access
```
After first profile creation:
    ↓
Redirect to Tenant Dashboard
    ↓
Show onboarding tour
    ↓
Display contacted properties
    ↓
Suggest similar properties
```

### Dashboard Features
- **Contact History**: All properties contacted
- **Response Tracking**: Landlord responses
- **Saved Searches**: Alert preferences
- **Profile Management**: Edit/update info
- **Property Recommendations**: Based on preferences

## Responsive Behavior

### Mobile Optimizations
- **Full-screen modals**: Native app feel
- **Touch targets**: Minimum 48px
- **Native inputs**: Date pickers, selects
- **Keyboard management**: Auto-scroll to active field
- **Swipe gestures**: Navigate between steps

### Tablet Adaptations
- **Two-column layouts**: Better space usage
- **Floating modals**: 600px width
- **Landscape support**: Horizontal form layout
- **Split view**: Form + property preview

### Desktop Enhancements
- **Rich interactions**: Hover states, tooltips
- **Keyboard shortcuts**: Tab navigation, Enter submit
- **Multi-window**: Support for multiple tabs
- **Drag-drop**: Photo uploads (future)
- **Quick actions**: Keyboard combinations

## Accessibility Features

### Screen Reader Support
```html
<!-- Proper ARIA labels -->
<form role="form" aria-label="Crear perfil de inquilino">
  <fieldset>
    <legend>Información Personal</legend>
    <label for="name">
      Nombre Completo
      <span aria-label="requerido">*</span>
    </label>
    <input
      id="name"
      aria-required="true"
      aria-describedby="name-error"
    />
    <span id="name-error" role="alert">
      Este campo es requerido
    </span>
  </fieldset>
</form>
```

### Keyboard Navigation
- **Tab Order**: Logical flow through form
- **Focus Indicators**: Visible outline on focus
- **Skip Links**: Jump to main content
- **Escape Key**: Close modals
- **Enter Key**: Submit forms

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant
- **Text Size**: Minimum 14px, scalable
- **Error Indicators**: Not just color
- **Loading States**: Text + visual
- **Icons**: Always with text labels

## Error Handling

### Validation Errors
```typescript
const errorMessages = {
  required: 'Este campo es requerido',
  email: 'Ingresa un correo electrónico válido',
  phone: 'Formato: 9999-9999',
  budget: 'El presupuesto máximo debe ser mayor al mínimo',
  date: 'Selecciona una fecha entre hoy y 6 meses',
  network: 'Error de conexión. Intenta nuevamente',
  server: 'Algo salió mal. Por favor intenta más tarde'
};
```

### Recovery Flows
```
Network Error → Show retry button
    ↓
Save draft locally
    ↓
Allow offline completion
    ↓
Sync when online
```

## Performance Optimizations

### Code Splitting
```javascript
// Lazy load heavy components
const GoogleAuthButton = lazy(() => import('./GoogleAuthButton'));
const DatePicker = lazy(() => import('./DatePicker'));
const AreaAutocomplete = lazy(() => import('./AreaAutocomplete'));
```

### Data Caching
```javascript
// Cache neighborhood data
const neighborhoodCache = new Map();

const getNeighborhoods = async (query) => {
  if (neighborhoodCache.has(query)) {
    return neighborhoodCache.get(query);
  }

  const data = await fetch(`/api/neighborhoods?q=${query}`);
  neighborhoodCache.set(query, data);
  return data;
};
```

## Analytics Events

### Funnel Tracking
```javascript
// Step progression
analytics.track('tenant_auth_started', { trigger });
analytics.track('tenant_auth_completed', { method });
analytics.track('tenant_profile_started');
analytics.track('tenant_profile_field_completed', { field });
analytics.track('tenant_profile_completed', { timeSpent });
analytics.track('whatsapp_message_generated');
analytics.track('whatsapp_opened', { propertyId });

// Error tracking
analytics.track('tenant_auth_error', { error, field });
analytics.track('tenant_profile_abandoned', { lastField, timeSpent });
```

## Implementation Checklist

### Phase 1: Authentication
- [ ] Create base modal component
- [ ] Implement email/password validation
- [ ] Add Google OAuth integration
- [ ] Handle existing user detection
- [ ] Create session management

### Phase 2: Profile Creation
- [ ] Build multi-step form component
- [ ] Add field validations
- [ ] Implement auto-save draft
- [ ] Create area autocomplete
- [ ] Add date picker

### Phase 3: WhatsApp Integration
- [ ] Generate message template
- [ ] Handle phone number formatting
- [ ] Create redirect logic
- [ ] Track message sends
- [ ] Handle errors

### Phase 4: Polish
- [ ] Add loading states
- [ ] Implement error recovery
- [ ] Create success animations
- [ ] Add accessibility features
- [ ] Optimize performance

---

*Feature Version: 1.0.0 | Last Updated: January 29, 2025*