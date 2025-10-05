import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { LinksType } from '@/types';

import discordLogo from '../../../public/images/discord.png';
import githubLogo from '../../../public/images/github.svg';
import rightArrow from '../../../public/images/Icons/arrow-slim.svg';
import arrow from '../../../public/images/Icons/arrow-sm-45.svg';
import twitterLogo from '../../../public/images/x.svg';

export default function MoreMenu({
  PAGES,
  EXTERNAL_LINKS,
  pathname,
}: {
  PAGES: LinksType[];
  EXTERNAL_LINKS: LinksType[];
  pathname: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const SOCIAlS_LINKS = [
    {
      name: 'Discord',
      link: 'https://discord.gg/adrena',
      icon: discordLogo,
    },
    {
      name: 'Github',
      link: 'https://github.com/orgs/AdrenaFoundation',
      icon: githubLogo,
    },
    {
      name: 'Twitter',
      link: 'https://twitter.com/AdrenaProtocol',
      icon: twitterLogo,
    },
  ];

  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const menuElement = ref.current;
    const relatedTarget = event.relatedTarget as Element | null;

    if (menuElement && relatedTarget) {
      const isTargetOutsideMenu = !menuElement.contains(relatedTarget);
      if (isTargetOutsideMenu) {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="relative" ref={ref} onMouseLeave={handleMouseLeave}>
      <h5
        className={twMerge(
          'whitespace-nowrap opacity-50 hover:opacity-100 cursor-pointer p-0.5 -m-0.5',
          PAGES.some((page) => pathname === page.link) || isOpen
            ? 'grayscale-0 opacity-100'
            : 'grayscale',
        )}
        onMouseEnter={() => setIsOpen(true)}
      >
        More
      </h5>

      {/* this is necessary to stop menu closing when hovering over the empty space inbetween */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[6.25rem] h-[1.125rem]" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            id="more-menu"
            key="more-menu"
            className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-row gap-5 bg-secondary border shadow-xl rounded-md p-4 w-[37.5rem]">
            <div className="flex-1">
              <p className="text-sm mb-1 font-semibold opacity-50">Features</p>
              <div className="flex flex-col gap-3 flex-1">
                {PAGES.map((page) => {
                  return (
                    <Link
                      className={twMerge(
                        'flex flex-row items-center justify-between group border border-bcolor bg-transparent hover:bg-bcolor/20 p-2 pr-4 rounded-md transition duration-300',
                        pathname === page.link
                          ? 'bg-bcolor/20 border-white/10'
                          : '',
                      )}
                      href={page.link}
                      key={page.name}
                      target={page.external ? '_blank' : '_self'}
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex flex-row items-center gap-3">
                        {page?.icon ? (
                          <div className="flex items-center justify-center p-1 w-9 h-9 border rounded-full">
                            <Image
                              src={page.icon}
                              alt={page.name}
                              className="w-3 h-3"
                              width={12}
                              height={12}
                            />
                          </div>
                        ) : null}
                        <div>
                          <p className="text-base font-semibold">{page.name}</p>
                          <p className="opacity-50 text-sm">{page?.subtitle}</p>
                        </div>
                      </div>

                      <Image
                        src={rightArrow}
                        alt="arrow icon"
                        className="w-3 h-3 rotate-90 opacity-0 blur-sm -translate-x-3 group-hover:blur-0 group-hover:translate-x-0 group-hover:opacity-100 transition duration-300"
                        width={12}
                        height={12}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex-1">
              <div>
                <p className="text-sm mb-1 font-semibold opacity-50">
                  External Links
                </p>
                <div className="flex flex-col gap-3 flex-1">
                  {EXTERNAL_LINKS.map((page) => {
                    return (
                      <Link
                        className="flex flex-row items-center justify-between border border-bcolor p-2 bg-transparent hover:bg-bcolor/20 px-4 rounded-md transition duration-300"
                        href={page.link}
                        key={page.name}
                        target={page.external ? '_blank' : '_self'}
                      >
                        <div className="flex flex-row items-center gap-3">
                          {page?.icon ? (
                            <Image
                              src={page.icon}
                              alt={page.name}
                              className="w-3 h-3"
                              width={12}
                              height={12}
                            />
                          ) : null}
                          <div>
                            <p className="text-base font-semibold">{page.name}</p>
                          </div>
                        </div>

                        <Image
                          src={arrow}
                          alt="arrow icon"
                          className="w-2 h-2"
                          width={8}
                          height={8}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm mb-1 font-semibold opacity-50">Socials</p>

                <div className="flex flex-row gap-3 flex-1">
                  {SOCIAlS_LINKS.map((page) => {
                    return (
                      <Link
                        className="flex flex-row items-center justify-center border border-bcolor w-[2.5rem] h-[2.5rem] p-2 bg-transparent hover:bg-bcolor/20 rounded-md transition duration-300"
                        href={page.link}
                        key={page.name}
                        target="_blank"
                      >
                        {page?.icon ? (
                          <Image
                            src={page.icon}
                            alt={page.name}
                            className="w-3 h-3"
                            width={12}
                            height={12}
                          />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
