---
title: Verification Levels System
description: Multi-tier verification system for building landlord credibility
feature: landlord-profile
last-updated: 2025-01-29
version: 1.0.0
related-files:
  - ./README.md
  - ./landlord-onboarding.md
  - ./property-type-selection.md
  - ../user-authentication/README.md
dependencies:
  - Identity verification service
  - Document validation system
  - Property ownership verification
status: approved
---

# Verification Levels System

## Overview
The verification levels system establishes trust between landlords and tenants through a progressive verification framework. Each level provides increased credibility, better visibility, and access to premium features.

## Table of Contents
1. [Verification Architecture](#verification-architecture)
2. [Basic Verification](#basic-verification)
3. [Verified Status](#verified-status)
4. [Premium Verification](#premium-verification)
5. [Verification Flow](#verification-flow)
6. [Badge System](#badge-system)
7. [Benefits by Level](#benefits-by-level)
8. [Trust Indicators](#trust-indicators)
9. [Implementation Guidelines](#implementation-guidelines)

## Verification Architecture

### Three-Tier System
```
┌─────────────────────────────────────┐
│         Verification Pyramid         │
│                                      │
│            ╱─────────╲               │
│           ╱  Premium  ╲              │
│          ╱─────────────╲             │
│         ╱   Verified    ╲            │
│        ╱─────────────────╲           │
│       ╱      Basic        ╲          │
│      ╱─────────────────────╲         │
└─────────────────────────────────────┘
```

### Verification Matrix
| Level | Requirements | Time | Badge | Benefits |
|-------|-------------|------|--------|----------|
| Basic | Email + Phone | Instant | None | Can list |
| Verified | ID + Selfie | 24h | Blue ✓ | Priority |
| Premium | Property docs | 48h | Gold ★ | Featured |

### Progressive Trust Model
```
Account Creation
    ↓
Basic Verification (Required)
    ↓
Platform Usage (Builds history)
    ↓
Verified Status (Recommended)
    ↓
Premium Level (Optional)
```

## Basic Verification

### Requirements
1. **Email Verification** (Automated)
2. **Phone Verification** (SMS)
3. **Profile Completion** (40% minimum)

### Email Verification Flow
```
┌─────────────────────────────────┐
│ Verificación de Email           │
│                                 │
│ Enviamos un código a:           │
│ usuario@email.com               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Código de 6 dígitos         │ │
│ │ [  ] [  ] [  ] [  ] [  ] [  ]│ │
│ └─────────────────────────────┘ │
│                                 │
│ [Verificar] (Primary)           │
│                                 │
│ ¿No recibiste el código?        │
│ [Reenviar] en 30 segundos       │
└─────────────────────────────────┘
```

### Phone Verification Flow
```
┌─────────────────────────────────┐
│ Verificación de Teléfono        │
│                                 │
│ Número a verificar:             │
│ ┌─────────────────────────────┐ │
│ │ +504 9999-9999              │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Enviar SMS] (Primary)          │
│ [Llamada de voz] (Secondary)    │
│                                 │
│ ───────────────────────         │
│                                 │
│ Ingresa el código:              │
│ ┌─────────────────────────────┐ │
│ │ [    ]                      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Confirmar] (Primary)           │
└─────────────────────────────────┘
```

### Basic Level Interface
```
┌─────────────────────────────────┐
│ Tu Estado: Básico               │
│                                 │
│ ✓ Email verificado              │
│ ✓ Teléfono verificado           │
│ ✓ Perfil activo                 │
│                                 │
│ Puedes:                         │
│ • Publicar propiedades          │
│ • Recibir consultas             │
│ • Responder mensajes            │
│                                 │
│ [Subir a Verificado] →          │
└─────────────────────────────────┘
```

## Verified Status

### Requirements
1. **Identity Document** (ID/Passport)
2. **Live Selfie** (Liveness check)
3. **Document-Selfie Match** (AI validation)
4. **Address Verification** (Utility bill)

### ID Verification Process

#### Step 1: Document Selection
```
┌─────────────────────────────────┐
│ ← Verificación de Identidad     │
│                                 │
│ Selecciona tu documento:        │
│                                 │
│ ○ Tarjeta de Identidad          │
│ ○ Pasaporte                     │
│ ○ Licencia de Conducir          │
│                                 │
│ ℹ️ Tu documento debe estar      │
│    vigente y ser legible        │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

#### Step 2: Document Capture
```
┌─────────────────────────────────┐
│ ← Captura tu Documento          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    ┌─────────────────┐     │ │
│ │    │                 │     │ │
│ │    │   FRENTE ID     │     │ │
│ │    │                 │     │ │
│ │    └─────────────────┘     │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Consejos:                       │
│ • Buena iluminación             │
│ • Sin reflejos                  │
│ • Documento completo            │
│                                 │
│ [📷 Tomar Foto] (Primary)       │
│ [📁 Subir Archivo] (Secondary)  │
└─────────────────────────────────┘
```

#### Step 3: Selfie Verification
```
┌─────────────────────────────────┐
│ ← Verificación Facial           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │      ┌─────────────┐       │ │
│ │      │             │       │ │
│ │      │    👤       │       │ │
│ │      │             │       │ │
│ │      └─────────────┘       │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Instrucciones:                  │
│ 1. Centra tu rostro             │
│ 2. Mira a la cámara             │
│ 3. Sonríe cuando indiquemos     │
│                                 │
│ [Comenzar] (Primary)            │
└─────────────────────────────────┘
```

#### Step 4: Liveness Check
```
┌─────────────────────────────────┐
│ Prueba de Vida                  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      Gira tu cabeza         │ │
│ │         ← →                 │ │
│ │      ┌─────────┐           │ │
│ │      │    👤    │           │ │
│ │      └─────────┘           │ │
│ │   ████████░░░░ 80%         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Siguiendo instrucciones...      │
└─────────────────────────────────┘
```

### Verification Results
```
┌─────────────────────────────────┐
│     ✓ Verificación Exitosa      │
│                                 │
│ Tu identidad ha sido            │
│ verificada correctamente        │
│                                 │
│ Badge Obtenido:                 │
│     [✓] Verificado              │
│                                 │
│ Nuevos Beneficios:              │
│ • Badge azul en tu perfil       │
│ • Mayor visibilidad             │
│ • Prioridad en búsquedas        │
│ • Estadísticas avanzadas        │
│                                 │
│ [Ver Mi Perfil] (Primary)       │
│ [Subir a Premium] (Secondary)   │
└─────────────────────────────────┘
```

## Premium Verification

### Requirements
1. **All Verified requirements**
2. **Property ownership documents**
3. **Business registration** (if applicable)
4. **Professional references** (2 minimum)
5. **Background check** (optional)

### Property Documentation

#### Document Upload Screen
```
┌─────────────────────────────────┐
│ ← Documentos de Propiedad       │
│                                 │
│ Sube documentos que demuestren  │
│ la propiedad o administración   │
│                                 │
│ Documentos Aceptados:           │
│ • Escritura de propiedad        │
│ • Contrato de administración    │
│ • Recibo de impuestos           │
│ • Poder notarial                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📄 Escritura_Casa.pdf       │ │
│ │    Subido ✓                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Agregar Documento]           │
│                                 │
│ [Enviar para Revisión]          │
└─────────────────────────────────┘
```

#### Professional References
```
┌─────────────────────────────────┐
│ ← Referencias Profesionales      │
│                                 │
│ Referencia 1                    │
│ ┌─────────────────────────────┐ │
│ │ Nombre: Juan Pérez          │ │
│ │ Relación: Inquilino anterior│ │
│ │ Teléfono: +504 9999-8888    │ │
│ │ Email: juan@email.com       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Referencia 2                    │
│ ┌─────────────────────────────┐ │
│ │ Nombre: María González      │ │
│ │ Relación: Socio comercial   │ │
│ │ Teléfono: +504 9999-7777    │ │
│ │ Email: maria@email.com      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [+ Agregar Referencia]          │
│                                 │
│ [Continuar] (Primary)           │
└─────────────────────────────────┘
```

### Premium Review Process
```
┌─────────────────────────────────┐
│ Estado de Revisión              │
│                                 │
│ ⏱ En Proceso                   │
│                                 │
│ Tu solicitud está siendo        │
│ revisada por nuestro equipo     │
│                                 │
│ Tiempo estimado: 24-48 horas    │
│                                 │
│ Pasos Completados:              │
│ ✓ Documentos recibidos          │
│ ✓ Referencias contactadas       │
│ ⏳ Verificación en proceso      │
│ ○ Aprobación final              │
│                                 │
│ Te notificaremos cuando         │
│ el proceso esté completo        │
│                                 │
│ [Entendido] (Primary)           │
└─────────────────────────────────┘
```

## Verification Flow

### Complete User Journey
```
START
  ↓
Email Verification (Automatic)
  ↓
Phone Verification (SMS)
  ↓
[Basic Level Achieved]
  ↓
Continue Using Platform?
  ├─Yes→ Build History
  └─No→ Prompt for Verified
      ↓
    ID Upload
      ↓
    Selfie + Liveness
      ↓
    AI Validation
      ↓
    [Verified Status]
      ↓
    Want Premium?
      ├─Yes→ Document Upload
      │       ↓
      │     References
      │       ↓
      │     Manual Review
      │       ↓
      │     [Premium Status]
      └─No→ END
```

### Verification Status Screen
```
┌─────────────────────────────────┐
│ Tu Estado de Verificación       │
│                                 │
│ Nivel Actual: Verificado ✓      │
│ ████████████████░░░░ 75%        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Básico          ✓ Completo  │ │
│ │ • Email         ✓           │ │
│ │ • Teléfono      ✓           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Verificado      ✓ Activo    │ │
│ │ • Identidad     ✓           │ │
│ │ • Dirección     ✓           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Premium         ○ Disponible│ │
│ │ • Propiedades   ○           │ │
│ │ • Referencias   ○           │ │
│ │ [Comenzar Proceso]          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Badge System

### Visual Badge Designs
```
Basic (No Badge):
┌─────┐
│ 👤  │  Juan Pérez
└─────┘  Propietario

Verified (Blue Badge):
┌─────┐
│ 👤✓ │  María González
└─────┘  Agente Verificado

Premium (Gold Badge):
┌─────┐
│ 👤★ │  ABC Properties
└─────┘  Empresa Premium
```

### Badge Display Rules
| Location | Basic | Verified | Premium |
|----------|-------|----------|---------|
| Profile | Hidden | Blue ✓ | Gold ★ |
| Listings | Hidden | Small ✓ | Large ★ |
| Search Results | Last | Middle | First |
| Messages | None | "Verificado" | "Premium" |

### Badge Implementation
```typescript
interface BadgeConfig {
  basic: {
    display: false,
    color: null,
    icon: null,
    tooltip: null
  },
  verified: {
    display: true,
    color: '#0066CC',
    icon: 'checkmark',
    tooltip: 'Identidad Verificada'
  },
  premium: {
    display: true,
    color: '#FFD700',
    icon: 'star',
    tooltip: 'Arrendador Premium'
  }
}
```

## Benefits by Level

### Basic Level Benefits
```
┌─────────────────────────────────┐
│ Beneficios Básicos              │
│                                 │
│ ✓ Publicar hasta 5 propiedades  │
│ ✓ Recibir consultas             │
│ ✓ Mensajería básica             │
│ ✓ Panel de control simple       │
│ ○ Sin badge de verificación     │
│ ○ Visibilidad estándar          │
└─────────────────────────────────┘
```

### Verified Level Benefits
```
┌─────────────────────────────────┐
│ Beneficios Verificados          │
│                                 │
│ Todo lo Básico, más:            │
│ ✓ Badge azul de verificación    │
│ ✓ +50% visibilidad en búsquedas │
│ ✓ Publicar hasta 20 propiedades │
│ ✓ Respuestas automáticas        │
│ ✓ Estadísticas detalladas       │
│ ✓ Prioridad en soporte          │
│ ✓ Filtro de inquilinos          │
└─────────────────────────────────┘
```

### Premium Level Benefits
```
┌─────────────────────────────────┐
│ Beneficios Premium              │
│                                 │
│ Todo lo Verificado, más:        │
│ ★ Badge dorado premium          │
│ ★ Listados destacados           │
│ ★ Propiedades ilimitadas        │
│ ★ API access                    │
│ ★ Marca personalizada           │
│ ★ Analytics avanzado            │
│ ★ Gestor de cuenta dedicado     │
│ ★ Promociones exclusivas        │
│ ★ Primero en resultados         │
└─────────────────────────────────┘
```

### Comparison Table
```
┌─────────────────────────────────────────┐
│         Básico  Verificado  Premium     │
├─────────────────────────────────────────┤
│ Propiedades    5      20     Ilimitadas │
│ Badge          ✗       ✓         ★      │
│ Visibilidad   1x     1.5x       3x      │
│ Soporte      Email   Chat    Dedicado   │
│ Analytics   Básico Detallado  Custom    │
│ API           ✗       ✗         ✓       │
│ Costo        Gratis  Gratis   L.999/mes │
└─────────────────────────────────────────┘
```

## Trust Indicators

### Profile Trust Score
```
Trust Score Calculation:
├── Verification Level (40%)
│   ├── Basic: 10 points
│   ├── Verified: 30 points
│   └── Premium: 40 points
├── Profile Completeness (20%)
│   └── Each 10% = 2 points
├── Response Rate (20%)
│   └── % of inquiries answered
├── Response Time (10%)
│   └── Average time to reply
└── User Reviews (10%)
    └── Average rating
```

### Trust Display
```
┌─────────────────────────────────┐
│ Indicadores de Confianza        │
│                                 │
│ Puntuación: 4.5/5.0 ⭐⭐⭐⭐⭐    │
│                                 │
│ ✓ Identidad Verificada          │
│ ✓ Teléfono Confirmado           │
│ ✓ 2 años en la plataforma       │
│ ✓ 48 propiedades alquiladas     │
│                                 │
│ Responde en: ~2 horas           │
│ Tasa de respuesta: 95%          │
│                                 │
│ [Ver Reseñas (23)]              │
└─────────────────────────────────┘
```

### Search Result Enhancement
```
┌─────────────────────────────────┐
│ Casa en Tegucigalpa             │
│ L. 15,000/mes                   │
│                                 │
│ [Image]                         │
│                                 │
│ María González ★                │
│ Arrendador Premium              │
│ ✓ Verificado • 4.8⭐            │
└─────────────────────────────────┘
```

## Implementation Guidelines

### Verification Service Architecture
```typescript
class VerificationService {
  async verifyEmail(email: string): Promise<boolean> {
    const token = generateToken();
    await sendVerificationEmail(email, token);
    return waitForVerification(token);
  }

  async verifyPhone(phone: string): Promise<boolean> {
    const code = generateSMSCode();
    await sendSMS(phone, code);
    return validateSMSCode(code);
  }

  async verifyIdentity(documents: Documents): Promise<VerificationResult> {
    // AI-powered verification
    const idCheck = await validateDocument(documents.id);
    const livenessCheck = await validateLiveness(documents.selfie);
    const matchCheck = await matchFaces(documents.id, documents.selfie);

    return {
      verified: idCheck && livenessCheck && matchCheck,
      confidence: calculateConfidence([idCheck, livenessCheck, matchCheck])
    };
  }

  async verifyPremium(data: PremiumData): Promise<PremiumResult> {
    // Manual review queue
    const reviewId = await queueForReview(data);
    await notifyReviewTeam(reviewId);
    return trackReviewStatus(reviewId);
  }
}
```

### State Management
```typescript
interface VerificationState {
  level: 'basic' | 'verified' | 'premium';
  status: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    documents: boolean;
    references: boolean;
  };
  badges: Badge[];
  benefits: Benefit[];
  trustScore: number;
  verifiedAt: {
    email?: Date;
    phone?: Date;
    identity?: Date;
    premium?: Date;
  };
}
```

### Database Schema
```sql
CREATE TABLE verification_levels (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  level VARCHAR(20) DEFAULT 'basic',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  documents_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  identity_verified_at TIMESTAMP,
  premium_verified_at TIMESTAMP,
  trust_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE verification_documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_type VARCHAR(50),
  document_url TEXT,
  status VARCHAR(20),
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  notes TEXT
);
```

### API Endpoints
```typescript
// Verification endpoints
POST   /api/verify/email
POST   /api/verify/phone
POST   /api/verify/identity
POST   /api/verify/documents
GET    /api/verify/status
GET    /api/verify/benefits
POST   /api/verify/upgrade

// Badge endpoints
GET    /api/badges/:userId
GET    /api/badges/requirements/:level
```

### Security Considerations
```typescript
const securityMeasures = {
  // Rate limiting
  rateLimits: {
    emailVerification: '3 per hour',
    phoneVerification: '5 per day',
    identityVerification: '3 per day',
    documentUpload: '10 per day'
  },

  // Document handling
  documentStorage: 'encrypted S3 bucket',
  documentRetention: '90 days after verification',

  // Privacy
  dataMinimization: true,
  gdprCompliant: true,

  // Fraud prevention
  livenessDetection: true,
  documentAuthenticity: true,
  duplicateDetection: true
};
```

## Related Documentation
- [Profile System Overview](./README.md)
- [Landlord Onboarding](./landlord-onboarding.md)
- [Property Type Selection](./property-type-selection.md)
- [Authentication System](../user-authentication/README.md)
- [Trust & Safety Guidelines](../trust-safety/README.md)

## Last Updated
- 2025-01-29: Initial verification system documentation
- Defined three-tier verification levels
- Created verification flows and UI
- Established badge and benefit systems