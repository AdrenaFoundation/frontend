import { BN } from '@project-serum/anchor';
import Image from 'next/image';
import { useMemo } from 'react';

import Button from '@/components/common/Button/Button';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function SaveOnFees({
  allowedCollateralTokens,
  feesAndAmounts,
  onCollateralTokenChange,
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
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

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

        // how much lp token can you buy with the collateral token
        // get the max pool
        const available = custody && price && custody.liquidity * price;

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
  ]);

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
                        {formatPriceInfo(row?.available)}
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
