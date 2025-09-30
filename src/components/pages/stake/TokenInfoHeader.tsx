import Image from 'next/image';
import { useState } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import useStakingRanking from '@/hooks/useStakingRanking';
import { formatNumber } from '@/utils';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import StakingRanking from './StakingRanking';

interface TokenInfoHeaderProps {
  totalStakeAmount: number;
  walletAddress: string | null;
}

export default function TokenInfoHeader({
  totalStakeAmount,
  walletAddress,
}: TokenInfoHeaderProps) {
  const [showStakingPower, setShowStakingPower] = useState(false);
  const { stakingRanking, isLoading } = useStakingRanking(walletAddress);
  const isBigStakeAmount = totalStakeAmount > 10000000;

  const handleToggleDisplay = () => {
    setShowStakingPower(!showStakingPower);
  };

  const displayAmount = showStakingPower
    ? stakingRanking?.userVirtualAmount || 0
    : totalStakeAmount;

  const displaySuffix = showStakingPower ? 'vADX' : 'ADX';
  const displayInfo = showStakingPower
    ? undefined
    : isBigStakeAmount
      ? formatNumber(totalStakeAmount, 0, 0)
      : undefined;

  return (
    <div className="p-5 pb-0">
      <div className="flex flex-col w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-md shadow-lg">
        <div className="flex items-center justify-between w-full rounded-t-md p-3 bg-gradient-to-r from-red via-rose-600 to-pink-600">
          <div className="flex items-center gap-6">
            <div
              className="flex flex-col w-32 cursor-pointer"
              onClick={handleToggleDisplay}
            >
              <p className="opacity-50 text-base">
                {showStakingPower ? 'Staking Power' : 'Total staked'}
              </p>
              <div className="text-2xl">
                {isLoading && showStakingPower ? (
                  '-'
                ) : (
                  <FormatNumber
                    nb={displayAmount}
                    minimumFractionDigits={0}
                    precision={isBigStakeAmount ? 2 : 0}
                    precisionIfPriceDecimalsBelow={isBigStakeAmount ? 2 : 0}
                    isAbbreviate={isBigStakeAmount}
                    suffix={displaySuffix}
                    info={displayInfo}
                  />
                )}
              </div>
            </div>

            {/* Staking Ranking */}
            {walletAddress && <StakingRanking walletAddress={walletAddress} />}
          </div>

          <Image
            src={adxLogo}
            width={50}
            height={50}
            className="opacity-10"
            alt="ADX logo"
          />
        </div>

        <div className="p-3">
          <p className="opacity-75 text-base">
            Align with the protocol&apos;s long term success: the longer the
            period, the higher the rewards.
            <br />
            20% of protocol fees are distributed to ADX stakers.
          </p>
        </div>
      </div>
    </div>
  );
}
