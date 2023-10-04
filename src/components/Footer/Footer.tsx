import Image from 'next/image';
import Link from 'next/link';

import githubLogo from '../../../public/images/github.svg';
import twitterLogo from '../../../public/images/twitter.svg';

export default function Footer() {
  return (
    <div className="flex-col w-full h-auto pt-4 pb-4 border-t border-grey justify-center items-center shrink-0">
      <div className="flex w-full justify-center items-center">
        <Link
          href="https://github.com/orgs/AdrenaDEX/repositories"
          target="_blank"
        >
          <Image
            className="hover:opacity-90 cursor-pointer"
            src={githubLogo}
            alt="github icon"
            width="25"
            height="25"
          />
        </Link>

        <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
          <Image
            className="hover:opacity-90 cursor-pointer ml-8"
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
    </div>
  );
}
