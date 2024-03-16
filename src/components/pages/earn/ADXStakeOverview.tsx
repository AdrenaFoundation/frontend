import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import { formatNumber, formatPriceInfo } from '@/utils';

import walletIcon from '../../../../public/images/wallet-icon.svg';

export type ADXTokenDetails = {
  balance: number | null;
  totalLiquidStaked: number | null;
  totalLockedStake: number | null;
  totalStaked: number | null;
  totalRedeemableStake: number | null;
  totalLiquidStakedUSD: number | null;
  totalLockedStakeUSD: number | null;
  totalRedeemableStakeUSD: number | null;
};

export default function ADXStakeOverview({
  tokenDetails,
  setActiveToken,
  setActiveRedeemToken,
}: {
  tokenDetails: ADXTokenDetails;
  setActiveToken: () => void;
  setActiveRedeemToken: () => void;
}) {
  const adx = window.adrena.client.adxToken;

  return (
    <div className="bg-gray-300/85 backdrop-blur-md border border-gray-200 lg:w-1/2 rounded-2xl">
      <div className="flex flex-row gap-2 items-center p-4 border-b border-b-gray-200">
        <div className={`p-1 bg-red-500 rounded-full`}>
          <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
            {adx.symbol}
          </p>
        </div>
        <div>
          <div className="flex flex-row gap-1 items-center opacity-50">
            <Image src={walletIcon} width={16} height={16} alt="wallet" />
            <p className="text-sm font-mono">
              {tokenDetails.balance !== null
                ? `${formatNumber(tokenDetails.balance, 3)} ADX`
                : '-'}
            </p>
          </div>

          <p className="font-medium">{adx.name}</p>
        </div>
      </div>

      <div className="p-4">
        <div>
          <p className="text-sm opacity-50">My Total Stake</p>
          <p className="text-xl font-medium font-mono">
            {formatNumber(tokenDetails.totalStaked ?? 0, 2)} ADX
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 justify-between bg-dark border border-gray-200 rounded-2xl mt-5 p-4">
          <div className="sm:border-r sm:border-r-gray-200">
            <p className="text-sm opacity-50">My liquid Stake</p>
            <p className="text-lg font-medium font-mono">
              {tokenDetails.totalLiquidStaked} ADX
            </p>

            <p className="opacity-50 font-mono overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalLiquidStakedUSD)}
            </p>
          </div>

          <div className="sm:text-center">
            <p className="text-sm opacity-50">My Locked Stake</p>
            <p className="text-lg font-medium font-mono">
              {formatNumber(tokenDetails.totalLockedStake ?? 0, 2)} ADX
            </p>
            <p className="opacity-50 font-mono overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalLockedStakeUSD)}
            </p>
          </div>

          <div className="sm:text-right sm:border-l sm:border-l-gray-200">
            <p className="text-sm opacity-50">Total Redeemable ADX</p>
            <p className="text-lg font-medium font-mono">
              {tokenDetails.totalRedeemableStake} ADX
            </p>
            <p className="opacity-50 font-mono  overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalRedeemableStakeUSD)}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 mt-5">
          <Button
            className="w-full"
            variant="primary"
            size="lg"
            title="Stake ADX"
            onClick={() => setActiveToken()}
          />

          <Button
            className="w-full"
            variant="outline"
            size="lg"
            title="Redeem Liquid ADX"
            onClick={() => setActiveRedeemToken()}
          />
        </div>
      </div>
    </div>
  );
}
