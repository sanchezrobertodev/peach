import { t as peachT } from "./i18n/index";
import { icon } from '@peach/legacy/core';

import { islandButton, islandGlyph, islandSelect } from './island-skeleton';

/* 「扫描与采集」「媒体修复」两张卡的正文。卡片本体由 React 画，骨架与遗留层的取数占位
   画的是同一段话：写两份的话，骨架上的那句会比真卡短一截，接管时整张卡跳一次。 */
export const SCAN_CARD_TEXT = peachT("同步文件与影片资料，按设置生成本地视频预览。下拉菜单可选择只扫描文件、同步已入库影片、生成预览或补全资料。");
export const REPAIR_CARD_TEXT = peachT("修缺时间戳表（播放卡顿）和缺索引（打不开）的 MP4。常看的片子先修。");

const bar = '<span class="skeleton skeleton-text" aria-hidden="true"></span>';
/* 要等数据才能执行的键是真的按不了：原生 `disabled` 挡住点击与聚焦，`data-skeleton-action`
   让各档按键在骨架里统一成同一副禁用面（`board.css`），尺寸仍是最终那一档，数据一到只换颜色。 */
const waiting = 'type="button" disabled data-skeleton-action';

/* 两张 React 卡的骨架包在同一层 `.peach-react` 里，按键与下拉照 Board UI 的尺寸画（见
   `island-skeleton.ts`）。卡片这一层的结构照 React 那两张卡抄：外面一列 `gap-4`，标题与正文
   同一对字级。下拉框里只是一截占位条，不是控件，留 `aria-disabled` 就够。 */
const waitingAction = 'disabled data-skeleton-action';
const unavailable = 'aria-disabled="true"';
const island = (card: string) => `<div class="peach-react"><div class="flex flex-col gap-4">${card}</div></div>`;
const cardText = (title: string, text: string) => `<div data-geist-fieldset-content>
          <h3 class="text-title-2-medium text-text-primary">${title}</h3>
          <p class="text-body-2-regular text-text-secondary">${text}</p></div>`;

/** 「扫描与采集」卡：与 React `LibraryProcessingCard` 同一副容器、同一段正文、同一组键。
 *  「复核资料」只在有候选时出现，这里不预画。 */
export function scanCardSkeletonHtml(): string {
  return island(peachT("<section aria-label=\"扫描与采集\" data-geist-fieldset data-cleanup-task data-cleanup-processing data-fieldset-stack>\n        {{v0}}\n        <footer data-geist-fieldset-footer><a href=\"/sources\" class=\"inline-flex items-center justify-center gap-1 whitespace-nowrap font-sans rounded-sm text-body-medium text-accent-600\"><span>来源和凭证</span>{{v1}}</a><span data-button-group data-split-button data-variant=\"primary\">{{v2}}{{v3}}</span></footer>\n      </section>", { v0: cardText(peachT("扫描与采集"), SCAN_CARD_TEXT), v1: islandGlyph('arrow-up', 'size-[18px] shrink-0 rotate-90'), v2: islandButton({ glyph: 'database', label: peachT("同步媒体库"), attrs: waitingAction }), v3: islandButton({ glyph: 'chevron-down', attrs: peachT("{{v0}} aria-label=\"更多同步方式\"", { v0: waitingAction }) }) }));
}

/** 「媒体修复」卡：页脚的媒体库下拉框先按最终尺寸画出来，库名要等数据；「开始修复」要等选定
 *  媒体库，骨架里是禁用态。 */
export function repairCardSkeletonHtml(): string {
  return island(peachT("<section aria-label=\"媒体修复\" data-geist-fieldset data-cleanup-task data-cleanup-processing>\n        {{v0}}\n        <footer data-geist-fieldset-footer>{{v1}}{{v2}}</footer>\n      </section>", { v0: cardText(peachT("媒体修复"), REPAIR_CARD_TEXT), v1: islandSelect(bar, { className: 'w-48', attrs: unavailable }), v2: islandButton({ label: peachT("开始修复"), attrs: waitingAction }) }));
}

/** 首屏复用读数卡、三张任务卡、链接管理与资源同步的最终容器；静态标题、正文和键立即呈现。 */
export function cleanupSkeletonHtml(): string {
  const stats = [[peachT("人工复核"), 'square-check-big'], [peachT("高清版"), 'sparkles'], [peachT("重复文件"), 'file-stack'], [peachT("垃圾文件"), 'file-archive'], [peachT("回收站"), 'trash']];
  const presets = `<span class="geist-button ui-organize-preset-skeleton">${bar}</span>`.repeat(3);
  const organizeField = (label: string) => `<div class="ui-organizefield"><span>${label}</span>
            <span class="geist-input ui-organize-input-skeleton">${bar}</span></div>`;
  return peachT("<div class=\"ui-cleanuppage\" data-skeleton=\"cleanup\" aria-busy=\"true\" aria-label=\"正在读取数据管理状态\">\n    <div class=\"ui-cleanupstats\">{{v0}}</div>\n    <div class=\"cleanupgrid\">\n      <div class=\"cleanupscraping\">{{v1}}</div>\n      <div class=\"cleanupmediarepair\">{{v2}}</div>\n      <section class=\"cleanupfieldset cleanuporganize\" data-geist-fieldset data-cleanup-task aria-labelledby=\"cleanup-loading-organize\">\n        <div class=\"geist-fieldset-content\"><h3 class=\"geist-fieldset-title\" id=\"cleanup-loading-organize\">整理</h3>\n          <p>按模板给文件改名并归入目录。先预览，确认后执行；执行过的一批可以整批退回。</p>\n          <div class=\"ui-organizefields\">\n            <div class=\"organizesource\"><span class=\"ui-gselect\"><span class=\"gselectfield organize-source-skeleton\">{{v3}}{{v4}}</span></span></div>\n            {{v5}}\n            {{v6}}\n            <div class=\"ui-organizepresets\">{{v7}}</div>\n            <p class=\"cleanupmeta\">{{v8}}</p>\n          </div></div>\n        <footer class=\"geist-fieldset-footer\" data-geist-fieldset-footer><button class=\"geist-button primary\" {{v9}}>预览</button></footer>\n      </section></div>\n    <section class=\"ui-resourcesync\" aria-labelledby=\"cleanup-loading-links\">\n      <h2 id=\"cleanup-loading-links\">链接管理</h2>\n      <div class=\"resourcesyncbox\" data-geist-fieldset data-cleanup-task data-fieldset-stack>\n        <div class=\"resourcesyncbody geist-fieldset-content\"><h3 class=\"geist-fieldset-title\">站外链接</h3>\n          <div class=\"linksummary\"><div class=\"ui-linkstats\"><div><span>链接总数</span><b>{{v10}}</b><small>{{v11}}</small></div>{{v12}}</div>\n          <div class=\"ui-linkhosts\"><span>主要站点</span><b>{{v13}}</b></div></div></div>\n        <div class=\"resourcesyncfooter geist-fieldset-footer\" data-geist-fieldset-footer><button class=\"resourceaction primary\" {{v14}}>{{v15}}<span>检查死链</span></button></div>\n      </div></section>\n    <section class=\"ui-resourcesync\" aria-labelledby=\"cleanup-loading-sync\">\n      <h2 id=\"cleanup-loading-sync\">资源同步</h2>\n      <div class=\"resourcesyncbox\" data-geist-fieldset data-cleanup-task>\n        <div class=\"resourcesyncbody geist-fieldset-content\"><h3 class=\"geist-fieldset-title\">文件与记录核对</h3>\n          <p>按馆藏记录逐条查找本地磁盘与网盘上的文件，列出文件已不存在的记录、空文件夹，以及不再被引用的缓存。</p></div>\n        <div class=\"resourcesyncfooter geist-fieldset-footer\" data-geist-fieldset-footer><button class=\"resourceaction primary\" {{v16}}>{{v17}}<span>检查文件</span></button></div>\n      </div></section></div>", { v0: stats.map(([title, glyph]) => `
      <button type="button" class="board-plain-stat" disabled>
        <span class="ui-board-plain-stat-head"><span class="ui-board-stat-tile">${icon(glyph!)}</span>${title}</span>
        <strong>${bar}</strong><span class="cleanupmeta">${bar}</span></button>`).join(''), v1: scanCardSkeletonHtml(), v2: repairCardSkeletonHtml(), v3: bar, v4: icon('chevron-down'), v5: organizeField(peachT("文件名模板")), v6: organizeField(peachT("目录模板")), v7: presets, v8: bar, v9: waiting, v10: bar, v11: bar, v12: [peachT("官网/事务所"), peachT("社交账号"), peachT("作品资料站")].map(title => `<div><span>${title}</span><b>${bar}</b></div>`).join(''), v13: bar, v14: waiting, v15: icon('unlink'), v16: waiting, v17: icon('git-compare') });
}
