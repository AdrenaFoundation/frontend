import { useCallback, useEffect, useState, useRef } from 'react';

import DataApiClient from '@/DataApiClient';
import { ClaimHistoryExtended, ClaimHistoryExtendedApi } from '@/types';

export default function useClaimHistory({
  walletAddress,
  offset = 0,
  limit = 1000,
  symbol = 'ADX',
}: {
  walletAddress: string | null;
  offset?: number;
  limit?: number;
  symbol?: 'ADX' | 'ALP';
}): {
  claimsHistory: ClaimHistoryExtendedApi | null;
  optimisticClaimAdx: ClaimHistoryExtended[];
  optimisticAllTimeAdxClaimedAllSymbols: number;
  optimisticAllTimeUsdcClaimedAllSymbols: number;
  setOptimisticClaimAdx: (claims: ClaimHistoryExtended[]) => void;
  setOptimisticAllTimeAdxClaimedAllSymbols: (claims: number) => void;
  setOptimisticAllTimeUsdcClaimedAllSymbols: (claims: number) => void;
  triggerClaimsReload: () => Promise<void>;
  hasDataForPage: (pageOffset: number, pageLimit: number) => boolean;
} {
  const [claimsHistory, setClaimsHistory] =
    useState<ClaimHistoryExtendedApi | null>(null);

  const [optimisticClaimAdx, setOptimisticClaimAdx] = useState<
    ClaimHistoryExtended[]
  >([]);

  const [
    optimisticAllTimeAdxClaimedAllSymbols,
    setOptimisticAllTimeAdxClaimedAllSymbols,
  ] = useState<number>(0);
  const [
    optimisticAllTimeUsdcClaimedAllSymbols,
    setOptimisticAllTimeUsdcClaimedAllSymbols,
  ] = useState<number>(0);

  // Keep track of the current offset and limit to prevent duplicate API calls
  // and ensure interval uses current values
  const currentParamsRef = useRef({ offset, limit });

  // Keep track of the refresh interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref when props change
  useEffect(() => {
    currentParamsRef.current = { offset, limit };
  }, [offset, limit]);

  // Function to set up the refresh interval
  const setupRefreshInterval = useCallback(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up a new interval
    intervalRef.current = setInterval(() => {
      console.log('Hook: Auto-refreshing claims data');
      loadClaimsHistory();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const loadClaimsHistory = useCallback(async () => {
    // Always use the latest values from the ref
    const { offset: currentOffset, limit: currentLimit } =
      currentParamsRef.current;

    console.log(
      'Hook: loadClaimsHistory called with offset =',
      currentOffset,
      'limit =',
      currentLimit,
    );

    // Reset the interval when manually loading to prevent overlapping requests
    if (intervalRef.current) {
      console.log('Hook: Resetting automatic refresh interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!walletAddress || !window.adrena.client.readonlyConnection) {
      console.log(
        'Hook: No wallet address or readonly connection, returning null',
      );
      setClaimsHistory(null);
      return;
    }

    try {
      console.log(
        'Hook: Fetching claims history with offset =',
        currentOffset,
        'limit =',
        currentLimit,
      );
      const claimsHistory: ClaimHistoryExtendedApi | null =
        await DataApiClient.fetchClaimsHistory({
          walletAddress,
          offset: currentOffset,
          limit: currentLimit,
        });

      if (claimsHistory === null) {
        console.log('Hook: Claims history is null, returning');
        setClaimsHistory(null);
        return;
      }

      console.log(
        'Hook: Claims history fetched successfully, total claims =',
        claimsHistory.symbols.reduce(
          (acc, symbol) => acc + symbol.claims.length,
          0,
        ),
      );
      setClaimsHistory(claimsHistory);

      setOptimisticClaimAdx([]);
      setOptimisticAllTimeAdxClaimedAllSymbols(0);
      setOptimisticAllTimeUsdcClaimedAllSymbols(0);

      // Restart the interval after loading completes
      setupRefreshInterval();
    } catch (e) {
      console.log('Error loading claims history', e, String(e));

      // Restart the interval even if there was an error
      setupRefreshInterval();
      throw e;
    }
  }, [
    walletAddress,
    window.adrena.client.readonlyConnection,
    setupRefreshInterval,
  ]);

  // Only run the initial load and periodic refresh, not on offset/limit changes
  useEffect(() => {
    // Initial load
    loadClaimsHistory();

    // Set up periodic refresh with latest offset/limit values
    const cleanup = setupRefreshInterval();

    return () => {
      cleanup();
    };
  }, [
    walletAddress,
    window.adrena.client.readonlyConnection,
    loadClaimsHistory,
    setupRefreshInterval,
  ]);

  // Function to check if we already have data for a specific page
  const hasDataForPage = useCallback(
    (pageOffset: number, pageLimit: number): boolean => {
      if (!claimsHistory) return false;

      // Calculate total claims available
      const totalClaims = claimsHistory.symbols.reduce(
        (acc, symbol) => acc + symbol.claims.length,
        0,
      );

      // Check both the offset and that we have enough items for the requested page
      const hasOffset = claimsHistory.offset <= pageOffset;

      // Most importantly, check if there's ANY data available at the requested offset
      // If pageOffset is beyond the total claims, there's no data for that page
      const hasDataAtOffset = pageOffset < totalClaims;

      // Also check if we have enough items to satisfy the requested page
      const hasEnoughItems = totalClaims >= pageOffset + pageLimit;

      console.log(
        `Hook: hasDataForPage - pageOffset=${pageOffset}, pageLimit=${pageLimit}, totalClaims=${totalClaims}, hasOffset=${hasOffset}, hasDataAtOffset=${hasDataAtOffset}, hasEnoughItems=${hasEnoughItems}`,
      );

      // We have the data if we have the right offset AND there's data available at that offset
      // We don't necessarily need to have enough items - that just means the last page will be partially filled
      return hasOffset && hasDataAtOffset;
    },
    [claimsHistory],
  );

  return {
    claimsHistory,
    optimisticClaimAdx,
    optimisticAllTimeAdxClaimedAllSymbols,
    optimisticAllTimeUsdcClaimedAllSymbols,
    setOptimisticClaimAdx,
    setOptimisticAllTimeAdxClaimedAllSymbols,
    setOptimisticAllTimeUsdcClaimedAllSymbols,
    triggerClaimsReload: async () => {
      console.log(
        'Hook triggerClaimsReload: Starting data load with offset =',
        currentParamsRef.current.offset,
        'limit =',
        currentParamsRef.current.limit,
      );
      try {
        await loadClaimsHistory();
        console.log(
          'Hook triggerClaimsReload: Data loaded successfully for offset =',
          currentParamsRef.current.offset,
        );
      } catch (error) {
        console.error('Hook triggerClaimsReload: Error loading data:', error);
        throw error;
      }
    },
    hasDataForPage,
  };
}
