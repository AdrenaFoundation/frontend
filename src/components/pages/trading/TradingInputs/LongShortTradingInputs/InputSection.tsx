import { WalletBalancesState } from '@/reducers/walletBalancesReducer';
import { Token } from '@/types';
import { formatPriceInfo } from '@/utils';

import LeverageSlider from '../../../../common/LeverageSlider/LeverageSlider';
import TradingInput from '../../TradingInput/TradingInput';
import { WalletBalance } from './WalletBalance';

interface InputSectionProps {
  tokenA: Token;
  allowedTokenA: Token[];
  walletTokenBalances: WalletBalancesState;
  inputA: number | null;
  leverage: number;
  priceA: number | null;
  recommendedToken?: Token;
  onTokenASelect: (token: Token) => void;
  onInputAChange: (value: number | null) => void;
  onLeverageChange: (value: number) => void;
  onMax: () => void;
}

export const InputSection = ({
  tokenA,
  allowedTokenA,
  walletTokenBalances,
  inputA,
  leverage,
  priceA,
  onTokenASelect,
  onInputAChange,
  onLeverageChange,
  onMax,
  recommendedToken,
}: InputSectionProps) => {
  const handlePercentageClick = (percentage: number) => {
    const balance = walletTokenBalances?.[tokenA.symbol] ?? 0;
    const amount = balance * (percentage / 100);
    const roundedAmount = Number(
      amount.toFixed(tokenA.displayAmountDecimalsPrecision),
    );
    onInputAChange(roundedAmount);
  };

  return (
    <>
      <div className="flex w-full justify-between items-center sm:mt-2 sm:mb-1">
        <h5 className="text-sm font-medium">Provide</h5>

        <WalletBalance
          tokenA={tokenA}
          walletTokenBalances={walletTokenBalances}
          onMax={onMax}
          onPercentageClick={handlePercentageClick}
        />
      </div>

      <div className="flex">
        <div className="flex flex-col border rounded-lg w-full bg-inputcolor border-white/10 relative">
          <TradingInput
            className="text-sm rounded-full"
            inputClassName="border-0 tr-rounded-lg bg-inputcolor"
            value={inputA}
            subText={
              priceA ? (
                <div className="text-xs text-txtfade font-mono">
                  {priceA > 500000000
                    ? `> ${formatPriceInfo(500000000)}`
                    : formatPriceInfo(priceA)}
                </div>
              ) : null
            }
            selectedToken={tokenA}
            tokenList={allowedTokenA}
            onTokenSelect={onTokenASelect}
            onChange={onInputAChange}
            recommendedToken={recommendedToken}
          />

          <LeverageSlider
            value={leverage}
            className="w-full font-mono select-none"
            onChange={onLeverageChange}
          />
        </div>
      </div>
    </>
  );
};
