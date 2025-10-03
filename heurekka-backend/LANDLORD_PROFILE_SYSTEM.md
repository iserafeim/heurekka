# Sistema de Perfil de Landlord - Implementación Backend

## Resumen de Implementación

Se ha implementado el sistema completo de perfiles de landlord siguiendo las especificaciones de diseño. Este documento describe los componentes creados, endpoints disponibles y guías de uso.

## Archivos Creados/Modificados

### Nuevos Services

#### 1. Storage Service (`/src/services/storage.service.ts`)
Gestiona la subida de archivos a Supabase Storage.

**Funcionalidades:**
- Upload de fotos de perfil con validación de tipo y tamaño
- Eliminación de archivos
- Validación y decodificación de imágenes base64
- Límites: 5MB por archivo

**Buckets de Supabase Storage:**
- `profile-photos` - Fotos de perfil de landlords

#### 2. Landlord Verification Service (`/src/services/landlord-verification.service.ts`)
Maneja todo el proceso de verificación de landlords.

**Funcionalidades:**
- **Phone Verification**:
  - Generación de código de 6 dígitos
  - Cooldown de 30 segundos entre solicitudes
  - Expiración de 5 minutos
  - Máximo 5 intentos de verificación
  - TODO: Integración con proveedor SMS (Twilio, AWS SNS)

- **Email Verification**:
  - Generación de token único
  - Expiración de 24 horas
  - TODO: Integración con servicio de email (SendGrid, AWS SES)

- **Verification Levels**:
  - `basic`: Email + Phone verificados
  - `verified`: Email + Phone + verificaciones adicionales
  - `premium`: Nivel más alto de verificación

#### 3. Landlord Badges Service (`/src/services/landlord-badges.service.ts`)
Sistema de gamificación con badges de logros.

**Badges Disponibles:**
- `verified_phone` - Teléfono Verificado 📱
- `verified_email` - Email Verificado ✉️
- `verified_identity` - Identidad Verificada 🆔
- `verified_business` - Negocio Verificado 🏢
- `verified_professional` - Profesional Verificado 👔
- `first_listing` - Primera Publicación 🏠
- `five_listings` - 5 Propiedades 🏘️
- `ten_listings` - 10 Propiedades 🏙️
- `quick_responder` - Respuesta Rápida ⚡
- `highly_rated` - Altamente Calificado ⭐
- `trusted_landlord` - Arrendador de Confianza 🤝
- `premium_member` - Miembro Premium 💎
- `early_adopter` - Adoptador Temprano 🚀
- `complete_profile` - Perfil Completo ✅

**Funcionalidades:**
- Award badges automáticos basados en eventos
- Prevención de duplicados
- Listado de badges ganados y disponibles

### Services Actualizados

#### Landlord Profile Service (`/src/services/landlord-profile.service.ts`)

**Nuevos Métodos Agregados:**

1. **Onboarding:**
   - `saveOnboardingProgress()` - Guardar progreso paso a paso
   - `getOnboardingProgress()` - Recuperar progreso guardado
   - `completeOnboarding()` - Marcar onboarding como completo

2. **Profile Photo:**
   - `updateProfilePhoto()` - Actualizar URL de foto de perfil

3. **Portfolio Stats:**
   - `getPortfolioStats()` - Obtener estadísticas completas del portfolio
   - `calculatePortfolioStats()` - Recalcular estadísticas (debe llamarse al crear/actualizar propiedades)

### Router Actualizado

#### Landlord Profile Router (`/src/routers/landlord-profile.ts`)

**Nuevos Endpoints Agregados:**

#### Onboarding Endpoints
```typescript
// POST - Guardar progreso del onboarding
landlordProfile.saveOnboardingProgress({
  step: number,
  formData: Record<string, any>,
  skippedSteps?: string[]
})

// GET - Obtener progreso del onboarding
landlordProfile.getOnboardingProgress()

// POST - Completar onboarding
landlordProfile.completeOnboarding()
```

#### Photo Upload Endpoints
```typescript
// POST - Subir foto de perfil
landlordProfile.uploadProfilePhoto({
  base64Image: string,
  fileName: string
})
```

#### Verification Endpoints
```typescript
// POST - Solicitar verificación telefónica
landlordProfile.requestPhoneVerification({
  phoneNumber: string // Format: "9999-9999"
})

// POST - Verificar código telefónico
landlordProfile.verifyPhone({
  code: string // 6 digits
})

// POST - Solicitar verificación de email
landlordProfile.requestEmailVerification({
  email: string
})

// POST - Verificar token de email
landlordProfile.verifyEmail({
  token: string
})

// GET - Obtener estado de verificación
landlordProfile.getVerificationStatus()
```

#### Portfolio Stats Endpoints
```typescript
// GET - Obtener estadísticas del portfolio
landlordProfile.getPortfolioStats()
```

#### Badges Endpoints
```typescript
// GET - Obtener badges ganados
landlordProfile.getBadges()

// GET - Obtener todos los badges disponibles
landlordProfile.getAvailableBadges()
```

## Tests Implementados

### Unit Tests Creados:

1. **`/src/test/unit/storage.service.test.ts`**
   - Upload de fotos de perfil
   - Upload de documentos de verificación
   - Validación de tipos de archivo
   - Validación de tamaño
   - Validación y decodificación de base64
   - Health check

2. **`/src/test/unit/landlord-verification.service.test.ts`**
   - Solicitud de verificación telefónica
   - Verificación de código telefónico
   - Cooldown period enforcement
   - Códigos expirados
   - Estado de verificación
   - Health check

3. **`/src/test/unit/landlord-badges.service.test.ts`**
   - Award de badges
   - Prevención de duplicados
   - Listado de badges
   - Validación de tipos
   - Check automático de badges
   - Badges disponibles
   - Health check

## Esquema de Base de Datos

### Tablas Utilizadas (ya existen en Supabase):

#### `landlords`
Tabla principal de perfiles de landlord con los siguientes campos nuevos/actualizados:
- `profile_photo_url` - URL de la foto de perfil
- `onboarding_step` - Paso actual del onboarding (0-10)
- `onboarding_data` - JSONB con datos del onboarding
- `onboarding_completed` - Boolean
- `onboarding_completed_at` - Timestamp
- `skipped_steps` - Array de pasos omitidos
- `phone_verified` - Boolean
- `phone_verified_at` - Timestamp
- `email_verified` - Boolean
- `email_verified_at` - Timestamp
- `identity_verified` - Boolean
- `business_license_verified` - Boolean
- `verification_status` - 'basic' | 'verified' | 'premium'

#### `verification_data`
Gestiona los procesos de verificación:
- `id` - UUID
- `landlord_id` - UUID (FK a landlords)
- `verification_type` - phone | email | identity_document | business_license | etc.
- `status` - pending | verified | failed | expired
- `document_url` - URL del documento (si aplica)
- `verification_code_hash` - Hash del código de verificación
- `code_expires_at` - Timestamp de expiración
- `attempts` - Número de intentos
- `max_attempts` - Intentos máximos permitidos
- `verified_at` - Timestamp de verificación
- `metadata` - JSONB con información adicional

#### `profile_badges`
Badges de gamificación:
- `id` - UUID
- `landlord_id` - UUID (FK a landlords)
- `badge_type` - Tipo de badge
- `badge_name` - Nombre del badge
- `badge_description` - Descripción
- `badge_icon` - Emoji/ícono
- `awarded_at` - Timestamp
- `metadata` - JSONB

#### `portfolio_stats`
Estadísticas del portfolio:
- `id` - UUID
- `landlord_id` - UUID (FK a landlords)
- `total_properties` - Total de propiedades
- `active_properties` - Propiedades activas
- `rented_properties` - Propiedades rentadas
- `total_views` - Total de vistas
- `total_inquiries` - Total de consultas
- `conversion_rate` - Tasa de conversión
- `average_response_time_hours` - Tiempo promedio de respuesta
- `response_rate` - Tasa de respuesta

## Flujo de Uso

### 1. Onboarding Flow

```typescript
// Paso 1: Guardar progreso del primer paso
await trpc.landlordProfile.saveOnboardingProgress.mutate({
  step: 1,
  formData: {
    landlordType: 'individual_owner',
    fullName: 'Juan Pérez',
    phone: '9999-9999'
  }
});

// Paso 2: Continuar guardando progreso
await trpc.landlordProfile.saveOnboardingProgress.mutate({
  step: 2,
  formData: {
    whatsappNumber: '8888-8888',
    propertyCountRange: '2-5'
  }
});

// Paso 3: Subir foto de perfil (opcional)
await trpc.landlordProfile.uploadProfilePhoto.mutate({
  base64Image: 'data:image/jpeg;base64,...',
  fileName: 'profile.jpg'
});

// Paso 4: Completar onboarding
await trpc.landlordProfile.completeOnboarding.mutate();
// Esto marcará has_landlord_profile=true en user_accounts
```

### 2. Verification Flow

```typescript
// Verificar teléfono
const phoneVerif = await trpc.landlordProfile.requestPhoneVerification.mutate({
  phoneNumber: '9999-9999'
});
// Usuario recibe SMS con código (en producción)

await trpc.landlordProfile.verifyPhone.mutate({
  code: '123456'
});
// Award automático del badge 'verified_phone'

// Verificar email
await trpc.landlordProfile.requestEmailVerification.mutate({
  email: 'user@example.com'
});
// Usuario recibe email con link de verificación

await trpc.landlordProfile.verifyEmail.mutate({
  token: 'token-from-email-link'
});
// Award automático del badge 'verified_email'

// Verificar estado
const status = await trpc.landlordProfile.getVerificationStatus.query();
// { phoneVerified: true, emailVerified: true,
//   identityVerified: false, verificationLevel: 'basic' }
```

### 3. Portfolio Stats

```typescript
// Obtener estadísticas
const stats = await trpc.landlordProfile.getPortfolioStats.query();
// { totalProperties: 5, activeProperties: 3, rentedProperties: 2,
//   totalViews: 1250, totalInquiries: 45, conversionRate: 12.5,
//   averageResponseTimeHours: 1.5, responseRate: 95 }
```

### 4. Badges

```typescript
// Obtener badges ganados
const badges = await trpc.landlordProfile.getBadges.query();

// Obtener todos los badges disponibles
const allBadges = await trpc.landlordProfile.getAvailableBadges.query();
// Muestra cuáles están ganados y cuáles no
```

## Integración con Auth System

El sistema está integrado con el sistema de autenticación:

1. Cuando se completa el onboarding, se actualiza `has_landlord_profile = true` en `user_accounts`
2. Todos los endpoints requieren autenticación (usan `protectedProcedure`)
3. Los userId se obtienen automáticamente del contexto de autenticación

## TODOs y Limitaciones Conocidas

### Integraciones Pendientes:

1. **SMS Provider** (landlord-verification.service.ts línea 81):
   - Integrar con Twilio, AWS SNS, u otro proveedor
   - Actualmente solo logea el código a consola

2. **Email Provider** (landlord-verification.service.ts línea 177):
   - Integrar con SendGrid, AWS SES, u otro servicio
   - Actualmente solo logea el link a consola

3. **Welcome Notification** (landlord-profile.service.ts línea 723):
   - Trigger de notificación de bienvenida cuando se completa onboarding

4. **Manual Document Review**:
   - Sistema de admin para revisar documentos de verificación
   - Endpoints para aprobar/rechazar verificaciones

5. **Property Count Integration**:
   - El endpoint `calculatePortfolioStats` debe ser llamado cuando se crean/actualizan propiedades
   - Actualmente retorna 0 si no hay datos en portfolio_stats

### Mejoras Futuras:

1. **Real-time Notifications**:
   - WebSocket para notificaciones en tiempo real de verificaciones completadas

2. **Analytics Avanzados**:
   - Tracking de métricas de engagement del profile
   - Reportes de performance

3. **Batch Badge Awards**:
   - Función scheduled para revisar y otorgar badges periódicamente

4. **Profile Completion Score**:
   - Algoritmo más sofisticado considerando calidad de datos

## Seguridad

### Implementado:

- ✅ Hashing de códigos de verificación (SHA-256)
- ✅ Rate limiting con cooldown periods
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño de archivo
- ✅ Autenticación requerida en todos los endpoints
- ✅ Validación de inputs con Zod
- ✅ Prevención de duplicados en badges
- ✅ Expiración de códigos y tokens

### Consideraciones:

- Los documentos de verificación se almacenan en buckets privados de Supabase
- Las URLs públicas son temporales y deben ser regeneradas
- Los códigos de verificación nunca se almacenan en texto plano

## Testing

Para ejecutar los tests:

```bash
npm test
```

Para ejecutar tests con coverage:

```bash
npm run test:coverage
```

## Comandos Útiles

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting errors
npm run lint:fix

# Development mode
npm run dev
```

## Contacto y Soporte

Para preguntas sobre la implementación, revisar:
- Documentación de diseño en `/design-documentation/features/landlord-profile/`
- Código fuente en `/src/services/` y `/src/routers/`
- Tests en `/src/test/unit/`

---

**Fecha de Implementación**: 2025-10-03
**Versión**: 1.0.0
**Estado**: Producción Ready (con TODOs pendientes de integración)
