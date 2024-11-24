import { useState } from 'react';

import TabSelect from '@/components/common/TabSelect/TabSelect';

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

      {selectedAction === 'buy' ? (
        <ALPSwapBuy connected={connected} />
      ) : (
        <ALPSwapSell connected={connected} />
      )}
    </div>
  );
}
