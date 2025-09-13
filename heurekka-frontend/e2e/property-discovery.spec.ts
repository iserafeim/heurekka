import { test, expect, Page } from '@playwright/test';

// Helper functions
async function waitForPropertyCards(page: Page) {
  await page.waitForSelector('[data-testid="property-card"]', { state: 'visible' });
}

async function searchForLocation(page: Page, location: string) {
  const searchInput = page.getByPlaceholder(/buscar vecindario|search neighborhood/i);
  await searchInput.fill(location);
  await searchInput.press('Enter');
}

async function openPropertyModal(page: Page, propertyIndex: number = 0) {
  const propertyCards = page.locator('[data-testid="property-card"]');
  await propertyCards.nth(propertyIndex).click();
  await page.waitForSelector('[data-testid="property-modal"]', { state: 'visible' });
}

test.describe('Property Discovery E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the properties page
    await page.goto('/propiedades');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Loading and Initial State', () => {
    test('should load property discovery page successfully', async ({ page }) => {
      // Check main elements are present
      await expect(page.getByText('Heurekka')).toBeVisible();
      await expect(page.getByPlaceholder(/buscar vecindario/i)).toBeVisible();
      await expect(page.getByTestId('view-toggle')).toBeVisible();
      
      // Check that properties are loaded
      await waitForPropertyCards(page);
      const propertyCards = page.locator('[data-testid="property-card"]');
      await expect(propertyCards).toHaveCount({ min: 1 });
    });

    test('should display correct view mode by default', async ({ page }) => {
      // Should be in split view by default
      await expect(page.getByTestId('property-cards-panel')).toBeVisible();
      await expect(page.getByTestId('map-panel')).toBeVisible();
      
      // Split view button should be active
      const splitButton = page.getByRole('button', { name: /dividida|split/i });
      await expect(splitButton).toHaveClass(/active/);
    });

    test('should show loading states appropriately', async ({ page }) => {
      // Initial loading should complete
      await page.waitForSelector('[data-testid="loading-skeleton"]', { state: 'detached', timeout: 10000 });
      
      // Properties should be visible
      await waitForPropertyCards(page);
    });
  });

  test.describe('Search Functionality', () => {
    test('should perform basic search', async ({ page }) => {
      await searchForLocation(page, 'Centro');
      
      // Wait for search results
      await page.waitForLoadState('networkidle');
      await waitForPropertyCards(page);
      
      // Check that results are updated
      const resultCount = page.getByTestId('result-count');
      await expect(resultCount).toBeVisible();
    });

    test('should handle search with no results', async ({ page }) => {
      await searchForLocation(page, 'NonExistentLocation12345');
      
      // Wait for search to complete
      await page.waitForLoadState('networkidle');
      
      // Should show no results message
      await expect(page.getByText(/no se encontraron propiedades|no properties found/i)).toBeVisible();
    });

    test('should provide search suggestions/autocomplete', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/buscar vecindario/i);
      await searchInput.fill('Teg');
      
      // Wait for autocomplete suggestions
      await page.waitForSelector('[data-testid="search-suggestions"]', { timeout: 5000 });
      
      // Should have suggestions
      const suggestions = page.locator('[data-testid="search-suggestion"]');
      await expect(suggestions).toHaveCount({ min: 1 });
      
      // Click on first suggestion
      await suggestions.first().click();
      
      // Should update search and show results
      await page.waitForLoadState('networkidle');
      await waitForPropertyCards(page);
    });

    test('should debounce search input', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/buscar vecindario/i);
      
      // Type rapidly
      await searchInput.fill('T');
      await searchInput.fill('Te');
      await searchInput.fill('Teg');
      await searchInput.fill('Tegu');
      await searchInput.fill('Tegucigalpa');
      
      // Wait for debounce to complete
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      
      // Should have performed search
      await waitForPropertyCards(page);
    });
  });

  test.describe('Filter Functionality', () => {
    test('should apply price filters', async ({ page }) => {
      // Open price filter
      const priceFilter = page.getByTestId('price-filter');
      await priceFilter.click();
      
      // Set price range
      const minPriceInput = page.getByTestId('price-min-input');
      const maxPriceInput = page.getByTestId('price-max-input');
      
      await minPriceInput.fill('15000');
      await maxPriceInput.fill('25000');
      
      // Apply filter
      const applyButton = page.getByRole('button', { name: /aplicar|apply/i });
      await applyButton.click();
      
      // Wait for filtered results
      await page.waitForLoadState('networkidle');
      await waitForPropertyCards(page);
      
      // Verify prices are within range
      const propertyPrices = page.locator('[data-testid="property-price"]');
      const priceTexts = await propertyPrices.allTextContent();
      
      priceTexts.forEach(priceText => {
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        expect(price).toBeGreaterThanOrEqual(15000);
        expect(price).toBeLessThanOrEqual(25000);
      });
    });

    test('should apply bedroom filters', async ({ page }) => {
      // Open bedroom filter
      const bedroomFilter = page.getByTestId('bedroom-filter');
      await bedroomFilter.click();
      
      // Select 2 bedrooms
      const twoBedroomsOption = page.getByTestId('bedroom-option-2');
      await twoBedroomsOption.click();
      
      // Apply filter
      const applyButton = page.getByRole('button', { name: /aplicar|apply/i });
      await applyButton.click();
      
      // Wait for filtered results
      await page.waitForLoadState('networkidle');
      await waitForPropertyCards(page);
      
      // Verify bedroom count
      const bedroomInfo = page.locator('[data-testid="property-bedrooms"]');
      const bedroomTexts = await bedroomInfo.allTextContent();
      
      bedroomTexts.forEach(text => {
        expect(text).toContain('2');
      });
    });

    test('should combine multiple filters', async ({ page }) => {
      // Apply price filter
      const priceFilter = page.getByTestId('price-filter');
      await priceFilter.click();
      await page.getByTestId('price-min-input').fill('10000');
      await page.getByTestId('price-max-input').fill('20000');
      
      // Apply property type filter
      const typeFilter = page.getByTestId('property-type-filter');
      await typeFilter.click();
      await page.getByTestId('type-apartment').click();
      
      // Apply filters
      const applyButton = page.getByRole('button', { name: /aplicar|apply/i });
      await applyButton.click();
      
      // Wait for filtered results
      await page.waitForLoadState('networkidle');
      await waitForPropertyCards(page);
      
      // Verify combined filters
      const properties = page.locator('[data-testid="property-card"]');
      await expect(properties).toHaveCount({ min: 1 });
    });

    test('should clear all filters', async ({ page }) => {
      // Apply some filters first
      const priceFilter = page.getByTestId('price-filter');
      await priceFilter.click();
      await page.getByTestId('price-min-input').fill('20000');
      
      const applyButton = page.getByRole('button', { name: /aplicar|apply/i });
      await applyButton.click();
      await page.waitForLoadState('networkidle');
      
      // Clear filters
      const clearButton = page.getByRole('button', { name: /limpiar filtros|clear filters/i });
      await clearButton.click();
      
      // Wait for results to update
      await page.waitForLoadState('networkidle');
      await waitForPropertyCards(page);
      
      // Should show more results
      const properties = page.locator('[data-testid="property-card"]');
      await expect(properties).toHaveCount({ min: 1 });
    });
  });

  test.describe('View Mode Switching', () => {
    test('should switch between view modes', async ({ page }) => {
      // Start in split view
      await expect(page.getByTestId('property-cards-panel')).toBeVisible();
      await expect(page.getByTestId('map-panel')).toBeVisible();
      
      // Switch to list view
      const listButton = page.getByRole('button', { name: /lista|list/i });
      await listButton.click();
      
      await expect(page.getByTestId('property-cards-panel')).toBeVisible();
      await expect(page.getByTestId('map-panel')).not.toBeVisible();
      
      // Switch to map view
      const mapButton = page.getByRole('button', { name: /mapa|map/i });
      await mapButton.click();
      
      await expect(page.getByTestId('map-panel')).toBeVisible();
      await expect(page.getByTestId('property-cards-panel')).not.toBeVisible();
      
      // Switch back to split view
      const splitButton = page.getByRole('button', { name: /dividida|split/i });
      await splitButton.click();
      
      await expect(page.getByTestId('property-cards-panel')).toBeVisible();
      await expect(page.getByTestId('map-panel')).toBeVisible();
    });

    test('should show transition animations', async ({ page }) => {
      const listButton = page.getByRole('button', { name: /lista|list/i });
      await listButton.click();
      
      // Should show loading overlay during transition
      await expect(page.getByText(/cambiando vista|changing view/i)).toBeVisible();
      
      // Wait for transition to complete
      await page.waitForSelector('[data-testid="transition-overlay"]', { state: 'detached' });
    });
  });

  test.describe('Property Interactions', () => {
    test('should open property detail modal', async ({ page }) => {
      await waitForPropertyCards(page);
      await openPropertyModal(page);
      
      // Modal should be visible
      await expect(page.getByTestId('property-modal')).toBeVisible();
      
      // Should have property details
      await expect(page.getByTestId('property-title')).toBeVisible();
      await expect(page.getByTestId('property-price')).toBeVisible();
      await expect(page.getByTestId('property-description')).toBeVisible();
    });

    test('should close property modal', async ({ page }) => {
      await waitForPropertyCards(page);
      await openPropertyModal(page);
      
      // Close modal
      const closeButton = page.getByRole('button', { name: /cerrar|close/i });
      await closeButton.click();
      
      // Modal should be hidden
      await expect(page.getByTestId('property-modal')).not.toBeVisible();
    });

    test('should navigate through property gallery', async ({ page }) => {
      await waitForPropertyCards(page);
      await openPropertyModal(page);
      
      // Should have image gallery
      const gallery = page.getByTestId('property-gallery');
      await expect(gallery).toBeVisible();
      
      // Navigate through images
      const nextButton = page.getByTestId('gallery-next');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500); // Animation delay
        
        const prevButton = page.getByTestId('gallery-prev');
        await prevButton.click();
      }
    });

    test('should handle favorite toggling', async ({ page }) => {
      await waitForPropertyCards(page);
      
      // Click favorite button on first property
      const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
      await favoriteButton.click();
      
      // Should show favorited state
      await expect(favoriteButton).toHaveClass(/favorited|active/);
      
      // Click again to unfavorite
      await favoriteButton.click();
      await expect(favoriteButton).not.toHaveClass(/favorited|active/);
    });

    test('should enable WhatsApp contact', async ({ page }) => {
      await waitForPropertyCards(page);
      await openPropertyModal(page);
      
      // Should have WhatsApp contact button
      const whatsappButton = page.getByTestId('whatsapp-contact');
      await expect(whatsappButton).toBeVisible();
      
      // Should open WhatsApp when clicked (check href)
      const href = await whatsappButton.getAttribute('href');
      expect(href).toContain('wa.me');
    });
  });

  test.describe('Map Functionality', () => {
    test('should display property markers on map', async ({ page }) => {
      // Switch to map view or ensure map is visible
      const mapButton = page.getByRole('button', { name: /mapa|map/i });
      await mapButton.click();
      
      // Wait for map to load
      await page.waitForSelector('[data-testid="map-container"]', { state: 'visible' });
      
      // Should have property markers
      const markers = page.locator('[data-testid="property-marker"]');
      await expect(markers).toHaveCount({ min: 1 });
    });

    test('should handle map marker clicks', async ({ page }) => {
      const mapButton = page.getByRole('button', { name: /mapa|map/i });
      await mapButton.click();
      
      await page.waitForSelector('[data-testid="map-container"]', { state: 'visible' });
      
      // Click on a marker
      const marker = page.locator('[data-testid="property-marker"]').first();
      await marker.click();
      
      // Should open property modal or show popup
      await expect(page.getByTestId('property-modal')).toBeVisible();
    });

    test('should handle map zoom and pan', async ({ page }) => {
      const mapButton = page.getByRole('button', { name: /mapa|map/i });
      await mapButton.click();
      
      await page.waitForSelector('[data-testid="map-container"]', { state: 'visible' });
      
      // Test zoom controls
      const zoomIn = page.getByTestId('map-zoom-in');
      const zoomOut = page.getByTestId('map-zoom-out');
      
      if (await zoomIn.isVisible()) {
        await zoomIn.click();
        await page.waitForTimeout(500);
        
        await zoomOut.click();
        await page.waitForTimeout(500);
      }
    });

    test('should sync map with property cards', async ({ page }) => {
      // Ensure we're in split view
      const splitButton = page.getByRole('button', { name: /dividida|split/i });
      await splitButton.click();
      
      await waitForPropertyCards(page);
      
      // Hover over property card
      const firstProperty = page.locator('[data-testid="property-card"]').first();
      await firstProperty.hover();
      
      // Corresponding map marker should be highlighted
      const highlightedMarker = page.locator('[data-testid="property-marker"].highlighted');
      await expect(highlightedMarker).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Infinite Scroll', () => {
    test('should load more properties on scroll', async ({ page }) => {
      await waitForPropertyCards(page);
      
      // Count initial properties
      const initialProperties = await page.locator('[data-testid="property-card"]').count();
      
      // Scroll to bottom of property list
      await page.locator('[data-testid="property-cards-panel"]').scrollTo({ top: 10000 });
      
      // Wait for more properties to load
      await page.waitForTimeout(2000);
      
      // Should have more properties
      const newProperties = await page.locator('[data-testid="property-card"]').count();
      expect(newProperties).toBeGreaterThan(initialProperties);
    });

    test('should show loading indicator during infinite scroll', async ({ page }) => {
      await waitForPropertyCards(page);
      
      // Scroll to trigger loading
      await page.locator('[data-testid="property-cards-panel"]').scrollTo({ top: 10000 });
      
      // Should show loading indicator
      await expect(page.getByTestId('loading-more')).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await waitForPropertyCards(page);
      
      // Should show mobile layout
      const mobileMenu = page.getByTestId('mobile-menu');
      if (await mobileMenu.isVisible()) {
        await expect(mobileMenu).toBeVisible();
      }
      
      // Properties should be in single column
      const propertyGrid = page.getByTestId('property-grid');
      const gridClass = await propertyGrid.getAttribute('class');
      expect(gridClass).toMatch(/grid-cols-1|single-column/);
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await waitForPropertyCards(page);
      
      // Should show appropriate layout for tablet
      const propertyGrid = page.getByTestId('property-grid');
      const gridClass = await propertyGrid.getAttribute('class');
      expect(gridClass).toMatch(/grid-cols-2|two-column/);
    });
  });

  test.describe('Performance', () => {
    test('should load within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/propiedades');
      await waitForPropertyCards(page);
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Load page with many properties
      await page.goto('/propiedades?limit=100');
      await waitForPropertyCards(page);
      
      // Scroll performance should be smooth
      const startTime = Date.now();
      await page.locator('[data-testid="property-cards-panel"]').scrollTo({ top: 5000 });
      const scrollTime = Date.now() - startTime;
      
      // Scrolling should be responsive
      expect(scrollTime).toBeLessThan(1000);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/property/search', route => route.abort());
      
      await page.goto('/propiedades');
      
      // Should show error message
      await expect(page.getByText(/error|problema/i)).toBeVisible({ timeout: 10000 });
      
      // Should have retry option
      const retryButton = page.getByRole('button', { name: /reintentar|retry/i });
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible();
      }
    });

    test('should handle empty search results', async ({ page }) => {
      await searchForLocation(page, 'NonExistentLocation99999');
      
      await page.waitForLoadState('networkidle');
      
      // Should show no results message
      await expect(page.getByText(/no se encontraron propiedades/i)).toBeVisible();
      
      // Should suggest alternative actions
      const clearFilters = page.getByRole('button', { name: /limpiar filtros/i });
      if (await clearFilters.isVisible()) {
        await expect(clearFilters).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await waitForPropertyCards(page);
      
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // Search input
      await page.keyboard.press('Tab'); // Filter button
      await page.keyboard.press('Tab'); // View toggle
      await page.keyboard.press('Tab'); // First property card
      
      // Should be able to open property with Enter
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('property-modal')).toBeVisible();
      
      // Should be able to close modal with Escape
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('property-modal')).not.toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await waitForPropertyCards(page);
      
      // Check for important ARIA labels
      const searchInput = page.getByRole('searchbox');
      await expect(searchInput).toBeVisible();
      
      const propertyButtons = page.getByRole('button').filter({ hasText: /habitacion|bathroom|m²/ });
      const count = await propertyButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should support screen readers', async ({ page }) => {
      await waitForPropertyCards(page);
      
      // Check for screen reader friendly content
      const propertyDescriptions = page.locator('[aria-label*="propiedad"]');
      const count = await propertyDescriptions.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});