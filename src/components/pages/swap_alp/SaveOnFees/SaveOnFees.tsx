import Image from 'next/image';
import { useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token, TokenName } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

type rowsType = Array<{
  token: Token;
  price: number | null;
  tokenBalance: number | null;
  balanceInUsd: number | null;
  available: number | null | undefined;
  fee: number | null;
}>;

export default function SaveOnFees({
  allowedCollateralTokens,
  feesAndAmounts,
  onCollateralTokenChange,
  selectedAction,
}: {
  allowedCollateralTokens: Token[];
  feesAndAmounts: Array<{
    [tokenName: TokenName]: { fees: number | null; amount: number | null };
  }> | null;
  onCollateralTokenChange: (t: Token) => void;
  selectedAction: 'buy' | 'sell';
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const stats = useDailyStats();
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const alpTotalSupply = useALPTotalSupply();
  const alpPrice = useSelector(
    (s) => s.tokenPrices?.[window.adrena.client.alpToken.name],
  );

  const marketCap =
    alpPrice !== null && alpTotalSupply != null
      ? alpPrice * alpTotalSupply
      : null;

  const headers: Array<string> = [
    'Token',
    'Price',
    'Available',
    'Wallet',
    'Fees',
  ];

  const rows: rowsType = useMemo(() => {
    return allowedCollateralTokens.map((token: Token) => {
      const price = tokenPrices[token.name] ? tokenPrices[token.name] : null;

      const tokenBalance = walletTokenBalances
        ? walletTokenBalances[token.name]
        : null;

      const balanceInUsd = tokenBalance && price ? tokenBalance * price : null;

      // calculates how much of the token is available for purchase/sale in usd
      const available = (() => {
        const custody = window.adrena.client.getCustodyByMint(token.mint);

        if (!stats || !marketCap || !custody) return null;

        if (selectedAction === 'buy') {
          const lowPrice24h = stats[token.name].low24h;

          const maxCapacity = (marketCap * custody.targetRatio) / 10_000;

          const totalLpTokens =
            lowPrice24h === 0 ? maxCapacity : maxCapacity / lowPrice24h;

          const minAvailableUsd =
            totalLpTokens - custody.liquidity * lowPrice24h;

          return minAvailableUsd;
        }

        // const highPrice24h = stats[token.name].high24h;

        // calculate max token deposit available when selling alp
        const maxAvailableUsd = null;

        return maxAvailableUsd;
      })();

      const fee = (() => {
        if (!feesAndAmounts) return null;
        const fees = feesAndAmounts.find((f) => f[token.name]);
        return fees ? fees[token.name].fees : null;
      })();

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
          : 'Fees may vary depending on which asset you sell GLP for. Enter the amount of GLP you want to redeem in the order form, then check here to compare fees.'}
      </p>
      <div className="border border-grey bg-secondary p-4">
        <div>
          <table className="w-full">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th className="text-lg text-left p-3 opacity-50" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.token.name}>
                  <td className="text-sm p-3 flex flex-row gap-3">
                    {row.token.image && (
                      <Image
                        src={row.token.image}
                        width={40}
                        height={40}
                        alt="coin logo"
                      />
                    )}
                    <div>
                      <h3>{row.token.name}</h3>
                      <p className="text-xs opacity-50">{row.token.name}</p>
                    </div>
                  </td>
                  <td className="text-sm p-3">{formatPriceInfo(row.price)}</td>
                  <td className="text-sm p-3">
                    {row && Math.sign(Number(row.available)) !== -1
                      ? formatPriceInfo(row.available)
                      : 'max capacity reached'}
                  </td>
                  <td className="text-sm p-3">
                    {row.tokenBalance
                      ? `${formatNumber(row?.tokenBalance, 2)} ${
                          row?.token.name
                        } (${formatPriceInfo(row?.balanceInUsd)})`
                      : '–'}
                  </td>
                  <td>{row.fee ? `$${formatNumber(row.fee, 2)}` : '–'}</td>
                  {row && (
                    <td>
                      <Button
                        className="mt-4 bg-[#343232] rounded-md text-sm"
                        title={'buy with ' + row.token.name}
                        activateLoadingIcon={true}
                        onClick={() => onCollateralTokenChange(row.token)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
