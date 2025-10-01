import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

interface VelocityIndicatorProps {
  dailyChange: number | null;
  weeklyChange: number | null;
  dailyTippyContent: ReactNode;
  weeklyTippyContent: ReactNode;
  className?: string;
  format?: 'currency' | 'percentage' | 'number';
}

const VelocityIndicator = React.memo(function VelocityIndicator({
  dailyChange,
  weeklyChange,
  className,
  dailyTippyContent,
  weeklyTippyContent,
  format = 'currency',
}: VelocityIndicatorProps) {
  const renderPeriodValue = (change: number | null, period: '24h' | '7d', tippyContent: ReactNode) => {
    if (change === null) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-30">{period}</span>
          <span className="text-xs opacity-25">-</span>
        </div>
      );
    }

    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    const prefix = format === 'currency' ? `${sign}$` : sign;

    return (
      <Tippy content={tippyContent} placement='bottom'>
        <div className="flex items-center gap-1.5 mt-0.5 cursor-help">
          <span className="text-xs opacity-25">{period}</span>

          <FormatNumber
            nb={change}
            format={format}
            precision={format === 'currency' ? 1 : format === 'number' ? 0 : 1}
            prefix={prefix}
            className={twMerge(
              'text-xs font-[500] font-mono',
              isPositive ? 'text-green' : 'text-redbright',
            )}
            isDecimalDimmed={false}
            showSignBeforePrefix={true}
            isAbbreviate={true}
            isAbbreviateIcon={false}
          />
        </div>
      </Tippy>
    );
  };

  return (
    <div className={twMerge('flex items-center gap-2 font-mono mt-0.5', className)}>
      {renderPeriodValue(dailyChange, '24h', dailyTippyContent)}
      <span className="text-xs opacity-10">|</span>
      {renderPeriodValue(weeklyChange, '7d', weeklyTippyContent)}
    </div>
  );
});

export default VelocityIndicator;
