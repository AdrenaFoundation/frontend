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
  const itemHeight = 55;

  useEffect(() => {
    localStorage.setItem('itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  if (!connected) {
    return <WalletConnection />;
  }

  if (!positionsHistory) {
    return <Loader />;
  }

  const paginatedPositions = positionsHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="relative w-full h-full">
      <div
        className="flex-grow flex flex-col gap-1"
        style={{
          minHeight: `${paginatedPositions.length * itemHeight + 45}px`,
        }}
      >
        {paginatedPositions.length > 0 ? (
          paginatedPositions.map((positionHistory) => (
            <PositionHistoryBlock
              key={positionHistory.position_id}
              positionHistory={positionHistory}
            />
          ))
        ) : (
          <p>No trade history available.</p>
        )}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center px-2">
        <div className="w-6" /> {/* Spacer */}
        <Pagination
          currentPage={currentPage}
          totalItems={positionsHistory.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="w-6 h-6 bg-gray-800 text-white border border-gray-700 rounded text-[10px] appearance-none cursor-pointer text-center mt-3"
        >
          {[5, 10, 25, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
