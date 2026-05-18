'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { WORK_JOBS, WorkJob, findJob } from '@/constants/work';
import {
  cancelWorkAction,
  claimWorkAction,
  startWorkAction,
} from '@/lib/actions/character/work.action';
import {
  jobGoldPerHour,
  realDurationMinutes,
} from '@/lib/utils/work';

interface Props {
  character: CharacterInterface;
}

const WorkContent = ({ character }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('stable_boy');
  const [hours, setHours] = useState<number>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selected = useMemo(() => findJob(selectedId), [selectedId]);
  const level = character.level ?? 1;

  const work = (character as any).currentWork as null | {
    jobId: string;
    hours: number;
    startedAt: string | Date;
    endsAt: string | Date;
  };

  // Tick the countdown so the "ready in" label refreshes.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!work) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [work]);

  const secondsLeft = work
    ? Math.max(0, Math.floor((new Date(work.endsAt).getTime() - now) / 1000))
    : 0;
  const ready = !!work && secondsLeft <= 0;

  const onStart = async () => {
    if (!selected) return;
    if (hours < selected.minHours || hours > selected.maxHours) {
      toast.error(`Hours must be ${selected.minHours}-${selected.maxHours}`);
      return;
    }
    setBusy(true);
    const res = await startWorkAction({ jobId: selected.id, hours });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Shift started');
    router.refresh();
  };

  const onClaim = async () => {
    setBusy(true);
    const res = await claimWorkAction();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Earned ${res.reward} gold`);
    router.refresh();
  };

  const onCancel = async () => {
    setBusy(true);
    const res = await cancelWorkAction();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Shift cancelled');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <Section title='Description'>
        <div className='flex gap-3 px-3 py-2 text-sm'>
          <Image
            src='/images/work.webp'
            alt='work foreman'
            width={170}
            height={170}
            className='rounded-sm shrink-0 object-cover'
            style={{ width: '170px', height: '170px' }}
          />
          <div className='flex flex-col gap-1'>
            <p>
              Magistrates, traders and foremen are always looking for an
              extra pair of hands. Pick a job, choose how long you&apos;ll
              work, and come back to collect your wages.
            </p>
            <p className='text-xs italic'>
              Server runs at 5x speed: every game-hour ends in 12 real minutes.
            </p>
            <div className='font-semibold mt-1'>
              Your balance: {character.crowns}
            </div>
          </div>
        </div>
      </Section>

      {work && (
        <Section title='Current shift'>
          <CurrentShift
            work={work}
            secondsLeft={secondsLeft}
            ready={ready}
            busy={busy}
            level={level}
            onClaim={onClaim}
            onCancel={onCancel}
          />
        </Section>
      )}

      <Section title='Jobs'>
        <div className='grid' style={{ gridTemplateColumns: '1fr 130px 110px 1fr 90px' }}>
          <HeaderCell>Job</HeaderCell>
          <HeaderCell align='right'>Wage / hour</HeaderCell>
          <HeaderCell align='center'>Hours</HeaderCell>
          <HeaderCell>Possible rewards</HeaderCell>
          <HeaderCell align='right'>Required</HeaderCell>

          {WORK_JOBS.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              level={level}
              selected={selectedId === job.id}
              hovered={hoveredId === job.id}
              onSelect={() => {
                setSelectedId(job.id);
                setHours(job.minHours);
              }}
              onHover={(over) => setHoveredId(over ? job.id : null)}
            />
          ))}
        </div>

        {selected && !work && (
          <StartShiftFooter
            job={selected}
            hours={hours}
            setHours={setHours}
            level={level}
            busy={busy}
            onStart={onStart}
          />
        )}
      </Section>
    </div>
  );
};

export default WorkContent;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}

function HeaderCell({
  children, align = 'left',
}: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <div
      className='font-semibold text-xs px-2 py-1 border-b-[2px] border-cream2 bg-brown2/10'
      style={{ textAlign: align }}
    >
      {children}
    </div>
  );
}

function JobRow({
  job, level, selected, hovered, onSelect, onHover,
}: {
  job: WorkJob;
  level: number;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (over: boolean) => void;
}) {
  const wage = jobGoldPerHour(level, job);
  // Row-wide highlight: a single hover/selection state is shared by
  // every cell in the row so moving the cursor between columns no
  // longer makes individual cells flash on their own.
  const bg = selected
    ? 'rgba(151, 67, 66, 0.30)'
    : hovered
      ? 'rgba(176, 138, 89, 0.35)'
      : 'transparent';
  const cellClasses = `px-2 py-2 text-sm border-b-[2px] border-cream2 cursor-pointer ${
    selected ? 'font-semibold' : ''
  }`;
  const rowProps = {
    style: { background: bg },
    onMouseEnter: () => onHover(true),
    onMouseLeave: () => onHover(false),
    onClick: onSelect,
  };

  return (
    <>
      <div className={cellClasses} {...rowProps}>{job.name}</div>
      <div className={cellClasses} style={{ ...rowProps.style, textAlign: 'right' }}
        onMouseEnter={rowProps.onMouseEnter} onMouseLeave={rowProps.onMouseLeave} onClick={rowProps.onClick}>
        <span className='inline-flex items-center gap-1'>
          {wage}
          <Image src='/images/crowns.png' width={12} height={12} alt='' />
        </span>
      </div>
      <div className={cellClasses} style={{ ...rowProps.style, textAlign: 'center' }}
        onMouseEnter={rowProps.onMouseEnter} onMouseLeave={rowProps.onMouseLeave} onClick={rowProps.onClick}>
        {job.minHours} - {job.maxHours}
      </div>
      <div className={cellClasses} {...rowProps}>
        {job.possibleRewards?.length ? job.possibleRewards.join(', ') : '-'}
      </div>
      <div className={cellClasses} style={{ ...rowProps.style, textAlign: 'right' }}
        onMouseEnter={rowProps.onMouseEnter} onMouseLeave={rowProps.onMouseLeave} onClick={rowProps.onClick}>
        {job.premiumCost ? (
          <span className='inline-flex items-center gap-1 text-red3 font-semibold'>
            {job.premiumCost} <span title='Ruby'>💎</span>
          </span>
        ) : '-'}
      </div>
    </>
  );
}

function StartShiftFooter({
  job, hours, setHours, level, busy, onStart,
}: {
  job: WorkJob;
  hours: number;
  setHours: (h: number) => void;
  level: number;
  busy: boolean;
  onStart: () => void;
}) {
  const wage = jobGoldPerHour(level, job);
  const totalGold = wage * hours;
  const realMins = realDurationMinutes(hours);
  const safeHours = Math.max(job.minHours, Math.min(job.maxHours, hours));

  return (
    <div className='flex items-center gap-3 px-3 py-3 text-sm'>
      <div className='flex-1'>
        <div className='font-semibold'>{job.name}</div>
        <div className='text-xs opacity-80'>{job.description}</div>
      </div>
      <label className='text-xs flex items-center gap-1'>
        Hours
        <select
          value={safeHours}
          onChange={(e) => setHours(Number(e.target.value))}
          className='border border-brown2 px-1 py-1 rounded-sm bg-cream-card'
        >
          {Array.from(
            { length: job.maxHours - job.minHours + 1 },
            (_, i) => i + job.minHours,
          ).map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </label>
      <div className='text-xs text-right shrink-0'>
        <div className='font-semibold flex items-center justify-end gap-1'>
          {totalGold}
          <Image src='/images/crowns.png' width={12} height={12} alt='' />
        </div>
        <div className='opacity-70'>~ {Math.round(realMins)} real min</div>
      </div>
      <button
        onClick={onStart}
        disabled={busy}
        className='general-button px-4 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
      >
        Start
      </button>
    </div>
  );
}

function CurrentShift({
  work, secondsLeft, ready, busy, level, onClaim, onCancel,
}: {
  work: { jobId: string; hours: number; startedAt: string | Date; endsAt: string | Date };
  secondsLeft: number;
  ready: boolean;
  busy: boolean;
  level: number;
  onClaim: () => void;
  onCancel: () => void;
}) {
  const job = findJob(work.jobId);
  const wage = job ? jobGoldPerHour(level, job) : 0;
  const totalGold = wage * work.hours;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  return (
    <div className='flex items-center gap-3 px-3 py-2 text-sm'>
      <div className='flex-1'>
        <div className='font-semibold'>
          {job?.name ?? 'Unknown'} - {work.hours}h
        </div>
        <div className='text-xs opacity-80'>
          {ready
            ? 'Shift complete -- claim your wages.'
            : `Ready in ${m}m ${s.toString().padStart(2, '0')}s`}
        </div>
      </div>
      <div className='font-semibold flex items-center gap-1'>
        {totalGold}
        <Image src='/images/crowns.png' width={12} height={12} alt='' />
      </div>
      {ready ? (
        <button
          onClick={onClaim}
          disabled={busy}
          className='general-button px-4 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Claim
        </button>
      ) : (
        <button
          onClick={onCancel}
          disabled={busy}
          className='general-button px-4 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Cancel
        </button>
      )}
    </div>
  );
}
