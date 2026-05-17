'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { updateLanguage } from '@/lib/actions/user/updateSettings.action';
import {
  devGrantGold,
  devResetTimers,
  devToggleGodMode,
} from '@/lib/actions/dev/dev.action';

interface Props {
  currentLanguage: 'en' | 'lt';
  godMode: boolean;
}

const LANGUAGES: { id: 'en' | 'lt'; label: string; native: string }[] = [
  { id: 'en', label: 'English',   native: 'English' },
  { id: 'lt', label: 'Lithuanian', native: 'Lietuvių' },
];

const SettingsContent = ({ currentLanguage, godMode }: Props) => {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'lt'>(currentLanguage);
  const [saving, setSaving] = useState(false);
  const [devBusy, setDevBusy] = useState(false);
  const [god, setGod] = useState(godMode);

  const onSave = async () => {
    if (language === currentLanguage) {
      toast('Nothing to save');
      return;
    }
    setSaving(true);
    const res = await updateLanguage({ language });
    setSaving(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Language saved');
    router.refresh();
  };

  const onToggleGod = async () => {
    setDevBusy(true);
    const res = await devToggleGodMode();
    setDevBusy(false);
    if (res?.error) return toast.error(res.error.message);
    setGod(!!res.godMode);
    toast.success(`God mode ${res.godMode ? 'ON' : 'OFF'}`);
    router.refresh();
  };

  const onGrantGold = async () => {
    setDevBusy(true);
    const res = await devGrantGold({ amount: 100_000 });
    setDevBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`+100 000 gold (now ${res.crowns})`);
    router.refresh();
  };

  const onResetTimers = async () => {
    setDevBusy(true);
    const res = await devResetTimers();
    setDevBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Expedition & arena timers reset');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        Settings
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>Language</div>
        <div className='flex flex-col gap-2 px-3 py-3'>
          <p className='text-xs opacity-80'>
            Choose the language for in-game text. Translations are being rolled
            out gradually -- some screens will stay in English until the
            corresponding strings are translated.
          </p>
          <div className='flex flex-wrap gap-2'>
            {LANGUAGES.map((opt) => (
              <button
                key={opt.id}
                type='button'
                onClick={() => setLanguage(opt.id)}
                className={`px-3 py-1 rounded-sm text-xs font-semibold border-[2px] ${
                  language === opt.id
                    ? 'border-red3 text-red3 bg-cream2/60'
                    : 'border-cream2 hover:bg-cream2/60'
                }`}
              >
                {opt.label} <span className='opacity-70 font-normal'>({opt.native})</span>
              </button>
            ))}
          </div>
          <button
            type='button'
            onClick={onSave}
            disabled={saving || language === currentLanguage}
            className='general-button px-3 py-1 rounded-sm text-xs font-semibold w-fit hover:brightness-110 disabled:opacity-50'
          >
            Save
          </button>
        </div>
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>
          Developer Options
        </div>
        <div className='flex flex-col gap-3 px-3 py-3'>
          <p className='text-xs opacity-80 italic'>
            Testing helpers. These bypass the normal economy and timers --
            disable before going live.
          </p>

          <div className='flex items-center justify-between gap-2'>
            <div>
              <div className='font-semibold'>God Mode</div>
              <div className='text-xs opacity-80'>
                Currently: <strong>{god ? 'ON' : 'OFF'}</strong> &middot;
                fighters with god mode cannot die in combat.
              </div>
            </div>
            <button
              type='button'
              onClick={onToggleGod}
              disabled={devBusy}
              className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              {god ? 'Turn OFF' : 'Turn ON'}
            </button>
          </div>

          <div className='flex items-center justify-between gap-2'>
            <div>
              <div className='font-semibold'>Gold +100 000</div>
              <div className='text-xs opacity-80'>Instantly credit 100 000 gold.</div>
            </div>
            <button
              type='button'
              onClick={onGrantGold}
              disabled={devBusy}
              className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              Grant
            </button>
          </div>

          <div className='flex items-center justify-between gap-2'>
            <div>
              <div className='font-semibold'>Reset Timers</div>
              <div className='text-xs opacity-80'>
                Skip expedition and arena cooldowns - fight immediately.
              </div>
            </div>
            <button
              type='button'
              onClick={onResetTimers}
              disabled={devBusy}
              className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
