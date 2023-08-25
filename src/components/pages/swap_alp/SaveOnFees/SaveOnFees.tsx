import { useMemo } from 'react';

import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token, TokenSymbol } from '@/types';

import SaveOnFeesBlocks from './SaveOnFeeBlocks';

type rowsType = Array<{
  token: Token;
  price: number | null;
  tokenBalance: number | null;
  balanceInUsd: number | null;
  available: number | null;
  fee: number | null;
  currentPoolAmount: number | null;
  currentPoolAmountUsd: number | null;
  maxPoolCapacity: number | null;
  equivalentAmount: number | null;
}>;

export default function SaveOnFees({
  allowedCollateralTokens,
  feesAndAmounts,
  onCollateralTokenChange,
  selectedAction,
  marketCap,
  isFeesLoading,
  setCollateralInput,
  collateralToken,
}: {
  allowedCollateralTokens: Token[];
  feesAndAmounts: {
    [tokenSymbol: TokenSymbol]: {
      fees: number | null;
      amount: number | null;
      equivalentAmount: number | null;
    };
  } | null;
  onCollateralTokenChange: (t: Token) => void;
  selectedAction: 'buy' | 'sell';
  marketCap: number | null;
  isFeesLoading: boolean;
  setCollateralInput: (value: number | null) => void;
  collateralToken: Token | null;
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const stats = useDailyStats();
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const rows: rowsType = useMemo(() => {
    return allowedCollateralTokens.map((token: Token) => {
      const price = tokenPrices[token.symbol] ?? null;

      const tokenBalance = walletTokenBalances?.[token.symbol] ?? null;

      const balanceInUsd =
        tokenBalance !== null && price ? tokenBalance * price : null;
      const custody = window.adrena.client.getCustodyByMint(token.mint);

      // calculates how much of the token is available for purchase/sale in usd
      const available = (() => {
        if (!stats || !marketCap || !custody || !price) return null;

        const custodyLiquidityUsd = custody.liquidity * price;

        const ratio =
          selectedAction === 'buy' ? custody.maxRatio : custody.minRatio;

        if (ratio === 1) return null;

        const availableTokens =
          (marketCap * ratio - custodyLiquidityUsd) / (price * (1 - ratio));

        const availableUsd = availableTokens * price;

        return Math.abs(availableUsd);
      })();

      const fee = feesAndAmounts?.[token.symbol].fees ?? null;

      const equivalentAmount =
        feesAndAmounts?.[token.symbol].equivalentAmount ?? null;

      const currentPoolAmount = custody.liquidity;
      const currentPoolAmountUsd =
        price !== null ? custody.liquidity * price : null;

      const maxPoolCapacity =
        currentPoolAmountUsd !== null && available !== null
          ? currentPoolAmountUsd + available
          : null;

      return {
        token,
        price,
        tokenBalance,
        balanceInUsd,
        available,
        fee,
        equivalentAmount,
        currentPoolAmount,
        currentPoolAmountUsd,
        maxPoolCapacity,
      };
    });
  }, [
    allowedCollateralTokens,
    tokenPrices,
    walletTokenBalances,
    feesAndAmounts,
    selectedAction,
    marketCap,
    stats,
    window.adrena.client.custodies,
  ]);

  return (
    <div className="relative bg-gray-200 border border-gray-300 p-4 rounded-lg grow">
      <h2 className="text-lg font-normal">Save on fees</h2>
      <p className="text-sm opacity-75 max-w-[700px]">
        {selectedAction === 'buy'
          ? 'Fees may vary depending on which asset you use to buy ALP. Enter the amount of ALP you want to purchase in the order form, then check here to compare fees.'
          : 'Fees may vary depending on which asset you sell ALP for. Enter the amount of ALP you want to redeem in the order form, then check here to compare fees.'}
      </p>
      <SaveOnFeesBlocks
        rows={rows}
        onCollateralTokenChange={onCollateralTokenChange}
        isFeesLoading={isFeesLoading}
        setCollateralInput={setCollateralInput}
        collateralToken={collateralToken}
      />
    </div>
  );
}
