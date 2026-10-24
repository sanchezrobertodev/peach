import { t as peachT } from "./i18n/index";
import { islandButton, islandGlyph, islandSearchInput, islandShortcutsEntry } from './island-skeleton';
import { JAV_TABS } from './react/jav/jav-navigation';
import { cardRatio, gridLayout, javLayout } from './appearance';
import { DISCOVERY_SORTS } from './react/jav/discovery-sorts';

const text = (width: string) => `<span data-jav-skeleton-text class="skeleton block rounded-md" style="width:${width}" aria-hidden="true"></span>`;
const cover = (classes: string) => `<span data-jav-skeleton-cover class="skeleton ${classes}"></span>`;
export const JAV_RECOMMENDATION_GRID = 'w-full min-w-0';

/** 查询中的标签沿用筛选条的高度与横向布局。 */
export function javTagSkeleton(): string {
  return ['w-20', 'w-16', 'w-24', 'w-20', 'w-16', 'w-24'].map(width =>
    `<span data-skeleton="tag" aria-hidden="true" class="skeleton-sheen relative block h-7.5 flex-none rounded-(--tag-radius) ${width}"></span>`).join('');
}

/** 占位复用推荐卡与想要行的宽度、封面比例和列数。 */
export function javContentSkeleton(tab: string, layout = javLayout()): string {
  if (tab === 'wants') return `<div class="flex w-full flex-col gap-8" data-skeleton="jav-wants">${text('5em')}${Array.from({ length: 3 }, () => `<div class="flex min-w-0 gap-4 rounded-2lg bg-background-secondary-default p-6">${cover('block w-card-cover shrink-0 aspect-card-cover rounded-2lg max-sm:w-24')}<div class="flex min-w-0 flex-1 flex-col gap-3">${text('80%')}${text('60%')}${text('40%')}</div></div>`).join('')}</div>`;
  const ratio = cardRatio({ ...gridLayout({ active: true, home: false, portrait: false }), size: layout });
  return `<div data-media-grid class="${JAV_RECOMMENDATION_GRID}" data-skeleton="jav-discover">${Array.from({ length: 6 }, () => `<div data-jav-skeleton-card data-media-card data-jav-card class="flex min-w-0 flex-col gap-3">
    <span data-jav-skeleton-cover class="skeleton block w-full rounded-2lg" style="aspect-ratio:${ratio}"></span>
    <div data-media-meta><span data-jav-skeleton-avatar class="skeleton block shrink-0"></span><div data-media-text>
      <div data-media-title>${text('85%')}${text('65%')}</div><div data-media-byline>${text('55%')}</div>
      <div data-media-tags><span class="skeleton block h-5 w-20 rounded-md"></span><span class="skeleton block h-5 w-24 rounded-md"></span></div>
    </div></div>
    <div data-jav-skeleton-actions class="flex flex-wrap gap-2"><span data-jav-skeleton-action class="skeleton block h-9 w-20 rounded-md"></span><span data-jav-skeleton-action class="skeleton block h-9 w-12 rounded-md"></span><span data-jav-skeleton-action class="skeleton block h-9 w-26 rounded-md"></span></div>
  </div>`).join('')}</div>`;
}

export function javPageSkeleton(tab: string): string {
  const filterLabel = tab === 'wants' ? peachT("筛选想要") : peachT("筛选推荐");
  return `<div class="peach-react"><div class="flex w-full flex-col gap-6">
    <div class="flex w-full flex-col gap-4"><div class="flex flex-wrap items-center justify-between gap-2"><h2 data-page-title class="text-display-4-medium text-text-primary max-board-narrow:text-title-1-medium">JAV</h2>${islandButton({ variant: 'primary', label: peachT("查找资源"), attrs: 'disabled data-skeleton-action' })}</div>
    <div class="relative flex flex-none gap-1 overflow-x-auto max-board-narrow:gap-0">${JAV_TABS.map(([key, label]) => `<span class="relative flex flex-none items-center whitespace-nowrap rounded-md px-3 py-2 text-body-regular max-board-narrow:px-2.25 max-board-narrow:text-body-2-regular ${key === tab ? 'bg-background-tertiary-default text-text-primary' : 'text-text-secondary'}">${label}</span>`).join('')}</div></div>
    <form aria-label="${filterLabel}">${islandSearchInput(peachT("筛选番号、女优或标题"), '', filterLabel)}</form>
    ${tab === 'wants' ? peachT("<div class=\"rounded-2lg bg-background-secondary-default px-6 py-5\"><h3 class=\"mb-4 text-title-2-medium text-text-primary\">按番号添加</h3>{{v0}}</div>{{v1}}", { v0: text('100%'), v1: javContentSkeleton(tab) })
      : `<section class="flex min-w-0 flex-col gap-4">${javFilterSkeleton()}${javContentSkeleton(tab)}</section>`}</div></div>`;
}

/** 首屏筛选控件使用首页的两排容器；标签和读数依赖查询。 */
function javFilterSkeleton(): string {
  const scope = (key: string, label: string) => `<button type="button" data-entity-tag="${key}" data-entity-press="" aria-pressed="${key === 'external'}" class="flex h-7.5 flex-none items-center gap-1.75 rounded-lg border border-dashed border-(--glass-low) bg-transparent px-2.5 text-body-2-regular leading-5 whitespace-nowrap text-inherit">${label}</button>`;
  const size = (value: string, glyph: string) => `<span data-glass-segment="" ${javLayout() === value ? 'data-selected="true"' : ''} class="flex size-7.5 flex-none items-center justify-center rounded-lg text-(--glass-text)/62">${islandGlyph(glyph, 'size-4')}</span>`;
  return peachT("<div data-filter-glass data-glass-pane data-filter-frame data-jav-filter data-catalog-frame class=\"sticky top-topbar z-10 mb-5.5 flex flex-col\">\n    <div data-filter-row=\"top\" class=\"flex h-12 min-w-0 items-center overscroll-x-contain px-3 py-2 gap-1.5 overflow-visible\">\n      <div data-catalog-scroll><div data-catalog-views>{{v0}}{{v1}}<span data-entity-sep aria-hidden=\"true\"></span></div><div data-catalog-tags>{{v2}}</div></div>\n    </div>\n    <div data-filter-row=\"bottom\" aria-busy=\"true\" class=\"flex min-h-12 min-w-0 items-center gap-3 px-3 py-2\">\n      <span data-catalog-readout><span data-skeleton=\"count\" class=\"relative inline-block h-3.5 w-37.5 rounded-md align-middle skeleton-sheen\"></span></span>\n      {{v3}}\n      <span data-entity-sorts><button type=\"button\" data-entity-batch data-filter-action data-skeleton-action data-jav-metadata-update title=\"更新资料\" aria-label=\"更新资料\" disabled>{{v4}}</button><span data-entity-layout class=\"inline-flex w-max max-w-full flex-none items-center gap-0.5 rounded-lg\">{{v5}}{{v6}}</span>\n        {{v7}}\n      </span>\n    </div>\n  </div>", { v0: scope('external', peachT("库外发现")), v1: scope('library', peachT("馆藏探索")), v2: javTagSkeleton(), v3: islandShortcutsEntry(), v4: islandGlyph('refresh-cw', 'size-4'), v5: size('big', 'maximize'), v6: size('small', 'layout-grid'), v7: DISCOVERY_SORTS.map(([key, label]) => `<button type="button" data-entity-sort="${key}" data-entity-press aria-pressed="${key === 'taste'}">${label}${key === 'taste' ? islandGlyph('arrow-down', 'size-3.5') : ''}</button>`).join('') });
}
