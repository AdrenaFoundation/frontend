import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<
    'mint' | 'redeem' | null
  >('mint');

  const tabs = [
    { id: 'mint', title: t('alp.mint'), activeColor: 'border-white' },
    { id: 'redeem', title: t('alp.redeem'), activeColor: 'border-white' },
  ];

  return (
    <div
      className={twMerge(
        'relative',
        className,
        !connected && 'overflow-hidden',
      )}
    >
      <TabSelect
        selected={tabs.find(tab => tab.id === selectedAction)?.title || ''}
        tabs={tabs}
        onClick={(title) => {
          const selectedTab = tabs.find(tab => tab.title === title);
          if (selectedTab) {
            setSelectedAction(selectedTab.id as 'mint' | 'redeem');
          }
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
    </div>
  );
}
