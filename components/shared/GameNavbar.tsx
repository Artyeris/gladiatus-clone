'use client'

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logOutUser } from '@/lib/actions/user/logOut.action';
import { LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// The dark navbar bar has been removed; the two surviving elements
// (Gladiatus title on the left, My Account button on the right) are
// rendered as fixed, free-floating widgets that sit on top of the
// background image without a chrome strip behind them.
const GameNavbar = () => {
  const pathname = usePathname();

  const logOut = async () => {
    await logOutUser();
  }

  return (
    <>
      <Link
        className='fixed top-2 left-4 text-lg font-semibold text-cream2 cursor-pointer hidden sm:flex drop-shadow-lg z-[998]'
        href='/game/overview'
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
      >
        Gladiatus
      </Link>
      {pathname !== '/onboarding' && (
        <div className='fixed top-2 right-4 z-[998]'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='red-card text-cream2 text-center font-semibold text-md cursor-pointer hover:text-gold hover:border-gold transition rounded-sm hover:bg-red h-8 w-40 drop-shadow-lg'>
                My Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56 red-card'>
              <DropdownMenuLabel className='text-cream2'>
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-cream2' />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className='hover:bg-red2 cursor-pointer'>
                  <Link href='/game/profile'>
                    <User className='mr-2 h-4 w-4 text-cream2' />
                    <span className='text-cream2'>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='hover:bg-red2 cursor-pointer'>
                  <Link href='/game/settings'>
                    <Settings className='mr-2 h-4 w-4 text-cream2' />
                    <span className='text-cream2'>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className='bg-cream2' />
              <DropdownMenuItem
                className='hover:bg-red2 cursor-pointer'
                onClick={logOut}
              >
                <LogOut className='mr-2 h-4 w-4 text-cream2' />
                <span className='text-cream2'>
                  Log out
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  )
}

export default GameNavbar;
