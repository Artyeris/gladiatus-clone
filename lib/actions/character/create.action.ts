'use server'

import { COOKIE_NAME } from '@/constants';
import { items } from '@/constants/items';
import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import Journal from '@/lib/models/journal.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils';
import { cookies } from 'next/headers';

interface CreateCharacterParams {
  name: string;
  gender: 'male' | 'female';
}

// Max gladiators per account. Older characters keep existing in the
// same world; they just become reachable through the Gladiators
// switcher under My Account.
const MAX_GLADIATORS = 10;

export async function createCharacter({ name, gender }: CreateCharacterParams) {
  if (name.length < 3) return { error: { message: 'Name should be at least 3 characters' } };

  const token = cookies().get(COOKIE_NAME);

  if (!token) throw new Error('Unathorized');

  try {
    const userId = extractUserId(token);

    connectToDB();

    const user = await User.findById(userId);

    if (!user) throw new Error('Unauthorized');

    // Backfill the characters array with the legacy single ref so
    // accounts created before this field existed still see their
    // original gladiator in the roster.
    const ownedIds = ((user.characters as any[] | undefined) ?? []).map((id: any) => String(id));
    if (user.character && !ownedIds.includes(String(user.character))) {
      ownedIds.push(String(user.character));
    }

    if (ownedIds.length >= MAX_GLADIATORS) {
      return { error: { message: `You already have ${MAX_GLADIATORS} gladiators -- the limit per account` } };
    }

    const isNameTaken = await Character.findOne({ name });
    if (isNameTaken) return { error: { message: 'Name is already taken' } };

    const character = await Character.create({
      name,
      gender,
      owner: user._id,
    });

    const sword = items.short_sword;
    const shield = items.planks;

    const initialSword = await Item.create({
      owner: character._id,
      ...sword,
    });
    initialSword.id = `${sword.itemId}-${initialSword._id}`;
    await initialSword.save();

    const initialShield = await Item.create({
      owner: character._id,
      ...shield,
    });
    initialShield.id = `${shield.itemId}-${initialShield._id}`;
    await initialShield.save();

    character.inventory = [
      { item: initialSword._id, x: 0, y: 0 },
      { item: initialShield._id, x: 0, y: 1 },
    ];
    character.markModified('inventory');

    const journal = await Journal.create({
      owner: character._id,
    });
    character.journal = journal._id;
    await character.save();

    ownedIds.push(String(character._id));
    user.characters = ownedIds;
    // Newly created character becomes the active one.
    user.character = character._id;
    await user.save();

    return { ok: true, characterId: String(character._id) };
  } catch (error) {
    console.log(`${new Date} - Failed to create character - ${error}`);
    throw error;
  }
}
