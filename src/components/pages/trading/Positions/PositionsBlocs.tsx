import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

export default function PositionsBlocs({
  className,
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const connected = !!useSelector((s) => s.walletState.wallet);

  const columnStyle = 'flex w-full justify-between';

  return (
    <div className={twMerge('w-full', 'flex', 'flex-wrap', className)}>
      {positions === null && !connected ? (
        <div className="mt-5 mb-5 ml-auto mr-auto">
          Waiting for wallet connection ...
        </div>
      ) : null}

      {positions === null && connected ? (
        <div className="mt-5 mb-5 ml-auto mr-auto">Loading ...</div>
      ) : null}

      {positions && !positions.length ? (
        <div className="mt-5 mb-5 ml-auto mr-auto">No opened position</div>
      ) : null}

      {positions?.map((position) => (
        <div
          key={position.pubkey.toBase58()}
          className="flex flex-col border border-grey bg-secondary w-[26em] ml-auto mr-auto"
        >
          <div className="border-b border-grey p-4">{position.token.name}</div>

          <div className="flex flex-col p-4">
            <div className={columnStyle}>
              <div className="text-txtfade">Leverage</div>
              <div className="flex">
                <div>{formatNumber(position.leverage, 2)}x</div>
                <div
                  className={twMerge(
                    'ml-1',
                    'capitalize',
                    position.side === 'long'
                      ? 'text-green-400'
                      : 'text-red-400',
                  )}
                >
                  {position.side}
                </div>
              </div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Size</div>
              <div>{formatPriceInfo(position.sizeUsd)}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Collateral</div>
              <div>{formatPriceInfo(position.collateralUsd)}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">PnL</div>
              <div>
                {position.pnl ? (
                  <span
                    className={`text-${position.pnl > 0 ? 'green' : 'red'}-400`}
                  >
                    {formatPriceInfo(position.pnl)}
                  </span>
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Entry Price</div>
              <div>{formatPriceInfo(position.price)}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Mark Price</div>
              <div>{formatPriceInfo(tokenPrices[position.token.name])}</div>
            </div>

            <div className={columnStyle}>
              <div className="text-txtfade">Liquidation Price</div>
              <div>{formatPriceInfo(position.liquidationPrice ?? null)}</div>
            </div>
          </div>

          <div className="border-t border-grey p-4 flex justify-around">
            <Button
              className="w-36 bg-highlight"
              title="Close"
              onClick={() => {
                triggerClosePosition(position);
              }}
            />

            <Button
              className="w-36 bg-highlight ml-6"
              title="Edit Collateral"
              onClick={() => {
                triggerEditPositionCollateral(position);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
