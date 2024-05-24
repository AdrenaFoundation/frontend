import Button from '@/components/common/Button/Button';
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
}: {
  liquidStakedADX: number | null;
  lockedStakedADX: number | null;
  lockedStakedALP: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (lockedStake: LockedStakeExtended) => void;
}) {
  return (
    <StyledContainer title={<h2>Ongoing Stakes</h2>}>
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Liquid Staked ADX</div>

          <FormatNumber
            nb={liquidStakedADX}
            precision={window.adrena.client.adxToken.decimals}
            placeholder="0"
            suffix=" ADX"
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Locked Staked ADX</div>

          <FormatNumber
            nb={lockedStakedADX}
            precision={window.adrena.client.adxToken.decimals}
            placeholder="0"
            suffix=" ADX"
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Locked Staked ALP</div>

          <FormatNumber
            nb={lockedStakedALP}
            precision={window.adrena.client.alpToken.decimals}
            placeholder="0"
            suffix=" ALP"
          />
        </div>
      </StyledSubSubContainer>

      {lockedStakes?.length ? (
        <div className="mt-6">
          <div className="text-sm">My Locked Stakes</div>

          <div className="flex flex-col mt-2 gap-y-2">
            {lockedStakes ? (
              lockedStakes.map((lockedStake, i) => (
                <LockedStakedElement
                  lockedStake={lockedStake}
                  key={i}
                  token={
                    lockedStake.tokenSymbol === 'ALP'
                      ? window.adrena.client.alpToken
                      : window.adrena.client.adxToken
                  }
                  handleRedeem={handleLockedStakeRedeem}
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
