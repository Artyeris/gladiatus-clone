'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import toast from 'react-hot-toast';

import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import {
  EquipmentSlot,
  EquipmentMap,
  SLOT_LABELS,
  slotAcceptsItem,
} from '@/lib/utils/equipment';
import { moveItemAction } from '@/lib/actions/item/moveItem.action';
import ItemTooltip from '@/components/overview/ItemTooltip';

const DRAG_TYPE = 'ITEM';

type Source =
  | { kind: 'inventory'; x: number; y: number }
  | { kind: 'equipment'; slot: EquipmentSlot };

interface DragPayload {
  item: ItemInterface;
  source: Source;
}

interface Props {
  character: CharacterInterface;
}

const isItem = (cell: any): cell is ItemInterface =>
  !!cell && typeof cell === 'object' && 'image' in cell;

const InventoryEquipment = ({ character }: Props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Board character={character} />
    </DndProvider>
  );
};

export default InventoryEquipment;

function Board({ character }: Props) {
  const [inventory, setInventory] = useState<any[][]>(character.inventory ?? []);
  const [equipment, setEquipment] = useState<EquipmentMap>(character.equipment ?? {});

  useEffect(() => {
    setInventory(character.inventory ?? []);
    setEquipment(character.equipment ?? {});
  }, [character]);

  const onDrop = async (payload: DragPayload, target: Source) => {
    const { item, source } = payload;

    // No-op drop on same source.
    if (
      source.kind === target.kind &&
      ((source.kind === 'inventory' &&
        target.kind === 'inventory' &&
        source.x === target.x &&
        source.y === target.y) ||
        (source.kind === 'equipment' &&
          target.kind === 'equipment' &&
          source.slot === target.slot))
    ) {
      return;
    }

    if (target.kind === 'equipment' && !slotAcceptsItem(target.slot, item)) {
      toast.error(`${item.name} does not fit ${SLOT_LABELS[target.slot]}`);
      return;
    }

    // Optimistic update.
    const prevInventory = inventory.map((row) => row.slice());
    const prevEquipment = { ...equipment };

    const nextInventory = inventory.map((row) => row.slice());
    const nextEquipment = { ...equipment };

    const itemId = item._id;
    const itemHumanId = item.id;

    const clearItemFromInventory = () => {
      for (let i = 0; i < nextInventory.length; i++) {
        for (let j = 0; j < nextInventory[i].length; j++) {
          const cell = nextInventory[i][j];
          if (!cell) continue;
          if (typeof cell === 'object' && cell._id === itemId) {
            nextInventory[i][j] = null;
          } else if (typeof cell === 'string' && (cell === itemHumanId || cell === itemId)) {
            nextInventory[i][j] = null;
          }
        }
      }
    };

    if (source.kind === 'inventory' && target.kind === 'inventory') {
      const targetCell = nextInventory[target.x]?.[target.y];
      if (targetCell) {
        toast.error('Target cell occupied');
        return;
      }
      clearItemFromInventory();
      nextInventory[target.x][target.y] = item;
    } else if (source.kind === 'inventory' && target.kind === 'equipment') {
      const previously = nextEquipment[target.slot] as ItemInterface | null | undefined;
      clearItemFromInventory();
      nextEquipment[target.slot] = item;
      if (previously) {
        if (!nextInventory[source.x]?.[source.y]) {
          nextInventory[source.x][source.y] = previously;
        } else {
          // First free cell.
          let placed = false;
          for (let i = 0; i < nextInventory.length && !placed; i++) {
            for (let j = 0; j < nextInventory[i].length && !placed; j++) {
              if (!nextInventory[i][j]) {
                nextInventory[i][j] = previously;
                placed = true;
              }
            }
          }
        }
      }
    } else if (source.kind === 'equipment' && target.kind === 'inventory') {
      if (nextInventory[target.x]?.[target.y]) {
        toast.error('Target cell occupied');
        return;
      }
      nextEquipment[source.slot] = null;
      nextInventory[target.x][target.y] = item;
    } else if (source.kind === 'equipment' && target.kind === 'equipment') {
      const other = nextEquipment[target.slot] ?? null;
      nextEquipment[source.slot] = other;
      nextEquipment[target.slot] = item;
    }

    setInventory(nextInventory);
    setEquipment(nextEquipment);

    const response = await moveItemAction({ itemId, source, target });
    if (response?.error) {
      toast.error(response.error.message);
      // Roll back.
      setInventory(prevInventory);
      setEquipment(prevEquipment);
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      <EquipmentBoard equipment={equipment} onDrop={onDrop} />
      <InventoryBoard inventory={inventory} onDrop={onDrop} />
    </div>
  );
}

// Icon hint shown in empty slots so the player can tell which gear goes where.
const SLOT_ICON: Record<EquipmentSlot, string> = {
  head: '🪖',
  chest: '🥋',
  legs: '👖',
  gloves: '🧤',
  cloak: '🧥',
  boots: '👢',
  mainHand: '⚔️',
  offHand: '🛡️',
  necklace: '📿',
  ring1: '💍',
  ring2: '💍',
};

const EQUIPMENT_LAYOUT: (EquipmentSlot | null)[][] = [
  [null,        'head',  null,        'cloak'   ],
  ['mainHand',  'chest', 'offHand',   'gloves'  ],
  [null,        'legs',  null,        'necklace'],
  [null,        'boots', 'ring1',     'ring2'   ],
];

function EquipmentBoard({
  equipment,
  onDrop,
}: {
  equipment: EquipmentMap;
  onDrop: (payload: DragPayload, target: Source) => void;
}) {
  return (
    <div
      style={{
        background: '#dcd0b8',
        border: '3px solid #5c3a21',
        padding: '15px',
        borderRadius: '5px',
      }}
    >
      <h3
        style={{
          textAlign: 'center',
          margin: '0 0 15px',
          fontFamily: "'Cinzel', serif",
          color: '#3e2714',
        }}
      >
        Equipment
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 60px)',
          gap: '10px',
          justifyContent: 'center',
        }}
      >
        {EQUIPMENT_LAYOUT.flatMap((row, ri) =>
          row.map((slot, ci) =>
            slot ? (
              <EquipmentDropSlot
                key={slot}
                slot={slot}
                item={(equipment[slot] as ItemInterface | null | undefined) ?? null}
                onDrop={onDrop}
              />
            ) : (
              <div key={`${ri}-${ci}`} />
            )
          )
        )}
      </div>
    </div>
  );
}

function EquipmentDropSlot({
  slot,
  item,
  onDrop,
}: {
  slot: EquipmentSlot;
  item: ItemInterface | null;
  onDrop: (payload: DragPayload, target: Source) => void;
}) {
  const [{ isOver, canAccept }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      canDrop: (payload: DragPayload) => slotAcceptsItem(slot, payload.item),
      drop: (payload: DragPayload) => onDrop(payload, { kind: 'equipment', slot }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canAccept: monitor.canDrop(),
      }),
    }),
    [slot, item]
  );

  const bg = isOver ? (canAccept ? '#c5d8a6' : '#e0a8a8') : '#a89f91';

  return (
    <div
      ref={(node) => {
        drop(node);
      }}
      style={{
        width: '60px',
        height: '60px',
        background: bg,
        border: '2px solid #5c3a21',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      // Native title only when the slot is empty so it doesn't double up
      // with ItemTooltip when an item is equipped.
      title={item ? undefined : SLOT_LABELS[slot]}
    >
      {item ? (
        <DraggableItem
          item={item}
          source={{ kind: 'equipment', slot }}
          size={56}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            opacity: 0.45,
            pointerEvents: 'none',
            filter: 'grayscale(1) contrast(0.85)',
          }}
        >
          <span style={{ fontSize: '24px', lineHeight: 1 }}>{SLOT_ICON[slot]}</span>
          <span style={{ fontSize: '9px', color: '#3e2714', fontWeight: 600 }}>
            {SLOT_LABELS[slot]}
          </span>
        </div>
      )}
    </div>
  );
}

function InventoryBoard({
  inventory,
  onDrop,
}: {
  inventory: any[][];
  onDrop: (payload: DragPayload, target: Source) => void;
}) {
  const rows = inventory.length ? inventory : Array.from({ length: 8 }, () => Array(5).fill(null));
  const cols = rows[0]?.length || 5;

  return (
    <div
      style={{
        background: '#5c3a21',
        padding: '10px',
        borderRadius: '5px',
      }}
    >
      <h3
        style={{
          textAlign: 'center',
          margin: '0 0 10px',
          color: '#f4eac8',
          fontFamily: "'Cinzel', serif",
        }}
      >
        Inventory (Bag)
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 40px)`,
          gap: '5px',
          justifyContent: 'center',
        }}
      >
        {rows.flatMap((row, ri) =>
          row.map((cell, ci) => (
            <InventoryDropCell
              key={`${ri}-${ci}`}
              x={ri}
              y={ci}
              cell={cell}
              onDrop={onDrop}
            />
          ))
        )}
      </div>
    </div>
  );
}

function InventoryDropCell({
  x,
  y,
  cell,
  onDrop,
}: {
  x: number;
  y: number;
  cell: any;
  onDrop: (payload: DragPayload, target: Source) => void;
}) {
  const [{ isOver, canAccept }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      canDrop: (payload: DragPayload) => {
        if (cell) {
          // Same item dropped back onto itself is OK.
          if (typeof cell === 'object' && cell._id === payload.item._id) return true;
          return false;
        }
        return true;
      },
      drop: (payload: DragPayload) => onDrop(payload, { kind: 'inventory', x, y }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canAccept: monitor.canDrop(),
      }),
    }),
    [x, y, cell]
  );

  const bg = isOver
    ? canAccept
      ? '#5c8a3a'
      : '#7a3a3a'
    : '#3e2714';

  return (
    <div
      ref={(node) => {
        drop(node);
      }}
      style={{
        position: 'relative',
        width: '40px',
        height: '40px',
        background: bg,
        border: '1px solid #8b5a2b',
        borderRadius: '2px',
      }}
    >
      {isItem(cell) && (
        <DraggableItem
          item={cell}
          source={{ kind: 'inventory', x, y }}
          size={36}
        />
      )}
    </div>
  );
}

function DraggableItem({
  item,
  source,
  size,
}: {
  item: ItemInterface;
  source: Source;
  size: number;
}) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { item, source } satisfies DragPayload,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item, source]
  );

  return (
    <ItemTooltip item={item}>
      <div
        ref={(node) => {
          drag(node);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          cursor: 'grab',
          opacity: isDragging ? 0.4 : 1,
        }}
      >
        <Image
          src={`/items/${item.image}.webp`}
          alt={item.name}
          width={size}
          height={size}
          style={{ objectFit: 'contain', width: '100%', height: '100%', padding: '2px' }}
        />
      </div>
    </ItemTooltip>
  );
}
