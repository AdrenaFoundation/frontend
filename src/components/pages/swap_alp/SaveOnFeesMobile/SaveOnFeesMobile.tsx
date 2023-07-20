import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token, TokenName } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

type rowsType = Array<{
  token: Token;
  price: number | null;
  tokenBalance: number | null;
  balanceInUsd: number | null;
  available: number | null;
  fee: number | null;
}>;

export default function SaveOnFeesMobile({
  allowedCollateralTokens,
  feesAndAmounts,
  onCollateralTokenChange,
  selectedAction,
  marketCap,
  isFeesLoading,
}: {
  allowedCollateralTokens: Token[];
  feesAndAmounts: {
    [tokenName: TokenName]: { fees: number | null; amount: number | null };
  } | null;
  onCollateralTokenChange: (t: Token) => void;
  selectedAction: 'buy' | 'sell';
  marketCap: number | null;
  isFeesLoading: boolean;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const stats = useDailyStats();
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const rows: rowsType = useMemo(() => {
    return allowedCollateralTokens.map((token: Token) => {
      const price = tokenPrices[token.name] ? tokenPrices[token.name] : null;

      const tokenBalance = walletTokenBalances
        ? walletTokenBalances[token.name]
        : null;

      const balanceInUsd =
        tokenBalance !== null && price ? tokenBalance * price : null;

      // calculates how much of the token is available for purchase/sale in usd
      const available = (() => {
        const custody = window.adrena.client.getCustodyByMint(token.mint);

        if (!stats || !marketCap || !custody || !price) return null;

        const custodyLiquidityUsd = custody.liquidity * price;

        const ratio =
          selectedAction === 'buy' ? custody.maxRatio : custody.minRatio;

        const availableTokens =
          (marketCap * ratio - custodyLiquidityUsd) / (price * (1 - ratio));

        const availableUsd = availableTokens * price;

        return Math.abs(availableUsd);
      })();

      const fee = feesAndAmounts && feesAndAmounts[token.name].fees;

      return {
        token,
        price,
        tokenBalance,
        balanceInUsd,
        available,
        fee,
      };
    });
  }, [
    allowedCollateralTokens,
    tokenPrices,
    walletTokenBalances,
    feesAndAmounts,
    selectedAction,
    marketCap,
    stats,
  ]);

  return (
    <>
      <h2 className="text-2xl mt-3">Save on fees</h2>
      <p className="opacity-75 max-w-[700px] mb-3">
        {selectedAction === 'buy'
          ? 'Fees may vary depending on which asset you use to buy ALP. Enter the amount of ALP you want to purchase in the order form, then check here to compare fees.'
          : 'Fees may vary depending on which asset you sell ALP for. Enter the amount of ALP you want to redeem in the order form, then check here to compare fees.'}
      </p>
      <div className={'flex flex-col sm:flex-row flex-wrap justify-evenly'}>
        {rows.map((row) => (
          <div
            key={row.token.name}
            className={
              'flex flex-col sm:w-[45%] w-full bg-secondary border border-grey justify-evenly mt-4 p-4'
            }
          >
            <div className="flex items-center border-b border-grey pb-2">
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="w-6 h-6"
                  src={row.token.image}
                  alt={`${row.token.name} logo`}
                />
              }
              <span className="ml-4">{row.token.name}</span>
            </div>

            <div className="flex flex-col w-full mt-4">
              <div className="flex w-full justify-between">
                <div>Price</div>
                <div className="flex">{formatPriceInfo(row.price)}</div>
              </div>

              <div className="flex w-full justify-between">
                <div>Available</div>
                <div className="flex">{formatPriceInfo(row.available)}</div>
              </div>

              <div className="flex w-full justify-between">
                <div>Wallet</div>
                <div className="flex">
                  {' '}
                  {row.tokenBalance
                    ? `${formatNumber(row?.tokenBalance, 2)} ${
                        row?.token.name
                      } (${formatPriceInfo(row?.balanceInUsd)})`
                    : '–'}
                </div>
              </div>

              <div className="flex w-full justify-between">
                <div>Fees</div>
                <div className="flex">
                  {!isFeesLoading
                    ? row.fee
                      ? `$${formatNumber(row.fee, 2)}`
                      : '-'
                    : '...'}
                </div>
              </div>

              <div className="flex w-full justify-between">
                <Button
                  className="mt-4 bg-[#343232] rounded-md text-sm"
                  title={`buy with ${row.token.name}`}
                  activateLoadingIcon={true}
                  onClick={() => onCollateralTokenChange(row.token)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
