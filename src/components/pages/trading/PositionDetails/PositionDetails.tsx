import { RATE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function PositionDetails({
  tokenB,
  entryPrice,
  exitPrice,
  className,
}: {
  tokenB: Token;
  entryPrice: number | null;
  exitPrice: number | null;
  className?: string;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

  return (
    <div className={`flex flex-col p-1 text-sm ${className}`}>
      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Entry Price</span>
        <span className="font-mono">{formatPriceInfo(entryPrice)}</span>
      </div>

      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Exit Price</span>
        <span className="font-mono">{formatPriceInfo(exitPrice)}</span>
      </div>

      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Borrow Fee</span>
        <span className="font-mono">
          {custody && tokenB
            ? `${formatNumber(custody.borrowFee, RATE_DECIMALS)}% / hr`
            : '-'}
        </span>
      </div>

      <div className="w-full flex justify-between items-center mt-1">
        <span className="text-txtfade">Available Liquidity</span>
        <span className="font-mono">
          {custody && tokenB && tokenPrices && tokenPrices[tokenB.name]
            ? formatPriceInfo(
                custody.liquidity *
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  tokenPrices[tokenB.name]!,
              )
            : '-'}
        </span>
      </div>
    </div>
  );
}
