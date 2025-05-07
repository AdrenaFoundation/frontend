import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Pagination from '@/components/common/Pagination/Pagination';
import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import usePositionsHistory from '@/hooks/usePositionHistory';
import { EnrichedPositionApi } from '@/types';

import downloadIcon from '../../../../../public/images/download.png';
import PositionHistoryBlock from './PositionHistoryBlock';

function PositionsHistory({
  connected,
  walletAddress,
  showShareButton = true,
  exportButtonPosition = 'top',
  className,
}: {
  connected: boolean;
  className?: string;
  walletAddress: string | null;
  showShareButton?: boolean;
  exportButtonPosition: 'top' | 'bottom';
}) {
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('itemsPerPage') || '5', 10);
  });

  const {
    isLoadingPositionsHistory,
    positionsData,
    currentPage,
    totalItems,
    totalPages,
    loadPageData,
    getPaginatedData,
    getCachedPositionsCount
  } = usePositionsHistory({
    walletAddress,
    batchSize: 20,
    itemsPerPage,
  });

  const paginatedPositions = getPaginatedData(currentPage);

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    loadPageData(page);
  };

  React.useEffect(() => {
    localStorage.setItem('itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  const downloadPositionHistory = useCallback(() => {
    if (!positionsData || !positionsData.positions) {
      return;
    }

    const keys = [
      'positionId',
      'entryDate',
      'exitDate',
      'symbol',
      'entryPrice',
      'exitPrice',
      'pnl',
      'finalCollateralAmount',
      'exitSize',
      'fees',
      'borrowFees',
      'exitFees',
    ];

    const csvRows = positionsData.positions
      .map((position: EnrichedPositionApi) =>
        keys
          .map((key) => {
            let value = position[key as keyof EnrichedPositionApi];

            // Format the date field if it's `transaction_date`
            if ((key === 'entryDate' || key === 'exitDate') && value instanceof Date) {
              value = (value as Date).toISOString(); // Format to ISO 8601
            }

            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(',')
      );

    const csvFileContent = [keys.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvFileContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `position-history-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [positionsData]);

  const getNoDataMessage = () => {
    if (!connected) return "Connect your wallet to view your trade history.";
    if (!positionsData) return "No trade history available.";
    if (totalItems === 0) return "No trade history available.";
    if (currentPage > totalPages) return "This page doesn't exist.";
    if (isLoadingPositionsHistory) return "Loading...";
    return "No data available for this page.";
  };

  const exportButton = (
    <div className='flex gap-1 items-center opacity-50 hover:opacity-100 cursor-pointer' onClick={downloadPositionHistory}>
      <div className='text-xs tracking-wider'>Export</div>
      <Image
        src={downloadIcon}
        width={14}
        height={12}
        alt="Download icon"
      />
    </div>
  );

  return (
    <div className={twMerge("w-full h-full flex flex-col relative", className)}>
      <div
        className="flex flex-col justify-center"
        style={{
          minHeight: `${itemsPerPage * 49}px`,
        }}
      >
        {connected ? (
          <>
            {isLoadingPositionsHistory && paginatedPositions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader className='ml-auto mr-auto' />
              </div>
            ) : (
              <>
                {paginatedPositions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center">
                      {exportButtonPosition === "top" && exportButton}
                    </div>
                    {paginatedPositions.map((positionHistory: EnrichedPositionApi) => (
                      <PositionHistoryBlock
                        key={positionHistory.positionId}
                        positionHistory={positionHistory}
                        showShareButton={showShareButton}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex overflow-hidden bg-main/90 grow border rounded-lg h-[15em] items-center justify-center">
                    <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                      {getNoDataMessage()}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <WalletConnection />
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="w-6" /> {/* Spacer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoadingPositionsHistory}
          loadedItems={getCachedPositionsCount()}
          totalItems={totalItems}
        />

        {totalItems > 5 && (
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              setItemsPerPage(newItemsPerPage);
              // Reset to first page when changing items per page
              if (currentPage > Math.ceil(totalItems / newItemsPerPage)) {
                handlePageChange(1);
              }
            }}
            className="w-6 h-6 bg-gray-800 text-white border border-gray-700 rounded text-[10px] appearance-none cursor-pointer text-center"
          >
            {[5, 10, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// Memoize this component to avoid unnecessary re-renders caused by
// a re-render of the parent component.
// This is not the most expensive component to re-render, but it's sensible
// because we're avoiding unnecessary work within a critical path of the app,
// which is subject to a lot of re-renders by nature: a trading view must be reactive.
// More optimizations are possible within this component, but this is the best low-hanging fruit
// yielding the most benefits for minimal effort.
// Note this is a good candidate for memoization because:
// - the parent component re-renders often (trading view)
// - this component expects simple "scalar" / "primitive-type" / "referentially-stable" props:
//   - connected: boolean
//   - className?: string
// - https://react.dev/reference/react/memo
export default React.memo(PositionsHistory);
