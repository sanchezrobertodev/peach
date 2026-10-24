import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { Browser } from 'playwright-core';
import { launch, requiredEnv, settle, visit, VIEWPORTS } from './harness.ts';
import en from '../src/i18n/en.json' with { type: 'json' };
import es from '../src/i18n/es.json' with { type: 'json' };

describe('English and Spanish interface', () => {
  let browser: Browser;
  before(async () => { browser = await launch(); });
  after(async () => { await browser?.close(); });

  for (const viewport of VIEWPORTS) for (const language of ['en', 'es'] as const) {
    it(`${language} navigation and language selection at ${viewport.width}px`, { timeout: 90_000 }, async () => {
      const catalog = language === 'en' ? en : es;
      const opened = await visit(browser, `/?lang=${language}`, viewport);
      try {
        const { page } = opened;
        await page.locator('#settingsBtn').waitFor({ state: 'attached' });
        await settle(page);
        assert.equal(await page.locator('html').getAttribute('lang'), language);
        await page.locator('#settingsBtn').evaluate((button: HTMLElement) => button.click());
        const panel = page.locator('#settingsPanel:not([hidden])');
        await panel.waitFor();
        await panel.getByRole('tab', { name: catalog['外观与导航'], exact: true }).waitFor();
        await page.screenshot({ path: `../build/localization-${language}-${viewport.width}.png` });
        const row = panel.locator('[data-setting-row]').filter({ hasText: catalog['界面语言'] });
        await row.getByRole('button').click();
        const next = language === 'en' ? 'es' : 'en';
        await page.getByRole('option', { name: next === 'es' ? 'Español' : 'English', exact: true }).click();
        await page.waitForURL((url) => url.searchParams.get('lang') === next);
        await page.waitForFunction((wanted) => document.documentElement.lang === wanted, next);
        assert.equal(await page.evaluate(() => localStorage.getItem('peach.locale')), next);
        await page.goto(requiredEnv('PEACH_E2E_ORIGIN') + '/');
        await page.waitForFunction((wanted) => document.documentElement.lang === wanted, next);
        const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(dimensions.scroll <= dimensions.width + 1, JSON.stringify(dimensions));
        assert.deepEqual(opened.problems, []);
      } finally { await opened.close(); }
    });
  }
});
