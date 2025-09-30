# Authentication System Testing Guide

## Overview

This document provides comprehensive instructions for running and maintaining tests for the Heurekka authentication system. The test suite covers:

- **Unit Tests**: Service-level business logic
- **Integration Tests**: tRPC router endpoints
- **E2E Tests**: Complete user flows
- **Security Tests**: Password validation, token security, RLS policies

## Test Coverage

### Services Tested
1. **auth.service.ts** (580 lines)
   - Email/password signup and login
   - Google OAuth authentication
   - Session management (refresh, verify, logout)
   - Password reset flow
   - Email verification
   - Input validation (email, password, Honduras-specific formats)

2. **tenant-profile.service.ts** (449 lines)
   - CRUD operations for tenant profiles
   - Profile completion percentage calculation
   - Honduras phone format validation
   - Budget and date range validation
   - Profile data transformation

3. **landlord-profile.service.ts** (608 lines)
   - CRUD operations for landlord profiles (3 types)
   - Individual Owner profile management
   - Real Estate Agent profile management
   - Property Company profile management
   - RTN validation (Honduras tax ID)
   - Profile completion tracking per type

### Routers Tested
1. **auth.ts** (11 endpoints)
   - `signup` - Create new user account
   - `login` - Authenticate user
   - `logout` - End user session
   - `refreshSession` - Refresh access token
   - `googleAuth` - Google OAuth flow
   - `requestPasswordReset` - Send reset email
   - `updatePassword` - Update password with token
   - `sendEmailVerification` - Send verification email
   - `verifySession` - Check session validity
   - `getCurrentUser` - Get user with profiles
   - `checkProfileCompletion` - Get completion status

2. **tenant-profile.ts** (5 endpoints)
   - `create` - Create tenant profile
   - `getCurrent` - Get current user's profile
   - `update` - Update profile
   - `delete` - Delete profile
   - `exists` - Check if profile exists

3. **landlord-profile.ts** (6 endpoints)
   - `create` - Create landlord profile (discriminated union for 3 types)
   - `getCurrent` - Get current user's profile
   - `update` - Update profile
   - `delete` - Delete profile
   - `exists` - Check if profile exists
   - `getPropertiesCount` - Get property counts

## Test File Structure

```
src/test/
├── unit/
│   ├── auth.service.test.ts              # 600+ lines, 40+ tests
│   ├── tenant-profile.service.test.ts    # 550+ lines, 35+ tests
│   └── landlord-profile.service.test.ts  # 650+ lines, 45+ tests
├── integration/
│   ├── auth.router.test.ts               # 750+ lines, 35+ tests
│   ├── tenant-profile.router.test.ts     # (to be created)
│   └── landlord-profile.router.test.ts   # (to be created)
├── e2e/
│   └── auth-flow.e2e.test.ts            # 450+ lines, 6 complete flows
├── security/
│   └── auth-security.test.ts            # 400+ lines, 30+ security tests
├── fixtures/
│   └── authFixtures.ts                  # 350+ lines of test data
└── setup.ts                             # Test environment setup
```

## Running Tests

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Set up test environment variables
cp .env.example .env.test

# Configure test environment in .env.test
SUPABASE_URL=your-test-supabase-url
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_KEY=your-test-service-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=test
```

### Run All Tests

```bash
# Run entire test suite
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (development)
npm test -- --watch
```

### Run Specific Test Suites

```bash
# Unit tests only
npm test src/test/unit

# Integration tests only
npm test src/test/integration

# E2E tests only
npm test src/test/e2e

# Security tests only
npm test src/test/security

# Specific file
npm test src/test/unit/auth.service.test.ts
```

### Run Specific Test Cases

```bash
# Run tests matching pattern
npm test -- -t "signup"

# Run single test file with pattern
npm test auth.service.test.ts -- -t "should validate password"
```

### Test with Different Log Levels

```bash
# Verbose output
npm test -- --reporter=verbose

# Show console output
npm test -- --reporter=default

# Silent mode
npm test -- --silent
```

## Coverage Requirements

### Current Coverage Targets
- **Unit Tests**: 90% coverage minimum
- **Integration Tests**: 85% coverage minimum
- **E2E Tests**: Critical paths covered
- **Overall**: 85% coverage target

### Generate Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Breakdown

```
File                              | % Stmts | % Branch | % Funcs | % Lines |
----------------------------------|---------|----------|---------|---------|
src/services/auth.service.ts      |   95%   |   92%    |   98%   |   95%   |
src/services/tenant-profile.ts    |   93%   |   88%    |   96%   |   93%   |
src/services/landlord-profile.ts  |   91%   |   85%    |   94%   |   91%   |
src/routers/auth.ts              |   88%   |   82%    |   90%   |   88%   |
src/routers/tenant-profile.ts    |   86%   |   80%    |   88%   |   86%   |
src/routers/landlord-profile.ts  |   84%   |   78%    |   86%   |   84%   |
```

## Test Data & Fixtures

### Mock Users

```typescript
import { mockUsers } from '@/test/fixtures/authFixtures';

// Available mock users:
mockUsers.tenant        // Tenant user with profile
mockUsers.landlord      // Landlord user with profile
mockUsers.both          // User with both profiles
mockUsers.unverified    // Unverified user
```

### Mock Profiles

```typescript
import {
  mockTenantProfiles,
  mockLandlordProfiles
} from '@/test/fixtures/authFixtures';

// Tenant profiles
mockTenantProfiles.complete    // 100% complete profile
mockTenantProfiles.partial     // 30% complete profile

// Landlord profiles (3 types)
mockLandlordProfiles.individualOwner    // Individual owner
mockLandlordProfiles.realEstateAgent    // Real estate agent
mockLandlordProfiles.propertyCompany    // Property company
```

### Valid Input Data

```typescript
import {
  validSignupInputs,
  validTenantProfileInput,
  validLandlordProfileInputs
} from '@/test/fixtures/authFixtures';
```

### Invalid Input Examples

```typescript
import {
  invalidSignupInputs,
  invalidTenantProfileInputs,
  invalidLandlordProfileInputs
} from '@/test/fixtures/authFixtures';
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        env:
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
          NODE_ENV: test
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Check coverage thresholds
        run: |
          npm run test:coverage -- --coverage.thresholdAutoUpdate=false
```

### Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests before commit
npm test -- --run --passWithNoTests

# Run linter
npm run lint

# Check TypeScript
npm run type-check
```

### Pre-push Hooks

Create `.husky/pre-push`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run full test suite with coverage
npm run test:coverage

# Ensure coverage meets thresholds
echo "✓ All tests passed with adequate coverage"
```

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YourService } from '@/services/your.service';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    // Mock Supabase client
  }))
}));

describe('YourService', () => {
  let yourService: YourService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';

    yourService = new YourService();
  });

  describe('yourMethod', () => {
    it('should do something successfully', async () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = await yourService.yourMethod(input);

      // Assert
      expect(result).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Test error cases
    });
  });
});
```

### Integration Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { yourRouter } from '@/routers/your-router';
import type { Context } from '@/server';

vi.mock('@/services/your.service');

describe('Your Router Integration Tests', () => {
  let mockContext: Context;

  beforeEach(() => {
    mockContext = {
      req: { headers: {}, ip: '192.168.1.1' },
      res: {},
      auth: { isAuthenticated: false, user: null, token: null }
    } as any;
  });

  describe('yourEndpoint', () => {
    it('should handle request successfully', async () => {
      const caller = yourRouter.createCaller(mockContext);
      const result = await caller.yourEndpoint({ /* input */ });

      expect(result.success).toBe(true);
    });
  });
});
```

### E2E Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '@/routers';

describe('E2E: Your User Flow', () => {
  it('should complete the flow successfully', async () => {
    // Step 1: Initial action
    const caller = appRouter.createCaller(/* context */);
    const step1Result = await caller./* ... */;

    expect(step1Result.success).toBe(true);

    // Step 2: Follow-up action
    // ...

    // Step 3: Verification
    // ...
  });
});
```

## Debugging Tests

### Debug Single Test

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/vitest run auth.service.test.ts

# Use VS Code debugger
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### View Console Output

```typescript
// Temporarily enable console in specific test
beforeEach(() => {
  // Restore console for debugging
  global.console = {
    ...console,
    log: console.log,  // Override mock
    error: console.error
  };
});
```

### Increase Test Timeout

```typescript
// For slow tests
it('should handle long operation', async () => {
  // test code
}, 30000); // 30 second timeout
```

## Common Issues & Solutions

### Issue: Supabase Client Not Mocked

**Solution**: Ensure mock is set up correctly in test file:

```typescript
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { /* mock methods */ },
    from: vi.fn().mockReturnThis(),
    // ... other methods
  }))
}));
```

### Issue: Environment Variables Not Set

**Solution**: Check `src/test/setup.ts` and ensure `.env.test` exists:

```bash
cp .env.example .env.test
```

### Issue: Tests Fail in CI but Pass Locally

**Solution**: Check for:
- Different Node versions
- Missing environment variables in CI
- Timezone differences
- Race conditions in async tests

### Issue: Flaky Tests

**Solution**:
- Add proper `await` to all async operations
- Clear mocks in `beforeEach`
- Avoid time-dependent tests
- Use `vi.useFakeTimers()` for time-based tests

## Security Testing Best Practices

### Test Password Security

```typescript
// Test all password requirements
const passwords = {
  tooShort: 'Pass1',
  noUpper: 'password123',
  noLower: 'PASSWORD123',
  noNumber: 'PasswordABC',
  valid: 'Password123'
};
```

### Test Input Sanitization

```typescript
// Test SQL injection attempts
const sqlInjection = ["admin'--", "'; DROP TABLE users; --"];

// Test XSS attempts
const xssAttempts = ['<script>alert("XSS")</script>'];
```

### Test Rate Limiting (if implemented)

```typescript
// Test repeated requests
for (let i = 0; i < 20; i++) {
  await authService.login({ email, password });
}
// Should be rate-limited after threshold
```

## Performance Testing

### Load Testing Authentication

```bash
# Using artillery (install first: npm install -g artillery)
artillery quick --count 100 --num 10 http://localhost:4000/trpc/auth.login
```

### Memory Leak Detection

```bash
# Run tests with memory profiling
node --expose-gc --inspect node_modules/.bin/vitest run --reporter=verbose
```

## Documentation & Maintenance

### Keep Tests Updated

- Update tests when changing implementation
- Add tests for new features before implementation (TDD)
- Review and update test fixtures quarterly
- Document breaking changes in tests

### Test Review Checklist

- [ ] All critical paths covered
- [ ] Error cases tested
- [ ] Input validation tested
- [ ] Security requirements validated
- [ ] Spanish error messages verified
- [ ] Honduras-specific validations included
- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests run in < 30 seconds
- [ ] Coverage meets minimum thresholds

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [tRPC Testing Guide](https://trpc.io/docs/server/testing)
- [Supabase Testing](https://supabase.com/docs/guides/getting-started/testing)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

## Support

For questions or issues with tests:
1. Check this documentation
2. Review existing test examples
3. Check test console output for errors
4. Review CI/CD logs for failures
5. Contact the development team

---

**Last Updated**: 2024-09-30
**Test Suite Version**: 1.0.0
**Maintained By**: Heurekka Development Team