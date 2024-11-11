import React, { useEffect, useState } from 'react';

import Pagination from '@/components/common/Pagination/Pagination';
import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import usePositionsHistory from '@/hooks/usePositionHistory';

import PositionHistoryBlock from './PositionHistoryBlock';

function PositionsHistory({
  connected,
  walletAddress,
}: {
  connected: boolean;
  className?: string;
  walletAddress?: string;
}) {
  const { positionsHistory } = usePositionsHistory({ walletAddress });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('itemsPerPage') || '5', 10);
  });

  useEffect(() => {
    localStorage.setItem('itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  const paginatedPositions = (positionsHistory ?? []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        className="flex justify-center grow"
        style={{
          minHeight: `${itemsPerPage * 49}px`,
        }}
      >
        {connected ? (
          <>
            {positionsHistory ? (
              <>
                {paginatedPositions.length > 0 ? (
                  <div className="flex flex-col gap-3 grow">
                    {paginatedPositions.map((positionHistory) => (
                      <PositionHistoryBlock
                        key={positionHistory.position_id}
                        positionHistory={positionHistory}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex overflow-hidden bg-main/90 grow border rounded-lg h-[15em] items-center justify-center">
                    <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                      No trade history available.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Loader />
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
          totalItems={(positionsHistory ?? []).length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
        {(positionsHistory?.length ?? 0) > 5 && (
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-6 h-6 bg-gray-800 text-white border border-gray-700 rounded text-[10px] appearance-none cursor-pointer text-center"
          >
            {[5, 10].map((num) => (
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
// which is subect to a lot of re-renders by nature: a trading view must be reactive.
// More optimizations are possible within this component, but this is the best low-hanging fruit
// yielding the most benefits for minimal effort.
// Note this is a good candidate for memoization because:
// - the parent component re-renders often (trading view)
// - this component expects simple "scalar" / "primitive-type" / "referentially-stable" props:
//   - connected: boolean
//   - className?: string
// - https://react.dev/reference/react/memo
export default React.memo(PositionsHistory);
