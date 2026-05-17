'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { canFight, extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';
import Journal from '@/lib/models/journal.model';
import { battleCreature } from '@/lib/utils/simulateCombat';
import { populateEquipment } from '@/lib/utils/populateEquipment';
import { trackQuestProgress } from '@/lib/actions/quest/quest.action';
import { randomBoolean } from '@/lib/utils/randomUtils';
import BattleReport from '@/lib/models/battleReport.model';
import { calculateExperience } from '@/lib/utils/characterUtils';
import { expeditions } from '@/constants/expeditions';
import { expeditionEnemies } from '@/constants/enemies';
import Item from '@/lib/models/item.model';
import {
  enemyTypeFromIndex,
  rollExpeditionDrop,
} from '@/lib/utils/expeditionDrop';
import {
  InventoryEntry,
  findFreePosition,
  migrateLegacyInventory,
  placeItem,
} from '@/lib/utils/inventory/grid';
import { revalidatePath } from 'next/cache';

interface BattleEnemyParams {
  expeditionName: string;
  enemyName: string;
}

export async function battleEnemy({ expeditionName, enemyName }: BattleEnemyParams) {
  const token = cookies().get(COOKIE_NAME);

  if (!token) throw new Error('Unathorized');

  if (!expeditions.hasOwnProperty(expeditionName)) throw new Error('Expedition not found');

  // Pick the enemy object from the list.
  const enemy = expeditionEnemies[expeditionName][enemyName];

  try {
    const userId = extractUserId(token);

    connectToDB();

    const user = await User.findById(userId)
      .populate({
        path: 'character',
        model: Character,
        populate: {
          path: 'journal',
          model: Journal,
        }
      })
      
    if (!user || !user.character) throw new Error('Unauthorized');

    if (!canFight({ time: user.character.expeditionLastBattle, fight: 'expedition' })) return { error: { message: `Expedition cooldown didn't finished` } }

    const character = user.character;

    const journal = character.journal;

    // Resolve equipped-item refs so item bonuses feed into the combat
    // simulation (effective stats, armor, weapon damage).
    await populateEquipment(character);

    const { battleSummary, pickedEnemy } = battleCreature({ character, enemy });

    // Lazily initialise the journal entry so newly added expeditions /
    // enemies (and pre-existing journals) don't crash on a missing key.
    if (!journal.expeditions) journal.expeditions = {};
    if (!journal.expeditions[expeditionName]) journal.expeditions[expeditionName] = {};
    if (!journal.expeditions[expeditionName][enemyName]) {
      journal.expeditions[expeditionName][enemyName] = {
        knowledge: 0, battles: 0, wins: 0, defeats: 0, draws: 0,
      };
    }
    journal.markModified('expeditions');

    journal.expeditions[expeditionName][enemyName].battles++;

    // Normalise the result identifiers up-front. simulateCombat sets
    // `winner` to either the attacker's _id (ObjectId) or the picked
    // enemy's numeric id stringified, so compare via String() to avoid
    // ObjectId-instance pitfalls that would silently drop the loot path.
    const winnerKey = String(battleSummary.result.winner ?? '');
    const characterKey = String(character._id);
    const enemyKey = String(pickedEnemy.id);
    const playerWon = winnerKey === characterKey;
    const enemyWon = winnerKey === enemyKey;
    const isDraw = winnerKey === 'Draw';

    // If the character won.
    let droppedItemSummary: { name: string; quality: string; image: string } | null = null;
    let expeditionHonorDelta = 0;
    if (playerWon) {
      journal.world.battles++;
      journal.world.wins++;
      journal.world.crownsEarned = (journal.world.crownsEarned ?? 0) + (battleSummary.result.crownsDrop ?? 0);
      journal.world.damageInflicted = (journal.world.damageInflicted ?? 0) + (battleSummary.result.attackerTotalDamage ?? 0);
      journal.world.damageReceived = (journal.world.damageReceived ?? 0) + (battleSummary.result.defenderTotalDamage ?? 0);
      journal.expeditions[expeditionName][enemyName].wins++;

      // Expedition honor: small per-kill bonus scaled by enemy level,
      // bosses pay double. Source-table values look like Rat ~3-5,
      // Bear ~21-36, Captain (boss) ~39-74 -- this matches the lower
      // end and keeps arena honor as the dominant ladder.
      const enemyLevel = Math.max(1, (pickedEnemy as any).level ?? 1);
      const isBossKill = !!(pickedEnemy as any).boss;
      expeditionHonorDelta = Math.max(1, Math.floor(enemyLevel * (isBossKill ? 1 : 0.5)));
      character.honor = (character.honor ?? 0) + expeditionHonorDelta;
      journal.world.honorEarned = (journal.world.honorEarned ?? 0) + expeditionHonorDelta;
      journal.markModified('world');

      // Calculate probability of obtaining knowledge only if knowledge is not greater than 3.
      if (journal.expeditions[expeditionName][enemyName].knowledge < 3 && randomBoolean(30)) {
        journal.expeditions[expeditionName][enemyName].knowledge++;
      }

      // Roll a possible loot drop and place it in the inventory.
      // Classify the enemy by its slot within the region (0..2 = normal
      // tiers) or by its boss flag -- the global `id` is not a clean
      // index, so use the key order in the region instead.
      const regionKeys = Object.keys(expeditionEnemies[expeditionName] ?? {});
      const slotIndex = Math.max(0, regionKeys.indexOf(enemyName));
      const enemyType = (pickedEnemy as any).boss
        ? 'boss'
        : enemyTypeFromIndex(slotIndex);
      const drop = rollExpeditionDrop({
        // Items scale to the *enemy* (Gladiatus drops the bear's loot,
        // not the player's). Falls back to the player's level if the
        // picked enemy somehow shipped without one.
        enemyLevel: (pickedEnemy as any).level ?? character.level ?? 1,
        enemyType,
      });
      if (drop.dropped && drop.template) {
        try {
          const created = await Item.create({
            ...drop.template,
            level: drop.itemLevel ?? drop.template.level,
            quality: drop.quality ?? drop.template.quality ?? 'common',
            owner: character._id,
          });
          if (drop.template.itemId && created._id) {
            created.id = `${drop.template.itemId}-${created._id}`;
            await created.save();
          }

          const migrated = migrateLegacyInventory(character.inventory);
          const entries: InventoryEntry[] = migrated
            ? migrated
            : (Array.isArray(character.inventory)
              ? (character.inventory as any[]).map((e: any) => ({
                  item: e?.item, x: e?.x ?? 0, y: e?.y ?? 0,
                }))
              : []);

          const free = findFreePosition(entries, created);
          if (free) {
            const next = placeItem(entries, created, free.x, free.y);
            // Direct assignment (instead of doc.set(path, value)) so
            // Mongoose change-tracking on the array reliably persists.
            character.inventory = next.map((e) => ({
              item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
              x: e.x,
              y: e.y,
              bag: e.bag ?? 0,
            }));
            character.markModified('inventory');
            character.itemsFound = (character.itemsFound ?? 0) + 1;
            droppedItemSummary = {
              name: created.name,
              quality: created.quality ?? 'common',
              image: created.image,
            };
          } else {
            // Inventory full -- drop on floor (delete the item).
            await Item.findByIdAndDelete(created._id);
          }
        } catch (err) {
          console.log(`${new Date()} - Failed to apply expedition drop - ${err}`);
        }
      }
    }

    // If the enemy won.
    if (enemyWon) {
      journal.world.battles++;
      journal.world.defeats++;
      journal.world.damageInflicted = (journal.world.damageInflicted ?? 0) + (battleSummary.result.attackerTotalDamage ?? 0);
      journal.world.damageReceived = (journal.world.damageReceived ?? 0) + (battleSummary.result.defenderTotalDamage ?? 0);
      journal.expeditions[expeditionName][enemyName].defeats++;
      journal.markModified('world');
    }

    // If it's a draw.
    if (isDraw) {
      journal.world.battles++;
      journal.world.draws++;
      journal.expeditions[expeditionName][enemyName].draws++;
      journal.markModified('world');
    }

    await journal.save();

    // Stamp the honor delta onto the result so the battle report page
    // can display it -- expeditions now feed honor too, not just gold.
    if (expeditionHonorDelta > 0) {
      battleSummary.result.honorEarned = expeditionHonorDelta;
    }

     // Create the battle report. Old reports are kept so the player can
     // browse their history under /game/reports.
     const savedBattleReport = await BattleReport.create({
      result: battleSummary.result,
      rounds: battleSummary.rounds,
      expedition: expeditionName,
      defender: pickedEnemy,
      attacker: character._id,
      loot: droppedItemSummary ?? undefined,
    });

    character.battleReport = savedBattleReport._id;

    // If the experience it's enough for leveling up, make the calculations.
    if (character.experience + battleSummary.result.experienceDrop >= calculateExperience(character.level)) {
      character.experience = character.experience + battleSummary.result.experienceDrop - calculateExperience(character.level);
      character.level++;
    }
    // If its not enough only sum up the experience.
    else {
      character.experience += battleSummary.result.experienceDrop;
    }

    character.crowns += battleSummary.result.crownsDrop;

    character.expeditionLastBattle = new Date();

    await character.save();

    // Quest hooks: only count expedition kills (not losses); bosses
    // feed the boss-specific quest as well; an actual placed drop
    // (droppedItemSummary set) bumps the loot quest.
    try {
      if (playerWon) {
        await trackQuestProgress({ characterId: character._id, verb: 'expedition_kill', amount: 1 });
        if ((pickedEnemy as any).boss) {
          await trackQuestProgress({ characterId: character._id, verb: 'expedition_boss', amount: 1 });
        }
        if (droppedItemSummary) {
          await trackQuestProgress({ characterId: character._id, verb: 'find_items', amount: 1 });
        }
      }
    } catch {}

    revalidatePath('/game/expeditions');
    return JSON.parse(JSON.stringify(savedBattleReport._id));

  } catch (error) {
    console.log(`${new Date} - Failed to simulate battle - ${error}`);
    throw error;
  }
}