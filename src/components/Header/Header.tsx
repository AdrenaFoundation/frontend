import { Connection } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import { PriorityFeesAmounts } from '@/hooks/usePriorityFees';
import { useSelector } from '@/store/store';
import { PriorityFeeOption, UserProfileExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

import chevronDownIcon from '../../../public/images/chevron-down.svg';
import logo from '../../../public/images/logo.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import Settings from '../Settings/Settings';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header({
  userProfile,
  PAGES,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  priorityFeeOption,
  setPriorityFeeOption,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  priorityFeeAmounts,
}: {
  priorityFeeOption: PriorityFeeOption;
  setPriorityFeeOption: (priorityFee: PriorityFeeOption) => void;
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string; external?: boolean }[];
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  priorityFeeAmounts: PriorityFeesAmounts;
}) {
  const pathname = usePathname();

  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [adxPrice, setAdxPrice] = useState<number | null>(null);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  useEffect(() => {
    setAlpPrice(tokenPrices.ALP);
    setAdxPrice(tokenPrices.ADX);
  }, [tokenPrices]);

  const clusterSwitchEnabled = false;

  return (
    <div className="w-full flex flex-row items-center justify-between p-3 px-7 border-b border-b-bcolor bg-secondary z-50">
      <div className="flex flex-row items-center gap-6">
        <Link className="font-bold uppercase relative" href="/">
          {
            <Image
              src={logo}
              className={twMerge(
                'shrink-0 relative',
                window.adrena.cluster === 'devnet' ? 'bottom-1' : '',
              )}
              alt="logo"
              width={100}
              height={25}
            />
          }

          {window.adrena.cluster === 'devnet' ? (
            <span className="absolute font-special text-blue-500 bottom-[-1.4em] right-0 text-xs">
              Devnet
            </span>
          ) : null}
        </Link>

        {/* {window.adrena.cluster === 'devnet'
          ? PageLink('/faucet_devnet', 'Faucet')
          : null} */}

        {PAGES.map((page) => {
          return (
            <Link
              href={page.link}
              className={twMerge(
                'text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center',
                pathname === page.link ? 'opacity-100' : '',
              )}
              key={page.name}
              target={page.external ? '_blank' : '_self'}
            >
              <h5 className='whitespace-nowrap'>{page.name}</h5>

              {page.external ? <Image
                src={externalLinkLogo}
                alt="External link"
                className='w-3 h-3 ml-1'
                width={12}
                height={12}
              /> : null}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-row items-center gap-2 sm:gap-3">
        <Link href="/buy_alp" className={twMerge('ml-2 items-center justify-center flex hover:opacity-100', pathname !== '/buy_alp' && 'opacity-50')}>
          <div className='text-sm mr-2 font-boldy'>ALP</div>

          {alpPrice ?
            <div className='w-[3em] border bg-third pt-[2px] pb-[2px] pr-1 pl-1 rounded'>
              <div className='text-xxs font-mono flex items-center justify-center'>{formatPriceInfo(alpPrice, window.adrena.client.alpToken.displayPriceDecimalsPrecision, window.adrena.client.alpToken.displayPriceDecimalsPrecision)}</div>
            </div> :
            <div className="w-[3em] h-4 bg-gray-800 rounded-xl" />}
        </Link>

        <Link href="/buy_adx" className={twMerge('ml-2 items-center justify-center flex hover:opacity-100', pathname !== '/buy_adx' && 'opacity-50')}>
          <div className='text-sm mr-2 font-boldy'>ADX</div>

          {adxPrice ?
            <div className='w-[3em] border bg-third pt-[2px] pb-[2px] pr-1 pl-1 rounded'>
              <div className='text-xxs font-mono flex items-center justify-center'>{formatPriceInfo(adxPrice, window.adrena.client.adxToken.displayPriceDecimalsPrecision, window.adrena.client.adxToken.displayPriceDecimalsPrecision)}</div>
            </div> :
            <div className="w-[3em] h-4 bg-gray-800 rounded-xl" />}
        </Link>

        <Settings
          priorityFeeOption={priorityFeeOption}
          setPriorityFeeOption={setPriorityFeeOption}
          activeRpc={activeRpc}
          rpcInfos={rpcInfos}
          autoRpcMode={autoRpcMode}
          customRpcUrl={customRpcUrl}
          customRpcLatency={customRpcLatency}
          favoriteRpc={favoriteRpc}
          setAutoRpcMode={setAutoRpcMode}
          setCustomRpcUrl={setCustomRpcUrl}
          setFavoriteRpc={setFavoriteRpc}
          priorityFeeAmounts={priorityFeeAmounts}
        />

        <WalletAdapter userProfile={userProfile} />

        {clusterSwitchEnabled ? (
          <Menu
            trigger={
              <Button
                title={window.adrena.cluster}
                variant="outline"
                rightIcon={chevronDownIcon}
              />
            }
          >
            <MenuItems>
              <MenuItem selected={window.adrena.cluster === 'devnet'}>
                Devnet
              </MenuItem>

              <MenuSeparator />

              <MenuItem selected={window.adrena.cluster === 'mainnet'}>
                Mainnet
              </MenuItem>
            </MenuItems>
          </Menu>
        ) : null}
      </div>
    </div>
  );
}
