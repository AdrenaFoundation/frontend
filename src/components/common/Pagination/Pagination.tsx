import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  itemsPerPage,
  totalItems,
}) => {
  if (totalPages <= 1) return null;
  const itemsSeen = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1 rounded bg-secondary text-txtfade text-base disabled:opacity-50"
        >
          {isLoading && currentPage > 1 ? "..." : "<"}
        </button>
        <span className="text-sm text-txtfade">
          {`${currentPage} / ${totalPages}`}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1 rounded bg-secondary text-txtfade text-base disabled:opacity-50"
        >
          {isLoading && currentPage < totalPages ? "..." : ">"}
        </button>
      </div>
      {itemsSeen && totalItems ? (
        <span className="text-sm text-txtfade opacity-50">{`(${itemsSeen}/${totalItems})`}</span>
      ) : null}
    </div>
  );
};

export default Pagination;
