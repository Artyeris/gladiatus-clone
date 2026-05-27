'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  abandonDungeonRun,
  enterDungeon,
  runNextStep,
} from '@/lib/actions/dungeon/dungeon.action';
import CompactNumber from '@/components/shared/CompactNumber';

interface DungeonRow {
  id: string;
  name: string;
  parentExpedition: string;
  entryLevel: number;
  bossName: string;
  bossLevel: number;
  description: string;
  goldReward: number;
  xpReward: number;
  cleared: boolean;
}

interface PartyMember {
  slot: string;
  source: 'player' | 'mercenary';
  name: string;
  role: string;
  type: string;
  level: number;
  quality: string | null;
  maxHp: number;
  hp: number;
  power: number;
}

interface ActiveRun {
  _id: string;
  dungeonId: string;
  dungeonName: string;
  bossName?: string;
  bossLevel?: number;
  currentStep: number;
  totalSteps: number;
  party: PartyMember[];
  lastFight: any;
}

interface Props {
  characterLevel: number;
  partyAssigned: boolean;
  dungeons: DungeonRow[];
  activeRun: ActiveRun | null;
}

const ROLE_LABEL: Record<string, string> = {
  tank: 'Tank', healer: 'Healer', damage: 'Damage',
};

const DungeonDetailContent = ({
  characterLevel, partyAssigned, dungeons, activeRun,
}: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onEnter = async (id: string) => {
    setBusy(id);
    const res: any = await enterDungeon({ dungeonId: id as any });
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Entered the dungeon');
    startTransition(() => router.refresh());
  };

  const onNext = async () => {
    setBusy('next');
    const res: any = await runNextStep();
    setBusy(null);
    if (res?.error) return toast.error(res.error.message);
    if (res.runFinished) {
      if (res.cleared) {
        toast.success(
          res.drop
            ? `Cleared! Loot: ${res.drop.name}`
            : `Cleared! +${res.goldGained} gold, +${res.xpGained} XP`,
        );
      } else {
        toast.error(`Party wiped on ${res.enemyName}. Salvaged ${res.goldGained} gold.`);
      }
    } else {
      if (res.won) {
        toast.success(`Cleared ${res.enemyName}. Step ${res.step + 2}/${activeRun?.totalSteps ?? 4} next.`);
      } else {
        toast.error(`Lost the round to ${res.enemyName}. Try again.`);
      }
    }
    startTransition(() => router.refresh());
  };

  const onAbandon = async () => {
    if (!confirm('Abandon the run? Loot and progress will be lost.')) return;
    setBusy('abandon');
    await abandonDungeonRun();
    setBusy(null);
    toast('Run abandoned');
    startTransition(() => router.refresh());
  };

  if (dungeons.length === 0) {
    return (
      <div className='px-4 py-6 italic opacity-80 text-center'>
        No dungeon hidden in this region.
      </div>
    );
  }

  return (
    <div className='px-4 flex flex-col gap-3 text-brown2'>
      {!partyAssigned && (
        <div className='brown-card rounded-sm px-3 py-2 text-xs'>
          <strong>No party assigned.</strong> Open the{' '}
          <a className='underline text-red3' href='/game/overview'>Overview</a>{' '}
          and drop yourself or a mercenary into a Dungeon Party slot
          before you can enter.
        </div>
      )}

      {activeRun && (
        <ActiveRunPanel
          run={activeRun}
          busy={busy === 'next' || busy === 'abandon'}
          onNext={onNext}
          onAbandon={onAbandon}
        />
      )}

      {!activeRun && dungeons.map((d) => (
        <div key={d.id} className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
          <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 flex justify-between items-center'>
            <span>{d.name}</span>
            <span className='text-xs opacity-90'>
              {d.cleared ? 'Cleared' : `from level ${d.entryLevel}`}
            </span>
          </div>
          <div className='px-3 py-2 flex flex-col gap-1'>
            <div className='text-xs italic opacity-80'>{d.description}</div>
            <div className='text-xs grid grid-cols-2 gap-y-0.5 mt-1'>
              <span><strong>Boss:</strong> {d.bossName} (lvl {d.bossLevel})</span>
              <span><strong>Entry:</strong> level {d.entryLevel}</span>
              <span><strong>Gold:</strong> <CompactNumber value={d.goldReward} /></span>
              <span><strong>XP:</strong> <CompactNumber value={d.xpReward} /></span>
              <span className='col-span-2'><strong>Steps:</strong> 3 trash + 1 boss</span>
            </div>
            <div className='flex justify-end mt-2'>
              <button
                type='button'
                onClick={() => onEnter(d.id)}
                disabled={characterLevel < d.entryLevel || busy === d.id || !partyAssigned}
                className='general-button px-4 py-1 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50'
                title={
                  characterLevel < d.entryLevel
                    ? `Unlocks at level ${d.entryLevel}`
                    : !partyAssigned
                      ? 'Assign a dungeon party first'
                      : 'Start the dungeon run'
                }
              >
                {busy === d.id
                  ? 'Starting...'
                  : characterLevel < d.entryLevel
                    ? `Locked (lvl ${d.entryLevel})`
                    : 'Enter dungeon'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DungeonDetailContent;

function ActiveRunPanel({
  run, busy, onNext, onAbandon,
}: {
  run: ActiveRun;
  busy: boolean;
  onNext: () => void;
  onAbandon: () => void;
}) {
  const last = run.lastFight;
  const aliveCount = run.party.filter((m) => m.hp > 0).length;
  const wiped = aliveCount === 0;
  const stepLabel = `Step ${run.currentStep + 1} / ${run.totalSteps}`;
  const isBossStep = run.currentStep >= run.totalSteps - 1;

  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 flex justify-between items-center'>
        <span>Active run &middot; {run.dungeonName}</span>
        <span className='text-xs opacity-90'>{stepLabel}</span>
      </div>
      <div className='px-3 py-2 flex flex-col gap-2'>
        <div className='text-xs italic opacity-80'>
          {isBossStep
            ? `Final fight: ${run.bossName} awaits.`
            : `Trash fight ${run.currentStep + 1} of ${run.totalSteps - 1}.`}
        </div>

        <div className='flex flex-col gap-1'>
          {run.party.map((m, i) => (
            <PartyHpRow key={`${m.slot}-${i}`} m={m} />
          ))}
        </div>

        {last && (
          <div className='text-[11px] border-t-[2px] border-cream2 pt-1 mt-1'>
            <strong>{last.won ? 'Cleared' : 'Lost to'}</strong>{' '}
            {last.enemyName} &middot; took {last.damage} damage{' '}
            {last.healed > 0 && <>&middot; healers restored {last.healed}</>}
          </div>
        )}

        <div className='flex justify-end gap-2 mt-2'>
          <button
            type='button'
            onClick={onAbandon}
            disabled={busy}
            className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
          >
            Abandon
          </button>
          <button
            type='button'
            onClick={onNext}
            disabled={busy || wiped}
            className='general-button px-4 py-1 rounded-sm text-sm font-semibold hover:brightness-110 disabled:opacity-50'
            title={wiped ? 'Party wiped' : isBossStep ? 'Fight the boss' : 'Next fight'}
          >
            {busy ? 'Fighting...' : isBossStep ? 'Fight boss' : 'Next fight'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PartyHpRow({ m }: { m: PartyMember }) {
  const pct = m.maxHp > 0 ? Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100)) : 0;
  const dead = m.hp <= 0;
  return (
    <div className='flex items-center gap-2 text-[11px]'>
      <span
        className='w-[68px] shrink-0 truncate font-semibold'
        style={{ textDecoration: dead ? 'line-through' : 'none', opacity: dead ? 0.6 : 1 }}
      >
        {m.name}
      </span>
      <span className='w-[58px] shrink-0 opacity-80'>
        {ROLE_LABEL[m.role] ?? m.role}
      </span>
      <div className='flex-1 h-3 rounded-sm overflow-hidden' style={{ backgroundColor: '#3e2714' }}>
        <div
          className='h-full'
          style={{
            width: `${pct}%`,
            backgroundColor: pct > 50 ? '#3b9b3b' : pct > 25 ? '#d97706' : '#a32626',
            transition: 'width 0.3s',
          }}
        />
      </div>
      <span className='w-[80px] shrink-0 text-right tabular-nums'>
        {m.hp} / {m.maxHp}
      </span>
    </div>
  );
}
