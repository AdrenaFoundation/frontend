import { useCallback, useEffect, useRef, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedPositionApi, EnrichedPositionApiV2 } from '@/types';

// Sort options for positions
export type PositionSortOption =
  | 'exit_date'
  | 'entry_date'
  | 'pnl'
  | 'volume'
  | 'leverage'
  | 'fees'
  | 'mutagen';

export type SortDirection = 'asc' | 'desc';

// Cache the API responses by wallet address and offset
// This cache helps reduce redundant API calls by storing previously fetched results
const apiResponseCache: Record<
  string, // wallet address
  Record<number, EnrichedPositionApiV2> // offset -> data
> = {};

// Track last known total counts by wallet, persisted across component instances
// This is stored in module scope to survive component unmounts/remounts
const lastKnownTotalCounts: Record<string, number> = {};

/**
 * Get the total count of positions available in the cache for a specific wallet
 * This helps us show how many positions we've loaded vs. the total available
 */
export function getTotalCachedPositionsCount(walletAddress: string): number {
  if (!walletAddress || !apiResponseCache[walletAddress]) return 0;

  return Object.values(apiResponseCache[walletAddress]).reduce(
    (total, batch) => total + (batch?.positions?.length || 0),
    0,
  );
}

/**
 * Clear the entire position cache for all wallets
 * Useful when we need to force a refresh or when wallets change
 */
export function clearAllPositionsCache(): void {
  // Get all wallet keys
  const walletKeys = Object.keys(apiResponseCache);

  // Remove each wallet's data
  walletKeys.forEach((wallet) => {
    delete apiResponseCache[wallet];
  });

  // Clear total counts as well
  Object.keys(lastKnownTotalCounts).forEach((wallet) => {
    delete lastKnownTotalCounts[wallet];
  });
}

/**
 * Hook for managing position history data with pagination and automatic refresh
 * The key optimizations are:
 * 1. Using offset/limit pagination from the API
 * 2. Caching responses to reduce API calls
 * 3. Tracking loaded vs. total positions
 */
export default function usePositionsHistory({
  walletAddress,
  batchSize = 20, // Default batch size for loading data
  itemsPerPage = 5, // Default items per page for display
  interval = 10000,
}: {
  walletAddress: string | null;
  batchSize?: number;
  itemsPerPage?: number;
  interval?: number;
}): {
  isLoadingPositionsHistory: boolean;
  isInitialLoad: boolean;
  positionsData: EnrichedPositionApiV2 | null;
  // Pagination-related return values
  currentPage: number;
  totalItems: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  loadPageData: (page: number) => Promise<void>;
  getPaginatedData: (page: number) => EnrichedPositionApi[];
  getCachedPositionsCount: () => number;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  // Sort functionality
  sortBy: PositionSortOption;
  sortDirection: SortDirection;
  handleSort: (sort: PositionSortOption) => void;
} {
  const [startDate, setStartDate] = useState<string>(
    new Date('2024-09-25T00:00:00Z').toISOString(),
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());

  const [positionsData, setPositionsData] =
    useState<EnrichedPositionApiV2 | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoadingPositionsHistory, setIsLoadingPositionsHistory] =
    useState<boolean>(false);

  // Refs - to maintain values across renders without causing re-renders
  const isFetchingDataRef = useRef<boolean>(true);

  const entryDateRef = useRef<string | null>(startDate);
  const exitDateRef = useRef<string | null>(endDate);

  // Sort refs
  const sortByRef = useRef<PositionSortOption>('exit_date');
  const sortDirectionRef = useRef<SortDirection>('desc');

  const walletAddressRef = useRef<string | null>(walletAddress);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const currentPageRef = useRef<number>(1);

  // Clear cache when wallet changes
  useEffect(() => {
    if (walletAddressRef.current !== walletAddress) {
      console.log('🔌 Wallet changed, clearing positions history cache', {
        from: walletAddressRef.current,
        to: walletAddress,
      });

      // Clear cache for the previous wallet
      if (walletAddressRef.current) {
        delete apiResponseCache[walletAddressRef.current];
        delete lastKnownTotalCounts[walletAddressRef.current];
      }

      // Reset local state
      setPositionsData(null);
      setCurrentPage(1);
      setTotalItems(0);
      isInitializedRef.current = false;
      currentPageRef.current = 1;

      // Update ref
      walletAddressRef.current = walletAddress;
    }
  }, [walletAddress]);

  // Derived values
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  /**
   * Load positions data for a specific offset
   * This is the core function that fetches data from the API
   */
  const loadPositionsData = useCallback(
    async (offset: number, forceRefresh = false) => {
      // Guard clauses for early returns
      if (!walletAddressRef.current || isLoadingPositionsHistory) return;

      // Initialize wallet cache if needed
      if (!apiResponseCache[walletAddressRef.current]) {
        apiResponseCache[walletAddressRef.current] = {};
      }

      // Cache handling - use cached data if available and not forcing refresh
      // This significantly reduces API calls when navigating through pages
      if (
        offset !== 0 &&
        !forceRefresh &&
        apiResponseCache[walletAddressRef.current][offset]
      ) {
        setPositionsData(apiResponseCache[walletAddressRef.current][offset]);
        return;
      }

      // Fetch data
      setIsLoadingPositionsHistory(true);

      try {
        const result = await DataApiClient.getPositions({
          entryDate: entryDateRef.current
            ? new Date(entryDateRef.current)
            : undefined,
          exitDate: exitDateRef.current
            ? new Date(exitDateRef.current)
            : undefined,

          sortBy: sortByRef.current,
          sortDirection: sortDirectionRef.current,
          walletAddress: walletAddressRef.current,
          tokens: window.adrena.client.tokens,
          offset,
          limit: batchSize,
        });

        // Handle empty response
        if (result === null) {
          setPositionsData(null);
          // Don't clear accumulated data on empty response unless it's offset 0
          // Set fetching to false only once
          if (isFetchingDataRef.current) {
            isFetchingDataRef.current = false;
          }
          return;
        }

        const walletKey = walletAddressRef.current;
        const previousTotalCount = lastKnownTotalCounts[walletKey] || 0;

        // Always update the stored total count when loading offset 0
        if (offset === 0) {
          lastKnownTotalCounts[walletKey] = result.totalCount;
        }

        // Check if total count has changed from our last known count
        // This works across component mounts
        if (
          walletKey &&
          previousTotalCount !== 0 &&
          previousTotalCount !== result.totalCount
        ) {
          console.log(
            `DEBUG SHIFT: Total count changed from ${previousTotalCount} to ${result.totalCount}, difference: ${result.totalCount - previousTotalCount}`,
          );

          // Calculate how many new items have been added
          const countDifference = result.totalCount - previousTotalCount;

          // Only handle the case where items were added (countDifference > 0)
          // Items cannot be removed, so we don't need to adjust the cache
          if (countDifference > 0 && offset === 0) {
            // Get all existing offset keys and sort them
            const existingOffsets = Object.keys(apiResponseCache[walletKey])
              .map((k) => parseInt(k, 10))
              .sort((a, b) => a - b);

            // First, we'll build an array of all positions across all batches
            // while ensuring no duplicates
            const allPositions: EnrichedPositionApi[] = [];
            const seenPositionIds = new Set<string>();

            // Add the new positions (which should be at the beginning of result.positions)
            const newPositions = result.positions.slice(0, countDifference);
            newPositions.forEach((position) => {
              const id = String(position.positionId);
              if (!seenPositionIds.has(id)) {
                seenPositionIds.add(id);
                allPositions.push(position);
              }
            });

            // Collect all positions in order from all batches
            existingOffsets.forEach((offsetKey) => {
              const batch = apiResponseCache[walletKey][offsetKey];
              if (batch && batch.positions) {
                batch.positions.forEach((position) => {
                  const id = String(position.positionId);
                  if (!seenPositionIds.has(id)) {
                    seenPositionIds.add(id);
                    allPositions.push(position);
                  }
                });
              }
            });

            const newCache: Record<number, EnrichedPositionApiV2> = {};

            // Now divide all positions into batches of batchSize
            let positionsInCache = 0;

            for (let i = 0; i * batchSize < allPositions.length; i++) {
              const offsetKey = i * batchSize;
              const batchPositions = allPositions.slice(
                i * batchSize,
                (i + 1) * batchSize,
              );

              // Only keep full batches (exactly batchSize items)
              if (batchPositions.length === batchSize) {
                // Use the result as a template, but replace the positions
                newCache[offsetKey] = {
                  ...result,
                  offset: offsetKey,
                  positions: batchPositions,
                  totalCount: result.totalCount,
                };

                positionsInCache += batchPositions.length;
              }
            }

            // Update the total count for all batches to reflect the actual number of positions kept
            // This ensures pagination works correctly
            Object.keys(newCache).forEach((key) => {
              const offsetKey = parseInt(key, 10);
              newCache[offsetKey].totalCount = positionsInCache;
            });

            // Check for duplicate positions across batches (debugging)
            const positionIds = new Set<string>();
            const duplicates: string[] = [];

            Object.keys(newCache).forEach((offsetKey) => {
              const batch = newCache[parseInt(offsetKey, 10)];
              batch.positions.forEach((position) => {
                const id = String(position.positionId);
                if (positionIds.has(id)) {
                  duplicates.push(id);
                } else {
                  positionIds.add(id);
                }
              });
            });

            if (duplicates.length > 0) {
              console.error(
                `DEBUG SHIFT: Found ${duplicates.length} duplicates across batches: ${duplicates.join(', ')}`,
              );
            }

            // Replace the old cache with the new one
            apiResponseCache[walletKey] = newCache;
          }
        }

        // Update cache and state
        // Ensure wallet cache exists before setting data
        if (!apiResponseCache[walletAddressRef.current]) {
          apiResponseCache[walletAddressRef.current] = {};
        }
        apiResponseCache[walletAddressRef.current][offset] = result;
        setPositionsData(result);

        // Update total items count
        setTotalItems(result.totalCount);
      } catch (e) {
        console.error('Error loading positions history:', e);

        // Set fetching to false even on error to prevent infinite loading state
        if (isFetchingDataRef.current) {
          isFetchingDataRef.current = false;
        }
      } finally {
        // Set fetching to false only once after first successful fetch
        if (isFetchingDataRef.current) {
          isFetchingDataRef.current = false;
        }

        setIsLoadingPositionsHistory(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [batchSize, isLoadingPositionsHistory],
  );

  // Update currentPageRef when currentPage changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Update refs when props change and force refresh if wallet changes
  useEffect(() => {
    // Check if wallet address has changed
    if (walletAddressRef.current !== walletAddress && walletAddress) {
      // Update the ref
      walletAddressRef.current = walletAddress;

      // Clear the entire cache when switching wallets
      clearAllPositionsCache();

      // Initialize wallet cache for the new wallet
      apiResponseCache[walletAddress] = {};

      // Reset page to 1
      setCurrentPage(1);
      currentPageRef.current = 1;

      // Force reload data
      loadPositionsData(0, true);
    } else {
      // Just update refs without refresh
      walletAddressRef.current = walletAddress;
    }
  }, [walletAddress, loadPositionsData]);

  // Update date refs when state changes
  useEffect(() => {
    entryDateRef.current = startDate;
    exitDateRef.current = endDate;
  }, [startDate, endDate]);

  /**
   * Refetch data when date range changes
   */
  useEffect(() => {
    refetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, walletAddress]);

  /**
   * Initialize data loading and set up refresh interval
   * Only runs once when component mounts
   */
  useEffect(() => {
    if (!walletAddress || isInitializedRef.current) return;

    // Mark as initialized
    isInitializedRef.current = true;

    // Initialize wallet cache if needed
    if (walletAddress && !apiResponseCache[walletAddress]) {
      apiResponseCache[walletAddress] = {};
    }

    // Initial data load
    loadPositionsData(0, true);

    // Set up refresh interval
    intervalRef.current = setInterval(() => {
      // Only refresh if wallet is connected and on first page
      if (walletAddressRef.current && currentPageRef.current === 1) {
        loadPositionsData(0, true);
      }
    }, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchData = () => {
    if (walletAddress && isInitializedRef.current) {
      // Clear cache when date range changes to ensure fresh data
      if (apiResponseCache[walletAddress]) {
        clearAllPositionsCache();
        apiResponseCache[walletAddress] = {};
      }

      // Reset to first page
      setCurrentPage(1);
      currentPageRef.current = 1;

      // Refetch data with new date range
      isFetchingDataRef.current = true;
      loadPositionsData(0, true);
    }
  };

  /**
   * Load data for a specific page
   * Translates UI page numbers to API offsets
   */
  const loadPageData = useCallback(
    async (page: number) => {
      // Guard clause
      if (
        !walletAddressRef.current ||
        page < 1 ||
        (totalPages > 0 && page > totalPages) ||
        isLoadingPositionsHistory ||
        !isInitializedRef.current // Prevent parallel execution
      )
        return;

      // Set loading state
      setIsLoadingPositionsHistory(true);

      // Update current page
      setCurrentPage(page);
      currentPageRef.current = page;

      try {
        // Calculate offset from page
        // This is the key to the pagination optimization:
        // - We map UI pages to API batch offsets
        // - We fetch data in batches (batchSize) but display in smaller chunks (itemsPerPage)
        const pageOffset = (page - 1) * itemsPerPage;
        const batchNumber = Math.floor(pageOffset / batchSize);
        const batchOffset = batchNumber * batchSize;

        // Load data (from cache or API)
        if (
          apiResponseCache[walletAddressRef.current] &&
          apiResponseCache[walletAddressRef.current][batchOffset]
        ) {
          setPositionsData(
            apiResponseCache[walletAddressRef.current][batchOffset],
          );
        } else {
          await loadPositionsData(batchOffset);
        }
      } finally {
        setIsLoadingPositionsHistory(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalPages, itemsPerPage, batchSize, loadPositionsData],
  );

  /**
   * Get paginated data for the current page
   * This slices the currently loaded data batch to show only the items for the current page
   */
  const getPaginatedData = useCallback(
    (page: number): EnrichedPositionApi[] => {
      if (!positionsData || !positionsData.positions) return [];

      // Calculate indices for the requested page
      const pageOffset = (page - 1) * itemsPerPage;
      const apiOffset = positionsData.offset || 0;
      const relativeStartIndex = pageOffset - apiOffset;

      // Get all positions from current data
      const allPositions = positionsData.positions;

      // Return the slice for the current page
      if (relativeStartIndex >= 0 && relativeStartIndex < allPositions.length) {
        const relativeEndIndex = relativeStartIndex + itemsPerPage;
        const pagePositions = allPositions.slice(
          relativeStartIndex,
          Math.min(relativeEndIndex, allPositions.length),
        );

        // Deduplicate positions by ID before returning
        const uniquePositions: EnrichedPositionApi[] = [];
        const seenIds = new Set<string>();

        pagePositions.forEach((position) => {
          const id = String(position.positionId);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            uniquePositions.push(position);
          }
        });

        return uniquePositions;
      }

      return [];
    },
    [positionsData, itemsPerPage],
  );

  /**
   * Get the total count of positions currently loaded in the cache
   */
  const getCachedPositionsCount = useCallback(
    (): number => {
      if (!walletAddressRef.current) return 0;
      return getTotalCachedPositionsCount(walletAddressRef.current);
    },
    [], // No dependencies as it just accesses global state
  );

  // Handle sort functionality
  const handleSort = (newSortBy: PositionSortOption) => {
    if (newSortBy === sortByRef.current) {
      // Toggle direction if same sort option
      const newDirection = sortDirectionRef.current === 'asc' ? 'desc' : 'asc';
      sortDirectionRef.current = newDirection;
    } else {
      // Set new sort option with default direction
      sortByRef.current = newSortBy;
      sortDirectionRef.current = 'desc'; // Default to descending for most metrics
    }

    refetchData();
  };

  return {
    isLoadingPositionsHistory,
    isInitialLoad: isFetchingDataRef.current,
    positionsData,
    currentPage,
    totalItems,
    totalPages,
    setCurrentPage,
    loadPageData,
    getPaginatedData,
    getCachedPositionsCount,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    sortBy: sortByRef.current,
    sortDirection: sortDirectionRef.current,
    handleSort,
  };
}
