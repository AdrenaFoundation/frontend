import Image from 'next/image';

import RefreshButton from '@/components/RefreshButton/RefreshButton';
import { Token } from '@/types';
import { formatNumber, formatNumberShort } from '@/utils';

import walletImg from '../../../../../../public/images/wallet-icon.svg';

interface WalletBalanceProps {
  tokenA: Token;
  walletTokenBalances: Record<string, number | null> | null;
  onMax: () => void;
  onPercentageClick: (percentage: number) => void;
}

export const WalletBalance = ({
  tokenA,
  walletTokenBalances,
  onMax,
  onPercentageClick,
}: WalletBalanceProps) => {
  if (!tokenA || !walletTokenBalances) {
    return <div className="h-6" />;
  }

  const balance = walletTokenBalances[tokenA.symbol] ?? null;

  if (balance === null) {
    return <div className="h-6" />;
  }

  const getPercentageAmount = (percentage: number) => {
    const amount = (balance * percentage) / 100;
    const roundedAmount = Number(
      amount.toFixed(tokenA.displayAmountDecimalsPrecision),
    );
    return formatNumber(roundedAmount, tokenA.displayAmountDecimalsPrecision);
  };

  return (
    <div className="text-sm flex items-center justify-end h-6 gap-0.5">
      <div className="flex items-center">
        {[10, 25, 50, 75].map((percentage) => (
          <button
            key={percentage}
            onClick={() => onPercentageClick(percentage)}
            className="px-1.5 py-0.5 hover:text-white text-txtfade font-mono text-xs cursor-pointer relative group"
            title={`${getPercentageAmount(percentage)} ${tokenA.symbol}`}
          >
            {percentage}%
          </button>
        ))}
      </div>
      <div className="w-0.5 h-3 bg-txtfade opacity-20 mr-1" />
      <div className="flex" onClick={onMax}>
        <Image
          className="mr-1 opacity-60 relative group-hover:opacity-100"
          src={walletImg}
          height={14}
          width={14}
          alt="Wallet icon"
        />
        <span className="text-txtfade font-mono text-xs cursor-pointer hover:text-white transition-colors">
          {formatNumberShort(balance, 4)}
        </span>
      </div>
      <RefreshButton className="border-0 ml-[0.1em] relative -top-[0.05em]" />
    </div>
  );
};
