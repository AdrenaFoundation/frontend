import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Modal from '@/components/common/Modal/Modal';
import ADXStakeOverview from '@/components/pages/earn/ADXStakeOverview';
import ALPStakeOverview from '@/components/pages/earn/ALPStakeOverview';
import StakeRedeem from '@/components/pages/earn/StakeRedeem';
import StakeToken from '@/components/pages/earn/StakeToken';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { LockedStakeExtended, LockPeriod, PageProps } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  getLockedStakeRemainingTime,
  nativeToUi,
} from '@/utils';

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

export const DEFAULT_LOCKED_STAKE_DURATION = 90;

export default function Earn({ triggerWalletTokenBalancesReload }: PageProps) {
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

  const [activeRedeemLiquidADX, setActiveRedeemLiquidADX] =
    useState<boolean>(false);

  const [lockPeriod, setLockPeriod] = useState<LockPeriod>(
    DEFAULT_LOCKED_STAKE_DURATION,
  );

  const [amount, setAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const adxBalance: number | null =
    walletTokenBalances?.[window.adrena.client.adxToken.symbol] ?? null;

  const alpBalance: number | null =
    walletTokenBalances?.[window.adrena.client.alpToken.symbol] ?? null;

  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const stakeAmount = async () => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!activeStakingToken) return;

    const stakedTokenMint =
      activeStakingToken === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash =
        lockPeriod === 0
          ? await window.adrena.client.addLiquidStake({
              owner,
              amount,
              stakedTokenMint,
            })
          : await window.adrena.client.addLockedStake({
              owner,
              amount,
              lockedDays: Number(lockPeriod) as LockPeriod,
              stakedTokenMint,
            });

      addSuccessTxNotification({
        title: 'Successfully Staked ADX',
        txHash,
      });

      setAmount(null);
      setLockPeriod(DEFAULT_LOCKED_STAKE_DURATION);
      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setActiveStakingToken(null);
    } catch (error) {
      return addFailedTxNotification({
        title: `Error Staking ${activeStakingToken}`,
        error,
      });
    }
  };

  const handleRemoveADXLiquidStake = async (amount: number) => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!activeRedeemLiquidADX) return;

    const stakedTokenMint = window.adrena.client.adxToken.mint;

    try {
      const txHash = await window.adrena.client.removeLiquidStake({
        owner,
        amount,
        stakedTokenMint,
      });

      addSuccessTxNotification({
        title: 'Successfully Removed Liquid Stake',
        txHash,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setActiveRedeemLiquidADX(false);
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Liquid Stake',
        error,
      });
    }
  };

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
      setActiveRedeemLiquidADX(false);
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Locked Stake',
        error,
      });
    }
  };

  const handleClaimRewards = async (tokenSymbol: 'ADX' | 'ALP') => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    const stakedTokenMint =
      tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash = await window.adrena.client.claimStakes({
        owner,
        stakedTokenMint,
      });

      addSuccessTxNotification({
        title: 'Successfully Claimed Rewards',
        txHash,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Claiming Rewards',
        error,
      });
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
          const daysRemaining = getLockedStakeRemainingTime(
            stake.stakeTime,
            stake.lockDuration,
          );

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

  const adxLockedStakes: LockedStakeExtended[] | null =
    (
      stakingAccounts?.ADX?.lockedStakes.sort(
        (a, b) => Number(a.stakeTime) - Number(b.stakeTime),
      ) as LockedStakeExtended[]
    ).map((stake, index) => ({
      ...stake,
      index,
      tokenSymbol: 'ADX',
    })) ?? null;

  const alpLockedStakes: LockedStakeExtended[] | null =
    (
      stakingAccounts?.ALP?.lockedStakes.sort(
        (a, b) => Number(a.stakeTime) - Number(b.stakeTime),
      ) as LockedStakeExtended[]
    ).map((stake, index) => ({
      ...stake,
      index,
      tokenSymbol: 'ALP',
    })) ?? null;

  return (
    <>
      <div className="absolute w-full h-full left-0 top-0 overflow-hidden">
        <RiveAnimation
          src="./rive/fred-bg.riv"
          layout={new Layout({ fit: Fit.Fill, alignment: Alignment.TopLeft })}
          className={
            'absolute top-0 left-0 rotate-180 bottom-0 w-[1000px] lg:w-full h-full'
          }
        />

        <RiveAnimation
          src="./rive/fred-bg.riv"
          layout={
            new Layout({ fit: Fit.Contain, alignment: Alignment.TopRight })
          }
          className={'absolute top-0 right-0 w-[1000px] h-full'}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-evenly gap-x-4">
        <ADXStakeOverview
          totalLockedStake={adxDetails.totalLockedStake}
          totalLiquidStaked={adxDetails.totalLiquidStaked}
          lockedStakes={adxLockedStakes}
          handleLockedStakeRedeem={handleLockedStakeRedeem}
          handleClickOnStakeMore={(initialLockPeriod: LockPeriod) => {
            setLockPeriod(initialLockPeriod);
            setActiveStakingToken('ADX');
          }}
          handleClickOnRedeem={() => setActiveRedeemLiquidADX(true)}
          handleClickOnClaimRewards={() => handleClaimRewards('ADX')}
        />

        <ALPStakeOverview
          totalLockedStake={alpDetails.totalLockedStake}
          lockedStakes={alpLockedStakes}
          handleLockedStakeRedeem={handleLockedStakeRedeem}
          handleClickOnStakeMore={(initialLockPeriod: LockPeriod) => {
            setLockPeriod(initialLockPeriod);
            setActiveStakingToken('ALP');
          }}
          handleClickOnClaimRewards={() => handleClaimRewards('ALP')}
        />

        <AnimatePresence>
          {activeStakingToken && (
            <Modal
              title={`Stake ${activeStakingToken}`}
              close={() => {
                setAmount(null);
                setLockPeriod(DEFAULT_LOCKED_STAKE_DURATION);
                setActiveStakingToken(null);
              }}
            >
              <StakeToken
                tokenSymbol={activeStakingToken}
                amount={amount}
                setAmount={setAmount}
                onStakeAmountChange={onStakeAmountChange}
                errorMessage={errorMessage}
                stakeAmount={stakeAmount}
                balance={activeStakingToken === 'ADX' ? adxBalance : alpBalance}
                lockPeriod={lockPeriod}
                setLockPeriod={setLockPeriod}
              />
            </Modal>
          )}

          {activeRedeemLiquidADX && (
            <Modal
              title="Redeem Liquid ADX"
              close={() => setActiveRedeemLiquidADX(false)}
            >
              <StakeRedeem
                tokenSymbol="ADX"
                totalLiquidStaked={getTotalADXLiquidStaked()}
                handleRemoveLiquidStake={handleRemoveADXLiquidStake}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
