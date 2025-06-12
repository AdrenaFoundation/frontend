import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ImageRef, VestExtended } from '@/types';

export default function MobileNavbar({
  PAGES,
  userVest,
  userDelegatedVest,
}: {
  PAGES: { name: string; link: string; icon?: ImageRef; external?: boolean }[];
  userVest: VestExtended | null | false;
  userDelegatedVest: VestExtended | null | false;
}) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0  z-50 flex flex-row justify-between items-center w-full bg-secondary/80 backdrop-blur-md border-t border-bcolor">
      {PAGES.filter(
        (p) =>
          ![
            'Vote',
            'Learn',
            'Profile',
            'Referral',
            'Leaderboard',
            userVest || userDelegatedVest ? null : 'Vest',
            'Achievements'
          ].includes(p.name),
      ).map((page) => {
        return (
          <Link
            href={page.link}
            className={twMerge(
              'text-sm opacity-50 hover:opacity-100 transition duration-300 hover:grayscale-0 flex items-center justify-center p-3 sm:p-4 border-t-2 border-transparent flex-1',
              pathname === page.link
                ? 'grayscale-0 opacity-100 border-t-2 border-t-white'
                : 'grayscale',
            )}
            key={page.name}
          >
            <h5 className="whitespace-nowrap font-medium">
              {page.name === 'Provide Liquidity' ? 'Buy ALP' : page.name}
            </h5>
          </Link>
        );
      })}
    </div>
  );
}
