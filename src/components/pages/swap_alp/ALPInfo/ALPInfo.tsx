import useALPCirculatingSupply from '@/hooks/useALPTotalSupply';
import { useSelector } from '@/store/store';
import { formatPriceInfo } from '@/utils';

export default function ALPInfo({
  marketCap,
}: {
  className?: string;
  marketCap: number | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const lpTotalSupplyAmount = useALPCirculatingSupply();

  const alpTokenPrice = tokenPrices[window.adrena.client.alpToken.name] ?? null;

  const staked = 100; // TODO: plug in
  return (
    <div className="flex bg-gray-200 p-4 rounded-lg border border-gray-300 md:bg-transparent md:p-0 md:rounded-none md:border-none flex-col md:flex-row flex-wrap gap-0 md:gap-5 w-full mt-5">
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-gray-200 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 mb-3">
          Circulating Supply
        </p>
        <p className="text-base md:text-xl font-mono">
          {lpTotalSupplyAmount} ALP
        </p>
      </div>
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-gray-200 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 mb-3">Price</p>
        <p className="text-base md:text-xl font-mono">
          {formatPriceInfo(alpTokenPrice)}
        </p>
      </div>
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-gray-200 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 mb-3">Market Cap</p>
        <p className="text-base md:text-xl font-mono">
          {formatPriceInfo(marketCap)}
        </p>
      </div>
      <div className="flex flex-row justify-between md:flex-col md:justify-normal md:bg-gray-200 md:border md:border-gray-300 md:rounded-lg md:p-4 flex-1">
        <p className="text-base md:text-sm opacity-50 md:mb-3">Staked</p>
        <p className="text-base md:text-xl font-mono">{staked} ALP</p>
      </div>
    </div>
  );
}
