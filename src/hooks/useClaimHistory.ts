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

  // Keep track of the current wallet address for the interval
  const walletAddressRef = useRef<string | null>(walletAddress);

  // Keep track of the refresh interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of the last refresh time to prevent too frequent updates
  const lastRefreshTimeRef = useRef<number>(0);

  // Update refs when props change
  useEffect(() => {
    currentParamsRef.current = { offset, limit };
    walletAddressRef.current = walletAddress;
  }, [offset, limit, walletAddress]);

  // Function to set up the refresh interval
  const setupRefreshInterval = useCallback(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up a new interval
    intervalRef.current = setInterval(() => {
      // Only auto-refresh if we're on page 1 (offset 0)
      const { offset: currentOffset } = currentParamsRef.current;
      const currentWalletAddress = walletAddressRef.current;
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
      const minimumRefreshInterval = 30000; // 30 seconds minimum between refreshes

      // Log the current wallet address for debugging
      console.log(
        'Hook: Auto-refresh check, currentWalletAddress =',
        currentWalletAddress,
      );

      if (
        currentWalletAddress &&
        currentOffset === 0 &&
        timeSinceLastRefresh >= minimumRefreshInterval
      ) {
        console.log('Hook: Auto-refreshing claims data');
        loadClaimsHistory();
      } else if (!currentWalletAddress) {
        console.log('Hook: Skipping auto-refresh, no wallet address available');
      } else if (currentOffset !== 0) {
        console.log(
          'Hook: Skipping auto-refresh because offset =',
          currentOffset,
          '(not on page 1)',
        );
      } else {
        console.log('Hook: Skipping auto-refresh, last refresh was too recent');
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const loadClaimsHistory = useCallback(async () => {
    // Early return if there's no wallet address
    const currentWalletAddress = walletAddressRef.current;
    if (!currentWalletAddress) {
      console.log(
        'Hook: No wallet address available, skipping data load. Current value:',
        currentWalletAddress,
      );
      return;
    }

    // Record the refresh time
    lastRefreshTimeRef.current = Date.now();

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

    try {
      console.log(
        'Hook: Fetching claims history with offset =',
        currentOffset,
        'limit =',
        currentLimit,
      );

      // We already checked currentWalletAddress is not null above
      const claimsHistory: ClaimHistoryExtendedApi | null =
        await DataApiClient.fetchClaimsHistory({
          walletAddress: currentWalletAddress,
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
  }, [setupRefreshInterval]);

  // Only run the initial load and periodic refresh, not on offset/limit changes
  useEffect(() => {
    // Initial load
    loadClaimsHistory();

    // Set up periodic refresh with latest offset/limit values
    const cleanup = setupRefreshInterval();

    return () => {
      cleanup();
    };
  }, [walletAddress, loadClaimsHistory, setupRefreshInterval]);

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
