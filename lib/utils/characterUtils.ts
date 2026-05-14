import { CharacterInterface } from "@/lib/interfaces/character.interface";
import { effectiveStats } from "@/lib/utils/combatStats";

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

// Power rank reflects effective stats -- equipped items raise it just
// like trained stats do. NPCs have no equipment so this is their base.
export const calculatePower = (character: CharacterInterface | Defender) => {
  const s = effectiveStats(character);

  return (
    s.strength + s.endurance + s.agility + s.dexterity +
    s.intelligence + s.charisma + (s.level * 10)
  );
}