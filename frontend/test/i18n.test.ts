import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';

const originalUrl = location.href;
beforeEach(() => { vi.resetModules(); history.replaceState({}, '', '/'); localStorage.clear(); });
afterEach(() => { history.replaceState({}, '', originalUrl); localStorage.setItem('peach.locale', 'zh-CN'); vi.restoreAllMocks(); vi.resetModules(); });

describe('language selection', () => {
  it('uses saved preference before browser language and recognizes regional Spanish', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-MX', 'en-US']);
    const { detectLocale, normalizeLocale } = await import('../src/i18n');
    expect(detectLocale()).toBe('es');
    localStorage.setItem('peach.locale', 'en');
    expect(detectLocale()).toBe('en');
    history.replaceState({}, '', '/?lang=es-AR');
    expect(detectLocale()).toBe('es');
    expect(normalizeLocale('zh-Hans')).toBe('zh-CN');
    expect(normalizeLocale('de-DE')).toBeUndefined();
  });

  it('falls back to English when storage is blocked and no browser language is supported', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR']);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked'); });
    const { detectLocale } = await import('../src/i18n');
    expect(detectLocale()).toBe('en');
  });

  it.each([['en', 'Home'], ['es', 'Inicio'], ['zh-CN', '首页']])('renders %s and sets the document language', async (language, home) => {
    localStorage.setItem('peach.locale', language);
    const { t, applyDocumentLocale } = await import('../src/i18n');
    applyDocumentLocale();
    expect(document.documentElement.lang).toBe(language);
    expect(t('首页')).toBe(home);
    expect(t('请求失败（{{v0}}）', { v0: 503 })).toContain('503');
    expect(t('My private title <>&')).toBe('My private title <>&');
    expect(t('下载 {{v0}}', { v0: 'C:\\媒体\\title.mp4' })).toContain('C:\\媒体\\title.mp4');
  });

  it('localizes marked shell controls and preserves collection content and error paths', async () => {
    localStorage.setItem('peach.locale', 'es');
    const { t, applyDocumentLocale } = await import('../src/i18n');
    const { translateServerMessage } = await import('../src/i18n/server-message');
    document.body.innerHTML = '<input id="q" data-i18n placeholder="搜索馆藏"><p id="title">我的影片</p>';
    applyDocumentLocale();
    expect(document.querySelector<HTMLInputElement>('#q')?.placeholder).toBe('Buscar en la biblioteca');
    expect(document.querySelector('#title')?.textContent).toBe('我的影片');
    expect(t('{{v0}} 项', { v0: 1 })).toBe('1 elemento');
    expect(t('{{v0}} 项', { v0: 2 })).toBe('2 elementos');
    expect(translateServerMessage('目录不存在，或者不是目录：C:\\媒体。先建好再填。')).toContain('C:\\媒体');
    expect(translateServerMessage('Custom diagnostic: 我的影片')).toBe('Custom diagnostic: 我的影片');
    document.body.replaceChildren();
  });
});

describe('translation catalogs', () => {
  it('provides both translations with identical interpolation fields for every message', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    const placeholders = (text: string) => (text.match(/\{\{\w+\}\}/g) ?? []).sort();
    for (const [key, english] of Object.entries(en)) {
      const spanish = (es as Record<string, string>)[key]!;
      expect(english.trim(), key).not.toBe('');
      expect(spanish.trim(), key).not.toBe('');
      expect(placeholders(english), key).toEqual(placeholders(key));
      expect(placeholders(spanish), key).toEqual(placeholders(key));
    }
  });
});
