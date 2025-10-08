/**
 * E2E Test: Tenant Profile Completion Flow
 * Tests the complete profile completion wizard flow
 */

import { test, expect } from '@playwright/test';

test.describe('Tenant Profile Completion', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tenant dashboard (assuming user is already logged in)
    // In a real scenario, you'd implement login first
    await page.goto('/tenant/profile/complete');
  });

  test('should complete tenant profile successfully', async ({ page }) => {
    // Step 1: Personal Info
    await expect(page.getByRole('heading', { name: /Información Personal/i })).toBeVisible();

    await page.fill('[name="fullName"]', 'María Rodríguez');
    await page.fill('[name="phone"]', '9999-9999');
    await page.click('button:has-text("Continuar")');

    // Step 2: Search Preferences
    await expect(page.getByRole('heading', { name: /Preferencias de Búsqueda/i })).toBeVisible();

    // Set budget using slider
    // Note: Slider interaction might need adjustment based on your implementation
    const budgetMinSlider = page.locator('input[type="hidden"][name="budgetMin"]');
    const budgetMaxSlider = page.locator('input[type="hidden"][name="budgetMax"]');
    await expect(budgetMinSlider).toBeAttached();
    await expect(budgetMaxSlider).toBeAttached();

    // Select at least one area
    await page.click('button:has-text("Lomas del Guijarro")');

    // Select at least one property type
    await page.click('button:has-text("Apartamento")');

    await page.click('button:has-text("Continuar")');

    // Step 3: Optional Details
    await expect(page.getByRole('heading', { name: /Información Opcional/i })).toBeVisible();

    await page.fill('[name="occupation"]', 'Ingeniero de Software');
    await page.selectOption('[name="occupants"]', '1');

    // Toggle pets switch
    const petsSwitch = page.locator('[id="hasPets"]');
    await petsSwitch.click();

    // Fill pet details (conditional field)
    await page.fill('[name="petDetails"]', '1 perro pequeño, bien entrenado');

    await page.click('button:has-text("Completar Perfil")');

    // Assert redirect to dashboard
    await expect(page).toHaveURL(/\/tenant\/dashboard/);

    // Assert success toast/message
    await expect(page.getByText(/Perfil completado/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields in Step 1', async ({ page }) => {
    // Try to continue without filling required fields
    await page.click('button:has-text("Continuar")');

    // Assert validation errors
    await expect(page.getByText(/El nombre debe tener al menos 3 caracteres/i)).toBeVisible();
    await expect(page.getByText(/Formato: 9999-9999/i)).toBeVisible();
  });

  test('should validate required fields in Step 2', async ({ page }) => {
    // Complete Step 1
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="phone"]', '9999-9999');
    await page.click('button:has-text("Continuar")');

    // Try to continue without selecting areas or property types
    await page.click('button:has-text("Continuar")');

    // Assert validation errors
    await expect(page.getByText(/Selecciona al menos una zona/i)).toBeVisible();
    await expect(page.getByText(/Selecciona al menos un tipo de propiedad/i)).toBeVisible();
  });

  test('should allow navigation back and forth between steps', async ({ page }) => {
    // Step 1
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="phone"]', '9999-9999');
    await page.click('button:has-text("Continuar")');

    // Step 2
    await expect(page.getByRole('heading', { name: /Preferencias de Búsqueda/i })).toBeVisible();

    // Go back
    await page.click('button:has-text("Atrás")');

    // Verify we're back at Step 1
    await expect(page.getByRole('heading', { name: /Información Personal/i })).toBeVisible();

    // Verify data persists
    await expect(page.locator('[name="fullName"]')).toHaveValue('Test User');
    await expect(page.locator('[name="phone"]')).toHaveValue('9999-9999');
  });

  test('should skip optional step', async ({ page }) => {
    // Complete Step 1
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="phone"]', '9999-9999');
    await page.click('button:has-text("Continuar")');

    // Complete Step 2
    await page.click('button:has-text("Lomas del Guijarro")');
    await page.click('button:has-text("Apartamento")');
    await page.click('button:has-text("Continuar")');

    // Skip Step 3
    await page.click('button:has-text("Omitir")');

    // Assert redirect to dashboard
    await expect(page).toHaveURL(/\/tenant\/dashboard/);
  });

  test('should show pet details field only when pets toggle is enabled', async ({ page }) => {
    // Navigate to Step 3
    await page.fill('[name="fullName"]', 'Test User');
    await page.fill('[name="phone"]', '9999-9999');
    await page.click('button:has-text("Continuar")');

    await page.click('button:has-text("Lomas del Guijarro")');
    await page.click('button:has-text("Apartamento")');
    await page.click('button:has-text("Continuar")');

    // Pet details should not be visible initially
    await expect(page.locator('[name="petDetails"]')).not.toBeVisible();

    // Enable pets toggle
    await page.locator('[id="hasPets"]').click();

    // Pet details should now be visible
    await expect(page.locator('[name="petDetails"]')).toBeVisible();
  });
});
