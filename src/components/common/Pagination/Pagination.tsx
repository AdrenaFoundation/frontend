import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const itemsSeen = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2">
      <span className="text-sm text-txtfade opacity-0">{`(${itemsSeen}/${totalItems})`}</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-secondary text-txtfade text-base disabled:opacity-50 "
        >
          &lt;
        </button>
        <span className="text-sm text-txtfade">{`${currentPage} / ${totalPages}`}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-secondary text-txtfade text-base disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
      <span className="text-sm text-txtfade opacity-50">{`(${itemsSeen}/${totalItems})`}</span>
    </div>
  );
};

export default Pagination;
