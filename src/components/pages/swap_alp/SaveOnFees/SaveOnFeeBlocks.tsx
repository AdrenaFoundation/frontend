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
}>;

export default function SaveOnFeesBlocks({
  rows,
  onCollateralTokenChange,
  isFeesLoading,
}: {
  rows: rowsType;
  onCollateralTokenChange: (t: Token) => void;
  isFeesLoading: boolean;
}) {
  return (
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
              <Tippy
                content={
                  <div>
                    {row.currentPoolAmount && (
                      <div className="whitespace-pre">
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
  );
}
