import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import heroTradingDemoImg from '@/../public/images/hero-trading-demo.svg';
import bonkLogo from '@/../public/images/partners/bonk.png';
import forgdLogo from '@/../public/images/partners/forgd.png';
import jitoLogo from '@/../public/images/partners/jito-logo.png';
import littleUnusualLogo from '@/../public/images/partners/little-unusual.png';
import offsideLabsLogo from '@/../public/images/partners/OffsideLabs.png';
import otterSecLogo from '@/../public/images/partners/OtterSec.png';
import Button from '@/components/common/Button/Button';
import InfiniteScroll from '@/components/common/InfiniteScroll/InfiniteScroll';
import LandingFooter from '@/components/Landing/LandingFooter';
import LandingFuture from '@/components/Landing/LandingFuture';
import LandingRevShare from '@/components/Landing/LandingRevShare';
import LandingStats from '@/components/Landing/LandingStats';
import LandingX from '@/components/Landing/LandingX';
import { PageProps } from '@/types';

export default function Landing({ mainPool }: PageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const PARTNERS = [
    { name: 'Jito', img: jitoLogo, link: 'https://jito.wtf/' },
    { name: 'FORGD', img: forgdLogo, link: 'https://forgd.com/' },
    { name: 'Bonk', img: bonkLogo, link: 'https://bonk.io/' },
    {
      name: 'Little Unusual',
      img: littleUnusualLogo,
      link: 'https://littleunusual.com/',
    },
    {
      name: 'Offside Labs',
      img: offsideLabsLogo,
      link: 'https://offside-labs.com/',
    },
    { name: 'OtterSec', img: otterSecLogo, link: 'https://ottersec.com/' },
  ];

  return (
    <div className="relative pb-10 bg-main">
      <div className="relative h-[30rem] sm:h-[40rem] md:h-[45rem] lg:h-[62rem] overflow-hidden">
        <div className="absolute w-full lg:h-[31.25rem] left-0 bottom-0 z-20 bg-gradient-to-t from-main to-transparent" />
        <div className="absolute w-full  h-full left-0 top-0 opacity-10 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

        <div className="max-w-[92rem] mx-auto relative w-full h-full z-10">
          <div className="max-w-[80rem] p-5 md:p-20 lg:p-32 !pb-0">
            <h1 className="text-[2rem] md:text-[3.75rem] font-bold leading-[1.1] mb-6 normal-case">
              Adrena, providing the best in class UX for traders and LPers.
            </h1>
            <p className="text-lg max-w-[37.5rem] opacity-50">
              Meet the system for modern software development. Streamline
              issues, projects, and product roadmaps.
            </p>
            <Button title="Trade Now" className="mt-3 font-monobold" />
          </div>
          <motion.span
            initial={{ opacity: 0, translateX: -100 }}
            animate={{
              opacity: isLoading ? 0 : 1,
              translateX: isLoading ? -100 : 0,
            }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Image
              src={heroTradingDemoImg}
              alt="Hero Trading Demo"
              onLoad={() => setIsLoading(false)}
              className="pointer-events-none absolute -bottom-[18.75rem] left-[8.5rem]"
            />
          </motion.span>
        </div>
      </div>

      <div className="max-w-[92rem] p-5 flex items-center mx-auto flex-col gap-[6rem] w-full">
        <div className="w-full opacity-50">
          <p className="opacity-50 text-sm text-center">Partners</p>
          <InfiniteScroll
            speed={60}
            gap="xl"
            className="w-full"
            fadeColor="from-main to-transparent"
          >
            {PARTNERS.map((partner, i) => (
              <Link
                key={partner.name + i}
                href={partner.link}
                target="_blank"
                className="flex-1 items-center justify-center flex p-5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              >
                <Image
                  src={partner.img}
                  alt={partner.name}
                  height={24}
                  className="object-contain"
                />
              </Link>
            ))}
          </InfiniteScroll>
        </div>
        <LandingStats mainPool={mainPool} />
        <LandingX />
        <LandingRevShare />
        <div className="w-full h-[0.0625rem] border border-dashed border-bcolor mt-[5rem]" />
        <LandingFuture />
        <LandingFooter />
      </div>
    </div>
  );
}
