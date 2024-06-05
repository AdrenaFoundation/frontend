import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { getArrowElement } from '@/utils';

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

  const columnStyle = 'flex w-full justify-between';

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

              <div className="flex">
                <span
                  className={twMerge(
                    'ml-16 capitalize font-mono',
                    position.side === 'long' ? 'text-green' : 'text-red',
                  )}
                >
                  {position.side}
                </span>

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
              </div>
            </div>

            <div></div>

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

          <ul className="flex flex-col gap-2 p-4">
            <li className={columnStyle}>
              <Tippy
                content={
                  <div className="flex flex-col flex-wrap w-[15em]">
                    <div className="text-white font-boldy text-md">
                      Leverage:
                    </div>
                    <div className="text-white text-sm">
                      Position Size * 10 BPS / (Collateral + Unrealized Profit -
                      Unrealized Loss)
                    </div>

                    <div className="mt-3">
                      <span className="text-txtfade text-sm">
                        Multiplier applied to the collateral to determine the
                        size of the position.
                      </span>
                    </div>
                  </div>
                }
                placement="auto"
              >
                <div className="flex w-full">
                  <div className="text-txtfade text-sm">Leverage</div>
                  <FormatNumber
                    nb={position.leverage}
                    format="number"
                    className="ml-auto"
                    suffix="x"
                    isDecimalDimmed={false}
                  />
                </div>
              </Tippy>
            </li>

            <li className={columnStyle}>
              <div className="text-txtfade text-sm">Size</div>

              <FormatNumber
                nb={position.sizeUsd}
                format="currency"
                className="text-right"
              />
            </li>
            <li className={columnStyle}>
              <Tippy
                content={
                  <div className="flex flex-col flex-wrap w-[15em]">
                    <div className="text-white font-boldy text-md">
                      Initial Collateral:
                    </div>
                    <div className="text-white text-sm">
                      Position Size * 10 BPS / (Collateral + Unrealized Profit -
                      Unrealized Loss)
                    </div>

                    <div className="mt-3">
                      <span className="text-txtfade text-sm">
                        Initial Collateral:
                      </span>
                      <span className="ml-1">
                        <FormatNumber
                          nb={position.collateralUsd}
                          format="currency"
                        />
                      </span>
                    </div>

                    <div>
                      <span className="text-txtfade text-sm">Borrow Fee:</span>
                      <span className="ml-1">
                        <FormatNumber nb={0} format="currency" prefix="-" />
                      </span>
                    </div>

                    <div>
                      <span className="text-txtfade text-sm">
                        Borrow Fee / Hour:
                      </span>
                      <span className="ml-1">
                        <FormatNumber nb={0} format="currency" prefix="-" />
                      </span>
                    </div>
                  </div>
                }
                placement="auto"
              >
                <div className="flex w-full">
                  <div className="text-txtfade text-sm">Collateral</div>
                  <FormatNumber
                    nb={position.collateralUsd}
                    format="currency"
                    className="ml-auto"
                  />
                </div>
              </Tippy>
            </li>
            <li className={columnStyle}>
              <Tippy
                content={
                  <div className="flex flex-col flex-wrap w-[10em]">
                    <div className="text-white font-boldy text-md">
                      Net Value:
                    </div>
                    <div className="text-white text-sm">
                      Collateral + PnL - Fees Initial
                    </div>
                    <div className="mt-3">
                      <span className="text-txtfade text-sm">Collateral:</span>
                      <span className="ml-1">
                        <FormatNumber
                          nb={position.collateralUsd}
                          format="currency"
                        />
                      </span>
                    </div>
                    <div>
                      <span className="text-txtfade text-sm">PnL:</span>
                      <span className="ml-1">
                        <FormatNumber
                          nb={position.pnl}
                          format="currency"
                          className={`text-${
                            position.pnl && position.pnl > 0 ? 'green' : 'red'
                          }`}
                        />
                      </span>
                    </div>
                    <div>
                      <span className="text-txtfade text-sm">borrow Fee:</span>
                      <span className="ml-1">
                        <FormatNumber nb={0} format="currency" />
                      </span>
                    </div>
                    <div>
                      <span className="text-txtfade text-sm">Open Fee:</span>
                      <span className="ml-1">
                        <FormatNumber
                          nb={position.entryFeeUsd}
                          format="currency"
                        />
                      </span>
                    </div>
                    <div>
                      <span className="text-txtfade text-sm">Close Fee:</span>
                      <span className="ml-1">
                        <FormatNumber
                          nb={position.exitFeeUsd}
                          format="currency"
                        />
                      </span>
                    </div>
                    <div>
                      <span className="text-txtfade text-sm">
                        PnL after Fees:
                      </span>
                      <span className="ml-1">
                        <FormatNumber
                          nb={
                            (position.pnl ?? 0) -
                            position.entryFeeUsd -
                            position.exitFeeUsd
                          }
                          format="currency"
                          className={`text-${
                            position.pnl && position.pnl > 0 ? 'green' : 'red'
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                }
                placement="auto"
              >
                <div className="flex w-full">
                  <div className="text-txtfade text-sm">Net value</div>
                  <FormatNumber
                    nb={position.pnl}
                    format="currency"
                    className={`text-${
                      position.pnl && position.pnl > 0 ? 'green' : 'red'
                    } ml-auto`}
                  />
                </div>
              </Tippy>
            </li>

            <li className={columnStyle}>
              <p className="text-txtfade text-sm">Entry Price</p>
              <FormatNumber
                nb={position.price}
                format="currency"
                className="text-right"
              />
            </li>

            <li className={columnStyle}>
              <p className="text-txtfade text-sm">Mark Price</p>

              <FormatNumber
                nb={tokenPrices[position.token.symbol]}
                format="currency"
                className="text-right"
              />
            </li>

            <li className={columnStyle}>
              <Tippy
                content={
                  <div className="flex flex-col flex-wrap w-[15em]">
                    <div className="text-white font-boldy text-md">
                      Liquidation Price:
                    </div>
                    <div className="text-white text-sm">
                      Position Price +- (Collateral + Unrealized Profit -
                      Unrealized Loss - Exit Fee - Interest - Size / Max
                      Leverage) * Position Price / Size
                    </div>
                  </div>
                }
                placement="auto"
              >
                <div className="flex w-full">
                  <div className="text-txtfade text-sm">Liquidation Price</div>
                  <FormatNumber
                    nb={position.liquidationPrice}
                    format="currency"
                    className="ml-auto underline"
                  />
                </div>
              </Tippy>
            </li>
          </ul>
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
