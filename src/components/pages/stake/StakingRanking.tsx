import { twMerge } from 'tailwind-merge';

import useStakingRanking from '@/hooks/useStakingRanking';
import { formatNumber } from '@/utils';

interface StakingRankingProps {
  walletAddress: string | null;
  className?: string;
}

export default function StakingRanking({
  walletAddress,
  className,
}: StakingRankingProps) {
  const { stakingRanking, isLoading } = useStakingRanking(walletAddress);

  return (
    <div className={twMerge('flex flex-col', className)}>
      <p className="opacity-50 text-base">My rank</p>
      <div>
        {isLoading || !stakingRanking?.userRank ? (
          <span className="text-2xl font-mono">-</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono">
              {(() => {
                const { userRank, totalStakers } = stakingRanking;
                const rankPercentage = ((userRank - 1) / totalStakers) * 100;
                const topPercentage = Math.round(rankPercentage);
                return topPercentage === 0
                  ? 'Top 1%'
                  : `Top ${topPercentage + 1}%`;
              })()}
            </span>
            <span className="text-sm opacity-75 font-mono">
              {isLoading || !stakingRanking?.userRank
                ? '-/-'
                : `(${formatNumber(stakingRanking.userRank, 0, 0)}/${formatNumber(stakingRanking.totalStakers, 0, 0)})`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
