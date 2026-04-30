import { ItemInterface } from '@/lib/interfaces/item.interface';

export const EQUIPMENT_SLOTS = [
  'head',
  'chest',
  'legs',
  'gloves',
  'cloak',
  'boots',
  'mainHand',
  'offHand',
  'necklace',
  'ring1',
  'ring2',
] as const;

export type EquipmentSlot = typeof EQUIPMENT_SLOTS[number];

// Display label per slot.
export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Helmet',
  chest: 'Armor',
  legs: 'Legs',
  gloves: 'Gloves',
  cloak: 'Cloak',
  boots: 'Boots',
  mainHand: 'Weapon',
  offHand: 'Shield',
  necklace: 'Amulet',
  ring1: 'Ring',
  ring2: 'Ring',
};

// Item type accepted by each slot. ring1/ring2 both accept type 'ring'.
const SLOT_TYPE: Record<EquipmentSlot, ItemInterface['type']> = {
  head: 'head',
  chest: 'chest',
  legs: 'legs',
  gloves: 'gloves',
  cloak: 'cloak',
  boots: 'boots',
  mainHand: 'mainHand',
  offHand: 'offHand',
  necklace: 'necklace',
  ring1: 'ring',
  ring2: 'ring',
};

export function slotAcceptsItem(
  slot: EquipmentSlot,
  item: Pick<ItemInterface, 'type'> | null | undefined
): boolean {
  if (!item || !item.type) return false;
  return SLOT_TYPE[slot] === item.type;
}

export type EquipmentMap = Partial<Record<EquipmentSlot, ItemInterface | null>>;
