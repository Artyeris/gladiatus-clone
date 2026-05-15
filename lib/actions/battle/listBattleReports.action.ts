'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import BattleReport from '@/lib/models/battleReport.model';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';
import type { ReportRow } from '@/lib/types/battleReport';

async function getMyCharacterId(): Promise<string | null> {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return null;
  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    if (!user || !user.character) return null;
    return String((user.character as any)._id);
  } catch {
    return null;
  }
}

export async function listBattleReports(): Promise<{
  reports: ReportRow[];
  error?: { message: string };
}> {
  const charId = await getMyCharacterId();
  if (!charId) return { reports: [], error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const docs = await BattleReport.find({
      $or: [{ attacker: charId }, { defender: charId }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Batch-load Character names for arena reports (defender is just an
    // ObjectId there; expedition reports already embed the NPC name).
    // Without this lookup the row label falls through to "Unknown".
    const arenaIds = new Set<string>();
    for (const doc of docs as any[]) {
      if (doc.expedition) continue;
      const def = doc.defender;
      if (def && typeof def === 'object' && !('name' in def)) {
        arenaIds.add(String(def._id ?? def));
      } else if (typeof def === 'string') {
        arenaIds.add(def);
      }
      if (doc.attacker && String(doc.attacker) !== charId) {
        arenaIds.add(String(doc.attacker));
      }
    }
    const namesById = new Map<string, string>();
    if (arenaIds.size > 0) {
      const found = await Character.find(
        { _id: { $in: Array.from(arenaIds) } },
        { name: 1 },
      ).lean();
      for (const c of found as any[]) namesById.set(String(c._id), c.name);
    }

    const reports: ReportRow[] = docs.map((doc: any) => {
      const category: ReportRow['category'] = doc.expedition ? 'expedition' : 'arena';
      const defender = doc.defender ?? {};

      let opponentName = 'Unknown';
      if (defender && typeof defender === 'object' && 'name' in defender) {
        opponentName = (defender as any).name;
      } else if (category === 'arena') {
        // If the player was the defender on this report, show the
        // attacker's name as the opponent instead.
        const defenderId = String(defender?._id ?? defender);
        const opponentId = defenderId === charId ? String(doc.attacker) : defenderId;
        opponentName = namesById.get(opponentId) ?? 'Unknown';
      }

      const winnerStr = String(doc.result?.winner ?? '');
      const isDraw = winnerStr === 'Draw';
      const isWinner =
        winnerStr === charId ||
        (winnerStr && winnerStr === String(doc.attacker) && String(doc.attacker) === charId);

      return {
        _id: String(doc._id),
        createdAt: new Date(doc.createdAt).toISOString(),
        category,
        opponentName,
        isWinner,
        isDraw,
        crownsDrop: doc.result?.crownsDrop ?? 0,
        experienceDrop: doc.result?.experienceDrop ?? 0,
      };
    });

    return { reports };
  } catch (error: any) {
    console.log(`${new Date()} - listBattleReports failed - ${error}`);
    return { reports: [], error: { message: error?.message || 'Failed to load reports' } };
  }
}

export async function deleteBattleReport({ id }: { id: string }) {
  const charId = await getMyCharacterId();
  if (!charId) return { error: { message: 'Not authenticated' } };
  try {
    await connectToDB();
    // Only allow deleting reports the player took part in (either side).
    await BattleReport.deleteOne({
      _id: id,
      $or: [{ attacker: charId }, { defender: charId }],
    });
    revalidatePath('/game/reports');
    return { ok: true };
  } catch (error: any) {
    console.log(`${new Date()} - deleteBattleReport failed - ${error}`);
    return { error: { message: error?.message || 'Failed' } };
  }
}

export async function deleteAllBattleReports({ category }: { category?: 'expedition' | 'arena' } = {}) {
  const charId = await getMyCharacterId();
  if (!charId) return { error: { message: 'Not authenticated' } };
  try {
    await connectToDB();
    const filter: any = {
      $or: [{ attacker: charId }, { defender: charId }],
    };
    if (category === 'expedition') {
      filter.expedition = { $exists: true, $ne: null };
    } else if (category === 'arena') {
      filter.expedition = { $in: [null, undefined] };
    }
    const res = await BattleReport.deleteMany(filter);
    revalidatePath('/game/reports');
    return { ok: true, deleted: res.deletedCount ?? 0 };
  } catch (error: any) {
    console.log(`${new Date()} - deleteAllBattleReports failed - ${error}`);
    return { error: { message: error?.message || 'Failed' } };
  }
}
