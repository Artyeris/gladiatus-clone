import Image from 'next/image';
import { ItemInterface } from '@/lib/interfaces/item.interface';

type EquipmentSlotKey = 'helmet' | 'weapon' | 'shield' | 'armor' | 'boots' | 'ring1' | 'amulet';

interface EquipmentSlotsProps {
  equipment: Record<EquipmentSlotKey, ItemInterface | null>;
  onDropItem: (slot: EquipmentSlotKey) => void;
  onStartDrag: (slot: EquipmentSlotKey, item: ItemInterface) => void;
}

const EquipmentSlots = ({ equipment, onDropItem, onStartDrag }: EquipmentSlotsProps) => {
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
        <EquipmentSlot type="helmet" item={equipment.helmet} onDropItem={onDropItem} onStartDrag={onStartDrag} />

        {/* Weapon & Armor Row */}
        <EquipmentSlot type="weapon" item={equipment.weapon} onDropItem={onDropItem} onStartDrag={onStartDrag} />
        <EquipmentSlot type="armor" item={equipment.armor} onDropItem={onDropItem} onStartDrag={onStartDrag} />
        <EquipmentSlot type="shield" item={equipment.shield} onDropItem={onDropItem} onStartDrag={onStartDrag} />
        
        {/* Accessories Row */}
        <EquipmentSlot type="boots" item={equipment.boots} onDropItem={onDropItem} onStartDrag={onStartDrag} />
        <div style={{ gridColumn: '2 / 3' }}></div> 
        <EquipmentSlot type="ring1" item={equipment.ring1} onDropItem={onDropItem} onStartDrag={onStartDrag} />
        <EquipmentSlot type="amulet" item={equipment.amulet} onDropItem={onDropItem} onStartDrag={onStartDrag} />

      </div>
    </div>
  );
};

// Helper component for a single slot
const EquipmentSlot = ({
  type,
  item,
  onDropItem,
  onStartDrag,
}: {
  type: EquipmentSlotKey;
  item: ItemInterface | null;
  onDropItem: (slot: EquipmentSlotKey) => void;
  onStartDrag: (slot: EquipmentSlotKey, item: ItemInterface) => void;
}) => (
  <div style={{ 
    width: '60px', 
    height: '60px', 
    background: '#a89f91', // Darker stone slot color
    border: '2px solid #5c3a21',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)', // Inner shadow for depth
    position: 'relative',
  }}
  onDragOver={(event) => event.preventDefault()}
  onDrop={() => onDropItem(type)}
  >
    {item ? (
      <Image
        src={`/items/${item.image}.webp`}
        fill
        sizes="60px"
        alt={item.name}
        draggable
        onDragStart={() => onStartDrag(type, item)}
        style={{ objectFit: 'contain', padding: '3px', cursor: 'grab' }}
      />
    ) : (
      <span style={{ fontSize: '10px', color: '#3e2714' }}>{type}</span>
    )}
  </div>
);

export default EquipmentSlots;
