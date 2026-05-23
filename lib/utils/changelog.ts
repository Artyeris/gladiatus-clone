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
    version: '0.21',
    date: '2026-05-22',
    changes: [
      'New continents: Africa (entry level 20, 1,250 gold), Germania (level 40, 3,000 gold) and Britannia (level 120, 5,500 gold). Travel costs rebalanced to the original Gladiatus values.',
      '26 new expedition zones across the three continents -- Voodoo Temple, Bridge, Blood Cave, Lost Harbour, Umpokta Tribe, Caravan, Mesoai Oasis, Cliff Jumper (Africa); Cave Temple, Green Forest, Cursed Village, Death Hill, Vandal Village, Mine, Teuton Camp, Koman Mountain, Dragon Remains (Germania); Bank of Thames, Forest Fortress, The Moor, Camp Cassivellaunus, Kent, The Ford, Camulodunum, Cambria, Mona Isle (Britannia).',
      '104 new expedition enemies (4 per zone) with hand-curated stat blocks transcribed from the gladiatus-bg fansite tables -- real level, gold, XP, STR / DEX / AGI / CON / CHA / INT, armour and damage ranges per enemy. Bosses keep their boss flag.',
      'Caratacus appears in three different Britannia zones (The Ford, Camulodunum, Cambria) with distinct stats per zone.',
      'Sidebar expedition list filters to the country the gladiator is currently standing in. The "Traveler" entry in the Expedition tab is always visible and opens the Hermit-style travel page.',
      'Traveler page matches the original Gladiatus Hermit: title bar, "Description" lore card with portrait + flavour text, and "Travel to another country" radio list that hides the current location. Each row shows "(Minimum level: X, Costs: Y gold)" inline with an italic pitch underneath.',
      'Character now stores currentCountry / unlockedCountries (Italy is always unlocked). First visit to a country charges the travel fee; returning is free.',
      'Sidebar NavLink wraps long names cleanly -- "Camp Cassivellaunus" no longer left-aligns on the second line; min-h replaces the fixed h-9 so two-line entries grow vertically.',
      'Settings -> Developer Options gained "Level +1 / +10 / +100" buttons to fast-forward through level / country gates while testing.',
    ],
  },
  {
    version: '0.19.9c',
    date: '2026-05-21',
    changes: [
      'Arena champion-salary is now claimed manually. The pot panel shows a "Claim salary" button while you hold the champion seat -- pressing it credits any whole-hour gold accrued and refreshes the page.',
      'Removed the auto-credit on every page load so the salary feels like a deliberate collect rather than a silent drip.',
      'Market inventory grid cells shrunk to 44px (matches the Overview look more closely).',
    ],
  },
  {
    version: '0.19.9b',
    date: '2026-05-21',
    changes: [
      'Auth pages drop the navbar -- only the Cinzel Gladiatus title floats top-left as a link back to the landing.',
      'Market Sell card is now sized to fit (w-fit), so the brown frame ends right around the drop slot + inventory grid instead of spanning the whole content column.',
      'Market price input wrapped in a form: pressing Enter inside the price field submits the listing.',
      'Market inventory tiles accept double-click to drop into the sell slot (drag still works).',
      'Auction filter row gained a Price-tier dropdown (Grey / Green / Yellow / Orange / Red) that matches the existing % colour bands.',
      'Toast styling: in-game toasts now use the red-card chrome (gilded border, Cinzel font); errors use a darker red-card variant.',
      'Training: holding Shift while clicking the train icon now trains +5 (the server processes the bulk purchase in a single call, partial buys allowed). Tooltip and toast streak counter cover the burst.',
      'FighterCard adds a red Health bar mirroring the stat-bar look (filled to 100% since combatants start at full HP on the report).',
      'Market and Auction filter bars gained a "↻ Refresh" button that calls router.refresh() to re-pull the latest listings.',
      'Sidebar links and the top-left shortcut icons render with prefetch enabled, so Next preloads the destination page bundles for snappier section switching.',
      'Landing page (previous v0.19.9b note) -- top navbar removed; Log in / Sign Up CTAs in the welcome card, prefetched.',
    ],
  },
  {
    version: '0.19.9a',
    date: '2026-05-19',
    changes: [
      'Health bar now displays the same maxHP the combat engine uses (calculateHP via combatBreakdown). The HealthTooltip math swapped to the real formula: level * 25 + endurance * 2 - 10 + item +HP affixes.',
      'Level-range min/max inputs and Market price / Auction bid inputs share a new .fancy-input skin (Cinzel font, gilded gradient, gold focus ring) to match the dropdowns.',
      'Quality dropdown options are now coloured per quality tier in the menu, and the selected value tints the closed select to the matching colour.',
      'Auction sort dropdown gained Price asc / desc options, sorted by buyout price.',
      'Diamond glyph: new inline SVG DiamondIcon used by the header chip and the shop Restock button so the gem looks like a real diamond instead of a square.',
      'Shop Buy button shows the gold coin icon next to the price.',
      'Auction row controls aligned: fixed-width Time text label, fancy bid input, 60px Bid button, 120px Buy out button so every row lines up.',
      'Phase shown as a centred colour-coded text label (no chip background) matching the original Gladiatus listing style.',
      'Packages: type-filter dropdown (All / Weapons / Helmets / ...) above the grid, and 12-items-per-page pagination.',
      'Messages and Battle Reports paginated at 20 per page with First / Prev / Next / Last controls.',
      'Version bumped to v0.19.9a.',
    ],
  },
  {
    version: '0.19.9',
    date: '2026-05-19',
    changes: [
      'Market Sell row trimmed (px-4 / pt-3 / pb-2) so the section ends right at the bottom of the inventory grid -- no empty brown strip below.',
      'Health bar hover now opens a tooltip with the full breakdown: base endurance x 10, item endurance x 10, level x 5, and any +HP affixes from weapon / armour.',
      'Training toasts coalesce rapid clicks into one fancy red-card toast with an "x N" streak counter (resets after ~1.8s of idle).',
      'Other-player profile no longer shows Power twice; the standalone Power row was a duplicate of CombatRows\\\' built-in Power.',
      'Auction / Market filter dropdowns restyled with a gilded fancy-select skin (Cinzel font, custom red chevron, gold focus ring).',
      'Restock-shop now costs 1 Diamond instead of gold (SHOP_FORCE_REFRESH_COST_DIAMONDS).',
      'Expedition enemy tooltip anchored above the card (side=top) so it no longer collides with the next enemy on the row.',
      'GameHeaderStats reshaped to a 2-column grid: Gold over Honor on the left, Diamonds over Power on the right; Level rides the XP bar on row 3.',
      'Cannot expedition or arena while a work shift is in progress -- claim or cancel the job first.',
      'Arena gold threshold tightened to atk - def < 6 so attacking exactly 5 levels below still pays out (matches the stated "5 levels lower => no gold" rule).',
      '"crowns" labels swapped to "gold" in remaining quest claim / auction outbid / buyout error messages.',
    ],
  },
  {
    version: '0.19.8',
    date: '2026-05-19',
    changes: [
      'Quests: live countdown on the "New quest" button while the 10-minute take cooldown is active; listMyQuests now surfaces nextQuestReadyAt.',
      'Market Sell row redesigned: 220px drop panel on the left (180x180 slot, full-width Market price + Confirm), inventory grid on the right at 52px cells. Both panels framed with a red border.',
      'Filters consolidated into dropdowns: Market and Auction both use compact Type / Quality / Sort selects plus a Level min-max range input on one row.',
      'Work shift footer formats time as h:m:s once the remaining duration crosses an hour.',
      'Battle report Loot row now resolves the dropped item and shows the full ItemTooltip on hover (stats, level, value, durability).',
      'Arena gold reward on wins: 20 * defender_level + 50. Under level 100 the reward is suppressed when the attacker is 5+ levels above the defender; level 100+ always earns gold.',
      'Wealth panel gained a "Packages value" row (sum of pending package items\' sellPrice).',
    ],
  },
  {
    version: '0.19.7',
    date: '2026-05-19',
    changes: [
      'Quest section crash fixed: QUEST_TAKE_COOLDOWN_MS is no longer exported from a "use server" file.',
      'Landing page: removed the "A solo project built for learning, not for profit." note.',
      'New Gladiators screen under My Account: lists up to 10 characters per account with their level / power / honor and a Switch button. Active gladiator marked with a red border and "Active" badge.',
      'Onboarding is reusable as a "create new gladiator" flow; the redirect-on-existing-character guard was dropped.',
      'createCharacter backfills the new user.characters array from any legacy single user.character so existing accounts see their original gladiator in the roster.',
    ],
  },
  {
    version: '0.19.6',
    date: '2026-05-19',
    changes: [
      'Landing page rebuilt: fancy Cinzel "Gladiatus" logo, refreshed welcome copy, new tech-stack card (Next.js / React / TypeScript / MongoDB / Tailwind / Radix / shadcn / react-dnd / Lucide / Cinzel).',
      'GitHub icon removed from the landing navbar.',
      'Change log paginated -- 15 entries per page with First / Prev / Next / Last links.',
      'Auction: level-range filter (min / max) below the type / quality / sort strips.',
      'Arena ranking no longer prints "you" beside the current player\'s row.',
      'Work shift footer drops the "~ N real min" hint now that the server runs at 1x.',
      'New-quest cooldown: 10 minutes between accepting random quests.',
      'Settings dev options gain "Add 10" / "Add 100" diamond buttons.',
      'Dev Reset Timers also clears the new-quest cooldown.',
      '7-day highscore now shows Levels gained / Honor gained alongside Wins; weekly snapshots captured at the start of each week.',
      'Market Sell row centred and shrunk: 140x140 drop slot with 140px price/Confirm column, drop-here panel sits beside the inventory grid in a balanced layout.',
    ],
  },
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
