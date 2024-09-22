import Button from '@/components/common/Button/Button';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { LockedStakeExtended } from '@/types';

export default function StakesStats({
  liquidStakedADX,
  lockedStakedADX,
  lockedStakedALP,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnFinalizeLockedRedeem,
}: {
  liquidStakedADX: number | null;
  lockedStakedADX: number | null;
  lockedStakedALP: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
}) {
  return (
    <StyledContainer title="Ongoing Stakes" titleClassName="text-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <NumberDisplay
          title="Liquid Staked ADX"
          nb={liquidStakedADX}
          precision={window.adrena.client.adxToken.decimals}
          placeholder="0 ADX"
          suffix=" ADX"
        />

        <NumberDisplay
          title="Locked Staked ADX"
          nb={lockedStakedADX}
          precision={window.adrena.client.adxToken.decimals}
          placeholder="0 ADX"
          suffix=" ADX"
        />

        <NumberDisplay
          title="Locked Staked ALP"
          nb={lockedStakedALP}
          precision={window.adrena.client.alpToken.decimals}
          placeholder="0 ALP"
          suffix=" ALP"
        />
      </div>

      {lockedStakes?.length ? (
        <div className="mt-2">
          <span className="font-bold opacity-50">
            My{lockedStakes?.length ? ` ${lockedStakes.length}` : ''} Locked
            Stakes
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-3">
            {lockedStakes ? (
              lockedStakes.map((lockedStake, i) => (
                <LockedStakedElement
                  lockedStake={lockedStake}
                  key={i}
                  token={
                    lockedStake.tokenSymbol === 'ADX'
                      ? window.adrena.client.adxToken
                      : window.adrena.client.alpToken
                  }
                  handleRedeem={handleLockedStakeRedeem}
                  handleClickOnFinalizeLockedRedeem={
                    handleClickOnFinalizeLockedRedeem
                  }
                />
              ))
            ) : (
              <div className="text-sm m-auto mt-4 mb-4 text-txtfade">
                No Active Locked Stakes
                <Button
                  title="Stake ADX"
                  href={'/stake'}
                  className="mt-3 mx-auto"
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </StyledContainer>
  );
}
