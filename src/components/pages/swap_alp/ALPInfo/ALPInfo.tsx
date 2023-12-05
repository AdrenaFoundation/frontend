import useALPCirculatingSupply from '@/hooks/useALPTotalSupply';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

export default function ALPInfo({
  marketCap,
}: {
  className?: string;
  marketCap: number | null;
}) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const lpTotalSupplyAmount = useALPCirculatingSupply();

  const alpTokenPrice =
    tokenPrices[window.adrena.client.alpToken.symbol] ?? null;

  const { stakingAccounts } = useWalletStakingAccounts();

  const lockedStake =
    stakingAccounts?.ALP?.lockedStakes.reduce((acc, stake) => {
      const val = nativeToUi(
        stake.amount,
        window.adrena.client.alpToken.decimals,
      );

      return acc + val;
    }, 0) ?? 0;
  const liquidStake = stakingAccounts?.ALP?.liquidStake.amount
    ? nativeToUi(
        stakingAccounts.ALP.liquidStake.amount,
        window.adrena.client.alpToken.decimals,
      )
    : 0;

  const totalStaked = wallet ? liquidStake + lockedStake : null;
  return (
    <div className="flex bg-gray-200 p-4 rounded-lg border border-gray-300 md:bg-transparent md:p-0 md:rounded-none md:border-none flex-col md:flex-row flex-wrap gap-0 md:gap-5 w-full mt-5 z-20">
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-black/75 md:backdrop-blur-md md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 mb-3">
          Circulating Supply
        </p>
        <p className="text-base md:text-xl font-mono">
          {lpTotalSupplyAmount !== null
            ? formatNumber(lpTotalSupplyAmount, 0)
            : '-'}{' '}
          ALP
        </p>
      </div>
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-black/75 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 mb-3">Price</p>
        <p className="text-base md:text-xl font-mono">
          {formatPriceInfo(alpTokenPrice)}
        </p>
      </div>
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-black/75 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 mb-3">Market Cap</p>
        <p className="text-base md:text-xl font-mono">
          {formatPriceInfo(marketCap, undefined, 0)}
        </p>
      </div>
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-black/75 md:border md:border-gray-300 md:backdrop-blur-md md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 md:mb-3">Staked</p>
        <p className="text-base md:text-xl font-mono">
          {totalStaked !== null ? `${formatNumber(totalStaked, 0)} ALP` : '-'}
        </p>
      </div>
    </div>
  );
}
