'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { CATEGORY_ICON, CATEGORY_LABEL, QuestCategory } from '@/constants/quests';
import {
  abandonQuest,
  acceptRandomQuest,
  claimQuest,
} from '@/lib/actions/quest/quest.action';
import type { QuestView } from '@/lib/types/quest';

interface Props {
  quests: QuestView[];
  max: number;
  hasMoreToAccept: boolean;
  nextQuestReadyAt: string | null;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const CATEGORY_ORDER: QuestCategory[] = ['arena', 'expedition', 'work', 'items'];

const QuestsContent = ({ quests, max, hasMoreToAccept, nextQuestReadyAt }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Live countdown until a new quest can be taken. Ticks every second
  // while the cooldown is active; when it hits zero we refresh so the
  // "New quest" button re-enables on the next render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!nextQuestReadyAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [nextQuestReadyAt]);

  const cooldownMs = nextQuestReadyAt
    ? Math.max(0, new Date(nextQuestReadyAt).getTime() - now)
    : 0;
  const cooldownActive = cooldownMs > 0;

  const sorted = [...quests].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category as QuestCategory);
    const bi = CATEGORY_ORDER.indexOf(b.category as QuestCategory);
    if (ai !== bi) return ai - bi;
    return a.title.localeCompare(b.title);
  });

  const onAccept = async () => {
    setBusy(true);
    const res = await acceptRandomQuest();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Accepted: ${res.accepted}`);
    router.refresh();
  };

  const onClaim = async (id: string) => {
    setBusy(true);
    const res = await claimQuest({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Reward: +${res.gold} gold, +${res.exp} XP`);
    router.refresh();
  };

  const onAbandon = async (id: string, title: string) => {
    if (!confirm(`Abandon "${title}"?`)) return;
    setBusy(true);
    const res = await abandonQuest({ id });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Quest abandoned');
    router.refresh();
  };

  const canAccept = quests.length < max && hasMoreToAccept && !cooldownActive;

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm flex justify-between'>
        <span>Quests</span>
        <span className='text-xs opacity-90'>Accepted: {quests.length} / {max}</span>
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        {sorted.length === 0 && (
          <div className='px-3 py-4 italic opacity-80'>
            No quests accepted. Pick one up below to start earning extra rewards.
          </div>
        )}
        {sorted.map((quest, idx) => (
          <QuestRow
            key={quest._id}
            quest={quest}
            last={idx === sorted.length - 1}
            busy={busy}
            onClaim={() => onClaim(quest._id)}
            onAbandon={() => onAbandon(quest._id, quest.title)}
          />
        ))}
      </div>

      <div className='flex flex-col items-center gap-1'>
        <button
          type='button'
          onClick={onAccept}
          disabled={busy || !canAccept}
          className='general-button px-4 py-2 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50'
        >
          {cooldownActive ? `New quest in ${formatCountdown(cooldownMs)}` : 'New quest'}
        </button>
        {!canAccept && !cooldownActive && (
          <span className='text-xs opacity-70 italic'>
            {quests.length >= max
              ? `You hold the maximum of ${max} quests -- claim or abandon one first.`
              : 'No fresh quests available right now.'}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuestsContent;

function QuestRow({
  quest, last, busy, onClaim, onAbandon,
}: {
  quest: QuestView;
  last: boolean;
  busy: boolean;
  onClaim: () => void;
  onAbandon: () => void;
}) {
  const pct = quest.target > 0
    ? Math.min(100, Math.round((quest.progress / quest.target) * 100))
    : 0;
  const icon = CATEGORY_ICON[quest.category];
  const categoryLabel = CATEGORY_LABEL[quest.category];

  return (
    <div className={`flex items-center gap-3 px-3 py-2 ${!last && 'border-b-[2px] border-cream2'}`}>
      <div className='w-9 h-9 flex items-center justify-center rounded-sm bg-cream2 text-xl shrink-0'>
        {icon}
      </div>
      <div className='flex flex-col flex-1 min-w-0'>
        <div className='flex items-baseline gap-2'>
          <span className='font-semibold truncate'>{quest.title}</span>
          <span className='text-[10px] opacity-60 uppercase tracking-wide shrink-0'>{categoryLabel}</span>
        </div>
        <div className='flex items-center gap-2 text-xs opacity-90'>
          <div className='flex-1 h-2 rounded-sm overflow-hidden' style={{ background: '#3e2714' }}>
            <div
              className='h-full'
              style={{
                width: `${pct}%`,
                background: quest.ready ? '#5c8a3a' : '#a07238',
              }}
            />
          </div>
          <span className='font-semibold shrink-0'>{quest.progress} / {quest.target}</span>
        </div>
        <div className='text-[11px] opacity-80 flex items-center gap-2'>
          <span>Reward:</span>
          <span className='flex items-center gap-1'>
            {quest.rewardGold}
            <Image src='/images/crowns.png' width={10} height={10} alt='' style={{ width: 'auto', height: 'auto' }} />
          </span>
          <span>+{quest.rewardExp} XP</span>
        </div>
      </div>
      {quest.ready ? (
        <button
          type='button'
          onClick={onClaim}
          disabled={busy}
          className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Claim
        </button>
      ) : (
        <button
          type='button'
          onClick={onAbandon}
          disabled={busy}
          className='general-button px-2 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          aria-label='Abandon quest'
          title='Abandon quest'
        >
          X
        </button>
      )}
    </div>
  );
}
