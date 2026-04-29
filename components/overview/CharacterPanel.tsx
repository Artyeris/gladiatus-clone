// components/overview/CharacterPanel.tsx
import Image from 'next/image';

import StatBar from '@/components/shared/StatBar';
import { stats } from '@/constants';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import {
  calculateStatBreakdown,
  StatBreakdown,
  StatId,
} from '@/lib/utils/statUtils';

interface CharacterPanelProps {
  user: CharacterInterface;
}

export default function CharacterPanel({ user }: CharacterPanelProps) {

  // Helper to get correct avatar based on level
  const getAvatarUrl = () => {
    const lvl = user.level || 1;
    if (lvl < 10) return '/characters/male/character-lvl-0.png';
    if (lvl < 20) return '/characters/male/character-lvl-10.png';
    if (lvl < 30) return '/characters/male/character-lvl-20.png';
    if (lvl < 40) return '/characters/male/character-lvl-30.png';
    if (lvl < 50) return '/characters/male/character-lvl-40.png';
    if (lvl < 60) return '/characters/male/character-lvl-50.png';
    if (lvl < 70) return '/characters/male/character-lvl-60.png';
    if (lvl < 80) return '/characters/male/character-lvl-70.png';
    return '/characters/male/character-lvl-80.png';
  };

  const avatarUrl = getAvatarUrl();

  // Calculate Health based on Endurance and Level
  const maxHealth = (user.endurance || 5) * 10 + (user.level || 1) * 5;
  const currentHealth = (user as any).health || maxHealth;
  const healthPercent = Math.min((currentHealth / maxHealth) * 100, 100);

  return (
    <div style={{ padding: '20px' }}>

      {/* Avatar */}
      <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '10px' }}>
        <Image
          src={avatarUrl}
          alt="Character Avatar"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>

      <h3 style={{ color: '#8b4513', marginBottom: '10px' }}>{user.name}</h3>

      {/* Health Bar */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Health</span>
        <div style={{ width: '100%', background: '#ddd', height: '8px', borderRadius: '4px', marginTop: '2px' }}>
          <div style={{ width: `${healthPercent}%`, background: '#d32f2f', height: '100%', borderRadius: '4px' }}></div>
        </div>
      </div>

      {/* Stats List - hover any row to see base / total / item contribution */}
      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
        {stats.map((stat) => {
          const breakdown = calculateStatBreakdown(user, stat.id as StatId);
          return (
            <StatRow
              key={stat.id}
              label={stat.name}
              breakdown={breakdown}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatRow({ label, breakdown }: { label: string; breakdown: StatBreakdown }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ width: '90px' }}>{label}:</span>
      <span style={{ fontWeight: 'bold', width: '24px' }}>{breakdown.total}</span>
      <div style={{ flex: 1 }}>
        <StatBar statName={label} breakdown={breakdown} />
      </div>
    </div>
  );
}
