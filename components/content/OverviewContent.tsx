import React from 'react';

// FIX: Go up one folder (..) then into overview
import CharacterPanel from '../overview/CharacterPanel'; 
import EquipmentSlots from '../overview/EquipmentSlots';
import InventoryGrid from '../overview/Inventory'; 

const OverviewContent = () => {
  return (
    <div className="game-container">
      
      {/* 1. Top Navigation Bar */}
      <div className="game-header">
        <div className="header-tab active">Bendras vaizdas</div>
        <div className="header-tab">Statistika</div>
        <div className="header-tab">Pergalės</div>
      </div>

      {/* 2. Main Content Area - Split into Left and Right */}
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* LEFT COLUMN: Character Info (Pic 1 content) */}
        <div style={{ flex: 1, borderRight: '2px solid #5c3a21', paddingRight: '20px' }}>
           <CharacterPanel /> 
           {/* This component currently holds the Avatar and Stats */}
        </div>

        {/* RIGHT COLUMN: Equipment & Bag */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
           
           {/* Top Right: Equipped Items (The stone slots in Pic 4) */}
           <EquipmentSlots /> 

           {/* Bottom Right: The Bag/Inventory Grid */}
           <div style={{ 
             border: '3px solid #5c3a21', 
             padding: '10px', 
             backgroundColor: '#e8dcc0' 
           }}>
              <h3>Inventory (Bag)</h3>
              <InventoryGrid />
           </div>

        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
