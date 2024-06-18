import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';

import AutoScalableDiv from '@/components/common/AutoScalableDiv/AutoScalableDiv';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import TextExplainWrapper from '@/components/common/TextExplain/TextExplainWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

export default function SizeTooltip({
  children,
  className,
  placement = 'auto',
  position,
}: {
  children: ReactElement;
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  position: PositionExtended;
}) {
  return (
    <Tippy
      content={
        <div className="flex flex-col p-2">
          <h3>Size</h3>
          <StyledSubContainer className="mt-4 flex-row p-6 items-center justify-center">
            <AutoScalableDiv className="w-full">
              <TextExplainWrapper title="Size">
                <FormatNumber
                  nb={position.sizeUsd}
                  format="currency"
                  className="text-sm"
                />
              </TextExplainWrapper>
              <span className="text-sm ml-2 mr-2">=</span>
              <span className="text-sm ml-1">(</span>
              <TextExplainWrapper title="Collateral" position="bottom">
                <FormatNumber
                  nb={position.collateralUsd}
                  format="currency"
                  className="text-sm"
                />
              </TextExplainWrapper>
              <span className="text-sm ml-2 mr-2">-</span>
              <TextExplainWrapper title="Fees" position="top">
                <FormatNumber
                  nb={(position.borrowFeeUsd ?? 0) + position.exitFeeUsd}
                  format="currency"
                  className="text-sm"
                />
              </TextExplainWrapper>
              <span className="text-sm ml-2 mr-2">+</span>
              <TextExplainWrapper title="PnL" position="bottom">
                <FormatNumber
                  nb={position.priceChangeUsd}
                  format="currency"
                  className="text-sm"
                />
              </TextExplainWrapper>
              <span className="text-sm mr-2">)</span>
              <span className="text-sm mr-2">*</span>
              <TextExplainWrapper title="Leverage">
                <FormatNumber
                  nb={position.leverage}
                  className="text-sm"
                  suffix="x"
                />
              </TextExplainWrapper>
            </AutoScalableDiv>
          </StyledSubContainer>
        </div>
      }
      placement={placement}
      className={className}
      maxWidth="none"
    >
      {children}
    </Tippy>
  );
}
