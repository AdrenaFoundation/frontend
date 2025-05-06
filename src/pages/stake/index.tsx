import { BN } from '@coral-xyz/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { fetchWalletTokenBalances } from '@/actions/thunks';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Loader from '@/components/Loader/Loader';
import ADXStakeToken from '@/components/pages/stake/ADXStakeToken';
import ALPStakingRecap from '@/components/pages/stake/ALPStakingRecap';
import FinalizeLockedStakeRedeem from '@/components/pages/stake/FinalizeLockedStakeRedeem';
import FullyLiquidALPStaking from '@/components/pages/stake/FullyLiquidALPStaking';
import StakeApr from '@/components/pages/stake/StakeApr';
import StakeLanding from '@/components/pages/stake/StakeLanding';
import StakeOverview from '@/components/pages/stake/StakeOverview';
import StakeRedeem from '@/components/pages/stake/StakeRedeem';
import UpgradeLockedStake from '@/components/pages/stake/UpgradeLockedStake';
import { USD_DECIMALS } from '@/constant';
import useStakingAccountRewardsAccumulated from '@/hooks/useStakingAccountRewardsAccumulated';
import { useStakingClaimableRewards } from '@/hooks/useStakingClaimableRewards';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useDispatch, useSelector } from '@/store/store';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  ClaimHistoryExtended,
  LockedStakeExtended,
  PageProps,
} from '@/types';
import {
  addNotification,
  getAdxLockedStakes,
  getAlpLockedStakes,
  nativeToUi,
  uiToNative,
} from '@/utils';
import Button from '@/components/common/Button/Button';

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

// Small structure used to ease usage of top accounts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toInstruction(ix: any): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keys: ix.accounts.map((acc: any) => ({
      pubkey: new PublicKey(acc.pubkey),
      isSigner: acc.isSigner,
      isWritable: acc.isWritable,
    })),
    data: Buffer.from(ix.data, 'base64'),
  });
}

export default function Stake({
  connected,
}: PageProps) {
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const {
    stakingAccounts,
    triggerWalletStakingAccountsReload
  } = useWalletStakingAccounts(wallet?.walletAddress ?? null);

  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const alpPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;

  const [optimisticClaimAdx, setOptimisticClaimAdx] = useState<ClaimHistoryExtended | null>(null);

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
  const [showLpHistory, setShowLpHistory] = useState(false);

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
      if (lockPeriod === 0) {
        await window.adrena.client.addLiquidStake({
          owner,
          amount,
          stakedTokenMint,
          notification,
        });
      } else {
        await window.adrena.client.addLockedStake({
          owner,
          amount,
          lockedDays: Number(lockPeriod) as AdxLockPeriod | AlpLockPeriod,
          stakedTokenMint,
          notification,
        });
      }

      setAmount(null);
      setLockPeriod(DEFAULT_LOCKED_STAKE_LOCK_DURATION);
      dispatch(fetchWalletTokenBalances());
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

      dispatch(fetchWalletTokenBalances());
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

      setUpgradeLockedStake(false);
    } catch (error) {
      console.error('error', error);
    } finally {
      dispatch(fetchWalletTokenBalances());
      triggerWalletStakingAccountsReload();
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
        id: lockedStake.id,
        stakedTokenMint,
        lockedStakeIndex: new BN(lockedStake.index),
        earlyExit,
        notification,
      });

      if (earlyExit) {
        setLockedStake(null);
        setFinalizeLockedStakeRedeem(false);
      }
    } catch (error) {
      console.error('error', error);
    } finally {
      dispatch(fetchWalletTokenBalances());
      triggerWalletStakingAccountsReload();
    }
  };

  const handleClaimRewardsAndRedeemALP = async () => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    try {
      const tokenObj = stakingAccounts?.ALP;
      if (!tokenObj) return;

      tokenObj.lockedStakes.forEach((stake, i) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        stake.index = i;
      });

      const filteredLockedStakes = tokenObj.lockedStakes.filter(stake => !stake.amount.isZero());

      let i = 0;

      for (const lockedStake of filteredLockedStakes) {
        const notification = MultiStepNotification.newForRegularTransaction(`Claim & Unstake ${++i}/${filteredLockedStakes.length}`).fire();

        await window.adrena.client.removeLockedStake({
          owner,
          resolved: !!lockedStake.resolved,
          id: lockedStake.id,
          stakedTokenMint: window.adrena.client.alpToken.mint,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-errorÒ
          lockedStakeIndex: new BN(lockedStake.index),
          earlyExit: true,
          notification,
          // TODO: replace this with a proper system allowing the user to claim on a TA instead of the ATA, but pretty niche usecase tbh
          // Special override for a user that has a different reward token account following a hack
          overrideRewardTokenAccount: owner.toBase58() === '5aBuBWGxkyHMDE6kqLLA1sKJjd2emdoKJWm8hhMTSKEs' ?
            new PublicKey('654FfF8WWJ7BTLdWtpAo4F3AiY2pRAPU8LEfLdMFwNK9') : undefined
        });
      }

      setLockedStake(null);
      setFinalizeLockedStakeRedeem(false);
    } catch (error) {
      console.error('error', error);
    } finally {
      dispatch(fetchWalletTokenBalances());
      triggerWalletStakingAccountsReload();
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
        // TODO: replace this with a proper system allowing the user to claim on a TA instead of the ATA, but pretty niche usecase tbh
        // Special override for a user that has a different reward token account following a hack
        overrideRewardTokenAccount: owner.toBase58() === '5aBuBWGxkyHMDE6kqLLA1sKJjd2emdoKJWm8hhMTSKEs' ?
          new PublicKey('654FfF8WWJ7BTLdWtpAo4F3AiY2pRAPU8LEfLdMFwNK9') : undefined
      });

      // No alp claim anymore since it became liquid
      if (tokenSymbol === 'ADX') {
        const optimisticClaim = {
          claim_id: new BN(Date.now()).toString(),
          rewards_adx: adxRewards.pendingAdxRewards,
          rewards_adx_genesis: adxRewards.pendingGenesisAdxRewards,
          rewards_usdc: adxRewards.pendingUsdcRewards,
          signature: 'optimistic',
          transaction_date: new Date(),
          created_at: new Date(),
          stake_mint: stakedTokenMint,
          symbol: tokenSymbol,
          source: 'optimistic',
        } as unknown as ClaimHistoryExtended;

        // Reset rewards in the ui until next fetch
        adxRewards.pendingUsdcRewards = 0;
        adxRewards.pendingAdxRewards = 0;
        adxRewards.pendingGenesisAdxRewards = 0;
        fetchAdxRewards();
        setOptimisticClaimAdx(optimisticClaim);
      }
    } catch (error) {
      console.error('error', error);
    } finally {
      dispatch(fetchWalletTokenBalances());
      triggerWalletStakingAccountsReload();
    }
  };

  const handleClickOnClaimRewardsAndBuyAdx = async () => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    const stakedTokenMint = window.adrena.client.adxToken.mint;

    const notification = MultiStepNotification.new({
      title: 'Claim and Buy ADX',
      steps: [
        {
          title: 'Prepare ADX swap',
        },
        {
          title: 'Prepare transaction',
        },
        {
          title: 'Sign transaction',
        },
        {
          title: 'Execute transaction',
        },
        {
          title: 'Confirm transaction',
        },
      ],
    }).fire();

    try {
      const quoteResult = await fetch(
        `https://lite-api.jup.ag/swap/v1/quote?inputMint=${window.adrena.client.getUsdcToken().mint.toBase58()}&outputMint=${stakedTokenMint.toBase58()}&amount=${uiToNative(adxRewards.pendingUsdcRewards, USD_DECIMALS)}`,
      )
        .then((res) => res.json())
        .catch((e) => {
          notification.currentStepErrored(String(e));

          throw e;
        });

      notification.currentStepSucceeded();

      const swapInstructions: {
        setupInstructions?: unknown[];
        swapInstruction: unknown;
        cleanupInstruction?: unknown;
        addressLookupTableAddresses: string[];
      } = await fetch('https://lite-api.jup.ag/swap/v1/swap-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userPublicKey: owner.toBase58(),
          quoteResponse: quoteResult,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 10_000_000,
              priorityLevel: 'veryHigh',
            },
          },
          dynamicComputeUnitLimit: true,
        }),
      })
        .then((res) => res.json())
        .catch((e) => {
          notification.currentStepErrored(String(e));

          throw e;
        });

      const builder = await window.adrena.client.buildClaimStakesInstruction({
        owner,
        stakedTokenMint,
        caller: owner,
        // TODO: replace this with a proper system allowing the user to claim on a TA instead of the ATA, but pretty niche usecase tbh
        // Special override for a user that has a different reward token account following a hack
        overrideRewardTokenAccount: owner.toBase58() === '5aBuBWGxkyHMDE6kqLLA1sKJjd2emdoKJWm8hhMTSKEs' ?
          new PublicKey('654FfF8WWJ7BTLdWtpAo4F3AiY2pRAPU8LEfLdMFwNK9') : undefined
      });

      const jupiterInstructions = [
        ...(swapInstructions.setupInstructions || []).map(toInstruction),
        toInstruction(swapInstructions.swapInstruction),
        ...(swapInstructions.cleanupInstruction ? [toInstruction(swapInstructions.cleanupInstruction)] : []),
      ];

      builder.postInstructions(jupiterInstructions);

      const transaction = await builder.transaction();

      console.log('transaction', transaction);

      await window.adrena.client.signAndExecuteTxAlternative({
        transaction,
        notification,
        additionalAddressLookupTables: swapInstructions.addressLookupTableAddresses.map(x => new PublicKey(x)),
      });

      const optimisticClaim = {
        claim_id: new BN(Date.now()).toString(),
        rewards_adx: adxRewards.pendingAdxRewards,
        rewards_adx_genesis: adxRewards.pendingGenesisAdxRewards,
        rewards_usdc: adxRewards.pendingUsdcRewards,
        signature: 'optimistic',
        transaction_date: new Date(),
        created_at: new Date(),
        stake_mint: stakedTokenMint,
        symbol: 'ADX',
        source: 'optimistic',
      } as unknown as ClaimHistoryExtended;

      // Reset rewards in the ui until next fetch
      adxRewards.pendingUsdcRewards = 0;
      adxRewards.pendingAdxRewards = 0;
      adxRewards.pendingGenesisAdxRewards = 0;
      fetchAdxRewards();

      setOptimisticClaimAdx([optimisticClaim]);
    } catch (error) {
      console.error('error', error);
    } finally {
      dispatch(fetchWalletTokenBalances());
      triggerWalletStakingAccountsReload();
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

  // const { stakingAccount: alpStakingAccount } = useStakingAccount(
  //   window.adrena.client.lpTokenMint,
  // );


  // const nextStakingRoundTimeAlp = alpStakingAccount
  //   ? getNextStakingRoundStartTime(
  //     alpStakingAccount.currentStakingRound.startTime,
  //   ).getTime()
  //   : null;



  // The rewards pending for the user
  const { rewards: adxRewards, fetchRewards: fetchAdxRewards } =
    useStakingClaimableRewards('ADX');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    if (!connected || stakingAccounts) {
      setTimeout(() => {
        setIsStakeLoaded(true);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stakingAccounts,
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
        handleClickOnStakeMoreADX={() => {
          setLockPeriod(180);
          setActiveStakingToken('ADX');
        }}
      />
    </>
  ) : (
    <div className={twMerge("w-full flex flex-col items-center z-10 min-h-full pl-4 pr-4 pb-4 pt-2 m-auto items-center justify-center", alpLockedStakes && alpLockedStakes?.length ? 'max-w-[80em]' : 'max-w-[50em]')}>
      <div className="fixed w-full h-screen left-0 top-0 -z-10 opacity-60 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

      <div className='flex flex-col items-center justify-center flex-grow w-full my-auto'>
        <div className="flex flex-col lg:flex-row gap-4 pl-4 pr-4 pb-4 pt-2 justify-center z-10 w-full">
          <>
            {alpLockedStakes && alpLockedStakes?.length ? <div className="flex-1">
              <FullyLiquidALPStaking
                totalLockedStake={alpDetails.totalLockedStake}
                lockedStakes={alpLockedStakes}
                handleLockedStakeRedeem={handleLockedStakeRedeem}
                handleClickOnClaimRewardsAndRedeem={() => handleClaimRewardsAndRedeemALP()}
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
                  alpStakingCurrentRoundRewards.usdcRewards ??
                  0
                }
                roundPendingAdxRewards={
                  alpStakingCurrentRoundRewards.adxRewards ??
                  0
                }
                pendingGenesisAdxRewards={alpRewards.pendingGenesisAdxRewards}
                walletAddress={wallet?.walletAddress ?? null}
              />
            </div> : null}

            <div className="flex-1">
              <StakeApr token='ADX' className='mb-2' />

              <StakeOverview
                token='ADX'
                totalLockedStake={adxDetails.totalLockedStake}
                totalLiquidStaked={adxDetails.totalLiquidStaked}
                totalRedeemableLockedStake={getTotalRedeemableLockedStake('ADX')}
                lockedStakes={adxLockedStakes}
                handleLockedStakeRedeem={handleLockedStakeRedeem}
                handleClickOnClaimRewards={() => handleClaimRewards('ADX')}
                handleClickOnClaimRewardsAndBuyAdx={() => handleClickOnClaimRewardsAndBuyAdx()}
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
                handleClickOnUpdateLockedStake={(
                  lockedStake: LockedStakeExtended,
                ) => {
                  setLockedStake(lockedStake);
                  setUpgradeLockedStake(true);
                  setFinalizeLockedStakeRedeem(false);
                }}
                walletAddress={wallet?.walletAddress ?? null}
                optimisticClaim={optimisticClaimAdx}
              />
            </div>

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

        {(alpLockedStakes === null || alpLockedStakes?.length == 0) && !showLpHistory ? (
          <div className="pl-4 pr-4 w-full">
            <div className="flex flex-col rounded-2xl border bg-main overflow-hidden">
              <p className="opacity-75 text-base p-4 flex flex-col gap-2 text-center w-full">
                <span className='text-base'>Starting March 19th, 2025, at 12:00 UTC, ALP is now fully liquid. You were there and want to see your history ? </span>
              </p>

              <div className="flex justify-center border-t py-4">
                <Button
                  variant={showLpHistory ? "secondary" : "primary"}
                  size="sm"
                  title={showLpHistory ? "Hide LP rewards History" : "Show LP rewards History"}
                  onClick={() => setShowLpHistory(!showLpHistory)}
                  className="px-6"
                />
              </div>
            </div>
          </div>
        ) : (
          <ALPStakingRecap walletAddress={wallet?.walletAddress ?? null} />
        )}
      </div >
    </div>
  );
}
