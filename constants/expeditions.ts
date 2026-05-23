export type Country = 'italy' | 'africa' | 'germania' | 'britannia';

export interface CountryInfo {
  id: Country;
  name: string;
  // Player level required to travel here.
  entryLevel: number;
  // One-time gold paid to switch from another country to this one.
  // Italy is the starting country -- travel back is always free.
  travelCost: number;
  blurb: string;
}

export const COUNTRIES: Record<Country, CountryInfo> = {
  italy: {
    id: 'italy',
    name: 'Italy',
    entryLevel: 1,
    travelCost: 0,
    blurb: 'Home is home. The wilderness around Rome is where every gladiator starts.',
  },
  africa: {
    id: 'africa',
    name: 'Africa',
    entryLevel: 20,
    travelCost: 1250,
    blurb: 'The continent of voodoo tribes, blood caves and lost harbours. First step outside the Empire.',
  },
  germania: {
    id: 'germania',
    name: 'Germania',
    entryLevel: 40,
    travelCost: 4250,
    blurb: 'Cursed forests, death hills and dragon remains. Dark, advanced expedition territory.',
  },
  britannia: {
    id: 'britannia',
    name: 'Britannia',
    entryLevel: 120,
    travelCost: 6750,
    blurb: 'Endgame frontier. Forest fortresses, moors and the ritual island of Mona.',
  },
};

export const COUNTRY_ORDER: Country[] = ['italy', 'africa', 'germania', 'britannia'];

export interface ExpeditionInfo {
  name: string;
  id: string;
  country: Country;
  description: string;
  intro?: string;
  entryLevel?: number;
  enemyLevels?: string;
  realLevel?: string;
  additionalInfo?: string;
}

export interface Expeditions {
  [key: string]: ExpeditionInfo;
}

export const expeditions: Expeditions = {
  // ----- Italy -----
  grimwood: {
    name: 'Grimwood',
    id: 'grimwood',
    country: 'italy',
    intro: "Grimwood is the first expedition in the game. Do not get fooled by it -- it hides some fearsome animals. Rat is really weak but Lynx is far stronger and the gap doesn't scale exponentially. Same goes for Wolf and Bear: don't expect to start farming them anytime soon.",
    description: "If you believe what the old people say around here, there once lived a very popular king in this wood. The wood's original name has been long forgotten and is now only known as Grimwood. Rumour has it that this king made a pact with the dark side so he could continue to reign forever. Grimwood is an extremely sinister place, full of wild animals and impenetrable brushwood. Countless hunters and lumberjacks went too deep into the woods, never to be seen again. If you believe the gossip, the old king took them into his lair so they could serve him for all eternity.",
    entryLevel: 1,
    enemyLevels: '1-10',
    realLevel: '1',
    additionalInfo: "This is the first dungeon, so Rat is really easy. Lynx can be easy too, but its level swings from 2 to 5 -- a level-5 Lynx's stats can be too much for a beginner, so don't fall into despair if you lose some battles against it. Wolf is also strong, so don't expect to defeat him properly before level 5. Bear is really profitable if you can start beating it early (before level 8) -- the gold reward and experience are high.",
  },
  pirateharbour: {
    name: 'Pirate Harbour',
    id: 'pirateharbour',
    country: 'italy',
    intro: "Pirate Harbour is the second expedition in the game and it's only 5 levels away. However 5 levels might be too quick.",
    description: "On the coast in the south-east there is a pirate harbour. There are a lot of shady characters and goods that would be forbidden elsewhere. Uninvited guests aren't welcome.",
    entryLevel: 5,
    enemyLevels: '8-17',
    realLevel: '7-8',
  },
  mistymountains: {
    name: 'Misty Mountains',
    id: 'mistymountains',
    country: 'italy',
    intro: "Misty Mountains is the third expedition in the game and it opens up at level 10 -- but not really doable at level 10.",
    description: "The highest pinnacles of the Misty Mountains are hidden from the eyes of wanderers, lost behind the thick clouds surrounding them. Monsters in the caves on the southern slopes long for human meat.",
    entryLevel: 10,
    enemyLevels: '15-23',
    realLevel: '14-15',
  },
  wolfcave: {
    name: 'Wolf Cave',
    id: 'wolfcave',
    country: 'italy',
    intro: 'Wolf Cave is the fourth expedition in the game and it allows you to enter at level 15.',
    description: "In the hills south of the barbarian village there is a cave system that the townsfolk call Wolf Cave. As the name suggests, a large pack of wolves live there which often attacks the surrounding farms during harsh winters.",
    entryLevel: 15,
    enemyLevels: '22-31',
    realLevel: '19',
  },
  ancienttemple: {
    name: 'Ancient Temple',
    id: 'ancienttemple',
    country: 'italy',
    intro: "Ancient Temple is the long awaited return of our glorious gladiator to Italy.",
    description: "It is long forgotten for which God this temple was erected. Nonetheless, the old, simple ruin still has an aura of mysticism and power.",
    entryLevel: 60,
    enemyLevels: '70-78',
    realLevel: '60',
  },
  barbarianvillage: {
    name: 'Barbarian Village',
    id: 'barbarianvillage',
    country: 'italy',
    description: "In the far east there is a barbarian village where barbarians live who have not yet acknowledged the greatness of the Roman Empire.",
    entryLevel: 65,
    enemyLevels: '75-83',
    realLevel: '65',
  },
  banditcamp: {
    name: 'Bandit Camp',
    id: 'banditcamp',
    country: 'italy',
    description: "Near the city, hidden in the southern foothills of the Misty Mountains, there is a bandit camp. Bandits, smugglers, thieves and other outlaws bustle around there.",
    entryLevel: 70,
    enemyLevels: '80-88',
    realLevel: '70',
  },

  // ----- Africa -----
  voodootemple: {
    name: 'Voodoo Temple',
    id: 'voodootemple',
    country: 'africa',
    description: 'A jungle clearing thick with chanting, drums and old gods. The voodoo priests welcome strangers exactly the wrong way. Seth Priest is extremely strong for the level bracket.',
    entryLevel: 20,
    enemyLevels: '30-38',
    realLevel: '25',
  },
  bridge: {
    name: 'Bridge',
    id: 'bridge',
    country: 'africa',
    description: 'A rope bridge over a deep gorge. Tribal warriors hold both ends and demand toll in blood. Tax Collector is the preferred farm; Bone Shaman is the spike.',
    entryLevel: 25,
    enemyLevels: '35-43',
    realLevel: '30',
  },
  bloodcave: {
    name: 'Blood Cave',
    id: 'bloodcave',
    country: 'africa',
    description: 'A coppery stench seeps from a crack in the cliffs. Inside, ritual circles glisten and venomous things scuttle. Giant Beetle\'s armour is the main difficulty spike.',
    entryLevel: 30,
    enemyLevels: '40-48',
    realLevel: '35',
  },
  lostharbour: {
    name: 'Lost Harbour',
    id: 'lostharbour',
    country: 'africa',
    description: 'An abandoned trading port turned smuggler nest. Rotten piers, salt-bleached crates and very nervous guards. Mokele Mbembe\'s armour is brutal for the bracket.',
    entryLevel: 35,
    enemyLevels: '45-53',
    realLevel: '40',
  },
  umpoktatribe: {
    name: 'Umpokta Tribe',
    id: 'umpoktatribe',
    country: 'africa',
    description: 'A high-level tribal command perched on a sun-baked plateau. War paint, bone armour and discipline.',
    entryLevel: 75,
    enemyLevels: '85-93',
    realLevel: '80',
  },
  caravan: {
    name: 'Caravan',
    id: 'caravan',
    country: 'africa',
    description: 'A heavily-guarded merchant caravan crawling through the dunes. Generous gold, relatively low armour on several enemies.',
    entryLevel: 80,
    enemyLevels: '90-97',
    realLevel: '85',
  },
  mesoaoasis: {
    name: 'Mesoai Oasis',
    id: 'mesoaoasis',
    country: 'africa',
    description: 'Palms, mirrored water, and the kind of predators that learnt to wait at the only waterhole for a hundred miles. Demon Elephant drops high item levels.',
    entryLevel: 85,
    enemyLevels: '95-102',
    realLevel: '90',
  },
  cliffjumper: {
    name: 'Cliff Jumper',
    id: 'cliffjumper',
    country: 'africa',
    description: 'A vertical cliff that locals leap from to prove their worth. The beasts at the bottom thank them. High Shaman is the top Africa enemy.',
    entryLevel: 90,
    enemyLevels: '100-107',
    realLevel: '95',
  },

  // ----- Germania -----
  cavetemple: {
    name: 'Cave Temple',
    id: 'cavetemple',
    country: 'germania',
    description: 'A pitch-black shrine cut into the rock. Cultists chant for things best left undisturbed. Soulless is brutal -- 8-9k armour and very high damage.',
    entryLevel: 40,
    enemyLevels: '50-58',
    realLevel: '45',
  },
  greenforest: {
    name: 'The Green Forest',
    id: 'greenforest',
    country: 'germania',
    description: 'Old growth so dense the canopy never lets the sun reach the floor. Werebear is a divine-damage spike that hits like a level-100 creature.',
    entryLevel: 45,
    enemyLevels: '55-63',
    realLevel: '50',
  },
  cursedvillage: {
    name: 'Cursed Village',
    id: 'cursedvillage',
    country: 'germania',
    description: 'A settlement that should not still be inhabited. Hun is soft; Ancient and Nachzehrer get unpleasant; Abomination is a tank.',
    entryLevel: 50,
    enemyLevels: '60-68',
    realLevel: '55',
  },
  deathhill: {
    name: 'Death Hill',
    id: 'deathhill',
    country: 'germania',
    description: 'Centuries of graves piled high. Whatever was buried up here is not staying buried. A fairly easy Germania zone -- a strong level-55 can already farm Lich.',
    entryLevel: 55,
    enemyLevels: '65-72',
    realLevel: '60',
  },
  vandalvillage: {
    name: 'Vandal Village',
    id: 'vandalvillage',
    country: 'germania',
    description: 'Hardened raiders returned home with Roman scars. Vandal Warrior / Jarl are softer; Dark Fighter and Death Knight stack enormous armour.',
    entryLevel: 95,
    enemyLevels: '104-110',
    realLevel: '100',
  },
  mine: {
    name: 'Mine',
    id: 'mine',
    country: 'germania',
    description: 'A working ore mine. The friendliest Germania zone -- softer enemies, great treasure, and the start of serious orange-tier item farming.',
    entryLevel: 100,
    enemyLevels: '108-114',
    realLevel: '104',
  },
  teutoncamp: {
    name: 'Teuton Camp',
    id: 'teutoncamp',
    country: 'germania',
    description: 'A barbarian war-camp, noticeably harder than the Mine. Seidr stands out for monstrous agility and damage.',
    entryLevel: 104,
    enemyLevels: '112-118',
    realLevel: '108',
  },
  komanmountain: {
    name: 'Koman Mountain',
    id: 'komanmountain',
    country: 'germania',
    description: 'One of the key high-level farming zones. Dragon drops in the 120+ item-level range and is the prime end-game boss target.',
    entryLevel: 108,
    enemyLevels: '116-122',
    realLevel: '112',
  },
  dragonremains: {
    name: 'Dragon Remains',
    id: 'dragonremains',
    country: 'germania',
    description: 'The bones are bigger than your house and something still scavenges through them. The final Germania zone -- Dracolich is the highest boss and the loot scales accordingly.',
    entryLevel: 112,
    enemyLevels: '120-126',
    realLevel: '116',
  },

  // ----- Britannia -----
  bankofthames: {
    name: 'Bank of Thames',
    id: 'bankofthames',
    country: 'britannia',
    description: 'A muddy invasion beachhead. The first Britannia foothold -- Bibroci, Ancalite and Cenimagni guard the bank, and the Cassi chieftain holds it.',
    entryLevel: 120,
    enemyLevels: '134-137',
    realLevel: '125',
  },
  forestfortress: {
    name: 'Forest Fortress',
    id: 'forestfortress',
    country: 'britannia',
    description: 'A wooden stronghold buried under canopy. Forest Elf and Dwarf hold the perimeter, British Chariot patrols the path, and Callirius rules within.',
    entryLevel: 130,
    enemyLevels: '140-146',
    realLevel: '135',
  },
  themoor: {
    name: 'The Moor',
    id: 'themoor',
    country: 'britannia',
    description: 'Fog so thick you can chew it. Lindow Man, Lindow Woman and Bandit hunt the mire; Nodens is the moor\'s godlike boss.',
    entryLevel: 140,
    enemyLevels: '147-158',
    realLevel: '145',
  },
  campcassivellaunus: {
    name: 'Camp Cassivellaunus',
    id: 'campcassivellaunus',
    country: 'britannia',
    description: 'A Briton warlord\'s field camp. Chariot Rider, Mercenary and Fflur defend it; Cassivellaunus himself sits at its heart.',
    entryLevel: 150,
    enemyLevels: '163-167',
    realLevel: '155',
  },
  kent: {
    name: 'Kent',
    id: 'kent',
    country: 'britannia',
    description: 'Countryside long ago turned to a war region. Cingetorix, Segovax and Carvilius prowl the lanes; Taximagulus is the king of Kent.',
    entryLevel: 160,
    enemyLevels: '171-178',
    realLevel: '165',
  },
  theford: {
    name: 'The Ford',
    id: 'theford',
    country: 'britannia',
    description: 'A river crossing the Britons know far better than your scouts do. Bloodleech, Water Spider and Caratacus contest the bank; Togodumnus is the warlord.',
    entryLevel: 170,
    enemyLevels: '180-190',
    realLevel: '175',
  },
  camulodunum: {
    name: 'Camulodunum',
    id: 'camulodunum',
    country: 'britannia',
    description: 'Smouldering ruins of a once-Roman city. Town Guards, Trinovantes Settlers and Warriors pick over what is left; Caratacus returns as the city\'s boss.',
    entryLevel: 180,
    enemyLevels: '191-197',
    realLevel: '185',
  },
  cambria: {
    name: 'Cambria',
    id: 'cambria',
    country: 'britannia',
    description: 'Highland wilderness with bigger predators than reason permits. Deceangli, Caratacus and Silures rule the slopes; Ordovices is the highland boss.',
    entryLevel: 190,
    enemyLevels: '199-209',
    realLevel: '195',
  },
  monaisle: {
    name: 'Mona Isle',
    id: 'monaisle',
    country: 'britannia',
    description: 'The druids\' final stronghold and the highest-level expedition in Gladiatus. Bard, Seer and Druid contest every step; Antenociticus is the ritual island\'s god-king.',
    entryLevel: 200,
    enemyLevels: '211-216',
    realLevel: '205',
  },
};

// Convenience: every expedition slug belonging to a country, in
// player-visible order (ascending entry level).
export function expeditionsForCountry(country: Country): ExpeditionInfo[] {
  return Object.values(expeditions)
    .filter((e) => e.country === country)
    .sort((a, b) => (a.entryLevel ?? 0) - (b.entryLevel ?? 0));
}
