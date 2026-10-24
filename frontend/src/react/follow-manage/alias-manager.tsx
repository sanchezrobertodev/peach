/* 创作者别名：同一个人在几个站上用几个名字，合并之后按一位创作者归组。
 *
 * 待合并是带依据的候选，合并永远由人点：服务端不自行升级，页面也不替他勾。 */
import { t as peachT } from "../../i18n/index";
import { locale } from '../../i18n';
import { useMemo, useRef, useState } from 'react';
import { RiCloseLine, RiUserLine } from '@remixicon/react';
import { useMutation } from '@tanstack/react-query';
import {
  createColumnHelper, createPaginatedRowModel, createSortedRowModel, flexRender,
  rowPaginationFeature, rowSelectionFeature, rowSortingFeature, tableFeatures, useTable,
  type RowSelectionState, type SortingState,
} from '@tanstack/react-table';
import { confirmModal } from '@peach/legacy/ui';

import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import {
  Table, TableBody, TableCell, TableColumn, TableHeader, TableRow,
} from '@/components/base/table/table';

import { errorMessage } from '../../api';
import { cardClass } from '../components/card';
import { DataTableFrame } from '../components/data-table-frame';
import { DataTableFooter, DataTableSort } from '../components/table-controls';
import { SelectionDock } from '../components/selection-dock';
import { useTableSelection } from '../components/use-table-selection';
import { ChevronSortDown } from '@/components/foundations/icons/chevrons';
import { EmptyState } from '../components/empty-state';
import { ErrorText, FieldLabel } from '../settings/section';
import { busyProps } from '../settings/use-action';
import {
  addAlias, reloadFollowManage, removeAlias,
  type AliasGroup, type AliasSuggestion, type FollowSource,
} from './follow-manage';
import { AuthorAvatar } from './source-view';

const REMOVE_BODY = (alias: string) => peachT("将移除别名「{{v0}}」，对应来源恢复为独立创作者组。", { v0: alias });
const suggestionFeatures = tableFeatures({ rowSelectionFeature, rowSortingFeature, rowPaginationFeature,
  sortedRowModel: createSortedRowModel(), paginatedRowModel: createPaginatedRowModel() });
const savedFeatures = suggestionFeatures;

export interface AliasManagerProps {
  groups: AliasGroup[];
  suggestions: AliasSuggestion[];
  sources?: FollowSource[];
  readOnly: boolean;
  toast(message: string): void;
}

/** 一条待合并的身份：一个别名只可能归进一个规范名，所以用别名本身当键。 */
const suggestionKey = (item: AliasSuggestion) => item.alias;

function authorSources(sources: FollowSource[], name: string, canonicalKey?: string) {
  /* 建过档的作者键是 `entity:<id>`，别名表上记的仍是名字键：按名字键找不到就按名字认。 */
  const expected = canonicalKey ? `name:${canonicalKey}` : '';
  const anchor = (expected && sources.find((source) => source.author_key === expected))
    || sources.find((source) => source.author_name === name || source.entity_name === name);
  return anchor ? sources.filter((source) => source.author_key === anchor.author_key) : [];
}

function AuthorIdentity({ sources, name, canonicalKey }: {
  sources: FollowSource[]; name: string; canonicalKey?: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <AuthorAvatar group={authorSources(sources, name, canonicalKey)} name={name} />
      <b className="text-body-medium">{name}</b>
    </span>
  );
}

export function AliasManager({ groups, suggestions, sources = [], readOnly, toast }: AliasManagerProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [savedSelection, setSavedSelection] = useState<RowSelectionState>({});
  const activateSuggestion = useTableSelection(() => setRowSelection({}));
  const activateSaved = useTableSelection(() => setSavedSelection({}));
  const [sorting, setSorting] = useState<SortingState>([]);
  const [savedSorting, setSavedSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [savedPagination, setSavedPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const suggestionPage = { ...pagination, pageIndex: Math.min(pagination.pageIndex, Math.max(0, Math.ceil(suggestions.length / pagination.pageSize) - 1)) };
  const savedPage = { ...savedPagination, pageIndex: Math.min(savedPagination.pageIndex, Math.max(0, Math.ceil(groups.length / savedPagination.pageSize) - 1)) };
  const [problem, setProblem] = useState('');
  const [canonical, setCanonical] = useState('');
  const [alias, setAlias] = useState('');

  /* 合并按顺序一条一条发：一次失败要报出「还有几组没合」，而并发发出去的话，说不清
     停在了哪里。 */
  const merge = useMutation({
    mutationFn: async (items: AliasSuggestion[]) => {
      let done = 0;
      for (const item of items) {
        try {
          await addAlias(item.canonical, item.alias);
        } catch (cause) {
          /* 半路断了要说清停在哪儿：已经合上的那几组先落回列表里去掉，再点一次只发剩下的。 */
          if (done) void reloadFollowManage();
          throw new Error(peachT("{{v0}}（还有 {{v1}} 组没有合并）", { v0: errorMessage(cause), v1: items.length - done }));
        }
        done += 1;
      }
      return { done, items };
    },
    onSuccess: (result) => {
      setProblem('');
      setRowSelection({});
      void reloadFollowManage();
      toast(peachT("已合并 {{v0}} 组创作者别名", { v0: result.done }));
    },
    onError: (cause) => setProblem(errorMessage(cause)),
  });

  const save = useMutation({
    mutationFn: (pair: { canonical: string; alias: string }) => addAlias(pair.canonical, pair.alias),
    onSuccess: () => {
      setProblem('');
      setCanonical('');
      setAlias('');
      void reloadFollowManage();
      toast(peachT("已保存创作者别名"));
    },
    onError: (cause) => setProblem(errorMessage(cause)),
  });

  const drop = useMutation({
    mutationFn: async (names: string | string[]) => {
      const pending = typeof names === 'string' ? [names] : names;
      let done = 0;
      try {
        for (const name of pending) { await removeAlias(name); done += 1; }
      } catch (cause) {
        throw new Error(peachT("{{v0}}（已移除 {{v1}} 个别名，还有 {{v2}} 个未移除）", { v0: errorMessage(cause), v1: done, v2: pending.length - done }));
      } finally { void reloadFollowManage(); }
    },
    onSuccess: () => { setProblem(''); setSavedSelection({}); toast(peachT("已移除创作者别名")) },
    onError: (cause) => setProblem(errorMessage(cause)),
  });

  const mergeSome = (items: AliasSuggestion[], all: boolean) => {
    if (!items.length) return;
    void confirmModal({
      title: all ? peachT("合并全部创作者别名") : peachT("合并所选创作者别名"),
      body: peachT("将合并以下 {{v0}} 组创作者：{{v1}}。", { v0: items.length, v1: items.map(
        (item) => peachT("「{{v0}}」归入「{{v1}}」", { v0: item.alias, v1: item.canonical })).join('；') }),
      confirmLabel: all ? peachT("合并全部别名") : peachT("合并所选别名"),
      onConfirm: () => merge.mutateAsync(items),
    });
  };

  const removeSome = (name: string) => void confirmModal({
    title: peachT("移除创作者别名"), body: REMOVE_BODY(name),
    confirmLabel: peachT("移除创作者别名"),
    onConfirm: () => drop.mutateAsync(name),
  });
  const handlers = useRef({ sources, readOnly, merging: merge.isPending,
    removing: drop.isPending, merge: mergeSome, remove: removeSome });
  handlers.current = { sources, readOnly, merging: merge.isPending,
    removing: drop.isPending, merge: mergeSome, remove: removeSome };

  const suggestionColumns = useMemo(() => {
    const column = createColumnHelper<typeof suggestionFeatures, AliasSuggestion>();
    return column.columns([
      column.display({
        id: 'select',
        header: (context) => (
          <Checkbox slot={null} isSelected={context.table.getIsAllRowsSelected()}
            isIndeterminate={context.table.getSelectedRowModel().rows.length > 0 && !context.table.getIsAllRowsSelected()}
            aria-label={peachT("全选待合并别名")}
            onChange={(on) => context.table.toggleAllRowsSelected(on)} />
        ),
        cell: (context) => (
          <Checkbox slot={null} isSelected={context.row.getIsSelected()}
            aria-label={peachT("选择别名 {{v0}}，归入 {{v1}}", { v0: context.row.original.alias, v1: context.row.original.canonical })}
            onChange={(on) => context.row.toggleSelected(on)} />
        ),
      }),
      column.accessor('canonical', {
        header: peachT("规范创作者"),
        cell: (context) => <AuthorIdentity sources={handlers.current.sources} name={context.getValue()} />,
      }),
      column.accessor('alias', { header: peachT("平台别名"), cell: (context) => context.getValue() }),
      column.accessor('evidence', {
        header: peachT("依据"),
        cell: (context) => <span className="text-body-2-regular text-text-secondary">{context.getValue()}</span>,
      }),
      column.display({
        id: 'actions', header: peachT("操作"),
        cell: (context) => (
          <Button variant="secondary" size="small" disabled={handlers.current.readOnly}
            {...busyProps(handlers.current.merging)}
            onClick={() => handlers.current.merge([context.row.original], false)}>{peachT("合并")}</Button>
        ),
      }),
    ]);
  }, []);
  const savedColumns = useMemo(() => {
    const column = createColumnHelper<typeof savedFeatures, AliasGroup>();
    return column.columns([
      column.display({ id: 'select', header: ({ table }) => (
        <Checkbox slot={null} aria-label={peachT("全选已保存别名")} isSelected={table.getIsAllRowsSelected()}
          isIndeterminate={table.getIsSomeRowsSelected()} onChange={(on) => table.toggleAllRowsSelected(on)} />
      ), cell: ({ row }) => (
        <Checkbox slot={null} aria-label={peachT("选择已保存别名 {{v0}}", { v0: row.original.canonical_name })}
          isSelected={row.getIsSelected()} onChange={(on) => row.toggleSelected(on)} />
      ) }),
      column.accessor('canonical_name', {
        id: 'canonical', header: peachT("规范创作者"),
        cell: (context) => (
          <AuthorIdentity sources={handlers.current.sources} name={context.getValue()}
            canonicalKey={context.row.original.canonical_key} />
        ),
      }),
      column.accessor('aliases', {
        header: peachT("平台别名"),
        sortFn: (a, b) => a.original.aliases.map((item) => item.name).join(' ').localeCompare(b.original.aliases.map((item) => item.name).join(' '), locale),
        cell: (context) => (
          <span className="flex flex-wrap items-center gap-1.5">
            {context.getValue().map((item) => (
              <span key={item.key}
                className="inline-flex items-center gap-1 rounded-md bg-background-secondary-default px-1.5 py-1 text-caption-1-medium text-text-secondary">
                {item.name}
                <Button variant="ghost" size="xs" iconOnly leadingIcon={RiCloseLine}
                  aria-label={peachT("移除别名 {{v0}}", { v0: item.name })} disabled={handlers.current.readOnly}
                  {...busyProps(handlers.current.removing)}
                  onClick={() => handlers.current.remove(item.name)} />
              </span>
            ))}
          </span>
        ),
      }),
    ]);
  }, []);
  const suggestionTable = useTable({
    features: suggestionFeatures,
    data: suggestions,
    columns: suggestionColumns,
    getRowId: suggestionKey,
    state: { rowSelection, sorting, pagination: suggestionPage },
    onRowSelectionChange: (next) => { activateSuggestion(); setRowSelection(next); },
    onSortingChange: (next) => { setSorting(next); setPagination((now) => ({ ...now, pageIndex: 0 })); },
    onPaginationChange: setPagination,
    enableRowSelection: true,
  });
  const savedTable = useTable({
    features: savedFeatures,
    data: groups,
    columns: savedColumns,
    getRowId: (group) => group.canonical_key,
    state: { rowSelection: savedSelection, sorting: savedSorting, pagination: savedPage },
    onRowSelectionChange: (next) => { activateSaved(); setSavedSelection(next); }, enableRowSelection: true,
    onSortingChange: (next) => { setSavedSorting(next); setSavedPagination((now) => ({ ...now, pageIndex: 0 })); },
    onPaginationChange: setSavedPagination,
  });
  const chosen = suggestionTable.getSelectedRowModel().rows.map((row) => row.original);
  const savedNames = savedTable.getSelectedRowModel().rows.flatMap((row) => row.original.aliases.map((item) => item.name));
  const busy = busyProps(merge.isPending);

  return (
    <div className={cardClass({ padding: 'none', className: 'flex flex-col gap-4 px-6 py-5 max-sm:px-4' })}>
      <h3 className="text-title-2-medium text-text-primary">{peachT("创作者别名")}</h3>

      <div className="flex flex-col gap-2">
        <FieldLabel>{peachT("手动添加别名")}</FieldLabel>
        <div className="flex flex-wrap items-end gap-2">
          <Input aria-label={peachT("规范创作者名")} placeholder={peachT("规范创作者名")} value={canonical}
            onChange={setCanonical} isDisabled={readOnly} className="w-56" />
          <Input aria-label={peachT("平台别名")} placeholder={peachT("平台别名")} value={alias}
            onChange={setAlias} isDisabled={readOnly} className="w-56" />
          <Button variant="primary" disabled={readOnly || !canonical.trim() || !alias.trim()}
            {...busyProps(save.isPending)}
            onClick={() => save.mutate({ canonical: canonical.trim(), alias: alias.trim() })}>{peachT("保存别名")}</Button>
        </div>
      </div>

      {problem ? <ErrorText>{problem}</ErrorText> : null}

      {suggestions.length ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <FieldLabel>{peachT("待合并")}</FieldLabel>
            <span className="mr-auto text-body-2-regular text-text-secondary">
              {peachT("{{v0}} 组", { v0: suggestions.length })}
            </span>
            <Button variant="primary" size="small" disabled={readOnly} {...busy}
              onClick={() => mergeSome(suggestions, true)}>{peachT("全部合并（{{v0}}）", { v0: suggestions.length })}</Button>
            <DataTableSort label={peachT("待合并创作者别名")} sorting={sorting}
              options={[{ id: 'canonical', label: peachT("规范创作者") }, { id: 'alias', label: peachT("平台别名") }, { id: 'evidence', label: peachT("依据") }]}
              onChange={(next) => { setSorting(next); setPagination((now) => ({ ...now, pageIndex: 0 })); }} />
          </div>
          <SelectionDock label={peachT("待合并别名批量操作")} visible={chosen.length > 0} count={peachT("已选 {{v0}} 组", { v0: chosen.length })}>
            <Button variant="secondary" size="small" disabled={readOnly} {...busy}
              onClick={() => mergeSome(chosen, false)}>{peachT("合并所选（{{v0}}）", { v0: chosen.length })}</Button>
            <Button variant="ghost" size="small" onClick={() => setRowSelection({})}>{peachT("取消选择")}</Button>
          </SelectionDock>
          <DataTableFrame follow>
            <Table aria-label={peachT("待合并创作者别名")} size="sm"
              sortDescriptor={sorting[0] ? { column: sorting[0].id, direction: sorting[0].desc ? 'descending' : 'ascending' } : undefined}
              onSortChange={(sort) => suggestionTable.getColumn(String(sort.column))?.toggleSorting(sort.direction === 'descending')}>
            <TableHeader>
              {suggestionTable.getHeaderGroups()[0]!.headers.map((header) => (
                <TableColumn key={header.id} id={header.id} isRowHeader={header.column.id === 'alias'} allowsSorting={header.column.getCanSort()}>
                  {({ sortDirection }) => <span className="flex items-center gap-0.5">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() ? <span data-sort-indicator data-direction={sortDirection || undefined}><ChevronSortDown /></span> : null}
                  </span>}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {suggestionTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id} id={row.id} data-board-selected={row.getIsSelected() || undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </DataTableFrame>
          <DataTableFooter label={peachT("待合并创作者别名")} unit={peachT("组")} total={suggestions.length} pagination={suggestionPage} onChange={setPagination} />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <FieldLabel>{peachT("已保存别名")}</FieldLabel>
          <span className="mr-auto text-body-2-regular text-text-secondary">{peachT("{{v0}} 组", { v0: groups.length })}</span>
          <DataTableSort label={peachT("已保存创作者别名")} sorting={savedSorting}
            options={[{ id: 'canonical', label: peachT("规范创作者") }, { id: 'aliases', label: peachT("平台别名") }]}
            onChange={(next) => { setSavedSorting(next); setSavedPagination((now) => ({ ...now, pageIndex: 0 })); }} />
        </div>
        <SelectionDock label={peachT("已保存别名批量操作")} visible={savedNames.length > 0} count={peachT("已选 {{v0}} 个别名", { v0: savedNames.length })}>
          <Button variant="secondary" size="small" disabled={readOnly} {...busyProps(drop.isPending)}
            onClick={() => void confirmModal({ title: peachT("移除所选创作者别名"),
              body: peachT("将移除以下 {{v0}} 个别名，对应来源恢复为独立创作者组。", { v0: savedNames.length }),
              items: savedNames,
              confirmLabel: peachT("移除所选别名"), onConfirm: () => drop.mutateAsync(savedNames) })}>
            {peachT("移除所选别名（{{v0}}）", { v0: savedNames.length })}
          </Button>
          <Button variant="ghost" size="small" onClick={() => setSavedSelection({})}>{peachT("取消选择")}</Button>
        </SelectionDock>
        {groups.length ? (
          <>
          <DataTableFrame follow>
            <Table aria-label={peachT("已保存创作者别名")} size="sm"
              sortDescriptor={savedSorting[0] ? { column: savedSorting[0].id, direction: savedSorting[0].desc ? 'descending' : 'ascending' } : undefined}
              onSortChange={(sort) => savedTable.getColumn(String(sort.column))?.toggleSorting(sort.direction === 'descending')}>
            <TableHeader>
              {savedTable.getHeaderGroups()[0]!.headers.map((header) => (
                <TableColumn key={header.id} id={header.id} isRowHeader={header.column.id === 'canonical'} allowsSorting={header.column.getCanSort()}>
                  {({ sortDirection }) => <span className="flex items-center gap-0.5">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() ? <span data-sort-indicator data-direction={sortDirection || undefined}><ChevronSortDown /></span> : null}
                  </span>}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {savedTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id} id={row.id} data-board-selected={row.getIsSelected() || undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </DataTableFrame>
          <DataTableFooter label={peachT("已保存创作者别名")} unit={peachT("组")} total={groups.length} pagination={savedPage} onChange={setSavedPagination} />
          </>
        ) : (
          <EmptyState shell="plain" icon={RiUserLine} title={peachT("还没有保存创作者别名")}>{peachT("填写规范创作者名和平台别名以添加。")}</EmptyState>
        )}
      </div>
    </div>
  );
}
