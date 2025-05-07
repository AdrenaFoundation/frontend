import { useCallback, useEffect, useRef, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedPositionApi, EnrichedPositionApiV2 } from '@/types';

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
  positionsData: EnrichedPositionApiV2 | null;
  // Pagination-related return values
  currentPage: number;
  totalItems: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  loadPageData: (page: number) => Promise<void>;
  getPaginatedData: (page: number) => EnrichedPositionApi[];
  getCachedPositionsCount: () => number;
} {
  const [positionsData, setPositionsData] =
    useState<EnrichedPositionApiV2 | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoadingPositionsHistory, setIsLoadingPositionsHistory] =
    useState<boolean>(false);

  // Refs - to maintain values across renders without causing re-renders
  const walletAddressRef = useRef<string | null>(walletAddress);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const currentPageRef = useRef<number>(1);

  // Derived values
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  /**
   * Load positions data for a specific offset
   * This is the core function that fetches data from the API
   */
  const loadPositionsData = useCallback(
    async (offset: number, forceRefresh = false) => {
      // Guard clauses for early returns
      if (!walletAddressRef.current) return;
      if (isLoadingPositionsHistory) return;

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
          walletAddress: walletAddressRef.current,
          tokens: window.adrena.client.tokens,
          offset,
          limit: batchSize,
        });

        // Handle empty response
        if (result === null) {
          setPositionsData(null);
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
            // New data is always added at offset 0, and we're currently loading offset 0
            const walletCache = apiResponseCache[walletKey];
            const newCache: Record<number, EnrichedPositionApiV2> = {};

            // Create a position ID tracker to prevent overlaps
            const seenPositionIds = new Set<string>();

            // Update offset 0 with the new data we just fetched
            newCache[0] = result;

            console.log(
              `DEBUG SHIFT: Offset 0 has ${result.positions.length} positions`,
            );

            // Debug: Log the last few positions from offset 0
            const lastFewFromOffset0 = result.positions.slice(
              -Math.min(5, result.positions.length),
            );
            console.log(
              `DEBUG SHIFT: Last ${lastFewFromOffset0.length} positions from offset 0:`,
              lastFewFromOffset0.map(
                (p) => `ID:${p.positionId}, Symbol:${p.symbol}`,
              ),
            );

            // Track all position IDs from offset 0
            result.positions.forEach((position) => {
              seenPositionIds.add(String(position.positionId));
            });

            // Get all the offset keys and sort them numerically
            const offsets = Object.keys(walletCache)
              .map((k) => parseInt(k, 10))
              .filter((k) => k !== 0) // Skip offset 0 as we handled it above
              .sort((a, b) => a - b);

            console.log(
              `DEBUG SHIFT: Processing ${offsets.length} additional offsets: ${offsets.join(', ')}`,
            );

            // Process each offset by shifting items between batches in exact batchSize chunks
            for (let i = 0; i < offsets.length; i++) {
              const currentOffset = offsets[i];
              const currentBatch = walletCache[currentOffset];

              console.log(
                `DEBUG SHIFT: Processing offset ${currentOffset} with ${currentBatch.positions.length} positions`,
              );

              // Debug: Log the first few positions from the current batch
              const firstFewFromCurrent = currentBatch.positions.slice(
                0,
                Math.min(5, currentBatch.positions.length),
              );
              console.log(
                `DEBUG SHIFT: First ${firstFewFromCurrent.length} positions from offset ${currentOffset}:`,
                firstFewFromCurrent.map(
                  (p) => `ID:${p.positionId}, Symbol:${p.symbol}`,
                ),
              );

              // If this is the first offset after 0, it needs items from offset 0
              if (i === 0 && currentOffset === batchSize) {
                // For the first batch after 0, check for overlaps directly
                console.log(
                  `DEBUG SHIFT: First batch after offset 0, checking for overlaps`,
                );

                // For the first batch after offset 0:
                // 1. Take the last countDifference items from offset 0
                const takenFromOffset0 =
                  result.positions.slice(-countDifference);
                console.log(
                  `DEBUG SHIFT: Taking ${takenFromOffset0.length} items from end of offset 0`,
                );

                // Debug: Check if any items from offset 0 are already in the current batch
                const overlap = takenFromOffset0.filter((p1) =>
                  currentBatch.positions.some(
                    (p2) => String(p1.positionId) === String(p2.positionId),
                  ),
                );

                if (overlap.length > 0) {
                  console.log(
                    `DEBUG SHIFT: FOUND OVERLAP! ${overlap.length} positions from offset 0 are already in batch ${currentOffset}:`,
                    overlap.map(
                      (p) => `ID:${p.positionId}, Symbol:${p.symbol}`,
                    ),
                  );
                }

                // 2. Filter current batch to remove any positions that are in offset 0
                const filteredCurrentBatch = currentBatch.positions.filter(
                  (position) =>
                    !seenPositionIds.has(String(position.positionId)),
                );

                console.log(
                  `DEBUG SHIFT: Filtered current batch from ${currentBatch.positions.length} to ${filteredCurrentBatch.length} positions`,
                );

                // 3. Take items from the filtered batch
                const remainingFromCurrent = filteredCurrentBatch.slice(
                  0,
                  batchSize - countDifference,
                );

                // Calculate if we have the correct number of items
                const newBatchPositions = [
                  ...takenFromOffset0,
                  ...remainingFromCurrent,
                ];

                console.log(
                  `DEBUG SHIFT: New batch for offset ${currentOffset} has ${newBatchPositions.length} positions (needed ${batchSize})`,
                );

                // Only create a new batch if we have enough items
                if (newBatchPositions.length === batchSize) {
                  newCache[currentOffset] = {
                    ...currentBatch,
                    positions: newBatchPositions,
                    totalCount: result.totalCount,
                  };

                  // Track these position IDs
                  remainingFromCurrent.forEach((position) => {
                    seenPositionIds.add(String(position.positionId));
                  });
                } else {
                  console.log(
                    `DEBUG SHIFT: Not enough items for offset ${currentOffset}, skipping`,
                  );
                }
              }
              // For other offsets, take from the previous offset
              else if (i > 0) {
                const prevOffset = offsets[i - 1];

                // We need items from the previous offset and the current offset
                if (newCache[prevOffset]) {
                  console.log(
                    `DEBUG SHIFT: Taking items from previous offset ${prevOffset} and current offset ${currentOffset}`,
                  );

                  const prevBatch = newCache[prevOffset];
                  // Take the last countDifference items from the previous batch
                  const takenFromPrevBatch =
                    prevBatch.positions.slice(-countDifference);

                  console.log(
                    `DEBUG SHIFT: Taking ${takenFromPrevBatch.length} items from end of offset ${prevOffset}`,
                  );

                  // Debug: Check if any items from previous batch are already in the current batch
                  const overlap = takenFromPrevBatch.filter((p1) =>
                    currentBatch.positions.some(
                      (p2) => String(p1.positionId) === String(p2.positionId),
                    ),
                  );

                  if (overlap.length > 0) {
                    console.log(
                      `DEBUG SHIFT: FOUND OVERLAP! ${overlap.length} positions from offset ${prevOffset} are already in batch ${currentOffset}:`,
                      overlap.map(
                        (p) => `ID:${p.positionId}, Symbol:${p.symbol}`,
                      ),
                    );
                  }

                  // Filter current batch to remove any positions that are already seen
                  const filteredCurrentBatch = currentBatch.positions.filter(
                    (position) =>
                      !seenPositionIds.has(String(position.positionId)),
                  );

                  console.log(
                    `DEBUG SHIFT: Filtered current batch from ${currentBatch.positions.length} to ${filteredCurrentBatch.length} positions`,
                  );

                  // Take items from the filtered batch
                  const remainingFromCurrent = filteredCurrentBatch.slice(
                    0,
                    batchSize - countDifference,
                  );

                  // Calculate if we have the correct number of items
                  const newBatchPositions = [
                    ...takenFromPrevBatch,
                    ...remainingFromCurrent,
                  ];

                  console.log(
                    `DEBUG SHIFT: New batch for offset ${currentOffset} has ${newBatchPositions.length} positions (needed ${batchSize})`,
                  );

                  // Only create a new batch if we have enough items
                  if (newBatchPositions.length === batchSize) {
                    newCache[currentOffset] = {
                      ...currentBatch,
                      positions: [
                        ...takenFromPrevBatch,
                        ...remainingFromCurrent,
                      ],
                      totalCount: result.totalCount,
                    };

                    // Track these position IDs
                    remainingFromCurrent.forEach((position) => {
                      seenPositionIds.add(String(position.positionId));
                    });
                  } else {
                    console.log(
                      `DEBUG SHIFT: Not enough items for offset ${currentOffset}, skipping`,
                    );
                  }
                } else {
                  console.log(
                    `DEBUG SHIFT: Previous offset ${prevOffset} not in new cache, skipping offset ${currentOffset}`,
                  );
                }
              }
            }

            // Log the final cache state
            console.log(
              `DEBUG SHIFT: New cache has ${Object.keys(newCache).length} offsets`,
            );

            // Replace the old cache with the new one
            apiResponseCache[walletKey] = newCache;
          }
        }

        // Update cache and state
        apiResponseCache[walletAddressRef.current][offset] = result;
        setPositionsData(result);

        // Update total items count
        setTotalItems(result.totalCount);
      } catch (e) {
        console.error('Error loading positions history:', e);
      } finally {
        setIsLoadingPositionsHistory(false);
      }
    },
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
        (totalPages > 0 && page > totalPages)
      )
        return;

      // Update current page
      setCurrentPage(page);
      currentPageRef.current = page;

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
    },
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
        return allPositions.slice(
          relativeStartIndex,
          Math.min(relativeEndIndex, allPositions.length),
        );
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

  return {
    isLoadingPositionsHistory,
    positionsData,
    currentPage,
    totalItems,
    totalPages,
    setCurrentPage,
    loadPageData,
    getPaginatedData,
    getCachedPositionsCount,
  };
}
