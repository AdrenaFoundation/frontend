import 'react-datepicker/dist/react-datepicker.css';

import React from 'react';
import { twMerge } from 'tailwind-merge';

import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import usePositionsHistory from '@/hooks/usePositionHistory';

import PositionHistoryTable from '../../monitoring/PositionHistoryTable/PositionHistoryTable';

function PositionsHistory({
  connected,
  walletAddress,
  className,
}: {
  connected: boolean;
  className?: string;
  walletAddress: string | null;
}) {
  const {
    positionsData,
    isInitialLoad,
    handleSort,
    sortBy,
    sortDirection,
    currentPage,
    totalPages,
    loadPageData,
  } = usePositionsHistory({
    walletAddress: walletAddress ?? null,
    batchSize: 20,
    itemsPerPage: 20,
  });

  return (
    <div className={twMerge('w-full h-full flex flex-col relative', className)}>
      <div className="flex flex-col justify-center min-h-[18rem]">
        {!positionsData ? (
          <p className="text-sm text-center opacity-50">
            No trade history available.
          </p>
        ) : connected ? (
          <PositionHistoryTable
            positionsData={positionsData}
            isLoadingPositionsHistory={isInitialLoad}
            handleSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            currentPage={currentPage}
            totalPages={totalPages}
            loadPageData={loadPageData}
            walletAddress={walletAddress}
            breakpoint="1450px"
          />
        ) : (
          <WalletConnection />
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
