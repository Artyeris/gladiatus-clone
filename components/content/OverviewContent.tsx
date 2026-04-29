'use client';

import { useMemo, useState } from 'react';
import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import CharacterPanel from '../overview/CharacterPanel';
import EquipmentSlots from '../overview/EquipmentSlots';
import InventoryGrid from '../overview/Inventory';

interface OverviewContentProps {
  character: CharacterInterface;
}

type InventoryCell = ItemInterface | string | null;
type EquipmentSlotKey = 'helmet' | 'weapon' | 'shield' | 'armor' | 'boots' | 'ring1' | 'amulet';
type EquipmentState = Record<EquipmentSlotKey, ItemInterface | null>;

interface DragData {
  from: 'inventory' | 'equipment';
  item: ItemInterface;
  x?: number;
  y?: number;
  slot?: EquipmentSlotKey;
}

const emptyEquipment: EquipmentState = {
  helmet: null,
  weapon: null,
  shield: null,
  armor: null,
  boots: null,
  ring1: null,
  amulet: null,
};

const getItemDimensions = (item: ItemInterface) => ({
  width: item.width || 1,
  height: item.height || 1,
});

const cloneInventory = (inventory: InventoryCell[][]) => inventory.map((row) => [...row]);

const clearItemFromInventory = (inventory: InventoryCell[][], item: ItemInterface) => {
  for (let i = 0; i < inventory.length; i++) {
    for (let j = 0; j < inventory[i].length; j++) {
      const current = inventory[i][j];
      if (
        (typeof current === 'object' && current && current._id === item._id) ||
        current === item.id
      ) {
        inventory[i][j] = null;
      }
    }
  }
};

const canPlaceItem = (inventory: InventoryCell[][], item: ItemInterface, x: number, y: number) => {
  const { width, height } = getItemDimensions(item);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const targetX = x + i;
      const targetY = y + j;
      if (targetX >= inventory.length || targetY >= inventory[0].length) return false;
      if (inventory[targetX][targetY] !== null) return false;
    }
  }
  return true;
};

const placeItem = (inventory: InventoryCell[][], item: ItemInterface, x: number, y: number) => {
  const { width, height } = getItemDimensions(item);
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      inventory[x + i][y + j] = i === 0 && j === 0 ? item : item.id;
    }
  }
};

const canEquipInSlot = (item: ItemInterface, slot: EquipmentSlotKey) => {
  const map: Partial<Record<EquipmentSlotKey, ItemInterface['type']>> = {
    helmet: 'head',
    weapon: 'mainHand',
    shield: 'offHand',
    armor: 'chest',
    boots: 'boots',
    ring1: 'ring',
    amulet: 'necklace',
  };
  return map[slot] === item.type;
};

const OverviewContent = ({ character }: OverviewContentProps) => {
  const [inventory, setInventory] = useState<InventoryCell[][]>(character.inventory as InventoryCell[][]);
  const [equipment, setEquipment] = useState<EquipmentState>(emptyEquipment);
  const [dragData, setDragData] = useState<DragData | null>(null);

  const normalizedInventory = useMemo(() => {
    if (!inventory?.length) return Array.from({ length: 8 }, () => Array.from({ length: 5 }, () => null));
    return inventory;
  }, [inventory]);

  const handleDropOnInventory = (x: number, y: number) => {
    if (!dragData) return;
    const nextInventory = cloneInventory(normalizedInventory);
    const nextEquipment = { ...equipment };

    if (dragData.from === 'inventory') {
      clearItemFromInventory(nextInventory, dragData.item);
    } else if (dragData.slot) {
      nextEquipment[dragData.slot] = null;
    }

    if (!canPlaceItem(nextInventory, dragData.item, x, y)) return;

    placeItem(nextInventory, dragData.item, x, y);
    setInventory(nextInventory);
    setEquipment(nextEquipment);
    setDragData(null);
  };

  const handleDropOnEquipment = (slot: EquipmentSlotKey) => {
    if (!dragData || !canEquipInSlot(dragData.item, slot)) return;

    const currentItemInSlot = equipment[slot];
    const nextInventory = cloneInventory(normalizedInventory);
    const nextEquipment = { ...equipment };

    if (dragData.from === 'inventory') {
      clearItemFromInventory(nextInventory, dragData.item);
    } else if (dragData.slot) {
      nextEquipment[dragData.slot] = null;
    }

    if (currentItemInSlot) {
      if (dragData.from === 'inventory' && typeof dragData.x === 'number' && typeof dragData.y === 'number') {
        if (!canPlaceItem(nextInventory, currentItemInSlot, dragData.x, dragData.y)) return;
        placeItem(nextInventory, currentItemInSlot, dragData.x, dragData.y);
      } else {
        const originSlot = dragData.slot;
        if (!originSlot || !canEquipInSlot(currentItemInSlot, originSlot)) return;
        nextEquipment[originSlot] = currentItemInSlot;
      }
    }

    nextEquipment[slot] = dragData.item;
    setInventory(nextInventory);
    setEquipment(nextEquipment);
    setDragData(null);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-tab active">Bendras vaizdas</div>
        <div className="header-tab">Statistika</div>
        <div className="header-tab">Pergales</div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, borderRight: '2px solid #5c3a21', paddingRight: '20px' }}>
          <CharacterPanel character={character} />
        </div>

        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <EquipmentSlots
            equipment={equipment}
            onDropItem={handleDropOnEquipment}
            onStartDrag={(slot, item) => setDragData({ from: 'equipment', slot, item })}
          />

          <div style={{
            border: '3px solid #5c3a21',
            padding: '10px',
            backgroundColor: '#e8dcc0',
          }}>
            <InventoryGrid
              inventory={normalizedInventory}
              onDropItem={handleDropOnInventory}
              onStartDrag={(x, y, item) => setDragData({ from: 'inventory', x, y, item })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
