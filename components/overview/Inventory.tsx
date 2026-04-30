import Image from 'next/image';
import { ItemInterface } from '@/lib/interfaces/item.interface';

interface InventoryProps {
  inventory?: (ItemInterface | string | null)[][];
}

const emptyInventory = Array.from({ length: 8 }, () => Array.from({ length: 5 }, () => null));

const isItem = (cell: ItemInterface | string | null): cell is ItemInterface => {
  return !!cell && typeof cell === 'object' && 'image' in cell;
};

const Inventory = ({ inventory }: InventoryProps) => {
  const rows = inventory?.length ? inventory : emptyInventory;
  const columnCount = rows[0]?.length || 5;

  return (
    <div style={{
      background: '#5c3a21',
      padding: '10px',
      borderRadius: '5px',
    }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 10px', color: '#f4eac8', fontFamily: "'Cinzel', serif" }}>
        Inventory (Bag)
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 40px)`,
        gap: '5px',
      }}>
        {rows.flatMap((row, rowIndex) => (
          row.map((cell, cellIndex) => (
            <div key={`${rowIndex}-${cellIndex}`} style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              background: '#3e2714',
              border: '1px solid #8b5a2b',
              borderRadius: '2px',
            }}>
              {isItem(cell) && (
                <Image
                  src={`/items/${cell.image}.webp`}
                  fill
                  sizes="40px"
                  alt={cell.name}
                  style={{ objectFit: 'contain', padding: '2px' }}
                />
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default Inventory;
