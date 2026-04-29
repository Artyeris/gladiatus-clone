'use client'; // <--- THIS FIXES THE ERROR

import React, { useEffect, useState } from 'react';

// Define the shape of our user data
interface UserStats {
  name: string;
  level: number;
  strength: number;
  endurance: number;
  agility: number;
  dexterity: number;
  intelligence: number;
  charisma: number;
  experience: number; 
  maxExperience: number; 
  health: number; 
  maxHealth: number; 
}

const CharacterPanel = () => {
  const [user, setUser] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from your API
    fetch('/api/user/profile') 
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching profile:", err));
  }, []);

  if (loading) return <div style={{padding: '20px'}}>Loading stats...</div>;
  
  // Fallback if no user data is found yet
  if (!user) return <div style={{padding: '20px', color: 'red'}}>No user found. Check API.</div>;

  const getPercentage = (current: number, max: number) => {
    if (!max || max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      fontFamily: "'Roboto', sans-serif"
    }}>
      
      {/* Name Box */}
      <div style={{ 
        background: '#8b2e2e', 
        border: '3px solid #d4af37', 
        padding: '10px',
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, color: '#fff', textShadow: '1px 1px 2px #000', fontFamily: "'Cinzel', serif" }}>{user.name}</h2>
        <p style={{ margin: '5px 0 0', color: '#ffd700', fontSize: '0.9rem' }}>Gladiatorius</p>
      </div>

      {/* Avatar Image - Using public folder path is safer */}
      <div style={{ 
        border: '3px solid #d4af37', 
        padding: '5px', 
        background: '#fff',
        marginBottom: '10px'
      }}>
        <img 
          src="/pics/avatar.png" // Assumes you moved avatar.png to /public/pics/
          alt="Character" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Stats Section */}
      <div style={{ 
        background: '#e8dcc0', 
        border: '2px solid #5c3a21', 
        padding: '10px' 
      }}>
        
        <StatRow label="Lygis" value={user.level || 1} />

        {/* Health (Red Bar) */}
        <ProgressBar 
          label="Gyvybės taškai" 
          current={user.health || 100} 
          max={user.maxHealth || 100} 
          color="#cc0000" // Red for HP
          percentageText={`${getPercentage(user.health || 0, user.maxHealth || 100).toFixed(1)}%`}
        />

        {/* Experience (Yellow/Gold Bar) */}
        <ProgressBar 
          label="Patirtis" 
          current={user.experience || 0} 
          max={user.maxExperience || 100} 
          color="#d4af37" // Gold for XP
          percentageText={`${getPercentage(user.experience || 0, user.maxExperience || 100).toFixed(2)}%`}
        />

        {/* Main Attributes (Green Bars) */}
        <StatRow label="Jėga (Strength)" value={user.strength || 5} barColor="#228b22" />
        <StatRow label="Atsparumas (Endurance)" value={user.endurance || 5} barColor="#228b22" />
        <StatRow label="Vikrumas (Agility)" value={user.agility || 5} barColor="#228b22" />
        <StatRow label="Lankstumas (Dexterity)" value={user.dexterity || 5} barColor="#228b22" />
        <StatRow label="Protingumas (Intelligence)" value={user.intelligence || 5} barColor="#228b22" />
        <StatRow label="Charizma (Charisma)" value={user.charisma || 5} barColor="#228b22" />

      </div>
    </div>
  );
};

const StatRow = ({ label, value, barColor = "#228b22" }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', color: '#3e2714' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div style={{ height: '6px', background: '#3e2714', borderRadius: '3px', marginTop: '2px' }}>
       {/* Cap the bar width at 100% so it doesn't overflow */}
       <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: barColor, borderRadius: '3px' }}></div>
    </div>
  </div>
);

const ProgressBar = ({ label, current, max, color, percentageText }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', color: '#3e2714' }}>
      <span>{label}</span>
      <span>{percentageText}</span>
    </div>
    <div style={{ height: '8px', background: '#3e2714', borderRadius: '4px', marginTop: '2px', overflow: 'hidden' }}>
      <div style={{ 
        width: `${getPercentage(current, max)}%`, 
        height: '100%', 
        background: color,
        borderRadius: '4px'
      }}></div>
    </div>
  </div>
);

function getPercentage(current: number, max: number) {
    if (!max || max === 0) return 0;
    return Math.min((current / max) * 100, 100);
}

export default CharacterPanel;
