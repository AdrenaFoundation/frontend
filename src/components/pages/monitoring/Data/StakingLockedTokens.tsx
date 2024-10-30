import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function StakingLockedTokens({
  alpStakingAccount,
  adxStakingAccount,
  titleClassName,
  bodyClassName,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>
          Locked Stakes amounts
        </p>
        <p className="text-base opacity-50">
          Tokens locked in the staking program.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className='flex-1 p-5'>
          <div className={titleClassName}>Locked ALP</div>

          <div className={twMerge('m-auto', bodyClassName)}>
            {formatNumber(
              nativeToUi(
                alpStakingAccount.nbLockedTokens,
                alpStakingAccount.stakedTokenDecimals,
              ),
              0,
            )}
          </div>
        </div>

        <div className='flex-1 p-5 border-t sm:border-t-0 sm:border-l'>
          <div className={titleClassName}>Locked ADX</div>

          <div className={twMerge('m-auto', bodyClassName)}>
            {formatNumber(
              nativeToUi(
                adxStakingAccount.nbLockedTokens,
                adxStakingAccount.stakedTokenDecimals,
              ),
              0,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
