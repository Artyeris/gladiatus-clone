export const COOKIE_NAME = 'AuthToken';
export const MAX_TOKEN_AGE = 30 * 24 * 60 * 60; // 30 days.
// Cooldowns match the original 1x server: a 60-second gate between
// expedition / arena fights.
export const EXPEDITION_COOLDOWN = 60;
export const ARENA_COOLDOWN = 60;
// Dungeon fights are longer set-pieces -- the gate between successive
// rounds in a multi-step run, also used by the header timer.
export const DUNGEON_COOLDOWN = 90;
export const stats = [
  {
    name: 'Strength',
    id: 'strength',
  },
  {
    name: 'Dexterity',
    id: 'dexterity',
  },
  {
    name: 'Agility',
    id: 'agility',
  },
  {
    name: 'Endurance',
    id: 'endurance',
  },
  {
    name: 'Charisma',
    id: 'charisma',
  },
  {
    name: 'Intelligence',
    id: 'intelligence',
  },
]