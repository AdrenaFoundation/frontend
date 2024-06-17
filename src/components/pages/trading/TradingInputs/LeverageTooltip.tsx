import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';

import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

export default function LeverageTooltip({
  children,
  position,
}: {
  children: ReactElement;
  position: PositionExtended;
}) {
  return (
    <Tippy
      content={
        <div className="flex flex-col p-2">
          <h3>Leverage</h3>
          <p className="mt-4 mb-4">
            Multiplier applied to the collateral to determine the size of the
            position.
          </p>
          <StyledSubContainer className="mt-2 flex-row p-6 items-center justify-center">
            <AutoScalableDiv className="w-full">
              <TextExplainWrapper title="Size">
                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg ml-2 mr-2">/</span>
              <span className="text-lg ml-1">(</span>
              <TextExplainWrapper title="Collateral" position="bottom">
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg ml-2 mr-2">-</span>
              <TextExplainWrapper title="Fees" position="top">
                <FormatNumber
                  nb={(position.borrowFeeUsd ?? 0) + position.exitFeeUsd}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg ml-2 mr-2">+</span>
              <TextExplainWrapper title="Price Change" position="bottom">
                <FormatNumber
                  nb={position.priceChangeUsd}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg mr-2">)</span>
              <span className="text-lg mr-2">=</span>
              <TextExplainWrapper title="Leverage">
                <FormatNumber
                  nb={position.leverage}
                  className="text-lg"
                  suffix="x"
                />
              </TextExplainWrapper>
            </AutoScalableDiv>
          </StyledSubContainer>
        </div>
      }
      placement="auto"
    >
      {children}
    </Tippy>
  );
}
