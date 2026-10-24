import { createInstance } from 'i18next';
import en from './en.json' with { type: 'json' };
import es from './es.json' with { type: 'json' };

export const LOCALE_STORAGE_KEY = 'peach.locale';
export const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Español' },
  { id: 'zh-CN', name: '简体中文' },
] as const;
export type Locale = typeof LANGUAGES[number]['id'];

export function normalizeLocale(value: string | null | undefined): Locale | undefined {
  const language = value?.toLowerCase().split(/[-_]/)[0];
  return language === 'en' || language === 'es' ? language : language === 'zh' ? 'zh-CN' : undefined;
}

export function detectLocale(): Locale {
  if (typeof window !== 'undefined') {
    const requested = normalizeLocale(new URL(window.location.href).searchParams.get('lang'));
    if (requested) return requested;
    try {
      const saved = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
      if (saved) return saved;
    } catch { /* 浏览器可以禁止存储；语言仍由当前网址与浏览器偏好决定。 */ }
  }
  const preferences = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
  for (const language of preferences) {
    const supported = normalizeLocale(language);
    if (supported) return supported;
  }
  return 'en';
}

export const locale = detectLocale();
const translator = createInstance();
void translator.init({
  lng: locale,
  fallbackLng: 'en',
  supportedLngs: ['en', 'es', 'zh-CN'],
  initAsync: false,
  keySeparator: false,
  nsSeparator: false,
  returnEmptyString: false,
  interpolation: { escapeValue: false },
  resources: { en: { translation: en }, es: { translation: es } },
});

/** 原文键只标记界面文案；馆藏数据、协议值和路径不进入此函数。 */
export function t(source: string, values?: Record<string, unknown>): string {
  if (locale === 'zh-CN') return source.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    values && Object.hasOwn(values, key) ? String(values[key] ?? '') : match);
  const value = values?.count ?? values?.v0;
  const count = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : undefined;
  return translator.t(source, { ...values, ...(count === undefined ? {} : { count }), defaultValue: source }) as string;
}

export function applyDocumentLocale(): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = 'ltr';
  document.title = t(document.title);
  for (const element of document.querySelectorAll('[data-i18n]')) {
    for (const name of ['title', 'aria-label', 'placeholder']) {
      const source = element.getAttribute(name);
      if (source) element.setAttribute(name, t(source));
    }
  }
  for (const element of document.querySelectorAll('[data-i18n-text]')) element.textContent = t(element.textContent ?? '');
}

/** 整页重新挂载让遗留模块的常量、播放器和 React 使用同一份语言。 */
export function changeLanguage(next: Locale): void {
  if (!LANGUAGES.some(({ id }) => id === next) || next === locale) return;
  try { window.localStorage.setItem(LOCALE_STORAGE_KEY, next); } catch { /* 网址保留本次选择。 */ }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  window.location.assign(url.href);
}
