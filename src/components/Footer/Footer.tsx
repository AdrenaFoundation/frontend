import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import githubLogo from '../../../public/images/github.svg';
import twitterLogo from '../../../public/images/x.svg';

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={twMerge(
        'flex flex-col w-full border-t border-bcolor justify-center items-center bg-main h-14 shrink-0 max-h-14 min-h-14',
        className,
      )}
    >
      <div className="flex w-full justify-center items-center">
        <Link
          href="https://github.com/orgs/AdrenaDEX/repositories"
          target="_blank"
        >
          <Image
            className="hover:opacity-90 cursor-pointer h-5 w-auto"
            src={githubLogo}
            alt="github icon"
            width="25"
            height="25"
          />
        </Link>

        <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
          <Image
            className="hover:opacity-90 cursor-pointer ml-8 h-4 w-auto"
            src={twitterLogo}
            alt="twitter icon"
            width="20"
            height="20"
          />
        </Link>

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
