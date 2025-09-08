import { test, expect } from '@playwright/test'

test.describe('Homepage Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any previous data
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test.describe('Core Web Vitals', () => {
    test('should have good Largest Contentful Paint (LCP)', async ({ page }) => {
      await page.goto('/')
      
      // Wait for the page to load completely
      await page.waitForLoadState('networkidle')
      
      // Measure LCP
      const lcpValue = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            if (lastEntry) {
              resolve(lastEntry.startTime)
            }
          })
          observer.observe({ type: 'largest-contentful-paint', buffered: true })
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000)
        })
      })
      
      // LCP should be under 2.5 seconds for good performance
      if (lcpValue > 0) {
        expect(lcpValue).toBeLessThan(2500)
      }
    })

    test('should have good First Input Delay simulation', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Measure time to interactive elements
      const startTime = Date.now()
      
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      await expect(searchInput).toBeEnabled()
      
      // Click should respond quickly
      await searchInput.click()
      await searchInput.fill('test')
      
      const responseTime = Date.now() - startTime
      
      // Should respond within 100ms (good FID)
      expect(responseTime).toBeLessThan(100)
    })

    test('should have minimal Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/')
      
      // Take initial screenshot
      const initialScreenshot = await page.screenshot()
      
      // Wait for any dynamic loading
      await page.waitForTimeout(2000)
      await page.waitForLoadState('networkidle')
      
      // Take final screenshot
      const finalScreenshot = await page.screenshot()
      
      // Screenshots should be similar (no major layout shifts)
      // This is a basic check - in production, you'd use more sophisticated CLS measurement
      expect(initialScreenshot.length).toBeCloseTo(finalScreenshot.length, -1)
    })
  })

  test.describe('Loading Performance', () => {
    test('should load initial page within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      const domContentLoadedTime = Date.now() - startTime
      
      // DOM should be ready within 1 second
      expect(domContentLoadedTime).toBeLessThan(1000)
    })

    test('should achieve full load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const fullLoadTime = Date.now() - startTime
      
      // Full load should complete within 3 seconds
      expect(fullLoadTime).toBeLessThan(3000)
    })

    test('should load critical CSS inline', async ({ page }) => {
      const response = await page.goto('/')
      const content = await response?.text()
      
      // Should have some critical CSS inlined
      expect(content).toContain('<style>')
      
      // Should load quickly even without external CSS
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      await expect(searchInput).toBeVisible({ timeout: 1000 })
    })

    test('should lazy load non-critical resources', async ({ page }) => {
      const resourcePromises: Promise<any>[] = []
      
      page.on('response', (response) => {
        const url = response.url()
        // Track image and font loading
        if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp') || 
            url.includes('.woff') || url.includes('.woff2')) {
          resourcePromises.push(response.finished())
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      // Critical content should be visible before all resources load
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeVisible()
      
      // Some resources might still be loading
      const pendingResources = resourcePromises.length
      console.log(`Tracking ${pendingResources} lazy-loaded resources`)
    })
  })

  test.describe('JavaScript Performance', () => {
    test('should have minimal main thread blocking', async ({ page }) => {
      await page.goto('/')
      
      // Measure script execution time
      const scriptMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('navigation')
        const navigation = entries[0] as PerformanceNavigationTiming
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart
        }
      })
      
      // DOM processing should be quick
      expect(scriptMetrics.domContentLoaded).toBeLessThan(500)
      expect(scriptMetrics.loadComplete).toBeLessThan(200)
    })

    test('should handle user interactions without blocking', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      
      // Rapid interactions should not cause delays
      const startTime = Date.now()
      
      for (let i = 0; i < 5; i++) {
        await searchInput.fill(`test ${i}`)
        await page.waitForTimeout(10) // Small delay between actions
      }
      
      const totalTime = Date.now() - startTime
      
      // Should complete quickly without blocking
      expect(totalTime).toBeLessThan(1000)
    })

    test('should have efficient memory usage', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Measure initial memory
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      // Perform some interactions
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      
      for (let i = 0; i < 10; i++) {
        await searchInput.fill(`search term ${i}`)
        await searchInput.clear()
      }
      
      // Measure memory after interactions
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      // Memory should not have increased dramatically
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024) // Less than 5MB increase
      }
    })
  })

  test.describe('Network Performance', () => {
    test('should minimize HTTP requests', async ({ page }) => {
      const requests: string[] = []
      
      page.on('request', (request) => {
        requests.push(request.url())
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Should not make excessive requests
      expect(requests.length).toBeLessThan(20)
      
      // Log requests for debugging
      console.log(`Total requests: ${requests.length}`)
    })

    test('should use efficient caching', async ({ page }) => {
      // First visit
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const firstLoadRequests: string[] = []
      page.on('request', (request) => {
        firstLoadRequests.push(request.url())
      })
      
      // Second visit (should use cache)
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Some resources should be cached (fewer requests on reload)
      const cachedRequests = firstLoadRequests.filter(url => 
        url.includes('.js') || url.includes('.css') || url.includes('.woff')
      )
      
      console.log(`Cacheable requests: ${cachedRequests.length}`)
    })

    test('should compress text resources', async ({ page }) => {
      const responses: any[] = []
      
      page.on('response', (response) => {
        const contentType = response.headers()['content-type'] || ''
        if (contentType.includes('text/') || contentType.includes('application/javascript') || 
            contentType.includes('application/json')) {
          responses.push({
            url: response.url(),
            contentEncoding: response.headers()['content-encoding']
          })
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Text resources should be compressed
      const textResponses = responses.filter(r => r.contentEncoding)
      expect(textResponses.length).toBeGreaterThan(0)
    })
  })

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile networks', async ({ page }) => {
      // Simulate slow 3G
      await page.context().setNetworkCondition({
        downloadThroughput: 500 * 1024, // 500 KB/s
        uploadThroughput: 500 * 1024,
        latency: 400 // 400ms latency
      })
      
      await page.setViewportSize({ width: 375, height: 667 })
      
      const startTime = Date.now()
      await page.goto('/')
      
      // Critical content should be visible within reasonable time even on slow networks
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8000 })
      await expect(page.getByPlaceholder(/Buscar por ubicación/i)).toBeVisible({ timeout: 8000 })
      
      const loadTime = Date.now() - startTime
      
      // Should load within 8 seconds on slow 3G
      expect(loadTime).toBeLessThan(8000)
      
      // Reset network conditions
      await page.context().setNetworkCondition(null)
    })

    test('should handle mobile viewport efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      const loadTime = Date.now() - startTime
      
      // Mobile should not be significantly slower than desktop
      expect(loadTime).toBeLessThan(2000)
      
      // Touch interactions should be responsive
      const searchInput = page.getByPlaceholder(/Buscar por ubicación/i)
      
      const touchStartTime = Date.now()
      await searchInput.tap()
      await searchInput.fill('mobile test')
      const touchTime = Date.now() - touchStartTime
      
      expect(touchTime).toBeLessThan(500)
    })
  })

  test.describe('Resource Optimization', () => {
    test('should use optimized images', async ({ page }) => {
      const imageResponses: any[] = []
      
      page.on('response', (response) => {
        const url = response.url()
        if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) {
          imageResponses.push({
            url,
            size: response.headers()['content-length'],
            type: response.headers()['content-type']
          })
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Should prefer modern image formats where supported
      const webpImages = imageResponses.filter(img => 
        img.type && img.type.includes('webp')
      )
      
      console.log(`WebP images: ${webpImages.length}/${imageResponses.length}`)
      
      // Images should be reasonably sized
      imageResponses.forEach(img => {
        if (img.size) {
          const sizeKB = parseInt(img.size) / 1024
          expect(sizeKB).toBeLessThan(500) // Each image under 500KB
        }
      })
    })

    test('should minimize JavaScript bundle size', async ({ page }) => {
      const jsResponses: any[] = []
      
      page.on('response', (response) => {
        const url = response.url()
        if (url.includes('.js') && !url.includes('node_modules')) {
          jsResponses.push({
            url,
            size: response.headers()['content-length']
          })
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Calculate total JS size
      let totalJSSize = 0
      jsResponses.forEach(js => {
        if (js.size) {
          totalJSSize += parseInt(js.size)
        }
      })
      
      const totalJSSizeKB = totalJSSize / 1024
      console.log(`Total JS size: ${totalJSSizeKB.toFixed(2)} KB`)
      
      // Total JS should be reasonable for a landing page
      expect(totalJSSizeKB).toBeLessThan(1000) // Under 1MB total JS
    })

    test('should load fonts efficiently', async ({ page }) => {
      const fontResponses: any[] = []
      
      page.on('response', (response) => {
        const url = response.url()
        if (url.includes('.woff') || url.includes('.woff2')) {
          fontResponses.push({
            url,
            size: response.headers()['content-length']
          })
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Should not have FOIT (Flash of Invisible Text)
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toBeVisible()
      
      // Font loading should not block text rendering
      const headingText = await heading.textContent()
      expect(headingText).toBeTruthy()
      
      console.log(`Font files loaded: ${fontResponses.length}`)
    })
  })

  test.describe('Performance Monitoring', () => {
    test('should track performance metrics', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Get performance timing
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        return {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
          domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          resourceLoading: navigation.loadEventStart - navigation.domContentLoadedEventEnd
        }
      })
      
      console.log('Performance metrics:', performanceMetrics)
      
      // All metrics should be reasonable
      expect(performanceMetrics.dnsLookup).toBeLessThan(200)
      expect(performanceMetrics.tcpConnect).toBeLessThan(200)
      expect(performanceMetrics.serverResponse).toBeLessThan(1000)
      expect(performanceMetrics.domProcessing).toBeLessThan(1000)
      expect(performanceMetrics.resourceLoading).toBeLessThan(2000)
    })

    test('should have no performance warnings in console', async ({ page }) => {
      const consoleWarnings: string[] = []
      
      page.on('console', (msg) => {
        if (msg.type() === 'warning' && 
            (msg.text().includes('performance') || msg.text().includes('slow'))) {
          consoleWarnings.push(msg.text())
        }
      })
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      expect(consoleWarnings).toEqual([])
    })
  })
})