import React, { useEffect, useState } from 'react';

import Pagination from '@/components/common/Pagination/Pagination';
import Loader from '@/components/Loader/Loader';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import usePositionsHistory from '@/hooks/usePositionHistory';

import PositionHistoryBlock from './PositionHistoryBlock';

export default function PositionsHistory({
  connected,
}: {
  connected: boolean;
  className?: string;
}) {
  const { positionsHistory } = usePositionsHistory();
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
                  <div className="w-full h-full flex items-center justify-center grow">
                    No trade history available.
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
