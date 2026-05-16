import { CharacterInterface } from '@/lib/interfaces/character.interface';
import { ItemInterface } from '@/lib/interfaces/item.interface';
import { EQUIPMENT_SLOTS } from '@/lib/utils/equipment';
import { statCap } from '@/lib/utils/statUtils';

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

// Sum of base stats and stat bonuses contributed by equipped items,
// clamped per stat at the character's max (base*2 + (level-1)*4). NPCs
// have no items and no level-2 cap to hit, so they return unchanged.
//
// Item bonuses can be flat ("strength: 4") or percentage of the base
// stat ("strengthPct: 11" -> floor(base * 0.11)); both stack, then the
// cap is applied.
export function effectiveStats(combatant: any): EffectiveStats {
  const items = getEquippedItems(combatant as CharacterInterface);

  const sumKey = (key: string): number =>
    items.reduce((s, it) => s + (((it as any)[key] as number | undefined) ?? 0), 0);

  const level = combatant.level ?? 1;
  const compute = (statKey: string, base: number) => {
    const flat = sumKey(statKey);
    const pct = sumKey(statKey + 'Pct');
    const pctBonus = pct === 0 ? 0 : Math.floor(base * pct / 100);
    return Math.min(base + flat + pctBonus, statCap(base, level));
  };

  return {
    level,
    strength:     compute('strength',     combatant.strength ?? 5),
    endurance:    compute('endurance',    combatant.endurance ?? 5),
    agility:      compute('agility',      combatant.agility ?? 5),
    dexterity:    compute('dexterity',    combatant.dexterity ?? 5),
    intelligence: compute('intelligence', combatant.intelligence ?? 5),
    charisma:     compute('charisma',     combatant.charisma ?? 5),
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
  // Aggregated affix bonuses surfaced for combatBreakdown.
  blockChanceBonus: number;
  critChanceBonus: number;
  healthBonus: number;
}

export function calculateCombatStats(character: CharacterInterface): CombatStats {
  const items = getEquippedItems(character);
  let armor = 0;
  let weaponMin = 0;
  let weaponMax = 0;
  let hasWeapon = false;
  let damageBonus = 0;       // flat affix bonus added to weapon damage
  let blockChanceBonus = 0;  // % added to block chance
  let critChanceBonus = 0;   // % added to crit chance
  let healthBonus = 0;       // flat HP bonus from affixes

  for (const it of items) {
    armor += it.armor ?? 0;
    if (it.damage && it.damage.length === 2) {
      weaponMin += it.damage[0];
      weaponMax += it.damage[1];
      hasWeapon = true;
    }
    damageBonus      += (it as any).damageBonus       ?? 0;
    blockChanceBonus += (it as any).blockChanceBonus  ?? 0;
    critChanceBonus  += (it as any).critChanceBonus   ?? 0;
    healthBonus      += (it as any).health            ?? 0;
  }

  // Use effective strength (base + item bonuses) so a strength ring lifts
  // the displayed damage too.
  const eff = effectiveStats(character);

  // NPCs carry their own intrinsic armor and damage in the expedition
  // table (matching the real-game enemy sheets). Apply them when the
  // combatant has no equipped contributions in that slot.
  const npc = character as any;
  let damageIsIntrinsic = false;

  if (armor === 0 && Array.isArray(npc.armor) && npc.armor.length >= 2) {
    armor = Math.floor((npc.armor[0] + npc.armor[npc.armor.length - 1]) / 2);
  }

  if (!hasWeapon && Array.isArray(npc.damage) && npc.damage.length >= 2) {
    weaponMin = npc.damage[0];
    weaponMax = npc.damage[npc.damage.length - 1];
    hasWeapon = true;
    damageIsIntrinsic = true;
  }

  if (!hasWeapon) {
    // Unarmed scales gently with strength so high-level NPCs without
    // weapons aren't reduced to a 0-2 punch.
    weaponMin = UNARMED_DAMAGE_MIN;
    weaponMax = Math.max(2, Math.floor(eff.strength * 0.15));
  }

  // Intrinsic NPC damage is already a final range from the enemy sheet,
  // so don't stack the strength bonus on top of it. Player weapons get
  // both the strBonus and any affix damageBonus rolled onto rings /
  // amulets / weapons themselves.
  const strBonus = damageIsIntrinsic ? 0 : Math.floor(eff.strength / 10);
  const flatDamageAdd = damageIsIntrinsic ? 0 : damageBonus;

  return {
    armor,
    weaponMin: weaponMin + flatDamageAdd,
    weaponMax: weaponMax + flatDamageAdd,
    hasWeapon,
    strBonus,
    damageMin: weaponMin + flatDamageAdd + strBonus,
    damageMax: weaponMax + flatDamageAdd + strBonus,
    blockChanceBonus,
    critChanceBonus,
    healthBonus,
  };
}
