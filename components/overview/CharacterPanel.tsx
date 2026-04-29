// components/overview/CharacterPanel.tsx
import Image from 'next/image';

interface CharacterPanelProps {
  user: any; // Replace with proper TypeScript interface
}

export default function CharacterPanel({ user }: CharacterPanelProps) {
  // Determine avatar based on level and gender (assuming male for now based on your folder)
  const getAvatarUrl = () => {
    if (!user.level) return '/characters/male/character-lvl-0.png';
    
    // Simple logic to pick image based on level ranges
    if (user.level < 10) return '/characters/male/character-lvl-0.png';
    if (user.level < 20) return '/characters/male/character-lvl-10.png';
    if (user.level < 30) return '/characters/male/character-lvl-20.png';
    if (user.level < 40) return '/characters/male/character-lvl-30.png';
    if (user.level < 50) return '/characters/male/character-lvl-40.png';
    if (user.level < 60) return '/characters/male/character-lvl-50.png';
    if (user.level < 70) return '/characters/male/character-lvl-60.png';
    if (user.level < 80) return '/characters/male/character-lvl-70.png';
    return '/characters/male/character-lvl-80.png';
  };

  const avatarUrl = getAvatarUrl();

  // Calculate HP for display
  const maxHealth = (user.endurance || 5) * 10 + (user.level || 1) * 5;
  const currentHealth = user.health || maxHealth;
  const healthPercent = Math.min((currentHealth / maxHealth) * 100, 100);

  return (
    <div style={{ /* ... your existing styles ... */ }}>
      {/* Avatar Section */}
      <div style={{ position: 'relative', width: '200px', height: '250px' }}>
        <Image 
          src={avatarUrl} 
          alt="Character" 
          fill 
          style={{ objectFit: 'contain' }} 
        />
      </div>

      {/* Stats Section - English Only */}
      <div style={{ /* ... your existing styles ... */ }}>
        <h3>{user.name}</h3>
        
        {/* Health Bar */}
        <div style={{ marginBottom: '10px' }}>
          <span>Health</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${healthPercent}%`, background: 'red', height: '100%' }}></div>
          </div>
        </div>

        {/* Strength */}
        <div style={{ marginBottom: '5px' }}>
          <span>Strength</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${(user.strength / 20) * 100}%`, background: 'green', height: '100%' }}></div>
          </div>
        </div>

        {/* Endurance */}
        <div style={{ marginBottom: '5px' }}>
          <span>Endurance</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${(user.endurance / 20) * 100}%`, background: 'green', height: '100%' }}></div>
          </div>
        </div>

        {/* Agility */}
        <div style={{ marginBottom: '5px' }}>
          <span>Agility</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${(user.agility / 20) * 100}%`, background: 'green', height: '100%' }}></div>
          </div>
        </div>

        {/* Dexterity */}
        <div style={{ marginBottom: '5px' }}>
          <span>Dexterity</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${(user.dexterity / 20) * 100}%`, background: 'green', height: '100%' }}></div>
          </div>
        </div>

        {/* Intelligence */}
        <div style={{ marginBottom: '5px' }}>
          <span>Intelligence</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${(user.intelligence / 20) * 100}%`, background: 'green', height: '100%' }}></div>
          </div>
        </div>

        {/* Charisma */}
        <div style={{ marginBottom: '5px' }}>
          <span>Charisma</span>
          <div style={{ width: '100%', background: '#ccc', height: '8px' }}>
            <div style={{ width: `${(user.charisma / 20) * 100}%`, background: 'green', height: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
