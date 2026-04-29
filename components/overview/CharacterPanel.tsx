import Image from 'next/image';
import { CharacterInterface } from '@/lib/interfaces/character.interface';

interface CharacterPanelProps {
  character?: CharacterInterface;
  user?: CharacterInterface;
}

export default function CharacterPanel({ character, user }: CharacterPanelProps) {
  const gladiator = character ?? user;
  const gender = gladiator?.gender ?? 'male';
  
  const getAvatarUrl = () => {
    const lvl = gladiator?.level ?? 1;
    if (lvl < 10) return `/characters/${gender}/character-lvl-0.jpg`;
    if (lvl < 20) return `/characters/${gender}/character-lvl-10.jpg`;
    if (lvl < 30) return `/characters/${gender}/character-lvl-20.jpg`;
    if (lvl < 40) return `/characters/${gender}/character-lvl-30.jpg`;
    if (lvl < 50) return `/characters/${gender}/character-lvl-40.jpg`;
    if (lvl < 60) return `/characters/${gender}/character-lvl-50.jpg`;
    if (lvl < 70) return `/characters/${gender}/character-lvl-60.jpg`;
    if (lvl < 80) return `/characters/${gender}/character-lvl-70.jpg`;
    return `/characters/${gender}/character-lvl-80.jpg`;
  };

  const avatarUrl = getAvatarUrl();

  const maxHealth = (gladiator?.endurance ?? 5) * 10 + (gladiator?.level ?? 1) * 5;
  const currentHealth = gladiator?.health ?? maxHealth;
  const healthPercent = Math.min((currentHealth / maxHealth) * 100, 100);

  return (
    <div style={{ padding: '20px' }}>
      
      <div>
        <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '10px' }}>
          <Image 
            src={avatarUrl} 
            alt="Character Avatar" 
            fill 
            style={{ objectFit: 'contain' }} 
          />
        </div>
        
        <h3 style={{ color: '#8b4513', marginBottom: '10px' }}>
          {gladiator?.name ?? 'Gladiator'}
        </h3>
        
        {/* Health Bar */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Health</span>
          <div style={{ width: '100%', background: '#ddd', height: '8px', borderRadius: '4px', marginTop: '2px' }}>
            <div style={{ width: `${healthPercent}%`, background: '#d32f2f', height: '100%', borderRadius: '4px' }}></div>
          </div>
        </div>

        {/* Stats List - English Only */}
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <StatRow label="Strength" value={gladiator?.strength ?? 5} />
          <StatRow label="Endurance" value={gladiator?.endurance ?? 5} />
          <StatRow label="Agility" value={gladiator?.agility ?? 5} />
          <StatRow label="Dexterity" value={gladiator?.dexterity ?? 5} />
          <StatRow label="Intelligence" value={gladiator?.intelligence ?? 5} />
          <StatRow label="Charisma" value={gladiator?.charisma ?? 5} />
        </div>
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

