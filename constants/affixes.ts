// Gladiatus item affixes (prefixes / suffixes / top prefixes / top
// suffixes). Each affix is gated by an item level threshold and carries
// a bundle of flat + percentage stat bonuses, some of which (Threat,
// Hardening Value, Healing, Critical Healing Value) are stored on items
// but not yet consumed by combat -- those will turn on once dungeons
// land. Source: https://gladiatus.gamerz-bg.com/items/prefixes etc.

export interface AffixBonus {
  damageBonus?: number;
  armor?: number;
  health?: number;

  strength?: number;
  dexterity?: number;
  agility?: number;
  endurance?: number;
  charisma?: number;
  intelligence?: number;

  // Percentage variants -- applied as floor(base * pct / 100) on top of
  // the flat bonus, where base is the wearer's trained stat.
  strengthPct?: number;
  dexterityPct?: number;
  agilityPct?: number;
  endurancePct?: number;
  charismaPct?: number;
  intelligencePct?: number;

  // Block Value / Critical Attack Value: added directly to block /
  // crit chance percentages in the combat breakdown.
  blockChanceBonus?: number;
  critChanceBonus?: number;

  // Dungeon-only for now -- stored on items, ignored by current combat.
  threat?: number;
  hardeningValue?: number;
  healing?: number;
  criticalHealingValue?: number;
}

export interface AffixDef {
  name: string;
  level: number;
  bonuses: AffixBonus;
}

export const AFFIX_FIELDS: (keyof AffixBonus)[] = [
  'damageBonus', 'armor', 'health',
  'strength', 'dexterity', 'agility', 'endurance', 'charisma', 'intelligence',
  'strengthPct', 'dexterityPct', 'agilityPct', 'endurancePct', 'charismaPct', 'intelligencePct',
  'blockChanceBonus', 'critChanceBonus',
  'threat', 'hardeningValue', 'healing', 'criticalHealingValue',
];

const FIELD_MAP: Record<string, keyof AffixBonus> = {
  'Damage': 'damageBonus',
  'Armour': 'armor',
  'Strength': 'strength',
  'Dexterity': 'dexterity',
  'Agility': 'agility',
  'Constitution': 'endurance',   // Gladiatus calls it Constitution
  'Charisma': 'charisma',
  'Intelligence': 'intelligence',
  'Health': 'health',
  'Block Value': 'blockChanceBonus',
  'Blocking Value': 'blockChanceBonus', // Source-table typo (e.g. Aemilius)
  'Critical Attack Value': 'critChanceBonus',
  'Threat': 'threat',
  'Hardening Value': 'hardeningValue',
  'Healing': 'healing',
  'Critical Healing Value': 'criticalHealingValue',
};

const PCT_CAPABLE = new Set([
  'strength', 'dexterity', 'agility', 'endurance', 'charisma', 'intelligence',
]);

// Parses the source-table bonus column into an AffixBonus.
// Example: "Strength +1; Strength +11%; Charisma -6%; Block Value +5"
//   -> { strength: 1, strengthPct: 11, charismaPct: -6, blockChanceBonus: 5 }
// Accepts the source's "—" / "–" / "-" cell as "no bonuses".
function bonus(text: string): AffixBonus {
  const out: AffixBonus = {};
  const trimmed = text.trim();
  if (!trimmed || trimmed === '—' || trimmed === '–' || trimmed === '-') return out;
  for (const raw of trimmed.split(';').map((s) => s.trim()).filter(Boolean)) {
    if (raw === '—' || raw === '–' || raw === '-') continue;
    const m = raw.match(/^(.+?)\s*([+-]\d+)(%?)$/);
    if (!m) {
      console.warn(`[affixes] could not parse bonus "${raw}"`);
      continue;
    }
    const [, rawField, valStr, pctMark] = m;
    const field = rawField.trim();
    const key = FIELD_MAP[field];
    if (!key) {
      console.warn(`[affixes] unknown bonus field "${field}"`);
      continue;
    }
    const value = parseInt(valStr, 10);
    if (pctMark === '%') {
      if (!PCT_CAPABLE.has(key)) {
        console.warn(`[affixes] field "${field}" can't take a percentage`);
        continue;
      }
      const pctKey = (key + 'Pct') as keyof AffixBonus;
      (out as any)[pctKey] = ((out as any)[pctKey] ?? 0) + value;
    } else {
      (out as any)[key] = ((out as any)[key] ?? 0) + value;
    }
  }
  return out;
}

const p = (name: string, level: number, bonusStr: string): AffixDef => ({
  name,
  level,
  bonuses: bonus(bonusStr),
});

export const PREFIXES: AffixDef[] = [
  p('Amoviels',      16, 'Strength +2'),
  p('Calódiens',     16, 'Armour +100; Dexterity +2; Agility +3'),
  p('Tinothiels',    16, 'Armour +60; Constitution +4'),
  p('Kosmonas',      17, 'Charisma -6%; Health +26'),
  p('Reinkes',       18, 'Agility -8%; Constitution -6%; Intelligence +1; Healing +20; Critical Healing Value +3'),
  p('Mimas',         19, 'Strength +1; Agility +1; Agility +7%; Constitution -7%; Charisma +1; Charisma +8%'),
  p('Elvilmandels',  20, 'Damage +1; Strength +2; Health +100'),
  p('Denovs',        21, 'Dexterity +2; Agility +6%'),
  p('Nariths',       21, 'Damage +1; Dexterity +2; Constitution +2'),
  p('Zickezackes',   21, 'Agility -10%; Block Value +3; Threat +8; Health +21'),
  p('Solitanis',     22, 'Constitution -1; Charisma -1; Intelligence +1; Intelligence +8%; Healing +20; Critical Healing Value +3'),
  p('Sugos',         22, 'Damage +3; Dexterity +6; Constitution +4%; Health +120'),
  p('Vuthiels',      22, 'Damage +2; Charisma +3; Health +30'),
  p('Frabos',        23, 'Damage +2; Agility +6; Charisma +12%'),
  p('Mermereus',     23, 'Strength +1; Strength +11%; Dexterity +1; Dexterity +7%; Charisma +1; Intelligence -1; Critical Attack Value +3'),
  p('Poirins',       23, 'Armour +280; Strength +4%; Agility +5; Health +60'),
  p('Chealoths',     24, 'Constitution +8; Constitution +14%; Charisma +6%; Health +300'),
  p('Watzmanns',     24, 'Strength +1; Agility -9%; Block Value +5; Threat +12; Health +30'),
  p('Doitrems',      25, 'Armour +50; Dexterity +8; Agility +6%; Health +25'),
  p('Tanias',        25, 'Armour +250; Dexterity +1%; Agility -2'),
  p('Uróthiens',     25, 'Damage +6; Strength +6; Dexterity +2; Dexterity +4%; Health +24'),
  p('Elywens',       26, 'Dexterity +5%; Agility +5%; Constitution +5%; Health +180'),
  p('Frickoys',      26, 'Charisma -9%; Intelligence +1; Intelligence +10%; Critical Healing Value +4'),
  p('Lothays',       26, 'Damage +4; Health +120'),
  p('Rayols',        27, 'Damage +7; Armour +120; Strength +6; Dexterity +2; Dexterity +5%'),
  p('Redos',         27, 'Armour +100; Dexterity +4; Agility +4; Health +200'),
  p('Skiterus',      27, 'Strength +1; Strength +11%; Dexterity -1; Agility +11%; Charisma +1; Intelligence -1; Critical Attack Value +5'),
  p('Umilawens',     27, 'Strength +2; Dexterity +2; Charisma +2'),
  p('Bilgs',         28, 'Armour +240; Dexterity +6; Agility +2; Constitution +2; Health +90'),
  p('Chalinis',      28, 'Armour +100; Strength +2; Charisma +12'),
  p('Gadriewens',    28, 'Armour +140; Agility +25%; Charisma +10%'),
  p('Granks',        28, 'Armour +100; Strength +4%; Charisma +2%; Health +100'),
  p('Rynightes',     28, 'Armour +60; Constitution +12; Charisma +8; Charisma +4%'),
  p('Xus',           28, 'Agility -1; Block Value +5; Threat +14; Health +32'),
  p('Asendacs',      29, 'Armour +220; Dexterity +2; Health +90'),
  p('Ibiwans',       29, 'Damage +6; Armour +75; Constitution +10; Constitution +4%'),
  p('Amelias',       30, 'Damage +2; Strength +15; Health +100'),
  p('Bacias',        30, 'Damage +7; Armour +175; Constitution +6; Charisma +2; Health +60'),
  p('Grasscrawlers', 30, 'Armour +100; Dexterity +8; Agility +4'),
  p('Ismaels',       30, 'Damage -1; Dexterity -1; Charisma -11%; Intelligence +1; Intelligence +13%; Healing +28; Critical Healing Value +6'),
  p('Isundels',      30, 'Armour +140; Strength +12%; Constitution +12%'),
  p('Kedyssis',      30, 'Strength +8; Strength +14%; Health +60'),
  p('Mooncruchers',  30, 'Armour +220; Dexterity +4; Agility +4; Health +60'),
  p('Berrys',        31, 'Armour +200; Agility +14; Health +375'),
  p('Ciallans',      31, 'Damage +4; Strength +4; Strength +24%; Health +75'),
  p('Cisiens',       31, 'Armour +300; Dexterity +8; Agility +8'),
  p('Elrarangs',     31, 'Dexterity +24%'),
  p('Gonaks',        31, 'Damage +6; Armour +160; Strength +2; Constitution +6%'),
  p('Lurtscharas',   31, 'Strength +1; Dexterity +1; Dexterity +14%; Constitution -2; Charisma +2; Charisma +11%; Critical Attack Value +5'),
  p('Asayseths',     32, 'Damage +3; Dexterity +6%; Agility +12%; Charisma +6%; Health +140'),
  p('Beasthammers',  32, 'Damage +6; Strength +6; Strength +13%'),
  p('Chabdyns',      32, 'Damage +3; Strength +16%; Charisma -2%'),
  p('Demonkillers',  32, 'Strength +15%; Constitution +16'),
  p('Frientas',      32, 'Armour +99; Strength +15%; Hardening Value +7; Block Value +5; Threat +18'),
  p('Peragos',       32, 'Armour +350; Constitution +8; Charisma +2; Health +180'),
  p('Zeindras',      32, 'Damage +3; Armour +160; Dexterity +2; Dexterity +6%; Agility +8%; Charisma +24%'),
  p('Galarands',     33, 'Armour +200; Constitution +10; Constitution +15%'),
  p('Kerrannas',     33, 'Strength +22%; Dexterity +22%; Agility +22%'),
  p('Rakrests',      33, 'Armour +190; Strength +10; Dexterity +5%; Agility +5%'),
  p('Tûnêsés',       33, 'Charisma -14%; Intelligence +12%; Healing +40; Critical Healing Value +4'),
  p('Heudois',       35, 'Dexterity +15%; Charisma +2; Charisma +13%; Intelligence -1; Intelligence -1%; Critical Attack Value +7'),
  p('Orlelds',       35, 'Damage +3; Strength +5%'),
  p('Adendathiels',  36, 'Damage +6; Strength +8; Strength +22%; Charisma -5%'),
  p('Melanchaetas',  36, 'Armour +76; Strength +2; Block Value +8; Threat +26'),
  p('Bereccas',      37, 'Strength -1; Intelligence +2; Intelligence +16%; Healing +18; Critical Healing Value +7'),
  p('Lulus',         39, 'Strength +2; Strength +13%; Dexterity +2; Agility +15%; Constitution -2; Charisma +2; Charisma +14%'),
  p('Ashitills',     40, 'Damage +6; Strength +10; Dexterity +25%; Agility -13%; Constitution +12%; Health +400'),
  p('Phalangens',    40, 'Armour +108'),
  p('Fitschis',      41, 'Strength -3; Agility -13%; Intelligence +2; Intelligence +19%; Healing +40; Critical Healing Value +8'),
  p('Umfetas',       42, 'Strength +2; Dexterity -2; Dexterity +14%; Constitution -2; Charisma +3; Intelligence -2; Intelligence -2%'),
  p('Uridos',        42, 'Damage +7; Strength +15; Dexterity -13%; Agility +18; Constitution +28%; Health +300'),
  p('Ronaldas',      44, 'Strength +2; Agility -16%; Hardening Value +7; Block Value +9; Threat +30; Health +49'),
  p('Medonis',       45, 'Agility -20%; Intelligence +2; Intelligence +16%; Healing +56; Critical Healing Value +7'),
  p('Táliths',       45, 'Damage +7; Armour +400; Strength +20%; Dexterity +20%'),
  p('Gidras',        46, 'Strength +2; Dexterity +3; Dexterity +21%; Charisma +2; Charisma +20%; Intelligence -2%; Critical Attack Value +9'),
  p('Fustriels',     48, 'Armour +147; Strength +3; Hardening Value +9; Block Value +11; Threat +36'),
  p('Heuhois',       49, 'Damage -2; Strength -3; Strength -17%; Constitution -14%; Intelligence +3; Intelligence +21%; Critical Healing Value +8'),
  p('Evotavs',       50, 'Armour +400; Strength +30%; Dexterity -12%; Agility -12%; Constitution +15%; Health +350'),
  p('Melaneos',      50, 'Strength +3; Strength +18%; Dexterity +3; Dexterity -19%; Charisma +2; Charisma +19%; Intelligence -3; Critical Attack Value +8'),
  p('Yas',           51, 'Armour +158'),
  p('Grills',        53, 'Dexterity -2; Agility -21%; Constitution -2; Charisma -21%; Intelligence +3; Critical Healing Value +9'),
  p('Zombers',       54, 'Strength +4; Strength +18%; Dexterity +3; Dexterity +22%; Charisma +2; Charisma +21%; Critical Attack Value +10'),
  p('Xenphlames',    55, 'Armour +151; Strength +19%'),
  p('Liloels',       56, 'Constitution -2; Charisma -4; Intelligence +3; Intelligence +21%; Healing +48'),
  p('Sphingens',     58, 'Strength +3; Strength +26%; Dexterity +2; Dexterity +26%; Charisma +2; Charisma +24%'),
  p('Korks',         59, 'Armour +113; Intelligence -4; Block Value +10; Threat +42'),
  p('Purmanns',      60, 'Strength -18%; Constitution -19%; Charisma -3; Intelligence +3; Healing +64; Critical Healing Value +11'),
  p('Trafans',       60, 'Damage +9; Armour -200; Strength +13%; Agility +25%; Health +500'),
  p('Cheggovs',      62, 'Strength +21%; Dexterity +3; Dexterity +24%; Constitution -3; Constitution -19%; Charisma +4; Critical Attack Value +11'),
  p('Fernabasts',    63, 'Strength +3; Strength +22%; Agility -4; Hardening Value +10; Block Value +10; Threat +44; Health +74'),
  p('Monychustas',   64, 'Damage -3; Strength -4; Dexterity -3; Constitution -23%; Charisma -3; Healing +68'),
  p('Barbekuus',     65, 'Strength +4; Strength +24%; Agility +18%; Charisma +4; Charisma +20%; Intelligence -3%'),
  p('Umbros',        67, 'Armour +199'),
  p('Doomeniks',     68, 'Damage -5; Strength -22%; Constitution -3; Charisma -29%; Intelligence +4'),
  p('Leandronimus',  69, 'Strength +3; Strength +29%; Agility +3; Agility +21%; Charisma +3; Charisma +28%'),
  p('Opiehnzas',     70, 'Damage +5; Armour +700; Strength +35%; Dexterity -10%; Agility -10%; Constitution +25%; Health +800'),
  p('Jennifers',     71, 'Strength +3; Strength +25%; Intelligence -4; Health +94'),
  p('Stoybaers',     72, 'Strength -3; Dexterity -5; Agility -30%; Constitution -5; Intelligence +3; Healing +76'),
  p('Thorstens',     73, 'Strength +3; Strength +24%; Dexterity -5; Dexterity +27%; Charisma +28%; Critical Attack Value +15'),
  p('Chucks',        74, 'Armour +194; Charisma -22%'),
  p('Shivas',        76, 'Charisma -3; Charisma -24%; Intelligence +35%; Healing +72'),
  p('Zimbris',       77, 'Strength +33%; Dexterity +27%; Charisma +5; Charisma +28%; Critical Attack Value +16'),
  p('Sentarions',    78, 'Armour +208; Hardening Value +13; Block Value +12; Threat +52; Health +117'),
  p('Anchorons',     80, 'Damage -6; Agility -35%; Charisma -25%; Intelligence +4; Healing +76'),
  p('Ichorus',       80, 'Damage +15; Strength +40%; Dexterity +12%; Agility +20%; Constitution -20; Constitution -15%'),
  p('Marcus',        81, 'Intelligence +20; Healing +85; Critical Healing Value +35'),
  p('Tantus',        81, 'Damage +10; Armour +250; Strength +10; Hardening Value +18; Block Value +20; Threat +75'),
  p('Appius',        82, 'Damage +4; Armour +350; Dexterity +30; Agility +25; Charisma +5'),
  p('Decimus',       83, 'Damage +9; Strength +15; Dexterity +25; Agility +35'),
  p('Lucius',        84, 'Damage +5; Armour +550; Constitution +12; Charisma +15; Critical Attack Value +25; Hardening Value +15; Block Value +55; Threat +35'),
  p('Manius',        85, 'Charisma +25; Intelligence +25; Critical Attack Value +25'),
  p('Mateus',        85, 'Damage +16; Strength +35; Constitution -10'),
  p('Dexterus',      86, 'Damage +5; Strength +20; Dexterity +20; Agility +20; Constitution +20; Charisma +20; Intelligence +20; Health +200'),
  p('Servius',       86, 'Damage +8; Strength +12; Dexterity +25; Agility +25; Intelligence +12'),
  p('Dairus',        87, 'Armour +650; Strength +10; Agility +25; Constitution +30; Block Value +25'),
  p('Spurius',       88, 'Intelligence +25; Healing +130'),
  p('Titus',         88, 'Armour +500; Constitution +35; Charisma +35; Critical Attack Value +30; Threat +60'),
  p('Sextus',        89, 'Damage +12; Armour +300; Constitution +15; Charisma +8; Hardening Value +10; Block Value +35'),
  p('Gaius',         90, 'Damage +17; Strength +5; Dexterity +5; Agility +5; Critical Attack Value +25'),
  p('Mandalus',      90, 'Agility +8; Intelligence +35; Healing +110; Critical Healing Value +25'),
  p('Silvanus',      91, 'Intelligence +45; Healing +120'),
  p('Antonius',      92, 'Damage +16; Dexterity +25; Agility +35; Charisma +25; Critical Attack Value +25'),
  p('Giganticus',    92, 'Damage +8; Armour +400; Strength +40; Constitution +40; Threat +40; Health +400'),
  p('Quintus',       93, 'Damage +13; Armour +550; Strength -20; Constitution +30; Critical Attack Value -50; Hardening Value +20; Block Value +30; Health +300'),
  p('Tellus',        93, 'Damage +12; Charisma +30; Critical Attack Value +20; Hardening Value +20; Block Value +20'),
  p('Lepidus',       94, 'Damage +12; Armour +300; Strength +30; Constitution +30; Charisma +30; Block Value +30'),
  p('Marcellus',     94, 'Damage +18; Strength +20; Constitution +20'),
  p('Vergilius',     95, 'Intelligence -30; Healing +155; Critical Healing Value +35'),
  p('Belisarius',    96, 'Damage +15; Armour +600; Constitution +30; Critical Attack Value -35; Hardening Value +15; Health +600'),
  p('Constantius',   97, 'Damage +12; Armour +400; Strength +15; Dexterity +20; Agility +20; Constitution +15; Charisma +20; Intelligence +15'),
  p('Titanius',      98, 'Damage +18; Dexterity +25; Constitution -25; Charisma +30; Critical Attack Value +20; Block Value -30'),
  p('Avalonius',     99, 'Damage +8; Armour +700; Constitution +35; Hardening Value +20; Block Value +20; Threat +40'),
  p('Pontius',       99, 'Damage +14; Armour +500; Strength +10; Agility +20; Charisma +15; Critical Attack Value -25; Block Value +15'),
  p('Aurelius',     100, 'Agility +15; Healing +145; Critical Healing Value +15'),
  p('Valerius',     100, 'Damage +19; Dexterity +25; Agility +25'),
  p("Lethe's",      101, 'Damage +19; Dexterity +25; Agility +11%; Constitution +17; Intelligence -38; Block Value +33'),
  p("Asphodel's",   102, 'Strength +60; Dexterity +36; Constitution +35%; Charisma +31; Intelligence +19%; Critical Healing Value +36'),
  p('Sebastianus',  103, 'Damage +16; Armour +571; Strength +33; Dexterity +21; Agility +20; Charisma +34; Healing +164; Critical Attack Value +35'),
  p('Dragonus',     104, 'Armour +768; Dexterity +34; Agility +37; Charisma +8; Charisma +25%; Health +647'),
  p('Mycandrilles', 104, 'Strength -18; Dexterity +25; Agility +21%; Constitution +50; Intelligence +30%; Critical Attack Value +35; Health +468'),
  p('Amulius',      105, 'Damage +16; Dexterity +15%; Block Value +31; Threat +56'),
  p('Tiberius',     105, 'Damage +22; Strength +49; Strength +17%; Dexterity +25; Dexterity +35%; Agility +10; Threat +42; Health +250'),
  p('Ambrosius',    106, 'Damage +23; Dexterity +17; Agility -10%; Constitution +39; Critical Healing Value +39; Threat +51; Health +250'),
  p('Primulus',     107, 'Armour +664; Strength +10%; Dexterity +35%; Agility +32%; Charisma +30%; Intelligence +17; Critical Attack Value -26; Health +494'),
  p('Ursus',        107, 'Damage +9; Armour +900; Strength +36; Constitution -25; Charisma +18; Critical Attack Value +35'),
  p('Valentinus',   107, 'Armour +900; Strength +39; Constitution -50; Constitution +11%; Charisma +30%; Intelligence +47'),
  p('Oranius',      108, 'Armour +790; Strength -35%; Dexterity +24%; Agility +36; Charisma +21; Charisma +19%; Health +455'),
  p('Mercurialis',  109, 'Damage +10; Strength +25; Block Value +43; Health +700'),
  p('Minucius',     109, 'Damage +14; Strength +19; Dexterity +24; Agility +18%; Constitution -33; Charisma +30%; Threat +35; Health +404'),
  p('Caldus',       110, 'Damage +17; Armour +651; Strength +36; Critical Healing Value +40; Threat +41'),
  p('Sergius',      110, 'Armour +605; Strength -28%; Dexterity -19%; Constitution -27%; Healing +181; Critical Attack Value +35; Health +500'),
  p('Joves',        111, 'Damage +20; Agility +24%; Charisma -40; Healing +183; Critical Healing Value +40; Hardening Value +27'),
  p('Magnus',       111, 'Strength +23; Strength +21%; Dexterity -35%; Agility +14%; Constitution -19%; Charisma +24; Healing +181'),
  p('Angelus',      112, 'Strength +31; Dexterity -45; Dexterity +8%; Charisma -18; Healing +200; Hardening Value +21'),
  p('Gratius',      113, 'Damage +17; Strength +38; Dexterity -19; Agility +21%; Charisma +30%; Critical Attack Value +35; Health +519'),
  p('Arpagius',     114, 'Damage +21; Strength +21; Agility +22%; Constitution -13; Charisma +30%; Threat +52; Health +324'),
  p('Pilatus',      115, 'Damage +13; Armour +617; Strength +57; Agility +33'),
  p('Camillus',     116, 'Armour +491; Strength +31; Dexterity +20; Agility +10; Charisma +30%'),
  p('Caesius',      117, 'Damage +12; Strength -22; Strength +23%; Constitution +47; Intelligence +44; Critical Healing Value +43; Hardening Value +26'),
  p('Gratias',      118, 'Dexterity +12%; Healing +164; Threat +61'),
  p('Auroras',      119, 'Armour +557; Strength +8%; Charisma +15%; Critical Healing Value +43; Block Value +37'),
  p('Africanus',    120, 'Dexterity +16%; Constitution -18%; Intelligence +35; Health +537'),
  p('Aulus',        120, 'Damage +13; Armour +781; Strength +18; Agility +11; Agility +27%; Critical Healing Value +50; Block Value +50; Health +466'),
  p('Porcius',      120, 'Damage +5; Strength -21; Dexterity +10; Dexterity +25%; Agility +36; Constitution +28%; Intelligence +46'),
  p('Scribonius',   120, 'Dexterity +18'),
  p('Gaias',        130, 'Damage +20; Armour +827; Agility +10; Charisma +15%; Healing +164'),
  p('Accas',        140, 'Strength +8; Agility +14; Constitution -34; Charisma +19; Charisma +26%; Critical Healing Value +50; Threat +44'),
  p('Quintas',      150, 'Damage +12; Constitution -17; Constitution +26%; Charisma +30%; Block Value +42; Threat +52; Health +677'),
  p('Timotius',     155, 'Damage +22; Armour +1041; Agility +21; Constitution +41%; Hardening Value +28; Block Value +25'),
  p('Elegatius',    155, 'Agility +21; Constitution +10%; Charisma +13; Intelligence +31; Intelligence +11%; Healing +279; Critical Healing Value +65'),
  p('Darius',       155, 'Damage +23; Armour +283; Strength +34; Dexterity +11; Dexterity +19%; Agility +20; Constitution +9%; Intelligence +51'),
  p('Cassius',      155, 'Strength -4; Dexterity +19%; Agility -25%; Constitution +8%; Charisma +35; Intelligence +55; Intelligence +25%; Healing +140; Health +669'),
  p('Varus',        155, 'Damage +22; Constitution +9%; Charisma +21%; Critical Attack Value +35; Hardening Value +30; Block Value +43; Threat +45; Health +656'),
  p('Horatius',     158, 'Strength +32; Agility +19; Charisma +13; Charisma +20%; Critical Healing Value +59; Threat +45'),
  p("Pliny's",      159, 'Constitution +57; Intelligence +21'),
  p('Zenobius',     160, 'Damage +17; Strength +34; Dexterity +11; Dexterity +9%; Agility +21; Constitution -10; Constitution +10%; Intelligence +31'),
  p('Nicodemus',    160, 'Damage +24; Armour +765; Strength +34%; Dexterity +25; Agility +19; Intelligence -13%; Critical Attack Value +37'),
  p('Crispinus',    160, 'Damage +21; Armour +251; Dexterity +8%; Agility +21%; Constitution +11%; Charisma +17%; Intelligence +58; Health +685'),
  p('Caelius',      160, 'Armour +220; Agility -30%; Intelligence +54; Healing +279; Critical Healing Value +63'),
  p('Regulus',      162, 'Armour +212; Charisma +58; Intelligence +45; Intelligence +22%; Healing +441; Critical Healing Value +64'),
  p('Florentinus',  162, 'Damage +14; Armour +311; Constitution +9%; Charisma +34%; Hardening Value +33; Block Value +50; Threat +45; Health +701'),
  p('Honoratus',    163, 'Armour +642; Strength +34; Strength +14%; Agility +19; Constitution +44; Constitution +21%; Charisma +14; Charisma +38%; Threat +47'),
  p('Secundus',     165, 'Intelligence +64; Intelligence +32%; Healing +288'),
  p('Proculus',     165, 'Dexterity +6%; Constitution +10%; Intelligence +62; Intelligence +16%; Health +695'),
  p('Peregrinus',   165, 'Damage +18; Armour +821; Agility +21; Agility +44%; Constitution -12%; Critical Attack Value +44'),
  p('Marinus',      165, 'Damage +26; Strength +34; Strength +19%; Dexterity +11; Agility +21; Constitution +10%; Intelligence +64'),
  p('Victorinus',   167, 'Damage +25; Constitution -5%; Charisma +45%; Block Value +49; Threat +47; Health +650'),
  p('Nonius',       168, 'Strength +37; Agility +19; Constitution -25%; Charisma +15; Intelligence +44%; Healing +180; Critical Healing Value +71; Threat +47'),
  p('Galerius',     168, 'Damage +21; Armour +340; Strength -35%; Dexterity +39; Dexterity +42%; Agility +31%; Intelligence +60; Critical Attack Value +39'),
  p('Cornelius',    170, 'Armour +620; Strength +41%; Agility +19; Agility -21%; Constitution -8'),
  p('Acrobas',      170, 'Damage +28; Strength +35; Dexterity +5; Dexterity +8%; Agility +21; Agility -21%; Constitution +18%; Intelligence +68; Critical Healing Value +90'),
  p('Flavius',      172, 'Damage +20; Constitution +10%; Charisma +49%; Healing +50; Block Value +47; Threat +42; Health +691'),
  p('Claudius',     173, 'Damage +28; Armour +1158; Strength +46%; Dexterity +22; Dexterity -5%; Agility +19; Intelligence -6; Critical Attack Value +33'),
  p('Taurus',       175, 'Damage +28; Constitution -35%; Charisma +48%; Healing +140; Block Value +51; Threat +45; Health +715'),
  p('Junius',       177, 'Armour +220; Strength +36; Agility +20; Charisma +14; Charisma +50%; Intelligence -30%; Critical Healing Value +71; Threat +43'),
  p("Herestia's",   178, 'Damage +26; Armour +1187; Strength -5%; Dexterity -5%; Agility -5%; Intelligence +20; Intelligence +50%; Healing +326'),
  p('Saturninus',   180, 'Damage +28; Armour +785; Strength +49%; Constitution +34; Constitution +11%; Hardening Value +41; Block Value +53; Threat +137; Health +812'),
  p('Baurus',       182, 'Damage +29; Armour +1227; Strength +41; Dexterity +47%; Agility +21; Agility +27%; Intelligence -8%; Critical Attack Value +40'),
  p('Atticus',      183, 'Damage +27; Armour +30; Strength +35; Dexterity +10; Dexterity +28%; Agility +20; Constitution +12%; Intelligence +68'),
  p('Severus',      185, 'Damage +19; Armour +625; Strength +39; Strength +22%; Dexterity +33; Agility +21; Charisma +12; Charisma +47%; Intelligence -25%'),
  p('Julius',       187, 'Damage +8; Armour +482; Dexterity -10%; Agility -21; Agility -12%; Charisma +50%; Healing +252; Health +40'),
  p("Trajan's",     188, 'Damage +29; Armour +50; Strength +39; Dexterity +9; Dexterity +27%; Agility +20; Constitution +11%; Intelligence +72'),
  p('Laelius',      190, 'Damage +32; Armour +50; Constitution +12%; Charisma +40%; Block Value +59; Threat +97; Health +801'),
  p("Scipio's",     192, 'Armour +240; Agility +20; Charisma +12; Charisma +28%; Critical Healing Value +82; Threat +97'),
  p('Aurius',       193, 'Damage +30; Armour +565; Agility +21; Constitution +25; Intelligence +35%; Threat +30'),
  p('Calpurnicus',  195, 'Agility +20; Charisma -9%; Healing +367; Critical Healing Value +88; Threat +60'),
  p('Tacitus',      197, 'Damage +30; Armour +978; Dexterity +30%; Agility +15%; Block Value +58; Threat +132; Health +442'),
  p('Maximus',      198, 'Strength +81; Strength +31%; Intelligence -6; Intelligence -12%'),
  p('Helvius',      198, 'Damage +32; Armour +726; Dexterity +38%; Agility +41; Healing +348; Health +40'),
  p('Aemilius',     200, 'Damage +34; Armour +80; Constitution -12%; Charisma +50%; Blocking Value +60; Threat +82; Health +938'),
  p('Fabius',       202, 'Damage +33; Armour +1479; Dexterity +19; Agility +20; Constitution +45; Constitution +11%; Charisma -24; Charisma +50%; Healing +364; Health +50'),
  p('Astarius',     203, 'Damage +32; Armour +40; Strength +44; Strength +13%; Dexterity +8; Dexterity +26%; Agility +20; Intelligence +79'),
  p('Valcarus',     205, 'Damage +31; Armour +413; Strength +48%; Dexterity +14; Constitution +12; Constitution +12%; Critical Attack Value +41; Block Value +61; Threat +71; Health +868'),
  p('Gratianus',    207, 'Damage +34; Armour +1496; Agility +20; Constitution +31; Charisma +48%; Hardening Value +48; Block Value +58; Threat +40; Health +140'),
  p('Primus',       210, 'Damage +31; Armour +1380; Dexterity +28; Dexterity +47%; Agility +19; Agility +16%; Charisma -6; Critical Attack Value +36'),
  p('Acilius',      212, 'Damage +33; Armour +140; Strength +44; Dexterity +6; Dexterity +6%; Agility +18; Constitution +13%; Charisma -34%; Intelligence +87'),
  p('Faustus',      215, 'Damage +35; Armour +1615; Strength +31; Dexterity -35%; Agility +18; Constitution +24%; Charisma +49%; Critical Attack Value +33; Threat +220'),
  p('Bassianus',    217, 'Armour +840; Strength +33; Dexterity +31; Dexterity +5%; Agility +11%; Constitution +13%; Charisma +41; Intelligence +89; Health +891'),
  p('Augustus',     220, 'Damage +37; Armour +860; Strength +47%; Constitution +41; Constitution +14%; Hardening Value +55; Block Value +63; Threat +40; Health +853'),
  p('Domitius',     222, 'Damage +34; Armour +1637; Agility +18; Intelligence +47%; Healing +407; Threat +50'),
  p("Melior's",     225, 'Damage +21; Armour +354; Dexterity +29%; Agility +31; Constitution +25; Charisma +33; Intelligence +33; Critical Attack Value +51'),
  p('Aequitanius',  227, 'Damage +35; Armour +1683; Strength +50%; Dexterity -6%; Agility +18; Health +50'),
  p('Quietus',      230, 'Intelligence +95; Healing +451; Critical Healing Value +104'),
  p('Aquilius',     232, 'Damage +37; Armour +989; Constitution +14%; Charisma +44%; Block Value +67; Threat +90; Health +948'),
  p("Cato's",       235, 'Damage +39; Armour +1320; Agility +41%; Constitution +18%; Hardening Value +61; Block Value +75; Threat +114; Health +950'),
  p('Mercurius',    237, 'Damage +39; Armour +1738; Agility +18; Agility +48%; Healing +459; Threat +40'),
  p('Egnatius',     240, 'Damage +45; Strength +35; Strength +22%; Agility +33; Charisma +25; Charisma +31%; Intelligence -11%'),
  p('Alvius',       242, 'Damage +38; Armour +414; Strength +29; Dexterity +21; Dexterity +33%; Agility +11%; Constitution +16%; Critical Attack Value +36; Block Value +70; Health +993'),
];

// Populated when the user provides the rest of the source tables.
export const TOP_PREFIXES: AffixDef[] = [];
export const TOP_SUFFIXES: AffixDef[] = [];

export const SUFFIXES: AffixDef[] = [
  // Numeric +N enhancement suffixes -- name is literally "+1" etc., so
  // fullItemName renders "Short Sword +5".
  p('+1', 1, ''),
  p('+2', 2, ''),
  p('+3', 3, ''),
  p('+4', 4, 'Intelligence +2'),
  p('+5', 5, 'Constitution +2'),
  p('+6', 6, 'Strength +2'),
  p('+7', 7, 'Dexterity +2'),
  p('+8', 8, 'Agility +2'),
  p('+9', 9, 'Charisma +2'),
  // Named "of <X>" suffixes.
  p('of Brightness',      10, 'Charisma +10; Charisma +10%'),
  p('of Fear',            10, 'Agility -2%; Constitution +2'),
  p('of Glory',           10, 'Damage +1; Strength +2%'),
  p('of Grace',           10, 'Dexterity +5; Charisma +10%'),
  p('of Liturgy',         10, 'Healing +16'),
  p('of Looseness',       10, 'Strength +6%'),
  p('of Readiness',       10, 'Agility +5%; Health +20'),
  p('of Regret',          10, 'Strength +1; Agility +1'),
  p('of Skill',           10, 'Dexterity +2%; Agility +2'),
  p('of Stars',           10, 'Damage +1; Charisma +2%'),
  p('of Tears',           10, 'Constitution -10'),
  p('of Weakness',        10, ''),
  p('of Downfall',        11, 'Strength +1'),
  p('of Eradication',     11, 'Agility +7%; Critical Attack Value +3'),
  p('of Inquisitiveness', 11, 'Healing +20; Critical Healing Value +3'),
  p('of the Clouds',      11, 'Dexterity +2; Health +5'),
  p('of Normality',       12, 'Health +15'),
  p('of Rapidity',        12, 'Agility +10; Agility +10%'),
  p('of Reprisal',        12, 'Strength +9%'),
  p('of the Hills',       12, 'Constitution +4; Charisma +2'),
  p('of the Sea',         12, 'Dexterity +4; Agility +2; Health +10'),
  p('of Willpower',       12, 'Armour +57; Block Value +4; Threat +8'),
  p('of Wounds',          12, 'Healing +24; Critical Healing Value +4'),
  p('of Blood',           13, 'Agility +2; Health +10'),
  p('of Decapitation',    13, 'Dexterity +1; Charisma +10%; Critical Attack Value +4'),
  p('of Holiness',        13, 'Intelligence +11%; Critical Healing Value +4'),
  p('of Invisibility',    13, 'Hardening Value +4; Health +27'),
  p('of the Rain',        13, 'Agility +2; Health +8'),
  p('of Triumph',         13, 'Armour +66'),
  p('of Capriciousness',  14, 'Strength +8%; Charisma +10%'),
  p('of Concealment',     14, 'Strength +1; Intelligence -1%; Hardening Value +4'),
  p('of Consecration',    14, 'Intelligence +2; Healing +24; Critical Healing Value +6'),
  p('of Malediction',     14, 'Constitution +5%; Charisma +2%'),
  p('of the Creature',    14, 'Agility +2%'),
  p('of the Mountains',   14, 'Strength +2; Constitution +2'),
  p('of the Woods',       14, 'Damage +1; Dexterity +3; Agility +2'),
  p('of Trouble',         14, 'Strength +2%; Charisma -5'),
  p('of Balance',         15, 'Strength +2; Dexterity +2; Agility +2; Constitution +2; Charisma +2'),
  p('of Conflict',        15, 'Damage +2; Dexterity +10; Agility +2%'),
  p('of Confusion',       15, 'Damage -1; Armour +100; Dexterity -2; Constitution -1%'),
  p('of Difficulty',      15, 'Armour +10; Strength -1%; Dexterity -1%; Agility -1%'),
  p('of Failure',         15, 'Damage -5; Charisma +10'),
  p('of Greed',           15, 'Dexterity -5%'),
  p('of Hesitation',      15, 'Armour +35; Agility -2; Charisma +2'),
  p('of Hindrance',       15, 'Armour +20; Dexterity -2; Agility -2'),
  p('of Honour',          15, 'Constitution +1%; Charisma +5; Charisma +15%'),
  p('of Incompetence',    15, 'Dexterity -2'),
  p('of Inevitability',   15, 'Armour +93; Strength +11%'),
  p('of Insult',          15, 'Damage +1; Dexterity +2%; Charisma -2; Health +20'),
  p('of Learning',        15, 'Damage +1; Armour +40; Constitution +4; Charisma +2'),
  p('of Madness',         15, 'Dexterity +2; Agility +3; Health +2'),
  p('of Magic',           15, 'Dexterity +10; Charisma +10%'),
  p('of Magnitude',       15, 'Strength +3%; Charisma +5%'),
  p('of Melting',         15, 'Strength +1; Dexterity -2; Agility +1; Charisma +8%'),
  p('of Mourning',        15, 'Constitution -4; Health +100'),
  p('of Pride',           15, 'Strength -5%; Constitution +5%; Charisma +5%'),
  p('of Satisfaction',    15, 'Damage +2; Health +20'),
  p('of Spirituality',    15, 'Constitution -13%; Healing +32; Critical Healing Value +6'),
  p('of Success',         15, 'Damage +2; Strength +2'),
  p('of Suspicion',       15, 'Charisma -4%'),
  p('of Vigour',          15, 'Strength +10%'),
  p('of Emasculation',    16, 'Intelligence +15%'),
  p('of Generosity',      16, 'Strength +5; Constitution +5%; Charisma +5%'),
  p('of Martial Arts',    16, 'Strength +1; Charisma +2; Charisma +10%; Critical Attack Value +7'),
  p('of Ordinance',       16, 'Intelligence +11%; Healing +32'),
  p('of Pain',            16, 'Damage +1; Strength +5; Agility +20%'),
  p('of Reversion',       16, 'Armour +80; Hardening Value +4'),
  p('of Warning',         16, 'Damage +1; Armour +25; Dexterity +4'),
  p('of Demolition',      17, 'Charisma +2; Charisma +11%; Intelligence -1%; Critical Attack Value +5'),
  p('of Desperation',     17, 'Constitution +4; Charisma +2'),
  p('of Fairness',        17, 'Constitution +5; Charisma +15%'),
  p('of Self-Assurance',  17, 'Strength +2; Strength +13%'),
  p('of the Blessed',     17, 'Damage -1; Intelligence +1; Healing +28; Critical Healing Value +5'),
  p('of Arrogance',       18, 'Charisma -5%; Health +100'),
  p('of Attrition',       18, 'Strength +17%; Charisma -2'),
  p('of Belief',          18, 'Armour +100; Charisma +20%; Health +100'),
  p('of Ceremony',        18, 'Intelligence +2; Intelligence +11%; Healing +36'),
  p('of Distraction',     18, 'Dexterity +3; Dexterity +10%; Agility +10%'),
  p('of Haughtiness',     18, 'Damage -2; Strength -1%; Charisma +15%'),
  p('of Meat',            18, 'Strength +2; Constitution -2; Charisma +12%; Critical Attack Value +5'),
  p('of the Moon',        18, 'Strength +4; Agility +2%; Health +10'),
  p('of Brutality',       19, 'Damage +3; Strength +6'),
  p('of Chakra',          19, 'Strength +14%; Charisma +13%'),
  p('of Haste',           19, 'Dexterity +2%; Agility +10%'),
  p('of Inadequacy',      19, 'Health +46'),
  p('of Nostalgia',       19, 'Strength +16%; Agility +13%'),
  p('of Religiousness',   19, 'Intelligence +1; Intelligence +13%; Healing +44; Critical Healing Value +6'),
  p('of Apprenticeship',  20, 'Damage +3; Strength +2; Dexterity +2'),
  p('of Assassination',   20, 'Damage +4; Dexterity +4; Dexterity +2%; Agility +4%'),
  p('of Battle',          20, 'Strength +4; Strength +5%'),
  p('of Cleverness',      20, 'Intelligence +12%; Healing +36'),
  p('of Courage',         20, 'Charisma +5; Charisma +20%; Health +50'),
  p('of Diligence',       20, 'Charisma +20%; Health +20'),
  p('of Endurance',       20, 'Armour +30; Strength +3%; Constitution +15%'),
  p('of Favour',          20, 'Armour +100; Constitution +5; Charisma +2%; Health +20'),
  p('of Harmony',         20, 'Constitution +20%; Charisma +20%'),
  p('of Health',          20, 'Armour +10; Constitution +2%; Health +30'),
  p('of Illusion',        20, 'Dexterity +2%; Agility +4; Charisma +4; Health +100'),
  p('of Independence',    20, 'Armour +100; Dexterity +2; Agility +2; Constitution +3; Health +40'),
  p('of Magnificence',    20, 'Armour +60; Charisma +4; Charisma +2%; Health +20'),
  p('of Obsession',       20, 'Dexterity +2%; Charisma -5%'),
  p('of Peace',           20, 'Constitution +10%'),
  p('of Passion',               25, 'Damage +1; Armour +50; Dexterity +5'),
  p('of Protection',            25, 'Armour +150; Constitution +2%'),
  p('of Purity',                25, 'Charisma -21%; Intelligence +2; Intelligence +16%; Healing +40'),
  p('of Riot',                  25, 'Damage +2; Armour +100; Constitution +5; Charisma +2; Health +100'),
  p('of Slaughtering',          25, 'Strength +20%; Agility -5%'),
  p('of Spiritual Superiority', 25, 'Intelligence +3; Intelligence +23%; Healing +56'),
  p('of the Undead',            25, 'Dexterity +2%; Agility +2%; Charisma -2%'),
  p('of Marriage',              26, 'Strength +3; Health +71'),
  p('of Restitution',           26, 'Intelligence +17%; Healing +56'),
  p('of Suffering',             26, 'Agility +21%; Charisma +17%'),
  p('of Concentration',         27, 'Constitution -4; Intelligence +19%; Healing +52'),
  p('of Crime',                 27, 'Dexterity -24%; Agility +3; Agility +25%'),
  p('of Sacrifice',             27, 'Armour +124'),
  p('of Baptism',               28, 'Intelligence +16%; Healing +40; Critical Healing Value +11'),
  p('of Purposefulness',        28, 'Strength +20%; Health +86'),
  p('of Spreader',              28, 'Strength +19%; Agility +4; Charisma +18%'),
  p('of the Amazons',           28, 'Strength +2; Strength +26%; Charisma +16%'),
  p('of Expansion',             29, 'Strength +2; Strength +25%; Agility +3; Intelligence -2%'),
  p('of Homunculus',            29, 'Armour +164; Strength +2'),
  p('of Knowledge',             29, 'Intelligence +18%; Healing +52'),
  p('of Antiquity',             30, 'Strength +27%; Agility +4; Charisma +3'),
  p('of Denomination',          30, 'Strength -27%; Intelligence +3; Intelligence +23%; Critical Healing Value +12'),
  p('of Mercy',                 30, 'Strength +2; Strength +18%; Intelligence -2%'),
  p('of Perfection',            30, 'Dexterity +10%; Agility +10%'),
  p('of Thorns',                30, 'Armour +100; Agility -1%'),
  p('of War',                   30, 'Constitution +5%'),
  p('of Calling',               31, 'Strength +3; Strength +23%; Intelligence -2%'),
  p('of Mars',                  31, 'Strength +23%; Dexterity +28%'),
  p('of Prevention',            31, 'Strength +27%; Block Value +12; Threat +30'),
  p('of Rigor Mortis',          31, 'Intelligence +3; Intelligence +19%; Healing +13'),
  p('of Hypocrisy',             32, 'Damage -4; Intelligence +3; Healing +68'),
  p('of Orion',                 32, 'Health +96'),
  p('of Superiority',           32, 'Agility +27%; Charisma +22%'),
  p('of Alleluia',              33, 'Intelligence +30%; Healing +48; Critical Healing Value +12'),
  p('of Elimination',           33, 'Strength +24%; Dexterity +28%; Charisma +4; Critical Attack Value +10'),
  p('of Malice',                33, 'Damage +4; Strength +15%'),
  p('of Stamina',               33, 'Health +83'),
  p('of Accuracy',              34, 'Armour +206'),
  p('of Aggression',            34, 'Strength +3; Dexterity +3; Dexterity +29%; Intelligence -3%; Critical Attack Value +12'),
  p('of Recovery',              34, 'Intelligence +24%; Healing +72'),
  p('of Regeneration',          34, 'Strength -4; Intelligence +3; Healing +56; Critical Healing Value +9'),
  p('of Caesar',                35, 'Strength +3; Strength +24%; Intelligence -3%'),
  p('of Considerateness',       35, 'Intelligence +3; Intelligence +21%; Healing +80'),
  p('of Heaven',                35, 'Armour +300; Constitution +5%; Charisma +20%; Health +100'),
  p('of Pressure',              35, 'Strength +31%; Agility +4; Charisma +20%'),
  p('of the Damned',            35, 'Strength +5%; Charisma -2%'),
  p('of Death',                 36, 'Strength +4; Charisma +5; Charisma +28%; Intelligence -3%; Critical Attack Value +16'),
  p('of Fatuity',               36, 'Intelligence +3; Intelligence +31%; Critical Healing Value +14'),
  p('of Sickness',              36, 'Armour +203; Strength +3; Strength +32%'),
  p('of Benevolence',           37, 'Charisma -4; Intelligence +5; Healing +72'),
  p('of Execution',             37, 'Strength +34%; Dexterity +26%; Critical Attack Value +14'),
  p('of the Flesh Wound',       37, 'Strength +3; Agility +4; Agility +30%; Intelligence -3'),
  p('of the Safe Parade',       37, 'Strength +26%; Hardening Value +14; Block Value +13; Threat +38'),
  p('of Freedom',               38, 'Strength +5; Strength +26%; Agility +3; Charisma +28%'),
  p('of Healing',               38, 'Intelligence +31%; Healing +76'),
  p('of Total Defence',         38, 'Strength +4; Intelligence -2%; Hardening Value +13; Block Value +11; Threat +40'),
  p('of Blocking',              39, 'Strength +4; Block Value +17; Threat +44; Health +80'),
  p('of Ingenuity',             39, 'Intelligence +5; Intelligence +32%; Healing +76'),
  p('of the Critical Strike',   39, 'Strength +4; Charisma +5; Charisma +28%; Intelligence -3%; Critical Attack Value +14'),
  p('of Hell',                  40, 'Damage +5; Armour +200; Strength +2%; Constitution +15%'),
  p('of Retribution',           40, 'Damage +6; Strength +10; Dexterity +5'),
  p('of the Vanquishers',       40, 'Armour +240'),
  p('of Fire',                  41, 'Damage +3; Dexterity +9; Agility +9; Charisma +12; Critical Attack Value +18'),
  p('of Insanity',              41, 'Agility +8; Intelligence +17; Healing +85; Critical Healing Value +18'),
  p('of Dominance',             42, 'Damage +4; Strength +15; Charisma +10; Critical Attack Value +10; Block Value +20; Threat +15; Health +250'),
  p('of Ease',                  43, 'Damage +2; Armour +200; Dexterity +20; Agility +20'),
  p('of Triviality',            43, 'Strength +15; Dexterity +15; Agility +15; Intelligence +15'),
  p('of Hope',                  44, 'Damage +6; Charisma +13; Intelligence +13'),
  p('of the Curse',             45, 'Damage +4; Armour +250; Strength +5; Charisma +15; Intelligence +10'),
  p('of Strength',              46, 'Strength +25; Critical Attack Value +20; Health +300'),
  p('of Promise',               47, 'Damage +2; Armour +200; Dexterity +5; Agility +5; Constitution +10; Charisma +5; Block Value +25'),
  p('of Earth',                 48, 'Damage +5; Armour +300; Strength +15; Constitution +8; Block Value +30; Threat +50'),
  p('of Truth',                 48, 'Agility +8; Intelligence +23; Healing +90; Critical Healing Value +15'),
  p('of Rivalry',               49, 'Damage +3; Armour +200; Constitution +5; Charisma +15'),
  p('of Love',                  50, 'Intelligence +20; Healing +100; Critical Healing Value +25'),
  p('of the Dragon',            50, 'Damage +7; Dexterity +15; Agility +15; Charisma +5'),
  p('of Cold',                  51, 'Strength +21; Healing +115; Critical Healing Value +35; Health +411'),
  p('of the Elysian Fields',    51, 'Armour +400; Agility +8; Charisma -24; Health -306'),
  p('of Despair',               52, 'Strength +35%; Dexterity +37; Dexterity +22%; Charisma +23; Threat +17'),
  p('of Gloom',                 52, 'Damage +7; Armour +368; Strength +10; Strength +25%; Dexterity +17%; Agility +35%; Intelligence -15%'),
  p('of Heat',                  52, 'Armour +300; Strength -22%; Charisma +18; Healing +140'),
  p('of Misery',                52, 'Armour +389; Strength +19; Charisma +25; Charisma -35%'),
  p('of Qualm',                 52, 'Strength -35%; Dexterity +38; Critical Attack Value +12; Health +353'),
  p('of Dusk',                  53, 'Strength +24; Constitution +5%; Charisma +5%'),
  p('of Dolour',                54, 'Strength +10; Dexterity +19; Constitution +19%; Healing +132; Critical Attack Value +12; Hardening Value +18; Threat +24'),
  p('of Night',                 54, 'Strength +23; Critical Attack Value +13'),
  p('of Shrieks',               54, 'Healing +108; Critical Healing Value +35'),
  p('of the Phantom',           54, 'Strength +25%; Constitution +6; Constitution -5%; Health +321'),
  p('of the Spirit',            54, 'Agility +8; Charisma +14%; Threat +15'),
  p('of Acheron',               55, 'Strength +22; Agility +31%; Constitution -10; Constitution +5%; Intelligence +25'),
  p('of Judgement',             55, 'Strength +10; Dexterity +15; Dexterity +35%; Constitution -15; Charisma +18; Charisma +15%; Healing +133'),
  p('of Mercury',               55, 'Damage -3; Agility +8; Intelligence +16; Intelligence +19%; Block Value +31'),
  p('of Solitude',              55, 'Armour +400; Intelligence +40%; Healing +105'),
  p('of the Behemoth',          55, 'Strength +33%; Constitution +8; Threat +28; Health +413'),
  p('of the Shadows',           55, 'Damage +4; Armour +345; Intelligence +24%'),
  p('of the Soul',              55, 'Strength +19; Strength +31%; Charisma -13'),
  p('of Cerberus',              56, 'Strength +10'),
  p('of Demons',                56, 'Strength +18; Agility +23%; Charisma +25; Health +347'),
  p('of Stone',                 56, 'Dexterity +17%; Agility +18'),
  p('of Tartarus',              56, 'Constitution -11; Critical Healing Value +35'),
  p('of the Hydra',             56, 'Strength +27%; Intelligence +18'),
  p('of the Unknown',           56, 'Damage +5; Intelligence +31%; Health +349'),
  p('of Transition',            56, 'Armour +354; Critical Healing Value +35'),
  p('of Angst',                 57, 'Strength +10; Constitution -13; Critical Healing Value +35'),
  p('of Peril',                 57, 'Strength +31; Dexterity +10%; Charisma -25; Critical Attack Value +17'),
  p('of Wings',                 57, 'Armour +324; Charisma +12%; Critical Attack Value +24'),
  p('of Bondage',               58, 'Damage -8; Armour +348; Strength +31; Strength -10%; Charisma +35%'),
  p('of Destruction',           58, 'Strength -23; Critical Healing Value +35; Health +405'),
  p('of Dread',                 58, 'Dexterity +18%; Constitution +5; Healing +140; Health +351'),
  p('of Escape',                58, 'Strength +35%; Agility +23; Constitution +9'),
  p('of Languor',               58, 'Damage +5; Constitution +6; Charisma +35%; Intelligence +28%'),
  p('of the Abyss',             58, 'Block Value +35'),
  p('of the Apparition',        58, 'Damage -7; Strength +15; Strength +10%; Intelligence -15%'),
  p('of the Deep',              58, 'Damage +6; Strength +33; Agility +11; Charisma +18; Critical Healing Value +34'),
  p('of the Dream',             58, 'Dexterity +23; Agility +8; Charisma +20; Charisma +21%'),
  p('of the Inferno',           58, 'Damage +8; Armour +382; Strength +11; Strength +24%; Intelligence +22; Intelligence +20%; Healing +140'),
  p('of the Snake',             58, 'Strength +35%; Constitution -13; Constitution +5%; Charisma +25; Intelligence -40%'),
  p('of Torment',               58, 'Damage +7; Intelligence +24%'),
  p('of Torsion',               58, 'Strength +29%; Charisma +17; Charisma +15%; Health +460'),
  p('of Agony',                 59, 'Dexterity +35%; Healing +112; Critical Attack Value +17'),
  p('of Anguish',               59, 'Armour +392; Strength +29%; Agility +22; Healing +140; Health +422'),
  p('of Decay',                 60, 'Dexterity +31; Charisma +35%; Critical Healing Value +35'),
  p('of the Gods',              60, 'Agility +30%; Charisma +10; Critical Healing Value +35'),
  p('of the Plague',            60, 'Agility +5%; Charisma +25; Threat +37; Health +419'),
  p('of the Sphinx',            60, 'Damage +4; Armour +398; Strength +26; Dexterity +17%'),
  p('of Torture',               60, 'Armour +304; Charisma +32%; Threat +32'),
  p('of Hellfire',              65, 'Constitution -12'),
  p('of Faith',                 70, 'Constitution -18%; Charisma -5%; Block Value +38'),
  p('of the Druid',             75, 'Armour +398; Charisma +24; Intelligence -12; Intelligence -15%; Critical Attack Value +15'),
  p('of the Chasm',             80, 'Charisma +20%; Intelligence -18; Health +406'),
  p('of Renown',                85, 'Damage +3; Agility -20%; Constitution +19; Constitution +19%; Charisma +13%; Hardening Value +14; Blocking Value +53; Health +79'),
  p('of Arbitration',           85, 'Strength -11; Agility +14; Charisma +18%; Intelligence +29; Healing +295; Blocking Value +39'),
  p('of the Elder',             85, 'Armour +235; Constitution +19; Charisma +24; Intelligence +9; Healing +195; Critical Healing Value +67; Hardening Value +15; Threat +79'),
  p('of Impermanence',          85, 'Damage -1; Armour +547; Strength +33; Dexterity +24%; Blocking Value +61; Health +62'),
  p('of Challenge',             85, 'Armour +283; Charisma +17%; Intelligence +14%; Healing +215; Critical Healing Value +63'),
  p('of Legend',                87, 'Agility +24; Healing +210; Critical Healing Value +69; Threat +82; Health +38'),
  p('of Bloodletting',          87, 'Damage +5; Armour +259; Strength +11; Dexterity +21; Charisma +14%; Threat +76; Health +599'),
  p('of the Fallen',            88, 'Damage +7; Armour +558; Strength +11%; Charisma +25; Critical Attack Value +18'),
  p('of Bravery',               90, 'Charisma +25; Healing +59; Critical Healing Value +67; Health +37'),
  p('of the Saviour',           90, 'Damage -4; Armour +640; Constitution +17; Constitution +34%; Blocking Value +83; Threat +135'),
  p('of Ruthlessness',          90, 'Damage -2; Armour +575; Strength +33; Dexterity +25%; Critical Healing Value +38'),
  p('of Corruption',            90, 'Armour +80; Strength +28; Strength +18%; Constitution +11; Healing +95; Critical Healing Value +72; Blocking Value +59'),
  p('of Deference',             92, 'Armour +600; Charisma +27; Critical Attack Value +18; Threat +41; Health +79'),
  p('of Distance',              93, 'Strength +23%; Healing +85; Blocking Value +52; Health +75'),
  p('of the Eclipse',           94, 'Damage +8; Armour +180; Dexterity +8%; Agility +25; Agility +19%; Hardening Value +13; Blocking Value +59; Health +38'),
  p('of Myth',                  95, 'Damage +7; Armour +219; Strength +19; Strength +12%; Dexterity -25%; Agility +12%; Constitution +12%; Charisma +12%; Intelligence +14; Intelligence +12%; Critical Attack Value +15'),
  p('of Reason',                95, 'Damage +4; Armour +640; Strength +18%; Dexterity +24; Constitution -12; Hardening Value +19; Blocking Value +75'),
  p('of Shade',                 95, 'Strength +20%; Dexterity +32; Charisma +28; Critical Healing Value +73; Blocking Value +38; Threat +130'),
  p('of Vengeance',             95, 'Damage -2; Armour +564; Strength +34; Dexterity +26%; Healing +58; Blocking Value +82'),
  p('of Purification',          95, 'Armour +80; Healing +160; Critical Healing Value +48'),
  p('of Unyielding',            97, 'Armour +140; Strength +23%; Dexterity +19%; Healing +58; Health +723'),
  p('of Fortune',               98, 'Damage +10; Armour +615; Dexterity +12; Dexterity +14%; Charisma +28; Charisma +16%; Critical Attack Value +18; Blocking Value +39; Threat +41'),
  p('of the Arena',            100, 'Healing +349; Critical Healing Value +58'),
  p('of Awe',                  101, 'Armour +79; Agility +30; Healing +268; Critical Healing Value +55; Threat +75'),
  p('of Destiny',              102, 'Armour +90; Constitution -4; Blocking Value +39; Health +84'),
  p('of Prudence',             103, 'Damage -5; Armour +683; Strength +37; Constitution +26%; Blocking Value +59; Health +80'),
  p('of Threat',               105, 'Damage +13; Armour +708; Agility +29%; Charisma +30; Critical Healing Value +39; Critical Attack Value +17'),
  p('of Daredevilry',          107, 'Armour +580; Strength +21; Dexterity +13%; Agility +16; Constitution +19; Intelligence +13%; Hardening Value +22; Blocking Value +62; Threat +64'),
  p('of Broken Oaths',         108, 'Agility +31; Healing +300; Critical Healing Value +62; Health +41'),
  p('of Swordplay',            110, 'Armour +210; Strength -10%; Agility -12%; Charisma +12; Charisma +11%; Intelligence +49; Intelligence +29%; Healing +485; Critical Healing Value +89; Health +77'),
  p('of Ramparts',             112, 'Damage +14; Armour +695; Strength +35; Strength +21%; Constitution +18; Charisma -18%; Intelligence -8; Critical Attack Value +19; Hardening Value +18; Threat +110; Health +82'),
  p('of Absolution',           115, 'Armour +756; Dexterity +12; Agility +24; Constitution -19; Charisma +33; Intelligence +16; Healing +39; Critical Attack Value +19; Health +85'),
  p('of Exultation',           117, 'Damage +7; Armour +480; Strength +43; Intelligence +22%; Health +75'),
  p('of Justice',              120, 'Damage +18; Armour +61; Strength +38; Intelligence -20%; Critical Attack Value -9; Blocking Value +40'),
  p('of Menace',               122, 'Damage +9; Armour +745; Dexterity +21; Dexterity -6%; Agility +22%; Constitution +20%; Charisma -10%; Critical Attack Value +20; Threat +38'),
  p('of Heroism',              125, 'Armour +90; Dexterity -7%; Agility +33; Charisma +21%; Intelligence +47; Healing +554; Critical Healing Value +70; Blocking Value +81'),
  p('of Resolve',              127, 'Damage +8; Armour +828; Strength +51; Dexterity +29%; Constitution +39; Constitution +9%; Hardening Value +25; Blocking Value +61'),
  p('of Ascendency',           130, 'Armour +375; Strength -8%; Dexterity +23; Agility +38; Charisma +19; Charisma +39%; Health +1025'),
  p('of Hazard',               132, 'Armour +56; Agility +37; Healing +312; Critical Healing Value +65; Threat +80'),
  p('of Force',                132, 'Damage +12; Armour +812; Strength +19%; Dexterity +19%; Agility +19%; Constitution -18%; Charisma +39; Critical Attack Value +21; Blocking Value +59'),
];

// Pick the highest-level affix in `pool` that the item can use (level
// <= itemLevel). Returns null when the item is below the table's floor.
export function pickAffix(pool: AffixDef[], itemLevel: number, rng = Math.random): AffixDef | null {
  const eligible = pool.filter((a) => a.level <= itemLevel);
  if (eligible.length === 0) return null;
  // Weight toward affixes near the item's own level so a level-100
  // weapon doesn't keep landing "Amoviels" entries.
  const top = Math.max(eligible[0].level, itemLevel - 8);
  const sweet = eligible.filter((a) => a.level >= top);
  const bucket = sweet.length > 0 ? sweet : eligible;
  return bucket[Math.floor(rng() * bucket.length)];
}

// Merge prefix/suffix bonuses into a base item descriptor (one extra
// flat addition per matching field). Affix display names are stamped
// onto `out.prefix` / `out.suffix` so fullItemName() can render them.
export function mergeAffixes(
  base: any,
  prefix?: AffixDef | null,
  suffix?: AffixDef | null,
): any {
  const out = { ...base };
  for (const affix of [prefix, suffix]) {
    if (!affix) continue;
    for (const f of AFFIX_FIELDS) {
      const v = affix.bonuses[f];
      if (typeof v === 'number' && v !== 0) {
        out[f] = (out[f] ?? 0) + v;
      }
    }
  }
  if (prefix?.name) out.prefix = prefix.name;
  if (suffix?.name) out.suffix = suffix.name;
  return out;
}
