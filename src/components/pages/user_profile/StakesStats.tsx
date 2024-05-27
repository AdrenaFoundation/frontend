import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { LockedStakeExtended } from '@/types';
import { formatNumber } from '@/utils';

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
    <StyledContainer title="Ongoing Stakes">
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Liquid Staked ADX</div>

          <span>
            <FormatNumber
              nb={liquidStakedADX}
              precision={window.adrena.client.adxToken.decimals}
              placeholder="0"
              className="inline"
            />{' '}
            ADX
          </span>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Locked Staked ADX</div>

          <span>
            <FormatNumber
              nb={lockedStakedADX}
              precision={window.adrena.client.adxToken.decimals}
              placeholder="0"
              className="inline"
            />{' '}
            ADX
          </span>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Locked Staked ALP</div>

          <span>
            <FormatNumber
              nb={lockedStakedALP}
              precision={window.adrena.client.alpToken.decimals}
              placeholder="0"
              className="inline"
            />{' '}
            ALP
          </span>
        </div>
      </StyledSubSubContainer>

      {lockedStakes?.length ? (
        <div className="mt-2">
          <span className="font-bold opacity-50">
            My{lockedStakes?.length ? ` ${lockedStakes.length}` : ''} Locked
            Stakes
          </span>

          <div className="flex flex-col mt-2 gap-y-2">
            {lockedStakes ? (
              lockedStakes.map((lockedStake, i) => (
                <LockedStakedElement
                  lockedStake={lockedStake}
                  key={i}
                  token={window.adrena.client.adxToken}
                  handleRedeem={handleLockedStakeRedeem}
                  handleClickOnFinalizeLockedRedeem={
                    handleClickOnFinalizeLockedRedeem
                  }
                />
              ))
            ) : (
              <div className="text-sm m-auto mt-4 mb-4 text-txtfade">
                No Active Locked Stakes
              </div>
            )}
          </div>
        </div>
      ) : null}
    </StyledContainer>
  );
}
