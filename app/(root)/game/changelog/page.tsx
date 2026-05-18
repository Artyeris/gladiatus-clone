import { redirect } from 'next/navigation';

import { getUser } from '@/lib/actions/user/getUser.action';
import { CHANGELOG } from '@/lib/utils/changelog';

const Page = async () => {
  const user = await getUser().catch(() => redirect('/'));
  if (!user) return null;
  if (!user.character) redirect('/onboarding');

  return (
    <div className='px-6 flex flex-col gap-3 text-brown2'>
      <div className='red-card text-cream2 font-semibold text-sm px-3 py-1 rounded-sm'>
        Change Log
      </div>

      <div className='brown-card rounded-sm flex flex-col text-sm overflow-hidden'>
        <div
          className='grid font-semibold text-xs border-b-[2px] border-cream2 bg-brown2/10'
          style={{ gridTemplateColumns: '110px 90px 1fr' }}
        >
          <div className='px-3 py-2'>Date</div>
          <div className='px-3 py-2'>Version</div>
          <div className='px-3 py-2'>Changes</div>
        </div>
        {CHANGELOG.map((entry, idx) => (
          <div
            key={entry.version}
            className={`grid text-sm ${idx < CHANGELOG.length - 1 && 'border-b-[2px] border-cream2'}`}
            style={{ gridTemplateColumns: '110px 90px 1fr' }}
          >
            <div className='px-3 py-3 tabular-nums opacity-90'>{entry.date}</div>
            <div className='px-3 py-3 font-semibold text-red3 tabular-nums'>v{entry.version}</div>
            <ul className='px-3 py-3 list-disc list-inside flex flex-col gap-[2px]'>
              {entry.changes.map((c, i) => (
                <li key={i} className='leading-snug'>{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
