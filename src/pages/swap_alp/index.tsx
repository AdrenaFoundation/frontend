import ALPInfo from '@/components/pages/swap_alp/ALPInfo/ALPInfo';
import ALPSwap from '@/components/pages/swap_alp/ALPSwap/ALPSwap';
import { PageProps } from '@/types';

export default function SwapALP({
  triggerWalletTokenBalancesReload,
}: PageProps) {
  return (
    <>
      <h1>Buy / Sell ALP</h1>

      <div className="mt-2">
        Purchase ALP tokens to earn fees from swaps and leverages trading.
      </div>

      <div className="flex w-full flex-row flex-wrap mt-12 justify-around">
        <ALPInfo className="grow min-w-[25em] pb-2 m-2" />

        <ALPSwap
          className={'grow min-w-[25em] m-2'}
          triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
        />
      </div>
    </>
  );
}
