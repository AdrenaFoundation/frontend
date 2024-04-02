import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import chevronDownIcon from '../../../public/images/chevron-down.svg';
import githubLogo from '../../../public/images/github.svg';
import burgerMenuIcon from '../../../public/images/Icons/burger-menu.svg';
import crossIcon from '../../../public/images/Icons/cross.svg';
import logo from '../../../public/images/logo.svg';
import twitterLogo from '../../../public/images/twitter.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeperator from '../common/Menu/MenuSeperator';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function BurgerMenu({
  userProfile,
  PAGES,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string }[];
}) {
  const { pathname } = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const clusterSwitchEnabled = false;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  return (
    <div className="z-30">
      <div className="fixed p-4 z-50 flex flex-row justify-between items-center w-full bg-gray-300/85 backdrop-blur-md border-b border-gray-200">
        <div
          className="flex items-center justify-center p-1 border w-9 h-8 border-gray-200 rounded-md hover:bg-gray-200 transition duration-300 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            className="cursor-pointer opacity-75"
            src={isOpen ? crossIcon : burgerMenuIcon}
            alt="burger menu icon"
            width={16}
            height={16}
          />
        </div>

        <div className="flex flex-row items-center gap-3">
          <Button
            title="Trade now"
            className="w-full"
            href={'/trade'}
            onClick={() => setIsOpen(false)}
          />

          <WalletAdapter className="w-full" userProfile={userProfile} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed flex flex-col justify-between w-full h-full bg-gray-300/85 backdrop-blur-md z-40 border-b border-gray-200 p-5 pt-[75px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <ul className="flex flex-col gap-3 mt-4">
                {PAGES.map((page) => {
                  return (
                    <li
                      className={twMerge(
                        'font-normal text-xl opacity-50 hover:opacity-100 transition-opacity duration-300 w-full',
                        pathname === page.link ? 'opacity-100' : '',
                      )}
                      key={page.name}
                    >
                      <Link
                        href={page.link}
                        className="block w-full"
                        onClick={() => setIsOpen(!open)}
                      >
                        {page.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {clusterSwitchEnabled ? (
                <Menu
                  className="mt-7"
                  trigger={
                    <Button
                      className="w-full"
                      title={window.adrena.cluster}
                      variant="outline"
                      rightIcon={chevronDownIcon}
                    />
                  }
                >
                  <MenuItems>
                    <MenuItem
                      selected={window.adrena.cluster === 'devnet'}
                      onClick={() => {
                        router.replace({
                          query: {
                            ...router.query,
                            cluster: 'devnet',
                          },
                        });
                      }}
                    >
                      Devnet
                    </MenuItem>
                    <MenuSeperator />
                    <MenuItem
                      selected={window.adrena.cluster === 'mainnet'}
                      onClick={() => {
                        router.replace({
                          query: {
                            ...router.query,
                            cluster: 'mainnet',
                          },
                        });
                      }}
                    >
                      Mainnet
                    </MenuItem>
                  </MenuItems>
                </Menu>
              ) : null}
            </div>

            <div>
              <Image
                src={logo}
                className="m-auto"
                alt="logo"
                width={150}
                height={150}
              />

              <div className="flex w-full justify-center gap-5 items-center">
                <Link
                  href="https://github.com/orgs/AdrenaDEX/repositories"
                  target="_blank"
                >
                  <Image
                    className="hover:opacity-90 cursor-pointer"
                    src={githubLogo}
                    alt="github icon"
                    width="20"
                    height="20"
                  />
                </Link>

                <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
                  <Image
                    className="hover:opacity-90 cursor-pointer"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
