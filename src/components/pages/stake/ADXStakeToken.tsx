import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { ADX_LOCK_PERIODS, ADX_STAKE_MULTIPLIERS } from '@/constant';
import { AdxLockPeriod } from '@/types';
import { formatNumber } from '@/utils';

import lockIcon from '../../../../public/images/Icons/lock.svg';
import walletImg from '../../../../public/images/wallet-icon.svg';

export default function ADXStakeToken({
  balance,
  amount,
  setAmount,
  lockPeriod,
  setLockPeriod,
  onStakeAmountChange,
  stakeAmount,
  errorMessage,
}: {
  balance: number | null;
  amount: number | null;
  setAmount: (amount: number | null) => void;
  lockPeriod: AdxLockPeriod;
  setLockPeriod: (lockPeriod: AdxLockPeriod) => void;
  onStakeAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stakeAmount: () => void;
  errorMessage: string;
}) {
  const lockPeriods = ADX_LOCK_PERIODS.map((lockPeriod) => ({
    title: lockPeriod,
    activeColor: 'border-white',
  }));

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col rounded-lg sm:min-w-[400px] h-fit">
      <div className="flex flex-col gap-5 justify-between w-full px-5">
        <div className="mt-4">
          <div className="flex flex-row justify-between mb-1">
            <h5 className="ml-4"> Amount</h5>

            <div
              className="text-sm flex items-center justify-end h-6 cursor-pointer"
              onClick={() => {
                if (balance === null) return;

                setAmount(balance);
              }}
            >
              <Image
                className="mr-1 opacity-60 relative"
                src={walletImg}
                height={18}
                width={18}
                alt="Wallet icon"
              />
              <span className="text-txtfade font-mono text-xs mr-1">
                {balance !== null ? `${formatNumber(balance, 2)} ADX` : '–'}
              </span>
              <RefreshButton className="ml-1" />
            </div>
          </div>

          <div className="relative flex flex-row w-full">
            <div className="flex items-center bg-bcolor border rounded-l-xl px-3  border-r-none">
              <p className="opacity-50 font-mono text-sm">ADX</p>
            </div>
            <input
              className="w-full bg-inputcolor border border-bcolor rounded-xl rounded-l-none p-3 px-4 text-xl font-mono"
              type="number"
              onWheel={(e) => {
                // Disable the scroll changing input value
                (e.target as HTMLInputElement).blur();
              }}
              value={amount ?? ''}
              onChange={onStakeAmountChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-row gap-1 mb-2 ml-4">
            <Image
              className="relative"
              src={lockIcon}
              width={14}
              height={18}
              alt="lock icon"
            />
            <h5 className="text-sm font-medium ">Lock duration (days)</h5>
          </div>

          <TabSelect
            className="font-mono"
            selected={lockPeriod}
            initialSelectedIndex={lockPeriods.findIndex(
              (x) => x.title === lockPeriod,
            )}
            tabs={lockPeriods}
            onClick={(title) => {
              setLockPeriod(title);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 justify-between w-full p-5 ">
        <ul className="flex flex-col gap-2">
          <li className="text-sm opacity-25">Benefits</li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50"> Days </p>
            <p className="text-sm font-mono"> {lockPeriod}</p>
          </li>

          {ADX_STAKE_MULTIPLIERS[lockPeriod].usdc ? (
            <li className="flex flex-row justify-between">
              <p className="text-sm opacity-50">USDC yield</p>
              <p className="text-sm font-mono">
                {ADX_STAKE_MULTIPLIERS[lockPeriod].usdc}x
              </p>
            </li>
          ) : null}

          {ADX_STAKE_MULTIPLIERS[lockPeriod].adx ? (
            <li className="flex flex-row justify-between">
              <p className="text-sm opacity-50">ADX token yield </p>
              <p className="text-sm font-mono">
                {ADX_STAKE_MULTIPLIERS[lockPeriod].adx}x
              </p>
            </li>
          ) : null}

          {ADX_STAKE_MULTIPLIERS[lockPeriod].votes ? (
            <li className="flex flex-row justify-between">
              <p className="text-sm opacity-50">
                Base voting power multiplier{' '}
              </p>
              <p className="text-sm font-mono">
                {ADX_STAKE_MULTIPLIERS[lockPeriod].votes}x
              </p>
            </li>
          ) : null}
        </ul>

        <Button
          className="w-full"
          size="lg"
          title={errorMessage ? errorMessage : '[S]take'}
          disabled={!!errorMessage || !amount}
          onClick={stakeAmount}
        />
      </div>
    </div>
  );
}
