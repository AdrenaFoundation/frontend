import { useCallback, useEffect, useRef } from 'react';

import { normalize } from '@/constant';
import { EnrichedPositionApi, PositionExtended, Token } from '@/types';
import { getTokenSymbol } from '@/utils';

import {
  IDatafeedChartApi,
  LibrarySymbolInfo,
  Mark,
  ResolutionString,
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
    (
      symbolInfo: LibrarySymbolInfo,
      from: number,
      endDate: number,
      onDataCallback: (data: Mark[]) => void,
      resolution: ResolutionString,
    ) => {
      console.log('[getMarks]: Method call', {
        symbol: symbolInfo.ticker,
        from: new Date(from * 1000).toISOString(),
        to: new Date(endDate * 1000).toISOString(),
        resolution,
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
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
          text: `id: ${position.positionId}, pnl: ${position.pnl}`,
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

    console.log(
      '[getMarks]: All active positions retrieved',
      allActivePositionsRef.current,
      positions,
    );

    const maxLiquidationPrice = Math.max(
      ...positions.map((p) => Math.abs(p.pnl ?? 0)),
    );
    const minLiquidationPrice = Math.min(
      ...positions.map((p) => Math.abs(p.pnl ?? 0)),
    );

    const data = positions
      .map((position, i) => {
        const size = normalize(
          Math.abs(position.pnl ?? 0),
          12,
          25,
          minLiquidationPrice,
          maxLiquidationPrice,
        );

        return {
          id: i,
          time: position.openDate
            ? Math.floor(new Date(position.openDate).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          color: position.pnl && position.pnl > 0 ? 'green' : 'red',
          text: `idx: ${i}, pnl: ${position.pnl}`,
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
