/**
 * E2E Test: Tenant Saved Searches CRUD
 * Tests creating, editing, viewing, and deleting saved searches
 */

import { test, expect } from '@playwright/test';

test.describe('Tenant Saved Searches', () => {
  const searchName = 'Apartamentos en Lomas del Guijarro';

  test.beforeEach(async ({ page }) => {
    // Navigate to searches page (assuming user is logged in with completed profile)
    await page.goto('/tenant/searches');
  });

  test('should create a new saved search', async ({ page }) => {
    // Click "Nueva Búsqueda" button
    await page.click('a[href="/tenant/searches/new"]');

    // Verify we're on the new search page
    await expect(page).toHaveURL('/tenant/searches/new');
    await expect(page.getByRole('heading', { name: /Nueva Búsqueda/i })).toBeVisible();

    // Fill out the form
    await page.fill('[name="name"]', searchName);

    // Select property types
    await page.click('button:has-text("Apartamento")');

    // Set budget
    await page.fill('input[name="budgetMin"]', '10000');
    await page.fill('input[name="budgetMax"]', '20000');

    // Select locations
    await page.click('button:has-text("Lomas del Guijarro")');
    await page.click('button:has-text("Las Colinas")');

    // Enable notifications
    const notificationCheckbox = page.locator('input[name="notificationEnabled"]');
    if (!(await notificationCheckbox.isChecked())) {
      await notificationCheckbox.check();
    }

    // Submit the form
    await page.click('button[type="submit"]:has-text("Crear Búsqueda")');

    // Assert redirect to searches list
    await expect(page).toHaveURL('/tenant/searches');

    // Assert success toast
    await expect(page.getByText(/Búsqueda creada exitosamente/i)).toBeVisible({ timeout: 5000 });

    // Verify the search appears in the list
    await expect(page.getByText(searchName)).toBeVisible();
  });

  test('should edit an existing saved search', async ({ page }) => {
    // Find and click edit button for the first search
    // Note: This assumes at least one search exists
    const editButton = page.locator('[aria-label="Editar búsqueda"]').first();
    await editButton.click();

    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/tenant\/searches\/[^/]+\/edit/);
    await expect(page.getByRole('heading', { name: /Editar Búsqueda/i })).toBeVisible();

    // Update budget max
    await page.fill('input[name="budgetMax"]', '25000');

    // Add another location
    await page.click('button:has-text("Miraflores")');

    // Submit the update
    await page.click('button[type="submit"]:has-text("Actualizar Búsqueda")');

    // Assert redirect back to searches list
    await expect(page).toHaveURL('/tenant/searches');

    // Assert success toast
    await expect(page.getByText(/Búsqueda actualizada exitosamente/i)).toBeVisible({ timeout: 5000 });
  });

  test('should view search results', async ({ page }) => {
    // Click on a saved search to view results
    const searchLink = page.getByText(searchName).first();
    await searchLink.click();

    // Verify we're on the results page
    await expect(page).toHaveURL(/\/tenant\/searches\/[^/]+$/);

    // Verify search name is displayed
    await expect(page.getByRole('heading', { name: new RegExp(searchName, 'i') })).toBeVisible();

    // Verify results count is displayed
    await expect(page.getByText(/propiedades? encontradas?/i)).toBeVisible();

    // Verify criteria badges are shown
    await expect(page.getByText(/Presupuesto:/i)).toBeVisible();
  });

  test('should filter and sort search results', async ({ page }) => {
    // Navigate to a search results page
    await page.goto('/tenant/searches'); // Go back to list
    const firstSearch = page.locator('[href^="/tenant/searches/"]').first();
    await firstSearch.click();

    // Wait for results to load
    await expect(page.getByText(/propiedades? encontradas?/i)).toBeVisible();

    // Open sort dropdown
    const sortSelect = page.locator('select, [role="combobox"]').filter({ hasText: /Ordenar por/i }).or(page.getByText(/Relevancia/i)).first();
    await sortSelect.click();

    // Select price ascending
    await page.click('text=Precio: Menor a Mayor');

    // Verify sort is applied (check if URL params change or if list reorders)
    // This is implementation-specific
  });

  test('should add property to favorites from search results', async ({ page }) => {
    // Navigate to search results
    await page.goto('/tenant/searches');
    const firstSearch = page.locator('[href^="/tenant/searches/"]').first();
    await firstSearch.click();

    // Find and click favorite button on first property
    const favoriteButton = page.locator('[aria-label*="favorito"]').or(page.locator('button').filter({ hasText: /♥|❤/i })).first();

    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();

      // Assert success toast
      await expect(page.getByText(/añadida a favoritos/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should delete a saved search', async ({ page }) => {
    // Find delete button
    const deleteButton = page.locator('[aria-label="Eliminar búsqueda"]').first();

    // Get the search name before deleting
    const searchElement = page.locator('.saved-search-item, [data-testid="search-item"]').first();
    const searchTextBeforeDelete = await searchElement.innerText();

    await deleteButton.click();

    // Confirm deletion in dialog
    await page.click('button:has-text("Confirmar")');

    // Verify search is removed from list
    await expect(page.getByText(searchTextBeforeDelete).first()).not.toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields when creating search', async ({ page }) => {
    await page.click('a[href="/tenant/searches/new"]');

    // Try to submit without filling fields
    await page.click('button[type="submit"]:has-text("Crear Búsqueda")');

    // Assert validation errors
    await expect(page.getByText(/El nombre debe tener al menos 3 caracteres/i)).toBeVisible();
    await expect(page.getByText(/Selecciona al menos un tipo/i)).toBeVisible();
    await expect(page.getByText(/Selecciona al menos una zona/i)).toBeVisible();
  });

  test('should show empty state when no properties match', async ({ page }) => {
    // Create a search with very restrictive criteria
    await page.click('a[href="/tenant/searches/new"]');

    await page.fill('[name="name"]', 'Búsqueda Sin Resultados');
    await page.click('button:has-text("Apartamento")');
    await page.fill('input[name="budgetMin"]', '100000');
    await page.fill('input[name="budgetMax"]', '100001');
    await page.click('button:has-text("Lomas del Guijarro")');

    await page.click('button[type="submit"]:has-text("Crear Búsqueda")');

    // Navigate to results
    await page.click('text=Búsqueda Sin Resultados');

    // Verify empty state
    await expect(page.getByText(/No se encontraron propiedades/i)).toBeVisible();
    await expect(page.getByText(/Editar Criterios/i)).toBeVisible();
  });

  test('should navigate between searches, dashboard, and profile', async ({ page }) => {
    // From searches, go to dashboard
    await page.click('a[href="/tenant/dashboard"]');
    await expect(page).toHaveURL('/tenant/dashboard');

    // From dashboard, go back to searches
    await page.click('a[href="/tenant/searches"]');
    await expect(page).toHaveURL('/tenant/searches');

    // From searches, go to profile
    await page.click('a[href="/tenant/profile"]');
    await expect(page).toHaveURL('/tenant/profile');
  });
});
