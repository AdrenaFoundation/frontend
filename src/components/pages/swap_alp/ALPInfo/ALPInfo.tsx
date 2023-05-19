import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';
import useALPCirculatingSupply from '@/hooks/useALPTotalSupply';
import { useSelector } from '@/store/store';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function ALPInfo({
  className,
  client,
}: {
  className?: string;
  client: AdrenaClient | null;
}) {
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const lpTotalSupplyAmount = useALPCirculatingSupply(client);

  const rowClasses = 'flex w-full justify-between pl-8 pr-8 mt-2';

  const alpTokenPrice = tokenPrices[AdrenaClient.alpToken.name] ?? null;

  const userLpTokenAmount =
    walletTokenBalances?.[AdrenaClient.alpToken.name] ?? null;

  const userLpTokenAmountUsd =
    userLpTokenAmount != null && alpTokenPrice != null
      ? userLpTokenAmount * alpTokenPrice
      : null;

  const lpTotalSupplyAmountUsd =
    lpTotalSupplyAmount != null && alpTokenPrice != null
      ? lpTotalSupplyAmount * alpTokenPrice
      : null;

  return (
    <div
      className={twMerge(
        className,
        'border',
        'border-grey',
        'bg-secondary',
        'flex',
        'flex-col',
      )}
    >
      <div className="text-lg bold p-4 border-b border-grey mb-6">ALP</div>
      <div className={rowClasses}>
        <div>Price</div>
        <div>{formatPriceInfo(alpTokenPrice)}</div>
      </div>

      <div className={rowClasses}>
        <div>Wallet</div>
        <div>
          {userLpTokenAmount === null ? (
            '-'
          ) : (
            <>
              {formatNumber(userLpTokenAmount, AdrenaClient.alpToken.decimals)}{' '}
              ALP{' '}
              {userLpTokenAmountUsd
                ? `(${formatPriceInfo(userLpTokenAmountUsd)})`
                : ''}
            </>
          )}
        </div>
      </div>

      <div className={rowClasses}>
        <div>Stacked</div>
        <div>TODO</div>
      </div>

      <div className="full-w border-b border-grey mt-4 mb-4"></div>

      <div className={rowClasses}>
        <div>Total Supply</div>
        <div>
          {lpTotalSupplyAmount ? (
            <>
              {formatNumber(
                lpTotalSupplyAmount,
                AdrenaClient.alpToken.decimals,
              )}{' '}
              ALP{' '}
              {lpTotalSupplyAmountUsd
                ? `(${formatPriceInfo(lpTotalSupplyAmountUsd)})`
                : ''}
            </>
          ) : (
            '-'
          )}
        </div>
      </div>
    </div>
  );
}
