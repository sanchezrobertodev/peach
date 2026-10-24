import { t as peachT } from "./i18n/index";
import { esc, icon } from './core';
import type { EntitySortKey, SegmentOption } from './react/entity-filter/entity-filter';
import { SEGMENTED_GLASS_TRACK, SEGMENT_GLASS } from './react/components/segmented';

interface Layout { name: string; label: string; value: string; options: readonly SegmentOption[] }

/** 已知的控件保留文字、字形与按下态；等待接线时不能执行动作。 */
export function filterControlsSkeletonHtml(sorts: readonly EntitySortKey[], layout: Layout | null): string {
  const waiting = 'disabled data-skeleton-action';
  const sizes = layout ? `<span data-entity-layout="" class="${SEGMENTED_GLASS_TRACK}" role="radiogroup" aria-label="${esc(layout.label)}">${layout.options.map(([value, label, glyph]) =>
    `<button type="button" class="${SEGMENT_GLASS}" role="radio" aria-label="${esc(label)}" aria-checked="${value === layout.value}" data-glass-segment=""${value === layout.value ? ' data-selected=""' : ''} ${waiting}>${icon(glyph)}</button>`).join('')}</span>` : '';
  return peachT("<span data-entity-sorts=\"\"><button type=\"button\" data-entity-batch=\"\" aria-label=\"换一批\" {{v0}}>{{v1}}</button>{{v2}}{{v3}}</span>", { v0: waiting, v1: icon('shuffle'), v2: sizes, v3: sorts.map(sort =>
    `<button type="button" data-entity-sort="${esc(sort.key)}" aria-pressed="${sort.pressed}" ${waiting}>${esc(sort.label)}${sort.dir ? icon(sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : ''}</button>`).join('') });
}
