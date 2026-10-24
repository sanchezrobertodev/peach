import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalUrl = window.location.href;
const originalLanguage = window.localStorage.getItem('peach.locale');

describe.each(['en', 'es'])('localized UI keeps protocol values (%s)', language => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.setItem('peach.locale', language);
    window.history.replaceState({}, '', `/?lang=${language}`);
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalUrl);
    if (originalLanguage === null) window.localStorage.removeItem('peach.locale');
    else window.localStorage.setItem('peach.locale', originalLanguage);
    vi.resetModules();
  });

  it('keeps portrait query values and stored duration tags unchanged', async () => {
    const { shortsParams } = await import('../../src/react/catalog-grid/catalog-grid');
    const { cleanTagFilter, DURATION_TAGS } = await import('../../src/core/index');
    expect(new URLSearchParams(shortsParams({ tag: '剧情' }, 0)).get('orient')).toBe('竖屏');
    expect([...DURATION_TAGS]).toEqual(['短片-2分内', '中片-10分内', '长片-30分内', '超长片-30分上']);
    expect(cleanTagFilter('剧情,短片-2分内,中片-10分内,长片-30分内,超长片-30分上')).toBe('剧情');
  });

  it('uses local number conventions and preserves calendar dates', async () => {
    const { shortCount } = await import('../../src/react/charts/bar-card');
    const { tasteDate, historySpan } = await import('../../src/react/taste/taste');
    expect(shortCount(123456).replace(/\s/g, ' ')).toBe(language === 'en' ? '123.5K' : '123,5 mil');
    expect(tasteDate('2026-10-12')).toBe(language === 'en' ? '10/12/2026' : '12/10/2026');
    const span = historySpan({ history_sources: 2, range_start: '2026-10-12', range_end: '2026-10-17' });
    expect(span).toContain(language === 'en' ? '10/12–10/17' : '12/10–17/10');
  });

  it('selects the diagnostics skeleton using the translated section title', async () => {
    const { configurationSkeleton } = await import('../../src/configuration-skeleton');
    const { CONFIGURATION_SECTIONS } = await import('../../src/history/settings-route');
    expect(configurationSkeleton(CONFIGURATION_SECTIONS.diagnostics)).toContain('data-skeleton="diagnostics"');
    expect(configurationSkeleton(CONFIGURATION_SECTIONS.library)).not.toContain('data-skeleton="diagnostics"');
  });

  it('translates tag headings and empty states without translating entity keys', async () => {
    const { t } = await import('../../src/i18n');
    const skeleton = await import('../../src/index-skeleton');
    const index = await import('../../src/react/index/index-data');
    const { catalogEmptyHtml } = await import('../../src/catalog-onboarding');
    expect(t('标签')).not.toBe('标签');
    expect(skeleton.INDEX_TITLES.tags).toBe(t('标签'));
    expect(index.INDEX_TITLES.tags).toBe(t('标签'));
    expect(catalogEmptyHtml({ kind: 'tags', online: true })).toContain(t('标签'));
    expect(index.ENTITY_KINDS.performers).toBe('performer');
  });

  it('recognizes the stored Chinese official-site label before translating it', async () => {
    const { officialLinkText } = await import('../../src/core/index');
    const { t } = await import('../../src/i18n');
    expect(officialLinkText({ url: 'https://example.invalid/profile', label: '官方网站' }, 'studio', ['Unrelated studio']))
      .toBe(t('官方网站'));
  });

  it('removes followed filters by stable kind even when labels are translated', async () => {
    const { followConditions, dropCondition } = await import('../../src/react/follow-feed/follow-feed');
    const view = {
      status: 'new' as const, media: 'videos' as const, author: 'alice', provider: 'source', work: 'theme', tags: ['tag'],
      durMin: 0, durMax: 0, sort: 'new' as const, dir: 'desc' as const, seed: 0,
    };
    const rows = followConditions(view, { authors: new Map(), providers: new Map(), works: new Map() });
    expect(rows.map(row => row.kind)).toEqual(['创作者', '来源', '题材', '标签']);
    expect(dropCondition(view, rows[0]!).author).toBe('');
    expect(dropCondition(view, rows[1]!).provider).toBe('');
    expect(dropCondition(view, rows[2]!).work).toBe('');
    expect(dropCondition(view, rows[3]!).tags).toEqual([]);
  });
});
