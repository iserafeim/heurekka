# Authentication Testing - Quick Reference Guide

## 🚀 Run Tests

```bash
# Unit & Integration Tests
npm run test                    # Run all tests
npm run test:watch              # Watch mode (development)
npm run test:coverage           # With coverage report
npm run test -- FormInput       # Specific file

# E2E Tests
npm run test:e2e                # All E2E tests
npm run test:e2e:ui             # With Playwright UI
npm run test:e2e:debug          # Debug mode
npx playwright test auth-tenant # Specific E2E file
```

---

## 📁 Test File Locations

```
src/components/auth/__tests__/
├── AuthModal.test.tsx              # 48 tests
├── FormInput.test.tsx              # 40 tests
├── GoogleAuthButton.test.tsx       # 30 tests
├── SuccessAnimation.test.tsx       # 25 tests
├── TenantProfileForm.test.tsx      # 45 tests
└── integration/
    └── TenantAuthFlow.integration.test.tsx  # 35 tests

e2e/
├── auth-tenant-flow.spec.ts        # 30+ scenarios
└── auth-landlord-flow.spec.ts      # 25+ scenarios
```

---

## 🧪 Writing New Tests

### Unit Test Template

```typescript
import { render, screen } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockClick = jest.fn();

    render(<MyComponent onClick={mockClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Flow', () => {
  test('should complete user journey', async ({ page }) => {
    await page.goto('/');

    await page.click('button:has-text("Action")');
    await expect(page.locator('role=dialog')).toBeVisible();

    await page.fill('input[type="email"]', 'test@test.com');
    await page.click('button:has-text("Submit")');

    await expect(page).toHaveURL('/success');
  });
});
```

---

## 🔍 Common Test Queries

```typescript
// Semantic queries (preferred)
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email')
screen.getByText('Error message')
screen.getByPlaceholderText('Enter email')

// Accessibility
screen.getByRole('alert')
screen.getByRole('dialog')

// Multiple elements
screen.getAllByRole('checkbox')

// Query variants
getBy... // Throws if not found
queryBy... // Returns null if not found
findBy... // Async, waits for element
```

---

## ✅ Common Assertions

```typescript
// Existence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Values
expect(input).toHaveValue('test@email.com')
expect(checkbox).toBeChecked()

// Attributes
expect(button).toHaveAttribute('aria-label', 'Close')
expect(input).toBeDisabled()

// Classes
expect(element).toHaveClass('bg-primary')

// Text content
expect(element).toHaveTextContent('Hello')
```

---

## 🎯 Testing Checklist

### For Each Component
- [ ] Renders correctly
- [ ] Props work as expected
- [ ] User interactions (click, type, etc.)
- [ ] Error states
- [ ] Loading states
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Spanish language text
- [ ] Responsive behavior
- [ ] Edge cases

### For Each Form
- [ ] Required field validation
- [ ] Format validation (email, phone)
- [ ] Length validation (min/max)
- [ ] Error message display
- [ ] Successful submission
- [ ] Backend error handling
- [ ] Loading state during submission

### For Each Flow
- [ ] Happy path (success scenario)
- [ ] Error scenarios
- [ ] Navigation between steps
- [ ] Data persistence
- [ ] Backend integration
- [ ] User feedback (success/error)

---

## 🚨 Debugging Tests

### Unit Test Debugging

```typescript
// Print DOM
import { screen, debug } from '@testing-library/react';
debug(); // Prints entire DOM
debug(screen.getByRole('button')); // Prints specific element

// Check what queries are available
screen.logTestingPlaygroundURL();

// Wait for async operations
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

### E2E Test Debugging

```bash
# Run in debug mode
npm run test:e2e:debug

# Run with headed browser
npx playwright test --headed

# Slow down execution
npx playwright test --slow-mo=1000

# Take screenshot on failure
# (already configured in playwright.config.ts)
```

### Common Issues

**Issue**: Element not found
```typescript
// Solution: Use findBy for async elements
await screen.findByText('Async content');
```

**Issue**: Act warning
```typescript
// Solution: Wrap state updates in act
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

**Issue**: Timer-related flakiness
```typescript
// Solution: Use fake timers
jest.useFakeTimers();
jest.advanceTimersByTime(2000);
jest.useRealTimers();
```

---

## 📊 Coverage Thresholds

Located in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

View coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## 🔧 Mock Utilities

### Using tRPC Mocks

```typescript
import { mockTrpcClient } from '@/test/mocks/trpc.mock';

// Mock mutation success
mockTrpcClient.auth.signup.useMutation.mockReturnValue({
  mutateAsync: jest.fn().mockResolvedValue({ success: true }),
  isLoading: false,
});

// Mock mutation error
mockTrpcClient.auth.signup.useMutation.mockReturnValue({
  mutateAsync: jest.fn().mockRejectedValue(new Error('Error')),
  isLoading: false,
});
```

### Using Auth Store Mocks

```typescript
import { mockAuthStore, setMockUser } from '@/test/mocks/auth-store.mock';

// Set authenticated user
setMockUser({ id: '123', email: 'test@test.com' });

// Mock sign in
mockAuthStore.signIn.mockResolvedValue(undefined);
```

---

## 🎨 Accessibility Testing

```typescript
// ARIA attributes
expect(dialog).toHaveAttribute('aria-modal', 'true');
expect(button).toHaveAttribute('aria-label', 'Close');

// Roles
expect(screen.getByRole('dialog')).toBeVisible();
expect(screen.getByRole('alert')).toHaveTextContent('Error');

// Keyboard navigation
const user = userEvent.setup();
await user.tab(); // Tab to next element
await user.keyboard('{Escape}'); // Press Escape
```

---

## 📱 Responsive Testing (E2E)

```typescript
test.describe('Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile layout', async ({ page }) => {
    await page.goto('/');
    // Test mobile-specific behavior
  });
});

test.describe('Desktop View', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should display desktop layout', async ({ page }) => {
    await page.goto('/');
    // Test desktop-specific behavior
  });
});
```

---

## 🌐 Spanish Language Testing

Every test should verify Spanish text:

```typescript
// UI Text
expect(screen.getByText('Crear Cuenta')).toBeInTheDocument();

// Error Messages
expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument();

// Validation Messages
expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument();

// Helper Text
expect(screen.getByText('Formato: 9999-9999')).toBeInTheDocument();
```

---

## 🎯 Test Patterns

### Testing Form Validation

```typescript
it('should validate email format', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  const emailInput = screen.getByLabelText(/correo/i);
  const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

  await user.type(emailInput, 'invalid-email');
  await user.click(submitButton);

  expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument();
});
```

### Testing Async Operations

```typescript
it('should submit form successfully', async () => {
  const user = userEvent.setup();
  const mockMutate = jest.fn().mockResolvedValue({ success: true });

  render(<ProfileForm />);

  await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
  await user.click(screen.getByRole('button', { name: /crear perfil/i }));

  await waitFor(() => {
    expect(mockMutate).toHaveBeenCalled();
  });
});
```

### Testing Error States

```typescript
it('should display error message', async () => {
  const user = userEvent.setup();
  const mockMutate = jest.fn().mockRejectedValue(new Error('Network error'));

  render(<SignupForm />);

  await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
});
```

---

## 📚 Resources

- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

---

## 💡 Pro Tips

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Focus on what users see and do, not implementation
3. **Keep tests isolated**: Each test should be independent
4. **Use descriptive names**: Test names should explain what and why
5. **Test accessibility**: Always verify ARIA labels and keyboard navigation
6. **Mock only external deps**: Keep tests as realistic as possible
7. **Verify Spanish text**: All user-facing text must be in Spanish
8. **Test responsive**: Cover mobile, tablet, and desktop views

---

**Version**: 1.0.0
**Last Updated**: January 30, 2025