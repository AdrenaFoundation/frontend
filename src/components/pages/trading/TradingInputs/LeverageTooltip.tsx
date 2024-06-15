import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';

import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

export default function LeverageTooltip({
  children,
  openedPosition,
}: {
  children: ReactElement;
  openedPosition: PositionExtended;
}) {
  return (
    <Tippy
      content={
        <div className="flex flex-col p-4">
          <h3>Leverage</h3>
          <p className="mt-4 mb-4">
            Multiplier applied to the collateral to determine the size of the
            position.
          </p>
          <StyledSubContainer className="mt-2 flex-row p-8 items-center justify-center">
            <AutoScalableDiv className="w-full">
              <TextExplainWrapper title="Size">
                <FormatNumber
                  nb={openedPosition.sizeUsd}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg ml-2 mr-2">x</span>
              <TextExplainWrapper title="10 BPS">
                <FormatNumber nb={0.0001} className="text-lg" />
              </TextExplainWrapper>
              <span className="text-lg ml-2 mr-2">/</span>
              <span className="text-lg ml-1">(</span>
              <TextExplainWrapper title="Collateral" position="bottom">
                <FormatNumber
                  nb={openedPosition.collateralUsd}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg ml-2 mr-2"></span>
              <TextExplainWrapper title="Net Value" position="bottom">
                <FormatNumber
                  nb={openedPosition.pnl}
                  format="currency"
                  className="text-lg"
                />
              </TextExplainWrapper>
              <span className="text-lg mr-2">)</span>
              <span className="text-lg ml-2 mr-2">=</span>
              <TextExplainWrapper title="Leverage">
                <FormatNumber
                  nb={openedPosition.leverage}
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
