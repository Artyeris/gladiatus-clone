import { CharacterInterface } from '@/lib/interfaces/character.interface';

export type VictoryCategory =
  | 'general'
  | 'items'
  | 'social'
  | 'guild'
  | 'trade'
  | 'arena'
  | 'circus'
  | 'dungeons'
  | 'underworld';

export const CATEGORY_LABELS: Record<VictoryCategory, string> = {
  general: 'General',
  items: 'Items',
  social: 'Social',
  guild: 'Guild',
  trade: 'Trade',
  arena: 'Arena',
  circus: 'Circus Turma',
  dungeons: 'Dungeons',
  underworld: 'Underworld',
};

export interface VictoryTier {
  target: number;
  points: number;
  title?: string;
}

export interface VictoryDef {
  id: string;
  category: VictoryCategory;
  name: string;
  description: string;
  // Path on the character (or computed key) used to read current progress.
  statKey: string;
  tiers: VictoryTier[];
}

const tieredProgress = [
  { target: 1, points: 1 },
  { target: 10, points: 5 },
  { target: 50, points: 10 },
  { target: 100, points: 20 },
  { target: 500, points: 30 },
  { target: 1000, points: 40 },
  { target: 5000, points: 50 },
];

const milestone = [{ target: 1, points: 5 }];

export const VICTORIES: VictoryDef[] = [
  // General
  { id: 'gold_earned',         category: 'general', name: 'Earn gold',                description: 'Earn gold from battles, prizes and sales.',  statKey: 'goldEarned',      tiers: tieredProgress },
  { id: 'train_strength',      category: 'general', name: 'Train strength',           description: 'Train your strength at the barracks.',        statKey: 'trainCount.strength',     tiers: tieredProgress },
  { id: 'train_dexterity',     category: 'general', name: 'Train dexterity',          description: 'Train your dexterity.',                        statKey: 'trainCount.dexterity',    tiers: tieredProgress },
  { id: 'train_agility',       category: 'general', name: 'Train mobility',           description: 'Train your agility / mobility.',               statKey: 'trainCount.agility',      tiers: tieredProgress },
  { id: 'train_endurance',     category: 'general', name: 'Train constitution',       description: 'Train your endurance.',                        statKey: 'trainCount.endurance',    tiers: tieredProgress },
  { id: 'train_charisma',      category: 'general', name: 'Train charisma',           description: 'Train your charisma.',                         statKey: 'trainCount.charisma',     tiers: tieredProgress },
  { id: 'train_intelligence',  category: 'general', name: 'Train intelligence',       description: 'Train your intelligence.',                     statKey: 'trainCount.intelligence', tiers: tieredProgress },
  { id: 'collect_honour',      category: 'general', name: 'Collect honour',           description: 'Accumulate honour from battles.',              statKey: 'honor',           tiers: tieredProgress },
  { id: 'collect_honour_prov', category: 'general', name: 'Collect honour (Provinciarum)', description: 'Honour earned in Provinciarum arenas.',  statKey: 'honorProvinciarum', tiers: tieredProgress },
  { id: 'fame',                category: 'general', name: 'Get fame',                 description: 'Earn fame from dungeons.',                     statKey: 'fame',            tiers: tieredProgress },
  { id: 'fame_prov',           category: 'general', name: 'Get fame (Provinciarum)',  description: 'Fame earned in Circus Provinciarum.',          statKey: 'fameProvinciarum', tiers: tieredProgress },
  { id: 'work',                category: 'general', name: 'Go to work',               description: 'Complete jobs at the workplaces.',             statKey: 'workCount',       tiers: tieredProgress },

  // Items
  { id: 'find_items',          category: 'items',   name: 'Find items',               description: 'Find any items.',                              statKey: 'itemsFound',          tiers: tieredProgress },
  { id: 'find_blue',           category: 'items',   name: 'Find blue items',          description: 'Find blue (Neptune) items.',                   statKey: 'itemsFoundBlue',      tiers: tieredProgress },
  { id: 'find_purple',         category: 'items',   name: 'Find purple items',        description: 'Find purple (Martian) items.',                 statKey: 'itemsFoundPurple',    tiers: tieredProgress },
  { id: 'find_orange',         category: 'items',   name: 'Find orange items',        description: 'Find orange (Jupiter) items.',                 statKey: 'itemsFoundOrange',    tiers: tieredProgress },

  // Social
  { id: 'circle_buddies',      category: 'social',  name: 'Increase circle of buddies', description: 'Add gladiators to your Familia.',            statKey: 'buddiesAdded',        tiers: tieredProgress },
  { id: 'look_profiles',       category: 'social',  name: 'Look at profiles',         description: 'View other gladiators\' profiles.',            statKey: 'profilesViewed',      tiers: tieredProgress },
  { id: 'be_seen',             category: 'social',  name: 'Be the centre of attention', description: 'Other players viewed your profile.',         statKey: 'profileViews',        tiers: tieredProgress },

  // Guild
  { id: 'guild_donate',        category: 'guild',   name: 'Donate gold',              description: 'Donate gold to the guild bank.',               statKey: 'guildGoldDonated',    tiers: tieredProgress },
  { id: 'guild_store',         category: 'guild',   name: 'Store items',              description: 'Place items in the guild warehouse.',          statKey: 'guildItemsStored',    tiers: tieredProgress },
  { id: 'guild_heal',          category: 'guild',   name: 'Have yourself healed',     description: 'Heal at the guild doctor.',                    statKey: 'guildHealsReceived',  tiers: tieredProgress },
  { id: 'guild_pray',          category: 'guild',   name: 'Pray in the temple',       description: 'Pray in the guild temple.',                    statKey: 'guildPrayers',        tiers: tieredProgress },
  { id: 'guild_battle',        category: 'guild',   name: 'Fight with the guild',     description: 'Take part in guild battles.',                  statKey: 'guildBattles',        tiers: tieredProgress },
  { id: 'guild_battle_win',    category: 'guild',   name: 'Win guild battles',        description: 'Win guild battles.',                           statKey: 'guildBattleWins',     tiers: tieredProgress },
  { id: 'guild_recipes',       category: 'guild',   name: 'Store recipes',            description: 'Store recipes in the guild library.',          statKey: 'guildRecipesStored',  tiers: tieredProgress },
  { id: 'guild_recipes_act',   category: 'guild',   name: 'Activate recipes',         description: 'Activate guild recipes.',                      statKey: 'guildRecipesActivated', tiers: tieredProgress },
  { id: 'negotium_catch',      category: 'guild',   name: 'Catch dungeon bosses',     description: 'Catch dungeon bosses for Negotium X.',         statKey: 'negotiumCaught',      tiers: tieredProgress },
  { id: 'negotium_defeat',     category: 'guild',   name: 'Defeat dungeon bosses',    description: 'Defeat caught Negotium X bosses.',             statKey: 'negotiumDefeated',    tiers: tieredProgress },

  // Trade
  { id: 'trade_sell',          category: 'trade',   name: 'Sell items',               description: 'Sell items to merchants.',                     statKey: 'merchantSells',       tiers: tieredProgress },
  { id: 'trade_buy',           category: 'trade',   name: 'Buy items',                description: 'Buy items from merchants.',                    statKey: 'merchantBuys',        tiers: tieredProgress },
  { id: 'market_sell',         category: 'trade',   name: 'Sell market items',        description: 'Sell items on the market.',                    statKey: 'marketSells',         tiers: tieredProgress },
  { id: 'market_buy',          category: 'trade',   name: 'Buy market items',         description: 'Buy items from the market.',                   statKey: 'marketBuys',          tiers: tieredProgress },
  { id: 'auctions_won',        category: 'trade',   name: 'Win auctions',             description: 'Win auctions.',                                statKey: 'auctionsWon',         tiers: tieredProgress },

  // Arena
  { id: 'arena_wins',          category: 'arena',   name: 'Win in the arena',         description: 'Defeat other gladiators in your league.',      statKey: 'arenaWins',           tiers: tieredProgress },
  { id: 'arena_wins_prov',     category: 'arena',   name: 'Win in the arena (Provinciarum)', description: 'Win Provinciarum arena battles.',     statKey: 'arenaWinsProvinciarum', tiers: tieredProgress },
  { id: 'arena_dmg_dealt',     category: 'arena',   name: 'Deal out damage',          description: 'Damage dealt to gladiators.',                  statKey: 'arenaDamageDealt',    tiers: tieredProgress },
  { id: 'arena_dmg_taken',     category: 'arena',   name: 'Accept damage',            description: 'Damage received from gladiators.',             statKey: 'arenaDamageTaken',    tiers: tieredProgress },
  { id: 'arena_dmg_absorbed',  category: 'arena',   name: 'Absorb damage',            description: 'Damage absorbed by armor.',                    statKey: 'arenaDamageAbsorbed', tiers: tieredProgress },
  { id: 'arena_streak',        category: 'arena',   name: 'Win in succession',        description: 'Win arena battles in a row.',                  statKey: 'arenaWinStreak',      tiers: tieredProgress },
  { id: 'arena_pot',           category: 'arena',   name: 'Win arena pot',            description: 'Win the arena pot for your league.',           statKey: 'arenaPotsWon',        tiers: tieredProgress },
  { id: 'arena_kills',         category: 'arena',   name: 'Kill gladiators',          description: 'Win with the enemy below 10 HP.',              statKey: 'arenaKills',          tiers: tieredProgress },
  { id: 'arena_deaths',        category: 'arena',   name: 'Die in the arena',         description: 'Lose with yourself below 10 HP.',              statKey: 'arenaDeaths',         tiers: tieredProgress },
  { id: 'arena_naked',         category: 'arena',   name: 'Win naked',                description: 'Win an arena battle without armor.',           statKey: 'arenaNakedWins',      tiers: milestone },

  // Circus Turma
  { id: 'circus_wins',         category: 'circus',  name: 'Win in Circus Turma',      description: 'Defeat enemy groups in Circus Turma.',         statKey: 'circusWins',          tiers: tieredProgress },
  { id: 'circus_wins_prov',    category: 'circus',  name: 'Defeat in Circus Turma (Provinciarum)', description: 'Win Circus Provinciarum.',     statKey: 'circusWinsProvinciarum', tiers: tieredProgress },
  { id: 'circus_dmg_dealt',    category: 'circus',  name: 'Deal out damage',          description: 'Damage dealt against groups.',                 statKey: 'circusDamageDealt',   tiers: tieredProgress },
  { id: 'circus_dmg_taken',    category: 'circus',  name: 'Accept damage',            description: 'Damage taken from groups.',                    statKey: 'circusDamageTaken',   tiers: tieredProgress },
  { id: 'circus_dmg_absorbed', category: 'circus',  name: 'Absorb damage',            description: 'Damage absorbed in Circus Turma.',             statKey: 'circusDamageAbsorbed', tiers: tieredProgress },
  { id: 'circus_streak',       category: 'circus',  name: 'Win in succession',        description: 'Win Circus Turma battles in a row.',           statKey: 'circusWinStreak',     tiers: tieredProgress },
  { id: 'circus_pot',          category: 'circus',  name: 'Win Circus Turma pot',     description: 'Win the Circus Turma pot.',                    statKey: 'circusPotsWon',       tiers: tieredProgress },

  // Dungeons
  { id: 'dungeon_complete',    category: 'dungeons', name: 'Dungeon successfully completed', description: 'Complete dungeons and defeat the bosses.', statKey: 'dungeonsCleared',  tiers: tieredProgress },

  // Underworld
  { id: 'dispater_easy',       category: 'underworld', name: "Dis Pater's Agitator",  description: 'Defeat Dis Pater on Easy.',                    statKey: 'disPaterEasy',        tiers: milestone },
  { id: 'dispater_med',        category: 'underworld', name: 'Curse of the Underworld', description: 'Defeat Dis Pater on Medium.',                statKey: 'disPaterMedium',      tiers: milestone },
  { id: 'dispater_hard',       category: 'underworld', name: 'Long live the King',    description: 'Defeat Dis Pater on Hard.',                    statKey: 'disPaterHard',        tiers: milestone },
];

// Many statKeys in this table refer to fields we don't track on the
// character document directly (yet). Map the ones we *do* feed into
// gameplay actions onto the actual storage path (often
// character.journal.<bucket>.<field>) so the Victories page reads
// real numbers instead of permanent zeros. Anything not in this map
// still works for direct character paths like `honor` or
// `trainCount.strength` via the fallback walk.
const STAT_ALIAS: Record<string, string> = {
  goldEarned:        'crowns',
  honor:             'honor',
  itemsFound:        'itemsFound',
  workCount:         'workCount',
  arenaWins:         'journal.arena.wins',
  arenaDamageDealt:  'journal.arena.damageInflicted',
  arenaDamageTaken:  'journal.arena.damageReceived',
};

// Read a possibly nested key from the character object.
function readStat(character: CharacterInterface, statKey: string): number {
  const resolved = STAT_ALIAS[statKey] ?? statKey;
  const parts = resolved.split('.');
  let cur: any = character;
  for (const p of parts) {
    if (cur == null) return 0;
    cur = cur[p];
  }
  const n = Number(cur);
  return Number.isFinite(n) ? n : 0;
}

export interface VictoryProgress {
  victory: VictoryDef;
  progress: number;
  nextTier?: VictoryTier;
  pointsEarned: number;
  highestTierReached?: VictoryTier;
}

export function evaluateVictory(
  character: CharacterInterface,
  victory: VictoryDef
): VictoryProgress {
  const progress = readStat(character, victory.statKey);
  let pointsEarned = 0;
  let highestTierReached: VictoryTier | undefined;
  let nextTier: VictoryTier | undefined;

  for (const tier of victory.tiers) {
    if (progress >= tier.target) {
      pointsEarned += tier.points;
      highestTierReached = tier;
    } else if (!nextTier) {
      nextTier = tier;
    }
  }

  return { victory, progress, nextTier, pointsEarned, highestTierReached };
}

export function totalVictoryPoints(character: CharacterInterface): number {
  return VICTORIES.reduce((sum, v) => sum + evaluateVictory(character, v).pointsEarned, 0);
}
