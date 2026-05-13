'use server'

import { cookies } from 'next/headers';

import { COOKIE_NAME } from '@/constants';
import BattleReport from '@/lib/models/battleReport.model';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';

export type ReportCategory = 'expedition' | 'arena';

export interface ReportRow {
  _id: string;
  createdAt: string;
  category: ReportCategory;
  opponentName: string;
  isWinner: boolean;
  isDraw: boolean;
  crownsDrop: number;
  experienceDrop: number;
}

export async function listBattleReports(): Promise<{
  reports: ReportRow[];
  error?: { message: string };
}> {
  const token = cookies().get(COOKIE_NAME);
  if (!token?.value) return { reports: [], error: { message: 'Not authenticated' } };

  try {
    const userId = extractUserId(token.value);
    await connectToDB();
    const user = await User.findById(userId).populate({ path: 'character', model: Character });
    if (!user || !user.character) {
      return { reports: [], error: { message: 'Character not found' } };
    }

    const charId = String((user.character as any)._id);
    const docs = await BattleReport.find({
      $or: [{ attacker: charId }, { defender: charId }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const reports: ReportRow[] = docs.map((doc: any) => {
      const category: ReportCategory = doc.expedition ? 'expedition' : 'arena';
      const defender = doc.defender ?? {};
      // For NPC fights defender is embedded {name, id, ...}. For arena it's
      // an ObjectId reference -- we don't populate it here to keep the
      // list cheap; the detail view handles full population.
      const opponentName =
        defender && typeof defender === 'object' && 'name' in defender
          ? (defender as any).name
          : 'Unknown';
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
