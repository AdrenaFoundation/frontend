import { useCallback, useEffect, useRef } from 'react';

import { normalize } from '@/constant';
import { EnrichedPositionApi, PositionExtended, Token } from '@/types';
import { formatPriceInfo, getTokenSymbol } from '@/utils';

import {
  IDatafeedChartApi,
  LibrarySymbolInfo,
  Mark,
} from '../../../../../public/charting_library/charting_library';
import { ChartPreferences } from './types';

export function useMarks({
  allActivePositions,
  positionsHistory,
  activeToken,
  walletAddress,
  chartPreferences,
}: {
  allActivePositions: PositionExtended[] | null;
  positionsHistory: EnrichedPositionApi[] | null;
  activeToken: Token | null;
  walletAddress: string | null;
  chartPreferences: ChartPreferences;
}): {
  getMarksCallback: IDatafeedChartApi['getMarks'];
} {
  const walletAddressRef = useRef<string | null>(walletAddress);
  const chartPreferencesRef = useRef<ChartPreferences>(chartPreferences);
  const tokenSymbolRef = useRef<string | null>(
    activeToken ? getTokenSymbol(activeToken.symbol) : null,
  );
  const positionsHistoryRef = useRef<EnrichedPositionApi[] | null>(
    positionsHistory,
  );
  const allActivePositionsRef = useRef<PositionExtended[] | null>(
    allActivePositions,
  );

  useEffect(() => {
    if (activeToken) {
      tokenSymbolRef.current = activeToken.symbol;
    } else {
      tokenSymbolRef.current = null;
    }
  }, [activeToken]);

  useEffect(() => {
    positionsHistoryRef.current = positionsHistory;
  }, [positionsHistory]);

  useEffect(() => {
    allActivePositionsRef.current = allActivePositions;
  }, [allActivePositions]);

  useEffect(() => {
    walletAddressRef.current = walletAddress;
  }, [walletAddress]);

  useEffect(() => {
    chartPreferencesRef.current = chartPreferences;
  }, [chartPreferences]);

  const getMarksCallback = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (
      _symbolInfo: LibrarySymbolInfo,
      _from: number,
      _to: number,
      onDataCallback: (data: Mark[]) => void,
    ) => {
      if (
        chartPreferencesRef.current.showPositionHistory === false &&
        chartPreferencesRef.current.showAllActivePositions === false
      ) {
        return onDataCallback([]);
      }

      const data: Mark[] | [] = chartPreferencesRef.current
        .showAllActivePositions
        ? getAllActivePositionsMarks()
        : getPositionHistoryMarks();

      onDataCallback(data);
    },
    // Include positionsHistory and allActivePositions as dependencies so marks refresh when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      positionsHistory,
      // allActivePositions, // disabled
      chartPreferences.showPositionHistory,
      // chartPreferences.showAllActivePositions, // disabled
    ],
  );

  const getPositionHistoryMarks = useCallback(() => {
    const tokenSymbol = tokenSymbolRef.current;
    const currentWalletAddress = walletAddressRef.current;

    if (!currentWalletAddress) {
      console.log(
        '[getMarks]: Skipping marks retrieval due to missing wallet address or showPositionHistory preference',
      );
      return [];
    }

    const currentPositionsHistory = positionsHistoryRef.current;

    if (!currentPositionsHistory || !tokenSymbol) {
      return [];
    }

    const positions = currentPositionsHistory.filter(
      (position) =>
        getTokenSymbol(position.token.symbol) === getTokenSymbol(tokenSymbol),
    );

    const maxLiquidationPrice = Math.max(
      ...positions.map((p) => Math.abs(p.pnl)),
    );
    const minLiquidationPrice = Math.min(
      ...positions.map((p) => Math.abs(p.pnl)),
    );

    const data = positions
      .map((position) => {
        if (!position.exitDate) {
          return null;
        }
        const endDate = Math.floor(
          new Date(position.exitDate).getTime() / 1000,
        );

        const size = normalize(
          Math.abs(position.pnl),
          12,
          25,
          minLiquidationPrice,
          maxLiquidationPrice,
        );

        return {
          id: position.positionId,
          time: endDate,
          color: position.pnl > 0 ? 'green' : 'red',
          text: `pnl: ${formatPriceInfo(position.pnl, 2, 0, 0)}`,
          label: position.side === 'long' ? 'L' : 'S',
          labelFontColor: 'white',
          minSize: size,
        } as Mark;
      })
      .filter((mark) => mark !== null);

    return data;
  }, []);

  const getAllActivePositionsMarks = useCallback(() => {
    const tokenSymbol = tokenSymbolRef.current;

    if (!allActivePositionsRef.current || !tokenSymbol) {
      console.log('[getMarks]: No active positions or token symbol');
      return [];
    }
    const positions = allActivePositionsRef.current.filter(
      (position) =>
        getTokenSymbol(position.token.symbol) === getTokenSymbol(tokenSymbol),
    );

    const maxPnl = Math.max(...positions.map((p) => Math.abs(p.pnl!)));
    const minPnl = Math.min(...positions.map((p) => Math.abs(p.pnl!)));

    const data = positions
      .map((position, i) => {
        const size = normalize(Math.abs(position.pnl!), 12, 25, minPnl, maxPnl);

        // Create detailed hover text with position information
        const leverage =
          position.currentLeverage || position.initialLeverage || 'N/A';
        const positionSize = position.size
          ? `${position.size.toFixed(4)} ${getTokenSymbol(position.token.symbol)}`
          : 'N/A';
        const collateral = position.collateralUsd
          ? `${formatPriceInfo(position.collateralUsd, 2, 0, 0)}`
          : 'N/A';
        const pnl = position.pnl
          ? `${formatPriceInfo(position.pnl, 2, 0, 0)}`
          : '$0.00';
        const entryPrice = `${formatPriceInfo(position.price, 2, 0, 0)}`;

        // Try different line break approaches
        const detailedText = `${position.side.toUpperCase()} Position -
Entry: ${entryPrice} -
Collateral: ${collateral} -
Leverage: ${Math.round(Number(leverage))}x -
Size: ${positionSize} -
Liq: ${formatPriceInfo(Number(position.liquidationPrice), 2, 0, 0)} -
P&L: ${pnl}`;

        return {
          id: i,
          time: position.openDate
            ? Math.floor(new Date(position.openDate).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          color:
            position.owner.toBase58() === walletAddressRef.current
              ? 'blue'
              : position.pnl && position.pnl > 0
                ? 'green'
                : 'red',
          text: detailedText,
          label: position.side === 'long' ? 'L' : 'S',
          labelFontColor: 'white',
          minSize: size,
        } as Mark;
      })
      .filter((mark) => mark !== null);
    return data;
  }, []);

  return {
    getMarksCallback,
  };
}
