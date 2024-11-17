import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
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
}) {
  const adxLockedStakes = lockedStakes?.filter(x => x.tokenSymbol === 'ADX').sort((a, b) => a.lockDuration.toNumber() - b.lockDuration.toNumber());
  const alpLockedStakes = lockedStakes?.filter(x => x.tokenSymbol === 'ALP').sort((a, b) => a.lockDuration.toNumber() - b.lockDuration.toNumber());

  return (
    <StyledContainer title={<div className='flex gap-2'>Stakes <LiveIcon /></div>} titleClassName="text-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <NumberDisplay
          title="Liquid Staked ADX"
          nb={liquidStakedADX}
          precision={2}
          placeholder="0 ADX"
          suffix="ADX"
        />

        <NumberDisplay
          title="Locked Staked ADX"
          nb={lockedStakedADX}
          precision={2}
          placeholder="0 ADX"
          suffix="ADX"
        />

        <NumberDisplay
          title="Locked Staked ALP"
          nb={lockedStakedALP}
          precision={2}
          placeholder="0 ALP"
          suffix="ALP"
        />
      </div>

      {adxLockedStakes?.length || alpLockedStakes?.length ? (
        <div className="mt-2">
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
        </div>
      ) : null}
    </StyledContainer>
  );
}
