/** 实体资料的等待态使用资料头、标签条和对应正文布局。
 *
 * 筛选条和作品抬头在这一页是同一块浮层的上下两格（`entity-filter` 岛），等待态也得是
 * 一块：这两条各自都带着玻璃材质和 22px 圆角，不套进外框就被当成两块独立浮层画出来，
 * 中间一道缝、四个角各一道弧。骨架是一段字符串，所以自己把外框和两个槽位的标记写全，
 * 几何与岛的浮层一一对齐，接管时不跳。
 */
import { t as peachT } from "./i18n/index";
export function entitySkeletonHtml(kind: string, head: string, body: string, top = '') {
  const square = kind === 'studio' || kind === 'agency';
  return peachT("<section data-skeleton=\"entity/{{v0}}\" role=\"status\" aria-label=\"正在读取资料\">\n    <span class=\"sr-only\">正在读取资料</span><div aria-hidden=\"true\"><div class=\"peach-react contents\">\n    <section class=\"entityhero\" data-entity-card><div class=\"entityprofile\" data-entity-profile><div data-entity-portrait-wrap><div class=\"entityportrait {{v1}}skeleton\" data-entity-portrait=\"{{v2}}\"></div></div>\n      <div class=\"ui-entityidentity entityskeletontext\" data-entity-identity><div class=\"entitytitle\" data-entity-title><h2 class=\"skeleton\">&nbsp;</h2></div>\n      <div class=\"alias\" data-entity-alias><span class=\"skeleton\"></span></div>\n      <div class=\"entitylinks\" data-entity-links><span class=\"skeleton\"></span></div></div></div></section>\n    <div class=\"board-filter-frame sticky top-topbar z-10 mb-5.5 flex flex-col\" data-filter-frame data-filter-glass data-glass-pane data-entity-filter-glass>\n      <section class=\"flex h-12 min-w-0 items-center overscroll-x-contain px-3 py-2 gap-1.5 overflow-visible\" data-filter-row=\"top\">{{v3}}<div data-entity-tags data-skeleton-tier=\"pill\"></div>{{v4}}</section>\n      {{v5}}</div></div>\n    <div class=\"entitysection\">{{v6}}</div></div></section>", { v0: kind, v1: square ? 'square ' : '', v2: square ? 'square' : 'round', v3: top, v4: top ? '</div>' : '', v5: head, v6: body });
}
