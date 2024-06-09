import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import TextExplain from '@/components/common/TextExplain/TextExplain';
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
    <>
      <h5 className="flex items-center ml-4 mt-4">Position in and out</h5>

      <StyledSubSubContainer className={twMerge('flex-col p-2', className)}>
        {positionInfos ? (
          <div className="flex w-full justify-evenly">
            <div className="flex relative items-center">
              <TextExplain title="Entry Price" className="top-[0.2em]" />

              <FormatNumber
                nb={positionInfos.entryPrice}
                format="currency"
                className="pt-8 text-lg"
              />
            </div>

            <div className="h-full w-[1px] bg-gray-800" />

            <div className="flex relative items-center">
              <TextExplain title="Liquidation Price" className="top-[0.2em]" />

              <FormatNumber
                nb={positionInfos.liquidationPrice}
                format="currency"
                className="pt-8 text-lg"
              />
            </div>
          </div>
        ) : null}
      </StyledSubSubContainer>

      <h5 className="flex items-center ml-4">Position fees</h5>

      <StyledSubSubContainer
        className={twMerge('flex p-2 items-center justify-center', className)}
      >
        <div className="flex relative items-center">
          <TextExplain title="Entry/Close Fees" className="top-[0.2em]" />

          <FormatNumber
            nb={
              typeof positionInfos?.totalOpenPositionFeeUsd !== 'undefined' &&
              typeof positionInfos?.exitFeeUsd !== 'undefined'
                ? positionInfos.totalOpenPositionFeeUsd +
                  positionInfos.exitFeeUsd
                : undefined
            }
            format="currency"
            className="text-lg pt-8"
          />
        </div>

        <span className="text-xl ml-2 mr-2 mt-8">+</span>

        <div className="flex relative items-center">
          <TextExplain title="Borrow Fees" className="top-[0.2em]" />

          <FormatNumber
            nb={custody && tokenB && custody.borrowFee}
            precision={RATE_DECIMALS}
            suffix="%/hr"
            isDecimalDimmed={false}
            className="text-lg pt-8"
          />
        </div>
      </StyledSubSubContainer>

      {/* <StyledSubSubContainer
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
                          {
                            // Opened position
                          }

                          <FormatNumber
                            nb={openedPosition.collateralUsd}
                            format="currency"
                            className="text-txtfade text-xs self-center"
                            isDecimalDimmed={false}
                          />

                          {rightArrowElement}

                          {
                            // New position
                          }
                          <FormatNumber
                            nb={newCollateralUsd}
                            format="currency"
                          />

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
                <span className="text-sm flex">Leverage</span>

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
                          {
                            // Opened position
                          }
                          <FormatNumber
                            nb={openedPosition.leverage}
                            suffix="x"
                            className="text-txtfade text-xs self-center"
                            isDecimalDimmed={false}
                          />

                          {rightArrowElement}

                          {
                            // New position
                          }
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
              <span className="text-sm flex">Entry Price</span>

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
                          {
                            // Opened position
                          }

                          <FormatNumber
                            nb={openedPosition.price}
                            format="currency"
                            className="text-txtfade text-xs self-center"
                            isDecimalDimmed={false}
                          />

                          {rightArrowElement}

                          {
                            // New position
                          }

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
              <span className="text-sm flex">Liquidation Price</span>

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
                          {
                            // Opened position
                          }

                          <FormatNumber
                            nb={openedPosition.liquidationPrice}
                            format="currency"
                            className="text-txtfade text-xs self-center"
                            isDecimalDimmed={false}
                          />

                          {rightArrowElement}

                          {
                            // New position
                          }
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

            <div className="h-[1px] bg-gray-800 w-full mt-2 mb-1" />

            <div className={infoRowStyle}>
              <span className="text-sm flex">
                {openedPosition ? 'Increase' : 'Open'}/Close Position Fees
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

            <div className="h-[1px] bg-gray-800 w-full mt-2 mb-1" />

            <div className={infoRowStyle}>
              <span className="text-sm flex mb-1">Available Liquidity</span>

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
              <span className="text-sm flex mb-1">Max Position Size</span>

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
      </StyledSubSubContainer> */}
    </>
  );
}
