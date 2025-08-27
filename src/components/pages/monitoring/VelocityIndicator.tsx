import React from 'react';
import { twMerge } from 'tailwind-merge';
import FormatNumber from '@/components/Number/FormatNumber';

interface VelocityIndicatorProps {
  change: number | null;
  isLoading?: boolean;
  className?: string;
}

export default function VelocityIndicator({ 
  change, 
  isLoading = false,
  className 
}: VelocityIndicatorProps) {
  if (isLoading || change === null) {
    return (
      <div className={twMerge('text-xs text-txtfade', className)}>
        <div className="w-12 h-3 bg-third/30 rounded animate-pulse" />
      </div>
    );
  }

  const isPositive = change >= 0;
  const icon = isPositive ? '↗' : '↘';
  
  return (
    <div className={twMerge(
      'flex items-center gap-1 text-xs font-mono',
      isPositive ? 'text-green' : 'text-red',
      className
    )}>
      <span className="text-[0.8em]">{icon}</span>
      <FormatNumber
        nb={Math.abs(change)}
        format="percentage"
        precision={1}
        className="text-xs"
        isDecimalDimmed={false}
      />
      <span className="text-txtfade opacity-75">24h</span>
    </div>
  );
}
