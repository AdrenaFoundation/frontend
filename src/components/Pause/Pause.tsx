'use client';

import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';

import discordLogo from '../../../public/images/discord.png';
import logo from '../../../public/images/logo.png';
import twitterLogo from '../../../public/images/x.svg';

export default function Pause(): JSX.Element {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center bg-[#16273c]">
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0">
        <RiveAnimation
          animation="hero-monster"
          layout={new Layout({ fit: Fit.Cover, alignment: Alignment.Center })}
          className={'absolute top-0 left-0 w-full h-full'}
          automaticallyHandleEvents={true}
        />
      </div>

      <div
        className={twMerge(
          'flex flex-col h-full w-full items-center justify-center z-10 scale-75 sm:scale-90 2xl:scale-95 3xl:scale-100',
        )}
      >
        <Image src={logo} alt="adrena logo" className="w-[20em]" />

        <h1 className="mt-4 text-center">Devnet feedback window has ended</h1>

        <div className="block h-[2px] w-[15em] bg-gradient-to-b from-[#1A2A3D] via-[#2B3A55] to-[#1A2A3D] mt-8" />

        <h3 className="mt-8 w-[30em] font-boldy text-center">
          The team is actively working on app improvements based on your
          feedback and preparing for mainnet launch. Stay tuned!
        </h3>

        <div className="flex w-full justify-center items-center gap-x-16 mt-12">
          <Link href="https://discord.gg/adrena" target="_blank">
            <Image
              className="hover:opacity-100 opacity-50 cursor-pointer h-14 w-auto"
              src={discordLogo}
              alt="Discord icon"
              width="48"
              height="48"
            />
          </Link>

          <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
            <Image
              className="hover:opacity-100 opacity-50 cursor-pointer h-10 w-auto"
              src={twitterLogo}
              alt="twitter icon"
              width="20"
              height="20"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
