import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDown from '@/../public/images/chevron-down.svg';
import FormatNumber from '@/components/Number/FormatNumber';

interface VelocityIndicatorProps {
  change: number | null;
  className?: string;
  format?: 'currency' | 'percentage' | 'number';
  period?: '24h' | '7d';
  onTogglePeriod?: () => void;
}

const VelocityIndicator = React.memo(function VelocityIndicator({
  change,
  className,
  format = 'currency',
  period = '24h',
  onTogglePeriod,
}: VelocityIndicatorProps) {
  if (change === null) {
    return <div className={twMerge('text-base', className)}>-</div>;
  }

  const isPositive = change >= 0;
  const sign = isPositive ? '+' : '';

  return (
    <div
      className={twMerge(
        'flex items-center gap-1 text-base font-mono',
        className,
      )}
    >
      {/* Chevron toggle */}
      {onTogglePeriod && (
        <div
          className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onTogglePeriod}
        >
          <Image
            src={chevronDown}
            alt="up"
            className="w-3 h-3 opacity-50 rotate-180 -mb-1"
          />
          <Image src={chevronDown} alt="down" className="w-3 h-3 opacity-50" />
        </div>
      )}

      {/* Period indicator */}
      <span className="text-base opacity-50">{period}</span>

      {/* Value */}
      <FormatNumber
        nb={change}
        format={format}
        precision={format === 'currency' ? 0 : format === 'number' ? 0 : 1}
        prefix={sign}
        className={twMerge('text-base', isPositive ? 'text-green' : 'text-red')}
        isDecimalDimmed={false}
        showSignBeforePrefix={true}
      />
    </div>
  );
});

export default VelocityIndicator;
