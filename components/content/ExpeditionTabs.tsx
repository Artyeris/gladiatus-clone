'use client';

import { ReactNode, useState } from 'react';

type Tab = 'expedition' | 'dungeon';

interface Props {
  expeditionLabel: string;
  expeditionContent: ReactNode;
  dungeonContent: ReactNode;
  hasDungeon: boolean;
  defaultTab?: Tab;
}

// Tab strip that switches between the expedition view and the
// region's dungeon view -- mirrors the original Gladiatus layout
// where each expedition has a "Požemis" tab next to the expedition.
const ExpeditionTabs = ({
  expeditionLabel, expeditionContent, dungeonContent, hasDungeon, defaultTab = 'expedition',
}: Props) => {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex gap-2 px-4 font-semibold text-brown2'>
        <TabChip
          label={expeditionLabel}
          active={tab === 'expedition'}
          onClick={() => setTab('expedition')}
        />
        {hasDungeon && (
          <TabChip
            label='Dungeon'
            active={tab === 'dungeon'}
            onClick={() => setTab('dungeon')}
          />
        )}
      </div>
      {tab === 'expedition' ? expeditionContent : dungeonContent}
    </div>
  );
};

export default ExpeditionTabs;

function TabChip({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='px-6 py-1 rounded-sm font-semibold text-sm cursor-pointer'
      style={
        active
          ? {
              background: '#974342',
              border: '2px solid #eed7a1',
              outline: '2px solid #974342',
              color: '#f4eac8',
            }
          : {
              background: '#b59964',
              border: '2px solid #eed7a1',
              outline: '2px solid #b59964',
              color: '#3e2714',
            }
      }
    >
      {label}
    </button>
  );
}
