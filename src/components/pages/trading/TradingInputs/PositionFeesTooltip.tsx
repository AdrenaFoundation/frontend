import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';

import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { RATE_DECIMALS } from '@/constant';
import { PositionExtended } from '@/types';

export default function PositionFeesTooltip({
  children,
  borrowRate,
  positionInfos,
  openedPosition,
}: {
  children: ReactElement;
  borrowRate: number | null;
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
  openedPosition: PositionExtended | null;
}) {
  return (
    <Tippy
      disabled={!positionInfos || !borrowRate}
      content={
        positionInfos && borrowRate ? (
          <div className="flex flex-col p-4">
            <h3>{openedPosition ? 'Increase ' : ''}Position Fees</h3>

            {openedPosition ? (
              <p className="mt-2 text-xs">
                Additional fees are charged when increasing the position, based
                on the additional size. Describing below theses additional fees.
              </p>
            ) : null}

            <h4 className="mt-4">
              {openedPosition ? 'Additional flat fee' : '#1 Flat fee'}
            </h4>

            <p className="mt-1 text-xs mb-1">
              A fee based on the position&apos;s size and expressed in bips
              (1/100th of a percent) charged when exiting the position.
            </p>

            <StyledSubContainer className="flex-row items-center justify-center w-full mt-2">
              <AutoScalableDiv className="w-full">
                <TextExplainWrapper title="Flat fee" className="mt-6">
                  <FormatNumber nb={20} suffix="bps" className="text-lg" />
                </TextExplainWrapper>

                <span className="text-lg ml-2 mr-2 mt-6">x</span>

                <TextExplainWrapper title="Position Size" className="mt-6">
                  <FormatNumber
                    nb={positionInfos.sizeUsd}
                    format="currency"
                    className="text-lg"
                  />
                </TextExplainWrapper>

                <span className="text-lg ml-2 mr-2 mt-6">=</span>

                <FormatNumber
                  nb={
                    positionInfos.totalOpenPositionFeeUsd +
                    positionInfos.exitFeeUsd
                  }
                  format="currency"
                  className="text-lg mt-6"
                />
              </AutoScalableDiv>
            </StyledSubContainer>

            <h4 className="mt-4">
              {openedPosition ? 'Updated borrow fee' : '#2 Borrow fee'}
            </h4>

            <p className="mt-1 text-xs mb-1">
              Is a continuously accruing fee paid upon closing a position,
              compensating for borrowing funds.
            </p>

            <p className="text-xs mt-2">24h fee example:</p>

            <StyledSubContainer className="mt-2 flex-row items-center justify-center">
              <AutoScalableDiv className="w-full">
                <TextExplainWrapper title="Time" className="mt-6">
                  <FormatNumber nb={24} suffix="h" className="text-lg" />
                </TextExplainWrapper>

                <span className="text-lg ml-2 mr-2 mt-6">x</span>

                <TextExplainWrapper title="Borrow fee" className="flex mt-6">
                  <FormatNumber
                    nb={borrowRate}
                    precision={RATE_DECIMALS}
                    suffix="%"
                    isDecimalDimmed={false}
                    className="text-lg"
                  />
                </TextExplainWrapper>

                <span className="text-lg ml-2 mr-2 mt-6">x</span>

                <TextExplainWrapper title="Position Size" className="mt-6">
                  <FormatNumber
                    nb={positionInfos.sizeUsd + (openedPosition?.sizeUsd ?? 0)}
                    format="currency"
                    className="text-lg"
                  />
                </TextExplainWrapper>

                <span className="text-lg ml-2 mr-2 mt-6">=</span>

                <FormatNumber
                  nb={
                    (24 *
                      borrowRate *
                      (positionInfos.sizeUsd +
                        (openedPosition?.sizeUsd ?? 0))) /
                    100
                  }
                  format="currency"
                  className="text-lg mt-6"
                />
              </AutoScalableDiv>
            </StyledSubContainer>
          </div>
        ) : null
      }
      placement="auto"
    >
      <div className="flex">{children}</div>
    </Tippy>
  );
}
