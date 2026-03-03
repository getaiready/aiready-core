import { test, expect } from '@playwright/test';

test.describe('Page Content', () => {
  test('homepage displays key sections', async ({ page }) => {
    await page.goto('/');

    // Hero section - using specific heading locator to avoid ambiguity
    await expect(
      page.getByRole('heading', { name: /Make Your Codebase AI-Ready/i })
    ).toBeVisible();

    // Agent Prompt (default tab)
    await expect(
      page.getByText('agent prompt', { exact: false }).first()
    ).toBeVisible();

    // Navigation links
    await expect(
      page.getByRole('link', { name: 'Docs', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Blog', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Unified CLI', exact: true })
    ).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Click Blog
    await page.getByRole('link', { name: 'Blog', exact: true }).click();
    await expect(page).toHaveURL(/\/blog/);
    // Updated text to match BlogPageClient.tsx
    await expect(page.getByText('Practical insights on making')).toBeVisible();

    // Click a post
    await page.getByText('The Agentic Wall').first().click();
    await expect(page).toHaveURL(/\/blog\/the-agentic-wall/);
  });
});
