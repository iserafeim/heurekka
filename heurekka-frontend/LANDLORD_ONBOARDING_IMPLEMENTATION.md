# Landlord Onboarding System - Implementación Frontend

## Resumen de la Implementación

Sistema completo de onboarding para arrendadores en Heurekka, implementado con Next.js 15, React 19, TypeScript, y Tailwind CSS.

## Estructura de Archivos Creados

```
src/
├── contexts/
│   └── landlord/
│       └── OnboardingContext.tsx          # Context con auto-save y state management
│
├── components/
│   └── landlord/
│       └── onboarding/
│           ├── index.ts                    # Barrel exports
│           ├── FormField.tsx               # Wrapper para inputs con validación
│           ├── ProgressIndicator.tsx       # Indicador de progreso con dots
│           ├── LandlordTypeCard.tsx        # Card seleccionable para tipo
│           ├── ProfilePhotoUpload.tsx      # Upload con crop de imagen
│           ├── PhoneVerificationModal.tsx  # Modal de verificación telefónica
│           ├── IndividualOwnerForm.tsx     # Formulario propietario individual
│           ├── RealEstateAgentForm.tsx     # Formulario agente inmobiliario
│           └── PropertyCompanyForm.tsx     # Formulario empresa de gestión
│
├── schemas/
│   └── landlord/
│       ├── individualOwner.schema.ts       # Zod schema para individual
│       ├── realEstateAgent.schema.ts       # Zod schema para agente
│       └── propertyCompany.schema.ts       # Zod schema para empresa
│
├── hooks/
│   └── landlord/
│       └── useOnboarding.ts                # Hooks de tRPC ya existentes
│
├── types/
│   └── landlord.ts                         # Types y constantes ya existentes
│
└── app/
    └── landlord/
        └── onboarding/
            ├── layout.tsx                  # Layout compartido
            ├── page.tsx                    # Redirect a /welcome
            ├── welcome/
            │   └── page.tsx                # Página de bienvenida
            ├── type/
            │   └── page.tsx                # Selección de tipo
            ├── details/
            │   └── page.tsx                # Formulario por tipo
            ├── photo/
            │   └── page.tsx                # Upload de foto
            ├── verification/
            │   └── page.tsx                # Verificación de teléfono
            └── complete/
                └── page.tsx                # Página de completado
```

## Componentes Implementados

### 1. Componentes Reutilizables

#### `FormField.tsx`
- Wrapper para inputs con label, error, y helper text
- Marca asterisco rojo para campos requeridos
- Iconos de error

#### `ProgressIndicator.tsx`
- Indicador de progreso con dots animados
- Estados: pendiente, actual, completado
- Responsive

#### `LandlordTypeCard.tsx`
- Card seleccionable con estados hover y selected
- Animaciones suaves
- Checkmark cuando está seleccionado

#### `ProfilePhotoUpload.tsx`
- Drag & drop file upload
- Integración con react-image-crop para recorte
- Validación de formato (JPG, PNG, WEBP)
- Validación de tamaño (max 5MB)
- Conversión a base64
- Preview de imagen

#### `PhoneVerificationModal.tsx`
- Modal con 6 inputs para código
- Countdown timer de 5 minutos
- Botón de reenvío con cooldown de 30s
- Auto-submit al completar código
- Soporte para paste
- Manejo de intentos restantes

### 2. Formularios por Tipo

#### `IndividualOwnerForm.tsx`
Campos:
- Nombre Completo (required, validación regex)
- Teléfono (required, formato 9999-9999)
- WhatsApp (optional, formato 9999-9999)
- Ubicación Principal (required, select de ciudades)
- Número de Propiedades (optional, radio buttons)
- Razón de Renta (optional, select)

Características:
- Validación con Zod schema
- Auto-save con debounce
- React Hook Form

#### `RealEstateAgentForm.tsx`
Campos:
- Nombre Profesional (required)
- Tipo de Agente (required, radio buttons)
- Nombre de Empresa (condicional)
- Teléfono y WhatsApp (required)
- Años de Experiencia (required, radio buttons)
- Número de Licencia AHCI (optional)
- Especializaciones (required, min 1, checkboxes)
- Zonas de Cobertura (required, min 1, max 10, multi-select)
- Propiedades en Gestión (required, select)
- Bio Profesional (optional, textarea 300 chars)

Características:
- Campos condicionales
- Multi-select con límites
- Contador de caracteres

#### `PropertyCompanyForm.tsx`
Campos:
- Nombre Legal y Comercial
- RTN (required, formato 0801-1990-123456)
- Tipo de Empresa (required, select)
- Año de Fundación (optional, number)
- Teléfonos y WhatsApp Business (required)
- Email de Contacto (optional, validación email)
- Sitio Web (optional, validación URL)
- Dirección de Oficina (required)
- Ciudad (required, select)
- Zonas de Operación (required, min 1, max 20, multi-select)
- Tamaño del Portfolio (required, radio buttons)
- Tipos de Propiedad (required, min 1, checkboxes)
- Rango de Precios (optional, validación min <= max)
- Descripción (optional, textarea 500 chars)

Características:
- Validación de RTN
- Validación de rangos numéricos
- Multi-select con límite de 20

### 3. Contexto de Onboarding

#### `OnboardingContext.tsx`

**Estado:**
```typescript
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  landlordType?: LandlordType;
  formData: Partial<LandlordFormData>;
  completionScore: number;
  skippedSteps: string[];
}
```

**Funcionalidades:**
- Auto-save con debounce de 500ms
- Carga de progreso guardado
- Cálculo automático de completion score
- Navegación entre pasos
- Manejo de pasos omitidos

**Métodos:**
- `setLandlordType(type)` - Establecer tipo de arrendador
- `updateFormData(data)` - Actualizar datos del formulario
- `nextStep()` - Avanzar al siguiente paso
- `previousStep()` - Retroceder un paso
- `skipStep(stepName)` - Omitir un paso
- `goToStep(step)` - Ir a un paso específico
- `saveProgress()` - Guardar progreso manualmente

### 4. Páginas del Onboarding

#### `/landlord/onboarding/welcome`
- Animación de icono de casa
- 3 beneficios con checkmarks
- Botón "Comenzar"
- Link "Ya tengo una cuenta"
- Auto-advance opcional después de 5s (comentado)

#### `/landlord/onboarding/type`
- Progress indicator (paso 1/5)
- 3 tarjetas de tipo de arrendador
- Panel de detalles cuando se selecciona un tipo
- Botón "Continuar" (disabled hasta selección)
- Info sobre cambio de tipo

#### `/landlord/onboarding/details`
- Progress indicator (paso 2/5)
- Renderiza formulario según tipo seleccionado
- Indicador de auto-save
- Botones "Atrás" y "Continuar"
- Link "Completar después"
- Redirect a /type si no hay tipo seleccionado

#### `/landlord/onboarding/photo`
- Progress indicator (paso 3/5)
- Estadística de 3x más consultas
- Componente ProfilePhotoUpload
- Recomendaciones en lista
- Botones de navegación
- Link "Omitir por ahora"

#### `/landlord/onboarding/verification`
- Progress indicator (paso 4/5)
- 4 cards de verificación:
  - Email (verificado automáticamente)
  - Teléfono (con modal de verificación)
  - Identidad (opcional, próximamente)
  - Documentos (premium, disabled)
- Panel de beneficios
- PhoneVerificationModal integrado

#### `/landlord/onboarding/complete`
- Animación de confetti
- Emoji de celebración
- Título "¡Tu perfil está listo!"
- Resumen del perfil creado
- Barra de completitud circular
- Badges ganados (si completion >= 80%)
- Botones:
  - "Publicar Propiedad" (primario)
  - "Explorar Dashboard" (secundario)
- Llama a `completeOnboarding` al montar
- Loading overlay durante finalización

### 5. Layout del Onboarding

**Características:**
- Header con logo de Heurekka
- Background con gradient sutil
- Container centrado max-w-2xl
- Footer con links y copyright
- OnboardingProvider envuelve todo

## Integración con Backend

### Hooks de tRPC Utilizados

Los siguientes hooks ya están implementados en `/src/hooks/landlord/useOnboarding.ts`:

```typescript
// Guardar progreso
useSaveOnboardingProgress()

// Obtener progreso guardado
useOnboardingProgress()

// Completar onboarding
useCompleteOnboarding()
```

### Flujo de Datos

1. **Auto-save**: OnboardingContext llama a `useSaveOnboardingProgress` cada 500ms cuando hay cambios
2. **Load Progress**: Al montar, carga progreso guardado con `useOnboardingProgress`
3. **Complete**: En la página final, llama a `useCompleteOnboarding`

## Validación y Schemas

Todos los formularios usan Zod para validación:

- **individualOwner.schema.ts**: Validación para propietarios individuales
- **realEstateAgent.schema.ts**: Validación para agentes inmobiliarios
- **propertyCompany.schema.ts**: Validación para empresas de gestión

Características de validación:
- Regex para nombres (solo letras y espacios)
- Formato de teléfono hondureño (9999-9999)
- Formato de RTN hondureño (0801-1990-123456)
- Validación de URLs
- Validación de emails
- Límites de caracteres
- Validación de rangos numéricos
- Arrays con min y max items

## Dependencias Instaladas

```json
{
  "sonner": "^2.0.7",              // Toast notifications
  "react-image-crop": "^11.0.10",  // Crop de imágenes
  "react-input-mask": "^2.0.4"     // Máscaras de input
}
```

## Rutas Implementadas

```
/landlord/onboarding           → Redirect a /welcome
/landlord/onboarding/welcome   → Página de bienvenida
/landlord/onboarding/type      → Selección de tipo
/landlord/onboarding/details   → Formulario de detalles
/landlord/onboarding/photo     → Upload de foto
/landlord/onboarding/verification → Verificación
/landlord/onboarding/complete  → Página de completado
```

## Styling y UX

### Colores Utilizados (según design system)
- Primary: `blue-600` (#2563EB)
- Success: `green-500` (#10B981)
- Error: `red-500` (#EF4444)
- Gray scale: `gray-50` a `gray-900`

### Animaciones
- Fade-in al cargar páginas
- Bounce en iconos
- Scale en hover de cards
- Confetti en página de completado
- Progress indicator animado
- Spinner de loading

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Inputs con altura mínima de 48px (touch-friendly)
- Grid adaptativo en formularios
- Stack vertical en mobile, horizontal en desktop

### Accesibilidad
- Labels en todos los inputs
- ARIA labels
- Focus visible
- Keyboard navigation
- Estados disabled
- Mensajes de error claros

## TODOs y Mejoras Futuras

1. **Integración con Backend Real**:
   - Conectar PhoneVerificationModal con endpoint real de SMS
   - Implementar upload real de foto a storage
   - Integrar verificación de identidad

2. **Protección de Rutas**:
   - Middleware para verificar autenticación
   - Redirect si ya tiene perfil completo
   - Prevenir navegación hacia atrás con confirmación

3. **Analytics**:
   - Tracking de eventos de onboarding
   - Tracking de drop-off points
   - A/B testing de flujos

4. **Tests**:
   - Unit tests para componentes
   - Integration tests para flujo completo
   - E2E tests con Playwright

5. **Performance**:
   - Lazy load de componentes pesados
   - Optimización de imágenes
   - Code splitting por ruta

6. **Mejoras de UX**:
   - Navegación con gestures (swipe)
   - Offline capability
   - Resume desde cualquier paso
   - Preview del perfil antes de completar

## Comandos Útiles

```bash
# Verificar tipos TypeScript
npm run type-check

# Ejecutar desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar tests
npm test
```

## Notas Importantes

1. **Auto-save**: El sistema guarda automáticamente cada 500ms. No es necesario botón de "Guardar".

2. **Validación**: Toda la validación se hace en el cliente Y en el servidor (schemas compartidos).

3. **Seguridad**:
   - Las imágenes se convierten a base64 antes de subir
   - Los inputs tienen validación contra XSS
   - Los formularios usan CSRF protection (implementado en backend)

4. **i18n**: Todo el texto visible está en español. Para internacionalización futura, extraer strings a archivos de traducción.

5. **Testing**: Los archivos de test se deben crear en `__tests__` dentro de cada directorio de componentes.

## Contacto y Soporte

Para preguntas sobre la implementación:
- Ver documentación en `/design-documentation/features/landlord-profile/`
- Revisar tipos en `/src/types/landlord.ts`
- Consultar schemas en `/src/schemas/landlord/`

---

**Última actualización**: 2025-10-03
**Versión**: 1.0.0
**Estado**: Implementación completa
