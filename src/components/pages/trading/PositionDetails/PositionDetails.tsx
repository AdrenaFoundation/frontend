import { AdrenaClient } from '@/AdrenaClient';
import { RATE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

export default function PositionDetails({
  tokenB,
  entryPrice,
  exitPrice,
  className,
  client,
}: {
  tokenB: Token;
  entryPrice: number | null;
  exitPrice: number | null;
  className?: string;
  client: AdrenaClient | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  return (
    <div className={`flex flex-col p-1 text-sm ${className}`}>
      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Entry Price</span>
        <span>{formatPriceInfo(entryPrice)}</span>
      </div>

      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Exit Price</span>
        <span>{formatPriceInfo(exitPrice)}</span>
      </div>

      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Borrow Fee</span>
        <span>
          {client && tokenB
            ? `${formatNumber(
                nativeToUi(
                  client.getCustodyByMint(tokenB.mint).nativeObject
                    .borrowRateState.currentRate,
                  RATE_DECIMALS,
                ),
                RATE_DECIMALS,
              )}% / hr`
            : '-'}
        </span>
      </div>

      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Available Liquidity</span>
        <span>
          {client && tokenB && tokenPrices && tokenPrices[tokenB.name]
            ? formatPriceInfo(
                client.getCustodyByMint(tokenB.mint).liquidity *
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  tokenPrices[tokenB.name]!,
              )
            : '-'}
        </span>
      </div>
    </div>
  );
}
