import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getArrowElement } from '@/utils';

import NetValueTooltip from '../TradingInputs/NetValueTooltip';

export default function PositionsBlocks({
  bodyClassName,
  connected,
  className,
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
  wrapped = true,
}: {
  bodyClassName?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
  wrapped?: boolean;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const arrowElementUpRight = getArrowElement('up', 'right-[0.5em] opacity-70');
  const arrowElementUpLeft = getArrowElement('up', 'left-[0.5em] opacity-70');

  const columnStyleTitle = 'flex w-full font-mono text-xs text-txtfade';

  function generateLiquidationBlock() {
    return (
      <div className="flex-col bg-red justify-center items-center text-center align-middle text-xs opacity-70">
        <div className="flex justify-center items-center text-center align-middle relative">
          {arrowElementUpLeft}
          Liquidation price reached
          {arrowElementUpRight}
        </div>
      </div>
    );
  }

  if (positions === null && !connected) {
    return <WalletConnection connected={connected} />;
  }

  function generatePositionBlocs(positions: PositionExtended[] | null) {
    return positions?.map((position) => (
      <div className="flex flex-col w-full" key={position.pubkey.toBase58()}>
        <div
          className={twMerge(
            'flex flex-col border rounded-lg w-full',
            position === positions[0] ? '' : 'mt-3',
            position === positions[positions.length - 1] ? 'mb-3' : '',
            bodyClassName,
          )}
        >
          <div className="flex flex-row justify-between items-center border-b">
            <div className="flex flex-row h-10 items-center relative overflow-hidden rounded-tl-lg">
              <Image
                className="absolute left-[-0.7em] top-auto grayscale opacity-40"
                src={position.token.image}
                width={70}
                height={70}
                alt={`${position.token.symbol} logo`}
              />

              <div className="flex ml-16">
                {window.location.pathname !== '/trade' ? (
                  <Link
                    href={`/trade?pair=USDC_${position.token.symbol}&action=${position.side}`}
                    target=""
                  >
                    <h3 className="text-sm capitalize font-mono ml-2 underline">
                      {position.token.symbol}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="text-sm capitalize font-mono ml-2">
                    {position.token.symbol}
                  </h3>
                )}
                <span
                  className={twMerge(
                    'text-sm uppercase font-mono ml-1',
                    position.side === 'long' ? 'text-green' : 'text-red',
                  )}
                >
                  {position.side}
                </span>
                <FormatNumber
                  nb={position.leverage}
                  format="number"
                  className="ml-1 text-xs mt-0.5 text-txtfade"
                  suffix="x"
                  isDecimalDimmed={false}
                />
              </div>
            </div>

            <div className="flex ml-auto mr-3">
              <Button
                className="text-xs"
                title="close"
                variant="secondary"
                onClick={() => {
                  triggerClosePosition(position);
                }}
              />

              <Button
                className="text-xs ml-2"
                title="edit"
                variant="secondary"
                onClick={() => {
                  triggerEditPositionCollateral(position);
                }}
              />
            </div>
          </div>

          {position.side === 'long' &&
          (tokenPrices[position.token.symbol] ?? 0) <
            (position.liquidationPrice ?? 0)
            ? generateLiquidationBlock()
            : null}
          {position.side === 'short' &&
          (tokenPrices[position.token.symbol] ?? 0) >
            (position.liquidationPrice ?? 0)
            ? generateLiquidationBlock()
            : null}

          <div className="grid grid-cols-3 gap-4 p-2">
            <div className="flex flex-col">
              <div className={columnStyleTitle}>Net value</div>
              <div className="flex">
                {position.pnl ? (
                  <>
                    <NetValueTooltip position={position}>
                      <FormatNumber
                        nb={position.collateralUsd + position.pnl}
                        format="currency"
                        className={`underline-dashed text-md`}
                      />
                    </NetValueTooltip>
                  </>
                ) : (
                  '-'
                )}
              </div>
              <div className="flex">
                {position.pnl ? (
                  <>
                    <FormatNumber
                      nb={position.pnl}
                      format="currency"
                      className={`mr-0.5 text-sm text-${
                        position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                      }`}
                    />
                    <FormatNumber
                      nb={(position.pnl / position.collateralUsd) * 100}
                      format="percentage"
                      prefix="("
                      suffix=")"
                      precision={2}
                      isDecimalDimmed={false}
                      className={`text-sm text-${
                        position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                      }`}
                    />
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col">
              <div className={columnStyleTitle}>Size</div>
              <div className="flex">
                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-xs"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className={columnStyleTitle}>Collateral</div>
              <div className="flex">
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className={columnStyleTitle}>Entry Price</div>
              <div className="flex">
                <FormatNumber
                  nb={position.price}
                  format="currency"
                  className="text-xs bold"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className={columnStyleTitle}>Market Price</div>
              <div className="flex">
                <FormatNumber
                  nb={tokenPrices[position.token.symbol]}
                  format="currency"
                  className="text-xs bold"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className={columnStyleTitle}>Liq. Price</div>
              <div className="flex">
                <FormatNumber
                  nb={position.liquidationPrice}
                  format="currency"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  return (
    <>
      {positions === null && connected ? (
        <div className="text-sm opacity-50 font-normal mt-5 mb-5 ml-auto mr-auto font-boldy">
          Loading ...
        </div>
      ) : null}

      {positions && !positions.length ? (
        <div className="flex flex-col gap-3 items-center justify-center mb-5">
          <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
            No opened position
          </div>
          {window.location.pathname === '/trade' ? null : (
            <Button title="Open a position" href={'/trade'} size="lg" />
          )}
        </div>
      ) : null}

      {positions && positions.length ? (
        wrapped ? (
          <div
            className={twMerge(
              'w-full',
              'flex',
              'flex-wrap',
              'ml-3 mr-3',
              className,
            )}
          >
            {generatePositionBlocs(positions)}
          </div>
        ) : (
          generatePositionBlocs(positions)
        )
      ) : null}
    </>
  );
}
