---
title: Landlord Authentication Flow
description: Complete design specifications for landlord-intent authentication and profile creation
feature: user-authentication
last-updated: 2025-01-29
version: 1.0.0
related-files:
  - design-documentation/features/user-authentication/README.md
  - design-documentation/features/user-authentication/tenant-authentication.md
  - design-documentation/features/property-listing-management/README.md
  - design-documentation/features/landlord-dashboard/README.md
status: draft
---

# Landlord Authentication Flow

## Overview

The Landlord Authentication Flow activates when users express intent to list properties on HEUREKKA. This sophisticated multi-path system adapts to different landlord types - individual owners, real estate agents, and property management companies - ensuring each gets a tailored onboarding experience that captures relevant business information.

## User Journey

### Entry Points

#### Primary Triggers
1. **Navigation Bar**: "Publicar Propiedad" button
2. **Homepage Hero**: "Anunciar mi Propiedad" CTA
3. **Footer**: "Convertirme en Anunciante" link
4. **Landlord Landing Page**: "Empezar Ahora" button
5. **Dashboard Prompt**: "Agregar Primera Propiedad"

#### Context Preservation
```typescript
interface LandlordAuthContext {
  trigger: 'list_property' | 'landlord_landing' | 'dashboard_prompt';
  intendedAction: 'single_listing' | 'bulk_upload' | 'explore';
  referralSource?: string;
  campaignId?: string;
  returnUrl: string;
  timestamp: Date;
}
```

## Screen Specifications

## Step 1: Authentication Modal

### Mobile Layout (Full Screen)
```
┌─────────────────────────────┐
│ ← Cancelar                  │ Header (56px)
├─────────────────────────────┤
│                             │
│     HEUREKKA               │ Logo (32px)
│     para Propietarios       │ Subtitle
│                             │
├─────────────────────────────┤
│                             │
│  Publica tu Propiedad       │ Title (24px, bold)
│  y Recibe Inquilinos        │
│  Calificados               │
│                             │
│ ┌─────────────────────────┐ │ Value Props Box
│ │ ✓ Inquilinos verificados│ │ (Background: #F0F9FF)
│ │ ✓ Perfil completo       │ │
│ │ ✓ WhatsApp directo      │ │
│ │ ✓ Dashboard de leads    │ │
│ └─────────────────────────┘ │
│                             │
│ Miles de propietarios       │ Social Proof
│ confían en HEUREKKA        │ (14px, gray)
│                             │
├─────────────────────────────┤
│                             │
│ [G] Continuar con Google   │ OAuth Button (48px)
│                             │
│ ──────── o ────────        │ Divider
│                             │
│ Correo Electrónico *       │ Label (14px)
│ ┌─────────────────────────┐ │
│ │ propietario@email.com  │ │ Input (48px)
│ └─────────────────────────┘ │
│                             │
│ Contraseña *               │
│ ┌─────────────────────────┐ │
│ │ ••••••••               │ │ Input (48px)
│ └─────────────────────────┘ │
│ Mínimo 8 caracteres        │ Helper text
│                             │
│ [Crear Cuenta →]           │ Primary CTA (48px)
│                             │
│ ¿Ya publicas con nosotros? │ Link (14px)
│ Iniciar Sesión             │
│                             │
│ Al continuar, aceptas los  │ Legal (12px)
│ Términos para Anunciantes  │
│                             │
└─────────────────────────────┘
```

### Desktop Layout (Modal: 520px)
```
┌─────────────────────────────────────┐
│     Únete como Anunciante    [X]   │ Modal Header
├─────────────────────────────────────┤
│                                     │
│   [LOGO] HEUREKKA Business         │ Branding
│                                     │
│   La Plataforma #1 para             │ Title (24px)
│   Alquilar en Tegucigalpa           │
│                                     │
│ ┌─────────────────────────────────┐ │ Stats Box
│ │  📊 Estadísticas de la Plataforma│ │ (Background: #F9FAFB)
│ │                                  │ │
│ │  • 10,000+ inquilinos activos   │ │
│ │  • 500+ propiedades alquiladas  │ │
│ │  • 48hr promedio para alquilar  │ │
│ │  • 95% satisfacción             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [G] Registrarse con Google     │ │ OAuth (48px)
│ └─────────────────────────────────┘ │
│                                     │
│ ──────────── o ────────────────    │
│                                     │
│ Correo Electrónico Empresarial     │
│ ┌─────────────────────────────────┐ │
│ │ nombre@empresa.com             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Contraseña                         │
│ ┌─────────────────────────────────┐ │
│ │ •••••••••••• [👁]              │ │ Show/Hide
│ └─────────────────────────────────┘ │
│ ✓ Mínimo 8 caracteres              │ Validation
│ ✓ Una mayúscula y un número        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    Crear Cuenta Empresarial →  │ │ Primary CTA
│ └─────────────────────────────────┘ │
│                                     │
│ ¿Ya tienes cuenta? Iniciar Sesión  │
│                                     │
│ 🔒 Tus datos están seguros         │ Security badge
│                                     │
└─────────────────────────────────────┘
```

## Step 2: Landlord Type Selection

### Mobile Layout (Full Screen)
```
┌─────────────────────────────┐
│ ← Atrás         Paso 2 de 3 │ Progress
├─────────────────────────────┤
│                             │
│  ¿Cómo te describes?        │ Title (24px)
│                             │
│  Esto nos ayuda a           │ Subtitle
│  personalizar tu experiencia│
│                             │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │ Option 1
│ │    🏠                   │ │
│ │  Propietario Individual │ │ (Border: 2px)
│ │                         │ │ (Selectable)
│ │  Alquilo mi propia     │ │
│ │  propiedad             │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │ Option 2
│ │    👔                   │ │
│ │  Agente Inmobiliario   │ │
│ │                         │ │
│ │  Gestiono propiedades  │ │
│ │  para clientes         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │ Option 3
│ │    🏢                   │ │
│ │  Empresa Inmobiliaria  │ │
│ │                         │ │
│ │  Representamos múltiples│ │
│ │  propiedades y clientes│ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│                             │
│ [Continuar →]              │ CTA (disabled)
│                             │ until selection
└─────────────────────────────┘
```

### Selection States
```typescript
enum LandlordType {
  INDIVIDUAL = 'individual_owner',
  AGENT = 'real_estate_agent',
  COMPANY = 'property_company'
}

// Visual feedback for selection
.option-card {
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.option-card.selected {
  border-color: #2563EB;
  background: #EFF6FF;
  transform: scale(1.02);
}

.option-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

## Step 3A: Individual Owner Profile

### Mobile Layout
```
┌─────────────────────────────┐
│ ← Atrás         Paso 3 de 3 │
├─────────────────────────────┤
│                             │
│  Información Personal       │ Title
│                             │
├─────────────────────────────┤
│                             │
│ Nombre Completo *          │
│ ┌─────────────────────────┐ │
│ │ Juan Pérez              │ │
│ └─────────────────────────┘ │
│                             │
│ Teléfono de Contacto *     │
│ ┌────┐ ┌─────────────────┐ │
│ │+504│ │ 9999-9999       │ │
│ └────┘ └─────────────────┘ │
│ Los inquilinos te           │ Helper text
│ contactarán aquí           │
│                             │
│ Número de Propiedades      │
│ ┌─────────────────────────┐ │
│ │ Solo una              ▼│ │ Dropdown
│ └─────────────────────────┘ │
│                             │
│ Ubicación de la Propiedad  │
│ ┌─────────────────────────┐ │
│ │ Los Próceres         ▼│ │
│ └─────────────────────────┘ │
│                             │
│ ¿Por qué alquilas?         │ Optional
│ ○ Inversión                │
│ ● Mudanza temporal         │
│ ○ Propiedad heredada       │
│ ○ Otro                     │
│                             │
│ □ Acepto verificación de   │ Checkbox
│   identidad                │
│                             │
├─────────────────────────────┤
│                             │
│ [Crear Perfil y Continuar] │ Primary CTA
│                             │
└─────────────────────────────┘
```

## Step 3B: Real Estate Agent Profile

### Mobile Layout
```
┌─────────────────────────────┐
│ ← Atrás         Paso 3 de 3 │
├─────────────────────────────┤
│                             │
│  Perfil de Agente          │ Title
│                             │
├─────────────────────────────┤
│ INFORMACIÓN PERSONAL        │ Section
├─────────────────────────────┤
│                             │
│ Nombre Completo *          │
│ ┌─────────────────────────┐ │
│ │ Ana Martínez           │ │
│ └─────────────────────────┘ │
│                             │
│ Teléfono Profesional *     │
│ ┌────┐ ┌─────────────────┐ │
│ │+504│ │ 9999-9999       │ │
│ └────┘ └─────────────────┘ │
│                             │
│ WhatsApp Business          │
│ ┌────┐ ┌─────────────────┐ │
│ │+504│ │ 8888-8888       │ │
│ └────┘ └─────────────────┘ │
│                             │
├─────────────────────────────┤
│ INFORMACIÓN PROFESIONAL    │ Section
├─────────────────────────────┤
│                             │
│ Tipo de Agente *           │
│ ● Independiente            │ Radio buttons
│ ○ Trabajo para una empresa │
│                             │
│ [If Empresa selected:]     │ Conditional
│ Nombre de la Empresa       │
│ ┌─────────────────────────┐ │
│ │ RE/MAX Honduras        │ │
│ └─────────────────────────┘ │
│                             │
│ Años de Experiencia *      │
│ ┌─────────────────────────┐ │
│ │ 5-10 años            ▼│ │
│ └─────────────────────────┘ │
│                             │
│ Número de Colegiación      │ Optional
│ ┌─────────────────────────┐ │
│ │ AHCI-12345            │ │
│ └─────────────────────────┘ │
│                             │
│ Especialización            │
│ ☑ Residencial              │ Checkboxes
│ ☑ Comercial                │
│ ☐ Industrial               │
│                             │
│ Zonas de Cobertura *       │
│ ┌─────────────────────────┐ │
│ │ + Agregar zona        │ │
│ └─────────────────────────┘ │
│ [Tegucigalpa ×]            │ Tags
│ [Comayagüela ×]            │
│                             │
│ Número de Propiedades      │
│ en Gestión *               │
│ ┌─────────────────────────┐ │
│ │ 10-20 propiedades    ▼│ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ VERIFICACIÓN               │ Section
├─────────────────────────────┤
│                             │
│ Sube tu Credencial (opc.)  │
│ ┌─────────────────────────┐ │
│ │  📷 Subir foto         │ │ Upload
│ │     de credencial      │ │
│ └─────────────────────────┘ │
│ Ganarás insignia verificado│
│                             │
│ Redes Sociales Profesionales│
│ ┌─────────────────────────┐ │
│ │ fb.com/anamartinez    │ │ Facebook
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ @ana_bienes_raices    │ │ Instagram
│ └─────────────────────────┘ │
│                             │
│ Bio Profesional            │
│ ┌─────────────────────────┐ │
│ │ Especialista en        │ │ Textarea
│ │ propiedades            │ │
│ │ residenciales con      │ │
│ │ más de 10 años...     │ │
│ └─────────────────────────┘ │
│ 0/300 caracteres           │
│                             │
│ □ Acepto los términos para │ Legal
│   agentes inmobiliarios    │
│                             │
├─────────────────────────────┤
│                             │
│ [Crear Perfil de Agente →] │ Primary CTA
│                             │
└─────────────────────────────┘
```

## Step 3C: Company Profile

### Mobile Layout
```
┌─────────────────────────────┐
│ ← Atrás         Paso 3 de 3 │
├─────────────────────────────┤
│                             │
│  Perfil Empresarial        │ Title
│                             │
├─────────────────────────────┤
│ INFORMACIÓN DE LA EMPRESA  │ Section
├─────────────────────────────┤
│                             │
│ Nombre de la Empresa *     │
│ ┌─────────────────────────┐ │
│ │ Bienes Raíces Honduras │ │
│ └─────────────────────────┘ │
│                             │
│ RTN de la Empresa *        │
│ ┌─────────────────────────┐ │
│ │ 0801199912345         │ │
│ └─────────────────────────┘ │
│                             │
│ Tipo de Empresa *          │
│ ┌─────────────────────────┐ │
│ │ Inmobiliaria         ▼│ │
│ └─────────────────────────┘ │
│ • Inmobiliaria             │ Options
│ • Constructora             │
│ • Administradora           │
│ • Desarrolladora           │
│                             │
│ Año de Fundación          │
│ ┌─────────────────────────┐ │
│ │ 2015                 ▼│ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ INFORMACIÓN DE CONTACTO    │ Section
├─────────────────────────────┤
│                             │
│ Teléfono Principal *       │
│ ┌────┐ ┌─────────────────┐ │
│ │+504│ │ 2222-2222       │ │
│ └────┘ └─────────────────┘ │
│                             │
│ WhatsApp Business *        │
│ ┌────┐ ┌─────────────────┐ │
│ │+504│ │ 9999-9999       │ │
│ └────┘ └─────────────────┘ │
│                             │
│ Correo de Contacto        │
│ ┌─────────────────────────┐ │
│ │ info@bieneshn.com     │ │
│ └─────────────────────────┘ │
│                             │
│ Sitio Web                  │
│ ┌─────────────────────────┐ │
│ │ www.bieneshn.com      │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ UBICACIÓN                  │ Section
├─────────────────────────────┤
│                             │
│ Dirección de Oficina *     │
│ ┌─────────────────────────┐ │
│ │ Boulevard Morazán,     │ │
│ │ Torre Empresarial      │ │
│ └─────────────────────────┘ │
│                             │
│ Ciudad *                   │
│ ┌─────────────────────────┐ │
│ │ Tegucigalpa          ▼│ │
│ └─────────────────────────┘ │
│                             │
│ Zonas de Operación *       │
│ ┌─────────────────────────┐ │
│ │ + Agregar zona        │ │
│ └─────────────────────────┘ │
│ [Tegucigalpa ×]            │
│ [San Pedro Sula ×]         │
│ [La Ceiba ×]               │
│                             │
├─────────────────────────────┤
│ PORTAFOLIO                 │ Section
├─────────────────────────────┤
│                             │
│ Número de Propiedades *    │
│ ┌─────────────────────────┐ │
│ │ 50-100 propiedades   ▼│ │
│ └─────────────────────────┘ │
│                             │
│ Tipos de Propiedades       │
│ ☑ Residencial              │
│ ☑ Comercial                │
│ ☑ Industrial               │
│ ☐ Terrenos                 │
│                             │
│ Rango de Precios          │
│ Desde         Hasta       │
│ ┌──────────┐ ┌──────────┐ │
│ │L. 5,000  │ │L. 100,000│ │
│ └──────────┘ └──────────┘ │
│                             │
├─────────────────────────────┤
│ DOCUMENTACIÓN              │ Section
├─────────────────────────────┤
│                             │
│ Logo de la Empresa         │
│ ┌─────────────────────────┐ │
│ │  📷 Subir logo         │ │
│ │  (PNG, JPG, 2MB max)   │ │
│ └─────────────────────────┘ │
│                             │
│ Licencia de Operación      │
│ ┌─────────────────────────┐ │
│ │  📄 Subir documento    │ │
│ │  (PDF, 5MB max)        │ │
│ └─────────────────────────┘ │
│                             │
│ Descripción de la Empresa  │
│ ┌─────────────────────────┐ │
│ │ Somos líderes en el    │ │
│ │ mercado inmobiliario   │ │
│ │ de Honduras con más    │ │
│ │ de 10 años...         │ │
│ └─────────────────────────┘ │
│ 0/500 caracteres           │
│                             │
│ □ Autorizo verificación    │ Legal
│   de documentos            │
│ □ Acepto términos          │
│   comerciales              │
│                             │
├─────────────────────────────┤
│                             │
│ [Crear Perfil Empresarial] │ Primary CTA
│                             │
└─────────────────────────────┘
```

### Desktop Layout (Modal: 800px, Two-column)
```
┌───────────────────────────────────────────────┐
│      Perfil Empresarial              [X]     │
├───────────────────────────────────────────────┤
│                                               │
│ ┌──────────────────┬────────────────────────┐ │
│ │                  │                        │ │
│ │ Información      │ Contacto y Ubicación   │ │
│ │ Empresarial      │                        │ │
│ │                  │                        │ │
│ │ Nombre *         │ Teléfono *             │ │
│ │ [············]   │ [···············]      │ │
│ │                  │                        │ │
│ │ RTN *            │ WhatsApp *             │ │
│ │ [············]   │ [···············]      │ │
│ │                  │                        │ │
│ │ Tipo *           │ Email                  │ │
│ │ [Inmobiliaria▼]  │ [···············]      │ │
│ │                  │                        │ │
│ │ Año Fundación    │ Sitio Web              │ │
│ │ [2015 ▼]         │ [···············]      │ │
│ │                  │                        │ │
│ │                  │ Dirección *            │ │
│ │                  │ [···············]      │ │
│ │                  │ [···············]      │ │
│ │                  │                        │ │
│ │                  │ Zonas de Operación *   │ │
│ │                  │ [+ Agregar]            │ │
│ │                  │ [Tag] [Tag] [Tag]      │ │
│ │                  │                        │ │
│ └──────────────────┴────────────────────────┘ │
│                                               │
│ ┌────────────────────────────────────────────┐ │
│ │ Portafolio y Documentación                │ │
│ │                                            │ │
│ │ Propiedades: [50-100 ▼]  Tipos: ☑☑☐☐     │ │
│ │                                            │ │
│ │ Rango: L.[····] - L.[····]                │ │
│ │                                            │ │
│ │ [📷 Logo] [📄 Licencia]                    │ │
│ │                                            │ │
│ │ Descripción:                               │ │
│ │ [······································]   │ │
│ │ [······································]   │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
│                                               │
│ ☑ Autorizo verificación  ☑ Acepto términos   │
│                                               │
│ [Cancelar]        [Crear Perfil Empresarial] │
│                                               │
└───────────────────────────────────────────────┘
```

## Post-Profile Creation Flow

### Success State & Redirect
```
┌─────────────────────────────┐
│                             │
│         ✓                   │ Success animation
│                             │
│   ¡Perfil Creado!          │
│                             │
│   Redirigiendo al          │
│   Asistente de Publicación  │
│                             │
│   [████████████░░] 90%     │ Progress
│                             │
└─────────────────────────────┘
```

### Property Listing Wizard Entry
```typescript
// After successful profile creation
const handleProfileSuccess = async (profileType: LandlordType) => {
  // Save profile to database
  await saveProfile(profileData);

  // Track conversion
  analytics.track('landlord_profile_created', {
    type: profileType,
    timeToComplete: Date.now() - startTime
  });

  // Redirect based on type
  switch(profileType) {
    case 'individual_owner':
      router.push('/listing/create?type=single');
      break;
    case 'real_estate_agent':
      router.push('/dashboard/agent?onboarding=true');
      break;
    case 'property_company':
      router.push('/dashboard/company?import=true');
      break;
  }
};
```

## Landlord Dashboard Access

### Dashboard Features by Type

#### Individual Owner Dashboard
```
Features:
├── Single Property Management
├── Lead Inbox (simplified)
├── WhatsApp Quick Responses
├── Basic Analytics
└── Payment History
```

#### Agent Dashboard
```
Features:
├── Multi-Property Management
├── Advanced Lead Filtering
├── Client Management
├── Commission Tracking
├── Performance Analytics
├── Marketing Tools
└── Calendar Integration
```

#### Company Dashboard
```
Features:
├── Portfolio Overview
├── Team Management
├── Lead Assignment
├── Advanced Analytics
├── Bulk Operations
├── API Access
├── Custom Branding
├── Export/Import Tools
└── Financial Reports
```

## Form Validation Rules

### Individual Owner Validation
```typescript
const individualValidation = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  phone: {
    required: true,
    pattern: /^[0-9]{4}-[0-9]{4}$/
  },
  propertyCount: {
    required: true,
    options: ['1', '2-5', '6-10', '10+']
  },
  location: {
    required: true,
    autocomplete: true
  }
};
```

### Agent Validation
```typescript
const agentValidation = {
  // Personal
  name: { required: true },
  phone: { required: true },
  whatsapp: { required: false },

  // Professional
  agentType: { required: true },
  companyName: {
    required: (data) => data.agentType === 'company',
    conditional: true
  },
  experience: { required: true },
  licenseNumber: {
    required: false,
    pattern: /^AHCI-[0-9]{5}$/
  },
  specialization: {
    required: true,
    minSelection: 1
  },
  coverage: {
    required: true,
    minTags: 1,
    maxTags: 10
  },

  // Verification
  credential: {
    required: false,
    fileTypes: ['image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};
```

### Company Validation
```typescript
const companyValidation = {
  // Company Info
  companyName: { required: true },
  rtn: {
    required: true,
    pattern: /^[0-9]{14}$/
  },
  companyType: { required: true },
  foundedYear: {
    required: false,
    min: 1900,
    max: new Date().getFullYear()
  },

  // Contact
  mainPhone: { required: true },
  whatsappBusiness: { required: true },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  website: {
    required: false,
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  },

  // Location
  officeAddress: { required: true },
  city: { required: true },
  operationZones: {
    required: true,
    minTags: 1
  },

  // Portfolio
  propertyCount: { required: true },
  propertyTypes: {
    required: true,
    minSelection: 1
  },
  priceRange: {
    min: { required: true, min: 1000 },
    max: { required: true, min: 1000 }
  },

  // Documentation
  logo: {
    required: false,
    fileTypes: ['image/jpeg', 'image/png'],
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  license: {
    required: false,
    fileTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};
```

## Responsive Behavior

### Mobile Optimizations
- **Full-screen modals**: Native app experience
- **Step-by-step flow**: One section at a time
- **Touch-friendly**: 48px minimum targets
- **Auto-capitalization**: Smart text inputs
- **Camera access**: Direct photo upload
- **Offline support**: Save drafts locally

### Tablet Adaptations
- **Two-column forms**: Better space usage
- **Side-by-side fields**: Related inputs grouped
- **Floating keyboard**: Form adjusts to keyboard
- **Landscape mode**: Horizontal layouts
- **Split view**: Form + preview

### Desktop Enhancements
- **Multi-column layouts**: Efficient data entry
- **Inline validation**: Real-time feedback
- **Keyboard navigation**: Tab through fields
- **Drag-drop uploads**: Files and images
- **Bulk operations**: Multiple properties
- **Rich text editor**: Descriptions

## Accessibility Features

### Screen Reader Support
```html
<form role="form" aria-label="Crear perfil de propietario">
  <fieldset>
    <legend>Selecciona tu tipo de cuenta</legend>

    <input
      type="radio"
      id="individual"
      name="accountType"
      value="individual"
      aria-describedby="individual-desc"
    />
    <label for="individual">
      Propietario Individual
      <span id="individual-desc" class="sr-only">
        Para personas que alquilan su propia propiedad
      </span>
    </label>
  </fieldset>
</form>
```

### Keyboard Navigation
- **Tab order**: Logical field progression
- **Radio groups**: Arrow key navigation
- **Dropdowns**: Type to search
- **File uploads**: Enter to trigger
- **Form submission**: Enter in last field

### Visual Accessibility
- **Focus indicators**: 2px blue outline
- **Error states**: Icon + color + text
- **Required fields**: Asterisk + aria-required
- **Helper text**: Associated with fields
- **Progress indicators**: Text + visual

## Error Handling

### Network Errors
```typescript
const handleNetworkError = (error: NetworkError) => {
  // Save form data locally
  localStorage.setItem('landlord_draft', JSON.stringify(formData));

  // Show user-friendly message
  showError({
    title: 'Sin conexión',
    message: 'Tu información se guardó. Intenta nuevamente cuando tengas conexión.',
    action: {
      label: 'Reintentar',
      handler: () => retrySubmission()
    }
  });
};
```

### Validation Errors
```typescript
const validationMessages = {
  required: 'Este campo es obligatorio',
  rtn: 'RTN debe tener 14 dígitos',
  phone: 'Formato: 9999-9999',
  email: 'Correo electrónico inválido',
  website: 'URL inválida (ejemplo: www.empresa.com)',
  fileSize: 'Archivo muy grande (máximo {maxSize}MB)',
  fileType: 'Tipo de archivo no permitido'
};
```

### Recovery Flows
```
Form Error → Highlight fields
    ↓
Show specific error messages
    ↓
Focus first error field
    ↓
Allow correction
    ↓
Re-validate on submit
```

## Performance Optimizations

### Lazy Loading
```javascript
// Load heavy components only when needed
const CompanyForm = lazy(() => import('./forms/CompanyForm'));
const FileUploader = lazy(() => import('./components/FileUploader'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
```

### Progressive Enhancement
```javascript
// Start with basic form, enhance with features
useEffect(() => {
  // Add autocomplete
  if ('geolocation' in navigator) {
    enableLocationAutocomplete();
  }

  // Add camera upload
  if ('mediaDevices' in navigator) {
    enableCameraUpload();
  }

  // Add drag-drop
  if ('draggable' in document.createElement('div')) {
    enableDragDrop();
  }
}, []);
```

## Analytics & Tracking

### Conversion Funnel
```javascript
// Track each step
analytics.track('landlord_auth_started', { trigger });
analytics.track('landlord_type_selected', { type });
analytics.track('landlord_profile_started', { type });
analytics.track('landlord_field_completed', { field, type });
analytics.track('landlord_profile_completed', { type, timeSpent });
analytics.track('landlord_listing_started', { fromProfile: true });

// Track drop-offs
analytics.track('landlord_auth_abandoned', { step, reason });
analytics.track('landlord_profile_error', { field, error });
```

### A/B Testing Opportunities
- Single vs multi-step profile creation
- Required vs optional fields
- Upload documents now vs later
- Verification badge messaging
- Social proof placement

## Implementation Checklist

### Phase 1: Core Authentication
- [ ] Create landlord auth modal
- [ ] Implement email/password flow
- [ ] Add Google OAuth for business
- [ ] Handle existing user detection
- [ ] Create session management

### Phase 2: Type Selection
- [ ] Build type selection screen
- [ ] Create visual card components
- [ ] Add selection animations
- [ ] Implement routing logic
- [ ] Save type to profile

### Phase 3: Profile Forms
- [ ] Individual owner form
- [ ] Agent form with conditionals
- [ ] Company form with uploads
- [ ] Field validations
- [ ] Auto-save drafts

### Phase 4: Integration
- [ ] Connect to property listing
- [ ] Create dashboard routing
- [ ] Implement role-based access
- [ ] Add verification systems
- [ ] Track analytics

### Phase 5: Polish
- [ ] Loading states
- [ ] Error recovery
- [ ] Success animations
- [ ] Accessibility audit
- [ ] Performance optimization

## Success Metrics

### Target KPIs
- **Signup Conversion**: >70% completion
- **Profile Completion**: >80% fill all fields
- **Time to Complete**: <5 minutes average
- **Verification Rate**: >50% upload documents
- **Listing Creation**: >90% create first listing

---

*Feature Version: 1.0.0 | Last Updated: January 29, 2025*