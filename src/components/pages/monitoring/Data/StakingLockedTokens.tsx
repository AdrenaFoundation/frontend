import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { Staking } from '@/types';
import { nativeToUi } from '@/utils';

export default function StakingLockedTokens({
  alpStakingAccount,
  adxStakingAccount,
  titleClassName,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  titleClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>
          Locked Stakes Amounts
        </p>
        <p className="text-xs opacity-50">
          Tokens locked in the staking program.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row">
        <NumberDisplay
          title="Locked ALP"
          nb={nativeToUi(
            alpStakingAccount.nbLockedTokens,
            alpStakingAccount.stakedTokenDecimals,
          )}
          precision={0}
          className='border-0'
        />

        <NumberDisplay
          title="Locked ADX"
          nb={nativeToUi(
            adxStakingAccount.nbLockedTokens,
            adxStakingAccount.stakedTokenDecimals,
          )}
          precision={0}
          className='border-l-0 border-r-0 border-b-0 border-t sm:border-t-0 sm:border-l'
        />
      </div>
    </div>
  );
}
