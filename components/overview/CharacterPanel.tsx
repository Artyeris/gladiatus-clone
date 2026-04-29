// components/overview/CharacterPanel.tsx
import Image from 'next/image';

import { CharacterInterface } from '@/lib/interfaces/character.interface';

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

      {/* Stats List - English Only */}
      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
        <StatRow label="Strength" value={user.strength || 5} />
        <StatRow label="Endurance" value={user.endurance || 5} />
        <StatRow label="Agility" value={user.agility || 5} />
        <StatRow label="Dexterity" value={user.dexterity || 5} />
        <StatRow label="Intelligence" value={user.intelligence || 5} />
        <StatRow label="Charisma" value={user.charisma || 5} />
      </div>
    </div>
  );
}

// Helper component for stat bars
function StatRow({ label, value }: { label: string; value: number }) {
  // Simple bar calculation (max 20 for visual purposes)
  const percent = Math.min((value / 20) * 100, 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ width: '80px' }}>{label}:</span>
      <span style={{ fontWeight: 'bold', width: '20px' }}>{value}</span>
      <div style={{ flex: 1, background: '#ddd', height: '6px', borderRadius: '3px' }}>
        <div style={{ width: `${percent}%`, background: '#388e3c', height: '100%', borderRadius: '3px' }}></div>
      </div>
    </div>
  );
}
