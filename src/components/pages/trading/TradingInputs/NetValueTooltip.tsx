import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';

import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

export default function NetValueTooltip({
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
          <h3>Net Value</h3>

          <h5 className="mt-4">Formula: Collateral + PnL - Fees</h5>

          <StyledSubContainer className="flex-col mt-4 p-4 min-w-[20em]">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm">Collateral</span>
              <FormatNumber nb={position.collateralUsd} format="currency" />
            </div>

            <div className="flex w-full items-center justify-between">
              <span className="text-sm">PnL</span>
              <FormatNumber
                nb={position.pnlMinusFees}
                format="currency"
                className={`text-${position.pnl && position.pnl > 0
                  ? 'green'
                  : 'redbright'
                  }`}
                isDecimalDimmed={false}
                precision={2}
                minimumFractionDigits={2}
              />
            </div>

            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-txtfade">Borrow Fee</span>
              <FormatNumber
                nb={position.borrowFeeUsd}
                format="currency"
                prefix="-"
                className={'text-redbright'}
                isDecimalDimmed={false}
                precision={2}
                minimumFractionDigits={2}
              />
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-txtfade">Trade Fee</span>
              <FormatNumber
                nb={position.exitFeeUsd}
                format="currency"
                prefix="-"
                className={'text-redbright'}
                isDecimalDimmed={false}
                precision={2}
                minimumFractionDigits={2}
              />
            </div>

            <div className="flex w-full items-center justify-between">
              <span className="text-sm">Resulting Net Value</span>
              <FormatNumber
                format="currency"
                nb={position.pnl ? position.collateralUsd + position.pnl : undefined}
                isDecimalDimmed={true}
                precision={2}
                minimumFractionDigits={2}
              />
            </div>
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
