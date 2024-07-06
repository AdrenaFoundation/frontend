import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

import NetValueTooltip from '../TradingInputs/NetValueTooltip';

export default function PositionsBlocks({
  bodyClassName,
  borderColor,
  connected,
  className,
  positions,
  triggerClosePosition,
  triggerEditPositionCollateral,
  wrapped = true,
}: {
  bodyClassName?: string;
  borderColor?: string;
  connected: boolean;
  className?: string;
  positions: PositionExtended[] | null;
  triggerClosePosition: (p: PositionExtended) => void;
  triggerEditPositionCollateral: (p: PositionExtended) => void;
  wrapped?: boolean;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const columnStyleTitle = 'flex w-full font-mono text-xs text-txtfade';

  if (positions === null && !connected) {
    return (
      <div className="flex overflow-hidden bg-main/90 w-full sm:w-1/2 sm:mr-4 lg:mr-0 md:w-[65%] border rounded-lg mt-4 h-[15em] items-center justify-center">
        <WalletConnection connected={connected} />
      </div>
    );
  }

  function generatePositionBlocs(positions: PositionExtended[] | null) {
    return positions?.map((position) => {
      const liquidable = (() => {
        const tokenPrice = tokenPrices[position.token.symbol];

        if (
          tokenPrice === null ||
          typeof position.liquidationPrice === 'undefined' ||
          position.liquidationPrice === null
        )
          return;

        if (position.side === 'long')
          return tokenPrice < position.liquidationPrice;

        // Short
        return tokenPrice > position.liquidationPrice;
      })();

      return (
        <div
          className={twMerge(
            'flex min-w-[300px] w-full',
            window.location.pathname === '/my_dashboard'
              ? 'mt-0'
              : 'mt-4 lg:mt-0',
            positions.length > 1 ? 'lg:max-w-[49%]' : 'lg:max-w-full',
          )}
          key={position.pubkey.toBase58()}
        >
          <div
            className={twMerge(
              'flex flex-col border rounded-lg w-full bg-secondary',
              bodyClassName,
              borderColor,
            )}
          >
            <div
              className={twMerge(
                'flex flex-row justify-between items-center border-b',
                borderColor ? borderColor : 'border-bcolor',
              )}
            >
              <div className="flex flex-row h-10 items-center relative overflow-hidden rounded-tl-lg w-full">
                <Image
                  className="absolute left-[-0.7em] top-auto grayscale opacity-40"
                  src={position.token.image}
                  width={70}
                  height={70}
                  alt={`${position.token.symbol} logo`}
                />

                <div className="flex ml-16 w-full">
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
                    className="ml-1 text-xs mt-[0.15em] text-txtfade"
                    suffix="x"
                    isDecimalDimmed={false}
                  />

                  {liquidable ? (
                    <div className="text-sm text-redbright text-center ml-auto mr-2">
                      Liquidable
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col grow justify-evenly">
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="flex flex-col">
                  <div className={columnStyleTitle}>Net value</div>
                  <div className="flex">
                    {position.pnl ? (
                      <>
                        <NetValueTooltip position={position}>
                          <span className="underline-dashed">
                            <FormatNumber
                              nb={position.collateralUsd + position.pnl}
                              format="currency"
                              className="text-md"
                            />
                          </span>
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
                          className={`mr-0.5 text-xs text-${
                            position.pnl && position.pnl > 0
                              ? 'green'
                              : 'redbright'
                          }`}
                          isDecimalDimmed={false}
                        />
                        <FormatNumber
                          nb={(position.pnl / position.collateralUsd) * 100}
                          format="percentage"
                          prefix="("
                          suffix=")"
                          precision={2}
                          isDecimalDimmed={false}
                          className={`text-xs text-${
                            position.pnl && position.pnl > 0
                              ? 'green'
                              : 'redbright'
                          }`}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={twMerge(columnStyleTitle, 'justify-center')}>
                    Size
                  </div>
                  <div className="flex">
                    <FormatNumber
                      nb={position.sizeUsd}
                      format="currency"
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={twMerge(columnStyleTitle, 'justify-end')}>
                    Collateral
                  </div>
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
                <div className="flex flex-col items-center">
                  <div className={twMerge(columnStyleTitle, 'justify-center')}>
                    Market Price
                  </div>
                  <div className="flex">
                    <FormatNumber
                      nb={tokenPrices[position.token.symbol]}
                      format="currency"
                      className="text-xs bold"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={twMerge(columnStyleTitle, 'justify-end')}>
                    Liq. Price
                  </div>
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

            <div className="flex justify-center items-center w-full p-2 grow-0">
              <Button
                className="text-txtfade px-2 border-bcolor bg-[#a8a8a810] w-[90%]"
                title="Edit"
                variant="outline"
                onClick={() => {
                  triggerEditPositionCollateral(position);
                }}
              />
              <Button
                className="text-txtfade border-bcolor ml-2 bg-[#a8a8a810] w-[90%]"
                title="Close"
                variant="outline"
                onClick={() => {
                  triggerClosePosition(position);
                }}
              />
            </div>
          </div>
        </div>
      );
    });
  }

  return (
    <>
      {positions === null && connected ? (
        <>
          {window.location.pathname === '/trade' ? (
            <div className="flex overflow-hidden bg-main/90 w-full sm:w-1/2 sm:mr-4 lg:mr-0 md:w-[65%] border rounded-lg mt-4 h-[15em] items-center justify-center">
              <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                Loading ...
              </div>
            </div>
          ) : (
            <div className="text-sm opacity-50 font-normal mt-5 mb-5 ml-auto mr-auto font-boldy">
              Loading ...
            </div>
          )}
        </>
      ) : null}

      {positions && !positions.length ? (
        <>
          {window.location.pathname === '/trade' ? (
            <div className="flex overflow-hidden bg-main/90 w-full sm:w-1/2 sm:mr-4 lg:mr-0 md:w-[65%] border rounded-lg mt-4 h-[15em] items-center justify-center">
              <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                No opened position
              </div>
            </div>
          ) : (
            <Button title="Open a position" href={'/trade'} size="lg" />
          )}
        </>
      ) : null}

      {positions && positions.length ? (
        wrapped ? (
          <div
            className={twMerge(
              'flex flex-col bg-first w-full h-full',
              'lg:gap-3 lg:flex-row lg:flex-wrap',
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
