import Image from 'next/image';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import closeIcon from '@/../public/images/Icons/cross.svg';
import infoIcon from '@/../public/images/Icons/info.svg';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';

import ALPSwapBuy from './ALPSwapBuy';
import ALPSwapSell from './ALPSwapSell';

export default function ALPSwap({
  className,
  connected,
}: {
  className?: string;
  connected: boolean;
}) {
  const [cookie, setCookie] = useCookies(['alp_new_update_info']);
  const [isInfoShown, setIsInfoShown] = useState(
    cookie['alp_new_update_info'] !== 'dismissed',
  );

  const [selectedAction, setSelectedAction] = useState<
    'mint' | 'redeem' | null
  >('mint');

  return (
    <div
      className={twMerge(
        'relative',
        className,
        !connected && 'overflow-hidden',
      )}
    >

      <TabSelect
        selected={selectedAction as string}
        tabs={[
          { title: 'mint', activeColor: 'border-white' },
          { title: 'redeem', activeColor: 'border-white' },
        ]}
        onClick={(title) => {
          setSelectedAction(title as 'mint' | 'redeem');
        }}
      />

      {selectedAction === 'mint' ? (
        <ALPSwapBuy connected={connected} />
      ) : (
        <ALPSwapSell connected={connected} />
      )}

      {!connected ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-full w-full backdrop-blur-sm">
          <WalletConnection />
        </div>
      ) : null}

      {isInfoShown ? (
        <div className="bg-blue/20 border-dashed border-blue w-full p-2 rounded-lg mt-3">
          <div className="flex flex-row justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <Image
                className="opacity-60"
                src={infoIcon}
                height={16}
                width={16}
                alt="Info icon"
              />
              <p className="text-sm font-boldy">New fees update</p>
            </div>

            <Image
              className="opacity-60 mb-2 hover:opacity-100 cursor-pointer transition-opacity duration-300"
              src={closeIcon}
              alt="Close icon"
              width={16}
              height={16}
              onClick={() => {
                setIsInfoShown(false);
                setCookie('alp_new_update_info', 'dismissed');
              }}
            />
          </div>

          <ul className="mb-1">
            <li className="text-xs font-mono opacity-70">10 BPS on USDC</li>
            <li className="text-xs font-mono opacity-70">100 BPS on BTC/ETH</li>
            <li className="text-xs font-mono opacity-70">200 BPS on BONK</li>
          </ul>

          <p className="text-xs font-boldy opacity-70">
            We encourage mint and redeems to be done in USDC, but we keep the
            other routes open for emergencies, while gated by high fees to
            prevent pool&apos;s arbitrages
          </p>
        </div>
      ) : null}
    </div>
  );
}
