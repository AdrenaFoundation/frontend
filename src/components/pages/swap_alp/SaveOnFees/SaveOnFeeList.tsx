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
}>;

export default function SaveOnFeesList({
  rows,
  onCollateralTokenChange,
  isFeesLoading,
}: {
  rows: rowsType;
  onCollateralTokenChange: (t: Token) => void;
  isFeesLoading: boolean;
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
              {formatPriceInfo(row.available)}
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
                onClick={() => onCollateralTokenChange(row.token)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
