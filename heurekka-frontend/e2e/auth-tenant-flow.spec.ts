import { test, expect } from '@playwright/test';

test.describe('Tenant Authentication E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a property listing page
    await page.goto('/property/test-property-123');
  });

  test('should complete full tenant signup and contact property owner', async ({ page }) => {
    // Click contact button to trigger auth modal
    await page.click('button:has-text("Contactar Propietario")');

    // Wait for auth modal to appear
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Crea tu Cuenta para Contactar al Propietario')).toBeVisible();

    // Verify property context is shown
    await expect(page.locator('text=Casa en Tegucigalpa')).toBeVisible();

    // Fill signup form
    await page.fill('input[type="email"]', `tenant-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Submit signup
    await page.click('button:has-text("Crear Cuenta")');

    // Wait for profile creation step
    await expect(page.locator('text=Completa tu Perfil de Inquilino')).toBeVisible();
    await expect(page.locator('text=Paso 2 de 2')).toBeVisible();

    // Fill personal information
    await page.fill('input[placeholder="María García"]', 'Juan Pérez');
    await page.fill('input[placeholder="9999-9999"]', '99998888');
    await page.fill('input[placeholder="Ingeniera en Sistemas"]', 'Ingeniero en Sistemas');

    // Verify phone auto-formatting
    const phoneInput = page.locator('input[placeholder="9999-9999"]');
    await expect(phoneInput).toHaveValue('9999-8888');

    // Fill search preferences
    await page.fill('input[placeholder="10,000"]', '10000');
    await page.fill('input[placeholder="20,000"]', '20000');

    // Select move date (today + 30 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);

    // Select occupants
    await page.selectOption('select', '2 adultos');

    // Add preferred areas
    await page.fill('input[placeholder="Agregar zona..."]', 'Col. Palmira');
    await page.click('button:has-text("Agregar")');
    await expect(page.locator('text=Col. Palmira')).toBeVisible();

    // Select property types (apartment is default, add house)
    await page.check('input[type="checkbox"] ~ span:has-text("Casa")');

    // Fill additional information
    await page.check('input[type="radio"] ~ span:has-text("No tengo mascotas")');
    await page.check('input[type="checkbox"] ~ span:has-text("Puedo proporcionar referencias")');
    await page.fill('textarea', 'Soy una persona responsable buscando una vivienda estable.');

    // Submit profile
    await page.click('button:has-text("Crear Perfil y Contactar")');

    // Verify success and WhatsApp redirect
    await expect(page).toHaveURL(/wa\.me/);
  });

  test('should validate email format', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Crear Cuenta")');

    await expect(page.locator('text=Ingresa un correo electrónico válido')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    await page.fill('input[type="email"]', 'tenant@test.com');
    await page.fill('input[type="password"]', 'short');
    await page.click('button:has-text("Crear Cuenta")');

    await expect(page.locator('text=La contraseña debe tener al menos 8 caracteres')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    await page.click('button[aria-label="Mostrar contraseña"]');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();

    await page.click('button[aria-label="Ocultar contraseña"]');
    await expect(passwordInput).toBeVisible();
  });

  test('should switch between signup and login', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    await expect(page.locator('text=Crea tu Cuenta')).toBeVisible();

    await page.click('button:has-text("Iniciar Sesión")');
    await expect(page.locator('text=Bienvenido de vuelta')).toBeVisible();

    await page.click('button:has-text("Crear Cuenta")');
    await expect(page.locator('text=Crea tu Cuenta para Contactar al Propietario')).toBeVisible();
  });

  test('should close modal on backdrop click', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Click backdrop (dialog element itself)
    await page.locator('role=dialog').click({ position: { x: 10, y: 10 } });

    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should close modal on Escape key', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');
    await expect(page.locator('role=dialog')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should close modal on close button', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');
    await expect(page.locator('role=dialog')).toBeVisible();

    await page.click('button[aria-label="Cerrar"]');

    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should navigate with keyboard (Tab)', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    await page.keyboard.press('Tab'); // Focus email
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Focus password
    await expect(page.locator('input[type="password"]')).toBeFocused();
  });

  test('should validate profile form fields', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    // Complete signup
    await page.fill('input[type="email"]', `tenant-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta")');

    // Wait for profile step
    await expect(page.locator('text=Completa tu Perfil de Inquilino')).toBeVisible();

    // Try to submit without filling required fields
    await page.click('button:has-text("Crear Perfil y Contactar")');

    // Verify validation errors
    await expect(page.locator('text=El nombre debe tener al menos 3 caracteres')).toBeVisible();
    await expect(page.locator('text=Formato inválido')).toBeVisible();
  });

  test('should limit preferred areas to 5', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    // Complete signup
    await page.fill('input[type="email"]', `tenant-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta")');

    await expect(page.locator('text=Completa tu Perfil de Inquilino')).toBeVisible();

    // Add 5 areas
    for (let i = 1; i <= 5; i++) {
      await page.fill('input[placeholder="Agregar zona..."]', `Zona ${i}`);
      await page.click('button:has-text("Agregar")');
    }

    // Verify button is disabled
    const addButton = page.locator('button:has-text("Agregar")');
    await expect(addButton).toBeDisabled();

    // Verify input is disabled
    const areaInput = page.locator('input[placeholder="Agregar zona..."]');
    await expect(areaInput).toBeDisabled();
  });

  test('should validate budget range', async ({ page }) => {
    await page.click('button:has-text("Contactar Propietario")');

    // Complete signup
    await page.fill('input[type="email"]', `tenant-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta")');

    await expect(page.locator('text=Completa tu Perfil de Inquilino')).toBeVisible();

    // Fill required fields
    await page.fill('input[placeholder="María García"]', 'Juan Pérez');
    await page.fill('input[placeholder="9999-9999"]', '99998888');

    // Enter invalid budget range (max < min)
    await page.fill('input[placeholder="10,000"]', '20000');
    await page.fill('input[placeholder="20,000"]', '10000');

    await page.click('button:has-text("Crear Perfil y Contactar")');

    await expect(page.locator('text=El máximo debe ser mayor al mínimo')).toBeVisible();
  });
});

test.describe('Tenant Authentication - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile layout', async ({ page }) => {
    await page.goto('/property/test-property-123');
    await page.click('button:has-text("Contactar Propietario")');

    // Modal should be full-screen on mobile
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();

    // Check for mobile-specific classes or full-screen behavior
    const modalContent = page.locator('role=dialog > div');
    const boundingBox = await modalContent.boundingBox();

    // Modal should take full height on mobile
    expect(boundingBox?.height).toBeGreaterThan(600);
  });

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/property/test-property-123');
    await page.click('button:has-text("Contactar Propietario")');

    // Tap to fill form
    await page.tap('input[type="email"]');
    await page.fill('input[type="email"]', 'mobile@test.com');

    await page.tap('input[type="password"]');
    await page.fill('input[type="password"]', 'password123');

    // Verify inputs work with touch
    await expect(page.locator('input[type="email"]')).toHaveValue('mobile@test.com');
  });
});

test.describe('Tenant Authentication - Accessibility', () => {
  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/property/test-property-123');

    // Navigate to contact button with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(page.locator('role=dialog')).toBeVisible();

    // Navigate through form with Tab
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Continuar con Google")')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
  });

  test('should have correct ARIA labels', async ({ page }) => {
    await page.goto('/property/test-property-123');
    await page.click('button:has-text("Contactar Propietario")');

    const dialog = page.locator('role=dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title');

    const closeButton = page.locator('button[aria-label="Cerrar"]');
    await expect(closeButton).toBeVisible();
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/property/test-property-123');
    await page.click('button:has-text("Contactar Propietario")');

    await page.fill('input[type="email"]', 'invalid');
    await page.click('button:has-text("Crear Cuenta")');

    const errorMessage = page.locator('role=alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Ingresa un correo electrónico válido');
  });
});