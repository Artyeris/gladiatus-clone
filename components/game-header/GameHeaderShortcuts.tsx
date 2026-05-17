import Link from 'next/link';
import { Mail, ScrollText, Swords } from 'lucide-react';

import { getUnreadMessageCount } from '@/lib/actions/message/message.action';

// Small Gladiatus-style shortcut bar that sits in the top-left of
// every game screen, mirroring the original's icon-row above the
// gold/honour counters. Messages get a red dot when something
// unread is waiting in the inbox.
const GameHeaderShortcuts = async () => {
  let unread = 0;
  try {
    unread = await getUnreadMessageCount();
  } catch {
    unread = 0;
  }

  return (
    <div className='flex flex-col gap-1 shrink-0'>
      <Shortcut href='/game/messages' label='Messages' badge={unread}>
        <Mail className='w-5 h-5' />
      </Shortcut>
      <Shortcut href='/game/reports' label='Battle reports'>
        <Swords className='w-5 h-5' />
      </Shortcut>
      <Shortcut href='/game/quests' label='Quests'>
        <ScrollText className='w-5 h-5' />
      </Shortcut>
    </div>
  );
};

export default GameHeaderShortcuts;

function Shortcut({
  href, label, badge, children,
}: {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className='relative w-9 h-9 flex items-center justify-center rounded-sm border-[2px] border-cream2 text-cream2 bg-red/40 hover:bg-red/70 transition'
    >
      {children}
      {badge && badge > 0 ? (
        <span
          className='absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-cream2 flex items-center justify-center'
          style={{ background: '#a32626', border: '1px solid #eed7a1' }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}
