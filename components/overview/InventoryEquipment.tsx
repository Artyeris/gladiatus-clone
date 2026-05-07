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
import {
  INVENTORY_COLS,
  INVENTORY_ROWS,
  InventoryEntry,
  buildGrid,
  canPlaceItem,
  findEntry,
  placeItem,
  removeItem,
} from '@/lib/utils/inventory/grid';
import ItemImage from '@/components/shared/ItemImage';
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

const InventoryEquipment = ({ character }: Props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Board character={character} />
    </DndProvider>
  );
};

export default InventoryEquipment;

function entriesFromCharacter(character: CharacterInterface): InventoryEntry[] {
  const inv = character.inventory as any;
  if (!Array.isArray(inv)) return [];
  // New flat list.
  if (inv.length > 0 && !Array.isArray(inv[0])) {
    return inv
      .filter((e: any) => e && e.item)
      .map((e: any) => ({ item: e.item, x: e.x ?? 0, y: e.y ?? 0 }));
  }
  // Legacy 2-D form (will be migrated server-side, but tolerate here too).
  const out: InventoryEntry[] = [];
  for (let x = 0; x < inv.length; x++) {
    const row = inv[x];
    if (!Array.isArray(row)) continue;
    for (let y = 0; y < row.length; y++) {
      const cell = row[y];
      if (cell && typeof cell === 'object' && 'name' in cell) {
        out.push({ item: cell, x, y });
      }
    }
  }
  return out;
}

function Board({ character }: Props) {
  const [entries, setEntries] = useState<InventoryEntry[]>(entriesFromCharacter(character));
  const [equipment, setEquipment] = useState<EquipmentMap>(character.equipment ?? {});

  useEffect(() => {
    setEntries(entriesFromCharacter(character));
    setEquipment(character.equipment ?? {});
  }, [character]);

  const onDrop = async (payload: DragPayload, target: Source) => {
    const { item, source } = payload;

    if (
      (source.kind === 'inventory' &&
        target.kind === 'inventory' &&
        source.x === target.x &&
        source.y === target.y) ||
      (source.kind === 'equipment' &&
        target.kind === 'equipment' &&
        source.slot === target.slot)
    ) {
      return;
    }

    if (target.kind === 'equipment' && !slotAcceptsItem(target.slot, item)) {
      toast.error(`${item.name} does not fit ${SLOT_LABELS[target.slot]}`);
      return;
    }

    const prevEntries = entries.map((e) => ({ ...e }));
    const prevEquipment = { ...equipment };

    let nextEntries = entries.map((e) => ({ ...e }));
    const nextEquipment = { ...equipment };
    const itemId = item._id;

    if (source.kind === 'inventory' && target.kind === 'inventory') {
      if (!canPlaceItem(nextEntries, item, target.x, target.y, itemId)) {
        toast.error('Target cell occupied');
        return;
      }
      nextEntries = placeItem(nextEntries, item, target.x, target.y);
    } else if (source.kind === 'inventory' && target.kind === 'equipment') {
      const previously = nextEquipment[target.slot] as ItemInterface | null | undefined;
      nextEntries = removeItem(nextEntries, itemId);
      nextEquipment[target.slot] = item;
      if (previously) {
        // Best-effort: try the source cell, otherwise let the server pick.
        if (canPlaceItem(nextEntries, previously, source.x, source.y)) {
          nextEntries = placeItem(nextEntries, previously, source.x, source.y);
        }
      }
    } else if (source.kind === 'equipment' && target.kind === 'inventory') {
      if (!canPlaceItem(nextEntries, item, target.x, target.y)) {
        toast.error('Target cell occupied');
        return;
      }
      nextEquipment[source.slot] = null;
      nextEntries = placeItem(nextEntries, item, target.x, target.y);
    } else if (source.kind === 'equipment' && target.kind === 'equipment') {
      const other = nextEquipment[target.slot] ?? null;
      nextEquipment[source.slot] = other;
      nextEquipment[target.slot] = item;
    }

    setEntries(nextEntries);
    setEquipment(nextEquipment);

    const response = await moveItemAction({ itemId, source, target });
    if (response?.error) {
      toast.error(response.error.message);
      setEntries(prevEntries);
      setEquipment(prevEquipment);
    }
  };

  return (
    <div className='flex flex-col items-center gap-5'>
      <EquipmentBoard equipment={equipment} onDrop={onDrop} />
      <InventoryBoard entries={entries} onDrop={onDrop} />
    </div>
  );
}

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
  entries,
  onDrop,
}: {
  entries: InventoryEntry[];
  onDrop: (payload: DragPayload, target: Source) => void;
}) {
  const grid = buildGrid(entries);

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
          gridTemplateColumns: `repeat(${INVENTORY_COLS}, 40px)`,
          gap: '5px',
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: INVENTORY_ROWS }).flatMap((_, x) =>
          Array.from({ length: INVENTORY_COLS }).map((__, y) => (
            <InventoryDropCell
              key={`${x}-${y}`}
              x={x}
              y={y}
              cell={grid[x]?.[y]}
              entries={entries}
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
  entries,
  onDrop,
}: {
  x: number;
  y: number;
  cell: { item: ItemInterface | null; isAnchor: boolean } | undefined;
  entries: InventoryEntry[];
  onDrop: (payload: DragPayload, target: Source) => void;
}) {
  const [{ isOver, canAccept }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      canDrop: (payload: DragPayload) =>
        canPlaceItem(entries, payload.item, x, y, payload.item._id),
      drop: (payload: DragPayload) => onDrop(payload, { kind: 'inventory', x, y }),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canAccept: monitor.canDrop(),
      }),
    }),
    [x, y, entries]
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
      {cell?.isAnchor && cell.item && (
        <DraggableItem
          item={cell.item}
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
        <ItemImage
          imageId={item.image}
          alt={item.name}
          fill
          sizes='80px'
          style={{ objectFit: 'contain', padding: '2px' }}
        />
      </div>
    </ItemTooltip>
  );
}
