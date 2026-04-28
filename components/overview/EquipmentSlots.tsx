import React from 'react';

const EquipmentSlots = () => {
  // Mock data for slots - you will replace these with real item images later
  const slots = [
    { id: 1, type: 'weapon', label: 'Sword' },
    { id: 2, type: 'armor', label: 'Chestplate' },
    { id: 3, type: 'shield', label: 'Shield' },
    { id: 4, type: 'helmet', label: 'Helmet' },
    { id: 5, type: 'boots', label: 'Boots' },
    { id: 6, type: 'ring1', label: 'Ring' },
    { id: 7, type: 'amulet', label: 'Amulet' },
  ];

  return (
    <div style={{ 
      background: '#dcd0b8', // Stone color
      border: '3px solid #5c3a21',
      padding: '15px',
      borderRadius: '5px'
    }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 15px', fontFamily: "'Cinzel', serif", color: '#3e2714' }}>Equipment</h3>
      
      {/* Grid Layout mimicking the original game */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
        gap: '10px',
        maxWidth: '400px'
      }}>
        
        {/* Helmet Slot (Top Center) */}
        <div style={{ gridColumn: '2 / 3' }}></div> 
        <EquipmentSlot type="helmet" />

        {/* Weapon & Armor Row */}
        <EquipmentSlot type="weapon" />
        <EquipmentSlot type="armor" />
        <EquipmentSlot type="shield" />
        
        {/* Accessories Row */}
        <EquipmentSlot type="boots" />
        <div style={{ gridColumn: '2 / 3' }}></div> 
        <EquipmentSlot type="ring1" />
        <EquipmentSlot type="amulet" />

      </div>
    </div>
  );
};

// Helper component for a single slot
const EquipmentSlot = ({ type }) => (
  <div style={{ 
    width: '60px', 
    height: '60px', 
    background: '#a89f91', // Darker stone slot color
    border: '2px solid #5c3a21',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)' // Inner shadow for depth
  }}>
    {/* Placeholder Icon - Replace with <img> later */}
    <span style={{ fontSize: '10px', color: '#3e2714' }}>{type}</span>
  </div>
);

export default EquipmentSlots;
