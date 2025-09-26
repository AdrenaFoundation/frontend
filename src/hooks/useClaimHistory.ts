import { useCallback, useEffect, useRef, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  ClaimHistoryExtended,
  ClaimHistoryExtendedApi,
  ClaimHistoryGraph,
} from '@/types';

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
  batchSize = 1000,
  itemsPerPage = 2,
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
  isInitialLoad: boolean;
  claimsHistory: ClaimHistoryExtendedApi | null;
  claimHistoryGraphData: ClaimHistoryGraph[] | null;
  isLoadingGraphData: boolean;
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
  const [claimHistoryGraphData, setClaimHistoryGraphData] = useState<
    ClaimHistoryGraph[] | null
  >(null);
  const [isLoadingGraphData, setIsLoadingGraphData] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoadingClaimHistory, setIsLoadingClaimHistory] =
    useState<boolean>(false);

  // Refs - to maintain values across renders without causing re-renders
  const walletAddressRef = useRef<string | null>(walletAddress);
  const symbolRef = useRef<'ADX' | 'ALP'>(symbol);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);
  const currentPageRef = useRef<number>(1);

  // Derived values
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  /**
   * Load claims data for a specific offset
   */
  const loadClaimsData = useCallback(
    async (offset: number, forceRefresh = false) => {
      // Guard clauses for early returns
      if (!walletAddressRef.current || isLoadingClaimHistory) return;

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
          // Set initial load to false only once
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
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

          // Check if total items has changed and we're loading offset 0
          const previousTotalItems = totalItems;
          setTotalItems(newTotalItems);

          // If this is offset 0 and total count has changed, clear other cached offsets
          if (
            offset === 0 &&
            newTotalItems !== previousTotalItems &&
            previousTotalItems > 0
          ) {
            console.log(
              `Total claims count changed from ${previousTotalItems} to ${newTotalItems}, clearing cache`,
            );

            // Create a new cache with only the current offset data
            apiResponseCache[currentToken] = {
              [offset]: claimsHistoryData,
            };
          }
        }

        setClaimsHistory(claimsHistoryData);
      } catch (error) {
        console.error(
          `Error loading claims history for ${currentToken}:`,
          error,
        );

        // Set initial load to false even on error to prevent infinite loading state
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } finally {
        // Set initial load to false only once after first successful fetch
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }

        setIsLoadingClaimHistory(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [batchSize, isLoadingClaimHistory],
  );

  /**
   * Load claim history graph data
   */
  const loadGraphData = useCallback(async () => {
    if (!walletAddressRef.current) return;

    setIsLoadingGraphData(true);
    try {
      const graphData = await DataApiClient.getClaimHistoryGraphData({
        walletAddress: walletAddressRef.current,
        sortDirection: 'asc',
        symbol: symbolRef.current,
      });
      setClaimHistoryGraphData(graphData);
    } catch (error) {
      console.error('Error loading claim history graph data:', error);
      setClaimHistoryGraphData(null);
    } finally {
      setIsLoadingGraphData(false);
    }
  }, []);

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

      // Reset initial load state for new wallet
      isInitialLoadRef.current = true;

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
   * Load graph data when wallet or symbol changes
   */
  useEffect(() => {
    if (walletAddress) {
      loadGraphData();
    }
  }, [walletAddress, symbol, loadGraphData]);

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
    loadGraphData();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    isInitialLoad: isInitialLoadRef.current,
    claimsHistory,
    claimHistoryGraphData,
    isLoadingGraphData,
    currentPage,
    totalItems,
    totalPages,
    setCurrentPage,
    loadPageData,
    getPaginatedData,
  };
}
