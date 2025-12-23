import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>
          {t('monitoring.lockedStakesAmounts')}
        </p>
        <p className="text-xs opacity-50">
          {t('monitoring.tokensLockedInStakingProgram')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row">
        <NumberDisplay
          title={t('monitoring.lockedAlp')}
          nb={nativeToUi(
            alpStakingAccount.nbLockedTokens,
            alpStakingAccount.stakedTokenDecimals,
          )}
          precision={0}
          className='border-0'
        />

        <NumberDisplay
          title={t('monitoring.lockedAdx')}
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
