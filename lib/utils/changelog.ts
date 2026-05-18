export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// Patch notes shown on /game/changelog. Most recent at the top.
// Keep entries short and gameplay-focused; the bottom of the version
// label in the corner links here so the player can see what just
// changed.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.19.5',
    date: '2026-05-18',
    changes: [
      'Market inventory cells enlarged (36 -> 48px) so the grid fills the panel out to the corners.',
      'Page portraits bumped to 240x240 and switched to object-contain so the full artwork is visible without cropping.',
      'Settings: UI Theme picker (Default / Dark / Light) with a pre-hydration script that applies the saved theme before React mounts.',
    ],
  },
  {
    version: '0.19.4',
    date: '2026-05-18',
    changes: [
      'Shortcut row reordered to Packages / Battle Reports / Messages / News.',
      'Page portraits enlarged to 200x200 across Training, Arena, Auction, Market, Shop and Work.',
      'Server speed restored to 1x: work jobs take their full real-time hours, expedition/arena cooldowns back to 60s, auctions run for 2.5 real hours and shops restock every 5 real hours.',
    ],
  },
  {
    version: '0.19.3',
    date: '2026-05-18',
    changes: [
      'Page portraits enlarged to 170x170 across Training, Arena, Auction, Market, Shop and Work.',
      'News shortcut added to the side-banner icon row (placeholder page).',
      'Version label in the bottom corner now links to this changelog.',
    ],
  },
  {
    version: '0.19.2',
    date: '2026-05-18',
    changes: [
      'Inventory bag preserved end-to-end (schema relaxed, raw collection read).',
      'Power row added to the Overview combat panel.',
      'Highscore tabs converted to chip buttons.',
      'Arena page portrait unified at 140x140 (later bumped to 170 in 0.19.3).',
      'Header Power chip now uses a Swords icon.',
      'Enemy tooltip pinned with high z-index and right-side anchor.',
    ],
  },
  {
    version: '0.19.1',
    date: '2026-05-18',
    changes: [
      'Weapon damage and armour now contribute to Power Rank.',
      'PowerTooltip shows Weapon and Armor as separate rows.',
      'Enemy hover tooltip widened for readability.',
      'moveItem fallback writes inventory through the raw MongoDB driver.',
      'Reports Expedition / Arena selectors styled as separated chips.',
    ],
  },
  {
    version: '0.19',
    date: '2026-05-18',
    changes: [
      'Trade victory counters (shop / market / auction) wired up and persisted.',
      'Auction pool size raised from 12 to 40 listings.',
      'Market gained 15-per-page pagination and Price asc/desc sorting.',
      'Power tooltip with stat breakdown added to the character profile.',
      'Portraits unified at 140x140 across town pages.',
      'Removed Social and Provinciarum entries from Victories.',
      '"Equipment" header removed from other-player profile.',
    ],
  },
  {
    version: '0.18',
    date: '2026-05-18',
    changes: [
      'Power moved to row two of the header stats card.',
      'Overview / Statistics / Victories tabs shortened.',
      'Market sell panel widened and re-aligned.',
      'ItemImage fallback no longer duplicates tooltips.',
      'Expedition enemies render on a single CSS-grid row.',
      'Per-message Mark-read and bulk Mark-all-read buttons.',
      'Inventory: bag persisted to localStorage, double-click equip/unequip, edge-snap on drop.',
    ],
  },
  {
    version: '0.17',
    date: '2026-05-18',
    changes: [
      'Inventory cells, equipment slots, character avatar and top tabs all bumped in size.',
      'Expedition enemies laid out on an auto-fit grid with consistent spacing.',
      'Work rows highlight as a single line.',
      'Arena leaderboard expanded to top 10 with full-row hover.',
      'Shop slots normalised to a fixed 170px height.',
      'Market sell panel sits lower and inventory nudged right.',
    ],
  },
  {
    version: '0.16',
    date: '2026-05-18',
    changes: [
      'Top navbar chrome removed; only the Gladiatus title and My Account dropdown remain as floating widgets.',
      'GameHeader shortened to 95px and the content column widened to 820px.',
      'Layout flush to the top of the viewport.',
      '"Gladiatus Clone" shortened to "Gladiatus".',
    ],
  },
  {
    version: '0.15',
    date: '2026-05-18',
    changes: [
      'Packages mailbox: shop / auction / market / expedition drops route here first.',
      'Rewards page with Daily / Weekly / Monthly diamond claims (later simplified to plain cooldowns).',
      'Alchemist merchant added; cloak catalog expanded.',
      'Sidebar trimmed: Messages / Reports moved to the icon row above Overview.',
      'Expedition routes greyed out when below the entry level.',
      'Other-player profile gained the green StatBar rows and CombatRows.',
      'Settings hosts a Rename-gladiator flow with a unique-name check.',
    ],
  },
  {
    version: '0.14',
    date: '2026-05-18',
    changes: [
      'Top-left shortcut icons (Messages / Battle reports / Quests / Rewards).',
      'FighterCard stat bars render against the strongest stat on the card.',
      'Market inventory gained the 8-tab bag picker.',
      'Auction list filtered to player level + 3 and percentages colour-tiered.',
      'Battle report Loot row shows the dropped item icon.',
      'Champion salary message says "gold" instead of "crowns".',
    ],
  },
];
