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

// Global flag to prevent multiple components from initializing hooks
const hooksInitialized = {
  ADX: false,
  ALP: false,
};

/**
 * Hook for managing claim history data with pagination and automatic refresh
 */
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoadingClaimHistory, setIsLoadingClaimHistory] =
    useState<boolean>(false);

  // Refs - to maintain values across renders without causing re-renders
  const walletAddressRef = useRef<string | null>(walletAddress);
  const symbolRef = useRef<'ADX' | 'ALP'>(symbol);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const currentPageRef = useRef<number>(1);

  // Derived values
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  /**
   * Load claims data for a specific offset
   */
  const loadClaimsData = useCallback(
    async (offset: number, forceRefresh = false) => {
      // Guard clauses for early returns
      if (!walletAddressRef.current) return;
      if (isLoadingClaimHistory) return;

      // Cache handling
      const currentToken = symbolRef.current;
      if (
        offset !== 0 &&
        !forceRefresh &&
        apiResponseCache[currentToken][offset]
      ) {
        setClaimsHistory(apiResponseCache[currentToken][offset]);
        return;
      }

      // Fetch data
      setIsLoadingClaimHistory(true);
      try {
        const claimsHistoryData = await DataApiClient.fetchClaimsHistory({
          walletAddress: walletAddressRef.current,
          offset,
          limit: batchSize,
          symbol: currentToken,
        });

        // Handle empty response
        if (claimsHistoryData === null) {
          setClaimsHistory(null);
          return;
        }

        // Update cache and state
        apiResponseCache[currentToken][offset] = claimsHistoryData;

        // Update total items count
        if (claimsHistoryData.symbols.length > 0) {
          const newTotalItems = claimsHistoryData.symbols.reduce(
            (acc, s) => acc + s.allTimeCountClaims,
            0,
          );
          setTotalItems(newTotalItems);
        }

        setClaimsHistory(claimsHistoryData);
      } catch (error) {
        console.error(
          `Error loading claims history for ${currentToken}:`,
          error,
        );
      } finally {
        setIsLoadingClaimHistory(false);
      }
    },
    [batchSize, isLoadingClaimHistory],
  );

  // Update currentPageRef when currentPage changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Update refs when props change and force refresh if wallet changes
  useEffect(() => {
    // Check if wallet address has changed
    if (walletAddressRef.current !== walletAddress && walletAddress) {
      console.log(
        `Wallet changed from ${walletAddressRef.current} to ${walletAddress} - forcing refresh for ${symbol}`,
      );

      // Update the ref
      walletAddressRef.current = walletAddress;
      symbolRef.current = symbol;

      // Clear cache for current token
      apiResponseCache[symbol] = {};

      // Force reload data
      loadClaimsData(0, true);
    } else {
      // Just update refs without refresh
      walletAddressRef.current = walletAddress;
      symbolRef.current = symbol;
    }
  }, [walletAddress, symbol, loadClaimsData]);

  /**
   * Initialize data loading and set up refresh interval
   * Only runs once when component mounts
   */
  useEffect(() => {
    if (!walletAddress || isInitializedRef.current) return;

    // Mark as initialized
    isInitializedRef.current = true;

    // Initial data load
    loadClaimsData(0, true);

    // Set up refresh interval
    if (!hooksInitialized[symbol]) {
      hooksInitialized[symbol] = true;

      intervalRef.current = setInterval(() => {
        // Only refresh if wallet is connected and on first page
        if (walletAddressRef.current && currentPageRef.current === 1) {
          loadClaimsData(0, true);
        }
      }, interval);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        hooksInitialized[symbol] = false;
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array ensures it only runs once

  /**
   * Load data for a specific page
   */
  const loadPageData = useCallback(
    async (page: number) => {
      // Guard clause
      if (page < 1 || (totalPages > 0 && page > totalPages)) return;

      // Update current page
      setCurrentPage(page);
      currentPageRef.current = page;

      // Calculate offset from page
      const pageOffset = (page - 1) * itemsPerPage;
      const batchNumber = Math.floor(pageOffset / batchSize);
      const batchOffset = batchNumber * batchSize;

      // Load data (from cache or API)
      const currentToken = symbolRef.current;
      if (apiResponseCache[currentToken][batchOffset]) {
        setClaimsHistory(apiResponseCache[currentToken][batchOffset]);
      } else {
        await loadClaimsData(batchOffset);
      }
    },
    [totalPages, itemsPerPage, batchSize, loadClaimsData],
  );

  /**
   * Get paginated data for the current page
   */
  const getPaginatedData = useCallback(
    (page: number): ClaimHistoryExtended[] => {
      if (!claimsHistory) return [];

      // Calculate indices for the requested page
      const pageOffset = (page - 1) * itemsPerPage;
      const apiOffset = claimsHistory.offset || 0;
      const relativeStartIndex = pageOffset - apiOffset;

      // Get all claims from current data
      const allClaims = claimsHistory.symbols.flatMap(
        (symbol) => symbol.claims,
      );

      // Return the slice for the current page
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
    currentPage,
    totalItems,
    totalPages,
    setCurrentPage,
    loadPageData,
    getPaginatedData,
  };
}
