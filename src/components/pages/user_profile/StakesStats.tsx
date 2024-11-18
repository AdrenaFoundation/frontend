import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { LockedStakeExtended } from '@/types';

import LockedStakes from '../stake/LockedStakes';

export default function StakesStats({
  liquidStakedADX,
  lockedStakedADX,
  lockedStakedALP,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
  className,
}: {
  liquidStakedADX: number | null;
  lockedStakedADX: number | null;
  lockedStakedALP: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
  className?: string;
}) {
  const adxLockedStakes = lockedStakes?.filter(x => x.tokenSymbol === 'ADX').sort((a, b) => a.lockDuration.toNumber() - b.lockDuration.toNumber());
  const alpLockedStakes = lockedStakes?.filter(x => x.tokenSymbol === 'ALP').sort((a, b) => a.lockDuration.toNumber() - b.lockDuration.toNumber());

  return (
    <div className={twMerge('flex flex-col w-full items-center justify-center', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <NumberDisplay
          title="Liquid Staked ADX"
          nb={liquidStakedADX}
          precision={2}
          placeholder="0 ADX"
          suffix="ADX"
          className='border-none p-1'
          titleClassName='text-xs sm:text-xs'
        />

        <NumberDisplay
          title="Locked Staked ADX"
          nb={lockedStakedADX}
          precision={2}
          placeholder="0 ADX"
          suffix="ADX"
          className='border-none p-1'
          titleClassName='text-xs sm:text-xs'
        />

        <NumberDisplay
          title="Locked Staked ALP"
          nb={lockedStakedALP}
          precision={2}
          placeholder="0 ALP"
          suffix="ALP"
          className='border-none p-1'
          titleClassName='text-xs sm:text-xs'
        />
      </div>

      {adxLockedStakes?.length || alpLockedStakes?.length ? (
        <>
          <span className="font-bold opacity-50">
            My{adxLockedStakes?.length || alpLockedStakes?.length ? ` ${(adxLockedStakes?.length ?? 0) + (alpLockedStakes?.length ?? 0)}` : ''} Locked
            Stakes
          </span>

          {adxLockedStakes ? <LockedStakes
            lockedStakes={adxLockedStakes}
            className='gap-3 mt-4'
            handleRedeem={handleLockedStakeRedeem}
            handleClickOnFinalizeLockedRedeem={
              handleClickOnFinalizeLockedRedeem
            }
            handleClickOnUpdateLockedStake={
              handleClickOnUpdateLockedStake
            }
          /> : null}

          {alpLockedStakes ? <LockedStakes
            lockedStakes={alpLockedStakes}
            className='gap-3 mt-4'
            handleRedeem={handleLockedStakeRedeem}
            handleClickOnFinalizeLockedRedeem={
              handleClickOnFinalizeLockedRedeem
            }
            handleClickOnUpdateLockedStake={
              handleClickOnUpdateLockedStake
            }
          /> : null}
        </>
      ) : null}
    </div>
  );
}
