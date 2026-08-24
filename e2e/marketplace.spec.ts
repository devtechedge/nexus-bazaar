import { expect, test } from '@playwright/test';

test.describe('NexusBazaar smoke', () => {
  test('storefront renders brand and catalog', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#brand-title')).toContainText('NexusBazaar');
    await expect(page.locator('#storefront-view-container')).toBeVisible();
    await expect(page.locator('#hero-heading')).toBeVisible();
    await expect(page.locator('#product-card-prod_1')).toBeVisible();
  });

  test('add to cart opens the cart view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#add-to-cart-btn-prod_1').click();
    await page.locator('#nav-cart-btn').click();
    await expect(page.locator('#cart-checkout-container')).toBeVisible();
    await expect(page.locator('#cart-badge')).toHaveText('1');
  });

  test('header search lands on the browse view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#header-search-input').fill('headphones');
    await page.locator('#header-search-form').evaluate((form) =>
      (form as HTMLFormElement).requestSubmit(),
    );
    await expect(page.locator('#search-view-heading')).toBeVisible();
  });

  test('seller hub is gated until the seller identity is selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#nav-seller-btn')).toHaveCount(0);

    await page.locator('#role-switcher-toggle').click();
    await page.locator('#switch-user-usr_seller').click();
    await expect(page.locator('#active-user-role')).toHaveText(/seller/i);

    await page.locator('#nav-seller-btn').click();
    await expect(page.locator('#seller-heading')).toBeVisible();
  });

  test('admin and B2B views open after switching identity', async ({ page }) => {
    await page.goto('/');
    await page.locator('#role-switcher-toggle').click();
    await page.locator('#switch-user-usr_admin').click();
    await expect(page.locator('#active-user-role')).toHaveText(/admin/i);

    await page.locator('#nav-admin-btn').click();
    await expect(page.locator('#admin-heading')).toBeVisible();

    await page.locator('#nav-b2b-btn').click();
    await expect(page.getByText('Wholesale & Bulk Orders')).toBeVisible();
  });
});
