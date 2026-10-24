import { t as peachT } from "../../i18n/index";
import { cardArtwork } from '@peach/card-art';
import { fmtDur } from '@peach/legacy/core';
import { ArtSlot } from '../components/art-slot';
import { MixQueue, MixQueueRow } from '../components/mix-queue';
import { partLabel, type QueueItem } from '../item-detail/item-detail';

/** 分卷、版次与墙内作品切换共用详情的队列行。 */
export function WallQueue({ items, activeId, kind, label, choose, close }: {
  items: readonly QueueItem[]; activeId: number; kind: string;
  label(item: QueueItem): string; choose(item: QueueItem): void; close(): void;
}) {
  return <div data-wall-queue="" id="wall-queue">
    <MixQueue kind={kind} title={kind === 'parts' ? peachT("分卷") : kind === 'editions' ? peachT("版本") : peachT("作品")} summary={peachT("{{v0}} 个视频", { v0: items.length })} onClose={close}>
      {items.map(item => <MixQueueRow key={item.id} current={item.id === activeId} data-wall-source={item.id}
        aria-label={[item.edition_label, item.part_label ? partLabel(item.part_label) : '', label(item)].filter(Boolean).join(' · ')}
        onClick={() => choose(item)} pic={<ArtSlot artwork={cardArtwork(item, 'small', true, 'cover')} />}>
        <b>{label(item)}</b><span>{[item.edition_label, item.part_label ? partLabel(item.part_label) : '', fmtDur(item.duration)].filter(Boolean).join(' · ')}</span>
      </MixQueueRow>)}
    </MixQueue>
  </div>;
}
