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
    version: '0.30.5',
    date: '2026-05-23',
    changes: [
      'Hydration mismatch fixed on the Overview: DungeonPartySlots was nesting a clear (x) button inside the main slot button, which is invalid HTML and caused the page to throw "Expected server HTML to contain a matching <button>". Slots are now a div + button + sibling-button layout so the markup is valid.',
      'Mercenary panel rebuilt to mirror the gladiator\'s CharacterPanel: full 230x266 portrait (per-template pick, falls back to the level-bucket player portrait), no more 140x140 stick-figure icon in a big empty rectangle. Stat rows, combat rows and breakdown tooltips stay as in v0.30.4.',
      'Roadmap note: a separate Dungeon-only equipment set on the gladiator (so you can keep your expedition kit on, switch to a dungeon kit, and back) is staying out of this patch -- it touches the Character schema and the moveItem flow and will land in v0.31. Today\'s changes do not affect player equipment.',
    ],
  },
  {
    version: '0.30.4',
    date: '2026-05-23',
    changes: [
      'Mercenary damage and armour now follow the player model: damage = weapon (or bare hands at strength / 6) + strength / 10 + rolled damage affixes; armour = sum of equipped armour pieces only. The base mercenary stat seed no longer carries damageMin / damageMax / armor; those were the placeholder numbers showing up in the panel.',
      'Mercenary stats hover-card breakdowns: every primary stat row now opens the same tooltip the player has (Basic / From items / total). Armour, Damage and Healing rows get their own breakdown card explaining where the number comes from.',
      'Overview hides the Dungeon party card while a mercenary tab is selected -- the slots only matter for the gladiator view.',
      'Mercenary selling moved to the Market page: the Mercenaries shop no longer has a Sell button (Dismiss only). The Market panel grew a "Sell from roster" picker -- pick any mercenary from your roster, set a price, hit List. Equipped gear is still auto-returned to your bag on listing.',
      'Dungeon fight cooldown is live (DUNGEON_COOLDOWN = 90s). The header bar\'s second timer (previously "Coming soon") now ticks down after every dungeon fight; runNextStep is server-gated by the cooldown the same way expedition / arena battles are.',
      'Character schema picked up dungeonLastBattle and the canFight helper learned a "dungeon" fight type.',
    ],
  },
  {
    version: '0.30.3',
    date: '2026-05-23',
    changes: [
      'Multi-step dungeon runs! Every dungeon is now a 4-fight progression (3 trash steps + boss). Each click resolves one fight; the party HP carries between fights and only refreshes when the next run starts. New DungeonRun collection backs the active run; one run per character at a time.',
      'Party HP tracking: every fighter has their own HP bar that drains as the dungeon hits the party. Tanks soak ~60% of incoming damage; healers regenerate the party between fights. A wiped party ends the run with consolation gold; surviving the boss drops the guaranteed Blue+ item.',
      'Dungeon party slots in Overview: a new "Dungeon party" card sits below your inventory with five slots -- Tank / Healer / Damage I / Damage II / Damage III. Click any slot to open a picker and assign your gladiator or one of your hired mercenaries. Role-matched mercs are highlighted. Only the assigned party fights -- no more "auto-take every merc" behaviour.',
      '"Enter dungeon" now requires at least one filled party slot; the dungeon screen shows a hint and disables the button until you assign at least one fighter.',
      'Dungeon tab UI rebuilt: when a run is active the cards collapse into a single "Active run" panel with party HP bars, last-fight log, and Next fight / Abandon buttons. Cleared runs auto-close after the boss; abandoning forfeits progress.',
      'Standalone /game/dungeons page reframed as a directory: each row links you to the parent expedition where the actual Dungeon tab lives (no more duplicate "Enter" buttons).',
    ],
  },
  {
    version: '0.30.2',
    date: '2026-05-23',
    changes: [
      'Mercenary equipment slots! Mercenary model gained 11 equipment slots mirroring the player (head / cloak / chest / gloves / mainHand / offHand / legs / boots / necklace / ring1 / ring2). When you click a mercenary pill in Overview, the right panel now shows their slot grid -- click an empty slot to pick a compatible item from your bag, click a worn item to return it.',
      'Equipment bonuses flow into the mercenary\'s stat block: armour, damage, +stats, +health and the dungeon-only fields (threat, hardening, healing, critical healing) all aggregate via the new mercenaryBreakdown helper.',
      'Dungeon combat now reads from the breakdown: healing boosts the healer role\'s contribution, threat / hardening boost the tank role\'s. The "previously ignored" item stats from v0.30 are live in the resolver.',
      'Mercenary panel surfaces the role-relevant dungeon stats: Healing + Crit Healing for healers; Threat + Hardening for tanks. Stat numbers now reflect equipped gear.',
      'Player-to-player mercenary market: list a mercenary from your roster for a fixed price, browse the listings, cancel or buy. New MercenaryListing collection backs the flow. Equipped gear is automatically stripped into the seller\'s bag before listing.',
      'Mercenaries page restructured into three tabs: Vendor (Italy roll), Player Market (others\' listings), and Your Roster (Sell / Dismiss).',
      'Market page now opens with a "Mercenary listings" panel above the regular item listings so mercenaries can be bought from the Market screen too, not just from the Mercenaries shop.',
    ],
  },
  {
    version: '0.30.1',
    date: '2026-05-23',
    changes: [
      'Dungeons now live inside their parent expedition page -- click an expedition and toggle to the Dungeon tab to see (and enter) the dungeons attached to that region. Mirrors the original Gladiatus "Požemis" tab layout. The standalone Dungeons sidebar entry is gone; the /game/dungeons directory page still exists if you want the full Italy list.',
      'An expedition can host more than one dungeon (e.g. Pirate Harbour parents both On the Run and The Last Resort); each shows as its own card with its own Enter button.',
      'Overview gained a Party row: pills for the player + every owned mercenary. Click a pill to switch the left panel between your gladiator\'s stats and a mercenary\'s rolled stats. Mercenary equipment slots and bag are still being forged -- right panel shows a placeholder for now.',
      'Coming next (v0.31): mercenary listings in Market and Auction (you\'ll be able to flip your rolls or pick up endgame mercs from other players), plus per-mercenary equipment slots so you can gear up tanks and healers.',
    ],
  },
  {
    version: '0.30',
    date: '2026-05-23',
    changes: [
      'Dungeons! New /game/dungeons page lists all 10 Italy dungeons -- Gustavo\'s Country House, On the Run, The Dragon Stronghold, The Cave of Dark Intrigue, Hidden Grave, In Enemy Hands, The Last Resort, The True Owner, Gioll Passage, Zagrash\'s Fort. Each has an entry level, parent expedition, named boss and gold/XP rewards.',
      'Phase-1 combat is an auto-resolve: party power (player + sum of owned mercenaries) vs. boss difficulty (boss level * 90). Win chance is clamped 10-95% so even a weak party has a shot and a strong one isn\'t guaranteed. A clear hands you the gold/XP reward, drops a guaranteed Blue+ item into your Packages mailbox and marks the dungeon "Cleared".',
      'Mercenaries! New /game/mercenaries page hosts the Italy vendor pool: Samnit, Murmillo, Thracian (damage), Hoplomachus (tank) and Medicus (healer). Three quality offers per template every refresh (green, blue, and a wild-card roll). Buy with gold; dismiss for 25% scrap gold.',
      'Mercenary quality (Green / Blue / Purple / Orange / Red) multiplies stat output 1.00x / 1.10x / 1.25x / 1.45x / 1.70x, mirroring the Gladiatus rarity curve. Vendor price scales with rolled level + quality.',
      'Sidebar: Mercenaries entry slots into the Town tab next to Training; Dungeons entry slots into the Expedition tab above Traveler.',
      'Character schema gained mercenaries (refs into the new Mercenary collection) and completedDungeons (cleared dungeon ids). Item schema picks up dungeon-only stat fields (threat, hardeningValue, healing, criticalHealingValue) which combat ignores for now but the mercenary system will read in later phases.',
      'Roadmap for the next dungeon phases: party slot UI (tank / healer / 3 damage), proper round-based combat with role AI (tank aggro, healer triage, damage focus), and mercenary equipment slots.',
    ],
  },
  {
    version: '0.22.4',
    date: '2026-05-23',
    changes: [
      'Header card grown from h-[75px] to h-[85px] so the XP row no longer clips at the bottom -- the "Lvl N" label was being half-cut by the brown card\'s overflow-hidden. The two sibling timer cards (expedition / arena) bumped to the same height to keep the row visually balanced.',
    ],
  },
  {
    version: '0.22.3',
    date: '2026-05-23',
    changes: [
      'Header XP bar root cause fixed: ProgressBar was hard-coded to w-36 (144px) so it never filled its flex-1 slot, leaving empty space between the bar and the percent label and making the row look "off-centre". Switched to w-full + rounded-sm + a clamped progress value.',
      'XP row labels balanced: left "Lvl N" chip and right "N%" label both sit on w-14 (56px), so the bar now centres cleanly between them and stretches the whole middle column.',
    ],
  },
  {
    version: '0.22.2',
    date: '2026-05-23',
    changes: [
      'Compact number formatter is now tiered: under 1 000 stays raw, then "Nk" (1 000+), "Nmil" (1 000 000+), "Nbil" (1 000 000 000+). Replaces the previous flat "k-only" abbreviation.',
      'Every compacted number now shows the full integer in a tooltip on hover (e.g. hover "23mil" -> "23,977,977"). Wrapped in a tiny CompactNumber component so the title attribute is always in sync with the displayed value.',
      'Top XP row is now visually balanced: the level chip on the left and the percent label on the right share the same w-12 fixed width, so the progress bar centres on the row\'s midline instead of being pushed off-centre by the level digits.',
      'XP percent label gains a tooltip showing the raw experience / next-level XP integers.',
    ],
  },
  {
    version: '0.22.1',
    date: '2026-05-23',
    changes: [
      'Large numbers in stat panels are now abbreviated. Anything 10 000+ collapses to "Nk" (e.g. 23 977 977 -> 23977k) so the Experience line on the Overview no longer overflows at high levels.',
      'Same compact formatter is applied to the header chips (gold / honor / diamonds / power) and the Overview Health line so the numbers stay readable as the character grows.',
    ],
  },
  {
    version: '0.22',
    date: '2026-05-23',
    changes: [
      'New Guild sidebar entry sits right after Overview and opens a placeholder "Coming Soon" page -- guild halls, ledgers and shared raids will land there once the multiplayer backend is ready.',
      'Sidebar general routes reordered: Overview, Guild, Quests, Rewards, Highscore. Quests now sits above Rewards, Highscore moves to the bottom of the block.',
    ],
  },
  {
    version: '0.21.1',
    date: '2026-05-22',
    changes: [
      'Travel now charges its full fare on every trip -- the first-visit-only discount is gone. Africa always costs 1,250 gold, Germania 3,000, Britannia 5,500. Italy is the only free destination (returning home).',
      'Traveler page rows show the destination\'s gold cost every time (no more "Free" after a previous visit).',
      'unlockedCountries is still tracked for stats but no longer grants a price discount.',
    ],
  },
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
