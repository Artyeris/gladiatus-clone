import { EnemyStatsInterface } from "@/lib/interfaces/enemy.interface";

interface ExpeditionEnemies {
  [key: string]: Record<string, EnemyStatsInterface>;
}

export const expeditionEnemies: ExpeditionEnemies = {
  grimwood: {
    rat: {
      name: 'Rat',
      image: 'rat',
      level: [1, 2],
      strength: [1, 2],
      endurance: [2, 2],
      dexterity: [3, 3],
      agility: [4, 4],
      intelligence: [2, 2],
      charisma: [3, 3],
      experience: [1, 1],
      crowns: [26, 72],
      armor: [22, 56],
      damage: [1, 2],
      items: ['short_sword'],
      id: 0,
    },
    lynx: {
      name: 'Lynx',
      image: 'lynx',
      level: [2, 3, 4, 5],
      strength: [3, 5, 7, 8],
      endurance: [3, 5, 7, 9],
      dexterity: [6, 10, 13, 16],
      agility: [8, 14, 18, 21],
      intelligence: [2, 4, 6, 7],
      charisma: [6, 9, 12, 15],
      experience: [1, 1],
      crowns: [68, 176],
      armor: [50, 123],
      damage: [2, 6],
      id: 1,
    },
    wolf: {
      name: 'Wolf',
      image: 'wolf',
      level: [4, 5, 6, 7, 8],
      strength: [9, 11, 14, 17, 19],
      endurance: [7, 9, 10, 12, 14],
      dexterity: [11, 14, 17, 20, 22],
      agility: [14, 18, 22, 24, 28],
      intelligence: [5, 7, 8, 10, 11],
      charisma: [12, 15, 18, 21, 25],
      experience: [1, 3],
      crowns: [116, 261],
      armor: [116, 234],
      damage: [3, 9],
      id: 2,
    },
    bear: {
      name: 'Bear',
      image: 'bear',
      level: [8, 9, 10],
      strength: [28, 32, 36],
      endurance: [24, 27, 30],
      dexterity: [14, 16, 17],
      agility: [22, 25, 28],
      intelligence: [12, 14, 16],
      charisma: [22, 25, 28],
      experience: [3, 3],
      crowns: [293, 383],
      armor: [401, 591],
      damage: [12, 18],
      boss: true,
      id: 4,
    },
  },
  pirateharbour: {
    fled_slave: {
      name: 'Fled Slave',
      image: 'fled_slave',
      level: [8, 9],
      strength: [16, 18],
      endurance: [17, 19],
      dexterity: [22, 24],
      agility: [30, 34],
      intelligence: [14, 16],
      charisma: [16, 18],
      experience: [2, 2],
      crowns: [185, 339],
      armor: [220, 286],
      damage: [7, 10],
      id: 5,
    },
    corrupt_soldier: {
      name: 'Corrupt Soldier',
      image: 'corrupt_soldier',
      level: [9, 10, 11, 12],
      strength: [12, 13, 15, 16],
      endurance: [19, 21, 24, 26],
      dexterity: [18, 20, 22, 24],
      agility: [31, 35, 38, 42],
      intelligence: [19, 21, 23, 26],
      charisma: [28, 31, 34, 37],
      experience: [2, 2],
      crowns: [238, 390],
      armor: [325, 459],
      damage: [9, 15],
      id: 6,
    },
    assassin: {
      name: 'Assassin',
      image: 'assassin',
      level: [11, 12, 13, 14, 15],
      strength: [17, 19, 21, 23, 24],
      endurance: [17, 19, 21, 22, 24],
      dexterity: [33, 36, 39, 42, 45],
      agility: [53, 58, 63, 68, 73],
      intelligence: [22, 24, 26, 28, 30],
      charisma: [19, 21, 23, 24, 26],
      experience: [2, 2],
      crowns: [293, 599],
      armor: [339, 457],
      damage: [11, 19],
      id: 7,
    },
    captain: {
      name: 'Captain',
      image: 'captain',
      level: [15, 16, 17],
      strength: [27, 28, 30],
      endurance: [36, 38, 40],
      dexterity: [41, 43, 46],
      agility: [63, 67, 71],
      intelligence: [39, 42, 44],
      charisma: [47, 50, 53],
      experience: [3, 3],
      crowns: [480, 716],
      armor: [466, 730],
      damage: [23, 32],
      boss: true,
      id: 8,
    },
  },
  mistymountains: {
    elusive_recruit: {
      name: 'Elusive Recruit',
      image: 'elusive_recruit',
      level: [15, 16],
      strength: [42, 44],
      endurance: [42, 44],
      dexterity: [30, 32],
      agility: [42, 44],
      intelligence: [21, 22],
      charisma: [26, 28],
      experience: [2, 3],
      crowns: [397, 649],
      armor: [500, 607],
      damage: [13, 21],
      id: 9,
    },
    harpy: {
      name: 'Harpy',
      image: 'harpy',
      level: [15, 16, 17, 18, 19],
      strength: [25, 26, 27, 29, 30],
      endurance: [35, 37, 39, 40, 41],
      dexterity: [36, 38, 39, 41, 42],
      agility: [67, 70, 73, 76, 79],
      intelligence: [28, 30, 31, 33, 34],
      charisma: [56, 59, 62, 64, 66],
      experience: [2, 2],
      crowns: [409, 772],
      armor: [607, 753],
      damage: [19, 27],
      id: 10,
    },
    cerberus: {
      name: 'Cerberus',
      image: 'cerberus',
      level: [18, 19, 20, 21, 22],
      strength: [43, 46, 48, 50, 52],
      endurance: [46, 49, 52, 54, 57],
      dexterity: [58, 62, 65, 68, 71],
      agility: [44, 46, 48, 50, 53],
      intelligence: [14, 15, 16, 16, 17],
      charisma: [94, 100, 106, 111, 115],
      experience: [2, 3],
      crowns: [501, 938],
      armor: [750, 1433],
      damage: [22, 33],
      id: 11,
    },
    medusa: {
      name: 'Medusa',
      image: 'medusa',
      level: [22, 23],
      strength: [39, 41],
      endurance: [52, 55],
      dexterity: [82, 86],
      agility: [100, 104],
      intelligence: [52, 55],
      charisma: [115, 120],
      experience: [3, 4],
      crowns: [798, 1185],
      armor: [1405, 1708],
      damage: [33, 43],
      boss: true,
      id: 12,
    },
  },
  wolfcave: {
    wild_boar: {
      name: 'Wild Boar',
      image: 'wild_boar',
      level: [22, 23],
      strength: [48, 50],
      endurance: [57, 59],
      dexterity: [33, 34],
      agility: [46, 48],
      intelligence: [13, 13],
      charisma: [46, 48],
      experience: [2, 3],
      crowns: [610, 919],
      armor: [2018, 2524],
      damage: [40, 52],
      id: 13,
    },
    wolf_pack: {
      name: 'Wolf Pack',
      image: 'wolf_pack',
      level: [23, 24, 25, 26],
      strength: [36, 38, 39, 41],
      endurance: [41, 43, 44, 46],
      dexterity: [80, 84, 87, 91],
      agility: [96, 100, 105, 109],
      intelligence: [41, 43, 44, 46],
      charisma: [64, 67, 69, 72],
      experience: [3, 3],
      crowns: [624, 1145],
      armor: [764, 1683],
      damage: [42, 58],
      id: 14,
    },
    alphawolf: {
      name: 'Alphawolf',
      image: 'alphawolf',
      level: [26, 27, 28, 29],
      strength: [57, 59, 61, 63],
      endurance: [52, 54, 56, 58],
      dexterity: [97, 101, 104, 108],
      agility: [118, 122, 127, 131],
      intelligence: [46, 48, 50, 52],
      charisma: [109, 113, 117, 121],
      experience: [3, 3],
      crowns: [784, 1319],
      armor: [1414, 1650],
      damage: [52, 71],
      id: 15,
    },
    werewolf: {
      name: 'Werewolf',
      image: 'werewolf',
      level: [29, 30, 31],
      strength: [92, 96, 99],
      endurance: [104, 108, 111],
      dexterity: [94, 97, 100],
      agility: [121, 126, 130],
      intelligence: [58, 60, 62],
      charisma: [142, 147, 151],
      experience: [4, 5],
      crowns: [1100, 1594],
      armor: [2749, 3077],
      damage: [66, 87],
      boss: true,
      id: 16,
    },
  },
  ancienttemple: {
    cultist_guard: {
      name: 'Cultist Guard',
      image: 'cultist_guard',
      level: [70, 71],
      strength: [154, 156],
      endurance: [140, 142],
      dexterity: [140, 142],
      agility: [196, 198],
      intelligence: [70, 71],
      charisma: [122, 124],
      experience: [6, 8],
      crowns: [2692, 4255],
      armor: [5987, 7371],
      damage: [118, 147],
      id: 25,
    },
    wererat: {
      name: 'Wererat',
      image: 'wererat',
      level: [71, 72, 73, 74],
      strength: [85, 86, 87, 88],
      endurance: [170, 172, 175, 177],
      dexterity: [266, 270, 273, 277],
      agility: [347, 352, 357, 362],
      intelligence: [127, 129, 131, 133],
      charisma: [149, 151, 153, 155],
      experience: [6, 8],
      crowns: [2728, 4240],
      armor: [3146, 3768],
      damage: [131, 167],
      id: 26,
    },
    minotaur: {
      name: 'Minotaur',
      image: 'minotaur',
      level: [73, 74, 75, 76, 77],
      strength: [262, 266, 270, 273, 277],
      endurance: [292, 296, 300, 304, 308],
      dexterity: [146, 148, 150, 152, 154],
      agility: [127, 129, 131, 132, 134],
      intelligence: [58, 59, 60, 60, 61],
      charisma: [332, 337, 341, 346, 350],
      experience: [6, 7],
      crowns: [3128, 4718],
      armor: [3311, 3887],
      damage: [179, 220],
      id: 27,
    },
    minotaur_chief: {
      name: 'Minotaur Chief',
      image: 'minotaur_chief',
      level: [76, 77, 78],
      strength: [380, 385, 390],
      endurance: [304, 308, 312],
      dexterity: [228, 231, 234],
      agility: [425, 431, 436],
      intelligence: [121, 123, 124],
      charisma: [372, 377, 382],
      experience: [9, 10],
      crowns: [3616, 5375],
      armor: [4980, 8778],
      damage: [187, 235],
      boss: true,
      id: 28,
    },
  },
  barbarianvillage: {
    barbarian: {
      name: 'Barbarian',
      image: 'barbarian',
      level: [75, 76],
      strength: [180, 182],
      endurance: [165, 167],
      dexterity: [168, 171],
      agility: [236, 239],
      intelligence: [45, 45],
      charisma: [157, 159],
      experience: [6, 8],
      crowns: [2932, 4339],
      armor: [3738, 4622],
      damage: [150, 186],
      id: 29,
    },
    barbarian_warrior: {
      name: 'Barbarian Warrior',
      image: 'barbarian_warrior',
      level: [76, 77, 78, 79],
      strength: [212, 215, 218, 221],
      endurance: [197, 200, 202, 205],
      dexterity: [171, 173, 175, 177],
      agility: [239, 242, 245, 248],
      intelligence: [106, 107, 109, 110],
      charisma: [266, 269, 273, 276],
      experience: [7, 8],
      crowns: [3412, 4431],
      armor: [3303, 4026],
      damage: [140, 179],
      id: 30,
    },
    berserker: {
      name: 'Berserker',
      image: 'berserker',
      level: [78, 79, 80, 81, 82],
      strength: [234, 237, 240, 243, 246],
      endurance: [218, 221, 223, 226, 229],
      dexterity: [292, 296, 299, 303, 307],
      agility: [218, 221, 223, 226, 229],
      intelligence: [109, 110, 111, 112, 114],
      charisma: [218, 221, 223, 226, 229],
      experience: [7, 9],
      crowns: [2983, 4752],
      armor: [2252, 2842],
      damage: [228, 294],
      id: 31,
    },
    barbarian_chief: {
      name: 'Barbarian Chief',
      image: 'barbarian_chief',
      level: [81, 82, 83],
      strength: [291, 294, 298],
      endurance: [324, 328, 332],
      dexterity: [364, 368, 373],
      agility: [453, 458, 464],
      intelligence: [178, 180, 182],
      charisma: [425, 430, 435],
      experience: [9, 10],
      crowns: [3899, 5601],
      armor: [5173, 6167],
      damage: [162, 203],
      boss: true,
      id: 32,
    },
  },
  banditcamp: {
    renegade_soldier: {
      name: 'Renegade Soldier',
      image: 'renegade_soldier',
      level: [80, 81],
      strength: [176, 178],
      endurance: [160, 162],
      dexterity: [180, 182],
      agility: [252, 255],
      intelligence: [64, 64],
      charisma: [140, 141],
      experience: [7, 8],
      crowns: [3080, 4716],
      armor: [6206, 7698],
      damage: [135, 168],
      id: 33,
    },
    renegade_mercenary: {
      name: 'Renegade Mercenary',
      image: 'renegade_mercenary',
      level: [81, 82, 83, 84],
      strength: [145, 147, 149, 151],
      endurance: [178, 180, 182, 184],
      dexterity: [162, 164, 166, 168],
      agility: [255, 258, 261, 264],
      intelligence: [178, 180, 182, 184],
      charisma: [226, 269, 312, 355],
      experience: [8, 9],
      crowns: [3435, 5213],
      armor: [7817, 9515],
      damage: [137, 174],
      id: 34,
    },
    assassinator: {
      name: 'Assassinator',
      image: 'assassinator',
      level: [83, 84, 85, 86, 87],
      strength: [116, 117, 118, 120, 121],
      endurance: [83, 84, 85, 86, 87],
      dexterity: [415, 420, 425, 430, 435],
      agility: [493, 499, 505, 511, 517],
      intelligence: [182, 184, 186, 189, 191],
      charisma: [145, 146, 148, 150, 152],
      experience: [8, 9],
      crowns: [3399, 5547],
      armor: [3613, 4264],
      damage: [242, 312],
      id: 35,
    },
    bandit_chief: {
      name: 'Bandit Chief',
      image: 'bandit_chief',
      level: [86, 87, 88],
      strength: [206, 208, 211],
      endurance: [240, 243, 246],
      dexterity: [430, 435, 440],
      agility: [602, 609, 616],
      intelligence: [223, 225, 228],
      charisma: [481, 486, 492],
      experience: [9, 11],
      crowns: [4258, 6910],
      armor: [5004, 6132],
      damage: [225, 282],
      boss: true,
      id: 36,
    },
  },
};

// ---------------------------------------------------------------------------
// Generated expedition enemies for the Africa / Germania / Britannia zones.
// Stat blocks are derived from the zone's entry level so each new expedition
// has 4 enemies (easy / medium / hard / boss) with sensible scaling.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Africa expedition enemies. Stat blocks transcribed from the
// gladiatus-bg fansite tables -- damage uses the first of the two
// reported damage ranges. Life / Crit / Block / Avoid Crit columns are
// dropped because the current combat engine derives HP from endurance
// and doesn't read crit/block fields off the enemy yet.
// ---------------------------------------------------------------------------
const AFRICA_ENEMIES: ExpeditionEnemies = {
  voodootemple: {
    cobra: {
      name: 'Cobra', image: 'cobra',
      level: [30, 31], crowns: [892, 1385], experience: [3, 4],
      strength: [30, 31], dexterity: [97, 100], agility: [115, 119],
      endurance: [54, 55], charisma: [73, 75], intelligence: [36, 37],
      armor: [1782, 1973], damage: [50, 62],
      id: 2000,
    },
    giant_scorpion: {
      name: 'Giant Scorpion', image: 'giant_scorpion',
      level: [32, 33], crowns: [1025, 1485], experience: [3, 4],
      strength: [70, 72], dexterity: [96, 99], agility: [156, 161],
      endurance: [51, 52], charisma: [56, 57], intelligence: [19, 19],
      armor: [3855, 4580], damage: [54, 66],
      id: 2001,
    },
    awakened_mummy: {
      name: 'Awakened Mummy', image: 'awakened_mummy',
      level: [33, 37], crowns: [1016, 1676], experience: [3, 4],
      strength: [99, 111], dexterity: [57, 64], agility: [57, 64],
      endurance: [165, 185], charisma: [92, 103], intelligence: [26, 29],
      armor: [3030, 3664], damage: [71, 87],
      id: 2002,
    },
    seth_priest: {
      name: 'Seth Priest', image: 'seth_priest',
      level: [36, 38], crowns: [1319, 2013], experience: [5, 5],
      strength: [43, 45], dexterity: [162, 171], agility: [239, 252],
      endurance: [64, 68], charisma: [302, 319], intelligence: [158, 167],
      armor: [1164, 1250], damage: [99, 122],
      boss: true, id: 2003,
    },
  },

  bridge: {
    tax_collector: {
      name: 'Tax Collector', image: 'tax_collector',
      level: [35, 36], crowns: [1049, 1728], experience: [3, 4],
      strength: [49, 50], dexterity: [70, 72], agility: [98, 100],
      endurance: [70, 72], charisma: [183, 189], intelligence: [70, 72],
      armor: [1279, 1408], damage: [37, 46],
      id: 2010,
    },
    man_eater: {
      name: 'Man Eater', image: 'man_eater',
      level: [37, 39], crowns: [1102, 1799], experience: [3, 4],
      strength: [103, 109], dexterity: [55, 58], agility: [77, 81],
      endurance: [111, 117], charisma: [129, 136], intelligence: [15, 15],
      armor: [3215, 3690], damage: [85, 104],
      id: 2011,
    },
    tribal_warrior: {
      name: 'Tribal Warrior', image: 'tribal_warrior',
      level: [38, 41], crowns: [1218, 1846], experience: [3, 4],
      strength: [98, 106], dexterity: [161, 174], agility: [239, 258],
      endurance: [83, 90], charisma: [93, 100], intelligence: [68, 73],
      armor: [1741, 1986], damage: [52, 64],
      id: 2012,
    },
    bone_shaman: {
      name: 'Bone Shaman', image: 'bone_shaman',
      level: [41, 43], crowns: [1613, 2490], experience: [5, 6],
      strength: [32, 34], dexterity: [231, 236], agility: [344, 361],
      endurance: [57, 60], charisma: [258, 270], intelligence: [172, 180],
      armor: [2080, 2115], damage: [113, 139],
      boss: true, id: 2013,
    },
  },

  bloodcave: {
    blood_wolf: {
      name: 'Blood Wolf', image: 'blood_wolf',
      level: [40, 41], crowns: [1237, 2012], experience: [4, 4],
      strength: [72, 73], dexterity: [110, 112], agility: [126, 129],
      endurance: [80, 82], charisma: [112, 114], intelligence: [56, 57],
      armor: [1437, 1617], damage: [67, 83],
      id: 2020,
    },
    giant_beetle: {
      name: 'Giant Beetle', image: 'giant_beetle',
      level: [41, 44], crowns: [1253, 1780], experience: [4, 5],
      strength: [139, 149], dexterity: [51, 55], agility: [43, 44],
      endurance: [106, 114], charisma: [114, 123], intelligence: [24, 26],
      armor: [5200, 6132], damage: [88, 108],
      id: 2021,
    },
    fire_dancer: {
      name: 'Fire Dancer', image: 'fire_dancer',
      level: [43, 47], crowns: [1402, 2419], experience: [4, 5],
      strength: [25, 28], dexterity: [193, 211], agility: [184, 197],
      endurance: [70, 75], charisma: [195, 213], intelligence: [154, 169],
      armor: [1234, 1614], damage: [94, 116],
      id: 2022,
    },
    fire_demon: {
      name: 'Fire Demon', image: 'fire_demon',
      level: [46, 48], crowns: [1720, 2772], experience: [5, 5],
      strength: [82, 84], dexterity: [184, 192], agility: [289, 302],
      endurance: [119, 124], charisma: [354, 369], intelligence: [248, 259],
      armor: [1667, 1920], damage: [70, 86],
      boss: true, id: 2023,
    },
  },

  lostharbour: {
    crocodile: {
      name: 'Crocodile', image: 'crocodile',
      level: [45, 46], crowns: [1585, 2690], experience: [4, 5],
      strength: [99, 101], dexterity: [90, 92], agility: [110, 112],
      endurance: [90, 92], charisma: [78, 80], intelligence: [27, 27],
      armor: [4145, 5034], damage: [90, 110],
      id: 2030,
    },
    undead_holder: {
      name: 'Undead Holder', image: 'undead_holder',
      level: [46, 49], crowns: [1548, 2418], experience: [4, 5],
      strength: [184, 196], dexterity: [46, 49], agility: [48, 51],
      endurance: [165, 176], charisma: [64, 68], intelligence: [27, 29],
      armor: [4919, 6134], damage: [92, 113],
      id: 2031,
    },
    giant_water_snake: {
      name: 'Giant Water Snake', image: 'giant_water_snake',
      level: [48, 52], crowns: [1632, 2750], experience: [4, 5],
      strength: [172, 187], dexterity: [144, 156], agility: [100, 109],
      endurance: [144, 156], charisma: [84, 91], intelligence: [76, 83],
      armor: [4765, 5685], damage: [88, 108],
      id: 2032,
    },
    mokele_mbembe: {
      name: 'Mokele Mbembe', image: 'mokele_mbembe',
      level: [48, 53], crowns: [2139, 3276], experience: [6, 7],
      strength: [163, 169], dexterity: [178, 185], agility: [196, 204],
      endurance: [183, 190], charisma: [232, 241], intelligence: [112, 116],
      armor: [7774, 9525], damage: [125, 154],
      boss: true, id: 2033,
    },
  },

  umpoktatribe: {
    umpokta_tribal_warrior: {
      name: 'Tribal Warrior', image: 'umpokta_tribal_warrior',
      level: [85, 86], crowns: [3476, 5459], experience: [7, 9],
      strength: [170, 172], dexterity: [191, 193], agility: [267, 271],
      endurance: [187, 189], charisma: [178, 180], intelligence: [102, 103],
      armor: [4353, 4794], damage: [157, 192],
      id: 2040,
    },
    tribal_magician: {
      name: 'Tribal Magician', image: 'tribal_magician',
      level: [86, 89], crowns: [3645, 5598], experience: [8, 9],
      strength: [120, 123], dexterity: [258, 267], agility: [423, 436],
      endurance: [103, 105], charisma: [421, 436], intelligence: [292, 302],
      armor: [1901, 2229], damage: [91, 113],
      id: 2041,
    },
    spirit_warrior: {
      name: 'Spirit Warrior', image: 'spirit_warrior',
      level: [89, 92], crowns: [3963, 5967], experience: [8, 10],
      strength: [160, 165], dexterity: [155, 161], agility: [125, 128],
      endurance: [356, 368], charisma: [249, 257], intelligence: [69, 73],
      armor: [20243, 23274], damage: [109, 134],
      id: 2042,
    },
    seth_high_priest: {
      name: 'Seth High Priest', image: 'seth_high_priest',
      level: [91, 93], crowns: [4650, 7326], experience: [10, 12],
      strength: [54, 55], dexterity: [318, 325], agility: [509, 520],
      endurance: [163, 167], charisma: [859, 878], intelligence: [418, 427],
      armor: [5127, 6049], damage: [208, 343],
      boss: true, id: 2043,
    },
  },

  caravan: {
    spy: {
      name: 'Spy', image: 'spy',
      level: [90, 91], crowns: [4376, 6152], experience: [9, 10],
      strength: [125, 127], dexterity: [292, 295], agility: [346, 350],
      endurance: [180, 182], charisma: [220, 222], intelligence: [144, 145],
      armor: [1898, 2355], damage: [152, 187],
      id: 2050,
    },
    caravan_guard: {
      name: 'Caravan Guard', image: 'caravan_guard',
      level: [91, 94], crowns: [3889, 6300], experience: [8, 10],
      strength: [236, 244], dexterity: [250, 258], agility: [382, 394],
      endurance: [218, 225], charisma: [286, 296], intelligence: [145, 150],
      armor: [4586, 5532], damage: [112, 137],
      id: 2051,
    },
    elite_guard: {
      name: 'Elite Guard', image: 'elite_guard',
      level: [93, 97], crowns: [3898, 6285], experience: [8, 10],
      strength: [204, 213], dexterity: [418, 436], agility: [651, 679],
      endurance: [223, 232], charisma: [195, 203], intelligence: [130, 135],
      armor: [2724, 3276], damage: [171, 210],
      id: 2052,
    },
    slave_merchant: {
      name: 'Slave Merchant', image: 'slave_merchant',
      level: [95, 97], crowns: [5388, 7796], experience: [10, 13],
      strength: [266, 271], dexterity: [403, 412], agility: [598, 611],
      endurance: [304, 310], charisma: [665, 679], intelligence: [301, 310],
      armor: [5443, 6649], damage: [160, 197],
      boss: true, id: 2053,
    },
  },

  mesoaoasis: {
    elephant: {
      name: 'Elephant', image: 'elephant',
      level: [95, 96], crowns: [4185, 6660], experience: [8, 11],
      strength: [228, 230], dexterity: [142, 144], agility: [166, 168],
      endurance: [171, 172], charisma: [232, 235], intelligence: [152, 153],
      armor: [7478, 8987], damage: [175, 215],
      id: 2060,
    },
    cheetah: {
      name: 'Cheetah', image: 'cheetah',
      level: [96, 99], crowns: [4172, 6745], experience: [9, 11],
      strength: [172, 178], dexterity: [408, 420], agility: [537, 554],
      endurance: [153, 158], charisma: [268, 277], intelligence: [134, 138],
      armor: [4120, 5026], damage: [133, 163],
      id: 2061,
    },
    demon_lion: {
      name: 'Demon Lion', image: 'demon_lion',
      level: [98, 102], crowns: [4623, 7085], experience: [9, 11],
      strength: [235, 244], dexterity: [367, 382], agility: [548, 571],
      endurance: [196, 204], charisma: [445, 464], intelligence: [156, 163],
      armor: [8591, 10116], damage: [211, 259],
      id: 2062,
    },
    demon_elephant: {
      name: 'Demon Elephant', image: 'demon_elephant',
      level: [100, 102], crowns: [5622, 7836], experience: [12, 13],
      strength: [480, 489], dexterity: [225, 229], agility: [489, 499],
      endurance: [400, 408], charisma: [489, 499], intelligence: [240, 244],
      armor: [13283, 15422], damage: [292, 359],
      boss: true, id: 2063,
    },
  },

  cliffjumper: {
    cursed_antelope: {
      name: 'Cursed Antelope', image: 'cursed_antelope',
      level: [100, 101], crowns: [4865, 6888], experience: [9, 11],
      strength: [140, 141], dexterity: [350, 353], agility: [489, 494],
      endurance: [180, 181], charisma: [315, 318], intelligence: [140, 141],
      armor: [5814, 6695], damage: [184, 226],
      id: 2070,
    },
    giant_spider: {
      name: 'Giant Spider', image: 'giant_spider',
      level: [101, 104], crowns: [4645, 7022], experience: [9, 11],
      strength: [222, 228], dexterity: [378, 390], agility: [459, 473],
      endurance: [202, 208], charisma: [353, 364], intelligence: [161, 166],
      armor: [8096, 9814], damage: [186, 229],
      id: 2071,
    },
    shaman: {
      name: 'Shaman', image: 'shaman',
      level: [103, 107], crowns: [4528, 7633], experience: [9, 11],
      strength: [103, 107], dexterity: [360, 374], agility: [504, 524],
      endurance: [206, 214], charisma: [504, 524], intelligence: [412, 428],
      armor: [5944, 7450], damage: [237, 292],
      id: 2072,
    },
    high_shaman: {
      name: 'High Shaman', image: 'high_shaman',
      level: [105, 107], crowns: [5603, 9412], experience: [11, 14],
      strength: [105, 107], dexterity: [577, 588], agility: [882, 898],
      endurance: [210, 214], charisma: [698, 711], intelligence: [482, 492],
      armor: [4541, 5478], damage: [339, 416],
      boss: true, id: 2073,
    },
  },
};

for (const [slug, group] of Object.entries(AFRICA_ENEMIES)) {
  expeditionEnemies[slug] = group;
}

// ---------------------------------------------------------------------------
// Germania expedition enemies. Same source / same rules as Africa --
// damage uses the first reported range, and Life / Crit / Block /
// Avoid Crit columns are dropped because the combat engine doesn't
// read them yet.
// ---------------------------------------------------------------------------
const GERMANIA_ENEMIES: ExpeditionEnemies = {
  cavetemple: {
    legionnaire: {
      name: 'Legionnaire', image: 'legionnaire',
      level: [50, 51], crowns: [1615, 2307], experience: [4, 5],
      strength: [90, 91], dexterity: [100, 102], agility: [140, 142],
      endurance: [90, 91], charisma: [140, 142], intelligence: [50, 51],
      armor: [5136, 6203], damage: [69, 85],
      id: 2100,
    },
    myrmidon: {
      name: 'Myrmidon', image: 'myrmidon',
      level: [51, 54], crowns: [1791, 2725], experience: [5, 6],
      strength: [112, 118], dexterity: [140, 148], agility: [232, 245],
      endurance: [89, 94], charisma: [89, 94], intelligence: [71, 75],
      armor: [5673, 6598], damage: [70, 86],
      id: 2101,
    },
    centurion: {
      name: 'Centurion', image: 'centurion',
      level: [54, 57], crowns: [1898, 3146], experience: [5, 6],
      strength: [118, 125], dexterity: [162, 171], agility: [264, 279],
      endurance: [129, 136], charisma: [151, 159], intelligence: [75, 79],
      armor: [6448, 8226], damage: [74, 91],
      id: 2102,
    },
    soulless: {
      name: 'Soulless', image: 'soulless',
      level: [56, 58], crowns: [2451, 3510], experience: [6, 8],
      strength: [168, 174], dexterity: [168, 174], agility: [294, 304],
      endurance: [235, 243], charisma: [274, 284], intelligence: [89, 91],
      armor: [8002, 9412], damage: [137, 169],
      boss: true, id: 2103,
    },
  },

  greenforest: {
    giant_wild_boar: {
      name: 'Giant Wild Boar', image: 'giant_wild_boar',
      level: [55, 55], crowns: [2091, 2924], experience: [5, 6],
      strength: [121, 121], dexterity: [96, 96], agility: [134, 134],
      endurance: [132, 132], charisma: [115, 115], intelligence: [44, 44],
      armor: [4330, 5183], damage: [101, 124],
      id: 2110,
    },
    swamp_lord: {
      name: 'Swamp Lord', image: 'swamp_lord',
      level: [56, 59], crowns: [1911, 3224], experience: [5, 6],
      strength: [134, 153], dexterity: [112, 118], agility: [98, 103],
      endurance: [145, 153], charisma: [176, 185], intelligence: [78, 82],
      armor: [6285, 7186], damage: [86, 105],
      id: 2111,
    },
    swamp_spirit: {
      name: 'Swamp Spirit', image: 'swamp_spirit',
      level: [58, 62], crowns: [2049, 3225], experience: [5, 6],
      strength: [104, 111], dexterity: [188, 201], agility: [365, 390],
      endurance: [81, 86], charisma: [243, 260], intelligence: [139, 148],
      armor: [1714, 1936], damage: [133, 164],
      id: 2112,
    },
    werebear: {
      name: 'Werebear', image: 'werebear',
      level: [61, 63], crowns: [2583, 4173], experience: [6, 8],
      strength: [256, 264], dexterity: [137, 141], agility: [277, 286],
      endurance: [146, 151], charisma: [106, 110], intelligence: [231, 239],
      armor: [5834, 7152], damage: [263, 322],
      boss: true, id: 2113,
    },
  },

  cursedvillage: {
    hun: {
      name: 'Hun', image: 'hun',
      level: [60, 61], crowns: [2073, 3063], experience: [5, 7],
      strength: [108, 109], dexterity: [165, 167], agility: [231, 234],
      endurance: [108, 109], charisma: [168, 170], intelligence: [96, 97],
      armor: [3052, 3700], damage: [64, 79],
      id: 2120,
    },
    ancient: {
      name: 'Ancient', image: 'ancient',
      level: [61, 64], crowns: [2266, 3246], experience: [5, 8],
      strength: [158, 166], dexterity: [167, 176], agility: [128, 134],
      endurance: [97, 102], charisma: [192, 201], intelligence: [97, 102],
      armor: [5622, 7165], damage: [112, 138],
      id: 2121,
    },
    nachzehrer: {
      name: 'Nachzehrer', image: 'nachzehrer',
      level: [63, 67], crowns: [2541, 3940], experience: [6, 8],
      strength: [189, 201], dexterity: [110, 117], agility: [132, 140],
      endurance: [163, 174], charisma: [286, 304], intelligence: [75, 80],
      armor: [5787, 6754], damage: [174, 185],
      id: 2122,
    },
    abomination: {
      name: 'Abomination', image: 'abomination',
      level: [66, 68], crowns: [2814, 4632], experience: [7, 9],
      strength: [158, 163], dexterity: [230, 237], agility: [415, 428],
      endurance: [198, 204], charisma: [369, 380], intelligence: [198, 204],
      armor: [7588, 9116], damage: [142, 174],
      boss: true, id: 2123,
    },
  },

  deathhill: {
    skeleton_warrior: {
      name: 'Skeleton Warrior', image: 'skeleton_warrior',
      level: [65, 66], crowns: [2443, 3695], experience: [6, 8],
      strength: [156, 158], dexterity: [81, 82], agility: [227, 231],
      endurance: [143, 145], charisma: [182, 184], intelligence: [65, 66],
      armor: [4135, 5179], damage: [100, 122],
      id: 2130,
    },
    skeleton_berserker: {
      name: 'Skeleton Berserker', image: 'skeleton_berserker',
      level: [66, 69], crowns: [2581, 3696], experience: [6, 8],
      strength: [211, 220], dexterity: [198, 207], agility: [300, 313],
      endurance: [79, 82], charisma: [161, 169], intelligence: [39, 41],
      armor: [5182, 6603], damage: [121, 149],
      id: 2131,
    },
    lich: {
      name: 'Lich', image: 'lich',
      level: [68, 72], crowns: [2458, 4005], experience: [6, 8],
      strength: [108, 115], dexterity: [221, 234], agility: [190, 201],
      endurance: [176, 187], charisma: [380, 403], intelligence: [231, 244],
      armor: [2391, 3109], damage: [104, 128],
      id: 2132,
    },
    necromancer_prince: {
      name: 'Necromancer Prince', image: 'necromancer_prince',
      level: [71, 72], crowns: [3238, 4553], experience: [7, 9],
      strength: [113, 115], dexterity: [301, 306], agility: [497, 504],
      endurance: [85, 86], charisma: [497, 504], intelligence: [326, 331],
      armor: [7057, 8034], damage: [142, 174],
      boss: true, id: 2133,
    },
  },

  vandalvillage: {
    vandal_warrior: {
      name: 'Vandal Warrior', image: 'vandal_warrior',
      level: [104, 105], crowns: [5336, 7408], experience: [10, 13],
      strength: [249, 252], dexterity: [234, 236], agility: [473, 477],
      endurance: [208, 210], charisma: [291, 294], intelligence: [124, 126],
      armor: [7483, 9068], damage: [192, 235],
      id: 2140,
    },
    jarl: {
      name: 'Jarl', image: 'jarl',
      level: [105, 107], crowns: [5123, 7679], experience: [9, 13],
      strength: [252, 256], dexterity: [262, 267], agility: [257, 262],
      endurance: [252, 256], charisma: [514, 524], intelligence: [252, 256],
      armor: [6001, 7342], damage: [242, 297],
      id: 2141,
    },
    dark_fighter: {
      name: 'Dark Fighter', image: 'dark_fighter',
      level: [106, 109], crowns: [5078, 7963], experience: [10, 13],
      strength: [424, 436], dexterity: [397, 408], agility: [371, 381],
      endurance: [212, 218], charisma: [630, 648], intelligence: [148, 152],
      armor: [13741, 16858], damage: [212, 260],
      id: 2142,
    },
    death_knight: {
      name: 'Death Knight', image: 'death_knight',
      level: [108, 110], crowns: [6209, 9584], experience: [12, 14],
      strength: [432, 440], dexterity: [459, 467], agility: [529, 539],
      endurance: [453, 462], charisma: [642, 654], intelligence: [280, 286],
      armor: [16338, 19505], damage: [282, 347],
      boss: true, id: 2143,
    },
  },

  mine: {
    mine_guard: {
      name: 'Guard', image: 'mine_guard',
      level: [108, 109], crowns: [4965, 7865], experience: [10, 13],
      strength: [216, 218], dexterity: [324, 327], agility: [453, 457],
      endurance: [302, 305], charisma: [340, 343], intelligence: [172, 174],
      armor: [7769, 9320], damage: [249, 306],
      id: 2150,
    },
    draug: {
      name: 'Draug', image: 'draug',
      level: [109, 112], crowns: [5579, 8268], experience: [10, 13],
      strength: [283, 291], dexterity: [463, 476], agility: [534, 548],
      endurance: [196, 201], charisma: [534, 548], intelligence: [174, 179],
      armor: [7804, 9397], damage: [251, 309],
      id: 2151,
    },
    stone_golem: {
      name: 'Stone Golem', image: 'stone_golem',
      level: [110, 113], crowns: [5741, 8161], experience: [10, 13],
      strength: [396, 406], dexterity: [165, 169], agility: [308, 316],
      endurance: [660, 678], charisma: [308, 316], intelligence: [44, 45],
      armor: [19750, 24154], damage: [220, 270],
      id: 2152,
    },
    tatzelwurm: {
      name: 'Tatzelwurm', image: 'tatzelwurm',
      level: [112, 114], crowns: [6288, 10185], experience: [13, 15],
      strength: [492, 501], dexterity: [280, 285], agility: [509, 518],
      endurance: [537, 547], charisma: [627, 638], intelligence: [246, 250],
      armor: [19717, 24916], damage: [327, 402],
      boss: true, id: 2153,
    },
  },

  teutoncamp: {
    barbarian: {
      name: 'Barbarian', image: 'barbarian',
      level: [112, 113], crowns: [5390, 8293], experience: [10, 13],
      strength: [291, 293], dexterity: [392, 395], agility: [548, 553],
      endurance: [268, 271], charisma: [352, 355], intelligence: [89, 90],
      armor: [7254, 8860], damage: [258, 317],
      id: 2160,
    },
    teuton_hero: {
      name: 'Teuton Hero', image: 'teuton_hero',
      level: [113, 116], crowns: [5230, 8193], experience: [11, 15],
      strength: [342, 348], dexterity: [339, 348], agility: [474, 487],
      endurance: [339, 348], charisma: [593, 609], intelligence: [203, 208],
      armor: [7378, 8878], damage: [226, 277],
      id: 2161,
    },
    teuton_lord: {
      name: 'Teuton Lord', image: 'teuton_lord',
      level: [114, 117], crowns: [5484, 8918], experience: [11, 13],
      strength: [342, 351], dexterity: [456, 468], agility: [798, 819],
      endurance: [273, 280], charisma: [758, 778], intelligence: [296, 304],
      armor: [8280, 10113], damage: [263, 323],
      id: 2162,
    },
    seidr: {
      name: 'Seidr', image: 'seidr',
      level: [116, 118], crowns: [6504, 10583], experience: [13, 18],
      strength: [348, 354], dexterity: [667, 678], agility: [1136, 1156],
      endurance: [324, 330], charisma: [852, 867], intelligence: [394, 401],
      armor: [8321, 10175], damage: [393, 482],
      boss: true, id: 2163,
    },
  },

  komanmountain: {
    infernal_springbok: {
      name: 'Infernal Springbok', image: 'infernal_springbok',
      level: [116, 117], crowns: [5988, 8723], experience: [13, 13],
      strength: [278, 280], dexterity: [522, 526], agility: [730, 737],
      endurance: [278, 280], charisma: [324, 327], intelligence: [116, 117],
      armor: [9927, 12247], damage: [267, 328],
      id: 2170,
    },
    sabre_tooth_tiger: {
      name: 'Sabre-Tooth Tiger', image: 'sabre_tooth_tiger',
      level: [117, 120], crowns: [6471, 9012], experience: [13, 13],
      strength: [304, 312], dexterity: [614, 630], agility: [655, 672],
      endurance: [234, 240], charisma: [532, 546], intelligence: [187, 192],
      armor: [9391, 10957], damage: [324, 398],
      id: 2171,
    },
    dragon_whelp: {
      name: 'Dragon Whelp', image: 'dragon_whelp',
      level: [118, 121], crowns: [5761, 8294], experience: [11, 14],
      strength: [188, 193], dexterity: [590, 605], agility: [1032, 1058],
      endurance: [141, 145], charisma: [619, 635], intelligence: [283, 290],
      armor: [13581, 16621], damage: [327, 401],
      id: 2172,
    },
    dragon: {
      name: 'Dragon', image: 'dragon',
      level: [120, 122], crowns: [7001, 11063], experience: [13, 18],
      strength: [456, 463], dexterity: [480, 488], agility: [504, 512],
      endurance: [432, 439], charisma: [1092, 1110], intelligence: [480, 488],
      armor: [19467, 24095], damage: [480, 589],
      boss: true, id: 2173,
    },
  },

  dragonremains: {
    bone_golem: {
      name: 'Bone Golem', image: 'bone_golem',
      level: [120, 121], crowns: [5689, 9465], experience: [11, 14],
      strength: [336, 338], dexterity: [360, 363], agility: [672, 677],
      endurance: [312, 314], charisma: [294, 296], intelligence: [48, 48],
      armor: [14290, 17947], damage: [351, 430],
      id: 2180,
    },
    lemures: {
      name: 'Lemures', image: 'lemures',
      level: [121, 124], crowns: [5737, 9516], experience: [11, 14],
      strength: [121, 124], dexterity: [695, 713], agility: [1016, 1041],
      endurance: [121, 124], charisma: [762, 781], intelligence: [290, 297],
      armor: [2575, 3244], damage: [372, 457],
      id: 2181,
    },
    ritualist: {
      name: 'Ritualist', image: 'ritualist',
      level: [122, 125], crowns: [5942, 9838], experience: [11, 14],
      strength: [146, 150], dexterity: [640, 656], agility: [725, 743],
      endurance: [195, 200], charisma: [725, 743], intelligence: [414, 444],
      armor: [7784, 9678], damage: [469, 576],
      id: 2182,
    },
    dracolich: {
      name: 'Dracolich', image: 'dracolich',
      level: [124, 126], crowns: [7403, 11866], experience: [13, 18],
      strength: [372, 378], dexterity: [465, 472], agility: [651, 661],
      endurance: [372, 378], charisma: [1215, 1234], intelligence: [496, 504],
      armor: [19113, 24127], damage: [572, 703],
      boss: true, id: 2183,
    },
  },
};

for (const [slug, group] of Object.entries(GERMANIA_ENEMIES)) {
  expeditionEnemies[slug] = group;
}

// ---------------------------------------------------------------------------
// Britannia placeholder enemies. Stat blocks still ride the scaled
// generator below until real fansite values land. Africa and Germania
// are curated above and are excluded from the auto-gen pool.
// ---------------------------------------------------------------------------

interface ZoneSeed {
  slug: string;
  baseLevel: number;
  enemies: [string, string, string, string]; // [easy, medium, hard, boss]
}

const NEW_ZONES: ZoneSeed[] = [
  // Britannia
  { slug: 'bankofthames',       baseLevel: 120, enemies: ['Briton Levy', 'Briton Skirmisher', 'Briton Centurion', 'River Warlord'] },
  { slug: 'forestfortress',     baseLevel: 130, enemies: ['Fortress Sentry', 'Fortress Archer', 'Fortress Captain', 'Forest Chieftain'] },
  { slug: 'themoor',            baseLevel: 140, enemies: ['Mire Wraith', 'Moor Hound', 'Bog Stalker', 'Moor Hag'] },
  { slug: 'campcassivellaunus', baseLevel: 150, enemies: ['Camp Conscript', 'Camp Veteran', 'Camp Champion', 'Cassivellaunus'] },
  { slug: 'kent',               baseLevel: 160, enemies: ['Kent Raider', 'Kent Pikeman', 'Kent Marauder', 'Kent Warlord'] },
  { slug: 'theford',            baseLevel: 170, enemies: ['Ford Ambusher', 'Ford Champion', 'Ford Slayer', 'Ford King'] },
  { slug: 'camulodunum',        baseLevel: 180, enemies: ['Ruin Scavenger', 'Ruin Berserker', 'Ruin Praetorian', 'Ruin Tyrant'] },
  { slug: 'cambria',            baseLevel: 190, enemies: ['Cambrian Wolf', 'Cambrian Troll', 'Cambrian Giant', 'Cambrian Lord'] },
  { slug: 'monaisle',           baseLevel: 200, enemies: ['Druid Initiate', 'Druid Warden', 'Arch-Druid', 'Mona Hierophant'] },
];

const ROLE_OFFSETS = [4, 8, 12, 16] as const; // easy / medium / hard / boss
const ROLE_KEYS    = ['easy', 'medium', 'hard', 'boss'] as const;

function statRange(centre: number, swing = 0.12): [number, number] {
  const lo = Math.max(1, Math.round(centre * (1 - swing)));
  const hi = Math.max(lo, Math.round(centre * (1 + swing)));
  return [lo, hi];
}
function levelArray(lvl: number): number[] {
  return [Math.max(1, lvl - 1), lvl, lvl + 1];
}

let nextEnemyId = 1000;
function buildEnemy(level: number, name: string, isBoss: boolean): EnemyStatsInterface {
  // Bosses get a 1.4x stat multiplier on top of role scaling.
  const m = isBoss ? 1.4 : 1.0;
  const baseStat = (factor: number) => Math.round(level * factor * m);
  const [strLo, strHi] = statRange(baseStat(2.0));
  const [endLo, endHi] = statRange(baseStat(2.0));
  const [dexLo, dexHi] = statRange(baseStat(5.0));
  const [agiLo, agiHi] = statRange(baseStat(5.0));
  const [intLo, intHi] = statRange(baseStat(1.5));
  const [chaLo, chaHi] = statRange(baseStat(2.0));
  const expLo = Math.max(1, Math.floor(level * 0.3));
  const expHi = Math.max(expLo, Math.floor(level * 0.5 * (isBoss ? 2 : 1)));
  const gpLo = Math.max(10, Math.floor(level * 12 * (isBoss ? 2 : 1)));
  const gpHi = Math.max(gpLo, Math.floor(level * 28 * (isBoss ? 2 : 1)));
  const arLo = Math.max(10, Math.floor(level * 15 * m));
  const arHi = Math.max(arLo, Math.floor(level * 30 * m));
  const dmLo = Math.max(1,  Math.floor(level * 2 * m));
  const dmHi = Math.max(dmLo, Math.floor(level * 4 * m));

  const id = nextEnemyId++;
  const imageSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return {
    name,
    image: imageSlug,
    level: levelArray(level),
    strength:     [strLo, strHi],
    endurance:    [endLo, endHi],
    dexterity:    [dexLo, dexHi],
    agility:      [agiLo, agiHi],
    intelligence: [intLo, intHi],
    charisma:     [chaLo, chaHi],
    experience:   [expLo, expHi],
    crowns:       [gpLo, gpHi],
    armor:        [arLo, arHi],
    damage:       [dmLo, dmHi],
    boss: isBoss || undefined,
    id,
  };
}

for (const zone of NEW_ZONES) {
  const group: Record<string, EnemyStatsInterface> = {};
  for (let i = 0; i < 4; i++) {
    const role = ROLE_KEYS[i];
    const level = zone.baseLevel + ROLE_OFFSETS[i];
    group[role] = buildEnemy(level, zone.enemies[i], i === 3);
  }
  expeditionEnemies[zone.slug] = group;
}

