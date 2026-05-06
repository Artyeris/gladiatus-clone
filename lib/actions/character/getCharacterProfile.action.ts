'use server'

import Character from '@/lib/models/character.model';
import Item from '@/lib/models/item.model';
import { connectToDB } from '@/lib/mongoose';

const EQUIPMENT_SLOT_NAMES = [
  'head', 'chest', 'legs', 'gloves', 'cloak', 'boots',
  'mainHand', 'offHand', 'necklace', 'ring1', 'ring2',
];

export async function getCharacterProfile(id: string) {
  try {
    await connectToDB();
    const character: any = await Character.findById(id);
    if (!character) return null;

    if (character.equipment) {
      for (const slot of EQUIPMENT_SLOT_NAMES) {
        const ref = character.equipment[slot];
        if (ref && typeof ref === 'object' && !('name' in ref)) {
          const item = await Item.findById(ref);
          character.equipment[slot] = item ?? null;
        }
      }
    }

    return JSON.parse(JSON.stringify(character));
  } catch (error) {
    console.log(`${new Date()} - getCharacterProfile failed - ${error}`);
    return null;
  }
}
