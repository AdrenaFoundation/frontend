import { Connection } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

import externalLinkLogo from '@/../public/images/external-link-logo.png';
import useAPR from '@/hooks/useAPR';
import { useSelector } from '@/store/store';
import {
  LinksType,
  UserProfileExtended,
  VestExtended,
  WalletAdapterExtended,
} from '@/types';
import { formatPriceInfo } from '@/utils';

import adxLogo from '../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../public/images/adrena_logo_alp_white.svg';
import chevronDownIcon from '../../../public/images/chevron-down.svg';
import competitionIcon from '../../../public/images/competition.svg';
import logo from '../../../public/images/logo.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import Mutagen from '../Mutagen/Mutagen';
import FormatNumber from '../Number/FormatNumber';
import PriorityFeeSetting from '../PriorityFeeSetting/PriorityFeeSetting';
import Settings from '../Settings/Settings';
import WalletAdapter from '../WalletAdapter/WalletAdapter';
import MoreMenu from './MoreMenu';

export default function Header({
  userProfile,
  PAGES,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  userVest,
  userDelegatedVest,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  adapters,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: LinksType[];
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
  userVest: VestExtended | null | false;
  userDelegatedVest: VestExtended | null | false;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  adapters: WalletAdapterExtended[];
}) {
  const pathname = usePathname();
  const { aprs } = useAPR();
  const tokenPriceALP = useSelector((s) => s.tokenPrices.ALP);
  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

  const clusterSwitchEnabled = false;

  const INTERNAL_PAGES = PAGES.filter((p) => !p?.external);

  const DROPDOWN_PAGES = INTERNAL_PAGES.filter(
    (p) => p.dropdown && (p.name !== 'Vest' || userVest || userDelegatedVest),
  );

  const MAIN_PAGES = INTERNAL_PAGES.filter((p) => !p?.dropdown);

  const EXTERNAL_LINKS = PAGES.filter((p) => p.external);

  return (
    <div className="w-full flex flex-row items-center justify-between p-3 px-3 xl:px-7 border-b border-b-bcolor bg-secondary z-50">
      <div className="flex flex-row items-center gap-4">
        <Link className="font-bold uppercase relative" href="/">
          <Image
            src={logo}
            className={twMerge(
              'shrink-0 relative hidden xl:block',
              window.adrena.cluster === 'devnet' ? 'bottom-1' : '',
            )}
            alt="logo"
            width={100}
            height={25}
          />

          <Image
            src={adxLogo}
            className={twMerge(
              'shrink-0 relative xl:hidden',
              window.adrena.cluster === 'devnet' ? 'bottom-1' : '',
            )}
            alt="logo"
            width={25}
            height={25}
          />

          {window.adrena.cluster === 'devnet' ? (
            <span className="absolute font-special text-blue-500 bottom-[-1.4em] right-0 text-xs">
              Devnet
            </span>
          ) : null}
        </Link>

        {MAIN_PAGES.map((page) => {
          return (
            <Link
              href={page.link}
              className={twMerge(
                'text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 hover:grayscale-0 flex items-center justify-center',
                pathname === page.link
                  ? 'grayscale-0 opacity-100'
                  : 'grayscale',
              )}
              key={page.name}
              target={page.external ? '_blank' : '_self'}
            >
              {page.name === 'Ranked' && (
                <Image
                  src={competitionIcon}
                  alt="logo"
                  width={12}
                  height={12}
                />
              )}
              <h5 className="whitespace-nowrap font-medium">{page.name}</h5>

              {page.name === 'Ranked' && (
                <Image
                  src={competitionIcon}
                  alt="logo"
                  width={12}
                  height={12}
                  className="scale-x-[-1]"
                />
              )}

              {page.external ? (
                <Image
                  src={externalLinkLogo}
                  alt="External link"
                  className="w-3 h-3 ml-1"
                  width={12}
                  height={12}
                />
              ) : null}
            </Link>
          );
        })}

        <MoreMenu
          PAGES={DROPDOWN_PAGES}
          EXTERNAL_LINKS={EXTERNAL_LINKS}
          pathname={pathname}
        />
      </div>

      <div className="flex flex-row items-center gap-2 sm:gap-3">
        <Link href="/buy_alp">
          {tokenPriceALP && aprs ? (
            <div className="flex flex-row items-center gap-2 lg:gap-1 border p-2 py-1 rounded-lg hover:bg-third transition-colors duration-300">
              <Image
                src={alpLogo}
                alt="ALP Logo"
                className="opacity-50"
                width={10}
                height={10}
              />

              <div className="flex flex-col lg:flex-row  gap-0 lg:gap-1">
                <div className="text-xxs font-mono">
                  {formatPriceInfo(
                    tokenPriceALP,
                    window.adrena.client.alpToken.displayPriceDecimalsPrecision,
                    window.adrena.client.alpToken.displayPriceDecimalsPrecision,
                  )}
                </div>

                <div className="self-stretch bg-bcolor w-[1px] flex-none" />

                <FormatNumber
                  nb={aprs.lp}
                  format="percentage"
                  precision={0}
                  suffix="APR"
                  suffixClassName="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                  className="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                  isDecimalDimmed={false}
                />
              </div>
            </div>
          ) : (
            <div className="w-[7em] h-4 bg-gray-800 rounded-xl" />
          )}
        </Link>

        <Link href="/buy_adx">
          {tokenPriceADX && aprs ? (
            <div className="flex flex-row items-center gap-2 lg:gap-1 border p-2 py-1 rounded-lg hover:bg-third transition-colors duration-300">
              <Image
                src={adxLogo}
                alt="ALP Logo"
                className="opacity-50"
                width={10}
                height={10}
              />

              <div className="flex flex-col lg:flex-row  gap-0 lg:gap-1">
                <div className="text-xxs font-mono">
                  {formatPriceInfo(
                    tokenPriceADX,
                    window.adrena.client.adxToken.displayPriceDecimalsPrecision,
                    window.adrena.client.adxToken.displayPriceDecimalsPrecision,
                  )}
                </div>

                <div className="self-stretch bg-bcolor w-[1px] flex-none" />

                <FormatNumber
                  nb={aprs.lm}
                  format="percentage"
                  precision={0}
                  suffix="APR"
                  suffixClassName="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                  className="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                  isDecimalDimmed={false}
                />
              </div>
            </div>
          ) : (
            <div className="w-[7em] h-4 bg-gray-800 rounded-xl" />
          )}
        </Link>

        <PriorityFeeSetting />

        <Settings
          activeRpc={activeRpc}
          rpcInfos={rpcInfos}
          autoRpcMode={autoRpcMode}
          customRpcUrl={customRpcUrl}
          customRpcLatency={customRpcLatency}
          favoriteRpc={favoriteRpc}
          setAutoRpcMode={setAutoRpcMode}
          setCustomRpcUrl={setCustomRpcUrl}
          setFavoriteRpc={setFavoriteRpc}
        />

        <Mutagen />

        <WalletAdapter userProfile={userProfile} adapters={adapters} />

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
