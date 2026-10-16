import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { buildHarness } from '../test-support/build-harness.js';

let bundle;
test.beforeAll(async () => { bundle = await buildHarness(); });
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => route.abort());
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({ content: bundle });
  await expect(page.locator('button.ft-user')).toBeVisible();
  await expect.poll(() => page.evaluate(() => __sddFixture.writes.length)).toBeGreaterThanOrEqual(12);
  await page.locator('button.ft-user').click();
});

test('SDD-E2E-001 cargar y guardar objetivo desde interfaz', async ({ page }) => {
  await page.getByRole('button', { name: 'Mantener', exact: true }).click();
  await expect.poll(() => page.evaluate(() => __sddFixture.data.goals.weeklyChange)).toBe(0);
  const writes = await page.evaluate(() => __sddFixture.writes.filter((w) => w.payload.key === 'goals'));
  expect(writes.at(-1).payload.user_id).toBe('sdd-user-001');
  expect(writes.at(-1).options.onConflict).toBe('user_id,key');
  await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
});

test('SDD-E2E-002 exportar y reimportar copia desde interfaz', async ({ page }) => {
  await page.getByRole('button', { name: 'DATOS Y CONFIGURACIÓN', exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar copia ahora' }).click();
  const download = await downloadEvent;
  const original = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(Object.keys(original)).toHaveLength(12);
  expect(original).not.toHaveProperty('timer');
  expect(download.suggestedFilename()).toMatch(/^fittrack-\d{4}-\d{2}-\d{2}\.json$/);
  await page.getByRole('button', { name: 'PERFIL', exact: true }).click();
  await page.getByRole('button', { name: 'Mantener', exact: true }).click();
  await expect.poll(() => page.evaluate(() => __sddFixture.data.goals.weeklyChange)).toBe(0);
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(original)) });
  await expect.poll(() => page.evaluate(() => __sddFixture.data.goals.weeklyChange)).toBe(original.goals.weeklyChange);
  await expect(page.locator('input[type=file]')).toHaveValue('');
});

test('SDD-E2E-003 fallo de guardado visible y dato remoto conservado', async ({ page }) => {
  const original = await page.evaluate(() => __sddFixture.data.goals.weeklyChange);
  await page.evaluate(() => { __sddFixture.failWrites = true; });
  await page.getByRole('button', { name: 'Mantener', exact: true }).click();
  await expect(page.getByText('Error al guardar', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => __sddFixture.data.goals.weeklyChange)).toBe(original);
});
