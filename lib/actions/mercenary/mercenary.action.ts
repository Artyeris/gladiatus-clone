'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Mercenary from '@/lib/models/mercenary.model';
import MercenaryListing from '@/lib/models/mercenaryListing.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import { mercenaryBreakdown } from '@/lib/utils/mercenaryBreakdown';
import {
  findFreePositionAnyBag,
  migrateLegacyInventory,
  removeItem as removeInventoryItem,
} from '@/lib/utils/inventory/grid';
import {
  ITALY_MERCENARIES,
  MercTemplate,
  mercenaryPower,
  mercenaryVendorPrice,
  rollMercenaryQuality,
  rollMercenaryStats,
} from '@/constants/mercenaries';

const EQUIPMENT_SLOTS = [
  'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
  'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
] as const;
type EquipmentSlot = typeof EQUIPMENT_SLOTS[number];

// Item.type -> array of slots the item is allowed to occupy. Mirrors
// the player's slotAcceptsItem helper but stays local to keep this
// action self-contained.
function slotAcceptsType(slot: EquipmentSlot, itemType: string | null | undefined): boolean {
  if (!itemType) return false;
  if (slot === 'ring1' || slot === 'ring2') return itemType === 'ring';
  return slot === itemType;
}

async function getMyCharacter() {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    return user?.character ?? null;
  } catch {
    return null;
  }
}

// Player-facing pool: each template rolled at the character's level
// with a fresh quality so the vendor refreshes feel meaningful. The
// pool is regenerated on every list call (no shop persistence yet).
export async function listVendorMercenaries() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const level = Math.max(1, character.level ?? 1);
  // Three rolls per template: a green budget option, a blue mid, and
  // a wild card with the full quality roll. Gives the page enough
  // visual variety without spawning huge lists.
  const offers = ITALY_MERCENARIES.flatMap((template) => {
    const rolls: { quality: ReturnType<typeof rollMercenaryQuality> }[] = [
      { quality: 'green' },
      { quality: 'blue' },
      { quality: rollMercenaryQuality() },
    ];
    return rolls.map((r, i) => buildOffer(template, level, r.quality, i));
  });

  return { ok: true, offers };
}

function buildOffer(
  template: MercTemplate,
  level: number,
  quality: ReturnType<typeof rollMercenaryQuality>,
  slotIndex: number,
) {
  const stats = rollMercenaryStats(template, level, quality);
  return {
    slotId: `${template.id}-${quality}-${slotIndex}`,
    templateId: template.id,
    name: template.name,
    type: template.type,
    quality,
    level,
    stats,
    price: mercenaryVendorPrice(template, level, quality),
    power: mercenaryPower({ level, quality, type: template.type, stats }),
  };
}

export async function buyMercenary({
  templateId, quality, level,
}: { templateId: string; quality: string; level: number }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const template = ITALY_MERCENARIES.find((m) => m.id === templateId);
  if (!template) return { error: { message: 'Unknown mercenary' } };

  if (!['green','blue','purple','orange','red'].includes(quality)) {
    return { error: { message: 'Invalid quality' } };
  }
  const q = quality as 'green'|'blue'|'purple'|'orange'|'red';
  const lvl = Math.max(1, Math.floor(level));
  const price = mercenaryVendorPrice(template, lvl, q);

  if ((character.crowns ?? 0) < price) {
    return { error: { message: `Need ${price} gold to hire this mercenary` } };
  }

  const stats = rollMercenaryStats(template, lvl, q);
  const merc = await Mercenary.create({
    owner: character._id,
    templateId: template.id,
    name: template.name,
    type: template.type,
    level: lvl,
    quality: q,
    stats,
  });

  character.crowns = (character.crowns ?? 0) - price;
  character.mercenaries = [...(character.mercenaries ?? []), merc._id];
  await character.save();

  revalidatePath('/game/mercenaries');
  revalidatePath('/game/dungeons');
  return { ok: true, mercenaryId: String(merc._id), price };
}

export async function listMyMercenaries() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const mercs = await Mercenary.find({ owner: character._id })
    .populate({ path: 'equipment.head equipment.chest equipment.legs equipment.gloves equipment.cloak equipment.boots equipment.mainHand equipment.offHand equipment.necklace equipment.ring1 equipment.ring2', model: Item })
    .sort({ createdAt: -1 });
  return {
    ok: true,
    mercenaries: mercs.map((m: any) => {
      const equipment: Record<string, any> = {};
      for (const slot of EQUIPMENT_SLOTS) {
        const it = m.equipment?.[slot];
        equipment[slot] = it && typeof it === 'object' && 'name' in it ? it.toObject?.() ?? it : null;
      }
      const breakdown = mercenaryBreakdown({
        level: m.level, quality: m.quality, type: m.type, stats: m.stats, equipment,
      });
      return {
        _id:        String(m._id),
        templateId: m.templateId,
        name:       m.name,
        type:       m.type,
        level:      m.level,
        quality:    m.quality,
        stats:      m.stats,
        equipment,
        breakdown,
        power: breakdown.power,
      };
    }),
  };
}

// --- Equipment ---

function loadInventory(character: any) {
  const inv = character.inventory ?? [];
  const migrated = migrateLegacyInventory(inv);
  return migrated ?? inv;
}

async function ownsItem(character: any, itemId: string) {
  const item = await Item.findOne({ _id: itemId, owner: character._id });
  return item;
}

export async function equipMercenaryItem({
  mercenaryId, slot, itemId,
}: { mercenaryId: string; slot: string; itemId: string }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  if (!EQUIPMENT_SLOTS.includes(slot as EquipmentSlot)) {
    return { error: { message: 'Invalid slot' } };
  }

  const merc = await Mercenary.findOne({ _id: mercenaryId, owner: character._id });
  if (!merc) return { error: { message: 'Mercenary not found' } };

  const item = await ownsItem(character, itemId);
  if (!item) return { error: { message: 'Item not in your bag' } };
  if (!slotAcceptsType(slot as EquipmentSlot, item.type)) {
    return { error: { message: `That slot doesn\'t accept ${item.type}` } };
  }

  // If something is already in the slot, move it back to the player's
  // inventory first so we don't lose the previously-equipped item.
  const previousId = merc.equipment?.[slot];
  let entries = loadInventory(character);

  // Remove the new item from inventory (it lived in the bag).
  entries = removeInventoryItem(entries, String(item._id));

  if (previousId) {
    const previous = await Item.findById(previousId);
    if (previous) {
      const free = findFreePositionAnyBag(entries, previous);
      if (!free) {
        return { error: { message: 'No space in bag for the previously equipped item' } };
      }
      entries.push({
        item: previous._id,
        x: free.x, y: free.y, bag: free.bag,
      });
    }
  }

  merc.equipment = merc.equipment ?? {};
  merc.equipment[slot] = item._id;
  merc.markModified('equipment');
  await merc.save();

  character.set('inventory', entries);
  character.markModified('inventory');
  await character.save();

  revalidatePath('/game/overview');
  revalidatePath('/game/mercenaries');
  return { ok: true };
}

export async function unequipMercenaryItem({
  mercenaryId, slot,
}: { mercenaryId: string; slot: string }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  if (!EQUIPMENT_SLOTS.includes(slot as EquipmentSlot)) {
    return { error: { message: 'Invalid slot' } };
  }

  const merc = await Mercenary.findOne({ _id: mercenaryId, owner: character._id });
  if (!merc) return { error: { message: 'Mercenary not found' } };

  const equippedId = merc.equipment?.[slot];
  if (!equippedId) return { error: { message: 'Nothing equipped in that slot' } };

  const item = await Item.findById(equippedId);
  if (!item) {
    merc.equipment[slot] = null;
    merc.markModified('equipment');
    await merc.save();
    return { error: { message: 'Equipped item not found, slot cleared' } };
  }

  let entries = loadInventory(character);
  const free = findFreePositionAnyBag(entries, item.width ?? 1, item.height ?? 1);
  if (!free) return { error: { message: 'No space in bag to unequip' } };

  entries.push({ item: item._id, x: free.x, y: free.y, bag: free.bag });
  merc.equipment[slot] = null;
  merc.markModified('equipment');
  await merc.save();

  character.set('inventory', entries);
  character.markModified('inventory');
  await character.save();

  revalidatePath('/game/overview');
  revalidatePath('/game/mercenaries');
  return { ok: true };
}

// Items in the player's bag that can fit a given mercenary slot, used
// to populate the equip picker UI.
export async function listEquipCandidates({
  mercenaryId, slot,
}: { mercenaryId: string; slot: string }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };
  if (!EQUIPMENT_SLOTS.includes(slot as EquipmentSlot)) {
    return { error: { message: 'Invalid slot' } };
  }

  const merc = await Mercenary.findOne({ _id: mercenaryId, owner: character._id });
  if (!merc) return { error: { message: 'Mercenary not found' } };

  const entries = loadInventory(character);
  const ids = entries.map((e: any) => e?.item).filter(Boolean);
  if (ids.length === 0) return { ok: true, candidates: [] };
  const items = await Item.find({ _id: { $in: ids }, owner: character._id });
  const fits = items
    .filter((it: any) => slotAcceptsType(slot as EquipmentSlot, it.type))
    .map((it: any) => ({
      _id: String(it._id),
      name: it.name,
      image: it.image,
      type: it.type,
      level: it.level,
      quality: it.quality,
      sellPrice: it.sellPrice,
    }));
  return { ok: true, candidates: fits };
}

// --- Mercenary marketplace ---

export async function listMercenaryOnMarket({
  mercenaryId, price,
}: { mercenaryId: string; price: number }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const merc = await Mercenary.findOne({ _id: mercenaryId, owner: character._id });
  if (!merc) return { error: { message: 'Mercenary not found' } };

  const p = Math.max(1, Math.floor(price));
  if (!Number.isFinite(p)) return { error: { message: 'Invalid price' } };

  // Strip equipment back into the seller's bag before listing -- the
  // buyer should not inherit the seller's gear.
  let entries = loadInventory(character);
  const equipment = merc.equipment ?? {};
  for (const slot of EQUIPMENT_SLOTS) {
    const equippedId = equipment[slot];
    if (!equippedId) continue;
    const item = await Item.findById(equippedId);
    if (!item) { merc.equipment[slot] = null; continue; }
    const free = findFreePositionAnyBag(entries, item);
    if (!free) return { error: { message: `Unequip ${item.name} first -- no space in bag` } };
    entries.push({ item: item._id, x: free.x, y: free.y, bag: free.bag });
    merc.equipment[slot] = null;
  }
  merc.markModified('equipment');
  await merc.save();

  character.set('inventory', entries);
  character.markModified('inventory');
  // Drop the merc from the roster while listed -- ownership stays on
  // the Mercenary doc so the listing still resolves, but the seller
  // can't use them in the meantime.
  character.mercenaries = (character.mercenaries ?? []).filter(
    (id: any) => String(id) !== String(merc._id),
  );
  await character.save();

  await MercenaryListing.create({
    seller: character._id,
    mercenary: merc._id,
    price: p,
  });

  revalidatePath('/game/mercenaries');
  revalidatePath('/game/market');
  return { ok: true };
}

export async function cancelMercenaryListing({ listingId }: { listingId: string }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const listing = await MercenaryListing.findOne({ _id: listingId, seller: character._id });
  if (!listing) return { error: { message: 'Listing not found' } };

  const merc = await Mercenary.findById(listing.mercenary);
  if (merc) {
    character.mercenaries = [...(character.mercenaries ?? []), merc._id];
    await character.save();
  }
  await listing.deleteOne();

  revalidatePath('/game/mercenaries');
  revalidatePath('/game/market');
  return { ok: true };
}

export async function buyMercenaryListing({ listingId }: { listingId: string }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const listing = await MercenaryListing.findById(listingId);
  if (!listing) return { error: { message: 'Listing no longer available' } };
  if (String(listing.seller) === String(character._id)) {
    return { error: { message: "You can't buy your own listing" } };
  }
  if ((character.crowns ?? 0) < listing.price) {
    return { error: { message: `Need ${listing.price} gold` } };
  }

  const merc = await Mercenary.findById(listing.mercenary);
  if (!merc) {
    await listing.deleteOne();
    return { error: { message: 'Mercenary no longer exists' } };
  }

  // Transfer the merc to the buyer, debit gold, credit the seller.
  character.crowns = (character.crowns ?? 0) - listing.price;
  character.mercenaries = [...(character.mercenaries ?? []), merc._id];
  merc.owner = character._id;
  await merc.save();
  await character.save();

  const seller = await Character.findById(listing.seller);
  if (seller) {
    seller.crowns = (seller.crowns ?? 0) + listing.price;
    await seller.save();
  }

  await listing.deleteOne();

  revalidatePath('/game/mercenaries');
  revalidatePath('/game/market');
  return { ok: true, price: listing.price };
}

export async function getMercenaryListings() {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const listings: any[] = await MercenaryListing.find()
    .populate({ path: 'mercenary', model: Mercenary })
    .populate({ path: 'seller', model: Character, select: 'name' })
    .sort({ createdAt: -1 });

  return {
    ok: true,
    listings: listings
      .filter((l) => l.mercenary)
      .map((l: any) => {
        const m = l.mercenary;
        const breakdown = mercenaryBreakdown({
          level: m.level, quality: m.quality, type: m.type, stats: m.stats,
          equipment: {},
        });
        return {
          _id:       String(l._id),
          price:     l.price,
          sellerId:  String(l.seller?._id ?? l.seller),
          sellerName: l.seller?.name ?? 'Unknown',
          isMine:    String(l.seller?._id ?? l.seller) === String(character._id),
          mercenary: {
            _id:    String(m._id),
            name:   m.name,
            type:   m.type,
            level:  m.level,
            quality: m.quality,
            stats:  m.stats,
            power:  breakdown.power,
          },
        };
      }),
  };
}

export async function dismissMercenary({ mercenaryId }: { mercenaryId: string }) {
  const character: any = await getMyCharacter();
  if (!character) return { error: { message: 'Not authenticated' } };

  const merc = await Mercenary.findOne({ _id: mercenaryId, owner: character._id });
  if (!merc) return { error: { message: 'Mercenary not found' } };

  // Refund a fraction of the original vendor price so dismissals are
  // not a pure loss. 25% scrap value.
  const template = ITALY_MERCENARIES.find((m) => m.id === merc.templateId);
  const refund = template
    ? Math.round(mercenaryVendorPrice(template, merc.level, merc.quality) * 0.25)
    : 0;

  await merc.deleteOne();
  character.mercenaries = (character.mercenaries ?? []).filter(
    (id: any) => String(id) !== String(merc._id),
  );
  character.crowns = (character.crowns ?? 0) + refund;
  await character.save();

  revalidatePath('/game/mercenaries');
  revalidatePath('/game/dungeons');
  return { ok: true, refund };
}
