import Link from 'next/link';
import { Mail, Newspaper, Package, Swords } from 'lucide-react';

import { getUnreadMessageCount } from '@/lib/actions/message/message.action';
import { getPackageCount } from '@/lib/actions/package/package.action';

// Horizontal row of small Gladiatus-style shortcuts (Messages,
// Battle reports, Packages, News). Rendered at the top of the side
// banner, just above the Overview link. Messages / Packages get a
// red unread-count dot when something is waiting.
const GameHeaderShortcuts = async () => {
  let unread = 0;
  let packages = 0;
  try { unread = await getUnreadMessageCount(); } catch { unread = 0; }
  try { packages = await getPackageCount(); } catch { packages = 0; }

  return (
    <div className='flex flex-row gap-2 w-full justify-center'>
      <Shortcut href='/game/packages' label='Packages' badge={packages}>
        <Package className='w-5 h-5' />
      </Shortcut>
      <Shortcut href='/game/reports' label='Battle reports'>
        <Swords className='w-5 h-5' />
      </Shortcut>
      <Shortcut href='/game/messages' label='Messages' badge={unread}>
        <Mail className='w-5 h-5' />
      </Shortcut>
      <Shortcut href='/game/news' label='News'>
        <Newspaper className='w-5 h-5' />
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
      prefetch
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
