export type QuestCategory = 'arena' | 'expedition' | 'work' | 'items';

// Verbs are emitted by gameplay actions (battle / work / drop) and
// matched against the quest's `verb` to bump progress.
export type QuestVerb =
  | 'arena_attack'
  | 'arena_win'
  | 'expedition_kill'
  | 'expedition_boss'
  | 'work_hours'
  | 'find_items';

export interface QuestTemplate {
  id: string;
  category: QuestCategory;
  verb: QuestVerb;
  title: string;
  target: number;
  rewardGold: number;
  rewardExp: number;
}

export const MAX_ACTIVE_QUESTS = 5;

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // --- Arena ---
  { id: 'arena_attack_3',  category: 'arena', verb: 'arena_attack',
    title: 'Arena: successfully attack 3 opponents',
    target: 3,  rewardGold: 4_000,  rewardExp: 40 },
  { id: 'arena_attack_5',  category: 'arena', verb: 'arena_attack',
    title: 'Arena: attack 5 opponents from whom you can win gold',
    target: 5,  rewardGold: 7_000,  rewardExp: 70 },
  { id: 'arena_win_3',     category: 'arena', verb: 'arena_win',
    title: 'Arena: win 3 fights, improving your rank',
    target: 3,  rewardGold: 3_200,  rewardExp: 60 },
  { id: 'arena_win_5',     category: 'arena', verb: 'arena_win',
    title: 'Arena: win 5 fights',
    target: 5,  rewardGold: 6_000,  rewardExp: 110 },

  // --- Expeditions ---
  { id: 'expedition_kill_5',  category: 'expedition', verb: 'expedition_kill',
    title: 'Defeat 5 enemies in expeditions',
    target: 5,  rewardGold: 3_500,  rewardExp: 70 },
  { id: 'expedition_kill_9',  category: 'expedition', verb: 'expedition_kill',
    title: 'Defeat 9 enemies in expeditions',
    target: 9,  rewardGold: 7_500,  rewardExp: 150 },
  { id: 'expedition_kill_20', category: 'expedition', verb: 'expedition_kill',
    title: 'Defeat 20 enemies in expeditions',
    target: 20, rewardGold: 16_000, rewardExp: 350 },
  { id: 'expedition_boss_1',  category: 'expedition', verb: 'expedition_boss',
    title: 'Defeat an expedition boss',
    target: 1,  rewardGold: 5_000,  rewardExp: 120 },
  { id: 'expedition_boss_3',  category: 'expedition', verb: 'expedition_boss',
    title: 'Defeat 3 expedition bosses',
    target: 3,  rewardGold: 14_000, rewardExp: 300 },

  // --- Work ---
  { id: 'work_hours_4',  category: 'work', verb: 'work_hours',
    title: 'Work at least 4 hours',  target: 4,  rewardGold: 2_500, rewardExp: 30 },
  { id: 'work_hours_7',  category: 'work', verb: 'work_hours',
    title: 'Work at least 7 hours',  target: 7,  rewardGold: 5_300, rewardExp: 60 },
  { id: 'work_hours_11', category: 'work', verb: 'work_hours',
    title: 'Work 11 hours',          target: 11, rewardGold: 4_800, rewardExp: 90 },

  // --- Loot ---
  { id: 'find_items_3',  category: 'items', verb: 'find_items',
    title: 'Find 3 items in expeditions',
    target: 3,  rewardGold: 1_500, rewardExp: 25 },
  { id: 'find_items_7',  category: 'items', verb: 'find_items',
    title: 'Find 7 items in expeditions',
    target: 7,  rewardGold: 3_900, rewardExp: 50 },
  { id: 'find_items_15', category: 'items', verb: 'find_items',
    title: 'Find 15 items in expeditions',
    target: 15, rewardGold: 8_000, rewardExp: 120 },
];

export function findQuestTemplate(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find((t) => t.id === id);
}

export const CATEGORY_LABEL: Record<QuestCategory, string> = {
  arena: 'Arena',
  expedition: 'Expedition',
  work: 'Work',
  items: 'Loot',
};

export const CATEGORY_ICON: Record<QuestCategory, string> = {
  arena: '🏛',       // 🏛
  expedition: '⚔',        // ⚔
  work: '🔨',        // 🔨
  items: '📦',       // 📦
};
