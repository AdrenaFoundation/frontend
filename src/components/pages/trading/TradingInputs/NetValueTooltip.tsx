import Tippy from '@tippyjs/react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { PositionExtended } from '@/types';

export default function NetValueTooltip({
  children,
  className,
  position,
}: {
  children: ReactElement;
  className?: string;
  position: PositionExtended;
}) {
  const { t } = useTranslation();
  return (
    <Tippy
      content={
        <div className="flex flex-col p-2">
          <h3>{t('trade.netValueTooltip.netValue')}</h3>

          <h5 className="mt-4">{t('trade.netValueTooltip.formula')}</h5>

          <StyledSubContainer className="flex-col mt-4 p-4 min-w-[20em]">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm">{t('trade.netValueTooltip.collateral')}</span>
              <FormatNumber nb={position.collateralUsd} format="currency" />
            </div>

            <div className="flex w-full items-center justify-between">
              <span className="text-sm">{t('trade.netValueTooltip.pnl')}</span>
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
              <span className="text-sm text-txtfade">{t('trade.netValueTooltip.borrowFee')}</span>
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
              <span className="text-sm text-txtfade">{t('trade.netValueTooltip.tradeFee')}</span>
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
              <span className="text-sm">{t('trade.netValueTooltip.resultingNetValue')}</span>
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
      placement='auto'
      className={className}
      maxWidth="none"
    >
      {children}
    </Tippy>
  );
}
