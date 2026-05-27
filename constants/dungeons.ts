// Italy dungeon definitions. Order in this file is the unlock chain.
// Phase 1 keeps the data shape minimal -- no quest steps, no advanced
// difficulty toggle (each dungeon is a single "enter" action). Future
// phases can add `steps`, `requiredDungeonId`, etc.

import type { Country } from '@/constants/expeditions';

export type DungeonId =
  | 'gustavos_country_house'
  | 'on_the_run'
  | 'dragon_stronghold'
  | 'cave_of_dark_intrigue'
  | 'hidden_grave'
  | 'in_enemy_hands'
  | 'last_resort'
  | 'true_owner'
  | 'gioll_passage'
  | 'zagrashs_fort';

export interface DungeonInfo {
  id: DungeonId;
  name: string;
  country: Country;
  parentExpedition: string;
  entryLevel: number;
  bossName: string;
  bossLevel: number;
  description: string;
  // Gold and XP awarded on a successful clear (boss item is rolled
  // separately by the drop system).
  goldReward: number;
  xpReward: number;
}

export const DUNGEONS: Record<DungeonId, DungeonInfo> = {
  gustavos_country_house: {
    id: 'gustavos_country_house',
    name: "Gustavo's Country House",
    country: 'italy',
    parentExpedition: 'grimwood',
    entryLevel: 10,
    bossName: 'King Gustavo',
    bossLevel: 10,
    description: 'A first taste of dungeon work. King Gustavo holds a small country house in the Grimwood -- shake him loose for the chest in the back room.',
    goldReward: 300,
    xpReward: 25,
  },
  on_the_run: {
    id: 'on_the_run',
    name: 'On the Run',
    country: 'italy',
    parentExpedition: 'pirateharbour',
    entryLevel: 10,
    bossName: 'Gnaeus Aurelius Flavio',
    bossLevel: 15,
    description: 'A longer hunt through the Pirate Harbour back alleys after the disgraced senator Flavio.',
    goldReward: 600,
    xpReward: 60,
  },
  dragon_stronghold: {
    id: 'dragon_stronghold',
    name: 'The Dragon Stronghold',
    country: 'italy',
    parentExpedition: 'mistymountains',
    entryLevel: 10,
    bossName: 'Oribas',
    bossLevel: 20,
    description: 'A spike in difficulty hidden behind the Misty Mountains. Oribas is the first dungeon boss that demands real gear.',
    goldReward: 900,
    xpReward: 110,
  },
  cave_of_dark_intrigue: {
    id: 'cave_of_dark_intrigue',
    name: 'The Cave of Dark Intrigue',
    country: 'italy',
    parentExpedition: 'wolfcave',
    entryLevel: 15,
    bossName: 'Hell Dog',
    bossLevel: 25,
    description: 'Deep in the Wolf Cave the pack answers to a darker master. Hell Dog rounds out the early Italy chain.',
    goldReward: 1300,
    xpReward: 200,
  },
  hidden_grave: {
    id: 'hidden_grave',
    name: 'Hidden Grave',
    country: 'italy',
    parentExpedition: 'ancienttemple',
    entryLevel: 60,
    bossName: 'Nekromar',
    bossLevel: 70,
    description: 'Return to the Ancient Temple. Nekromar broke the seals -- put them back.',
    goldReward: 5000,
    xpReward: 1200,
  },
  in_enemy_hands: {
    id: 'in_enemy_hands',
    name: 'In Enemy Hands',
    country: 'italy',
    parentExpedition: 'barbarianvillage',
    entryLevel: 65,
    bossName: 'Trakovar',
    bossLevel: 75,
    description: 'Roman captives are dragged into the Barbarian Village. Trakovar holds the gate.',
    goldReward: 6500,
    xpReward: 1500,
  },
  last_resort: {
    id: 'last_resort',
    name: 'The Last Resort',
    country: 'italy',
    parentExpedition: 'pirateharbour',
    entryLevel: 68,
    bossName: 'Captain Kratos',
    bossLevel: 78,
    description: 'A return run on the Pirate Harbour, scaled up. Captain Kratos has shored up the docks since your last visit.',
    goldReward: 7500,
    xpReward: 1700,
  },
  true_owner: {
    id: 'true_owner',
    name: 'The True Owner',
    country: 'italy',
    parentExpedition: 'mistymountains',
    entryLevel: 70,
    bossName: 'Gernasch',
    bossLevel: 80,
    description: 'The mountains never were yours to clear. Gernasch is the one who lets things live up here.',
    goldReward: 8500,
    xpReward: 2000,
  },
  gioll_passage: {
    id: 'gioll_passage',
    name: 'Gioll Passage',
    country: 'italy',
    parentExpedition: 'wolfcave',
    entryLevel: 73,
    bossName: 'Fenrirson',
    bossLevel: 83,
    description: 'Beyond the Wolf Cave, the passage to Gioll opens. Fenrirson guards the threshold.',
    goldReward: 9500,
    xpReward: 2300,
  },
  zagrashs_fort: {
    id: 'zagrashs_fort',
    name: "Zagrash's Fort",
    country: 'italy',
    parentExpedition: 'barbarianvillage',
    entryLevel: 78,
    bossName: 'Zagrash',
    bossLevel: 88,
    description: "The Italy roadblock -- a fortified barbarian camp. Zagrash himself is a gear-check for everything after.",
    goldReward: 12000,
    xpReward: 3000,
  },
};

export const DUNGEON_ORDER: DungeonId[] = [
  'gustavos_country_house',
  'on_the_run',
  'dragon_stronghold',
  'cave_of_dark_intrigue',
  'hidden_grave',
  'in_enemy_hands',
  'last_resort',
  'true_owner',
  'gioll_passage',
  'zagrashs_fort',
];

export function dungeonsForCountry(country: Country): DungeonInfo[] {
  return DUNGEON_ORDER
    .map((id) => DUNGEONS[id])
    .filter((d) => d.country === country);
}
