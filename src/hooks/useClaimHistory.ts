import { useCallback, useEffect, useRef, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { ClaimHistoryExtended, ClaimHistoryExtendedApi } from '@/types';

// Cache the API responses by token and offset
const apiResponseCache: Record<
  string,
  Record<number, ClaimHistoryExtendedApi>
> = {
  ADX: {},
  ALP: {},
};

export default function useClaimHistory({
  walletAddress,
  batchSize = 1000, // Default batch size for loading data
  itemsPerPage = 2, // Default items per page for display
  symbol = 'ADX',
  interval = 30000,
}: {
  walletAddress: string | null;
  batchSize?: number;
  itemsPerPage?: number;
  symbol?: 'ADX' | 'ALP';
  interval?: number;
}): {
  isLoadingClaimHistory: boolean;
  claimsHistory: ClaimHistoryExtendedApi | null;
  // Pagination-related return values
  currentPage: number;
  totalItems: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  loadPageData: (page: number) => Promise<void>;
  getPaginatedData: (page: number) => ClaimHistoryExtended[];
} {
  const [claimsHistory, setClaimsHistory] =
    useState<ClaimHistoryExtendedApi | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Track loading state
  const [isLoadingClaimHistory, setIsLoadingClaimHistory] =
    useState<boolean>(false);

  // Keep track of the current wallet address for the interval
  const walletAddressRef = useRef<string | null>(walletAddress);

  // Keep track of the current token symbol
  const symbolRef = useRef<'ADX' | 'ALP'>(symbol);

  // Keep track of the refresh interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when props change
  useEffect(() => {
    walletAddressRef.current = walletAddress;
    symbolRef.current = symbol;
  }, [walletAddress, symbol]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Load claims data for a specific offset
  const loadClaimsData = useCallback(
    async (offset: number) => {
      // Early return if no wallet address
      const currentWalletAddress = walletAddressRef.current;
      const currentToken = symbolRef.current;
      if (!currentWalletAddress) {
        return;
      }

      // Skip if already loading
      if (isLoadingClaimHistory) {
        return;
      }

      // Check cache first
      if (apiResponseCache[currentToken][offset]) {
        setClaimsHistory(apiResponseCache[currentToken][offset]);
        return;
      }

      // Set loading state
      setIsLoadingClaimHistory(true);

      try {
        const claimsHistoryData = await DataApiClient.fetchClaimsHistory({
          walletAddress: currentWalletAddress,
          offset,
          limit: batchSize,
          symbol: currentToken,
        });

        if (claimsHistoryData === null) {
          setClaimsHistory(null);
          return;
        }

        // Store in cache
        apiResponseCache[currentToken][offset] = claimsHistoryData;

        if (claimsHistoryData.symbols.length > 0) {
          const newTotalItems = claimsHistoryData.symbols.reduce(
            (acc, s) => acc + s.allTimeCountClaims,
            0,
          );
          setTotalItems(newTotalItems);
        }

        // Set the claims history data
        setClaimsHistory(claimsHistoryData);
      } catch (e) {
        console.error(
          `Hook [${currentToken}]: Error loading claims history`,
          e,
          String(e),
        );
      } finally {
        setIsLoadingClaimHistory(false);
      }
    },
    [batchSize, isLoadingClaimHistory],
  );

  // Initial data load
  useEffect(() => {
    loadClaimsData(0);

    // Set up refresh interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (walletAddressRef.current && !isLoadingClaimHistory) {
        loadClaimsData(0);
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [walletAddress, symbol, loadClaimsData, interval, isLoadingClaimHistory]);

  // Load data for a specific page
  const loadPageData = useCallback(
    async (page: number) => {
      const currentToken = symbolRef.current;

      if (page < 1 || (totalPages > 0 && page > totalPages)) {
        return;
      }

      // Update current page
      setCurrentPage(page);

      // Calculate offset from page
      const pageOffset = (page - 1) * itemsPerPage;

      // Calculate which batch to load
      const batchNumber = Math.floor(pageOffset / batchSize);
      const batchOffset = batchNumber * batchSize;

      // Check if we have this batch in the cache
      if (apiResponseCache[currentToken][batchOffset]) {
        setClaimsHistory(apiResponseCache[currentToken][batchOffset]);
      } else {
        // Load the data if not in cache

        await loadClaimsData(batchOffset);
      }
    },
    [totalPages, itemsPerPage, batchSize, loadClaimsData],
  );

  // Get paginated data for a specific page
  const getPaginatedData = useCallback(
    (page: number): ClaimHistoryExtended[] => {
      if (!claimsHistory) return [];

      // Calculate which items to display from the current batch
      const pageOffset = (page - 1) * itemsPerPage;
      const apiOffset = claimsHistory.offset || 0;
      const relativeStartIndex = pageOffset - apiOffset;

      // Get all claims from current data
      const allClaims = claimsHistory.symbols.flatMap(
        (symbol) => symbol.claims,
      );

      // If the requested page is within the current batch, return those items
      if (relativeStartIndex >= 0 && relativeStartIndex < allClaims.length) {
        const relativeEndIndex = relativeStartIndex + itemsPerPage;
        return allClaims.slice(
          relativeStartIndex,
          Math.min(relativeEndIndex, allClaims.length),
        );
      }

      return [];
    },
    [claimsHistory, itemsPerPage],
  );

  return {
    isLoadingClaimHistory,
    claimsHistory,
    // Pagination-related return values
    currentPage,
    totalItems,
    totalPages,
    setCurrentPage,
    loadPageData,
    getPaginatedData,
  };
}
