import { locale as peachLocale } from "../../i18n/index";
import { t as peachT } from "../../i18n/index";
import { useState } from 'react';
import { RiFileListLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { LinkButton } from '@/components/base/buttons/link-button';
import { fmtDur, fmtSize, LOC } from '@peach/legacy/core';
import { DataTable, type DataColumn } from '../components/data-table';
import { EmptyState } from '../components/empty-state';
import { Note } from '../components/note';
import { Disclosure, Stack } from '../settings/section';
import { busyProps, useAction } from '../settings/use-action';
import type { LibraryGroup, LibraryItem } from './diagnostics';

const identity = (item: LibraryItem) => item.title || item.name || item.code || peachT("作品 #{{v0}}", { v0: item.id });
const listText = (items: LibraryItem[]) => [
  [peachT("作品"), peachT("番号"), peachT("文件名"), peachT("媒体库"), peachT("路径"), peachT("时长（秒）"), peachT("大小（字节）")],
  ...items.map(item => [identity(item), item.code ?? '', item.name, LOC[item.location] || item.location,
    item.path, item.duration ?? '', item.size ?? '']),
].map(row => row.map(value => String(value ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');

export function HealthList({ group, openItem, receipt }: {
  group: LibraryGroup; openItem(id: number): void; receipt(message: string): void;
}) {
  const action = useAction();
  const [selected, setSelected] = useState<string[]>([]);
  const copy = (items: LibraryItem[]) => void action.run('copy',
    () => navigator.clipboard.writeText(listText(items)), () => receipt(peachT("已复制清单")));
  const columns: DataColumn<LibraryItem>[] = [
    { id: 'title', label: peachT("作品"), value: identity, render: item => <span className="flex min-w-48 max-w-72 flex-col gap-1">
      <LinkButton variant="primary" className="justify-start whitespace-normal text-left"
        onClick={() => openItem(item.id)}>{identity(item)}</LinkButton>
      {item.name && item.name !== identity(item)
        ? <span data-middle-truncate title={item.name} className="block min-w-0 text-caption-1-regular text-text-secondary">{item.name}</span> : null}
    </span> },
    { id: 'code', label: peachT("番号"), value: item => item.code || '',
      render: item => <span className="whitespace-nowrap">{item.code || peachT("未识别")}</span> },
    { id: 'location', label: peachT("媒体库"), value: item => LOC[item.location] || item.location,
      render: item => LOC[item.location] || item.location || peachT("未取得") },
    { id: 'path', label: peachT("文件路径"), value: item => item.path,
      render: item => <span data-middle-truncate title={item.path}
        className="block w-64 text-body-2-regular text-text-secondary">{item.path || peachT("未取得")}</span> },
    { id: 'duration', label: peachT("时长"), value: item => item.duration ?? 0,
      render: item => item.duration && item.duration > 0 ? fmtDur(item.duration) : peachT("未取得") },
    { id: 'size', label: peachT("大小"), value: item => item.size ?? 0,
      render: item => item.size !== null ? fmtSize(item.size) : peachT("未取得") },
  ];
  return <Disclosure summary={`${group.label} · ${group.count === null ? peachT("未取得") : peachT("{{v0}} 项", { v0: group.count.toLocaleString(peachLocale) })}`}>
    {group.count === null ? <Note tone="neutral">{peachT("清单未取得，请重新检查。")}</Note> : !group.items.length
      ? <EmptyState icon={RiFileListLine} title={peachT("清单为空")} shell="plain">{peachT("没有需要处理的作品。")}</EmptyState>
      : <Stack>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {group.truncated ? <span className="text-body-2-regular text-text-secondary">{peachT("已载入") + " "}{group.items.length.toLocaleString(peachLocale)} / {group.count.toLocaleString(peachLocale)}{" " + peachT("项")}</span> : null}
          <Button size="small" variant="secondary" {...busyProps(action.busy === 'copy')}
            onClick={() => copy(group.items)}>{peachT("复制当前清单")}</Button>
        </div>
        {action.error ? <Note tone="error">{action.error}</Note> : null}
        <DataTable label={group.label} title={peachT("作品清单")} unit={peachT("部作品")} panel={false}
          items={group.items} columns={columns} rowId={item => String(item.id)} rowLabel={identity}
          selected={selected} onSelected={setSelected}
          actions={items => <Button size="small" variant="secondary" {...busyProps(action.busy === 'copy')}
            onClick={() => copy(items)}>{peachT("复制所选")}</Button>} />
      </Stack>}
  </Disclosure>;
}
