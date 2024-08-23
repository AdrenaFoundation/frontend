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
  const columnStyleTitle =
    'flex w-full font-mono text-xxs text-txtfade justify-center items-center';

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
            'min-w-[300px] w-full flex flex-col border rounded-lg bg-secondary',
            bodyClassName,
            borderColor,
          )}
          key={position.pubkey.toBase58()}
        >
          <div className="flex border-b p-2 pb-2 justify-center items-center relative overflow-hidden">
            <div className="flex absolute top-2 left-4">
              {window.location.pathname !== '/trade' ? (
                <Link
                  href={`/trade?pair=USDC_${position.token.symbol}&action=${position.side}`}
                  target=""
                >
                  <h3 className="uppercase underline font-boldy">
                    {position.token.symbol}
                  </h3>
                </Link>
              ) : (
                <div className="uppercase font-boldy text-sm lg:text-xl">
                  {position.token.symbol}
                </div>
              )}

              <div
                className={twMerge(
                  'uppercase font-boldy text-sm lg:text-xl ml-1',
                  position.side === 'long' ? 'text-green' : 'text-red',
                )}
              >
                {position.side}
              </div>
            </div>

            {liquidable ? (
              <div className="flex absolute right-3 top-2">
                <h2 className="text-red text-xs">Liquidable</h2>
              </div>
            ) : null}

            <Image
              className="absolute right-[-2em] top-auto grayscale opacity-10 w-[5em] h-[5em] md:w-[7em] md:h-[7em] lg:w-[10em] lg:h-[10em]"
              src={position.token.image}
              width={200}
              height={200}
              alt={`${position.token.symbol} logo`}
            />

            <div className="flex flex-col items-center min-w-[5em] w-[5em]">
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

              <div className="flex mt-1">
                {position.pnl ? (
                  <>
                    <FormatNumber
                      nb={position.pnl}
                      format="currency"
                      className={`mr-0.5 text-xs text-${
                        position.pnl && position.pnl > 0 ? 'green' : 'redbright'
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
                        position.pnl && position.pnl > 0 ? 'green' : 'redbright'
                      }`}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-row grow justify-evenly flex-wrap gap-y-2 pb-2 pt-2 pr-2 pl-2">
            <div className="flex flex-col items-center min-w-[5em] w-[5em]">
              <div className={columnStyleTitle}>Leverage</div>
              <div className="flex">
                <FormatNumber
                  nb={position.leverage}
                  format="number"
                  className="text-sm lowercase"
                  suffix="x"
                  isDecimalDimmed={false}
                />
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[5em] w-[5em]">
              <div className={columnStyleTitle}>Size</div>
              <div className="flex">
                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[5em] w-[5em]">
              <div className={columnStyleTitle}>Collateral</div>
              <div className="flex">
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col min-w-[5em] w-[5em] items-center">
              <div className={columnStyleTitle}>Entry Price</div>
              <div className="flex">
                <FormatNumber
                  nb={position.price}
                  format="currency"
                  className="text-xs bold"
                />
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[5em] w-[5em]">
              <div className={columnStyleTitle}>Market Price</div>
              <div className="flex">
                <FormatNumber
                  nb={tokenPrices[position.token.symbol]}
                  format="currency"
                  className="text-xs bold"
                />
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[5em] w-[5em]">
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

          <div className="flex justify-center items-center w-full pl-2 pr-2 pb-2 grow-0">
            <Button
              size="xs"
              className="text-txtfade border-bcolor bg-[#a8a8a810] w-[90%]"
              title="Edit"
              variant="outline"
              onClick={() => {
                triggerEditPositionCollateral(position);
              }}
            />
            <Button
              size="xs"
              className="text-txtfade border-bcolor ml-2 bg-[#a8a8a810] w-[90%]"
              title="Close"
              variant="outline"
              onClick={() => {
                triggerClosePosition(position);
              }}
            />
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
            <Button title="Open a position" href="/trade" size="lg" />
          )}
        </>
      ) : null}

      {positions && positions.length ? (
        <div
          className={twMerge(
            'flex flex-col bg-first w-full h-full gap-2',
            className,
          )}
        >
          {generatePositionBlocs(positions)}
        </div>
      ) : null}
    </>
  );
}
