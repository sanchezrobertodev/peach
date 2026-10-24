import { t as peachT } from "../../i18n/index";
import { JAV_RELEASE_SORT } from '../../sort-preferences';

export const DISCOVERY_SORTS = [
  ['taste', peachT("口味"), peachT("按口味匹配排序")],
  ['release_date', JAV_RELEASE_SORT[1], peachT("按发行日期排序")],
  ['source_score', peachT("来源评分"), peachT("按来源评分排序")],
  ['duration', peachT("时长"), peachT("按时长排序")],
  ['code', peachT("番号"), peachT("按番号排序")],
] as const;
export type DiscoverySort = typeof DISCOVERY_SORTS[number][0];
export type DiscoveryDirection = 'asc' | 'desc';

export function discoveryScore(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(3) : '—';
}

/** 口味相关度使用固定百分制；未知读数保留空值。 */
export function recommendationScore(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { score: '—', label: peachT("资料未取得"), color: 'neutral' as const };
  const score = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const tier = score >= 75 ? { label: peachT("强烈推荐"), color: 'lime' as const }
    : score >= 50 ? { label: peachT("推荐"), color: 'blue' as const }
    : score >= 25 ? { label: peachT("值得看看"), color: 'yellow' as const }
    : { label: peachT("探索"), color: 'neutral' as const };
  return { score: String(score), ...tier };
}
