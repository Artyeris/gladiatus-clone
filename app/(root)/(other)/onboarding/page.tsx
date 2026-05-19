import { redirect } from 'next/navigation';
import { getUser } from '@/lib/actions/user/getUser.action';
import Onboarding from '@/components/forms/Onboarding';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));

  if (!user) return null;

  // Used both for first-time setup (no character yet) and for adding
  // an extra gladiator from the Gladiators roster, so we no longer
  // redirect when a character already exists. The create action
  // enforces the 10-gladiator cap and name uniqueness.

  return (
    <div className='mb-4 flex flex-col items-center gap-6 px-10'>
      <Onboarding />
    </div>
  )
}

export default Page