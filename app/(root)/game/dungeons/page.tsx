import { redirect } from 'next/navigation';

import DungeonsContent from '@/components/content/DungeonsContent';
import { listDungeons } from '@/lib/actions/dungeon/dungeon.action';
import { getUser } from '@/lib/actions/user/getUser.action';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const res: any = await listDungeons();
  const dungeons = res?.ok ? res.dungeons : [];
  const character: any = user.character;

  return (
    <DungeonsContent
      characterLevel={character.level ?? 1}
      ownedMercenaryCount={(character.mercenaries ?? []).length}
      dungeons={dungeons}
    />
  );
};

export default Page;
