/* 媒体库图标：触发键显示当前字形，点开是一块七列网格的单选面板，按「应用」才提交。
 *
 * 注册表里没有网格单选的弹出面板，用 React Aria 的 `Popover`、`Dialog`、`RadioGroup` 组合，
 * 面板外观取 BoardUI `menu-styles.ts`。取值是雪碧图里的字形名，服务端按
 * `peach.media_libraries.LIBRARY_ICONS` 校验。 */
import { t as peachT } from "../../i18n/index";
import { useRef, useState } from 'react';
import { Dialog, Heading, Popover, Radio, RadioGroup } from 'react-aria-components';
import { MEDIA_SOURCE_ICONS } from '@peach/legacy/ui';

import { Button } from '@/components/base/buttons/button';
import { MENU_POPOVER_SURFACE } from '@/components/base/dropdown/menu-styles';

import { SourceMark } from './section';

/* 一行七枚、六行排完。第一枚是「不另选」：网盘库自动用网盘标识，本地路径没有可识别的
   来源，就是默认那枚磁盘。其余按题材成组：身体与情欲、身份与装扮、场景与情境、媒介与归档。 */
export const LIBRARY_ICON_CHOICES = [
  ['', peachT("自动识别")], ['hard-drive', peachT("磁盘")], ['database', peachT("资料库")], ['heart', peachT("心动")], ['heart-hand', peachT("亲密")], ['flame', peachT("热情")], ['cherry', peachT("樱桃")],
  ['lollipop', peachT("甜心")], ['candy', peachT("糖果")], ['banana', peachT("香蕉")], ['droplets', peachT("湿润")], ['venus', peachT("女性")], ['mars', peachT("男性")], ['venus-and-mars', peachT("情侣")],
  ['gem', peachT("精选")], ['crown', peachT("女王")], ['ribbon', peachT("丝带")], ['shirt', peachT("制服")], ['graduation-cap', peachT("学生")], ['stethoscope', peachT("护士")], ['glasses', peachT("眼镜")],
  ['footprints', peachT("足迹")], ['hand', peachT("手部")], ['flower', peachT("花朵")], ['venetian-mask', peachT("角色扮演")], ['rabbit', peachT("兔女郎")], ['paw-print', peachT("兽耳")], ['dumbbell', peachT("健身")],
  ['bed-double', peachT("卧室")], ['bath', peachT("浴室")], ['key-round', peachT("私密")], ['wine', peachT("微醺")], ['cigarette', peachT("烟")], ['moon', peachT("夜色")], ['sparkles', peachT("幻想")],
  ['camera', peachT("写真")], ['video', peachT("影片")], ['film', peachT("电影")], ['image', peachT("图集")], ['gamepad-2', peachT("游戏")], ['star', peachT("收藏")], ['tags', peachT("主题")],
] as const;

/** 不另选时的字形与说法：网盘库跟着来源走（115、PikPak 的站标），本地路径没有什么可识别，就是默认磁盘。 */
export function libraryAutoChoice(kind: string): [string, string] {
  const mark = kind !== 'local' ? MEDIA_SOURCE_ICONS[kind] : '';
  return mark ? [mark, peachT("自动识别")] : ['hard-drive', peachT("默认")];
}

/** 「不另选」在单选组里的取值。存下来是空串，而空串做单选值时 React Aria 当作没有选中。 */
const AUTO = 'auto';

export function LibraryIconPicker({ value, label, kind = 'local', onChange }: {
  value: string; label: string; kind?: string; onChange(value: string): void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [autoMark, autoLabel] = libraryAutoChoice(kind);
  const nameOf = (key: string) => (key && LIBRARY_ICON_CHOICES.find(([choice]) => choice === key)?.[1]) || autoLabel;

  return (
    <>
      <Button ref={trigger} variant="secondary" className="self-start" aria-label={label} aria-haspopup="dialog"
        aria-expanded={open} onClick={() => { setDraft(value); setOpen(true); }}>
        <span data-icon-choice className="flex items-center gap-2"><SourceMark mark={value || autoMark} />{nameOf(value)}</span>
      </Button>
      <Popover triggerRef={trigger} isOpen={open} onOpenChange={setOpen} placement="bottom start" offset={4}
        className={MENU_POPOVER_SURFACE}>
        <Dialog aria-label={peachT("{{v0}}可选图标", { v0: label })} className="flex w-72 flex-col gap-3 outline-none">
          <Heading slot="title" className="px-1 text-body-medium text-text-primary">{peachT("选择媒体库图标")}</Heading>
          {/* 格子里只放图标，名字走 aria-label：带着字的话 42 个候选要排十几行。 */}
          <RadioGroup aria-label={peachT("可选图标")} value={draft || AUTO} onChange={(next) => setDraft(next === AUTO ? '' : next)}
            className="inline-grid grid-cols-7 gap-1">
            {LIBRARY_ICON_CHOICES.map(([key, name]) => (
              <Radio key={key || AUTO} value={key || AUTO} aria-label={key ? name : autoLabel}
                className="flex h-10 cursor-pointer items-center justify-center rounded-lg text-foreground-icon-secondary outline-none hover:bg-dropdown-item-hover-background focus-visible:ring-2 focus-visible:ring-border-focus-ring data-selected:bg-dropdown-item-hover-background data-selected:text-text-primary">
                <SourceMark mark={key || autoMark} />
              </Radio>
            ))}
          </RadioGroup>
          <div className="flex justify-end gap-2 border-t border-separator-border pt-2.5">
            <Button variant="secondary" onClick={() => setOpen(false)}>{peachT("取消")}</Button>
            <Button disabled={draft === value} onClick={() => { onChange(draft); setOpen(false); }}>{peachT("应用")}</Button>
          </div>
        </Dialog>
      </Popover>
    </>
  );
}
