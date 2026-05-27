'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import Mercenary from '@/lib/models/mercenary.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import {
  ITALY_MERCENARIES,
  MercTemplate,
  mercenaryPower,
  mercenaryVendorPrice,
  rollMercenaryQuality,
  rollMercenaryStats,
} from '@/constants/mercenaries';

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

  const mercs = await Mercenary.find({ owner: character._id }).sort({ createdAt: -1 });
  return {
    ok: true,
    mercenaries: mercs.map((m: any) => ({
      _id:        String(m._id),
      templateId: m.templateId,
      name:       m.name,
      type:       m.type,
      level:      m.level,
      quality:    m.quality,
      stats:      m.stats,
      power: mercenaryPower({
        level: m.level, quality: m.quality, type: m.type, stats: m.stats,
      }),
    })),
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
