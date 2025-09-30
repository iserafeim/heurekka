import { test, expect } from '@playwright/test';

test.describe('Landlord Authentication E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full landlord signup with type selection', async ({ page }) => {
    // Click "Publicar Propiedad" button
    await page.click('button:has-text("Publicar Propiedad")');

    // Wait for auth modal
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Publica tu Propiedad y Recibe Inquilinos Calificados')).toBeVisible();

    // Verify value propositions
    await expect(page.locator('text=Inquilinos verificados')).toBeVisible();
    await expect(page.locator('text=Dashboard de leads')).toBeVisible();

    // Verify platform stats
    await expect(page.locator('text=10,000+')).toBeVisible();
    await expect(page.locator('text=Inquilinos activos')).toBeVisible();

    // Fill signup form
    await page.fill('input[type="email"]', `landlord-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Submit signup
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    // Wait for type selection step
    await expect(page.locator('text=¿Cómo te describes?')).toBeVisible();
    await expect(page.locator('text=Paso 2 de 3')).toBeVisible();

    // Verify all landlord type options
    await expect(page.locator('text=Propietario Individual')).toBeVisible();
    await expect(page.locator('text=Agente Inmobiliario')).toBeVisible();
    await expect(page.locator('text=Empresa Inmobiliaria')).toBeVisible();

    // Select landlord type
    await page.click('button:has-text("Propietario Individual")');

    // Wait for profile creation (placeholder for now)
    await expect(page.locator('text=Landlord Profile Form')).toBeVisible();
  });

  test('should select Real Estate Agent type', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', `agent-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=¿Cómo te describes?')).toBeVisible();

    // Click Real Estate Agent card
    await page.click('button:has-text("Agente Inmobiliario")');

    await expect(page.locator('text=Landlord Profile Form for real_estate_agent')).toBeVisible();
  });

  test('should select Property Company type', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', `company-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=¿Cómo te describes?')).toBeVisible();

    // Click Property Company card
    await page.click('button:has-text("Empresa Inmobiliaria")');

    await expect(page.locator('text=Landlord Profile Form for property_company')).toBeVisible();
  });

  test('should navigate back from type selection', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', `landlord-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=¿Cómo te describes?')).toBeVisible();

    // Click back button
    await page.click('button:has-text("← Atrás")');

    await expect(page.locator('text=Publica tu Propiedad y Recibe Inquilinos Calificados')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=Ingresa un correo electrónico válido')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', 'landlord@test.com');
    await page.fill('input[type="password"]', 'short');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=La contraseña debe tener al menos 8 caracteres')).toBeVisible();
  });

  test('should switch between signup and login', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await expect(page.locator('text=Publica tu Propiedad')).toBeVisible();

    await page.click('button:has-text("Iniciar Sesión")');
    await expect(page.locator('text=Accede a tu cuenta de anunciante')).toBeVisible();

    await page.click('button:has-text("Crear Cuenta")');
    await expect(page.locator('text=Publica tu Propiedad y Recibe Inquilinos Calificados')).toBeVisible();
  });

  test('should show security badge', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await expect(page.locator('text=Tus datos están seguros')).toBeVisible();
  });

  test('should show terms for advertisers link', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    const termsLink = page.locator('a:has-text("Términos para Anunciantes")');
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', '/terminos-anunciantes');
  });

  test('should display platform statistics', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    // Verify all stats are visible
    await expect(page.locator('text=10,000+')).toBeVisible();
    await expect(page.locator('text=500+')).toBeVisible();
    await expect(page.locator('text=48hr')).toBeVisible();
    await expect(page.locator('text=95%')).toBeVisible();

    // Verify stat labels
    await expect(page.locator('text=Inquilinos activos')).toBeVisible();
    await expect(page.locator('text=Propiedades alquiladas')).toBeVisible();
    await expect(page.locator('text=Promedio para alquilar')).toBeVisible();
    await expect(page.locator('text=Satisfacción')).toBeVisible();
  });

  test('should handle Google OAuth', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    const googleButton = page.locator('button:has-text("Registrarse con Google")');
    await expect(googleButton).toBeVisible();

    // Click would trigger OAuth flow
    // await googleButton.click();
    // Note: OAuth flow would require mocking or integration with test accounts
  });

  test('should have hover effects on type selection cards', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', `landlord-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=¿Cómo te describes?')).toBeVisible();

    // Hover over Individual Owner card
    const individualCard = page.locator('button:has-text("Propietario Individual")');
    await individualCard.hover();

    // Card should have hover styles (verified through class existence)
    const cardClass = await individualCard.getAttribute('class');
    expect(cardClass).toContain('hover:border-primary');
  });

  test('should show colored icons for each landlord type', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', `landlord-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    await expect(page.locator('text=¿Cómo te describes?')).toBeVisible();

    // Verify icons are present (svg elements within cards)
    const individualCard = page.locator('button:has-text("Propietario Individual")');
    const agentCard = page.locator('button:has-text("Agente Inmobiliario")');
    const companyCard = page.locator('button:has-text("Empresa Inmobiliaria")');

    await expect(individualCard.locator('svg')).toBeVisible();
    await expect(agentCard.locator('svg')).toBeVisible();
    await expect(companyCard.locator('svg')).toBeVisible();
  });
});

test.describe('Landlord Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete login flow', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');

    // Switch to login
    await page.click('button:has-text("Iniciar Sesión")');

    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
    await expect(page.locator('text=Accede a tu cuenta de anunciante')).toBeVisible();

    // Fill login form
    await page.fill('input[type="email"]', 'existing-landlord@test.com');
    await page.fill('input[type="password"]', 'password123');

    // Check remember me
    await page.check('input#remember-landlord');

    // Submit login
    await page.click('button:has-text("Iniciar Sesión")');

    // Would redirect to dashboard or listing creation
  });

  test('should show forgot password link', async ({ page }) => {
    await page.click('button:has-text("Publicar Propiedad")');
    await page.click('button:has-text("Iniciar Sesión")');

    const forgotLink = page.locator('a:has-text("¿Olvidaste tu contraseña?")');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute('href', '/recuperar-contrasena');
  });
});

test.describe('Landlord Authentication - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab to publish button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(page.locator('role=dialog')).toBeVisible();

    // Navigate through form
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Registrarse con Google")')).toBeFocused();
  });

  test('should have correct ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Publicar Propiedad")');

    const dialog = page.locator('role=dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('should announce type selection options', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Publicar Propiedad")');

    await page.fill('input[type="email"]', `landlord-${Date.now()}@test.com`);
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Crear Cuenta Empresarial")');

    // Verify all options have clear text for screen readers
    const individualBtn = page.locator('button:has-text("Propietario Individual")');
    await expect(individualBtn).toContainText('Alquilo mi propia propiedad');

    const agentBtn = page.locator('button:has-text("Agente Inmobiliario")');
    await expect(agentBtn).toContainText('Gestiono propiedades para clientes');

    const companyBtn = page.locator('button:has-text("Empresa Inmobiliaria")');
    await expect(companyBtn).toContainText('Representamos múltiples propiedades');
  });
});