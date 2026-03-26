import { test, expect } from '@playwright/test';

test.describe('ClawMore SEO Metadata', () => {
  test('homepage has correct SEO tags', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ClawMore/);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toContain('AWS');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-home.png/
    );
  });

  test('robots.txt is correct', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://clawmore.ai/sitemap.xml');
  });

  test('sitemap.xml returns correctly', async ({ page }) => {
    // Next.js generates sitemap at /sitemap.xml
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('<urlset');
    expect(text).toContain('https://clawmore.ai/blog');
  });

  test.skip('blog index has correct SEO tags', async ({ page }) => {
    // /blog returns 403 in production CloudFront — skip until routing is fixed
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog | ClawMore/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-blog.png/
    );
  });
});
