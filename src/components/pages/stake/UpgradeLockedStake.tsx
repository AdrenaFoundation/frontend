import { BN } from '@coral-xyz/anchor';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import SelectOptions from '@/components/common/SelectOptions/SelectOptions';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import {
  ADX_LOCK_PERIODS,
  ADX_STAKE_MULTIPLIERS,
  ALP_LOCK_PERIODS,
  ALP_STAKE_MULTIPLIERS,
} from '@/constant';
import { useSelector } from '@/store/store';
import { AdxLockPeriod, AlpLockPeriod, LockedStakeExtended } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

import infoIcon from '../../../../public/images/Icons/info.svg';
import lockIcon from '../../../../public/images/Icons/lock.svg';
import warningIcon from '../../../../public/images/Icons/warning.png';
import walletImg from '../../../../public/images/wallet-icon.svg';

export default function UpgradeLockedStake({
  lockedStake,
  handleUpgradeLockedStake: handleUpgradeLockedStake,
}: {
  lockedStake: LockedStakeExtended;
  handleUpgradeLockedStake: (p: {
    lockedStake: LockedStakeExtended;
    upgradedDuration?: AdxLockPeriod | AlpLockPeriod;
    additionalAmount?: number;
  }) => Promise<void>;
}) {
  const [amount, setAmount] = useState<number | null>(null);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const actualDuration = Math.floor(
    lockedStake.lockDuration.toNumber() / 3600 / 24,
  );

  const [lockPeriod, setLockPeriod] = useState<AdxLockPeriod | AlpLockPeriod>(
    actualDuration as AdxLockPeriod | AlpLockPeriod,
  );

  // Force typing for now, need to do something clean with templates
  const LOCK_PERIODS =
    lockedStake.tokenSymbol === 'ALP' ? ALP_LOCK_PERIODS : ADX_LOCK_PERIODS;

  const STAKE_MULTIPLIERS =
    lockedStake.tokenSymbol === 'ALP'
      ? ALP_STAKE_MULTIPLIERS
      : ADX_STAKE_MULTIPLIERS;

  const lockPeriods = LOCK_PERIODS.map((lockPeriod) => ({
    title: lockPeriod,
    activeColor: 'border-white',
    disabled: lockPeriod < actualDuration,
  })).filter((x) => x.title !== 0);

  const walletBalance: number | null =
    walletTokenBalances?.[lockedStake.tokenSymbol] ?? null;

  const onStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setAmount(null);
      setErrorMessage('');
      return;
    }

    const minAmount =
      lockedStake.tokenSymbol === 'ALP'
        ? nativeToUi(new BN(1), window.adrena.client.alpToken.decimals)
        : nativeToUi(new BN(1), window.adrena.client.adxToken.decimals);

    if (walletBalance === null || Number(value) > walletBalance) {
      setErrorMessage('Insufficient balance');
    } else if (Number(value) < minAmount) {
      setErrorMessage(`Minimum stake amount is ${minAmount}`);
    } else {
      setErrorMessage('');
    }

    setAmount(Number(value));
  };

  // Force typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const multipliers = (STAKE_MULTIPLIERS as any)[lockPeriod] as unknown as {
    usdc: number;
    adx: number;
    votes?: number;
  };

  return (
    <div className={twMerge('flex-col pb-4 sm:pb-0')}>
      <div className="min-h-[10em] flex flex-col gap-4 items-center justify-center text-center text-sm p-4">
        <div>Upgrade an existing stake, in duration and/or quantity.</div>

        <div className="w-full bg-bcolor h-[1px]" />

        <div className="bg-blue/30 p-4 border-dashed border-blue rounded flex relative w-full pl-10">
          <Image
            className="opacity-60 absolute left-3 top-auto bottom-auto"
            src={infoIcon}
            height={16}
            width={16}
            alt="Info icon"
          />
          The upgraded stake will accrue rewards right away.
        </div>

        <Tippy
          content={
            <div className="text-sm flex flex-col text-center">
              Example: if you&apos;ve been staked for 30 out of a 90 days lock,
              upgrading to 180 days lock will bring you back to 0/180 for the
              whole amount
            </div>
          }
          placement="auto"
        >
          <div className="bg-orange/30 p-4 border-dashed border-orange rounded flex relative w-full pl-10">
            <Image
              className="opacity-100 absolute left-3 top-auto bottom-auto"
              src={warningIcon}
              height={20}
              width={20}
              alt="Warning icon"
            />
            If upgraded, the stake will unlock in {lockPeriod} days.
          </div>
        </Tippy>
      </div>

      <div className="w-full bg-bcolor h-[1px]" />

      <div className="flex flex-col gap-5 justify-between w-full pl-6 pr-6">
        <div className="mt-4">
          <div className="flex flex-row items-center justify-between mb-1">
            <h5 className="font-semibold"> Additional Amount</h5>

            <div className="text-sm flex items-center justify-end h-6">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => {
                  if (walletBalance === null) return;

                  setAmount(walletBalance);
                }}
              >
                <Image
                  className="mr-1 opacity-60 relative w-3 h-3"
                  src={walletImg}
                  height={18}
                  width={18}
                  alt="Wallet icon"
                />

                <span className="text-txtfade font-mono text-xs mr-1">
                  {walletBalance !== null
                    ? `${formatNumber(walletBalance, lockedStake.tokenSymbol === 'ALP' ? window.adrena.client.alpToken.displayAmountDecimalsPrecision : window.adrena.client.adxToken.displayAmountDecimalsPrecision)} ${
                        lockedStake.tokenSymbol
                      }`
                    : '–'}
                </span>
              </div>
              <RefreshButton className="ml-1" />
            </div>
          </div>

          <div className="relative flex flex-row w-full border border-white/10 rounded-md overflow-hidden">
            <div className="flex items-center bg-bcolor border rounded-l-xl px-3  border-r-white/10">
              <p className="opacity-50 font-mono text-sm">
                {lockedStake.tokenSymbol}
              </p>
            </div>
            <input
              className="w-full bg-inputcolor rounded-md rounded-l-none p-3 px-4 text-xl font-mono"
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

        <div className="mt-4">
          <div className="flex flex-row gap-1 mb-2">
            <Image
              className="relative"
              src={lockIcon}
              width={14}
              height={18}
              alt="lock icon"
            />
            <h5 className="text-sm font-semibold">New Lock Duration (days)</h5>
          </div>

          <SelectOptions
            selected={lockPeriod}
            options={lockPeriods}
            onClick={(title) => {
              setLockPeriod(title);
            }}
          />
        </div>
      </div>

      <div className="px-6">
        <div className="text-sm opacity-30 mt-4">Benefits</div>

        <div className="w-full justify-between items-center flex mt-2 flex-wrap">
          <div className="flex flex-col items-center justify-center">
            <div className="font-mono text-2xl">{lockPeriod}</div>
            <div className="text-txtfade text-xs">days</div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="font-mono text-2xl">{multipliers.usdc}x</div>
            <div className="text-txtfade text-xs">USDC yield</div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="font-mono text-2xl">{multipliers.adx}x</div>
            <div className="text-txtfade text-xs">ADX yield</div>
          </div>

          {lockedStake.tokenSymbol === 'ADX' && multipliers.votes ? (
            <div className="flex flex-col items-center justify-center">
              <div className="font-mono text-2xl">{multipliers.votes}x</div>
              <div className="text-txtfade text-xs">Voting power</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pb-4 pl-4 pr-4 mb-4">
        <Button
          className="w-full mt-8"
          size="lg"
          title={errorMessage ? errorMessage : 'Upgrade'}
          disabled={!!errorMessage || (lockPeriod == actualDuration && !amount)}
          onClick={() => {
            return handleUpgradeLockedStake({
              lockedStake,
              upgradedDuration:
                lockPeriod !== actualDuration ? lockPeriod : undefined,
              additionalAmount: amount ?? undefined,
            });
          }}
        />
      </div>
    </div>
  );
}
