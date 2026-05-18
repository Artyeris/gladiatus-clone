import { CharacterInterface } from "@/lib/interfaces/character.interface";
import { calculateCombatStats, effectiveStats } from "@/lib/utils/combatStats";

export function calculateExperience(level: number) {
  return 10 * (level + 1) - 15;
}

interface Defender {
  agility: number;
  charisma: number;
  strength: number;
  endurance: number;
  dexterity: number;
  intelligence: number;
  image: string;
  name: string;
  level: number;
  crowns?: number[] | undefined;
  xp?: number[] | undefined;
  gender: string;
  power: number;
  _id?: number | undefined;
}

// Power rank reflects effective stats and gear. Stats include their
// item bonuses (effectiveStats), and equipped weapon/armour add their
// own contribution on top: avg(weapon damage) and armor value. NPCs
// without an equipment field still benefit from any inline damage/armor
// fields on the enemy template via calculateCombatStats.
export const calculatePower = (character: CharacterInterface | Defender) => {
  const s = effectiveStats(character);
  let weaponArmorBonus = 0;
  try {
    const c = calculateCombatStats(character as any);
    const avgWeapon = Math.round((c.weaponMin + c.weaponMax) / 2);
    weaponArmorBonus = avgWeapon + c.armor;
  } catch {
    weaponArmorBonus = 0;
  }

  return (
    s.strength + s.endurance + s.agility + s.dexterity +
    s.intelligence + s.charisma + (s.level * 10) + weaponArmorBonus
  );
}