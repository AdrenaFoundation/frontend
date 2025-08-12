import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';

import ADXSwapBuy from './ADXSwapBuy';
import ADXSwapSell from './ADXSwapSell';

export default function ADXSwap({
  className,
  connected,
}: {
  className?: string;
  connected: boolean;
}) {
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell'>('buy');

  return (
    <div
      className={twMerge(
        'relative',
        className,
        !connected && 'overflow-hidden',
      )}
    >
      <TabSelect
        selected={selectedAction}
        tabs={[
          { title: 'BUY', activeColor: 'border-white' },
          { title: 'SELL', activeColor: 'border-white' },
        ]}
        onClick={(title) => {
          setSelectedAction(title as 'buy' | 'sell');
        }}
      />

      {selectedAction === 'buy' ? (
        <ADXSwapBuy connected={connected} />
      ) : (
        <ADXSwapSell connected={connected} />
      )}

      {!connected ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-full w-full backdrop-blur-sm">
          <WalletConnection />
        </div>
      ) : null}
    </div>
  );
}
