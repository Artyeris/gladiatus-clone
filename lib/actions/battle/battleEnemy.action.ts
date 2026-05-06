'use server'

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { canFight, extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';
import Journal from '@/lib/models/journal.model';
import { battleCreature } from '@/lib/utils/simulateCombat';
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

    const { battleSummary, pickedEnemy } = battleCreature({ character, enemy });

    journal.expeditions[expeditionName][enemyName].battles++;

    // If the character won.
    let droppedItemSummary: { name: string; quality: string } | null = null;
    if (battleSummary.result.winner === character._id) {
      journal.world.battles++;
      journal.world.wins++;
      journal.world.crownsEarned += battleSummary.result.crownsDrop;
      journal.expeditions[expeditionName][enemyName].wins++;

      // Calculate probability of obtaining knowledge only if knowledge is not greater than 3.
      if (journal.expeditions[expeditionName][enemyName].knowledge < 3 && randomBoolean(30)) {
        journal.expeditions[expeditionName][enemyName].knowledge++;
      }

      // Roll a possible loot drop and place it in the inventory.
      const enemyIndex = typeof pickedEnemy.id === 'number' ? pickedEnemy.id : 0;
      const drop = rollExpeditionDrop({
        playerLevel: character.level ?? 1,
        enemyType: enemyTypeFromIndex(enemyIndex),
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
            character.set('inventory', next.map((e) => ({
              item: (e.item && typeof e.item === 'object' && '_id' in e.item) ? e.item._id : e.item,
              x: e.x,
              y: e.y,
            })));
            character.markModified('inventory');
            droppedItemSummary = { name: created.name, quality: created.quality ?? 'common' };
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
    if (battleSummary.result.winner === pickedEnemy.id.toString()) {
      journal.world.battles++;
      journal.world.defeats++;
      journal.expeditions[expeditionName][enemyName].defeats++;
    }

    // If it's a draw.
    if (battleSummary.result.winner === 'Draw') {
      journal.world.battles++;
      journal.world.draws++;
      journal.expeditions[expeditionName][enemyName].draws++;
    }

    await journal.save();

     // Create the battle report and if there is already an existing one, delete it.
     const savedBattleReport = await BattleReport.create({
      result: battleSummary.result,
      rounds: battleSummary.rounds,
      expedition: expeditionName,
      defender: pickedEnemy,
      attacker: character._id,
    });

    await BattleReport.findByIdAndDelete(character.battleReport);

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

    revalidatePath('/game/expeditions');
    return JSON.parse(JSON.stringify(savedBattleReport._id));

  } catch (error) {
    console.log(`${new Date} - Failed to simulate battle - ${error}`);
    throw error;
  }
}