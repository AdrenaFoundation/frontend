import { formatNumber } from '@/utils';

export default function NumberInfo({
  className,
  value,
  // Use 'usd' or 'eth' or 'sol' ...
  denomination = 'usd',
  precision = 4,
}: {
  className?: string;
  value: number;
  precision?: number;
  denomination?: 'usd' | string;
}) {
  const formatted = formatNumber(value, precision);

  const [wholePart, fractionalPart] = formatted.split('.');

  return (
    <div className={`flex items-center ${className}`}>
      {/* Add denomination as prefix if usd only */}
      {denomination === 'usd' ? (
        <span className="mr-[1px] text-[1em] opacity-50">$</span>
      ) : null}

      {/* Separate whole part and fractional part to display them with different colors*/}
      <div>{wholePart}</div>

      {Number(fractionalPart) ? (
        <div className="text-txtfade text-xs">.{fractionalPart}</div>
      ) : null}

      {/* Add denomination as sufffix when not usd */}
      {denomination !== 'usd' ? (
        <span className="ml-1 text-[0.8em] font-semibold opacity-90">
          {denomination}
        </span>
      ) : null}
    </div>
  );
}
