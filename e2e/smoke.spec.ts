import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('should load the homepage and show the title', async ({ page }) => {
    // Test for both locales
    const locales = ['vi', 'en'];
    
    for (const locale of locales) {
      await page.goto(`/${locale}`);
      
      // Check for title (using regular expression to handle different languages)
      // title is "Elite SaaS 2026" or similar
      await expect(page).toHaveTitle(/Elite SaaS 2026/i);
      
      // Check if the locale switch buttons exist
      const viLink = page.getByRole('link', { name: /Tiếng Việt/i });
      const enLink = page.getByRole('link', { name: /English/i });
      
      await expect(viLink).toBeVisible();
      await expect(enLink).toBeVisible();
    }
  });

  test('should switch locale when clicking links', async ({ page }) => {
    await page.goto('/vi');
    await page.getByRole('link', { name: /English/i }).click();
    await expect(page).toHaveURL(/\/en/);
    
    await page.getByRole('link', { name: /Tiếng Việt/i }).click();
    await expect(page).toHaveURL(/\/vi/);
  });
});
