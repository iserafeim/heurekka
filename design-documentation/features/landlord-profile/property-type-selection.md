---
title: Property Type Selection and Landlord Classification
description: Different landlord types and their specialized flows
feature: landlord-profile
last-updated: 2025-01-29
version: 1.0.0
related-files:
  - ./README.md
  - ./landlord-onboarding.md
  - ./verification-levels.md
dependencies:
  - Profile creation system
  - Type-specific features
status: approved
---

# Property Type Selection

## Overview
The property type selection system classifies landlords into three distinct categories, each with tailored features, interfaces, and capabilities. This classification happens during onboarding and determines the user's experience throughout the platform.

## Table of Contents
1. [Landlord Type Overview](#landlord-type-overview)
2. [Individual Owner Flow](#individual-owner-flow)
3. [Real Estate Agent Flow](#real-estate-agent-flow)
4. [Property Management Company Flow](#property-management-company-flow)
5. [Branching Logic](#branching-logic)
6. [Type-Specific Features](#type-specific-features)
7. [UI Adaptations](#ui-adaptations)
8. [Type Migration](#type-migration)

## Landlord Type Overview

### Classification Matrix
| Type | Properties | Features | Verification | Interface |
|------|------------|----------|--------------|-----------|
| Individual | 1-5 | Basic | Standard | Simplified |
| Agent | 6-50 | Professional | Enhanced | Advanced |
| Company | 50+ | Enterprise | Premium | Custom |

### Selection Screen
**Screen: Choose Your Type**
```
┌─────────────────────────────────┐
│ ← Selecciona tu Tipo            │
│                                 │
│ Esta selección personaliza tu   │
│ experiencia en la plataforma    │
│                                 │
│ ╭─────────────────────────────╮ │
│ │      Individual Owner       │ │
│ │         Selected           │ │
│ ╰─────────────────────────────╯ │
│                                 │
│ ¿Qué incluye?                   │
│ ✓ Gestión personal              │
│ ✓ Hasta 5 propiedades           │
│ ✓ Comunicación directa          │
│ ✓ Panel simplificado            │
│                                 │
│ ¿Puedo cambiar después?         │
│ Sí, puedes actualizar tu tipo   │
│ cuando lo necesites             │
│                                 │
│ [Confirmar Selección] (Primary) │
└─────────────────────────────────┘
```

## Individual Owner Flow

### Profile Structure
```
Individual Owner Profile
├── Personal Information
│   ├── Full Name (Required)
│   ├── Phone Number (Required)
│   ├── Email (From auth)
│   ├── WhatsApp (Optional)
│   └── Profile Photo (Recommended)
├── Location Data
│   ├── Primary Address
│   ├── Service Area
│   └── Neighborhood Knowledge
├── Property Portfolio
│   ├── Number of Properties (1-5)
│   ├── Property Types
│   └── Management Style
└── Preferences
    ├── Communication Method
    ├── Availability Hours
    └── Language Preferences
```

### Onboarding Screens

#### Screen 1: Welcome
```
┌─────────────────────────────────┐
│                                 │
│      👤                         │
│                                 │
│ Propietario Individual          │
│                                 │
│ Perfecto para dueños que        │
│ gestionan sus propias           │
│ propiedades                     │
│                                 │
│ Configuración en 3 minutos      │
│                                 │
│ [Comenzar] (Primary)            │
└─────────────────────────────────┘
```

#### Screen 2: Basic Information
```
┌─────────────────────────────────┐
│ ← Información Personal    ●○○○  │
│                                 │
│ Tu Nombre *                     │
│ ┌─────────────────────────────┐ │
│ │ Carlos Mendoza              │ │
│ └─────────────────────────────┘ │
│                                 │
│ WhatsApp                        │
│ ┌─────────────────────────────┐ │
│ │ +504 9999-9999              │ │
│ └─────────────────────────────┘ │
│ ℹ️ Los inquilinos prefieren     │
│    WhatsApp para contacto       │
│                                 │
│ ¿Cuántas propiedades tienes?   │
│ [1] [2] [3] [4] [5+]           │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 3: Property Details
```
┌─────────────────────────────────┐
│ ← Tus Propiedades         ○●○○  │
│                                 │
│ Tipo de propiedades             │
│ (Selecciona todas)              │
│                                 │
│ ☑ Casa completa                 │
│ ☐ Apartamento                   │
│ ☑ Habitación                    │
│ ☐ Local comercial               │
│ ☐ Oficina                       │
│                                 │
│ Ubicación principal             │
│ ┌─────────────────────────────┐ │
│ │ Col. Kennedy, Tegucigalpa   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 4: Communication Preferences
```
┌─────────────────────────────────┐
│ ← Preferencias            ○○●○  │
│                                 │
│ ¿Cómo prefieres que te          │
│ contacten?                      │
│                                 │
│ ○ WhatsApp (Recomendado)        │
│ ○ Llamada telefónica            │
│ ○ Mensajes en plataforma        │
│                                 │
│ Horario de atención             │
│ ┌─────────────────────────────┐ │
│ │ Desde: 08:00 AM             │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Hasta: 06:00 PM             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Días disponibles                │
│ [L] [M] [M] [J] [V] [S] [D]    │
│                                 │
│ [Finalizar] (Primary)           │
└─────────────────────────────────┘
```

### Dashboard Customization
```
┌─────────────────────────────────┐
│ Dashboard Personal              │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Mis 3 Propiedades           │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│ │ │     │ │     │ │     │   │ │
│ │ └─────┘ └─────┘ └─────┘   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Nuevos Mensajes (5)             │
│ ┌─────────────────────────────┐ │
│ │ • María - Casa Kennedy      │ │
│ │ • Juan - Apto Centro        │ │
│ └─────────────────────────────┘ │
│                                 │
│ Acciones Rápidas                │
│ [+ Nueva Propiedad]             │
│ [📊 Ver Estadísticas]           │
└─────────────────────────────────┘
```

## Real Estate Agent Flow

### Profile Structure
```
Real Estate Agent Profile
├── Professional Information
│   ├── License Number (Required)
│   ├── License Expiry
│   ├── Years of Experience
│   ├── Specializations
│   └── Certifications
├── Agency Affiliation
│   ├── Agency Name
│   ├── Agency License
│   ├── Position/Role
│   └── Agency Contact
├── Service Information
│   ├── Service Areas (Multiple)
│   ├── Property Types
│   ├── Client Types
│   └── Commission Structure
├── Portfolio Management
│   ├── Active Listings
│   ├── Client Properties
│   ├── Sold Properties
│   └── Success Metrics
└── Professional Network
    ├── Team Members
    ├── Referral Partners
    └── Service Providers
```

### Agent-Specific Screens

#### Screen 1: Professional Credentials
```
┌─────────────────────────────────┐
│ ← Credenciales           ●○○○○  │
│                                 │
│ Información Profesional         │
│                                 │
│ Número de Licencia *            │
│ ┌─────────────────────────────┐ │
│ │ RAH-2024-5678               │ │
│ └─────────────────────────────┘ │
│                                 │
│ Vencimiento de Licencia *       │
│ ┌─────────────────────────────┐ │
│ │ 31/12/2025                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Agencia Inmobiliaria            │
│ ┌─────────────────────────────┐ │
│ │ RE/MAX Honduras             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Años de Experiencia             │
│ [<1] [1-2] [3-5] [5-10] [10+]  │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 2: Specializations
```
┌─────────────────────────────────┐
│ ← Especialización        ○●○○○  │
│                                 │
│ Áreas de Especialización        │
│                                 │
│ ☑ Residencial                   │
│ ☑ Comercial                     │
│ ☐ Industrial                    │
│ ☐ Terrenos                      │
│ ☐ Proyectos nuevos              │
│                                 │
│ Servicios que Ofreces           │
│                                 │
│ ☑ Venta de propiedades          │
│ ☑ Alquiler residencial          │
│ ☑ Administración de propiedades │
│ ☐ Consultoría inmobiliaria      │
│ ☐ Avalúos profesionales         │
│                                 │
│ Certificaciones                 │
│ [+ Agregar Certificación]       │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 3: Service Areas
```
┌─────────────────────────────────┐
│ ← Cobertura              ○○●○○  │
│                                 │
│ Áreas de Servicio               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✓ Tegucigalpa               │ │
│ │   • Todas las colonias      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✓ San Pedro Sula            │ │
│ │   • Zona Norte              │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Agregar Ciudad]              │
│                                 │
│ Rango de Precios                │
│ Desde L. [10,000]               │
│ Hasta L. [500,000]              │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

### Agent Dashboard
```
┌─────────────────────────────────┐
│ Dashboard Profesional           │
│ ┌─────────────────────────────┐ │
│ │ KPIs del Mes                │ │
│ │ Leads: 47 | Cierres: 3      │ │
│ │ Conversión: 6.4%            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Portfolio de Clientes (23)      │
│ ┌─────────────────────────────┐ │
│ │ [Ver Todo] [Activos] [Nuevos]│ │
│ └─────────────────────────────┘ │
│                                 │
│ Herramientas Pro                │
│ [📊 Analytics] [📧 Campañas]   │
│ [📱 CRM] [📄 Contratos]        │
└─────────────────────────────────┘
```

## Property Management Company Flow

### Company Structure
```
Property Management Company
├── Company Information
│   ├── Legal Name (Required)
│   ├── Trade Name
│   ├── Registration Number (Required)
│   ├── Tax ID (Required)
│   └── Incorporation Date
├── Office Information
│   ├── Headquarters
│   ├── Branch Offices
│   ├── Contact Numbers
│   └── Support Email
├── Team Structure
│   ├── Company Admin
│   ├── Property Managers
│   ├── Leasing Agents
│   └── Support Staff
├── Service Offerings
│   ├── Property Management
│   ├── Tenant Placement
│   ├── Maintenance Services
│   └── Financial Services
└── Portfolio Scale
    ├── Total Properties
    ├── Property Types
    ├── Geographic Coverage
    └── Total Units
```

### Company-Specific Screens

#### Screen 1: Company Registration
```
┌─────────────────────────────────┐
│ ← Registro Empresarial   ●○○○○○ │
│                                 │
│ Información de la Empresa       │
│                                 │
│ Nombre Legal *                  │
│ ┌─────────────────────────────┐ │
│ │ Inversiones ABC S.A.        │ │
│ └─────────────────────────────┘ │
│                                 │
│ Nombre Comercial                │
│ ┌─────────────────────────────┐ │
│ │ ABC Property Management     │ │
│ └─────────────────────────────┘ │
│                                 │
│ RTN de la Empresa *             │
│ ┌─────────────────────────────┐ │
│ │ 0801-1990-123456            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Año de Fundación                │
│ ┌─────────────────────────────┐ │
│ │ 2015                        │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 2: Office Locations
```
┌─────────────────────────────────┐
│ ← Oficinas               ○●○○○○ │
│                                 │
│ Oficina Principal *             │
│ ┌─────────────────────────────┐ │
│ │ Blvd. Morazán, Torre 1      │ │
│ │ Tegucigalpa, FM             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Teléfono Principal *            │
│ ┌─────────────────────────────┐ │
│ │ +504 2234-5678              │ │
│ └─────────────────────────────┘ │
│                                 │
│ Sucursales                      │
│ ┌─────────────────────────────┐ │
│ │ + San Pedro Sula            │ │
│ │ + La Ceiba                  │ │
│ └─────────────────────────────┘ │
│ [+ Agregar Sucursal]            │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 3: Team Setup
```
┌─────────────────────────────────┐
│ ← Equipo                 ○○●○○○ │
│                                 │
│ Estructura del Equipo           │
│                                 │
│ Administrador Principal         │
│ ┌─────────────────────────────┐ │
│ │ admin@abcproperty.com       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Tamaño del Equipo               │
│ [1-5] [6-10] [11-25] [25+]     │
│                                 │
│ Roles del Equipo                │
│ ☑ Gerentes de Propiedad (3)     │
│ ☑ Agentes de Alquiler (5)       │
│ ☑ Personal de Mantenimiento (2) │
│ ☑ Administración (2)            │
│                                 │
│ [Invitar Equipo] (Secondary)    │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Screen 4: Portfolio Scale
```
┌─────────────────────────────────┐
│ ← Portfolio              ○○○●○○ │
│                                 │
│ Escala de Operación             │
│                                 │
│ Propiedades Administradas       │
│ [10-25] [26-50] [51-100] [100+]│
│                                 │
│ Tipos de Propiedad              │
│ ☑ Residencial (60%)             │
│ ☑ Comercial (30%)               │
│ ☑ Industrial (10%)              │
│                                 │
│ Servicios Ofrecidos             │
│ ☑ Gestión completa              │
│ ☑ Solo colocación               │
│ ☑ Mantenimiento                 │
│ ☑ Servicios financieros         │
│                                 │
│ Cobertura Geográfica            │
│ ☑ Nacional                      │
│ ○ Regional                      │
│ ○ Local                         │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

### Company Dashboard
```
┌─────────────────────────────────┐
│ Panel Empresarial               │
│ ┌─────────────────────────────┐ │
│ │ Métricas Globales           │ │
│ │ Properties: 127 | Units: 450 │ │
│ │ Ocupación: 92% | ROI: 15%   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Gestión de Equipo               │
│ ┌─────────────────────────────┐ │
│ │ 12 Activos | 3 Pendientes   │ │
│ │ [Administrar Permisos]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Herramientas Enterprise         │
│ [🔌 API] [📊 Reports] [💼 CRM] │
│ [📋 Bulk Ops] [🎨 Branding]    │
└─────────────────────────────────┘
```

## Branching Logic

### Decision Tree
```javascript
function determineUserPath(selection) {
  switch(selection) {
    case 'individual':
      return {
        requiredSteps: 3,
        optionalSteps: 2,
        features: ['basic_listing', 'direct_messaging'],
        dashboardType: 'simplified'
      };

    case 'agent':
      return {
        requiredSteps: 5,
        optionalSteps: 3,
        features: ['portfolio_management', 'crm', 'analytics'],
        dashboardType: 'professional'
      };

    case 'company':
      return {
        requiredSteps: 7,
        optionalSteps: 4,
        features: ['team_management', 'bulk_operations', 'api_access'],
        dashboardType: 'enterprise'
      };
  }
}
```

### Conditional Fields
```typescript
interface ConditionalFields {
  individual: {
    required: ['name', 'phone', 'location'],
    optional: ['whatsapp', 'photo', 'bio']
  },
  agent: {
    required: ['license', 'experience', 'areas'],
    optional: ['agency', 'certifications', 'specializations']
  },
  company: {
    required: ['legalName', 'taxId', 'office'],
    optional: ['branches', 'team', 'services']
  }
}
```

## Type-Specific Features

### Feature Matrix
| Feature | Individual | Agent | Company |
|---------|------------|-------|---------|
| Basic Listings | ✓ | ✓ | ✓ |
| Bulk Upload | - | ✓ | ✓ |
| Lead Management | Basic | Advanced | Enterprise |
| Analytics | Simple | Detailed | Custom |
| Team Access | - | Limited | Full |
| API Access | - | - | ✓ |
| Custom Branding | - | Limited | Full |
| Automated Responses | - | ✓ | ✓ |
| Contract Templates | - | ✓ | ✓ |
| Financial Reports | - | Basic | Advanced |

### Permission Levels
```typescript
const permissions = {
  individual: [
    'create_listing',
    'edit_own_listing',
    'view_leads',
    'respond_to_inquiries'
  ],
  agent: [
    ...permissions.individual,
    'manage_portfolio',
    'access_crm',
    'view_analytics',
    'create_campaigns'
  ],
  company: [
    ...permissions.agent,
    'manage_team',
    'access_api',
    'customize_branding',
    'export_data',
    'bulk_operations'
  ]
};
```

## UI Adaptations

### Individual Owner UI
```
Characteristics:
• Minimal navigation items
• Large, clear buttons
• Step-by-step guidance
• Simple forms
• Basic metrics
• Mobile-optimized
```

### Agent Professional UI
```
Characteristics:
• Multi-level navigation
• Data tables
• Advanced filters
• Charts and graphs
• Quick actions toolbar
• Desktop-optimized
```

### Company Enterprise UI
```
Characteristics:
• Customizable dashboard
• Role-based views
• Bulk action tools
• Advanced reporting
• API documentation
• Multi-device support
```

### Responsive Adaptations
```css
/* Individual - Mobile First */
.individual-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/* Agent - Tablet Optimized */
.agent-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

/* Company - Desktop Priority */
.company-dashboard {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 32px;
  padding: 32px;
}
```

## Type Migration

### Upgrade Paths
```
Individual → Agent
  Requirements:
  • License verification
  • Professional information
  • Service area expansion

Agent → Company
  Requirements:
  • Business registration
  • Tax documentation
  • Team structure

Individual → Company
  Requirements:
  • All company requirements
  • Skip agent-specific fields
```

### Migration Flow
```
┌─────────────────────────────────┐
│ Actualizar Tipo de Cuenta       │
│                                 │
│ Tu cuenta actual: Individual    │
│                                 │
│ Actualizar a: Agente            │
│                                 │
│ Nuevos Requisitos:              │
│ • Número de licencia            │
│ • Verificación profesional      │
│ • Información de agencia        │
│                                 │
│ Nuevas Características:         │
│ • CRM profesional               │
│ • Analytics avanzado            │
│ • Gestión de portfolio          │
│                                 │
│ [Comenzar Actualización]        │
│ [Mantener Actual]               │
└─────────────────────────────────┘
```

### Data Preservation
```typescript
async function migrateAccountType(
  userId: string,
  fromType: AccountType,
  toType: AccountType
) {
  // Preserve existing data
  const currentData = await getProfileData(userId);

  // Map to new structure
  const migratedData = mapDataToNewType(currentData, toType);

  // Add new required fields
  const newFields = getRequiredFields(toType);

  // Create migration record
  await createMigrationRecord(userId, fromType, toType);

  // Update profile
  return updateProfile(userId, {
    ...migratedData,
    accountType: toType,
    migrationDate: Date.now()
  });
}
```

## Related Documentation
- [Profile System Overview](./README.md)
- [Landlord Onboarding](./landlord-onboarding.md)
- [Verification Levels](./verification-levels.md)
- [Dashboard Customization](../landlord-dashboard/README.md)

## Last Updated
- 2025-01-29: Initial documentation for property type selection
- Defined three landlord categories
- Created type-specific flows
- Established UI adaptations