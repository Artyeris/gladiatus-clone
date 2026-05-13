// Item catalog. Add more entries below; the schema accepts any object that
// has at least { itemId, name, image, type, level, power, probability,
// width, height }. Optional fields: quality, prefix, suffix, damage,
// armor, stat bonuses, sellPrice, durability/conditioning, etc.
//
// Image filenames map to /public/items/<image>.webp. If the file is
// missing, the ItemImage wrapper falls back to a styled label so nothing
// breaks visually.

export const ITEM_PREFIXES = [
  'Sharp', 'Sturdy', 'Reinforced', 'Cursed', 'Hardened', 'Polished',
  'Vile', 'Ancient', 'Brutal', 'Soldier’s', 'Mighty', 'Savage', 'Swift',
];

export const ITEM_SUFFIXES = [
  'of the Bear', 'of the Wolf', 'of the Eagle', 'of Power',
  'of Vigor', 'of Endurance', 'of the Magus', 'of Cunning', 'of Storms',
];

export const TOP_PREFIXES = ['Heroic', 'Legendary', 'Mythic'];
export const TOP_SUFFIXES = ['of Champions', 'of the Gods', 'of Eternity'];

// Tiny helper to keep entries terse.
const w = (id: string, n: string, image: string, lvl: number, dmgMin: number, dmgMax: number, sellPrice: number, width = 1, height = 3, quality: any = 'common') =>
  ({
    itemId: id, name: n, image, type: 'mainHand', quality, level: lvl,
    damage: [dmgMin, dmgMax],
    power: dmgMax,
    probability: 10,
    sellPrice,
    durability: 5000 + lvl * 200, durabilityMax: 5000 + lvl * 200,
    conditioning: 1200 + lvl * 50, conditioningMax: 1200 + lvl * 50,
    width, height,
  });

const sh = (id: string, n: string, image: string, lvl: number, armor: number, sellPrice: number, quality: any = 'common', width = 2, height = 2) =>
  ({
    itemId: id, name: n, image, type: 'offHand', quality, level: lvl,
    armor, power: armor, probability: 15, sellPrice,
    durability: 4500 + lvl * 200, durabilityMax: 4500 + lvl * 200,
    width, height,
  });

const armor = (id: string, n: string, image: string, slot: any, lvl: number, ar: number, sellPrice: number, dims: [number, number], quality: any = 'common', extras: any = {}) =>
  ({
    itemId: id, name: n, image, type: slot, quality, level: lvl,
    armor: ar, power: ar, probability: 20, sellPrice,
    durability: 4500 + lvl * 200, durabilityMax: 4500 + lvl * 200,
    width: dims[0], height: dims[1],
    ...extras,
  });

const trinket = (id: string, n: string, image: string, slot: any, lvl: number, sellPrice: number, extras: any = {}, quality: any = 'green') =>
  ({
    itemId: id, name: n, image, type: slot, quality, level: lvl,
    power: 5, probability: 8, sellPrice,
    durability: 4000 + lvl * 100, durabilityMax: 4000 + lvl * 100,
    width: 1, height: 1,
    ...extras,
  });

export const items = {
  // ----- Daggers (1x2) -----
  short_dagger:    w('short_dagger',    'Short Dagger',    'short-dagger',  1, 1,  4,  20,  1, 2),
  gut_grazer:      w('gut_grazer',      'Gut Grazer',      'gut-grazer',    2, 2,  6,  60,  1, 2, 'green'),
  seax:            w('seax',            'Seax',            'seax',          3, 3,  7, 110,  1, 2, 'green_plus'),

  // ----- Short swords / Gladius (1x3) -----
  short_sword:     w('short_sword',     'Short Sword',     'short-sword',   1, 3,  5,  50),
  sharp_short_sword: { ...w('sharp_short_sword', 'Short Sword', 'short-sword', 2, 4, 7, 90, 1, 3, 'green'), prefix: 'Sharp', strength: 1 },
  gladius:         w('gladius',         'Gladius',         'gladius',       3, 4,  8, 140, 1, 3, 'green_plus'),
  long_sword:      w('long_sword',      'Long Sword',      'long-sword',    4, 5, 10, 220, 1, 3, 'blue'),
  runic_sword: { ...w('runic_sword',    'Runic Sword',     'runic-sword',   3, 5,  9, 210, 1, 3, 'blue'), suffix: 'of the Magus', intelligence: 2 },
  khopesh: { ...w('khopesh',            'Khopesh',         'khopesh',       4, 6, 11, 280, 1, 3, 'blue_plus'), agility: 2 },
  legendary_battle_axe: { ...w('legendary_battle_axe', 'Battle Axe', 'battle-axe', 8, 18, 26, 1800, 1, 3, 'orange'), prefix: 'Legendary', suffix: 'of Champions', strength: 4, agility: 2 },

  // ----- Axes (1x3) -----
  hand_axe:        w('hand_axe',        'Hand Axe',        'hand-axe',      1, 2,  6,  55, 1, 3),
  battle_axe:      w('battle_axe',      'Battle Axe',      'battle-axe',    3, 5,  9, 200, 1, 3, 'green_plus'),
  broad_axe:       w('broad_axe',       'Broad Axe',       'broad-axe',     5, 8, 14, 420, 1, 3, 'blue'),

  // ----- Hammers / Maces (1x3) -----
  mallet:          w('mallet',          'Mallet',          'mallet',        1, 2,  5,  45, 1, 3),
  war_hammer:      w('war_hammer',      'War Hammer',      'war-hammer',    4, 6, 12, 320, 1, 3, 'green_plus'),

  // ----- Spears / Polearms (1x4) -----
  spear:           w('spear',           'Spear',           'spear',         2, 3,  8, 120, 1, 4),
  trident:         w('trident',         'Trident',         'trident',       4, 5, 12, 360, 1, 4, 'green_plus'),
  halberd:         w('halberd',         'Halberd',         'halberd',       6, 9, 16, 720, 1, 4, 'blue'),

  // ----- Staves (1x4) -----
  battle_staff:    { ...w('battle_staff', 'Battle Staff',  'battle-staff',  3, 3,  9, 230, 1, 4, 'green'), intelligence: 3 },

  // ----- Shields / off-hand (2x2) -----
  planks:          sh('planks',          'Planks',          'planks',         1,  8,  30),
  wooden_shield:   sh('wooden_shield',   'Wooden Shield',   'wooden-shield',  1, 10,  40),
  reinforced_round_shield: { ...sh('reinforced_round_shield', 'Round Shield', 'round-shield', 3, 18, 240, 'green_plus'), prefix: 'Reinforced', endurance: 2 },
  kite_shield:     sh('kite_shield',     'Kite Shield',     'kite-shield',    4, 22, 360, 'blue'),
  tower_shield:    sh('tower_shield',    'Tower Shield',    'tower-shield',   6, 30, 720, 'blue_plus'),
  rock_of_aegis:   { ...sh('rock_of_aegis', 'Rock of Aegis', 'rock-of-aegis', 5, 28, 600, 'purple'), endurance: 3, strength: 2 },

  // ----- Helmets (head, 2x2) -----
  leather_cap:     armor('leather_cap',  'Leather Cap',     'leather-cap',     'head', 1,  3,  20, [2, 2]),
  plate_helmet:    armor('plate_helmet', 'Plate Helmet',    'plate-helmet',    'head', 1,  6,  40, [2, 2]),
  hardened_plate_helmet: armor('hardened_plate_helmet', 'Plate Helmet', 'plate-helmet', 'head', 4, 14, 380, [2, 2], 'blue_plus', { prefix: 'Hardened', suffix: 'of Vigor', endurance: 3 }),
  barbarian_helm:  armor('barbarian_helm', 'Barbarian Helm', 'barbarian-helm', 'head', 5, 16, 480, [2, 2], 'blue'),

  // ----- Chest armor (2x3) -----
  leather_armor:   armor('leather_armor', 'Leather Armor', 'leather-armor', 'chest', 1,  8,  50, [2, 3]),
  iron_chest:      armor('iron_chest',    'Iron Chest',    'iron-chest',    'chest', 1, 12,  60, [2, 3]),
  chain_mail:      armor('chain_mail',    'Chain Mail',    'chainmail.png', 'chest', 3, 18, 230, [2, 3], 'green_plus'),
  plate_armor:     armor('plate_armor',   'Plate Armor',   'plate-armor',   'chest', 5, 26, 540, [2, 3], 'blue'),
  vanguard_breastplate: armor('vanguard_breastplate', 'Vanguard Breastplate', 'vanguard-breastplate', 'chest', 6, 30, 760, [2, 3], 'blue_plus', { endurance: 2 }),

  // ----- Legs (2x2) -----
  leather_leggings:    armor('leather_leggings',   'Leather Leggings',   'leather-leggings',   'legs', 1,  4,  30, [2, 2]),
  chainmail_leggings:  armor('chainmail_leggings', 'Chainmail Leggings', 'chainmail-leggings', 'legs', 1,  6,  40, [2, 2]),
  plate_leggings:      armor('plate_leggings',     'Plate Leggings',     'plate-leggings',     'legs', 4, 14, 320, [2, 2], 'green_plus'),

  // ----- Boots (2x2) -----
  leather_boots:    armor('leather_boots',    'Leather Boots',    'leather-boots',    'boots', 1,  4,  30, [2, 2]),
  reinforced_boots: armor('reinforced_boots', 'Reinforced Boots', 'reinforced-boots', 'boots', 1,  6,  40, [2, 2]),
  swift_leather_boots: armor('swift_leather_boots', 'Leather Boots', 'leather-boots', 'boots', 2, 7, 140, [2, 2], 'green_plus', { prefix: 'Swift', suffix: 'of the Eagle', agility: 2 }),
  greaves:          armor('greaves',          'Greaves',          'greaves',          'boots', 4, 12, 300, [2, 2], 'green_plus'),

  // ----- Gloves (2x2) -----
  leather_gloves:   armor('leather_gloves',   'Leather Gloves',   'leather-gloves',   'gloves', 1,  3,  20, [2, 2]),
  brutal_iron_gauntlets: armor('brutal_iron_gauntlets', 'Iron Gauntlets', 'iron-gauntlets', 'gloves', 2, 8, 130, [2, 2], 'green', { prefix: 'Brutal', strength: 2 }),
  plate_gauntlets:  armor('plate_gauntlets',  'Plate Gauntlets',  'plate-gauntlets',  'gloves', 4, 12, 280, [2, 2], 'green_plus'),

  // ----- Cloak (2x2) -----
  travelers_cloak:  armor('travelers_cloak',  'Traveler’s Cloak', 'travelers-cloak', 'cloak', 1,  2,  25, [2, 2]),
  fur_mantle:       armor('fur_mantle',       'Fur Mantle',       'fur-mantle',       'cloak', 4, 10, 280, [2, 2], 'green'),

  // ----- Rings (1x1) -----
  ocher_ring:       trinket('ocher_ring',       'Ocher Ring',       'ocher-ring',       'ring', 1, 100, { strength: 2, intelligence: 3 }),
  ring_of_the_wolf: trinket('ring_of_the_wolf', 'Bone Ring',        'bone-ring',        'ring', 3, 220, { suffix: 'of the Wolf', agility: 3, dexterity: 2 }, 'blue'),
  gold_ring:        trinket('gold_ring',        'Gold Ring',        'gold-ring',        'ring', 5, 380, { charisma: 4 }, 'blue_plus'),

  // ----- Amulets / necklaces (1x1) -----
  choker_of_shielding: trinket('choker_of_shielding', 'Choker of Shielding', 'choker-of-shielding', 'necklace', 1, 100, { armor: 5, endurance: 5 }),
  heart_of_primal_winter: trinket('heart_of_primal_winter', 'Heart of Primal Winter', 'heart-of-primal-winter', 'necklace', 4, 480, { strength: 5, dexterity: 3 }, 'purple_plus'),
  amulet_of_storms: trinket('amulet_of_storms', 'Amulet', 'amulet', 'necklace', 5, 540, { suffix: 'of Storms', intelligence: 4 }, 'purple'),
};
