'use server'

import Character from '@/lib/models/character.model';
import { connectToDB } from '@/lib/mongoose';
import { ARENA_TIERS, BOTS_PER_TIER } from '@/lib/utils/arena';
import { planBotsForTier } from '@/lib/utils/arenaBots';

// Idempotent: tops up each tier to its target bot count and never deletes
// existing bots. Safe to call on every page load.
export async function ensureArenaBots() {
  await connectToDB();

  for (const tier of ARENA_TIERS) {
    const target = BOTS_PER_TIER[tier.id] ?? 12;
    const have = await Character.countDocuments({ isBot: true, arenaTier: tier.id });
    const missing = target - have;
    if (missing <= 0) continue;

    // Plan more than missing so unique-name collisions can be discarded.
    const plans = planBotsForTier(tier, have + Date.now()).slice(0, missing * 2);
    for (const plan of plans) {
      try {
        await Character.create(plan);
      } catch {
        // Likely a duplicate-name collision; skip and continue.
      }
      const after = await Character.countDocuments({ isBot: true, arenaTier: tier.id });
      if (after >= target) break;
    }
  }
}
