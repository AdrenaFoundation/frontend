import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { Staking } from '@/types';
import {
  formatNumber,
  formatPriceInfo,
  getNextStakingRoundStartTime,
  nativeToUi,
} from '@/utils';

import RemainingTimeToDate from '../RemainingTimeToDate';

export default function StakingView({
  alpStakingAccount,
  adxStakingAccount,
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  alpStakingCurrentRoundRewards: number | null;
  adxStakingCurrentRoundRewards: number | null;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-6 w-full">
      <StyledContainer
        title="LOCKED TOKENS"
        subTitle="Tokens locked in the staking program."
      >
        <StyledSubContainer>
          <h2>LOCKED ALP</h2>

          <StyledSubSubContainer className="mt-2">
            <h2>
              {formatNumber(
                nativeToUi(
                  alpStakingAccount.nbLockedTokens,
                  alpStakingAccount.stakedTokenDecimals,
                ),
                2,
              )}
            </h2>
          </StyledSubSubContainer>
        </StyledSubContainer>

        <StyledSubContainer>
          <h2>LOCKED ADX</h2>

          <StyledSubSubContainer className="mt-2">
            <h2>
              {formatNumber(
                nativeToUi(
                  adxStakingAccount.nbLockedTokens,
                  adxStakingAccount.stakedTokenDecimals,
                ),
                2,
              )}
            </h2>
          </StyledSubSubContainer>
        </StyledSubContainer>
      </StyledContainer>

      <StyledContainer
        title="STAKING REWARD VAULTS"
        subTitle="Rewards accruing to be redistributed to stakers at the end of the staking round."
      >
        <StyledSubContainer>
          <h2>ALP TOKEN STAKING</h2>

          <StyledSubSubContainer className="mt-2">
            <h2>
              {alpStakingCurrentRoundRewards !== null
                ? formatPriceInfo(alpStakingCurrentRoundRewards)
                : '-'}
            </h2>
          </StyledSubSubContainer>
        </StyledSubContainer>

        <StyledSubContainer>
          <h2>ADX TOKEN STAKING</h2>

          <StyledSubSubContainer className="mt-2">
            <h2>
              {adxStakingCurrentRoundRewards !== null
                ? formatPriceInfo(adxStakingCurrentRoundRewards)
                : '-'}
            </h2>
          </StyledSubSubContainer>
        </StyledSubContainer>
      </StyledContainer>

      <StyledContainer
        title="STAKING REWARD WAITING TO BE CLAIMED"
        subTitle="Rewards from past rounds attributed to users waiting to be claimed."
      >
        <StyledSubContainer>
          <h2>ALP TOKEN STAKING</h2>

          <StyledSubSubContainer className="mt-2 flex-col">
            <h2>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                    nativeToUi(
                      alpStakingAccount.resolvedRewardTokenAmount,
                      alpStakingAccount.rewardTokenDecimals,
                    ),
                    2,
                  )
                : '-'}{' '}
              USDC
            </h2>

            <h2>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                    nativeToUi(
                      alpStakingAccount.resolvedLmRewardTokenAmount,
                      window.adrena.client.adxToken.decimals,
                    ),
                    2,
                  )
                : '-'}{' '}
              ADX
            </h2>
          </StyledSubSubContainer>
        </StyledSubContainer>

        <StyledSubContainer>
          <h2>ADX TOKEN STAKING</h2>

          <StyledSubSubContainer className="mt-2 flex-col">
            <h2>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                    nativeToUi(
                      adxStakingAccount.resolvedRewardTokenAmount,
                      adxStakingAccount.rewardTokenDecimals,
                    ),
                    2,
                  )
                : '-'}{' '}
              USDC
            </h2>

            <h2>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                    nativeToUi(
                      adxStakingAccount.resolvedLmRewardTokenAmount,
                      window.adrena.client.adxToken.decimals,
                    ),
                    2,
                  )
                : '-'}{' '}
              ADX
            </h2>
          </StyledSubSubContainer>
        </StyledSubContainer>
      </StyledContainer>

      <StyledContainer title="CURRENT STAKING ROUND TIME">
        <StyledSubContainer>
          <h2>ALP TOKEN STAKING ROUND ENDS IN</h2>

          <StyledSubSubContainer className="mt-2">
            <RemainingTimeToDate
              timestamp={
                getNextStakingRoundStartTime(
                  alpStakingAccount.currentStakingRound.startTime,
                ).getTime() / 1000
              }
              classNameTime="text-xl"
              tippyText="The call is overdue, please check the thread."
            />
          </StyledSubSubContainer>
        </StyledSubContainer>

        <StyledSubContainer>
          <h2>ADX TOKEN STAKING ROUND ENDS IN</h2>

          <StyledSubSubContainer className="mt-2">
            <RemainingTimeToDate
              timestamp={
                getNextStakingRoundStartTime(
                  adxStakingAccount.currentStakingRound.startTime,
                ).getTime() / 1000
              }
              classNameTime="text-xl"
              tippyText="The call is overdue, please check the thread."
            />
          </StyledSubSubContainer>
        </StyledSubContainer>
      </StyledContainer>
    </div>
  );
}
