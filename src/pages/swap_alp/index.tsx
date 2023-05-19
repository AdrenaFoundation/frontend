import { twMerge } from 'tailwind-merge';

import ALPInfo from '@/components/pages/swap_alp/ALPInfo/ALPInfo';
import ALPSwap from '@/components/pages/swap_alp/ALPSwap/ALPSwap';
import { PYTH_ORACLE_RPC } from '@/constant';
import useConnection from '@/hooks/useConnection';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import { PageProps } from '@/types';

export default function SwapALP({ client }: PageProps) {
  const pythConnection = useConnection(PYTH_ORACLE_RPC);

  useWatchTokenPrices(client, pythConnection);
  const { triggerWalletTokenBalancesReload } = useWatchWalletBalance(client);

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
      <div className="text-4xl font-bold mb-4">Buy / Sell ALP</div>
      <div className="mt-2">
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>

      <div className="flex w-full flex-row flex-wrap mt-12">
        <ALPInfo
          className="max-w-[40em] w-[40%] min-w-[25em]"
          client={client}
        />

        <ALPSwap
          className={'max-w-[40em] w-[40%] min-w-[25em]'}
          client={client}
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
        />
      </div>
    </div>
  );
}
