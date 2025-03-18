import { Wallet } from '@coral-xyz/anchor';

import { CustodyExtended, PositionExtended, Token } from '@/types';

export interface TradingInputsProps {
  side: 'short' | 'long';
  className?: string;
  tokenA: Token;
  tokenB: Token;
  allowedTokenA: Token[];
  allowedTokenB: Token[];
  position: PositionExtended | null;
  wallet: Wallet | null;
  connected: boolean;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
  onLimitOrderAdded: () => void;
  setActivePositionModal?: (e: 'long' | 'short' | 'swap' | null) => void;
}

export interface TradingInputState {
  inputA: number | null;
  inputB: number | null;
  priceA: number | null;
  priceB: number | null;
  leverage: number;
  isLimitOrder: boolean;
  limitOrderTriggerPrice: number | null;
  limitOrderSlippage: number | null;
}

export interface PositionInfoState {
  newPositionInfo: {
    collateralUsd: number;
    sizeUsd: number;
    size: number;
    swapFeeUsd: number | null;
    entryPrice: number;
    liquidationPrice: number;
    exitFeeUsd: number;
    liquidationFeeUsd: number;
    highSwapFees: boolean;
  } | null;
  increasePositionInfo: {
    currentLeverage: number;
    weightedAverageEntryPrice: number;
    isLeverageIncreased: boolean;
    estimatedLiquidationPrice: number | null;
    newSizeUsd: number;
    newOverallLeverage: number;
  } | null;
  custody: CustodyExtended | null;
  insufficientAmount: boolean;
  isInfoLoading: boolean;
  errorMessage: string | null;
  priceA: number | null;
  priceB: number | null;
}
