import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useStakingRanking from '@/hooks/useStakingRanking';
import { formatNumber, getOrdinalSuffix } from '@/utils';

interface StakingRankingProps {
  walletAddress: string | null;
  className?: string;
}

export default function StakingRanking({
  walletAddress,
  className,
}: StakingRankingProps) {
  const { stakingRanking } = useStakingRanking(walletAddress);

  if (!stakingRanking || !stakingRanking.userRank) {
    return (
      <div className={twMerge('flex flex-col', className)}>
        <span className="opacity-50 text-base">My rank</span>
        <span className="text-base sm:text-2xl">-</span>
      </div>
    );
  }

  const { userRank, totalStakers, userVirtualAmount } = stakingRanking;

  // Special logic for top 50 stakers
  let rankDisplay: string;
  if (userRank <= 50) {
    rankDisplay = `${userRank}${getOrdinalSuffix(userRank)}`;
  } else {
    const rankPercentage = ((userRank - 1) / totalStakers) * 100;
    const topPercentage = Math.round(rankPercentage);
    rankDisplay = topPercentage === 0 ? 'Top 1%' : `Top ${topPercentage + 1}%`;
  }

  return (
    <div className={twMerge('flex flex-col', className)}>
      <span className="opacity-50 text-base">My rank</span>
      <Tippy
        content={
          <div className="p-2">
            <div className="text-sm font-semibold mb-2">Ranking Details</div>
            <div className="space-y-1 text-sm">
              <div>
                Position: {formatNumber(userRank, 0, 0)}/
                {formatNumber(totalStakers, 0, 0)}
              </div>
              <div>
                Voting Power:{' '}
                <FormatNumber nb={userVirtualAmount || 0} precision={0} />
              </div>
            </div>
          </div>
        }
        placement="auto"
        interactive={true}
      >
        <span className="text-base sm:text-2xl font-mono cursor-help">{rankDisplay}</span>
      </Tippy>
    </div>
  );
}
