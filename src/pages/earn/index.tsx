import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import DisplayInfo from '@/components/DisplayInfo/DisplayInfo';
import StakeBlocks from '@/components/pages/earn/StakeBlocks';
import StakeList from '@/components/pages/earn/StakeList';
import { STAKE_MULTIPLIERS } from '@/constant';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { UserStaking } from '@/types';
import {
  addFailedTxNotification,
  addSuccessTxNotification,
  formatNumber,
  nativeToUi,
} from '@/utils';

type LockPeriod = 0 | 30 | 60 | 90 | 180 | 360 | 720;

export default function Earn() {
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances); // need to refresh

  const [lockPeriod, setLockPeriod] = useState<LockPeriod>(0);

  const [amount, setAmount] = useState<number | null>(null);
  const [stakingAccount, setStakingAccount] = useState<UserStaking | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const adxBalance =
    walletTokenBalances?.[window.adrena.client.adxToken.symbol];

  const owner = wallet && new PublicKey(wallet.walletAddress);

  useEffect(() => {
    getUserStakingAccount();
  }, [walletTokenBalances]);

  const getUserStakingAccount = async () => {
    if (!owner) {
      // error msg
      return;
    }

    const stakedTokenMint = window.adrena.client.adxToken.mint;

    const userStakingAccount = await window.adrena.client.getUserStakingAccount(
      {
        owner,
        stakedTokenMint,
      },
    );
    setStakingAccount(userStakingAccount);
  };

  const stakeAmount = async () => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    try {
      const txHash =
        lockPeriod === 0
          ? await window.adrena.client.addLiquidStake({
              owner,
              amount,
            })
          : await window.adrena.client.addLockedStake({
              owner,
              amount,
              lockedDays: Number(lockPeriod) as LockPeriod,
            });

      addSuccessTxNotification({
        title: 'Successfully Staked ADX',
        txHash,
      });

      setAmount(null);
      setLockPeriod(0);
      return getUserStakingAccount();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Staking ADX',
        error,
      });
    }
  };

  const handleRemoveLockedStake = async (lockedStakeIndex: BN) => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const txHash = await window.adrena.client.removeLockedStake({
        owner,
        lockedStakeIndex,
      });

      addSuccessTxNotification({
        title: 'Successfully Removed Locked Stake',
        txHash,
      });
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Locked Stake',
        error,
      });
    }
  };

  const handleRemoveLiquidStake = async (amount: number) => {
    if (!owner) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const txHash = await window.adrena.client.removeLiquidStake({
        owner,
        amount,
      });

      addSuccessTxNotification({
        title: 'Successfully Removed Liquid Stake',
        txHash,
      });

      return getUserStakingAccount();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Liquid Stake',
        error,
      });
    }
  };

  const LOCK_PERIODS: { title: LockPeriod }[] = [
    { title: 0 },
    { title: 30 },
    { title: 60 },
    { title: 90 },
    { title: 180 },
    { title: 360 },
    { title: 720 },
  ];

  const totalLiquidStaked = stakingAccount?.liquidStake.amount.toNumber() ?? 0;

  const totalLockedStake =
    stakingAccount?.lockedStakes.reduce((acc, stake) => {
      return acc + stake.amount.toNumber();
    }, 0) ?? 0;

  const totalStaked = nativeToUi(
    new BN(totalLiquidStaked + totalLockedStake),
    window.adrena.client.adxToken.decimals,
  );

  const totalReedemableLockedStake =
    stakingAccount?.lockedStakes.reduce((acc, stake) => {
      // check if the date is past the lock duration
      if (stake.lockDuration.toNumber() === 0) {
        return acc + stake.amount.toNumber();
      }
      return acc;
    }, 0) ?? 0;

  const totalReedemableStake = nativeToUi(
    new BN(totalReedemableLockedStake + totalLiquidStaked),
    window.adrena.client.adxToken.decimals,
  );

  // // dummy data
  // const stakePositions = [
  //   {
  //     pubkey: '4ZY3ZH8bStniqdCZdR14xsWWvrMsCJrusobTdy4JipC',
  //     amount: 28323323,
  //     multiplier: 4293829,
  //     rewards: 48293,
  //     duration: 0,
  //     yield: 28303,
  //   },
  //   {
  //     pubkey: '4ZY3ZH8bStniqdCZdR14xsWW6vrMsJrusobTdy4JipC',
  //     amount: 28323323,
  //     multiplier: 4293829,
  //     rewards: 48293,
  //     duration: 4,
  //     yield: 28303,
  //   },
  //   {
  //     pubkey: '4ZY3ZH8bStniqdCZdR14xsWW6vr3MsCJrusobTdy4JipC',
  //     amount: 28323323,
  //     multiplier: 4293829,
  //     rewards: 48293,
  //     duration: 4,
  //     yield: 28303,
  //   },
  // ];

  //   {
  //     "bump": 255,
  //     "threadAuthorityBump": 255,
  //     "stakesClaimCronThreadId": "018a8415bbcd",
  //     "liquidStake": {
  //         "amount": "01f4",
  //         "stakeTime": "65004420",
  //         "claimTime": "00",
  //         "overlapTime": "00",
  //         "overlapAmount": "00"
  //     },
  //     "lockedStakes": []
  // }

  const onStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setAmount(null);
      setErrorMessage('');
      return;
    }

    const adx = adxBalance ?? 0;

    if (Number(value) > adx) {
      setErrorMessage('Insufficient balance');
    } else {
      setErrorMessage('');
    }

    setAmount(Number(value));
  };

  return (
    <>
      <h2>Stake / Redeem ADX</h2>
      <p>
        Governed by the Adrena community, conferring control and economic reward
        to the collective.
      </p>
      <div className="flex flex-col lg:flex-row gap-5 mt-8">
        <div className="flex flex-col sm:flex-row lg:flex-col bg-gray-200 border border-gray-300 rounded-lg sm:min-w-[400px] h-fit">
          <div className="flex flex-col gap-5 justify-between w-full p-5">
            <div>
              <h3> Stake ADX </h3>
              <p className="opacity-75 mt-1">
                Adrena&apos;s native utility and govornance token
              </p>
            </div>

            <div>
              <div className="flex flex-row justify-between mb-2">
                <p className="text-xs opacity-50 font-medium"> Enter Amount</p>
                <p className="text-xs font-medium">
                  <span className="opacity-50"> Balance · </span>
                  {adxBalance ? `${formatNumber(adxBalance, 2)} ADX` : '–'}
                </p>
              </div>

              <div className="relative flex flex-row w-full">
                <div className="flex items-center bg-[#242424] border border-gray-300 rounded-l-lg px-3  border-r-none">
                  <p className="opacity-50 font-mono text-sm">ADX</p>
                </div>
                <input
                  className="w-full bg-dark border border-gray-300 rounded-lg rounded-l-none p-3 px-4 text-xl font-mono"
                  type="number"
                  value={amount ?? ''}
                  onChange={onStakeAmountChange}
                  placeholder="0.00"
                />
                <Button
                  className="absolute right-2 bottom-[20%]"
                  title="MAX"
                  variant="text"
                  onClick={() => {
                    if (!adxBalance) {
                      return;
                    }
                    setAmount(adxBalance);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex flex-row gap-1  mb-2">
                <Image
                  src="/images/Icons/lock.svg"
                  width={14}
                  height={14}
                  alt="lock icon"
                />
                <p className="text-xs opacity-50 font-medium ">
                  Choose a lock period (days)
                </p>
              </div>
              <TabSelect
                className="font-mono"
                selected={lockPeriod}
                tabs={LOCK_PERIODS}
                onClick={(title) => {
                  setLockPeriod(title);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 justify-between w-full p-5 ">
            <ul className="flex flex-col gap-2">
              <li className="text-xs opacity-25">Benefits</li>
              <li className="flex flex-row justify-between">
                <p className="text-sm opacity-50"> Days </p>
                <p className="text-sm font-mono"> {lockPeriod} </p>
              </li>
              <li className="flex flex-row justify-between">
                <p className="text-sm opacity-50"> USDC yield</p>
                <p className="text-sm font-mono">
                  {STAKE_MULTIPLIERS[lockPeriod].usdc}x
                </p>
              </li>
              <li className="flex flex-row justify-between">
                <p className="text-sm opacity-50"> ADX token yield </p>
                <p className="text-sm font-mono">
                  {STAKE_MULTIPLIERS[lockPeriod].adx}x
                </p>
              </li>
              <li className="flex flex-row justify-between">
                <p className="text-sm opacity-50"> Votes </p>
                <p className="text-sm font-mono">
                  {STAKE_MULTIPLIERS[lockPeriod].votes}x
                </p>
              </li>
            </ul>

            <Button
              className="w-full"
              size="lg"
              title={errorMessage ? errorMessage : '[S]take'}
              disabled={!!errorMessage}
              onClick={() => stakeAmount()}
            />
          </div>
        </div>

        <div className="w-full">
          <DisplayInfo
            data={[
              { title: 'Total Supply', value: '129,391.23 ADX' },
              { title: 'Circulating Supply', value: '293,930.93 ADX' },
              { title: 'Market Cap', value: '$193,293.89' },
              { title: 'Total Staked', value: '$193,293.89' },
            ]}
          />
          <div className="flex flex-col gap-3 bg-gray-200 border border-gray-300 rounded-lg p-4 mt-5">
            <h4>Overview</h4>
            <div className="bg-[#242424] border border-gray-300 rounded-lg p-4">
              <ul className="flex flex-col gap-2">
                <li className="flex flex-row justify-between">
                  <p className="text-sm opacity-50"> Total Supply </p>
                  <p className="text-sm font-mono"> {lockPeriod} </p>
                </li>
                <li className="flex flex-row justify-between">
                  <p className="text-sm opacity-50"> Total Staked</p>
                  <p className="text-sm font-mono">{totalStaked} ADX</p>
                </li>
                <li className="flex flex-row justify-between">
                  <p className="text-sm opacity-50"> Total Redeemable </p>
                  <p className="text-sm font-mono">
                    {totalReedemableStake} ADX
                  </p>
                </li>
              </ul>
            </div>

            <div className="my-3 w-full bg-gray-300 h-[2px] rounded-full" />

            <h4>Liquid Stake</h4>
            <StakeList
              stakePositions={stakingAccount}
              handleRemoveLiquidStake={handleRemoveLiquidStake}
              totalLiquidStaked={nativeToUi(
                new BN(totalLiquidStaked),
                window.adrena.client.adxToken.decimals,
              )}
            />

            <div className="my-3 w-full bg-gray-300 h-[2px] rounded-full" />

            <div className="flex flex-row gap-1 items-center">
              <h4>Locked Stake</h4>
              <Image
                src="/images/Icons/lock.svg"
                width={16}
                height={16}
                alt="lock icon"
              />
            </div>
            <StakeBlocks
              stakePositions={stakingAccount}
              handleRemoveLockedStake={handleRemoveLockedStake}
            />
          </div>
        </div>
      </div>
    </>
  );
}
