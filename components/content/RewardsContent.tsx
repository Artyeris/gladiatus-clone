'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  claimDailyReward,
  claimMonthlyReward,
  claimWeeklyReward,
} from '@/lib/actions/rewards/rewards.action';
import {
  DAILY_REWARD_DIAMONDS,
  MONTHLY_REWARD_DIAMONDS,
  RewardsStatus,
  WEEKLY_REWARD_DIAMONDS,
} from '@/lib/actions/rewards/rewards.types';

interface Props {
  initialStatus: RewardsStatus;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'ready';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

const RewardsContent = ({ initialStatus }: Props) => {
  const router = useRouter();
  const [status, setStatus] = useState<RewardsStatus>(initialStatus);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const refresh = () => router.refresh();

  const onDaily = async () => {
    setBusy(true);
    const res = await claimDailyReward();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`+${res.awarded} diamonds (streak: ${res.streak})`);
    setStatus({
      ...status,
      diamonds: status.diamonds + res.awarded,
      dailyStreak: res.streak,
      daily: { ready: false, nextAt: new Date().toISOString() },
      monthly: { ...status.monthly, progress: Math.min(res.streak, 28) },
    });
    refresh();
  };

  const onWeekly = async () => {
    setBusy(true);
    const res = await claimWeeklyReward();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`+${res.awarded} diamonds`);
    setStatus({
      ...status,
      diamonds: status.diamonds + res.awarded,
      weekly: { ready: false, nextAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString() },
    });
    refresh();
  };

  const onMonthly = async () => {
    setBusy(true);
    const res = await claimMonthlyReward();
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`+${res.awarded} diamonds`);
    setStatus({
      ...status,
      diamonds: status.diamonds + res.awarded,
      dailyStreak: 0,
      monthly: { ready: false, nextAt: null, progress: 0 },
    });
    refresh();
  };

  const now = Date.now();
  const dailyMs = status.daily.nextAt ? new Date(status.daily.nextAt).getTime() - now : 0;
  const weeklyMs = status.weekly.nextAt ? new Date(status.weekly.nextAt).getTime() - now : 0;

  // touch tick so countdown text re-renders each second
  void tick;

  return (
    <div className='px-6 flex flex-col gap-4 text-brown2'>
      <Section title='Rewards'>
        <div className='flex flex-col gap-2 px-3 py-2 text-sm'>
          <p>
            Special events and claimables. Log in daily to keep your streak
            going - hit 28 days in a row to unlock the monthly chest.
          </p>
          <div className='flex items-center gap-2 font-semibold'>
            Diamonds:
            <span className='text-red3'>{status.diamonds}</span>
          </div>
          <div className='flex items-center gap-2 text-xs opacity-80'>
            Current login streak: <span className='font-semibold'>{status.dailyStreak} day(s)</span>
          </div>
        </div>
      </Section>

      <RewardRow
        title='Daily login'
        amount={DAILY_REWARD_DIAMONDS}
        ready={status.daily.ready}
        wait={status.daily.ready ? '' : formatCountdown(dailyMs)}
        onClaim={onDaily}
        disabled={busy || !status.daily.ready}
      />

      <RewardRow
        title='Weekly login'
        amount={WEEKLY_REWARD_DIAMONDS}
        ready={status.weekly.ready}
        wait={status.weekly.ready ? '' : formatCountdown(weeklyMs)}
        onClaim={onWeekly}
        disabled={busy || !status.weekly.ready}
      />

      <RewardRow
        title='Monthly login (28-day streak)'
        amount={MONTHLY_REWARD_DIAMONDS}
        ready={status.monthly.ready}
        wait={status.monthly.ready ? '' : `${status.monthly.progress} / 28 days`}
        onClaim={onMonthly}
        disabled={busy || !status.monthly.ready}
      />
    </div>
  );
};

export default RewardsContent;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>{title}</div>
      <div className='flex flex-col'>{children}</div>
    </div>
  );
}

function RewardRow({
  title, amount, ready, wait, onClaim, disabled,
}: {
  title: string;
  amount: number;
  ready: boolean;
  wait: string;
  onClaim: () => void;
  disabled: boolean;
}) {
  return (
    <Section title={title}>
      <div className='flex items-center gap-3 px-3 py-2 text-sm'>
        <div className='flex flex-col flex-1 min-w-0'>
          <span className='font-semibold'>+{amount} diamonds</span>
          <span className='text-xs opacity-80'>
            {ready ? 'Ready to claim' : `Next: ${wait}`}
          </span>
        </div>
        <button
          onClick={onClaim}
          disabled={disabled}
          className='general-button px-3 py-1 rounded-sm font-semibold hover:brightness-110 disabled:opacity-50'
        >
          Claim
        </button>
      </div>
    </Section>
  );
}
