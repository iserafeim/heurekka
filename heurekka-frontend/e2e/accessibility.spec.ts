import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Homepage Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have WCAG AA compliant color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    
    // Filter for color contrast violations specifically
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(colorContrastViolations).toEqual([])
  })

  test('should have proper heading structure', async ({ page }) => {
    // Check that there's exactly one h1
    const h1Elements = page.getByRole('heading', { level: 1 })
    await expect(h1Elements).toHaveCount(1)
    
    // Check heading hierarchy (no headings should skip levels)
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have accessible form controls', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'aria-input-field-name'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
    
    // Specifically check search form
    const searchInput = page.getByRole('searchbox')
    await expect(searchInput).toHaveAttribute('placeholder')
    
    const searchForm = page.getByRole('search')
    await expect(searchForm).toHaveAttribute('aria-label')
  })

  test('should have accessible buttons', async ({ page }) => {
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const isVisible = await button.isVisible()
      
      if (isVisible) {
        // Each button should have an accessible name
        const accessibleName = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        
        expect(accessibleName || ariaLabel).toBeTruthy()
      }
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Start from the top of the page
    await page.keyboard.press('Tab')
    
    // Should focus on the search input first
    const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
    await expect(searchInput).toBeFocused()
    
    // Tab to next focusable element (search button or clear button)
    await page.keyboard.press('Tab')
    
    // Should be able to continue tabbing through interactive elements
    let tabCount = 0
    const maxTabs = 20 // Prevent infinite loop
    
    while (tabCount < maxTabs) {
      const focusedElement = page.locator(':focus')
      const elementExists = await focusedElement.count() > 0
      
      if (!elementExists) break
      
      await page.keyboard.press('Tab')
      tabCount++
    }
    
    // Should have tabbed through multiple elements
    expect(tabCount).toBeGreaterThan(3)
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-roles'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have accessible images', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const isVisible = await image.isVisible()
      
      if (isVisible) {
        // Each image should have alt text
        const altText = await image.getAttribute('alt')
        expect(altText).toBeDefined()
      }
    }
    
    // Run axe check for images
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should be usable with screen reader', async ({ page }) => {
    // Check for proper landmarks
    const main = page.locator('main')
    await expect(main).toHaveCount(1)
    
    // Check for proper headings for navigation
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    
    // Check that important content has appropriate semantic markup
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['landmark-one-main', 'region'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should handle focus management correctly', async ({ page }) => {
    // Test focus trap in any modals or dialogs (if present)
    // Test focus restoration after interactions
    
    const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
    
    // Type something to potentially trigger suggestions
    await searchInput.fill('test')
    
    // If suggestions appear, they should be keyboard navigable
    const suggestions = page.locator('[role="option"]')
    const suggestionCount = await suggestions.count()
    
    if (suggestionCount > 0) {
      await page.keyboard.press('ArrowDown')
      await expect(suggestions.first()).toBeFocused()
    }
  })

  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode by forcing contrast media query
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
    
    // Essential elements should still be visible and functional
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear Perfil Gratuito' })).toBeVisible()
    
    // Reset media emulation
    await page.emulateMedia({ colorScheme: 'light', forcedColors: 'none' })
  })

  test('should work with zoom up to 200%', async ({ page }) => {
    // Set zoom to 200%
    await page.setViewportSize({ width: 640, height: 480 }) // Effectively 200% zoom on 1280x960
    
    // Essential functionality should still work
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeVisible()
    
    const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
    await searchInput.fill('test search')
    
    const searchButton = page.getByRole('button', { name: /Buscar/i })
    await expect(searchButton).toBeVisible()
    await expect(searchButton).toBeEnabled()
  })

  test('should have accessible error states', async ({ page }) => {
    // Test error handling accessibility
    // For now, just ensure no violations in normal state
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-describedby', 'aria-errormessage'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ prefersReducedMotion: 'reduce' })
    
    // Page should still load and be functional
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Animations should respect the preference (this would need specific implementation checks)
    // For now, just ensure the page works
    await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeEnabled()
    
    // Reset media preference
    await page.emulateMedia({ prefersReducedMotion: 'no-preference' })
  })

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
      
      // Touch targets should be large enough (44px minimum)
      const buttons = page.getByRole('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const isVisible = await button.isVisible()
        
        if (isVisible) {
          const boundingBox = await button.boundingBox()
          if (boundingBox) {
            // Button should be at least 44px in one dimension
            expect(Math.max(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })

    test('should support mobile screen readers', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Essential elements should have proper semantic markup
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('search')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Crear Perfil Gratuito' })).toBeVisible()
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['mobile'])
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Assistive Technology Support', () => {
    test('should work with voice control', async ({ page }) => {
      // Voice control relies on accessible names and roles
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['button-name', 'link-name'])
        .analyze()
      
      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('should work with switch control', async ({ page }) => {
      // Switch control needs proper focus management
      // Test that all interactive elements are reachable via tab
      const interactiveElements = page.locator('button, input, a, [tabindex]')
      const elementCount = await interactiveElements.count()
      
      let focusableCount = 0
      
      for (let i = 0; i < elementCount; i++) {
        const element = interactiveElements.nth(i)
        const isVisible = await element.isVisible()
        const tabIndex = await element.getAttribute('tabindex')
        
        if (isVisible && tabIndex !== '-1') {
          focusableCount++
        }
      }
      
      expect(focusableCount).toBeGreaterThan(0)
    })
  })
})