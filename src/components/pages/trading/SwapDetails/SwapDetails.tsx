import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function SwapDetails({
  tokenA,
  tokenB,
}: {
  tokenA: Token;
  tokenB: Token;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const rowStyle = 'w-full flex justify-between items-center mt-2';

  const priceA = tokenPrices[tokenA.symbol];
  const priceB = tokenPrices[tokenB.symbol];

  return (
    <div className="flex flex-col pl-4 pr-4 pb-4 mt-4 text-sm">
      <div className={rowStyle}>
        <span className="text-txtfade">{tokenA.symbol} Price</span>
        <span>{formatPriceInfo(priceA)}</span>
      </div>

      <div className={rowStyle}>
        <span className="text-txtfade">{tokenB.symbol} Price</span>
        <span>{formatPriceInfo(priceB)}</span>
      </div>

      <div className={rowStyle}>
        <span className="text-txtfade">Available Liquidity</span>
        <span>
          {tokenPrices && priceB
            ? formatPriceInfo(
                window.adrena.client.getCustodyByMint(tokenB.mint).liquidity *
                  priceB,
              )
            : '-'}
        </span>
      </div>
    </div>
  );
}
