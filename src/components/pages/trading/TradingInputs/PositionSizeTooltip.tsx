import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';

import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

export default function PositionSizeTooltip({
  children,
  positionInfos,
  openedPosition,
  leverage,
}: {
  children: ReactElement;
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
  leverage: number | null;
}) {
  return (
    <Tippy
      // TODO: reactivate it once the content is correct
      disabled={true}
      content={
        <div className="flex flex-col p-4">
          <h3>Position Size</h3>

          <p className="mt-4 mb-4">
            Refers to the total value of the tokens engaged in the trade. And is
            calculated using the following formula:
          </p>

          {positionInfos ? (
            <StyledSubContainer className="mt-2 flex-row p-8 items-center justify-center">
              <AutoScalableDiv className="w-full">
                {openedPosition ? (
                  <>
                    <TextExplainWrapper title="Previous size">
                      <FormatNumber
                        nb={openedPosition.sizeUsd}
                        format="currency"
                        className="text-lg"
                      />
                    </TextExplainWrapper>

                    <span className="text-lg ml-2 mr-2">+</span>
                  </>
                ) : null}

                {positionInfos.swapFeeUsd ? (
                  <span className="text-lg ">{'('}</span>
                ) : null}

                <TextExplainWrapper title="Collateral">
                  <FormatNumber
                    nb={positionInfos.collateralUsd}
                    format="currency"
                    className="text-lg"
                  />
                </TextExplainWrapper>

                {positionInfos.swapFeeUsd ? (
                  <>
                    <span className="text-lg ml-2 mr-2">-</span>

                    <TextExplainWrapper title="Swap Fees">
                      <FormatNumber
                        nb={positionInfos.swapFeeUsd}
                        format="currency"
                        className="text-lg"
                      />
                    </TextExplainWrapper>

                    <span className="text-lg ">{')'}</span>
                  </>
                ) : null}

                <span className="text-lg ml-2 mr-2">x</span>

                <TextExplainWrapper title="Leverage" position="bottom">
                  <FormatNumber nb={leverage} className="text-lg" />
                </TextExplainWrapper>

                <span className="text-lg ml-2 mr-2">=</span>

                <TextExplainWrapper title="Size">
                  <FormatNumber
                    nb={
                      positionInfos.sizeUsd +
                      (openedPosition ? openedPosition.sizeUsd : 0)
                    }
                    format="currency"
                    className="text-lg"
                  />
                </TextExplainWrapper>
              </AutoScalableDiv>
            </StyledSubContainer>
          ) : null}
        </div>
      }
      placement="auto"
    >
      {children}
    </Tippy>
  );
}
