import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import { Token } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

import walletIcon from '../../../../public/images/wallet-icon.svg';

export default function StakeOverview({
  tokenDetails,
  setActiveToken,
  setActiveRedeemToken,
}: {
  tokenDetails: {
    token: Token;
    balance: number | null;
    totalLiquidStaked: number | null;
    totalLockedStake: number | null;
    totalStaked: number | null;
    totalReedemableStake: number | null;
    totalLiquidStakedUSD: number | null;
    totalLockedStakeUSD: number | null;
    totalReedemableStakeUSD: number | null;
  };
  setActiveToken: (token: 'ADX' | 'ALP' | null) => void;
  setActiveRedeemToken: (tokenSymbol: 'ADX' | 'ALP') => void;
}) {
  return (
    <div className="bg-black/70 backdrop-blur-md border border-gray-300 lg:w-1/2 rounded-lg">
      <div className="flex flex-row gap-2 items-center p-4 border-b border-b-gray-300">
        <div
          className={`p-1 bg-${
            tokenDetails.token.symbol === 'ADX' ? 'red' : 'blue'
          }-500 rounded-full`}
        >
          <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
            {tokenDetails.token.symbol === 'ADX' ? 'ADX' : 'ALP'}
          </p>
        </div>
        <div>
          <div className="flex flex-row gap-1 items-center opacity-50">
            <Image src={walletIcon} width={16} height={16} alt="wallet" />
            <p className="text-xs font-mono">
              {tokenDetails.balance
                ? `${formatNumber(tokenDetails.balance, 3)} ${
                    tokenDetails.token.symbol
                  }`
                : '-'}
            </p>
          </div>

          <p className="font-medium">{tokenDetails.token.name}</p>
        </div>
      </div>

      <div className="p-4">
        <div>
          <p className="text-sm opacity-50">My Total Stake</p>
          <p className="text-xl font-medium font-mono">
            {formatNumber(tokenDetails.totalStaked ?? 0, 2)}{' '}
            {tokenDetails.token.symbol}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 justify-between bg-[#0d0d0d] border border-gray-300 rounded-lg mt-5 p-4">
          <div className="sm:border-r sm:border-r-gray-300">
            <p className="text-sm opacity-50">My liquid Stake</p>
            <p className="text-lg font-medium font-mono">
              {tokenDetails.totalLiquidStaked} {tokenDetails.token.symbol}
            </p>
            <p className="opacity-50 font-mono overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalLiquidStakedUSD)}
            </p>
          </div>

          <div className="sm:text-center">
            <p className="text-sm opacity-50">My Locked Stake</p>
            <p className="text-lg font-medium font-mono">
              {formatNumber(tokenDetails.totalLockedStake ?? 0, 2)}{' '}
              {tokenDetails.token.symbol}
            </p>
            <p className="opacity-50 font-mono overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalLockedStakeUSD)}
            </p>
          </div>

          <div className="sm:text-right sm:border-l sm:border-l-gray-300">
            <p className="text-sm opacity-50">
              Total Redeemable {tokenDetails.token.symbol}
            </p>
            <p className="text-lg font-medium font-mono">
              {tokenDetails.totalReedemableStake} {tokenDetails.token.symbol}
            </p>
            <p className="opacity-50 font-mono  overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalReedemableStakeUSD)}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 mt-5">
          <Button
            className="w-full"
            variant="primary"
            size="lg"
            title={`Stake ${tokenDetails.token.symbol}`}
            onClick={() =>
              setActiveToken(tokenDetails.token.symbol as 'ADX' | 'ALP')
            }
          />

          <Button
            className="w-full"
            variant="secondary"
            size="lg"
            title={`Redeem ${tokenDetails.token.symbol}`}
            onClick={() =>
              setActiveRedeemToken(tokenDetails.token.symbol as 'ADX' | 'ALP')
            }
          />
        </div>
      </div>
    </div>
  );
}
