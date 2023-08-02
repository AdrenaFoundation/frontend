import Tippy from '@tippyjs/react';

import Button from '@/components/common/Button/Button';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

type rowsType = Array<{
  token: Token;
  price: number | null;
  tokenBalance: number | null;
  balanceInUsd: number | null;
  available: number | null;
  fee: number | null;
  currentPoolAmount: number | null;
  currentPoolAmountUsd: number | null;
  maxPoolCapacity: number | null;
  equivalentAmount: number | null;
}>;

export default function SaveOnFeesList({
  rows,
  onCollateralTokenChange,
  isFeesLoading,
  setCollateralInput,
}: {
  rows: rowsType;
  onCollateralTokenChange: (t: Token) => void;
  isFeesLoading: boolean;
  setCollateralInput: (value: number | null) => void;
}) {
  const headers: Array<string> = [
    'Token',
    'Price',
    'Available',
    'Wallet',
    'Fees',
  ];

  return (
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
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="w-6 h-6"
                  src={row.token.image}
                  alt={`${row.token.name} logo`}
                />
              }
              <div>
                <h3 className="capitalize">{row.token.coingeckoId}</h3>
                <p className="text-xs opacity-50">{row.token.name}</p>
              </div>
            </td>
            <td className="text-sm p-3 min-w-[100px]">
              {formatPriceInfo(row.price)}
            </td>
            <td className="text-sm p-3 min-w-[100px]">
              <Tippy
                content={
                  <div>
                    {row.currentPoolAmount && (
                      <div>
                        {' '}
                        <span className="text-txtfade">
                          Current Pool Amount:{' '}
                        </span>
                        {`${formatPriceInfo(row.currentPoolAmountUsd)} (${
                          row.token.name
                        } ${formatNumber(row.currentPoolAmount, 2)})
                        `}
                      </div>
                    )}

                    <div>
                      {' '}
                      <span className="text-txtfade">Max Pool Capacity: </span>
                      {formatPriceInfo(row.maxPoolCapacity)}
                    </div>
                  </div>
                }
                placement="bottom"
              >
                <div className="flex">
                  <div className="flex tooltip-target cursor-help">
                    {formatPriceInfo(row.available)}
                  </div>
                </div>
              </Tippy>
            </td>
            <td className="text-sm p-3 min-w-[250px]">
              {row.tokenBalance
                ? `${formatNumber(row?.tokenBalance, 2)} ${
                    row?.token.name
                  } (${formatPriceInfo(row?.balanceInUsd)})`
                : '–'}
            </td>
            <td className="text-sm p-3 min-w-[130px]">
              {!isFeesLoading
                ? row.fee
                  ? `$${formatNumber(row.fee, 2)}`
                  : '-'
                : '...'}
            </td>

            <td>
              <Button
                className="mt-4 bg-[#343232] rounded-md text-sm"
                title={`buy with ${row.token.name}`}
                activateLoadingIcon={true}
                onClick={() => {
                  onCollateralTokenChange(row.token);
                  setCollateralInput(row.equivalentAmount);
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
