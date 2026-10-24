import { locale as peachLocale } from "../../i18n/index";
import { t as peachT } from "../../i18n/index";
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { RiCompassLine, RiPauseLine, RiPlayLine, RiDeleteBinLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { confirmModal } from '@peach/legacy/ui';
import { errorMessage } from '../../api';
import { cardClass } from '../components/card';
import { Note } from '../components/note';
import { queryClient } from '../query';
import { busyProps } from '../settings/use-action';
import { configureTasteBrowser, tasteKey, type BrowserSource, type TasteSource } from './taste';

export const SOURCE_TILE = 'flex min-w-0 items-center gap-3 rounded-xl bg-background-primary-default p-3';

export function BrowserSources({ browsers, sources, range, children }:
  { browsers: BrowserSource[]; sources: TasteSource[]; range: string; children?: ReactNode }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const change = useMutation({
    mutationFn: (body: Parameters<typeof configureTasteBrowser>[0]) => configureTasteBrowser(body, range),
    onSuccess: result => {
      queryClient.setQueryData(tasteKey(range), result.dashboard);
      setAdding(false); setName(''); setPath('');
    },
  });
  return <section className={`${cardClass()} flex flex-col gap-4`} aria-label={peachT("数据源")}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-title-2-medium text-text-primary">{peachT("数据源")}</h3>
      <Button variant="secondary" size="small" onClick={() => setAdding(true)} disabled={adding}>{peachT("添加浏览器")}</Button>
    </div>
    {change.error ? <Note tone="error">{errorMessage(change.error)}</Note> : null}
    {adding ? <form className="flex flex-col gap-3" onSubmit={event => {
      event.preventDefault(); if (!change.isPending) change.mutate({ operation: 'add', name, path });
    }}>
      <Input label={peachT("浏览器名称")} value={name} onChange={setName} maxLength={80} isRequired isDisabled={change.isPending} />
      <Input label={peachT("资料目录或历史文件")} value={path} onChange={setPath} maxLength={1024} isRequired isDisabled={change.isPending}
        hint={peachT("请选择运行 Peach 的电脑上的浏览器资料。")} />
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" disabled={!name.trim() || !path.trim()} {...busyProps(change.isPending)}>{peachT("添加")}</Button>
        <Button variant="ghost" disabled={change.isPending} onClick={() => { setAdding(false); change.reset() }}>{peachT("取消")}</Button>
      </div>
    </form> : null}
    <div className="inline-grid w-full min-w-0 gap-2 sm:grid-cols-2">
      {children}
      {browsers.map(browser => {
        const records = sources.filter(source => browser.source_keys?.includes(source.source_key));
        const visits = records.reduce((total, source) => total + (source.visits || 0), 0);
        const bookmarks = records.reduce((total, source) => total + (source.bookmarks || 0), 0);
        return <div key={browser.id} data-taste-source="browser" className={SOURCE_TILE}>
        <span className="inline-grid size-8 shrink-0 place-items-center rounded-lg text-text-secondary">
          <RiCompassLine aria-hidden className="size-4" />
        </span>
        <div className="flex min-w-0 grow flex-col gap-0.5">
          <b className="text-body-2-medium break-words text-text-primary">{browser.name}</b>
          <span className="break-all text-caption-1-regular text-text-secondary">{browser.path}</span>
          <span className="text-caption-1-regular text-text-secondary">{!browser.enabled ? peachT("已停止读取") : !browser.available ? peachT("资料目录不可用") : peachT("历史与书签 · {{v0}} 个资料", { v0: browser.profiles })}</span>
          {records.length ? <span className="text-caption-1-regular text-text-secondary">{visits.toLocaleString(peachLocale)}{" " + peachT("条历史 ·") + " "}{bookmarks.toLocaleString(peachLocale)}{" " + peachT("枚书签")}</span> : null}
        </div>
        <span className="flex shrink-0 gap-1">
        <Button variant="secondary" size="small" {...busyProps(change.isPending)} iconOnly
          leadingIcon={browser.enabled ? RiPauseLine : RiPlayLine}
          aria-label={`${browser.enabled ? peachT("停止读取") : peachT("启用")} ${browser.name}`} onClick={() => {
            if (!browser.enabled) change.mutate({ operation: 'enable', id: browser.id });
            else void confirmModal({ title: peachT("停止读取 {{v0}}", { v0: browser.name }), body: peachT("已导入的历史与书签仍用于口味分析。"), confirmLabel: peachT("停止读取"),
              onConfirm: () => change.mutateAsync({ operation: 'disable', id: browser.id }) });
          }} />
        <Button variant="secondary" size="small" iconOnly leadingIcon={RiDeleteBinLine} {...busyProps(change.isPending)}
          aria-label={peachT("删除 {{v0}}", { v0: browser.name })} onClick={() => {
            void confirmModal({ title: peachT("删除 {{v0}}", { v0: browser.name }), body: peachT("移除该浏览器的读取配置和已导入历史、书签，浏览器原文件保留。可以通过添加浏览器重新接入。"),
              confirmLabel: peachT("删除浏览器来源"), onConfirm: () => change.mutateAsync({ operation: 'delete_browser', id: browser.id }) });
          }} />
        </span>
      </div>})}
    </div>
  </section>;
}
