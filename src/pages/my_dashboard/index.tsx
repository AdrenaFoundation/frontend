import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import Positions from '@/components/pages/trading/Positions/Positions';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { LockedStakeExtended, PageProps } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  formatNumber,
  formatPriceInfo,
  nativeToUi,
} from '@/utils';

export default function MyDashboard({
  positions,
  userProfile,
  triggerPositionsReload,
  triggerWalletTokenBalancesReload,
  triggerUserProfileReload,
}: PageProps) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const [nickname, setNickname] = useState<string | null>(null);

  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  const [lockedStakes, setLockedStakes] = useState<
    LockedStakeExtended[] | null
  >(null);
  const [liquidStakedADX, setLiquidStakedADX] = useState<number | null>(null);
  const [lockedStakedADX, setLockedStakedADX] = useState<number | null>(null);
  const [lockedStakedALP, setLockedStakedALP] = useState<number | null>(null);

  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const handleLockedStakeRedeem = async (lockedStake: LockedStakeExtended) => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    const stakedTokenMint =
      lockedStake.tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash = await window.adrena.client.removeLockedStake({
        owner,
        resolved: lockedStake.resolved,
        threadId: lockedStake.stakeResolutionThreadId,
        stakedTokenMint,
        lockedStakeIndex: new BN(lockedStake.index),
      });

      addSuccessTxNotification({
        title: 'Successfully Removed Locked Stake',
        txHash,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Locked Stake',
        error,
      });
    }
  };

  useEffect(() => {
    if (!stakingAccounts) {
      return setLockedStakes(null);
    }

    const adxLockedStakes: LockedStakeExtended[] =
      (
        stakingAccounts.ADX?.lockedStakes.sort(
          (a, b) => Number(a.stakeTime) - Number(b.stakeTime),
        ) as LockedStakeExtended[]
      ).map((stake, index) => ({
        ...stake,
        index,
        tokenSymbol: 'ADX',
      })) ?? [];

    const alpLockedStakes: LockedStakeExtended[] =
      (
        stakingAccounts.ALP?.lockedStakes.sort(
          (a, b) => Number(a.stakeTime) - Number(b.stakeTime),
        ) as LockedStakeExtended[]
      ).map((stake, index) => ({
        ...stake,
        index,
        tokenSymbol: 'ALP',
      })) ?? [];

    const liquidStakedADX =
      typeof stakingAccounts.ADX?.liquidStake.amount !== 'undefined'
        ? nativeToUi(
            stakingAccounts.ADX.liquidStake.amount,
            window.adrena.client.adxToken.decimals,
          )
        : null;

    const lockedStakedADX = adxLockedStakes.reduce((acc, stake) => {
      return (
        acc + nativeToUi(stake.amount, window.adrena.client.adxToken.decimals)
      );
    }, 0);

    const lockedStakedALP = alpLockedStakes.reduce((acc, stake) => {
      return (
        acc + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals)
      );
    }, 0);

    setLockedStakes([...adxLockedStakes, ...alpLockedStakes]);
    setLiquidStakedADX(liquidStakedADX);
    setLockedStakedADX(lockedStakedADX);
    setLockedStakedALP(lockedStakedALP);
  }, [stakingAccounts]);

  const initUserProfile = async () => {
    const trimmedNickname = (nickname ?? '').trim();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 24) {
      return addNotification({
        title: 'Cannot create profile',
        type: 'info',
        message: 'Nickname must be between 3 to 24 characters long',
      });
    }

    try {
      const txHash = await window.adrena.client.initUserProfile({
        nickname: trimmedNickname,
      });

      triggerUserProfileReload();

      return addSuccessTxNotification({
        title: 'Successfully Created Profile',
        txHash,
      });
    } catch (error) {
      console.log('error', error);
      return addFailedTxNotification({
        title: 'Error Creating Profile',
        error,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-[50em] self-center">
      {userProfile ? (
        <div className="flex flex-wrap gap-4">
          <StyledContainer
            title={<h3>Trading Stats</h3>}
            className="md:max-w-[23.5em]"
          >
            <StyledSubContainer>
              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Opened Position Count</div>

                <span>
                  {formatNumber(
                    userProfile.longStats.openedPositionCount +
                      userProfile.shortStats.openedPositionCount,
                    1,
                  )}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Liquidated Position Count</div>

                <span>
                  {formatNumber(
                    userProfile.longStats.liquidatedPositionCount +
                      userProfile.shortStats.liquidatedPositionCount,
                    1,
                  )}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Opening Average Leverage</div>

                <span>
                  x
                  {formatNumber(
                    (userProfile.longStats.openingAverageLeverage *
                      userProfile.longStats.openedPositionCount +
                      userProfile.shortStats.openingAverageLeverage *
                        userProfile.shortStats.openedPositionCount) /
                      (userProfile.longStats.openedPositionCount +
                        userProfile.shortStats.openedPositionCount),
                    3,
                  )}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Opening Size</div>

                <span>
                  {formatPriceInfo(
                    userProfile.longStats.openingSizeUsd +
                      userProfile.shortStats.openingSizeUsd,
                    false,
                    3,
                  )}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Profits</div>

                <span>
                  {formatPriceInfo(
                    userProfile.longStats.profitsUsd +
                      userProfile.shortStats.profitsUsd,
                    false,
                    3,
                  )}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Losses</div>

                <span>
                  {formatPriceInfo(
                    userProfile.longStats.lossesUsd +
                      userProfile.shortStats.lossesUsd,
                    false,
                    3,
                  )}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Fees Paid</div>

                <span>
                  {formatPriceInfo(
                    userProfile.longStats.feePaidUsd +
                      userProfile.shortStats.feePaidUsd,
                    false,
                    3,
                  )}
                </span>
              </div>
            </StyledSubContainer>
          </StyledContainer>

          <StyledContainer
            title={<h3>Swap Stats</h3>}
            className="md:max-w-[23.5em]"
          >
            <StyledSubContainer>
              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Swap Count</div>

                <span>{formatNumber(userProfile.swapCount, 1)}</span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Swap Volume</div>

                <span>
                  {formatPriceInfo(userProfile.swapVolumeUsd, false, 3)}
                </span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="text-sm">Fees Paid</div>

                <span>
                  {formatPriceInfo(userProfile.swapFeePaidUsd, false, 3)}
                </span>
              </div>
            </StyledSubContainer>
          </StyledContainer>
        </div>
      ) : null}

      <StyledContainer title={<h3>My Opened Positions</h3>}>
        <Positions
          positions={positions}
          triggerPositionsReload={triggerPositionsReload}
        />
      </StyledContainer>

      <StyledContainer title={<h3>My Stakes</h3>}>
        <StyledSubContainer>
          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Liquid Staked ADX</div>

            <span>
              {liquidStakedADX !== null
                ? formatNumber(
                    liquidStakedADX,
                    window.adrena.client.adxToken.decimals,
                  )
                : '0'}{' '}
              ADX
            </span>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Locked Staked ADX</div>

            <span>
              {lockedStakedADX !== null
                ? formatNumber(
                    lockedStakedADX,
                    window.adrena.client.adxToken.decimals,
                  )
                : '0'}{' '}
              ADX
            </span>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Locked Staked ALP</div>

            <span>
              {lockedStakedALP !== null
                ? formatNumber(
                    lockedStakedALP,
                    window.adrena.client.alpToken.decimals,
                  )
                : '0'}{' '}
              ADX
            </span>
          </div>
        </StyledSubContainer>

        {lockedStakes?.length ? (
          <div className="mt-6">
            <div className="text-sm">My Locked Stakes</div>

            <div className="flex flex-col mt-2 gap-y-2">
              {lockedStakes ? (
                lockedStakes.map((lockedStake, i) => (
                  <LockedStakedElement
                    lockedStake={lockedStake}
                    key={i}
                    token={window.adrena.client.adxToken}
                    handleRedeem={handleLockedStakeRedeem}
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

      {/* TODO: Add My Vestings */}

      {userProfile === false ? (
        <StyledContainer
          title={<h3>Create a profile and get trading and swap stats.</h3>}
          className="items-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="font-specialmonster text-xl mt-10 ">
              My Nickname
            </div>

            <InputString
              value={nickname ?? ''}
              onChange={setNickname}
              placeholder="The Great Trader"
              className="mt-4 text-center w-[20em] p-4 bg-black border border-gray-200 rounded-xl"
              inputFontSize="1.1em"
              maxLength={24}
            />
          </div>

          <Button
            disabled={
              nickname ? !(nickname.length >= 3 && nickname.length <= 24) : true
            }
            className="mt-4 text-sm w-[30em]"
            size="lg"
            title="Create"
            onClick={() => initUserProfile()}
          />
        </StyledContainer>
      ) : null}
    </div>
  );
}
