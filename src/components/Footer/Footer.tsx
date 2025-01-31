import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import QuestMenu from '@/components/QuestMenu/QuestMenu';

import discordLogo from '../../../public/images/discord.png';
// import discourseLogo from '../../../public/images/discourse.svg';
import githubLogo from '../../../public/images/github.svg';
import twitterLogo from '../../../public/images/x.svg';

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={twMerge(
        'flex flex-col w-full border-t border-bcolor justify-center items-center bg-main h-14 shrink-0 max-h-14 min-h-14',
        window.location.pathname === '/trade' && 'hidden sm:flex',
        className,
      )}
    >
      <QuestMenu />

      <div className="flex w-full justify-center items-center gap-x-6">
        <Link href="https://discord.gg/adrena" target="_blank">
          <Image
            className="hover:opacity-100 opacity-50 cursor-pointer h-6 w-auto"
            src={discordLogo}
            alt="Discord icon"
            width="24"
            height="24"
          />
        </Link>

        <Link href="https://github.com/orgs/AdrenaFoundation" target="_blank">
          <Image
            className="hover:opacity-100 opacity-50 cursor-pointer h-5 w-auto"
            src={githubLogo}
            alt="github icon"
            width="25"
            height="25"
          />
        </Link>

        <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
          <Image
            className="hover:opacity-100 opacity-50 cursor-pointer h-4 w-auto"
            src={twitterLogo}
            alt="twitter icon"
            width="20"
            height="20"
          />
        </Link>

        {/* <Link href="https://adrena.discourse.group/" target="_blank">
          <Image
            className="hover:opacity-100 opacity-50 cursor-pointer h-5 w-auto"
            src={discourseLogo}
            alt="discourse icon"
            width="20"
            height="20"
          />
        </Link> */}
        {/* <Link
          href="/terms_and_conditions"
          className="absolute right-6 text-txtfade hover:text-white font-mono"
        >
          Terms and conditions
        </Link> */}
      </div>
    </footer>
  );
}
