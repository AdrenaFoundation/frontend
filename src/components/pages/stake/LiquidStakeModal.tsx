import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { formatNumber } from '@/utils';

import walletImg from '../../../../public/images/wallet-icon.svg';

export default function LiquidStakeModal({
  balance,
  amount,
  setAmount,
  onStakeAmountChange,
  stakeAmount,
  errorMessage,
  tokenSymbol,
}: {
  balance: number | null;
  amount: number | null;
  setAmount: (amount: number | null) => void;
  onStakeAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stakeAmount: () => void;
  errorMessage: string;
  tokenSymbol: 'ADX' | 'ALP';
}) {
  return (
    <div className="flex flex-col rounded-md w-full sm:min-w-[25em] h-fit">
      <div className="flex flex-col gap-5 justify-between w-full px-5">
        <div className="mt-4">
          <div className="flex flex-row items-center justify-between mb-1">
            <h5 className="font-semibold">Amount</h5>

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
                {balance !== null
                  ? `${formatNumber(balance, 2)} ${tokenSymbol}`
                  : '–'}
              </span>
              <RefreshButton className="ml-1" />
            </div>
          </div>

          <div className="relative flex flex-row w-full border border-white/10 rounded-md overflow-hidden">
            <div className="flex items-center bg-bcolor border rounded-l-xl px-3 border-r border-r-white/10">
              <p className="opacity-50 font-mono text-sm">{tokenSymbol}</p>
            </div>
            <input
              className="w-full bg-inputcolor rounded-md rounded-l-none p-3 px-4 text-xl font-mono"
              type="number"
              onWheel={(e) => {
                (e.target as HTMLInputElement).blur();
              }}
              value={amount ?? ''}
              onChange={onStakeAmountChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="bg-blue/20 p-2 border border-blue/40 rounded-md">
          <p className="text-sm text-center">You can unstake at any time.</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 justify-between w-full p-5">
        <ul className="flex flex-col gap-2">
          <li className="text-sm opacity-25">Benefits</li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50">Lock Duration</p>
            <p className="text-sm font-mono">None</p>
          </li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50">USDC yield</p>
            <p className="text-sm font-mono">1x</p>
          </li>
          <li className="flex flex-row justify-between">
            <p className="text-sm opacity-50">ADX token yield</p>
            <p className="text-sm font-mono">0x</p>
          </li>
        </ul>

        <Button
          className="w-full"
          size="lg"
          title={errorMessage ? errorMessage : 'Stake (Liquid)'}
          disabled={!!errorMessage || !amount}
          onClick={stakeAmount}
        />
      </div>
    </div>
  );
}
