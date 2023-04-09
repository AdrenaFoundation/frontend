import { AdrenaClient } from '@/AdrenaClient';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function SwapDetails({
  tokenA,
  tokenB,
  client,
}: {
  tokenA: Token;
  tokenB: Token;
  client: AdrenaClient | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const rowStyle = 'w-full flex justify-between items-center mt-2';

  const priceA = tokenPrices[tokenA.name];
  const priceB = tokenPrices[tokenB.name];

  return (
    <div className="flex flex-col pl-4 pr-4 pb-4 mt-4 text-sm">
      <div className={rowStyle}>
        <span className="text-txtfade">{tokenA.name} Price</span>
        <span>{formatPriceInfo(priceA)}</span>
      </div>

      <div className={rowStyle}>
        <span className="text-txtfade">{tokenB.name} Price</span>
        <span>{formatPriceInfo(priceB)}</span>
      </div>

      <div className={rowStyle}>
        <span className="text-txtfade">Available Liquidity</span>
        <span>
          {client && tokenPrices && priceB
            ? formatPriceInfo(
                client.getCustodyByMint(tokenB.mint).liquidity * priceB,
              )
            : '-'}
        </span>
      </div>
    </div>
  );
}
