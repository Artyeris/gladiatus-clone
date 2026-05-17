'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { renameCharacter } from '@/lib/actions/user/updateSettings.action';

interface Props {
  currentName: string;
  renameCost: number;
  currentGold: number;
}

const ProfileContent = ({ currentName, renameCost, currentGold }: Props) => {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [renaming, setRenaming] = useState(false);

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
        Profile
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
    </div>
  );
};

export default ProfileContent;
