import { twMerge } from 'tailwind-merge';

import { formatNumber } from '@/utils';

export default function Score({
  className,
  score,

  // From 1 (worst) to 5 (best)
  scoreTier,
}: {
  className?: string;
  score: number;
  scoreTier?: number;
}) {
  const tier = scoreTier
    ? scoreTier % 5
    : // Default tier scoring
      (() => {
        if (score < 50) return 1;
        if (score < 75) return 2;
        if (score < 85) return 3;
        if (score < 90) return 4;
        return 5;
      })();

  const color = ['#C13332', '#FF9400', '#FFEF54', '#526DFF', '#46A34E'][tier];

  return (
    <div
      className={twMerge('text-9xl font-special', className)}
      style={{
        color,
      }}
    >
      {formatNumber(score, 2)}
    </div>
  );
}
