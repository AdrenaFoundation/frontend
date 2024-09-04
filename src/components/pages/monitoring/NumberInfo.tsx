import { twMerge } from 'tailwind-merge';

import { formatNumber } from '@/utils';

export default function NumberInfo({
  className,
  wholePartClassName,
  fractionalClassName,
  denominationClassName,
  value,
  // Use 'usd' or 'eth' or 'sol' ...
  denomination = 'usd',
  precision = 4,
}: {
  className?: string;
  wholePartClassName?: string;
  fractionalClassName?: string;
  denominationClassName?: string;
  value: number;
  precision?: number;
  denomination?: 'usd' | string;
}) {
  const negative = value < 0;

  const formatted = formatNumber(Math.abs(value), precision);

  const [wholePart, fractionalPart] = formatted.split('.');

  const denominationPos = denomination === 'usd' ? 'prefix' : 'suffix';
  const denominationSymbol = denomination === 'usd' ? '$' : denomination;

  return (
    <div className={`flex items-end ${className ?? ''}`}>
      <div className="flex items-center">
        {negative ? '-' : null}

        {denominationPos === 'prefix' ? (
          <span
            className={twMerge(
              'mr-[1px] text-sm opacity-50',
              denominationClassName,
            )}
          >
            {denominationSymbol}
          </span>
        ) : null}

        {/* Separate whole part and fractional part to display them with different colors*/}
        <div className={twMerge('font-mono text-sm', wholePartClassName)}>
          {wholePart}
        </div>
      </div>

      {Number(fractionalPart) ? (
        <div
          className={twMerge(
            'text-txtfade text-xs font-mono',
            fractionalClassName,
          )}
        >
          .{fractionalPart}
        </div>
      ) : null}

      {denominationPos === 'suffix' ? (
        <span
          className={twMerge(
            'ml-1 text-[0.8em] font-semibold opacity-90',
            denominationClassName,
          )}
        >
          {denominationSymbol}
        </span>
      ) : null}
    </div>
  );
}
