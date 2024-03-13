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
  const negative = value < 0;

  const formatted = formatNumber(Math.abs(value), precision);

  const [wholePart, fractionalPart] = formatted.split('.');

  const denominationPos = denomination === 'usd' ? 'prefix' : 'suffix';
  const denominationSymbol = denomination === 'usd' ? '$' : denomination;

  return (
    <div className={`flex items-center ${className}`}>
      {negative ? '-' : null}

      {denominationPos === 'prefix' ? (
        <span className="mr-[1px] text-[1em] opacity-50">
          {denominationSymbol}
        </span>
      ) : null}

      {/* Separate whole part and fractional part to display them with different colors*/}
      <div>{wholePart}</div>

      {Number(fractionalPart) ? (
        <div className="text-txtfade text-sm">.{fractionalPart}</div>
      ) : null}

      {denominationPos === 'suffix' ? (
        <span className="ml-1 text-[0.8em] font-semibold opacity-90">
          {denominationSymbol}
        </span>
      ) : null}
    </div>
  );
}
