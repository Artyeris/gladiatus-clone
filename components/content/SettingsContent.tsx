'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { renameCharacter, updateLanguage } from '@/lib/actions/user/updateSettings.action';

interface Props {
  currentLanguage: 'en' | 'lt';
  currentName: string;
  renameCost: number;
  currentGold: number;
}

const LANGUAGES: { id: 'en' | 'lt'; label: string; native: string }[] = [
  { id: 'en', label: 'English',   native: 'English' },
  { id: 'lt', label: 'Lithuanian', native: 'Lietuvių' },
];

const SettingsContent = ({ currentLanguage, currentName, renameCost, currentGold }: Props) => {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'lt'>(currentLanguage);
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(false);

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

  const onRename = async () => {
    if (name === currentName) return toast('Same name');
    if (currentGold < renameCost) return toast.error(`Need ${renameCost} gold`);
    if (!confirm(`Rename to "${name}" for ${renameCost} gold?`)) return;
    setRenaming(true);
    const res = await renameCharacter({ name });
    setRenaming(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Renamed');
    router.refresh();
  };

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        Settings
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div className='red-card text-cream2 font-semibold text-sm px-3 py-1'>Gladiator name</div>
        <div className='flex flex-col gap-2 px-3 py-3'>
          <p className='text-xs opacity-80'>
            Pick a new name for your gladiator. Names must be unique across
            the server. Costs <strong>{renameCost} gold</strong>.
          </p>
          <div className='flex items-center gap-2'>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className='border border-brown2 px-2 py-1 rounded-sm bg-cream-card w-56'
              placeholder='New name'
            />
            <button
              type='button'
              onClick={onRename}
              disabled={renaming || name === currentName || name.trim().length < 3}
              className='general-button px-3 py-1 rounded-sm text-xs font-semibold hover:brightness-110 disabled:opacity-50'
            >
              Rename ({renameCost}g)
            </button>
          </div>
          <span className='text-[10px] opacity-70'>
            Currently: <strong>{currentName}</strong> &middot; balance: {currentGold} gold
          </span>
        </div>
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
    </div>
  );
};

export default SettingsContent;
