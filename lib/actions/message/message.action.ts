'use server'

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { COOKIE_NAME } from '@/constants';
import Character from '@/lib/models/character.model';
import Message from '@/lib/models/message.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';
import { extractUserId } from '@/lib/utils/jwtUtils';

export type MessageKind = 'auction' | 'work' | 'market' | 'system';

export interface MessageView {
  _id: string;
  kind: MessageKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

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

// Internal helper for other server actions to drop messages into a
// character's inbox. Not exposed to the client.
export async function sendMessageToCharacter(
  characterId: string,
  kind: MessageKind,
  title: string,
  body: string,
): Promise<void> {
  try {
    await connectToDB();
    await Message.create({ recipient: characterId, kind, title, body });
  } catch (err) {
    console.log(`${new Date()} - sendMessageToCharacter failed - ${err}`);
  }
}

export async function listMessages(): Promise<{
  messages: MessageView[];
  unread: number;
  error?: { message: string };
}> {
  const id = await getMyCharacterId();
  if (!id) return { messages: [], unread: 0, error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const docs = await Message.find({ recipient: id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const unread = await Message.countDocuments({ recipient: id, read: false });

    return {
      unread,
      messages: docs.map((d: any) => ({
        _id: String(d._id),
        kind: d.kind,
        title: d.title,
        body: d.body,
        read: !!d.read,
        createdAt: new Date(d.createdAt).toISOString(),
      })),
    };
  } catch (err: any) {
    console.log(`${new Date()} - listMessages failed - ${err}`);
    return { messages: [], unread: 0, error: { message: err?.message || 'Failed to load' } };
  }
}

export async function markMessageRead({ id }: { id: string }) {
  const charId = await getMyCharacterId();
  if (!charId) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    await Message.updateOne({ _id: id, recipient: charId }, { $set: { read: true } });
    revalidatePath('/game/messages');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - markMessageRead failed - ${err}`);
    return { error: { message: err?.message || 'Failed' } };
  }
}

export async function deleteMessage({ id }: { id: string }) {
  const charId = await getMyCharacterId();
  if (!charId) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    await Message.deleteOne({ _id: id, recipient: charId });
    revalidatePath('/game/messages');
    return { ok: true };
  } catch (err: any) {
    console.log(`${new Date()} - deleteMessage failed - ${err}`);
    return { error: { message: err?.message || 'Failed' } };
  }
}

export async function deleteAllMessages() {
  const charId = await getMyCharacterId();
  if (!charId) return { error: { message: 'Not authenticated' } };

  try {
    await connectToDB();
    const res = await Message.deleteMany({ recipient: charId });
    revalidatePath('/game/messages');
    return { ok: true, deleted: res.deletedCount ?? 0 };
  } catch (err: any) {
    console.log(`${new Date()} - deleteAllMessages failed - ${err}`);
    return { error: { message: err?.message || 'Failed' } };
  }
}

export async function getUnreadMessageCount(): Promise<number> {
  const id = await getMyCharacterId();
  if (!id) return 0;
  try {
    await connectToDB();
    return await Message.countDocuments({ recipient: id, read: false });
  } catch {
    return 0;
  }
}
