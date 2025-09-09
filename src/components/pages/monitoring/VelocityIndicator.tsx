import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

interface VelocityIndicatorProps {
  dailyChange: number | null;
  weeklyChange: number | null;
  className?: string;
  format?: 'currency' | 'percentage' | 'number';
}

const VelocityIndicator = React.memo(function VelocityIndicator({
  dailyChange,
  weeklyChange,
  className,
  format = 'currency',
}: VelocityIndicatorProps) {
  const renderPeriodValue = (change: number | null, period: '24h' | '7d') => {
    if (change === null) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm opacity-50">{period}</span>
          <span className="text-sm">-</span>
        </div>
      );
    }

    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';

    return (
      <div className="flex items-center gap-1">
        <span className="text-base opacity-50">{period}</span>
        <FormatNumber
          nb={change}
          format={format}
          precision={format === 'currency' ? 1 : format === 'number' ? 0 : 1}
          prefix={sign}
          className={twMerge(
            'text-base',
            isPositive ? 'text-green' : 'text-red',
          )}
          isDecimalDimmed={false}
          showSignBeforePrefix={true}
          isAbbreviate={true}
          isAbbreviateIcon={false}
        />
      </div>
    );
  };

  return (
    <div className={twMerge('flex items-center gap-3 font-mono', className)}>
      {renderPeriodValue(dailyChange, '24h')}
      <span className="text-base opacity-50">|</span>
      {renderPeriodValue(weeklyChange, '7d')}
    </div>
  );
});

export default VelocityIndicator;
