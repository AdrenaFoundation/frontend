import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { RATE_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getArrowElement, getRightArrowElement } from '@/utils';

import InfoAnnotation from '../../monitoring/InfoAnnotation';

export default function PositionInfos({
  className,
  positionInfos,
  tokenB,
  leverage,
  openedPosition,
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
  isInfoLoading: boolean;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const tokenPriceB = tokenPrices?.[tokenB.symbol];

  const custody = window.adrena.client.getCustodyByMint(tokenB.mint) ?? null;

  const infoRowStyle = 'w-full flex justify-between items-center mt-1';

  const rightArrowElement = getRightArrowElement();

  const arrowElementUp = getArrowElement('up');
  const arrowElementDown = getArrowElement('down');

  return (
    <StyledSubSubContainer
      className={twMerge('flex-col pr-1 pt-0 pb-0', className)}
    >
      <div className="flex flex-col pr-5">
        <div className="flex flex-col pt-2 pb-2">
          {openedPosition ? (
            <div className={infoRowStyle}>
              <span className="text-sm flex">Collateral</span>

              {!isInfoLoading ? (
                <span className="font-mono text-sm flex">
                  {(() => {
                    if (!positionInfos) return '-';

                    const newCollateralUsd =
                      positionInfos.collateralUsd +
                      openedPosition.collateralUsd;

                    return (
                      <>
                        {/* Opened position */}

                        <FormatNumber
                          nb={openedPosition.collateralUsd}
                          format="currency"
                          className="text-txtfade text-xs self-center"
                          isDecimalDimmed={false}
                        />

                        {rightArrowElement}

                        {/* New position */}
                        <FormatNumber nb={newCollateralUsd} format="currency" />

                        {newCollateralUsd > positionInfos.collateralUsd
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  })()}
                </span>
              ) : (
                <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
              )}
            </div>
          ) : null}

          {openedPosition ? (
            <div className={infoRowStyle}>
              <span className="text-sm flex">
                Leverage
                {/* <InfoAnnotation
                text="Multiplier applied to the collateral to determine the size of the position."
                className="mr-1 w-3"
              /> */}
              </span>

              {!isInfoLoading ? (
                <span className="font-mono text-sm flex">
                  {(() => {
                    if (!positionInfos || !tokenPriceB) return '-';

                    const newLeverage =
                      (openedPosition.sizeUsd * openedPosition.leverage +
                        positionInfos.sizeUsd * leverage) /
                      (openedPosition.sizeUsd + positionInfos.sizeUsd);

                    return (
                      <>
                        {/* Opened position */}
                        <FormatNumber
                          nb={openedPosition.leverage}
                          suffix="x"
                          className="text-txtfade text-xs self-center"
                          isDecimalDimmed={false}
                        />

                        {rightArrowElement}

                        {/* New position */}
                        <FormatNumber
                          nb={newLeverage}
                          suffix="x"
                          isDecimalDimmed={false}
                        />

                        {newLeverage > openedPosition.leverage
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  })()}
                </span>
              ) : (
                <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
              )}
            </div>
          ) : null}

          <div className={infoRowStyle}>
            <span className="text-sm flex">
              Entry Price
              {/* <InfoAnnotation
                text="Token price at which the position is opened."
                className="mr-1 w-3"
              /> */}
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

                        <FormatNumber
                          nb={openedPosition.price}
                          format="currency"
                          className="text-txtfade text-xs self-center"
                          isDecimalDimmed={false}
                        />

                        {rightArrowElement}

                        {/* New position */}

                        <FormatNumber nb={newEntryPrice} format="currency" />

                        {newEntryPrice > openedPosition.price
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  }

                  return (
                    <FormatNumber
                      nb={positionInfos.entryPrice}
                      format="currency"
                    />
                  );
                })()}
              </span>
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
            )}
          </div>

          <div className={infoRowStyle}>
            <span className="text-sm flex">
              Liquidation Price
              {/* <InfoAnnotation
                text="If the token's price hits this point, the position is automatically closed to prevent further losses."
                className="mr-1 w-3"
              /> */}
            </span>

            {!isInfoLoading ? (
              <span className="flex font-mono text-sm">
                {(() => {
                  if (!positionInfos) return '-';

                  if (openedPosition) {
                    if (!openedPosition.liquidationPrice) return '-';

                    const newLiquidationPrice =
                      (openedPosition.sizeUsd *
                        openedPosition.liquidationPrice +
                        positionInfos.sizeUsd *
                          positionInfos.liquidationPrice) /
                      (openedPosition.sizeUsd + positionInfos.sizeUsd);

                    return (
                      <>
                        {/* Opened position */}

                        <FormatNumber
                          nb={openedPosition.liquidationPrice}
                          format="currency"
                          className="text-txtfade text-xs self-center"
                          isDecimalDimmed={false}
                        />

                        {rightArrowElement}

                        {/* New position */}
                        <FormatNumber
                          nb={newLiquidationPrice}
                          format="currency"
                        />

                        {newLiquidationPrice > openedPosition.price
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  }

                  return (
                    <FormatNumber
                      nb={positionInfos.liquidationPrice}
                      format="currency"
                    />
                  );
                })()}
              </span>
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
            )}
          </div>

          <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

          <div className={infoRowStyle}>
            <span className="text-sm flex">
              {openedPosition ? 'Increase' : 'Open'}/Close Position Fees
              {/* <InfoAnnotation
                text={`Fees paid when ${
                  openedPosition ? 'increasing' : 'opening'
                } the position.`}
                className="mr-1 w-3"
              /> */}
            </span>

            {!isInfoLoading ? (
              <span className="font-mono text-sm">
                {positionInfos && positionInfos?.swapFeeUsd ? (
                  <Tippy
                    content={
                      <ul className="flex flex-col gap-2">
                        <li className="flex flex-row gap-2 justify-between">
                          <p className="text-sm text-txtfade">Swap fees:</p>

                          <FormatNumber
                            nb={positionInfos.swapFeeUsd}
                            format="currency"
                          />
                        </li>

                        <li className="flex flex-row gap-2 justify-between">
                          <p className="text-sm text-txtfade">
                            Open/Close position fees:
                          </p>

                          <FormatNumber
                            nb={
                              positionInfos.openPositionFeeUsd +
                              positionInfos.exitFeeUsd
                            }
                            format="currency"
                          />
                        </li>

                        <div className="w-full h-[1px] bg-bcolor" />

                        <li className="flex flex-row gap-2 justify-between">
                          <p className="text-sm text-txtfade">Total fees:</p>

                          <FormatNumber
                            nb={
                              positionInfos.totalOpenPositionFeeUsd +
                              positionInfos.exitFeeUsd
                            }
                            format="currency"
                          />
                        </li>
                      </ul>
                    }
                    placement="bottom"
                  >
                    <div className="tooltip-target">
                      <FormatNumber
                        nb={
                          positionInfos.totalOpenPositionFeeUsd +
                          positionInfos.exitFeeUsd
                        }
                        format="currency"
                      />
                    </div>
                  </Tippy>
                ) : (
                  <FormatNumber
                    nb={
                      typeof positionInfos?.totalOpenPositionFeeUsd !==
                        'undefined' &&
                      typeof positionInfos?.exitFeeUsd !== 'undefined'
                        ? positionInfos.totalOpenPositionFeeUsd +
                          positionInfos.exitFeeUsd
                        : undefined
                    }
                    format="currency"
                  />
                )}
              </span>
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
            )}
          </div>

          <div className={infoRowStyle}>
            <span className="text-sm relative flex">
              Current Borrow Fees
              <InfoAnnotation
                text="Fees charged for borrowing funds for the position. Greater leverage means borrowing more tokens, resulting in higher fees."
                className="mr-1 w-3"
              />
            </span>

            {!isInfoLoading ? (
              <FormatNumber
                nb={custody && tokenB && custody.borrowFee}
                precision={RATE_DECIMALS}
                suffix="%/hr"
                isDecimalDimmed={false}
              />
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
            )}
          </div>

          <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

          <div className={infoRowStyle}>
            <span className="text-sm flex mb-1">
              Available Liquidity
              {/* <InfoAnnotation
                text="Amount of funds available to enter new trades."
                className="mr-1 w-3"
              /> */}
            </span>

            {!isInfoLoading ? (
              <FormatNumber
                nb={custody && tokenPriceB && custody.liquidity * tokenPriceB}
                format="currency"
              />
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
            )}
          </div>

          <div className={infoRowStyle}>
            <span className="text-sm flex mb-1">
              Max Position Size
              {/* <InfoAnnotation
                text="Amount of funds available to enter new trades."
                className="mr-1 w-3"
              /> */}
            </span>

            {!isInfoLoading ? (
              <FormatNumber
                nb={
                  custody && custody.maxPositionLockedUsd
                    ? custody.maxPositionLockedUsd
                    : null
                }
                format="currency"
              />
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
            )}
          </div>
        </div>
      </div>
    </StyledSubSubContainer>
  );
}
