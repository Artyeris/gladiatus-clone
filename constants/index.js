export const COOKIE_NAME = 'AuthToken';
export const MAX_TOKEN_AGE = 30 * 24 * 60 * 60; // 30 days.
// Cooldowns are tuned for a 5x-speed server: the original 60s gates are
// brought down to 12s so testing and play feel snappier.
export const EXPEDITION_COOLDOWN = 12;
export const ARENA_COOLDOWN = 12;
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