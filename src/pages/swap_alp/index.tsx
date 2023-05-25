import ALPInfo from '@/components/pages/swap_alp/ALPInfo/ALPInfo';
import ALPSwap from '@/components/pages/swap_alp/ALPSwap/ALPSwap';
import { PageProps } from '@/types';

export default function SwapALP({
  client,
  triggerWalletTokenBalancesReload,
}: PageProps) {
  return (
    <>
      <div className="text-4xl font-bold mb-4">Buy / Sell ALP</div>
      <div className="mt-2">
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>

      <div className="flex w-full flex-row flex-wrap mt-12 justify-around">
        <ALPInfo
          className="max-w-[40em] w-[40%] min-w-[25em] pb-2"
          client={client}
        />

        <ALPSwap
          className={'max-w-[40em] w-[40%] min-w-[25em]'}
          client={client}
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
        />
      </div>
    </>
  );
}
