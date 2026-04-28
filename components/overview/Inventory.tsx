import React from 'react';

const Inventory = () => {
  // Create a grid of 8 columns x 4 rows (standard inventory size)
  const slots = Array.from({ length: 32 }, (_, i) => i);

  return (
    <div style={{ 
      background: '#5c3a21', // Dark wood border
      padding: '10px',
      borderRadius: '5px'
    }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 10px', color: '#f4eac8', fontFamily: "'Cinzel', serif" }}>Inventory (Bag)</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(8, 1fr)', // 8 columns
        gap: '5px'
      }}>
        {slots.map((slot) => (
          <div key={slot} style={{ 
            width: '40px', 
            height: '40px', 
            background: '#3e2714', // Dark slot background
            border: '1px solid #8b5a2b',
            borderRadius: '2px'
          }}>
             {/* Items will go here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
