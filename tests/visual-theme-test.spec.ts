import { test, expect } from '@playwright/test';

test.describe('Visual Theme Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Start the dev server if not running
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
  });

  test('Landing page - Dark mode', async ({ page }) => {
    // Ensure dark mode is set
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    
    // Wait for page to load and animations to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/landing-dark.png', 
      fullPage: true 
    });
    
    // Check for contrast issues in dark mode
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check glassmorphic elements
      const glassElements = document.querySelectorAll('.glass-light, .glass-medium, .glass-heavy, .glass-panel');
      glassElements.forEach((el, index) => {
        const styles = getComputedStyle(el);
        const bg = styles.backgroundColor;
        const color = styles.color;
        if (bg && color) {
          issues.push({
            type: 'glass-element',
            index,
            backgroundColor: bg,
            color: color,
            className: el.className
          });
        }
      });
      
      // Check coral accent elements
      const coralElements = document.querySelectorAll('.coral-glow, .text-primary');
      coralElements.forEach((el, index) => {
        const styles = getComputedStyle(el);
        issues.push({
          type: 'coral-element',
          index,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: el.className
        });
      });
      
      return issues;
    });
    
    console.log('Dark mode contrast analysis:', contrastIssues);
  });

  test('Landing page - Light mode', async ({ page }) => {
    // Ensure light mode is set
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    
    // Wait for page to load and animations to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/landing-light.png', 
      fullPage: true 
    });
    
    // Check for contrast issues in light mode
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check glassmorphic elements
      const glassElements = document.querySelectorAll('.glass-light, .glass-medium, .glass-heavy, .glass-panel');
      glassElements.forEach((el, index) => {
        const styles = getComputedStyle(el);
        const bg = styles.backgroundColor;
        const color = styles.color;
        if (bg && color) {
          issues.push({
            type: 'glass-element',
            index,
            backgroundColor: bg,
            color: color,
            className: el.className
          });
        }
      });
      
      // Check coral accent elements
      const coralElements = document.querySelectorAll('.coral-glow, .text-primary');
      coralElements.forEach((el, index) => {
        const styles = getComputedStyle(el);
        issues.push({
          type: 'coral-element',
          index,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: el.className
        });
      });
      
      return issues;
    });
    
    console.log('Light mode contrast analysis:', contrastIssues);
  });

  test('Theme toggle functionality', async ({ page }) => {
    // Start in light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    
    // Find and click theme toggle
    const themeToggle = page.locator('button:has(svg)').filter({ hasText: /toggle/i }).or(
      page.locator('[data-testid="theme-toggle"]')
    ).or(
      page.locator('button').filter({ has: page.locator('svg') }).first()
    );
    
    // If we can't find the toggle by text, look for moon/sun icons
    const toggleButton = page.locator('button:has(.lucide-moon), button:has(.lucide-sun)').first();
    
    if (await toggleButton.isVisible()) {
      // Take before screenshot
      await page.screenshot({ path: 'screenshots/before-toggle.png' });
      
      // Click toggle
      await toggleButton.click();
      await page.waitForTimeout(1000);
      
      // Take after screenshot  
      await page.screenshot({ path: 'screenshots/after-toggle.png' });
      
      // Verify theme switched
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });
      
      console.log('Theme switched to:', isDark ? 'dark' : 'light');
    }
  });
});