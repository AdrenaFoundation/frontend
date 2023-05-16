import { twMerge } from 'tailwind-merge';

import BuySellAlp from '@/components/pages/buyalp/BuySellAlp/BuySellAlp';
import { MAIN_RPC, PYTH_ORACLE_RPC } from '@/constant';
import useAdrenaClient from '@/hooks/useAdrenaClient';
import useConnection from '@/hooks/useConnection';
import useMainPool from '@/hooks/useMainPool';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';

export default function BuyALP() {
  const mainConnection = useConnection(MAIN_RPC);
  const pythConnection = useConnection(PYTH_ORACLE_RPC);
  const client = useAdrenaClient(mainConnection);
  const mainPool = useMainPool(client);

  useWatchTokenPrices(client, pythConnection);
  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance(
    client,
    mainConnection,
  );

  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'p-4',
        'overflow-auto',
        'flex-col',
        'bg-main',
      )}
    >
      <div className="text-4xl font-bold mb-8 mt-4">Buy / Sell ALP</div>
      <div className="mt-6 mb-6">
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>

      <BuySellAlp
        className={'max-w-[40em] w-[40%] min-w-[25em] m-auto'}
        client={client}
        triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
      />
    </div>
  );
}
