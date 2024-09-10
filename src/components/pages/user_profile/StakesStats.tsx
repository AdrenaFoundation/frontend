import Button from '@/components/common/Button/Button';
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
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Liquid Staked ADX</div>

          <FormatNumber
            nb={liquidStakedADX}
            precision={window.adrena.client.adxToken.decimals}
            placeholder="–"
            suffix=" ADX"
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Locked Staked ADX</div>

          <FormatNumber
            nb={lockedStakedADX}
            precision={window.adrena.client.adxToken.decimals}
            placeholder="–"
            suffix=" ADX"
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Locked Staked ALP</div>

          <FormatNumber
            nb={lockedStakedALP}
            precision={window.adrena.client.alpToken.decimals}
            placeholder="–"
            suffix=" ALP"
          />
        </div>
      </StyledSubSubContainer>

      {lockedStakes?.length ? (
        <div className="mt-2">
          <span className="font-bold opacity-50">
            My{lockedStakes?.length ? ` ${lockedStakes.length}` : ''} Locked
            Stakes
          </span>

          <div className="flex flex-row flex-wrap mt-2 gap-3">
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
