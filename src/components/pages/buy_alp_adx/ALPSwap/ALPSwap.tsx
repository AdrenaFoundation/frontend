import { useState } from 'react';

import TabSelect from '@/components/common/TabSelect/TabSelect';

import ALPSwapBuy from './ALPSwapBuy';
import ALPSwapSell from './ALPSwapSell';

export default function ALPSwap({
  className,
  triggerWalletTokenBalancesReload,
  connected,
}: {
  className?: string;
  triggerWalletTokenBalancesReload: () => void;
  connected: boolean;
}) {
  const [selectedAction, setSelectedAction] = useState<'buy' | 'sell' | null>('buy');

  return (
    <div className={className}>
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

      {selectedAction === 'buy' ? <ALPSwapBuy connected={connected} triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload} /> : <ALPSwapSell connected={connected} triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload} />}
    </div>
  );
}
