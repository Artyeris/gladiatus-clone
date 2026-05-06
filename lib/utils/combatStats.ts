import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';

// Bare-handed baseline so unarmed characters never show "0 - 0" damage.
// Strength contributes +1 damage per 10 points to both bounds.
export const UNARMED_DAMAGE_MIN = 0;
export const UNARMED_DAMAGE_MAX = 2;

export function getEquippedItems(character: CharacterInterface): ItemInterface[] {
  const equipment = (character.equipment ?? {}) as Record<string, unknown>;
  const items: ItemInterface[] = [];
  for (const slot of EQUIPMENT_SLOTS) {
    const cell = equipment[slot];
    if (cell && typeof cell === 'object' && '_id' in (cell as object)) {
      items.push(cell as ItemInterface);
    }
  }
  return items;
}

export interface CombatStats {
  armor: number;
  weaponMin: number;
  weaponMax: number;
  hasWeapon: boolean;
  strBonus: number;
  damageMin: number;
  damageMax: number;
}

export function calculateCombatStats(character: CharacterInterface): CombatStats {
  const items = getEquippedItems(character);
  let armor = 0;
  let weaponMin = 0;
  let weaponMax = 0;
  let hasWeapon = false;

  for (const it of items) {
    armor += it.armor ?? 0;
    if (it.damage && it.damage.length === 2) {
      weaponMin += it.damage[0];
      weaponMax += it.damage[1];
      hasWeapon = true;
    }
  }

  // Fall back to fists when nothing is equipped, so the UI never shows 0 - 0.
  if (!hasWeapon) {
    weaponMin = UNARMED_DAMAGE_MIN;
    weaponMax = UNARMED_DAMAGE_MAX;
  }

  const strBonus = Math.floor((character.strength ?? 5) / 10);

  return {
    armor,
    weaponMin,
    weaponMax,
    hasWeapon,
    strBonus,
    damageMin: weaponMin + strBonus,
    damageMax: weaponMax + strBonus,
  };
}
