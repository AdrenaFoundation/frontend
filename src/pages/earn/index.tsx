import Image from 'next/image';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import DisplayInfo from '@/components/DisplayInfo/DisplayInfo';
import StakeBlocks from '@/components/pages/earn/StakeBlocks';
import StakeList from '@/components/pages/earn/StakeList';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import { formatNumber } from '@/utils';

export default function Earn() {
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const [lockPeriod, setLockPeriod] = useState<
    '0' | '30' | '60' | '90' | '180' | '360' | '720'
  >('0');

  const LOCK_PERIODS = [
    { title: '0' },
    { title: '30' },
    { title: '60' },
    { title: '90' },
    { title: '180' },
    { title: '360' },
    { title: '720' },
  ];

  const MULTIPLIERS = {
    '0': {
      usdc: 1,
      adx: 0,
      votes: 1,
    },
    '30': {
      usdc: 1.25,
      adx: 1,
      votes: 1.21,
    },
    '60': {
      usdc: 1.56,
      adx: 1.25,
      votes: 1.33,
    },
    '90': {
      usdc: 1.95,
      adx: 1.56,
      votes: 1.46,
    },
    '180': {
      usdc: 2.44,
      adx: 1.95,
      votes: 1.61,
    },
    '360': {
      usdc: 3.05,
      adx: 2.44,
      votes: 1.78,
    },
    '720': {
      usdc: 3.81,
      adx: 3.05,
      votes: 1.95,
    },
  };

  const adxBalance =
    walletTokenBalances?.[window.adrena.client.adxToken.decimals] ?? 0;

  // dummy data
  const stakePositions = [
    {
      pubkey: '4ZY3ZH8bStniqdCZdR14xsWWvrMsCJrusobTdy4JipC',
      amount: 28323323,
      multiplier: 4293829,
      rewards: 48293,
      duration: 0,
      yield: 28303,
    },
    {
      pubkey: '4ZY3ZH8bStniqdCZdR14xsWW6vrMsJrusobTdy4JipC',
      amount: 28323323,
      multiplier: 4293829,
      rewards: 48293,
      duration: 4,
      yield: 28303,
    },
    {
      pubkey: '4ZY3ZH8bStniqdCZdR14xsWW6vr3MsCJrusobTdy4JipC',
      amount: 28323323,
      multiplier: 4293829,
      rewards: 48293,
      duration: 4,
      yield: 28303,
    },
  ];

  const isBigScreen = useBetterMediaQuery('(min-width: 1150px)');

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
                  {formatNumber(adxBalance, 2)} ADX
                </p>
              </div>

              <div className="relative flex flex-row w-full">
                <div className="flex items-center bg-[#242424] border border-gray-300 rounded-l-lg px-3  border-r-none">
                  <p className="opacity-50 font-mono text-sm">ADX</p>
                </div>
                <input
                  className="w-full bg-dark border border-gray-300 rounded-lg rounded-l-none p-3 px-4 text-xl font-mono"
                  type="number"
                  placeholder="0.00"
                />
                <Button
                  className="absolute right-2 bottom-[20%]"
                  title="MAX"
                  variant="text"
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
                  setLockPeriod(
                    title as '0' | '30' | '60' | '90' | '180' | '360' | '720',
                  );
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
                  {MULTIPLIERS[lockPeriod].usdc}x
                </p>
              </li>
              <li className="flex flex-row justify-between">
                <p className="text-sm opacity-50"> ADX token yield </p>
                <p className="text-sm font-mono">
                  {MULTIPLIERS[lockPeriod].adx}x
                </p>
              </li>
              <li className="flex flex-row justify-between">
                <p className="text-sm opacity-50"> Votes </p>
                <p className="text-sm font-mono">
                  {MULTIPLIERS[lockPeriod].votes}x
                </p>
              </li>
            </ul>

            <Button
              className="w-full"
              size="lg"
              title="[S]take"
              onClick={() => {
                console.log('Stake');
              }}
            />
          </div>
        </div>

        <div className="w-full">
          <DisplayInfo
            data={[
              { title: 'Total Supply', value: '129,391.23 ADX' },
              { title: 'Circulating Supply', value: '293,930.93' },
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
                  <p className="text-sm font-mono">
                    {MULTIPLIERS[lockPeriod].usdc}x
                  </p>
                </li>
                <li className="flex flex-row justify-between">
                  <p className="text-sm opacity-50"> Total Redeemable </p>
                  <p className="text-sm font-mono">
                    {MULTIPLIERS[lockPeriod].adx}x
                  </p>
                </li>
              </ul>
            </div>

            <h4 className="mt-4">Stakes</h4>
            {isBigScreen ? (
              <StakeList stakePositions={stakePositions} />
            ) : (
              <StakeBlocks stakePositions={stakePositions} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
