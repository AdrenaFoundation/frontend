import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Modal from '@/components/common/Modal/Modal';
import ADXStakeOverview, {
  ADXTokenDetails,
} from '@/components/pages/earn/ADXStakeOverview';
import ALPStakeOverview, {
  ALPTokenDetails,
} from '@/components/pages/earn/ALPStakeOverview';
import StakeBlocks from '@/components/pages/earn/StakeBlocks';
import StakeList from '@/components/pages/earn/StakeList';
import StakeRedeem from '@/components/pages/earn/StakeRedeem';
import StakeToken from '@/components/pages/earn/StakeToken';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { LockPeriod, PageProps, StakePositionsExtended } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  getDaysRemaining,
  nativeToUi,
} from '@/utils';

import lockIcon from '../../../public/images/Icons/lock.svg';

export default function Earn({ triggerWalletTokenBalancesReload }: PageProps) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const alpPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;

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

  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  const [activeStakingToken, setActiveStakingToken] = useState<
    'ADX' | 'ALP' | null
  >(null);

  const [activeRedeemLiquidADX, setActiveRedeemLiquidADX] =
    useState<boolean>(false);

  const [lockPeriod, setLockPeriod] = useState<LockPeriod>(0);

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
      setLockPeriod(0);
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

  const handleRemoveLockedStake = async (
    tokenSymbol: 'ADX' | 'ALP',
    resolved: boolean,
    threadId: BN,
    lockedStakeIndex: number,
  ) => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    const stakedTokenMint =
      tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash = await window.adrena.client.removeLockedStake({
        owner,
        resolved,
        threadId,
        stakedTokenMint,
        lockedStakeIndex: new BN(lockedStakeIndex),
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
        title: 'Error Removing Liquid Stake',
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
          const daysRemaining = getDaysRemaining(
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
      totalLockedStake: wallet ? getTotalLockedStake('ADX') : null,
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

  const isBigScreen = useBetterMediaQuery('(min-width: 950px)');

  const stakePositions = Object.entries(stakingAccounts ?? {})
    .map(([tokenSymbol, details], index) => {
      if (details === null) return [];

      return details.lockedStakes.map((position) => ({
        ...position,
        lockedStakeIndex: index,
        tokenSymbol,
      }));
    })
    .flat()
    .sort(
      (a, b) => Number(a?.stakeTime) - Number(b?.stakeTime),
    ) as StakePositionsExtended[];

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

      <h2 className="z-20">Earn</h2>

      <p className="z-20">
        Governed by the Adrena community, conferring control and economic reward
        to the collective.
      </p>

      <div className="flex flex-col lg:flex-row gap-5 z-20">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row gap-5 mt-8">
            <ADXStakeOverview
              tokenDetails={adxDetails}
              setActiveToken={() => setActiveStakingToken('ADX')}
              setActiveRedeemToken={() => setActiveRedeemLiquidADX(true)}
            />
            <ALPStakeOverview
              tokenDetails={alpDetails}
              setActiveToken={() => setActiveStakingToken('ALP')}
            />
          </div>

          <div className="flex flex-col gap-3 bg-gray-300/85 backdrop-blur-md border border-gray-200 rounded-2xl p-5 pb-8 mt-8">
            <div className="flex flex-row gap-2 items-center mb-3">
              <Image src={lockIcon} width={16} height={16} alt="lock icon" />
              <h4>My Locked Stake</h4>
            </div>

            {wallet ? (
              isBigScreen ? (
                <StakeList
                  positions={stakePositions}
                  handleRemoveLockedStake={handleRemoveLockedStake}
                />
              ) : (
                <StakeBlocks
                  positions={stakePositions}
                  handleRemoveLockedStake={handleRemoveLockedStake}
                />
              )
            ) : (
              <p className="text-sm opacity-50">
                Connect your wallet to see your locked stake
              </p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {activeStakingToken && (
            <Modal
              title={`Stake ${activeStakingToken}`}
              close={() => {
                setAmount(null);
                setLockPeriod(0);
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
