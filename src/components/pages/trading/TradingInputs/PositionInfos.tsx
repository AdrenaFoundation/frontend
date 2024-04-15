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
                      positionInfos.collateralUsd +
                      openedPosition.collateralUsd;

                    return (
                      <>
                        {/* Opened position */}

                        <FormatNumber
                          nb={openedPosition.collateralUsd}
                          format="currency"
                          className="text-txtfade text-xs self-center"
                        />

                        {rightArrowElement}

                        {/* New position */}
                        <FormatNumber nb={newCollateralUsd} format="currency" />

                        {newCollateralUsd > positionInfos.collateralUsd
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  }

                  return (
                    <FormatNumber
                      nb={positionInfos.collateralUsd}
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
                        <FormatNumber
                          nb={openedPosition.leverage}
                          suffix="x"
                          className="text-txtfade text-xs self-center"
                        />

                        {rightArrowElement}

                        {/* New position */}
                        <FormatNumber nb={newLeverage} suffix="x" />

                        {newLeverage > openedPosition.leverage
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  }

                  return <FormatNumber nb={leverage} suffix="x" />;
                })()}
              </span>
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
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

                        <FormatNumber
                          nb={openedPosition.price}
                          format="currency"
                          className="text-txtfade text-xs self-center"
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

                          <FormatNumber
                            nb={positionInfos.swapFeeUsd}
                            format="currency"
                          />
                        </li>

                        <li className="flex flex-row gap-2 justify-between">
                          <p className="text-sm text-txtfade">
                            Open position fees:
                          </p>

                          <FormatNumber
                            nb={positionInfos.openPositionFeeUsd}
                            format="currency"
                          />
                        </li>

                        <div className="w-full h-[1px] bg-bcolor" />

                        <li className="flex flex-row gap-2 justify-between">
                          <p className="text-sm text-txtfade">Total fees:</p>

                          <FormatNumber
                            nb={positionInfos.totalOpenPositionFeeUsd}
                            format="currency"
                          />
                        </li>
                      </ul>
                    }
                    placement="bottom"
                  >
                    <div className="tooltip-target">
                      {/* {formatPriceInfo(positionInfos.totalOpenPositionFeeUsd)} */}
                      <FormatNumber
                        nb={positionInfos.totalOpenPositionFeeUsd}
                        format="currency"
                      />
                    </div>
                  </Tippy>
                ) : (
                  <FormatNumber
                    nb={positionInfos?.totalOpenPositionFeeUsd}
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

                        <FormatNumber
                          nb={openedPosition.exitFeeUsd}
                          format="currency"
                          className="text-txtfade text-xs self-center"
                        />

                        {rightArrowElement}

                        {/* New position */}

                        <FormatNumber
                          nb={newExitPositionFeeUsd}
                          format="currency"
                        />

                        {newExitPositionFeeUsd > openedPosition.exitFeeUsd
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  }

                  return (
                    <FormatNumber
                      nb={positionInfos.exitFeeUsd}
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

                        <FormatNumber
                          nb={openedPosition.liquidationFeeUsd}
                          format="currency"
                          className="text-txtfade text-xs self-center"
                        />

                        {rightArrowElement}

                        {/* New position */}

                        <FormatNumber
                          nb={newLiquidationFeeUsd}
                          format="currency"
                        />

                        {newLiquidationFeeUsd > openedPosition.liquidationFeeUsd
                          ? arrowElementUp
                          : arrowElementDown}
                      </>
                    );
                  }

                  return (
                    <FormatNumber
                      nb={positionInfos.liquidationFeeUsd}
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
            <span className="text-sm relative flex">
              <InfoAnnotation
                text="Fees charged for borrowing funds for the position. Greater leverage means borrowing more tokens, resulting in higher fees."
                className="mr-1 w-3"
              />
              Current Borrow Fees
            </span>

            {!isInfoLoading ? (
              <FormatNumber
                nb={custody && tokenB && custody.borrowFee}
                precision={RATE_DECIMALS}
                suffix="%/hr"
              />
            ) : (
              <div className="w-[45%] h-[18px] bg-bcolor rounded-xl" />
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
              <FormatNumber
                nb={custody && tokenPriceB && custody.liquidity * tokenPriceB}
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
