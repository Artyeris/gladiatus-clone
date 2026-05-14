import Item from '@/lib/models/item.model';

const EQUIPMENT_SLOT_NAMES = [
  'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
  'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
];

// Replace each equipment slot's ObjectId ref with the actual Item document
// so combat math (effectiveStats / calculateCombatStats) and the fighter
// cards can see item bonuses. Safe to call on already-populated docs and
// on NPC objects that have no `equipment` field. Mongoose still persists
// these paths as ObjectIds on save, so calling this before save() is fine.
export async function populateEquipment(character: any): Promise<void> {
  if (!character?.equipment) return;
  for (const slot of EQUIPMENT_SLOT_NAMES) {
    const ref = character.equipment[slot];
    if (ref && typeof ref === 'object' && !('name' in ref)) {
      const item = await Item.findById(ref);
      character.equipment[slot] = item ?? null;
    }
  }
}
