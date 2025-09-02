import FormatNumber from '@/components/Number/FormatNumber';
import { twMerge } from 'tailwind-merge';

interface VelocityIndicatorProps {
  change: number | null;
  isLoading?: boolean;
  className?: string;
  isCurrency?: boolean;
  period?: '24h' | '7d';
}

export default function VelocityIndicator({
  change,
  isLoading = false,
  className,
  isCurrency = false,
  period = '24h',
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
  const sign = isPositive ? '+' : '-';

  return (
    <div
      className={twMerge(
        'flex items-center gap-1 text-xs font-mono',
        isPositive ? 'text-green-400' : 'text-brightred',
        className,
      )}
    >
      {isCurrency ? (
        <>
          <span className="text-xs">{sign}$</span>
          <FormatNumber
            nb={Math.abs(change)}
            format="number"
            precision={0}
            className="text-xs"
            isDecimalDimmed={false}
          />
        </>
      ) : (
        <>
          <span className="text-xs">{sign}</span>
          <FormatNumber
            nb={Math.abs(change)}
            format="percentage"
            precision={1}
            className="text-xs"
            isDecimalDimmed={false}
          />
        </>
      )}
      <span className="text-txtfade opacity-75">{period}</span>
      <span className="text-[0.8em] ml-auto">{icon}</span>{' '}
      {/* Arrow on the right */}
    </div>
  );
}
