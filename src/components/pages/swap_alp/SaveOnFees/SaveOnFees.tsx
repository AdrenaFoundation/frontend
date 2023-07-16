import { BN } from '@project-serum/anchor';
import Image from 'next/image';
import { useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function SaveOnFees({
  allowedCollateralTokens,
  feesAndAmounts,
  onCollateralTokenChange,
  selectedAction,
}: {
  allowedCollateralTokens: Token[] | null;
  feesAndAmounts:
    | (
        | void
        | 0
        | { tokenName: string; fees: number | null; amount: BN | undefined }
        | null
        | undefined
      )[]
    | null; // todo: fix type
  onCollateralTokenChange: (t: Token) => void;
  selectedAction: 'buy' | 'sell';
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const stats = useDailyStats();
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const alpTotalSupply = useALPTotalSupply();
  const alpPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.name]) ??
    null;

  const marketCap =
    alpPrice !== null && alpTotalSupply != null
      ? alpPrice * alpTotalSupply
      : null;

  const headers: string[] = ['Token', 'Price', 'Available', 'Wallet', 'Fees'];

  // todo: fix type
  const rows = useMemo(() => {
    return (
      allowedCollateralTokens &&
      allowedCollateralTokens.map((token: Token) => {
        if (!tokenPrices[token.name]) return;

        const price = tokenPrices[token.name];

        const tokenBalance =
          walletTokenBalances && walletTokenBalances[token.name];

        const balanceInUsd = tokenBalance && price && tokenBalance * price;

        const custody = window.adrena.client.custodies.find(
          (ctoken) => ctoken.pubkey === token.custody,
        );

        // calculates how much of the token is available for purchase/sale in usd

        let token_price_change_24h: number | undefined;

        if (stats) {
          token_price_change_24h =
            selectedAction === 'buy'
              ? stats[token.name].low24h
              : stats[token.name].high24h;
        }

        const liquidity = custody && custody.liquidity;

        // setting the max pool capacity of the token as the market cap * target ratio.
        const maxCapacity =
          custody && marketCap && (marketCap * custody.targetRatio) / 10000;
        const total_lp_tokens =
          maxCapacity && maxCapacity / token_price_change_24h!;

        const min_available =
          total_lp_tokens && liquidity && total_lp_tokens - liquidity;

        // todo: calculate max token deposit available when selling alp
        const max_available = null;

        const available =
          selectedAction === 'buy' ? min_available : max_available;

        const fees =
          feesAndAmounts &&
          feesAndAmounts.find((f) => f && f.tokenName === token.name);

        const fee = fees && fees.fees;

        return {
          token,
          price,
          tokenBalance,
          balanceInUsd,
          available,
          fee,
        };
      })
    );
  }, [
    allowedCollateralTokens,
    tokenPrices,
    walletTokenBalances,
    feesAndAmounts,
    selectedAction,
    marketCap,
    stats,
  ]);

  console.log(alpTotalSupply); // todo: null on refresh? needs to be fixed

  //better error handling
  if (!allowedCollateralTokens || !walletTokenBalances) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2 className="text-2xl mt-3">Save on fees</h2>
      <p className="opacity-75 max-w-[700px] mb-3">
        Fees may vary depending on which asset you use to buy ALP. Enter the
        amount of ALP you want to purchase in the order form, then check here to
        compare fees.
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
              {
                // todo: fix type
                rows &&
                  rows.map((row) => (
                    <tr key={row?.token.name}>
                      <td className="text-sm p-3 flex flex-row gap-3">
                        {row?.token.image && (
                          <Image
                            src={row.token.image}
                            width={40}
                            height={40}
                            alt="coin logo"
                          />
                        )}
                        <div>
                          <h3>{row?.token.name}</h3>
                          <p className="text-xs opacity-50">
                            {row?.token.name}
                          </p>
                        </div>
                      </td>
                      <td className="text-sm p-3">
                        {formatPriceInfo(row?.price)}
                      </td>
                      <td className="text-sm p-3">
                        {row && Math.sign(Number(row.available)) !== -1
                          ? formatPriceInfo(row.available)
                          : 'max capacity reached'}
                      </td>
                      <td className="text-sm p-3">
                        {row?.tokenBalance
                          ? `${formatNumber(row?.tokenBalance, 2)} ${
                              row?.token.name
                            } (${formatPriceInfo(row?.balanceInUsd)})`
                          : '–'}
                      </td>
                      <td>
                        {row?.fee ? `$${formatNumber(row?.fee, 2)}` : '–'}
                      </td>
                      <td>
                        {row && (
                          <Button
                            className="mt-4 bg-[#343232] rounded-md text-sm"
                            title={'buy with ' + row.token.name}
                            activateLoadingIcon={true}
                            onClick={() => onCollateralTokenChange(row.token)}
                          />
                        )}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
