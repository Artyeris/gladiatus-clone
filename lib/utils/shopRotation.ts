// NPC merchant shops -- one per shop type, each holding a small
// rotation of items the player can buy directly. Refreshes every
// SHOP_REFRESH_INTERVAL real milliseconds (lazy: regenerated on the
// next visit after the timer expires).

export type ShopType = 'goods' | 'armor' | 'weapons' | 'alchemist';

export const SHOP_TYPES: ShopType[] = ['goods', 'armor', 'weapons', 'alchemist'];

export const SHOP_LABELS: Record<ShopType, string> = {
  goods:     'General Goods',
  armor:     'Armour Smith',
  weapons:   'Weapon Smith',
  alchemist: 'Alchemist',
};

export const SHOP_TAGLINES: Record<ShopType, string> = {
  goods:     'Gloves, boots and cloaks hauled in from every road.',
  armor:     'Helmets, chestpieces, leggings and shields, hammered fresh today.',
  weapons:   'Steel for every grip -- daggers, swords, axes, spears.',
  alchemist: 'Rings and amulets, charged with quiet enchantments.',
};

export const SHOP_CATEGORIES: Record<ShopType, string[]> = {
  goods:     ['gloves', 'boots', 'cloak'],
  armor:     ['head', 'chest', 'legs', 'offHand'],
  weapons:   ['mainHand'],
  alchemist: ['ring', 'necklace'],
};

// At 1x server speed we mirror the original ~5-hour merchant rotation.
export const SHOP_REFRESH_INTERVAL_MS = 5 * 60 * 60 * 1000;
export const SHOP_SLOTS = 12;
// Buy price is sellPrice * 3 (Gladiatus markup roughly matches).
export const BUY_PRICE_MULTIPLIER = 3;
// Re-stock NOW button costs this many crowns each time.
// Restock now is a premium-currency action: 1 diamond per refresh.
export const SHOP_FORCE_REFRESH_COST_DIAMONDS = 1;

export function isShopType(value: unknown): value is ShopType {
  return typeof value === 'string' && (SHOP_TYPES as string[]).includes(value);
}

export function buyPriceFor(item: { sellPrice?: number | null }): number {
  return Math.max(1, Math.floor((item?.sellPrice ?? 1) * BUY_PRICE_MULTIPLIER));
}

export function msUntilNextRefresh(lastRefreshAt: Date | null | undefined): number {
  if (!lastRefreshAt) return 0;
  const elapsed = Date.now() - new Date(lastRefreshAt).getTime();
  return Math.max(0, SHOP_REFRESH_INTERVAL_MS - elapsed);
}
