import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const sampleBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHElEQVR42mP8/5+BfwYiAAMTA/4bBgYGBgYGBoZyDgCbiBnG6bMRAAAAAElFTkSuQmCC';

test('detect signature via UI', async ({ page }, testInfo) => {
  const assetDir = path.join(testInfo.outputDir, 'assets');
  fs.mkdirSync(assetDir, { recursive: true });
  const imgPath = path.join(assetDir, 'sample.png');
  fs.writeFileSync(imgPath, Buffer.from(sampleBase64, 'base64'));

  await page.route('**/signature/detect**', async route => {
    await page.waitForTimeout(1200);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        signatures: [
          {
            confidence: 0.95,
            boundingBox: { x1: 1, y1: 1, x2: 9, y2: 9 },
            imageData: sampleBase64
          }
        ]
      })
    });
  });

  await page.goto('/');
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(imgPath);
  await page.getByRole('combobox').click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  const detectButton = page.getByRole('button', { name: 'Rileva' });
  await detectButton.click();
  await expect(detectButton).toBeDisabled();
  await expect(page.locator('pre')).toBeVisible();
  await page.screenshot({ path: path.join(testInfo.outputDir, 'full.png'), fullPage: true });
});
