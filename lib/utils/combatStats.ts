import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';

// Bare-handed minimum so the UI never reads "0 - 0" damage.
export const UNARMED_DAMAGE_MIN = 0;

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

export interface EffectiveStats {
  level: number;
  strength: number;
  endurance: number;
  agility: number;
  dexterity: number;
  intelligence: number;
  charisma: number;
}

// Sum of base stats and stat bonuses contributed by equipped items.
// NPC enemies (no equipment) just return their base stats unchanged.
export function effectiveStats(combatant: any): EffectiveStats {
  const items = getEquippedItems(combatant as CharacterInterface);
  const sum = (key: keyof ItemInterface) =>
    items.reduce((s, it) => s + ((it[key] as number | undefined) ?? 0), 0);

  return {
    level:        combatant.level ?? 1,
    strength:     (combatant.strength ?? 5)     + sum('strength'),
    endurance:    (combatant.endurance ?? 5)    + sum('endurance'),
    agility:      (combatant.agility ?? 5)      + sum('agility'),
    dexterity:    (combatant.dexterity ?? 5)    + sum('dexterity'),
    intelligence: (combatant.intelligence ?? 5) + sum('intelligence'),
    charisma:     (combatant.charisma ?? 5)     + sum('charisma'),
  };
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

  // Use effective strength (base + item bonuses) so a strength ring lifts
  // the displayed damage too.
  const eff = effectiveStats(character);

  if (!hasWeapon) {
    // Unarmed scales gently with strength so high-level NPCs without
    // weapons aren't reduced to a 0-2 punch.
    weaponMin = UNARMED_DAMAGE_MIN;
    weaponMax = Math.max(2, Math.floor(eff.strength * 0.15));
  }

  const strBonus = Math.floor(eff.strength / 10);

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
