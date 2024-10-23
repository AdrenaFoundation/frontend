import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Loader from '@/components/Loader/Loader';
import ADXStakeToken from '@/components/pages/stake/ADXStakeToken';
import ALPStakeToken from '@/components/pages/stake/ALPStakeToken';
import FinalizeLockedStakeRedeem from '@/components/pages/stake/FinalizeLockedStakeRedeem';
import StakeLanding from '@/components/pages/stake/StakeLanding';
import StakeOverview from '@/components/pages/stake/StakeOverview';
import StakeRedeem from '@/components/pages/stake/StakeRedeem';
import UpgradeLockedStake from '@/components/pages/stake/UpgradeLockedStake';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useStakingAccount from '@/hooks/useStakingAccount';
import useStakingAccountRewardsAccumulated from '@/hooks/useStakingAccountRewardsAccumulated';
import { useStakingClaimableRewards } from '@/hooks/useStakingClaimableRewards';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  LockedStakeExtended,
  PageProps,
} from '@/types';
import {
  addNotification,
  getAdxLockedStakes,
  getAlpLockedStakes,
  nativeToUi,
} from '@/utils';
import { getNextStakingRoundStartTime } from '@/utils';

export type ADXTokenDetails = {
  balance: number | null;
  totalLiquidStaked: number | null;
  totalStaked: number | null;
  totalLiquidStakedUSD: number | null;
  totalLockedStake: number | null;
  totalRedeemableStake: number | null;
  totalLockedStakeUSD: number | null;
  totalRedeemableStakeUSD: number | null;
};

export type ALPTokenDetails = {
  balance: number | null;
  totalLockedStake: number | null;
  totalRedeemableStake: number | null;
  totalLockedStakeUSD: number | null;
  totalRedeemableStakeUSD: number | null;
};

export const DEFAULT_LOCKED_STAKE_LOCK_DURATION = 180;
export const LIQUID_STAKE_LOCK_DURATION = 0;

export default function Stake({
  connected,
  triggerWalletTokenBalancesReload,
}: PageProps) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const alpPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;

  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  const [adxDetails, setAdxDetails] = useState<ADXTokenDetails>({
    balance: null,
    totalLiquidStaked: null,
    totalLockedStake: null,
    totalStaked: null,
    totalRedeemableStake: null,
    totalLiquidStakedUSD: null,
    totalLockedStakeUSD: null,
    totalRedeemableStakeUSD: null,
  });

  const [alpDetails, setAlpDetails] = useState<ALPTokenDetails>({
    balance: null,
    totalLockedStake: null,
    totalRedeemableStake: null,
    totalLockedStakeUSD: null,
    totalRedeemableStakeUSD: null,
  });

  const [activeStakingToken, setActiveStakingToken] = useState<
    'ADX' | 'ALP' | null
  >(null);

  const [finalizeLockedStakeRedeem, setFinalizeLockedStakeRedeem] =
    useState<boolean>(false);
  const [upgradeLockedStake, setUpgradeLockedStake] = useState<boolean>(false);
  const [lockedStake, setLockedStake] = useState<LockedStakeExtended | null>(
    null,
  );

  const [activeRedeemLiquidADX, setActiveRedeemLiquidADX] =
    useState<boolean>(false);

  const [lockPeriod, setLockPeriod] = useState<AdxLockPeriod | AlpLockPeriod>(
    DEFAULT_LOCKED_STAKE_LOCK_DURATION,
  );

  const [amount, setAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isStakeLoaded, setIsStakeLoaded] = useState<boolean>(false);

  const adxBalance: number | null =
    walletTokenBalances?.[window.adrena.client.adxToken.symbol] ?? null;

  const alpBalance: number | null =
    walletTokenBalances?.[window.adrena.client.alpToken.symbol] ?? null;

  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const adxLockedStakes: LockedStakeExtended[] | null =
    getAdxLockedStakes(stakingAccounts);

  const alpLockedStakes: LockedStakeExtended[] | null =
    getAlpLockedStakes(stakingAccounts);

  const stakeAmount = async () => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    if (!amount) {
      addNotification({
        type: 'info',
        title: 'Please enter an amount',
      });

      return;
    }

    if (!activeStakingToken) return;

    const stakedTokenMint =
      activeStakingToken === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    const userStaking = await window.adrena.client.getUserStakingAccount({
      owner,
      stakedTokenMint,
    });

    if (!userStaking) {
      const notification = MultiStepNotification.newForRegularTransaction(
        `Stake ${activeStakingToken} (1/2)`,
      ).fire();

      try {
        await window.adrena.client.initUserStaking({
          owner: owner,
          stakedTokenMint,
          threadId: new BN(Date.now()),
          notification,
        });
      } catch (error) {
        console.error('error', error);
        return;
      }
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      !userStaking
        ? `Stake ${activeStakingToken} (2/2)`
        : `Stake ${activeStakingToken}`,
    ).fire();

    try {
      lockPeriod === 0
        ? await window.adrena.client.addLiquidStake({
          owner,
          amount,
          stakedTokenMint,
          notification,
        })
        : await window.adrena.client.addLockedStake({
          owner,
          amount,
          lockedDays: Number(lockPeriod) as AdxLockPeriod | AlpLockPeriod,
          stakedTokenMint,
          notification,
        });

      setAmount(null);
      setLockPeriod(DEFAULT_LOCKED_STAKE_LOCK_DURATION);
      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setActiveStakingToken(null);
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleRemoveADXLiquidStake = async (amount: number) => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    if (!activeRedeemLiquidADX) return;

    const notification =
      MultiStepNotification.newForRegularTransaction('Unstake').fire();

    const stakedTokenMint = window.adrena.client.adxToken.mint;

    try {
      await window.adrena.client.removeLiquidStake({
        owner,
        amount,
        stakedTokenMint,
        notification,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setActiveRedeemLiquidADX(false);
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleUpgradeLockedStake = async ({
    lockedStake,
    upgradedDuration: updatedDuration,
    additionalAmount,
  }: {
    lockedStake: LockedStakeExtended;
    upgradedDuration?: AdxLockPeriod | AlpLockPeriod;
    additionalAmount?: number;
  }) => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      'Upgrade Locked Stake',
    ).fire();

    try {
      await window.adrena.client.upgradeLockedStake({
        lockedStake,
        updatedDuration,
        additionalAmount,
        notification,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setUpgradeLockedStake(false);
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleLockedStakeRedeem = async (
    lockedStake: LockedStakeExtended,
    earlyExit = false,
  ) => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    if (earlyExit && !finalizeLockedStakeRedeem) return;

    const notification =
      MultiStepNotification.newForRegularTransaction('Unstake').fire();

    const stakedTokenMint =
      lockedStake.tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      await window.adrena.client.removeLockedStake({
        owner,
        resolved: !!lockedStake.resolved,
        threadId: lockedStake.stakeResolutionThreadId,
        stakedTokenMint,
        lockedStakeIndex: new BN(lockedStake.index),
        earlyExit,
        notification,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      if (earlyExit) {
        setLockedStake(null);
        setFinalizeLockedStakeRedeem(false);
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleClaimRewards = async (tokenSymbol: 'ADX' | 'ALP') => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    const stakedTokenMint =
      tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    const notification = MultiStepNotification.newForRegularTransaction(
      'Claim Stakes Rewards',
    ).fire();

    try {
      await window.adrena.client.claimStakes({
        owner,
        stakedTokenMint,
        notification,
      });

      triggerWalletTokenBalancesReload();
      // Reset rewards in the ui until next fetch
      if (tokenSymbol === 'ADX') {
        adxRewards.pendingUsdcRewards = 0;
        adxRewards.pendingAdxRewards = 0;
        adxRewards.pendingGenesisAdxRewards = 0;
        fetchAdxRewards();
      } else {
        alpRewards.pendingUsdcRewards = 0;
        alpRewards.pendingAdxRewards = 0;
        alpRewards.pendingGenesisAdxRewards = 0;
        fetchAlpRewards();
      }
      triggerWalletStakingAccountsReload();
    } catch (error) {
      console.error('error', error);
    }
  };

  const getTotalADXLiquidStaked = useCallback(() => {
    if (!stakingAccounts || !stakingAccounts.ADX) return 0;

    return nativeToUi(
      stakingAccounts.ADX.liquidStake.amount,
      window.adrena.client.adxToken.decimals,
    );
  }, [stakingAccounts]);

  const getTotalLockedStake = useCallback(
    (token: 'ADX' | 'ALP') => {
      if (!stakingAccounts) return 0;

      const tokenObj = stakingAccounts[token];
      if (!tokenObj) return 0;

      const decimals =
        token === 'ALP'
          ? window.adrena.client.alpToken.decimals
          : window.adrena.client.adxToken.decimals;

      return tokenObj.lockedStakes.reduce(
        (acc, stake) => acc + nativeToUi(stake.amount, decimals),
        0,
      );
    },
    [stakingAccounts],
  );

  const getTotalStaked = useCallback(
    (token: 'ADX' | 'ALP') => {
      if (token === 'ADX') {
        return getTotalADXLiquidStaked() + getTotalLockedStake(token);
      }

      return getTotalLockedStake(token);
    },
    [getTotalADXLiquidStaked, getTotalLockedStake],
  );

  const getTotalRedeemableLockedStake = useCallback(
    (token: 'ADX' | 'ALP') => {
      if (!stakingAccounts) return 0;

      const tokenObj = stakingAccounts[token];
      if (!tokenObj) return 0;

      const decimals =
        token === 'ALP'
          ? window.adrena.client.alpToken.decimals
          : window.adrena.client.adxToken.decimals;

      return (
        tokenObj.lockedStakes.reduce((acc, stake) => {
          const daysRemaining = stake.endTime.toNumber() * 1000 - Date.now();

          if (daysRemaining <= 0) {
            return acc + nativeToUi(stake.amount, decimals);
          }

          return acc;
        }, 0) ?? 0
      );
    },
    [stakingAccounts],
  );

  const getTotalRedeemableStake = useCallback(
    (token: 'ADX' | 'ALP') => {
      if (token === 'ADX') {
        return getTotalADXLiquidStaked() + getTotalRedeemableLockedStake(token);
      }

      return getTotalRedeemableLockedStake(token);
    },
    [getTotalADXLiquidStaked, getTotalRedeemableLockedStake],
  );

  const onStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || activeStakingToken === null) {
      setAmount(null);
      setErrorMessage('');
      return;
    }
    const balance =
      activeStakingToken === 'ALP' ? alpBalance ?? 0 : adxBalance ?? 0;

    const minAmount =
      activeStakingToken === 'ALP'
        ? nativeToUi(new BN(1), window.adrena.client.alpToken.decimals)
        : nativeToUi(new BN(1), window.adrena.client.adxToken.decimals);

    if (Number(value) > balance) {
      setErrorMessage('Insufficient balance');
    } else if (Number(value) < minAmount) {
      setErrorMessage(
        `Minimum stake amount is ${minAmount} ${activeStakingToken}`,
      );
    } else {
      setErrorMessage('');
    }

    setAmount(Number(value));
  };

  const { stakingAccount: alpStakingAccount } = useStakingAccount(
    window.adrena.client.lpTokenMint,
  );
  const { stakingAccount: adxStakingAccount } = useStakingAccount(
    window.adrena.client.lmTokenMint,
  );

  const nextStakingRoundTimeAlp = alpStakingAccount
    ? getNextStakingRoundStartTime(
      alpStakingAccount.currentStakingRound.startTime,
    ).getTime()
    : null;

  const nextStakingRoundTimeAdx = adxStakingAccount
    ? getNextStakingRoundStartTime(
      adxStakingAccount.currentStakingRound.startTime,
    ).getTime()
    : null;

  // The rewards pending for the user
  const { rewards: adxRewards, fetchRewards: fetchAdxRewards } =
    useStakingClaimableRewards('ADX');
  const { rewards: alpRewards, fetchRewards: fetchAlpRewards } =
    useStakingClaimableRewards('ALP');

  // The rewards pending collection in the current round
  const alpStakingCurrentRoundRewards = useStakingAccountRewardsAccumulated(
    window.adrena.client.lpTokenMint,
  );
  const adxStakingCurrentRoundRewards = useStakingAccountRewardsAccumulated(
    window.adrena.client.lmTokenMint,
  );

  useEffect(() => {
    setAdxDetails({
      balance: adxBalance,
      totalLiquidStaked: wallet ? getTotalADXLiquidStaked() : null,
      totalLiquidStakedUSD:
        wallet && adxPrice ? adxPrice * getTotalADXLiquidStaked() : null,
      totalLockedStake: wallet ? getTotalLockedStake('ADX') : null,

      totalLockedStakeUSD:
        wallet && adxPrice ? adxPrice * getTotalLockedStake('ADX') : null,
      totalStaked: wallet ? getTotalStaked('ADX') : null,
      totalRedeemableStake: wallet ? getTotalRedeemableStake('ADX') : null,
      totalRedeemableStakeUSD:
        wallet && adxPrice ? adxPrice * getTotalRedeemableStake('ADX') : null,
    });

    setAlpDetails({
      balance: alpBalance,
      totalLockedStake: wallet ? getTotalLockedStake('ALP') : null,
      totalLockedStakeUSD:
        wallet && alpPrice ? alpPrice * getTotalLockedStake('ALP') : null,
      totalRedeemableStake: wallet ? getTotalRedeemableStake('ALP') : null,
      totalRedeemableStakeUSD:
        wallet && alpPrice ? alpPrice * getTotalRedeemableStake('ALP') : null,
    });

    setTimeout(() => {
      setIsStakeLoaded(true);
    }, 100);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    adxBalance,
    adxPrice,
    alpBalance,
    alpPrice,
    getTotalADXLiquidStaked,
    getTotalLockedStake,
    getTotalRedeemableStake,
    getTotalStaked,
    wallet,
  ]);

  const modal = activeStakingToken && (
    <Modal
      title={`Stake ${activeStakingToken}`}
      close={() => {
        setAmount(null);
        setLockPeriod(DEFAULT_LOCKED_STAKE_LOCK_DURATION);
        setActiveStakingToken(null);
      }}
    >
      {activeStakingToken === 'ADX' ? (
        <ADXStakeToken
          amount={amount}
          setAmount={setAmount}
          onStakeAmountChange={onStakeAmountChange}
          errorMessage={errorMessage}
          stakeAmount={stakeAmount}
          lockPeriod={lockPeriod as AdxLockPeriod}
          setLockPeriod={(lockPeriod: AdxLockPeriod) =>
            setLockPeriod(lockPeriod)
          }
          balance={adxBalance}
        />
      ) : (
        <ALPStakeToken
          amount={amount}
          setAmount={setAmount}
          onStakeAmountChange={onStakeAmountChange}
          errorMessage={errorMessage}
          stakeAmount={stakeAmount}
          lockPeriod={lockPeriod as AlpLockPeriod}
          setLockPeriod={(lockPeriod: AlpLockPeriod) =>
            setLockPeriod(lockPeriod)
          }
          balance={alpBalance}
        />
      )}
    </Modal>
  );

  if (!isStakeLoaded) {
    return (
      <AnimatePresence>
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="m-auto"
        >
          <Loader />
        </motion.div>
      </AnimatePresence>
    );
  }

  return !connected ||
    (adxDetails.totalStaked === 0 && alpDetails.totalLockedStake === 0) ? (
    <>
      {modal}
      <StakeLanding
        connected={connected}
        handleClickOnStakeMoreALP={() => {
          setLockPeriod(180);
          setActiveStakingToken('ALP');
        }}
        handleClickOnStakeMoreADX={() => {
          setLockPeriod(180);
          setActiveStakingToken('ADX');
        }}
      />
    </>
  ) : (
    <>
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-50 -z-0">
        <RiveAnimation
          animation="mid-monster"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          className="absolute top-0 left-[-10vh] h-[85vh] w-[110vh] scale-x-[-1]"
          imageClassName="absolute w-full max-w-[1200px] top-0 left-0 scale-x-[-1]"
        />

        <RiveAnimation
          animation="blob-bg"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.BottomLeft,
            })
          }
          className="absolute hidden md:block bottom-0 right-[-20vh] h-[50vh] w-[80vh] scale-y-[-1] -z-10"
          imageClassName="absolute w-full max-w-[500px] bottom-0 right-0 scale-y-[-1]"
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 p-4 justify-center z-10 md:h-full max-w-[1300px] m-auto">
        <>
          <StakeOverview
            token={'ALP'}
            totalLockedStake={alpDetails.totalLockedStake}
            totalRedeemableLockedStake={getTotalRedeemableLockedStake('ALP')}
            lockedStakes={alpLockedStakes}
            handleLockedStakeRedeem={handleLockedStakeRedeem}
            handleClickOnClaimRewards={() => handleClaimRewards('ALP')}
            handleClickOnStakeMore={(initialLockPeriod: AlpLockPeriod) => {
              setLockPeriod(initialLockPeriod);
              setActiveStakingToken('ALP');
            }}
            handleClickOnFinalizeLockedRedeem={(
              lockedStake: LockedStakeExtended,
            ) => {
              setLockedStake(lockedStake);
              setUpgradeLockedStake(false);
              setFinalizeLockedStakeRedeem(true);
            }}
            userPendingUsdcRewards={alpRewards.pendingUsdcRewards}
            userPendingAdxRewards={alpRewards.pendingAdxRewards}
            roundPendingUsdcRewards={
              alpStakingCurrentRoundRewards.usdcRewards ?? 0
            }
            roundPendingAdxRewards={
              alpStakingCurrentRoundRewards.adxRewards ?? 0
            }
            pendingGenesisAdxRewards={alpRewards.pendingGenesisAdxRewards}
            nextRoundTime={nextStakingRoundTimeAlp ?? 0}
            handleClickOnUpdateLockedStake={(
              lockedStake: LockedStakeExtended,
            ) => {
              setLockedStake(lockedStake);
              setUpgradeLockedStake(true);
              setFinalizeLockedStakeRedeem(false);
            }}
          />

          <StakeOverview
            token={'ADX'}
            totalLockedStake={adxDetails.totalLockedStake}
            totalLiquidStaked={adxDetails.totalLiquidStaked}
            totalRedeemableLockedStake={getTotalRedeemableLockedStake('ADX')}
            lockedStakes={adxLockedStakes}
            handleLockedStakeRedeem={handleLockedStakeRedeem}
            handleClickOnClaimRewards={() => handleClaimRewards('ADX')}
            handleClickOnStakeMore={(initialLockPeriod: AdxLockPeriod) => {
              setLockPeriod(initialLockPeriod);
              setActiveStakingToken('ADX');
            }}
            handleClickOnRedeem={() => setActiveRedeemLiquidADX(true)}
            handleClickOnFinalizeLockedRedeem={(
              lockedStake: LockedStakeExtended,
            ) => {
              setLockedStake(lockedStake);
              setUpgradeLockedStake(false);
              setFinalizeLockedStakeRedeem(true);
            }}
            userPendingUsdcRewards={adxRewards.pendingUsdcRewards}
            userPendingAdxRewards={adxRewards.pendingAdxRewards}
            roundPendingUsdcRewards={
              adxStakingCurrentRoundRewards.usdcRewards ?? 0
            }
            roundPendingAdxRewards={
              adxStakingCurrentRoundRewards.adxRewards ?? 0
            }
            pendingGenesisAdxRewards={adxRewards.pendingGenesisAdxRewards}
            nextRoundTime={nextStakingRoundTimeAdx ?? 0}
            handleClickOnUpdateLockedStake={(
              lockedStake: LockedStakeExtended,
            ) => {
              setLockedStake(lockedStake);
              setUpgradeLockedStake(true);
              setFinalizeLockedStakeRedeem(false);
            }}
          />

          <AnimatePresence>
            {modal}

            {finalizeLockedStakeRedeem && (
              <Modal
                title="Early Exit"
                close={() => {
                  setLockedStake(null);
                  setUpgradeLockedStake(false);
                  setFinalizeLockedStakeRedeem(false);
                }}
                className="max-w-[25em]"
              >
                {lockedStake ? (
                  <FinalizeLockedStakeRedeem
                    lockedStake={lockedStake}
                    stakeTokenMintDecimals={
                      lockedStake.tokenSymbol === 'ADX'
                        ? window.adrena.client.adxToken.decimals
                        : window.adrena.client.alpToken.decimals
                    }
                    handleLockedStakeRedeem={handleLockedStakeRedeem}
                  />
                ) : null}
              </Modal>
            )}

            {upgradeLockedStake && (
              <Modal
                title="Upgrade Locked Stake"
                close={() => {
                  setLockedStake(null);
                  setUpgradeLockedStake(false);
                  setFinalizeLockedStakeRedeem(false);
                }}
                className="max-w-[28em]"
              >
                {lockedStake ? (
                  <UpgradeLockedStake
                    lockedStake={lockedStake}
                    handleUpgradeLockedStake={handleUpgradeLockedStake}
                  />
                ) : null}
              </Modal>
            )}

            {activeRedeemLiquidADX && (
              <Modal
                title="Redeem Liquid ADX"
                close={() => setActiveRedeemLiquidADX(false)}
                className="max-w-[25em]"
              >
                <StakeRedeem
                  tokenSymbol="ADX"
                  totalLiquidStaked={getTotalADXLiquidStaked()}
                  handleRemoveLiquidStake={handleRemoveADXLiquidStake}
                />
              </Modal>
            )}
          </AnimatePresence>
        </>
      </div>
    </>
  );
}
