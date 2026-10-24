import { afterEach, describe, expect, it, vi } from 'vitest';

const originalUrl = window.location.href;
const languages = ['en', 'es', 'zh-CN'] as const;

afterEach(() => {
  window.history.replaceState({}, '', originalUrl);
  vi.resetModules();
});

async function languagePage(url: URL) {
  window.history.replaceState({}, '', url.href);
  vi.resetModules();
  return import('../src/history/settings-route');
}

describe('configuration links survive locale changes', () => {
  it.each(languages)('keeps a legacy %s diagnostic deep link selected after changing language', async sourceLanguage => {
    const url = new URL('/settings/library', originalUrl);
    url.searchParams.set('lang', sourceLanguage);
    const source = await languagePage(url);
    url.searchParams.set('section', source.CONFIGURATION_SECTIONS.diagnostics);
    const legacyLabel = url.searchParams.get('section');

    for (const language of languages) {
      // changeLanguage 保留当前链接的 section 参数。
      url.searchParams.set('lang', language);
      const current = await languagePage(url);
      const selected = current.normalizeConfigurationSection(new URL(window.location.href).searchParams.get('section'));
      expect(url.searchParams.get('section')).toBe(legacyLabel);
      expect(selected).toBe(current.CONFIGURATION_SECTIONS.diagnostics);
      expect(current.settingsPath(selected)).toBe('/settings/diagnostics');
      const { configurationSkeleton } = await import('../src/configuration-skeleton');
      expect(configurationSkeleton(selected)).toContain('data-skeleton="diagnostics"');
    }
  });

  it.each(languages)('uses a stable source-settings path in %s', async language => {
    const url = new URL('/subscriptions?tab=source', originalUrl);
    url.searchParams.set('lang', language);
    const current = await languagePage(url);
    const { followManageEntry } = await import('../src/react/follow-manage/manage-route');
    const path = followManageEntry(url.search);
    expect(path).toBe('/settings/subscriptions');
    expect(current.configurationSection(path)).toBe(current.CONFIGURATION_SECTIONS.subscriptions);
    expect(current.normalizeConfigurationSection('subscriptions')).toBe(current.CONFIGURATION_SECTIONS.subscriptions);
    expect(current.normalizeConfigurationSection('not-a-section')).toBe('');
  });
});
