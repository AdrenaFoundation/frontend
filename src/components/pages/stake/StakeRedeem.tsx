import React, { useState } from 'react';

import Button from '@/components/common/Button/Button';
import { formatNumber } from '@/utils';

export default function StakeRedeem({
  tokenSymbol,
  totalLiquidStaked,
  handleRemoveLiquidStake,
}: {
  tokenSymbol: 'ADX' | 'ALP';
  totalLiquidStaked: number;
  handleRemoveLiquidStake: (amount: number) => void;
}) {
  const [amount, setAmount] = useState<number | null>(null);

  return (
    <div className="p-5">
      <div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-sm font-semibold"> Amount</p>
          <p
            className="text-sm font-mono cursor-pointer"
            onClick={() => {
              if (!totalLiquidStaked) {
                return;
              }
              setAmount(totalLiquidStaked);
            }}
          >
            <span className="opacity-50"> Total reedemable · </span>
            {totalLiquidStaked
              ? `${formatNumber(totalLiquidStaked, 2)} ${tokenSymbol}`
              : '–'}
          </p>
        </div>
        <div className="relative flex flex-row w-full mt-2 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center bg-bcolor border border-bcolor rounded-l-xl px-3 border-r-none">
            <p className="opacity-50 font-mono text-sm">{tokenSymbol}</p>
          </div>
          <input
            className="w-full bg-inputcolor rounded-xl rounded-l-none p-3 px-4 text-xl font-mono"
            style={{ borderColor: '#2a2a2a' }}
            type="number"
            onWheel={(e) => {
              // Disable the scroll changing input value
              (e.target as HTMLInputElement).blur();
            }}
            value={amount ?? ''}
            onChange={(e) => {
              if (
                !e.target.value ||
                Number(e.target.value) > totalLiquidStaked
              ) {
                setAmount(null);
                return;
              }
              setAmount(Number(e.target.value));
            }}
            placeholder="0.00"
            max={totalLiquidStaked}
          />
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full mt-6"
        size="lg"
        title="Remove stake"
        disabled={!amount}
        onClick={() => {
          if (!amount) {
            return;
          }
          return handleRemoveLiquidStake(amount);
        }}
      />
    </div>
  );
}
