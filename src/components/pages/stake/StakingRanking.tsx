import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useStakingRanking from '@/hooks/staking/useStakingRanking';
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

  const { userRank, totalStakers, userVirtualAmount, userAboveAmount } =
    stakingRanking;

  // Special logic for top 50 stakers
  let rankDisplay: React.ReactNode;
  if (userRank <= 50) {
    rankDisplay = (
      <span className="font-mono text-base sm:text-2xl">
        {userRank}
        {getOrdinalSuffix(userRank)}
      </span>
    );
  } else {
    const rankPercentage = ((userRank - 1) / totalStakers) * 100;
    const topPercentage = Math.round(rankPercentage);
    // "Top" is not mono, number is mono
    rankDisplay =
      topPercentage === 0 ? (
        <>
          <span className="text-base sm:text-2xl">Top </span>
          <span className="font-mono text-base sm:text-2xl">1%</span>
        </>
      ) : (
        <>
          <span className="text-base sm:text-2xl">Top </span>
          <span className="font-mono text-base sm:text-2xl">
            {topPercentage + 1}%
          </span>
        </>
      );
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
              {userAboveAmount && userVirtualAmount && (
                <div className="text-txtfade mt-2 pt-2 border-t border-white/10">
                  {formatNumber(userAboveAmount - userVirtualAmount, 0, 0)} more
                  rev. weight to climb!
                </div>
              )}
            </div>
          </div>
        }
        placement="auto"
        interactive={true}
      >
        <span className="text-base sm:text-2xl cursor-help">{rankDisplay}</span>
      </Tippy>
    </div>
  );
}
