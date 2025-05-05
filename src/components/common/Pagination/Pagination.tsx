import React, { useCallback } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  totalLoaded?: number;
  batchSize?: number;
  onLoadMore?: (offset: number, limit: number) => Promise<void>;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  totalLoaded = 0,
  batchSize,
  onLoadMore,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const itemsSeen = Math.min(currentPage * itemsPerPage, totalItems);

  const loadLimit = batchSize || itemsPerPage;

  const needsLoadMoreForPage = useCallback((page: number): boolean => {
    if (!onLoadMore) return false;

    const pageOffset = (page - 1) * itemsPerPage;
    const pageEndIndex = pageOffset + itemsPerPage;

    // Calculate which batch contains the requested page
    const batchNumber = Math.floor(pageOffset / loadLimit);
    const batchOffset = batchNumber * loadLimit;
    const batchEndIndex = batchOffset + loadLimit;

    // Check if we've loaded all available data
    const allDataLoaded = totalLoaded >= totalItems;

    // Calculate the batch that contains the current page
    const currentPageOffset = (currentPage - 1) * itemsPerPage;
    const currentBatchNumber = Math.floor(currentPageOffset / loadLimit);

    // We should reload data in these cases:
    // 1. When returning to the first batch (batch 0) from a higher batch
    // 2. When crossing any batch boundary during backward navigation

    // Special case for navigating back to the first batch (pages 1-3)
    const isBackToFirstBatch = batchNumber === 0 && currentBatchNumber > 0;

    // Check if the current page starts at a batch boundary (like page 1, 4, 7, etc.)
    const isStartOfBatch = pageOffset % loadLimit === 0;

    // We're crossing batch boundaries if the target page is in a different batch than current
    const isCrossingBatchBoundary = batchNumber !== currentBatchNumber;

    // Reload for backward navigation in these cases:
    // 1. Going back to any page in the first batch from a higher batch
    // 2. Going back to the start of any batch (like page 4, 7, etc.) from a higher batch
    const isBackwardNavigation = page < currentPage;
    const needsLoadForBackward = (isBackToFirstBatch ||
      (isBackwardNavigation && isCrossingBatchBoundary && isStartOfBatch));

    // Do we have enough data to display this page?
    const haveEnoughDataForPage = totalLoaded >= pageEndIndex || totalLoaded >= totalItems;

    // Does our loaded data include the batch we need?
    const haveBatchForPage = totalLoaded >= batchEndIndex || totalLoaded >= totalItems;

    // We need more data if:
    // 1. We don't have enough data for this page (forward navigation), OR
    // 2. We're going backward across batch boundaries
    const needsMore = (!allDataLoaded && !haveBatchForPage) || needsLoadForBackward;

    console.log(
      `Pagination: needsLoadMoreForPage ${page} - ` +
      `pageOffset=${pageOffset}, pageEndIndex=${pageEndIndex}, ` +
      `batchNumber=${batchNumber}, currentBatch=${currentBatchNumber}, ` +
      `isBackToFirstBatch=${isBackToFirstBatch}, isBackward=${isBackwardNavigation}, isCrossingBoundary=${isCrossingBatchBoundary}, ` +
      `totalLoaded=${totalLoaded}, totalItems=${totalItems}, ` +
      `allDataLoaded=${allDataLoaded}, haveEnoughDataForPage=${haveEnoughDataForPage}, ` +
      `haveBatchForPage=${haveBatchForPage}, isStartOfBatch=${isStartOfBatch}, ` +
      `needsLoadForBackward=${needsLoadForBackward}, needsMore=${needsMore}`
    );

    return needsMore;
  }, [itemsPerPage, loadLimit, onLoadMore, totalLoaded, totalItems, currentPage]);

  const handlePageChange = useCallback(async (page: number) => {
    console.log(`Pagination: Changing to page ${page}, currentPage=${currentPage}, isLoading=${isLoading}, totalLoaded=${totalLoaded}, totalItems=${totalItems}`);

    if (isLoading || page === currentPage) {
      console.log(`Pagination: Skipping page change because isLoading=${isLoading} or page=${page} equals currentPage=${currentPage}`);
      return;
    }

    if (page > totalPages) {
      console.log(`Pagination: Requested page ${page} is beyond total pages ${totalPages}, adjusting`);
      if (totalPages > 0) {
        onPageChange(totalPages);
      }
      return;
    }

    // Calculate data boundaries for this page
    const pageOffset = (page - 1) * itemsPerPage;
    const pageEndIndex = pageOffset + itemsPerPage;

    // Calculate which batch contains this page and the current page
    const batchNumber = Math.floor(pageOffset / loadLimit);
    const currentPageOffset = (currentPage - 1) * itemsPerPage;
    const currentBatchNumber = Math.floor(currentPageOffset / loadLimit);

    // Determine if we're navigating within the same batch
    const isWithinSameBatch = batchNumber === currentBatchNumber;
    const isBackwardNavigation = page < currentPage;
    const isBackToFirstBatch = batchNumber === 0 && currentBatchNumber > 0;
    const isCrossingBatchBoundary = batchNumber !== currentBatchNumber;

    // For backward navigation within the same batch, we can use existing data
    const isBackwardWithinBatch = isBackwardNavigation && isWithinSameBatch;

    console.log(`Pagination: Page ${page} needs data from offset ${pageOffset} to ${pageEndIndex - 1}, batch=${batchNumber}, currentBatch=${currentBatchNumber}, isCrossingBoundary=${isCrossingBatchBoundary}, isBackToFirstBatch=${isBackToFirstBatch}`);

    const needsMore = needsLoadMoreForPage(page);
    if (needsMore && onLoadMore) {
      // Handle navigation back to the first batch specially - always load from offset 0
      if (isBackToFirstBatch) {
        console.log(`Pagination: Navigating back to first batch (page ${page}) from batch ${currentBatchNumber} - loading from offset 0`);
        try {
          await onLoadMore(0, loadLimit);
          console.log(`Pagination: Successfully reloaded data for first batch (page ${page})`);
          onPageChange(page);
        } catch (error) {
          console.error(`Pagination: Error reloading data for first batch (page ${page}):`, error);
        }
        return;
      }

      // For backward navigation within the same batch, we don't need to reload
      if (isBackwardWithinBatch) {
        console.log(`Pagination: Backward navigation within same batch (${batchNumber}) - using existing data`);
        onPageChange(page);
        return;
      }

      // Calculate which batch contains this page
      const batchOffset = batchNumber * loadLimit;

      // For backward navigation to a previous batch, ensure we're loading the correct batch
      const isStartOfBatch = pageOffset % loadLimit === 0;

      // Use different offset calculation for backward navigation
      let offsetToLoad = batchOffset;
      if (isBackwardNavigation && isStartOfBatch && isCrossingBatchBoundary) {
        offsetToLoad = Math.max(0, pageOffset);
        console.log(`Pagination: Backward navigation to start of batch ${batchNumber}, loading from offset=${offsetToLoad}`);
      }

      console.log(`Pagination: Need to load more data - page=${page}, pageOffset=${pageOffset}, offsetToLoad=${offsetToLoad}, limit=${loadLimit}, totalLoaded=${totalLoaded}`);

      try {
        console.log(`Pagination: Starting onLoadMore for page ${page}`);
        await onLoadMore(offsetToLoad, loadLimit);
        console.log(`Pagination: Successfully loaded more data for page ${page}`);

        // Now that we have the data, change the page
        onPageChange(page);
      } catch (error) {
        console.error('Pagination: Error loading more data:', error);
      }
    } else {
      console.log(`Pagination: No need to load more data for page ${page}, using existing data (totalLoaded=${totalLoaded})`);
      onPageChange(page);
    }
  }, [currentPage, isLoading, itemsPerPage, loadLimit, needsLoadMoreForPage, onLoadMore, onPageChange, totalItems, totalPages, totalLoaded]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2">
      <span className="text-sm text-txtfade opacity-0">{`(${itemsSeen}/${totalItems})`}</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1 rounded bg-secondary text-txtfade text-base disabled:opacity-50"
        >
          {isLoading && currentPage > 1 ? "..." : "&lt;"}
        </button>
        <span className="text-sm text-txtfade">
          {isLoading ? "Loading..." : `${currentPage} / ${totalPages}`}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1 rounded bg-secondary text-txtfade text-base disabled:opacity-50"
        >
          {isLoading && currentPage < totalPages ? "..." : "&gt;"}
        </button>
      </div>
      <span className="text-sm text-txtfade opacity-50">{`(${itemsSeen}/${totalItems})`}</span>
    </div>
  );
};

export default Pagination;
