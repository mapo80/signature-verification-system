import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const sampleBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHElEQVR42mP8/5+BfwYiAAMTA/4bBgYGBgYGBoZyDgCbiBnG6bMRAAAAAElFTkSuQmCC';

test('verify signatures via UI', async ({ page }, testInfo) => {
  const assetDir = path.join(testInfo.outputDir, 'assets');
  fs.mkdirSync(assetDir, { recursive: true });
  const imgPath = path.join(assetDir, 'sample.png');
  fs.writeFileSync(imgPath, Buffer.from(sampleBase64, 'base64'));

  await page.route('**/signature/verify**', async route => {
    await page.waitForTimeout(1200);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ forged: false, similarity: 0.9 })
    });
  });

  await page.goto('/');
  await page.getByRole('tab', { name: 'Verify' }).click();
  const data = fs.readFileSync(imgPath);
  await page.evaluate(([ref, cand]) => {
    const file = new File([new Uint8Array(ref)], 'sample.png', { type: 'image/png' });
    (window as any).__setRefFile(file);
    (window as any).__setCandFile(file);
  }, [data, data]);
  const verifyButton = page.getByRole('button', { name: 'Verify' });
  await verifyButton.click({ force: true });
  await expect(verifyButton).toBeDisabled();
  await expect(page.locator('pre')).toBeVisible();

  // save screenshot for documentation
  const screenshotPath = path.join(assetDir, 'verify_full.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
