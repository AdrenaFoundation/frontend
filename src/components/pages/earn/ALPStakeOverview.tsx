import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import { formatNumber, formatPriceInfo } from '@/utils';

import walletIcon from '../../../../public/images/wallet-icon.svg';

export type ALPTokenDetails = {
  balance: number | null;
  totalLockedStake: number | null;
  totalLockedStakeUSD: number | null;
  totalRedeemableStake: number | null;
  totalRedeemableStakeUSD: number | null;
};

export default function ALPStakeOverview({
  tokenDetails,
  setActiveToken,
}: {
  tokenDetails: ALPTokenDetails;
  setActiveToken: () => void;
}) {
  const token = window.adrena.client.alpToken;

  return (
    <div className="bg-gray-300/85 backdrop-blur-md border border-gray-200 lg:w-1/2 rounded-2xl">
      <div className="flex flex-row gap-2 items-center p-4 border-b border-b-gray-200">
        <div className={`p-1 bg-blue-500 rounded-full`}>
          <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
            ALP
          </p>
        </div>
        <div>
          <div className="flex flex-row gap-1 items-center opacity-50">
            <Image src={walletIcon} width={16} height={16} alt="wallet" />
            <p className="text-sm font-mono">
              {tokenDetails.balance !== null
                ? `${formatNumber(tokenDetails.balance, 3)} ALP`
                : '-'}
            </p>
          </div>

          <p className="font-medium">{token.name}</p>
        </div>
      </div>

      <div className="p-4">
        <div>
          <p className="text-sm opacity-50">My Total Stake</p>
          <p className="text-xl font-medium font-mono">
            {formatNumber(tokenDetails.totalLockedStake ?? 0, 2)} ALP
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-0 justify-between bg-dark border border-gray-200 rounded-2xl mt-5 p-4">
          <div className="sm:text-center">
            <p className="text-sm opacity-50">My Locked Stake</p>
            <p className="text-lg font-medium font-mono">
              {formatNumber(tokenDetails.totalLockedStake ?? 0, 2)} ALP
            </p>
            <p className="opacity-50 font-mono overflow-hidden text-ellipsis">
              {formatPriceInfo(tokenDetails.totalLockedStakeUSD)}
            </p>
          </div>

          <div className="sm:text-right sm:border-l sm:border-l-gray-200">
            <p className="text-sm opacity-50">Total Redeemable ALP</p>
            <p className="text-lg font-medium font-mono">
              {tokenDetails.totalRedeemableStake} ALP
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
            title="Stake ALP"
            onClick={() => setActiveToken()}
          />
        </div>
      </div>
    </div>
  );
}
