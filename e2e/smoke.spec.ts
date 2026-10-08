import { expect, test } from '@playwright/test';

const publicRoutes = ['/', '/season-one', '/play', '/rune-dungeon', '/beta', '/join', '/auth'];

for (const route of publicRoutes) {
  test(`${route} renders without a server error`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response, `No document response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} returned ${response!.status()}`).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error/i);
  });
}

test('health endpoint confirms app and database readiness', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.database).toBe('connected');
  expect(Number(body.catalog)).toBeGreaterThanOrEqual(369);
});

test('catalog endpoint responds successfully', async ({ request }) => {
  const response = await request.get('/api/catalog');
  expect(response.ok()).toBe(true);
});

test('core pages have no same-origin 5xx responses', async ({ page }) => {
  const failures: string[] = [];
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.hostname === '127.0.0.1' && response.status() >= 500) failures.push(`${response.status()} ${url.pathname}`);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.goto('/season-one', { waitUntil: 'networkidle' });
  expect(failures).toEqual([]);
});
