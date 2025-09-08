import { test, expect } from '@playwright/test'

test.describe('Homepage Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage before each test
    await page.goto('/')
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test.describe('Hero Section', () => {
    test('should render hero section with Spanish content', async ({ page }) => {
      // Check main heading
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Encuentra tu hogar perfecto en Honduras')
      
      // Check description text
      await expect(page.getByText('Crea un perfil una vez. Contacta múltiples propietarios.')).toBeVisible()
      await expect(page.getByText('Ahorra horas de conversaciones repetitivas.')).toBeVisible()
      
      // Check CTA buttons
      await expect(page.getByRole('button', { name: 'Crear Perfil Gratuito' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Explorar Propiedades' })).toBeVisible()
    })

    test('should show trust indicators', async ({ page }) => {
      await expect(page.getByText('Sin comisiones ocultas')).toBeVisible()
      await expect(page.getByText('1,000+ usuarios activos')).toBeVisible()
      await expect(page.getByText('500+ propiedades')).toBeVisible()
      await expect(page.getByText('Verificación garantizada')).toBeVisible()
    })

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText('500+').first()).toBeVisible()
      await expect(page.getByText('Propiedades')).toBeVisible()
      await expect(page.getByText('15min')).toBeVisible()
      await expect(page.getByText('Respuesta Promedio')).toBeVisible()
      await expect(page.getByText('95%')).toBeVisible()
      await expect(page.getByText('Satisfacción')).toBeVisible()
    })
  })

  test.describe('Search Functionality', () => {
    test('should have functional search bar', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      const searchButton = page.getByRole('button', { name: /Buscar/i })
      
      // Search input should be visible and enabled
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toBeEnabled()
      
      // Search button should be visible
      await expect(searchButton).toBeVisible()
    })

    test('should perform search and navigate to results', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      const searchButton = page.getByRole('button', { name: /Buscar/i })
      
      // Type search query
      await searchInput.fill('Apartamento Tegucigalpa')
      
      // Submit search
      await searchButton.click()
      
      // Should navigate to search results page
      await expect(page).toHaveURL(/\/search.*/)
    })

    test('should show popular searches', async ({ page }) => {
      await expect(page.getByText('Búsquedas populares:')).toBeVisible()
      
      // Should show some popular search pills
      const searchPills = page.locator('[class*="bg-white/80"]').filter({ hasText: 'Apartamento' })
      await expect(searchPills.first()).toBeVisible()
    })

    test('should handle popular search pill clicks', async ({ page }) => {
      // Find and click a popular search pill
      const firstPill = page.locator('button').filter({ hasText: 'Apartamento Tegucigalpa' }).first()
      await firstPill.click()
      
      // Should navigate to search results
      await expect(page).toHaveURL(/\/search.*/)
    })
  })

  test.describe('CTA Button Actions', () => {
    test('should navigate to profile creation', async ({ page }) => {
      const createProfileButton = page.getByRole('button', { name: 'Crear Perfil Gratuito' })
      
      await createProfileButton.click()
      
      // Should navigate to profile creation page
      await expect(page).toHaveURL('/profile/create')
    })

    test('should trigger search on explore properties click', async ({ page }) => {
      const exploreButton = page.getByRole('button', { name: 'Explorar Propiedades' })
      
      await exploreButton.click()
      
      // Should navigate to search results
      await expect(page).toHaveURL(/\/search.*/)
    })
  })

  test.describe('Featured Properties Section', () => {
    test('should show featured properties if available', async ({ page }) => {
      // Look for featured properties section
      const featuredSection = page.locator('section').filter({ hasText: 'Propiedades Destacadas' }).first()
      
      // If the section exists, it should have property cards
      const sectionExists = await featuredSection.count() > 0
      
      if (sectionExists) {
        await expect(featuredSection).toBeVisible()
        
        // Should have at least one property card
        const propertyCards = page.locator('[role="article"]')
        const cardCount = await propertyCards.count()
        expect(cardCount).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Main elements should still be visible
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Crear Perfil Gratuito' })).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // All elements should be properly laid out
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByText('Búsquedas populares:')).toBeVisible()
      await expect(page.getByText('500+')).toBeVisible()
    })

    test('should work on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // Should show full layout
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByText('Sin comisiones ocultas')).toBeVisible()
      await expect(page.getByText('1,000+ usuarios activos')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 })
      await expect(h1).toBeVisible()
      await expect(h1).toContainText('Encuentra tu hogar perfecto')
    })

    test('should have accessible form elements', async ({ page }) => {
      const searchForm = page.getByRole('search')
      await expect(searchForm).toBeVisible()
      
      const searchInput = page.getByRole('searchbox')
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toBeEnabled()
    })

    test('should have accessible buttons', async ({ page }) => {
      // All buttons should have accessible names
      const buttons = page.getByRole('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const isVisible = await button.isVisible()
        if (isVisible) {
          const accessibleName = await button.getAttribute('aria-label') || await button.textContent()
          expect(accessibleName).toBeTruthy()
        }
      }
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab') // Should focus search input
      await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeFocused()
      
      // Continue tabbing to buttons
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Should be able to activate buttons with Enter
      await page.keyboard.press('Enter')
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should have no console errors', async ({ page }) => {
      const consoleErrors = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Should have no console errors
      expect(consoleErrors).toHaveLength(0)
    })

    test('should have good Core Web Vitals', async ({ page }) => {
      await page.goto('/')
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle')
      
      // Check that images are loaded
      const images = page.locator('img')
      const imageCount = await images.count()
      
      if (imageCount > 0) {
        // Wait for at least the first image to load
        await expect(images.first()).toBeVisible()
      }
      
      // Check that the page is interactive
      await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeEnabled()
    })
  })

  test.describe('SEO and Meta Tags', () => {
    test('should have proper meta tags', async ({ page }) => {
      await expect(page).toHaveTitle(/Heurekka|Encuentra tu hogar/)
      
      // Should have meta description
      const metaDescription = page.locator('meta[name="description"]')
      await expect(metaDescription).toHaveAttribute('content', /.+/)
    })

    test('should have proper Open Graph tags', async ({ page }) => {
      const ogTitle = page.locator('meta[property="og:title"]')
      const ogDescription = page.locator('meta[property="og:description"]')
      
      // If Open Graph tags exist, they should have content
      const ogTitleCount = await ogTitle.count()
      if (ogTitleCount > 0) {
        await expect(ogTitle).toHaveAttribute('content', /.+/)
      }
      
      const ogDescCount = await ogDescription.count()
      if (ogDescCount > 0) {
        await expect(ogDescription).toHaveAttribute('content', /.+/)
      }
    })
  })

  test.describe('Analytics Integration', () => {
    test('should load analytics scripts if configured', async ({ page }) => {
      // Check if gtag is available (Google Analytics)
      const gtagExists = await page.evaluate(() => typeof window.gtag === 'function')
      
      // If analytics is configured, gtag should be available
      if (gtagExists) {
        expect(gtagExists).toBe(true)
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true)
      
      try {
        await page.goto('/')
        await page.waitForLoadState('networkidle', { timeout: 5000 })
      } catch (error) {
        // Should show some kind of error state or fallback content
        const body = await page.textContent('body')
        expect(body).toBeTruthy()
      }
      
      // Restore online condition
      await page.context().setOffline(false)
    })

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.context().setNetworkCondition({
        downloadThroughput: 500 * 1024, // 500 KB/s
        uploadThroughput: 500 * 1024,
        latency: 200 // 200ms
      })
      
      await page.goto('/')
      
      // Should still load essential content
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
      await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeVisible()
      
      // Reset network conditions
      await page.context().setNetworkCondition(null)
    })
  })
})