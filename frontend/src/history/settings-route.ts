import { t as peachT } from "../i18n/index";
import en from '../i18n/en.json' with { type: 'json' };
import es from '../i18n/es.json' with { type: 'json' };
export const PREFERENCE_SECTIONS = {
  appearance: peachT("外观与导航"), playback: peachT("浏览与播放"), jav: peachT("JAV 与新作"), search: peachT("搜索与推荐"), content: peachT("内容显示"),
} as const;
export const CONFIGURATION_SECTIONS = {
  library: peachT("媒体库与入库"), subscriptions: peachT("来源与订阅"), downloads: peachT("下载渠道"), network: peachT("网络与访问"), maintenance: peachT("应用与维护"),
  diagnostics: peachT("系统诊断"),
} as const;
const CONFIGURATION_SOURCE_TITLES: Record<keyof typeof CONFIGURATION_SECTIONS, string> = {
  library: '媒体库与入库', subscriptions: '来源与订阅', downloads: '下载渠道', network: '网络与访问',
  maintenance: '应用与维护', diagnostics: '系统诊断',
};

/** 按已支持语言识别区块链接，用当前界面语言选择对应区块。 */
export function normalizeConfigurationSection(value: string | null | undefined): string {
  if (!value) return '';
  const key = (Object.keys(CONFIGURATION_SOURCE_TITLES) as (keyof typeof CONFIGURATION_SECTIONS)[])
    .find(key => {
      const source = CONFIGURATION_SOURCE_TITLES[key];
      return [key, source, (en as Record<string, string>)[source], (es as Record<string, string>)[source]].includes(value);
    });
  return key ? CONFIGURATION_SECTIONS[key] : '';
}

export type ConfigurationPath = `/settings/${keyof typeof CONFIGURATION_SECTIONS}`;
export function configurationSection(path: string): string {
  return CONFIGURATION_SECTIONS[path.split('/')[2] as keyof typeof CONFIGURATION_SECTIONS] || CONFIGURATION_SECTIONS.library;
}
export const PREFERENCE_PATHS = ['/settings', ...Object.keys(PREFERENCE_SECTIONS).map(key => `/settings/${key}`)];
export const isPreferencePath = (path: string): boolean => PREFERENCE_PATHS.includes(path);
export function preferenceSection(path: string): string {
  return PREFERENCE_SECTIONS[path.split('/')[2] as keyof typeof PREFERENCE_SECTIONS] || PREFERENCE_SECTIONS.appearance;
}
export function settingsPath(title: string): string {
  const key = Object.entries({ ...PREFERENCE_SECTIONS, ...CONFIGURATION_SECTIONS }).find(([, value]) => value === title)?.[0];
  return `/settings/${key || 'appearance'}`;
}
export interface SettingsBackground {
  pathname: string; search: string; state: unknown; seq: number;
}
export const settingsBackgroundOf = (state: unknown): SettingsBackground | null => {
  const background = (state as { settingsBackground?: SettingsBackground } | null)?.settingsBackground;
  return background && typeof background.pathname === 'string' ? background : null;
};
