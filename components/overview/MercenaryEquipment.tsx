'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

import {
  equipMercenaryItem,
  listEquipCandidates,
  unequipMercenaryItem,
} from '@/lib/actions/mercenary/mercenary.action';

const SLOT_ORDER = [
  'head', 'cloak', 'chest', 'gloves',
  'mainHand', 'offHand', 'legs',
  'boots', 'necklace', 'ring1', 'ring2',
] as const;
type Slot = typeof SLOT_ORDER[number];

const SLOT_LABEL: Record<Slot, string> = {
  head: 'Head', cloak: 'Cloak', chest: 'Chest', gloves: 'Gloves',
  mainHand: 'Main Hand', offHand: 'Off-Hand', legs: 'Legs',
  boots: 'Boots', necklace: 'Necklace', ring1: 'Ring I', ring2: 'Ring II',
};

const QUALITY_COLOR: Record<string, string> = {
  common: '#7a7a7a', common_plus: '#7a7a7a',
  green:  '#3b9b3b', green_plus:  '#3b9b3b',
  blue:   '#3b6bb5', blue_plus:   '#3b6bb5',
  purple: '#9333ea', purple_plus: '#9333ea',
  orange: '#d97706', orange_plus: '#d97706',
  red:    '#dc2626',
};

interface EquipmentMap {
  [slot: string]: any;
}

interface Props {
  mercenaryId: string;
  mercenaryName: string;
  equipment: EquipmentMap;
}

const MercenaryEquipment = ({ mercenaryId, mercenaryName, equipment }: Props) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [, startTransition] = useTransition();

  const openPicker = async (slot: Slot) => {
    setPickerSlot(slot);
    setCandidates([]);
    const res: any = await listEquipCandidates({ mercenaryId, slot });
    if (res?.error) return toast.error(res.error.message);
    setCandidates(res.candidates ?? []);
  };

  const onEquip = async (itemId: string) => {
    if (!pickerSlot) return;
    setBusy(true);
    const res: any = await equipMercenaryItem({ mercenaryId, slot: pickerSlot, itemId });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success(`Equipped on ${mercenaryName}`);
    setPickerSlot(null);
    startTransition(() => router.refresh());
  };

  const onUnequip = async (slot: Slot) => {
    setBusy(true);
    const res: any = await unequipMercenaryItem({ mercenaryId, slot });
    setBusy(false);
    if (res?.error) return toast.error(res.error.message);
    toast.success('Returned to bag');
    startTransition(() => router.refresh());
  };

  return (
    <div className='flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        {mercenaryName} &middot; Equipment
      </div>

      <div className='grid grid-cols-4 gap-2'>
        {SLOT_ORDER.map((slot) => {
          const item = equipment?.[slot];
          return (
            <button
              key={slot}
              type='button'
              onClick={() => item ? onUnequip(slot) : openPicker(slot)}
              disabled={busy}
              className='relative border-[2px] border-cream2 rounded-sm w-full h-[68px] flex items-center justify-center hover:brightness-110 transition'
              style={{
                background: '#3e2714',
                borderColor: item ? (QUALITY_COLOR[item.quality] ?? '#eed7a1') : '#eed7a1',
              }}
              title={item ? `Click to unequip ${item.name}` : `Click to equip ${SLOT_LABEL[slot]}`}
            >
              {item ? (
                <Image
                  src={`/items/${item.image}.png`}
                  alt={item.name}
                  width={48}
                  height={48}
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                />
              ) : (
                <span className='text-[10px] text-cream2/80 uppercase tracking-wider'>
                  {SLOT_LABEL[slot]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {pickerSlot && (
        <div className='brown-card rounded-sm flex flex-col overflow-hidden'>
          <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 flex justify-between items-center'>
            <span>Equip {SLOT_LABEL[pickerSlot]}</span>
            <button
              type='button'
              onClick={() => setPickerSlot(null)}
              className='text-xs underline'
            >
              Cancel
            </button>
          </div>
          <div className='px-3 py-2 text-xs flex flex-col gap-1 max-h-[260px] overflow-y-auto'>
            {candidates.length === 0 ? (
              <div className='italic opacity-80 text-center py-2'>
                Nothing in your bag fits this slot.
              </div>
            ) : (
              candidates.map((c: any) => (
                <button
                  key={c._id}
                  type='button'
                  onClick={() => onEquip(c._id)}
                  disabled={busy}
                  className='flex items-center gap-2 border-[2px] border-cream2 rounded-sm px-2 py-1 hover:brightness-110 disabled:opacity-50'
                  style={{ background: '#b59964' }}
                >
                  <Image
                    src={`/items/${c.image}.png`}
                    alt={c.name}
                    width={32}
                    height={32}
                    style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                  />
                  <span
                    className='flex-1 text-left text-xs font-semibold'
                    style={{ color: QUALITY_COLOR[c.quality] ?? '#3e2714' }}
                  >
                    {c.name}
                  </span>
                  <span className='text-[10px] opacity-80'>Lvl {c.level}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className='text-[10px] italic opacity-80 text-center'>
        Click an empty slot to pick an item from your bag. Click an
        equipped item to return it to your bag.
      </div>
    </div>
  );
};

export default MercenaryEquipment;
