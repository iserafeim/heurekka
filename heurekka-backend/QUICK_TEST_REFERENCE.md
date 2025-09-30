# Quick Test Reference Guide

## Fast Commands

```bash
# Run everything
npm test

# With coverage
npm run test:coverage

# Watch mode
npm test -- --watch

# Specific file
npm test auth.service.test.ts

# Pattern match
npm test -- -t "signup"

# Silent mode
npm test -- --silent
```

## Test Files Location

```
src/test/
├── unit/                    # Service tests
│   ├── auth.service.test.ts
│   ├── tenant-profile.service.test.ts
│   └── landlord-profile.service.test.ts
├── integration/             # Router tests
│   └── auth.router.test.ts
├── e2e/                     # User flow tests
│   └── auth-flow.e2e.test.ts
├── security/                # Security tests
│   └── auth-security.test.ts
└── fixtures/                # Test data
    └── authFixtures.ts
```

## Quick Test by Feature

```bash
# Authentication
npm test auth.service.test.ts
npm test auth.router.test.ts

# Tenant Profiles
npm test tenant-profile.service.test.ts

# Landlord Profiles
npm test landlord-profile.service.test.ts

# E2E Flows
npm test auth-flow.e2e.test.ts

# Security
npm test auth-security.test.ts
```

## Test Statistics

- **Total Tests**: 191+
- **Total Lines**: 2,500+
- **Coverage**: 90%
- **Endpoints**: 22
- **Services**: 3

## Key Test Scenarios

### Auth Service (40+ tests)
✅ Signup, Login, Logout
✅ Session Refresh
✅ Password Reset
✅ Google OAuth
✅ Validation

### Tenant Profile (35+ tests)
✅ CRUD Operations
✅ Completion Tracking
✅ Phone Validation (9999-9999)
✅ Budget & Date Validation

### Landlord Profile (45+ tests)
✅ 3 Profile Types
✅ Individual Owner
✅ Real Estate Agent
✅ Property Company
✅ RTN Validation (14 digits)

### Auth Router (35+ tests)
✅ All 11 Endpoints
✅ Input Validation
✅ Error Handling
✅ Spanish Messages

### E2E Flows (6 flows)
✅ Signup → Profile → Login
✅ Password Reset
✅ Context Upgrade
✅ Google OAuth
✅ Session Refresh
✅ Profile Completion

### Security (30+ tests)
✅ Password Strength
✅ Token Security
✅ Input Sanitization
✅ RLS Documentation

## Common Test Patterns

### Unit Test
```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ServiceName();
  });

  it('should do something', async () => {
    const result = await service.method(input);
    expect(result).toBeDefined();
  });
});
```

### Integration Test
```typescript
const caller = router.createCaller(context);
const result = await caller.endpoint(input);
expect(result.success).toBe(true);
```

### E2E Test
```typescript
// Step 1
const result1 = await caller.auth.signup(input);
// Step 2
const result2 = await caller.tenantProfile.create(profile);
// Verify
expect(result2.success).toBe(true);
```

## Validation Rules Quick Reference

### Password
- Min 8 characters
- Uppercase required
- Lowercase required
- Number required

### Email
- Standard format
- Must have @ and domain

### Honduras Phone
- Format: 9999-9999
- Exactly 8 digits with dash

### Honduras RTN
- Exactly 14 digits
- Numbers only

### Budget
- Min < Max
- Minimum 1,000 Lempiras

### Move Date
- Future date
- Within 6 months

## Spanish Error Messages

```typescript
// Auth
'Correo electrónico inválido'
'La contraseña debe tener al menos 8 caracteres'
'La contraseña debe incluir mayúsculas, minúsculas y números'
'Ya existe una cuenta con este correo electrónico'
'Correo o contraseña incorrectos'

// Tenant Profile
'El nombre completo debe tener al menos 3 caracteres'
'El teléfono debe tener el formato 9999-9999'
'El presupuesto máximo debe ser mayor al mínimo'
'La fecha de mudanza debe estar entre hoy y 6 meses'

// Landlord Profile
'El nombre completo es requerido (mínimo 3 caracteres)'
'RTN debe tener 14 dígitos'
'Debe especificar al menos una zona de cobertura'
'Debe especificar al menos una zona de operación'
```

## Test Fixtures

```typescript
import {
  mockUsers,
  mockSessions,
  validSignupInputs,
  validTenantProfileInput,
  validLandlordProfileInputs,
  mockTenantProfiles,
  mockLandlordProfiles,
  spanishErrorMessages
} from '@/test/fixtures/authFixtures';
```

## Debugging

```bash
# Enable console
# Modify test file beforeEach
global.console = { ...console, log: console.log };

# Increase timeout
it('test', async () => { /* ... */ }, 30000);

# VS Code Debug
# Use F5 with debug configuration
```

## Coverage Targets

- Overall: 85%
- Auth Service: 95%
- Tenant Service: 93%
- Landlord Service: 91%
- Routers: 88%

## CI/CD Quick Setup

```bash
# Copy workflow file
cp .github/workflows/test.yml.example .github/workflows/test.yml

# Setup secrets in GitHub
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY

# Enable branch protection
# Require tests to pass before merge
```

## Troubleshooting

### Tests fail locally
```bash
# Clear mocks
npm test -- --clearCache

# Check env
cat .env.test

# Update deps
npm install
```

### Tests fail in CI
- Check GitHub secrets
- Verify Node version
- Check environment variables
- Review CI logs

### Flaky tests
- Add proper awaits
- Clear mocks in beforeEach
- Avoid time-dependent tests
- Use vi.useFakeTimers()

## Need More Help?

📖 Full Documentation: `/AUTHENTICATION_TESTING.md`
📊 Detailed Summary: `/TEST_DELIVERABLES_SUMMARY.md`
🔧 Test Setup: `/src/test/setup.ts`
📦 Test Fixtures: `/src/test/fixtures/authFixtures.ts`

## Quick Wins

```bash
# Run tests before commit
npm test -- --run

# Check coverage before PR
npm run test:coverage

# Verify specific feature
npm test auth.service.test.ts -- -t "signup"

# Watch during development
npm test auth.service.test.ts -- --watch
```

---

**Quick Reference Version**: 1.0.0
**Last Updated**: 2024-09-30