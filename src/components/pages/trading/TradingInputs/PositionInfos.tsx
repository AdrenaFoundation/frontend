import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import { RATE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

import arrowDown from '../../../../../public/images/arrow-down.png';
import arrowRightIcon from '../../../../../public/images/arrow-right.svg';
import arrowUp from '../../../../../public/images/arrow-up.png';
import InfoAnnotation from '../../monitoring/InfoAnnotation';

export default function PositionInfos({
  className,
  positionInfos,
  tokenB,
  leverage,
  openedPosition,
  allowedTokenB,
  inputB,
  priceB,
  setTokenB,
  handleInputBChange,
  isInfoLoading,
}: {
  className?: string;
  positionInfos: {
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    openPositionFeeUsd: number;
    totalOpenPositionFeeUsd: number;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
  } | null;
  tokenB: Token;
  leverage: number;
  openedPosition: PositionExtended | null;
  allowedTokenB: Token[];
  inputB: number | null;
  priceB: null | number;
  setTokenB: (t: Token | null) => void;
  handleInputBChange: (n: number) => void;
  isInfoLoading: boolean;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const tokenPriceB = tokenPrices?.[tokenB.symbol];

  const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

  const infoRowStyle = 'w-full flex justify-between items-center mt-1';

  const arrowElement = (side: 'up' | 'down', className?: string) => {
    const pxSize = 9;

    return (
      <Image
        className={twMerge(
          `grow-0 max-h-[${pxSize}px] max-w-[${pxSize}px] self-center absolute right-[0.9em]`,
          className,
        )}
        src={side === 'down' ? arrowDown : arrowUp}
        height={pxSize}
        width={pxSize}
        alt="Arrow"
      />
    );
  };

  const rightArrowElement = (
    <Image
      className="ml-2 mr-2 opacity-60"
      src={arrowRightIcon}
      height={16}
      width={16}
      alt="Arrow"
    />
  );

  return (
    <div
      className={twMerge('flex flex-col bg-secondary border pr-2', className)}
    >
      <div className="flex items-center border-b h-14 pr-4">
        <Select
          className="shrink-0 h-full flex items-center w-[7em]"
          selectedClassName="w-14"
          selected={tokenB.symbol}
          options={allowedTokenB.map((token) => ({
            title: token.symbol,
            img: token.image,
          }))}
          onSelect={(name) => {
            // Force linting, you cannot not find the token in the list
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const token = allowedTokenB.find((t) => t.symbol === name)!;
            setTokenB(token);

            // if the prev value has more decimals than the new token, we need to adjust the value
            const newTokenDecimals = token.decimals ?? 18;
            const decimals = inputB?.toString().split('.')[1]?.length;

            if (Number(decimals) > Number(newTokenDecimals)) {
              handleInputBChange(Number(inputB?.toFixed(newTokenDecimals)));
            }
          }}
        />

        {!isInfoLoading ? (
          <>
            <div className="flex ml-auto">
              <InfoAnnotation
                text="Amount of tokens being traded."
                className="w-3 grow-0 mr-3 mb-4"
              />

              {openedPosition && tokenPriceB && inputB ? (
                <>
                  {/* Opened position */}
                  <div className="flex flex-col self-center items-end">
                    <div className="text-txtfade">
                      {inputB !== null && tokenPriceB
                        ? formatNumber(
                            openedPosition.sizeUsd / tokenPriceB,
                            tokenB.decimals <= 6 ? tokenB.decimals : 6, // Max 6 for UI
                          )
                        : ''}
                    </div>

                    <div className="text-txtfade text-xs">
                      {formatPriceInfo(openedPosition.sizeUsd, false, 2)}
                    </div>
                  </div>

                  <div className="ml-2 mr-2 flex items-center">
                    {rightArrowElement}
                  </div>
                </>
              ) : null}

              <div className="relative flex flex-col">
                <div className="flex flex-col items-end font-mono">
                  <div className="text-base">
                    {inputB !== null
                      ? formatNumber(
                          inputB,
                          tokenB.decimals <= 6 ? tokenB.decimals : 6, // Max 6 for UI
                        )
                      : '-'}
                  </div>
                  <div className="text-sm text-txtfade">
                    {formatPriceInfo(priceB, false, 2)}
                  </div>
                </div>
              </div>
            </div>

            {openedPosition && tokenPriceB && inputB && priceB
              ? arrowElement(
                  openedPosition.sizeUsd < priceB ? 'up' : 'down',
                  'right-[0.7em]',
                )
              : null}
          </>
        ) : (
          <div className="w-full h-[40px] bg-gray-300 rounded-xl" />
        )}
      </div>

      <div className="flex flex-col pt-2 pb-2 pl-4 pr-4">
        <div className={infoRowStyle}>
          <span className="text-sm flex">
            <InfoAnnotation
              text="Collateral backing the position. Position can be liquidated if this drop below xx% of position value"
              className="mr-1 w-3"
            />
            Collateral
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm flex">
              {(() => {
                if (!positionInfos) return '-';

                if (openedPosition) {
                  const newCollateralUsd =
                    positionInfos.collateralUsd + openedPosition.collateralUsd;

                  return (
                    <>
                      {/* Opened position */}
                      <div className="text-txtfade text-xs self-center">
                        {formatPriceInfo(openedPosition.collateralUsd)}
                      </div>

                      {rightArrowElement}

                      {/* New position */}
                      <div>{formatPriceInfo(newCollateralUsd)}</div>

                      {arrowElement(
                        newCollateralUsd > positionInfos.collateralUsd
                          ? 'up'
                          : 'down',
                      )}
                    </>
                  );
                }

                return formatPriceInfo(positionInfos.collateralUsd);
              })()}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className={infoRowStyle}>
          <span className="text-sm flex">
            <InfoAnnotation
              text="Multiplier applied to the collateral to determine the size of the position."
              className="mr-1 w-3"
            />
            Leverage
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm flex">
              {(() => {
                if (!positionInfos || !tokenPriceB) return '-';

                if (openedPosition) {
                  const newLeverage =
                    (openedPosition.sizeUsd * openedPosition.leverage +
                      positionInfos.sizeUsd * leverage) /
                    (openedPosition.sizeUsd + positionInfos.sizeUsd);

                  return (
                    <>
                      {/* Opened position */}
                      <div className="text-txtfade text-xs self-center">
                        {formatNumber(openedPosition.leverage, 2)}x
                      </div>

                      {rightArrowElement}

                      {/* New position */}
                      <div>{formatNumber(newLeverage, 2)}x</div>

                      {arrowElement(
                        newLeverage > openedPosition.leverage ? 'up' : 'down',
                      )}
                    </>
                  );
                }

                return <div>{formatNumber(leverage, 2)}x</div>;
              })()}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className={infoRowStyle}>
          <span className="text-sm flex">
            <InfoAnnotation
              text="Token price at which the position is opened."
              className="mr-1 w-3"
            />
            Entry Price
          </span>

          {!isInfoLoading ? (
            <span className="flex font-mono text-sm">
              {(() => {
                if (!positionInfos || !tokenPriceB) return '-';

                if (openedPosition) {
                  const newEntryPrice =
                    (openedPosition.sizeUsd * openedPosition.price +
                      positionInfos.sizeUsd * tokenPriceB) /
                    (openedPosition.sizeUsd + positionInfos.sizeUsd);

                  return (
                    <>
                      {/* Opened position */}
                      <div className="text-txtfade text-xs self-center">
                        {formatPriceInfo(openedPosition.price)}
                      </div>

                      {rightArrowElement}

                      {/* New position */}
                      <div>{formatPriceInfo(newEntryPrice)}</div>

                      {arrowElement(
                        newEntryPrice > openedPosition.price ? 'up' : 'down',
                      )}
                    </>
                  );
                }

                return formatPriceInfo(positionInfos.entryPrice);
              })()}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className={infoRowStyle}>
          <span className="text-sm flex">
            <InfoAnnotation
              text="If the token's price hits this point, the position is automatically closed to prevent further losses."
              className="mr-1 w-3"
            />
            Liquidation Price
          </span>

          {!isInfoLoading ? (
            <span className="flex font-mono text-sm">
              {(() => {
                if (!positionInfos) return '-';

                if (openedPosition) {
                  if (!openedPosition.liquidationPrice) return '-';

                  const newLiquidationPrice =
                    (openedPosition.sizeUsd * openedPosition.liquidationPrice +
                      positionInfos.sizeUsd * positionInfos.liquidationPrice) /
                    (openedPosition.sizeUsd + positionInfos.sizeUsd);

                  return (
                    <>
                      {/* Opened position */}
                      <div className="text-txtfade text-xs self-center">
                        {formatPriceInfo(openedPosition.liquidationPrice)}
                      </div>

                      {rightArrowElement}

                      {/* New position */}
                      <div>{formatPriceInfo(newLiquidationPrice)}</div>

                      {arrowElement(
                        newLiquidationPrice > openedPosition.price
                          ? 'up'
                          : 'down',
                      )}
                    </>
                  );
                }

                return formatPriceInfo(positionInfos.liquidationPrice);
              })()}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

        <div className={infoRowStyle}>
          <span className="text-sm flex">
            <InfoAnnotation
              text={`Fees paid when ${
                openedPosition ? 'increasing' : 'opening'
              } the position.`}
              className="mr-1 w-3"
            />
            {openedPosition ? 'Increase' : 'Open'} Position Fees
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm">
              {positionInfos && positionInfos?.swapFeeUsd ? (
                <Tippy
                  content={
                    <ul className="flex flex-col gap-2">
                      <li className="flex flex-row gap-2 justify-between">
                        <p className="text-sm text-txtfade">Swap fees:</p>
                        <p className="text-sm font-mono">
                          {`${formatPriceInfo(positionInfos.swapFeeUsd)}`}
                        </p>
                      </li>

                      <li className="flex flex-row gap-2 justify-between">
                        <p className="text-sm text-txtfade">
                          Open position fees:
                        </p>
                        <p className="text-sm font-mono">
                          {`${formatPriceInfo(
                            positionInfos.openPositionFeeUsd,
                          )}`}
                        </p>
                      </li>

                      <div className="w-full h-[1px] bg-gray-300" />

                      <li className="flex flex-row gap-2 justify-between">
                        <p className="text-sm text-txtfade">Total fees:</p>
                        <p className="text-sm font-mono">
                          {`${formatPriceInfo(
                            positionInfos.totalOpenPositionFeeUsd,
                          )}`}
                        </p>
                      </li>
                    </ul>
                  }
                  placement="bottom"
                >
                  <div className="tooltip-target">
                    {formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)}
                  </div>
                </Tippy>
              ) : positionInfos ? (
                formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)
              ) : (
                '-'
              )}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className={infoRowStyle}>
          <span className="text-sm relative flex">
            <InfoAnnotation
              text="Fees paid when closing the position."
              className="mr-1 w-3"
            />
            Exit Position Fees
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm flex">
              {(() => {
                if (!positionInfos) return '-';

                if (openedPosition) {
                  if (!openedPosition.nativeObject.exitFeeUsd) return '-';

                  const newExitPositionFeeUsd =
                    openedPosition.exitFeeUsd + positionInfos.exitFeeUsd;

                  return (
                    <>
                      {/* Opened position */}
                      <div className="text-txtfade text-xs self-center">
                        {formatPriceInfo(openedPosition.exitFeeUsd)}
                      </div>

                      {rightArrowElement}

                      {/* New position */}
                      <div>{formatPriceInfo(newExitPositionFeeUsd)}</div>

                      {arrowElement(
                        newExitPositionFeeUsd > openedPosition.exitFeeUsd
                          ? 'up'
                          : 'down',
                      )}
                    </>
                  );
                }

                return formatPriceInfo(positionInfos.exitFeeUsd);
              })()}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className={infoRowStyle}>
          <span className="text-sm relative flex">
            <InfoAnnotation
              text="Fees paid when the position is liquidated."
              className="mr-1 w-3"
            />
            Liquidation Fees
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm flex">
              {(() => {
                if (!positionInfos) return '-';

                if (openedPosition) {
                  if (!openedPosition.nativeObject.liquidationFeeUsd)
                    return '-';

                  const newLiquidationFeeUsd =
                    openedPosition.liquidationFeeUsd +
                    positionInfos.liquidationFeeUsd;

                  return (
                    <>
                      {/* Opened position */}
                      <div className="text-txtfade text-xs self-center">
                        {formatPriceInfo(openedPosition.liquidationFeeUsd)}
                      </div>

                      {rightArrowElement}

                      {/* New position */}
                      <div>{formatPriceInfo(newLiquidationFeeUsd)}</div>

                      {arrowElement(
                        newLiquidationFeeUsd > openedPosition.liquidationFeeUsd
                          ? 'up'
                          : 'down',
                      )}
                    </>
                  );
                }

                return formatPriceInfo(positionInfos.liquidationFeeUsd);
              })()}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className={infoRowStyle}>
          <span className="text-sm relative flex">
            <InfoAnnotation
              text="Fees charged for borrowing funds for the position. Greater leverage means borrowing more tokens, resulting in higher fees."
              className="mr-1 w-3"
            />
            Current Borrow Fees
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm">
              {custody && tokenB
                ? `${formatNumber(custody.borrowFee, RATE_DECIMALS)}%/hr`
                : '-'}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>

        <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

        <div className={infoRowStyle}>
          <span className="text-sm flex mb-1">
            <InfoAnnotation
              text="Amount of funds available to enter new trades."
              className="mr-1 w-3"
            />
            Available Liquidity
          </span>

          {!isInfoLoading ? (
            <span className="font-mono text-sm">
              {custody && tokenPriceB
                ? formatPriceInfo(custody.liquidity * tokenPriceB)
                : '-'}
            </span>
          ) : (
            <div className="w-[45%] h-[18px] bg-gray-300 rounded-xl" />
          )}
        </div>
      </div>
    </div>
  );
}
