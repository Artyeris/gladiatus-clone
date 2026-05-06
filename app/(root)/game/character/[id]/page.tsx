import { notFound, redirect } from 'next/navigation';

import CharacterProfileContent from '@/components/content/CharacterProfileContent';
import { getUser } from '@/lib/actions/user/getUser.action';
import { getCharacterProfile } from '@/lib/actions/character/getCharacterProfile.action';

interface PageProps {
  params: { id: string };
}

const Page = async ({ params }: PageProps) => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  const character = await getCharacterProfile(params.id);
  if (!character) notFound();

  const isMine = String(user.character._id) === String(character._id);

  return <CharacterProfileContent character={character} isMine={isMine} />;
};

export default Page;
