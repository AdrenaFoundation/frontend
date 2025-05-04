import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

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
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell' | null>(
    'buy',
  );

  return (
    <div className={twMerge('relative', className, !connected && 'overflow-hidden')}>
      <TabSelect
        selected={selectedAction as string}
        tabs={[
          { title: 'buy', activeColor: 'border-white' },
          { title: 'sell', activeColor: 'border-white' },
        ]}
        onClick={(title) => {
          setSelectedAction(title as 'buy' | 'sell');
        }}
      />

      {selectedAction === 'buy' ? (
        <ALPSwapBuy connected={connected} />
      ) : (
        <ALPSwapSell connected={connected} />
      )}

      {!connected ? (<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-full w-full backdrop-blur-sm'><WalletConnection /></div>) : null}
    </div>
  );
}
