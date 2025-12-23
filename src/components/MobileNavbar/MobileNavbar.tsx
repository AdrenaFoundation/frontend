import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 flex flex-row justify-between items-center w-full bg-secondary/80 backdrop-blur-md border-t border-bcolor pb-[env(safe-area-inset-bottom)]">
      {PAGES.filter(
        (p) =>
          ![
            'https://dao.adrena.trade/',
            'https://docs.adrena.trade/',
            '/profile',
            '/referral',
            '/mutagen_leaderboard',
            userVest || userDelegatedVest ? null : '/vest',
            '/achievements'
          ].includes(p.link),
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
            <h5 className="whitespace-nowrap font-regular">
              {page.link === '/buy_alp' ? `${t('layout.buy')} ALP` : page.name}
            </h5>
          </Link>
        );
      })}
    </div>
  );
}
