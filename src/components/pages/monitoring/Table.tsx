import { Pagination } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import SortIcon from '@/components/Icons/SortIcon';

export type TableHeaderType = {
  title: string;
  key: string; // optional data key; falls back to title
  width?: number | string; // rem, %, px, etc.
  align?: 'left' | 'center' | 'right';
  className?: string;
  isSortable?: boolean;
  // Optional sticky column behavior. Use 'left' or 'right' to pin the column while horizontally scrolling.
  // Only works when isSticky is true on the table component.
  sticky?: 'left' | 'right';
  stickyOffset?: number; // in rem, optional manual override
  stickyZIndex?: number; // optional z-index override
};

export type TableRowType = {
  [key: string]: number | string | React.ReactNode;
};

type ViewMode = 'table' | 'block';

export default function Table({
  title,
  headers,
  data,
  height = '18.75rem',
  setActiveCol,
  bottomBar,
  className,
  isSticky = false,
  onRowClick,
  viewMode = 'table',
  onViewModeChange,
  blockViewComponent,
  blockWrapperClassname,
  // Sort-related props
  sortBy,
  sortDirection,
  handleSort,
  // Pagination-related return values
  currentPage,
  totalPages,
  loadPageData,
  isLoading = false,
}: {
  title: string;
  headers: TableHeaderType[];
  data: TableRowType[];
  height?: number | string;
  setActiveCol?: (col: string | null) => void;
  bottomBar?: React.ReactNode;
  className?: string;
  isSticky?: boolean;
  onRowClick?: (id: number | string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  blockViewComponent?: (item: TableRowType, index: number) => React.ReactNode;
  blockWrapperClassname?: string;
  // Sort-related props
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  handleSort?: (column: string) => void;
  // Pagination-related return values
  currentPage?: number;
  totalPages?: number;
  loadPageData?: (page: number) => Promise<void> | void;
  isLoading?: boolean;
}) {
  // All hooks must be at the very top before any other logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isHorizontalScrolling, setIsHorizontalScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 5; // Small threshold to account for pixel precision
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    setIsScrolledToBottom(isAtBottom);
  };

  const handleWheel = (e: WheelEvent) => {
    if (!isSticky) return;

    // Detect horizontal scrolling (more horizontal delta than vertical, or shift key)
    const isHorizontalScroll =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

    if (isHorizontalScroll) {
      // Set horizontal scrolling state
      setIsHorizontalScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset horizontal scrolling state after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsHorizontalScrolling(false);
      }, 100);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    container.addEventListener('wheel', handleWheel);
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isSticky]);

  // Memoized calculations for sticky columns and table layout
  const { cumulativeLeft, cumulativeRight, minTableWidthPx } = useMemo(() => {
    // Parse width to rem when possible (number or '<num>rem'). Returns null otherwise
    const parseWidthPx = (width?: TableHeaderType['width']): number | null => {
      if (typeof width === 'number') return width;
      if (typeof width === 'string') {
        const trimmed = width.trim();
        if (trimmed.endsWith('rem')) {
          const v = parseFloat(trimmed.replace('rem', ''));
          return Number.isFinite(v) ? v : null;
        }
      }
      return null;
    };

    // Precompute cumulative widths for sticky offsets (rem best-effort)
    const ESTIMATED_COL_WIDTH = 7.5; // fallback for non-rem/unknown widths (120px = 7.5rem)
    const widthPxByIndex = headers.map((h) => parseWidthPx(h.width));
    const resolvedWidthPxByIndex = widthPxByIndex.map(
      (w) => w ?? ESTIMATED_COL_WIDTH,
    );

    const cumulativeLeft: number[] = new Array(headers.length).fill(0);

    for (let i = 1; i < headers.length; i++) {
      cumulativeLeft[i] = cumulativeLeft[i - 1] + resolvedWidthPxByIndex[i - 1];
    }

    const cumulativeRight: number[] = new Array(headers.length).fill(0);

    for (let i = headers.length - 2; i >= 0; i--) {
      cumulativeRight[i] =
        cumulativeRight[i + 1] + resolvedWidthPxByIndex[i + 1];
    }

    // Estimate a min table width (rem) to enable horizontal scrolling when viewport is smaller
    const minTableWidthPx = headers.reduce((acc, h) => {
      const w = parseWidthPx(h.width);
      return acc + (w ?? ESTIMATED_COL_WIDTH);
    }, 0);

    return { cumulativeLeft, cumulativeRight, minTableWidthPx };
  }, [headers]);

  // Helpers for sizing and alignment
  const widthFor = (width?: TableHeaderType['width']): string | undefined => {
    if (typeof width === 'number') return `${width}rem`;
    return width;
  };

  const alignClass = (align?: TableHeaderType['align']) =>
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  // Shared colgroup ensures header and body columns align perfectly
  const ColGroup = () => (
    <colgroup>
      {headers.map((h) => (
        <col key={`col-${h.title}`} style={{ width: widthFor(h.width) }} />
      ))}
    </colgroup>
  );

  // Resolve sticky classes/styles for header/body cells
  const getStickyProps = (
    colIndex: number,
    isHeader: boolean,
  ): { className: string; style: React.CSSProperties } => {
    const h = headers[colIndex];
    const style: React.CSSProperties = {};
    const classes: string[] = [];

    if (isSticky && h.sticky === 'left') {
      const left = h.stickyOffset ?? cumulativeLeft[colIndex] ?? 0;
      classes.push('sticky');
      style.left = `${left}rem`;
    } else if (isSticky && h.sticky === 'right') {
      const right = h.stickyOffset ?? cumulativeRight[colIndex] ?? 0;
      classes.push('sticky');
      style.right = `${right}rem`;
    }

    if (isSticky && h.sticky) {
      const z = h.stickyZIndex ?? (isHeader ? 30 : 20);
      style.zIndex = z;
      // Ensure solid background so underlying cells don't bleed through
      if (isHeader) {
        classes.push('bg-[#111A27]/90 backdrop-blur-sm');
      } else {
        classes.push('bg-[#182230] ', 'group-hover:bg-third');
      }
    }

    return { className: classes.join(' '), style };
  };

  // Default block view component if none provided
  const defaultBlockComponent = (item: TableRowType, index: number) => (
    <div
      key={`block-${index}`}
      className={twMerge(
        'p-4 bg-main border border-inputcolor rounded-md hover:bg-third transition-colors',
        onRowClick ? 'cursor-pointer' : '',
      )}
      onClick={() => {
        if (onRowClick) onRowClick(item.id as string | number);
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        {headers.map((header) => {
          const key = header.key ?? header.title;
          return (
            <div key={key} className="flex flex-col">
              <span className="text-xs sm:text-sm text-white/50 font-regular">
                {header.title}
              </span>
              <div className="mt-1">{item[key]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ViewToggle = () => {
    if (!onViewModeChange) return null;

    return (
      <div className="flex bg-inputcolor rounded-md">
        <button
          onClick={() => onViewModeChange('table')}
          className={twMerge(
            'px-3 py-0.5 text-xs sm:text-sm rounded transition-colors',
            viewMode === 'table'
              ? 'bg-white text-black'
              : 'text-white/70 hover:text-white',
          )}
        >
          Table
        </button>
        <button
          onClick={() => onViewModeChange('block')}
          className={twMerge(
            'px-3 py-0.5 text-xs sm:text-sm rounded transition-colors',
            viewMode === 'block'
              ? 'bg-white text-black'
              : 'text-white/70 hover:text-white',
          )}
        >
          Block
        </button>
      </div>
    );
  };

  if (viewMode === 'block') {
    const BlockComponent = blockViewComponent || defaultBlockComponent;

    return (
      <>
        <div
          className={twMerge(
            'relative rounded-md border border-inputcolor bg-secondary overflow-hidden',
            className,
          )}
        >
          {/* View toggle header */}
          {onViewModeChange && (
            <div className="flex justify-between items-center p-2 px-3 bg-secondary border-b border-bcolor">
              <div className="text-lg font-regular">{title}</div>
              <ViewToggle />
            </div>
          )}

          {/* Block view container */}
          <div
            ref={scrollContainerRef}
            className="custom-chat-scrollbar overflow-y-auto overscroll-contain p-3"
            style={{
              height: typeof height === 'number' ? `${height}px` : height,
            }}
          >
            <div
              className={twMerge(
                'grid grid-cols-1 gap-3',
                blockWrapperClassname,
              )}
            >
              {data.map((item, index) => BlockComponent(item, index))}
            </div>
          </div>

          {bottomBar && (
            <div className="border-t border-t-inputcolor w-full h-7 bg-[#0E1621]">
              {bottomBar}
            </div>
          )}
        </div>

        {loadPageData && totalPages && totalPages > 1 ? (
          <Pagination
            count={totalPages}
            page={currentPage}
            className="mt-3"
            onChange={(_, page) => {
              loadPageData(page);
              scrollContainerRef.current?.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div
        className={twMerge(
          'relative rounded-md border border-inputcolor bg-secondary overflow-hidden',
          className,
        )}
      >
        {/* View toggle header for table view */}
        {onViewModeChange && (
          <div className="flex justify-between items-center p-2 px-3 bg-secondary border-b border-bcolor">
            <div className="text-lg font-regular">{title}</div>
            <ViewToggle />
          </div>
        )}

        {/* Single scroll container for both header and body */}
        <div
          ref={scrollContainerRef}
          className={twMerge(
            'custom-chat-scrollbar overscroll-contain',
            isSticky
              ? isHorizontalScrolling
                ? 'overflow-x-auto overflow-y-hidden'
                : 'overflow-auto'
              : 'overflow-y-auto',
          )}
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
          }}
        >
          <table
            className="w-full table-fixed"
            style={isSticky ? { minWidth: `${minTableWidthPx}rem` } : undefined}
          >
            <ColGroup />
            <thead className="bg-main border-b border-inputcolor">
              <tr>
                {headers.map((header, colIndex) => {
                  const sticky = getStickyProps(colIndex, true);
                  return (
                    <th
                      key={`head-${header.title}`}
                      className={twMerge(
                        'group p-1 px-2 border-r border-inputcolor last:border-r-0 sticky top-0 bg-[#111A27]/90 backdrop-blur-sm z-20',
                        alignClass(header.align),
                        header.className,
                        sticky.className,
                      )}
                      style={sticky.style}
                      onClick={() => {
                        if (header.isSortable && handleSort && header.key) {
                          handleSort(header.key);
                        }
                      }}
                    >
                      <div
                        className={twMerge(
                          'w-full',
                          header.isSortable
                            ? 'cursor-pointer flex flex-row items-center gap-3'
                            : '',
                          header.align === 'right' && header.isSortable
                            ? 'justify-end'
                            : '',
                        )}
                      >
                        {header.isSortable && header.align === 'right' ? (
                          <SortIcon
                            isActive={sortBy === header.key}
                            order={sortDirection}
                          />
                        ) : null}
                        <span className="text-xs sm:text-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                          {header.title}
                        </span>
                        {header.isSortable && header.align === 'left' ? (
                          <SortIcon
                            isActive={sortBy === header.key}
                            order={sortDirection}
                          />
                        ) : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="rounded-t-lg">
              <AnimatePresence mode="wait">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, rowIdx) => (
                    <motion.tr
                      key={`loader-row-${rowIdx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {headers.map((_, colIdx) => (
                        <td
                          key={`loader-cell-${rowIdx}-${colIdx}`}
                          className="p-4 h-[2.351875rem] bg-[#050D14] animate-loader border border-white/10"
                        />
                      ))}
                    </motion.tr>
                  ))
                  : data.map((row, rowIndex) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={`row-${rowIndex}`}
                      className={twMerge(
                        'group border-b border-bcolor hover:bg-third transition-colors',
                        onRowClick ? 'cursor-pointer' : '',
                        data.length > 7 ? 'last:border-b-0' : '',
                      )}
                      onClick={() => {
                        if (onRowClick) onRowClick(row.id as string | number);
                      }}
                    >
                      {headers.map((header, colIndex) => {
                        const key = header.key ?? header.title;
                        const sticky = getStickyProps(colIndex, false);
                        return (
                          <td
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={twMerge(
                              'relative p-2 px-2 text-sm sm:text-base border-r border-bcolor last:border-r-0',
                              alignClass(header.align),
                              sticky.className,
                            )}
                            style={sticky.style}
                            onMouseOver={() => {
                              if (setActiveCol)
                                setActiveCol(header.key ?? header.title);
                            }}
                            onMouseOut={() => {
                              if (setActiveCol) setActiveCol(null);
                            }}
                          >
                            {row[key]}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {data.length > 7 && !isScrolledToBottom ? (
          <div
            className={twMerge(
              'absolute bottom-0 pointer-events-none bg-gradient-to-b from-transparent to-secondary w-full h-12 z-20',
              bottomBar ? 'bottom-[1.71875rem]' : '',
            )}
          />
        ) : null}

        {bottomBar ? (
          <div className="bottom-0 border-t border-t-inputcolor w-full h-7 bg-[#0E1621]">
            {bottomBar}
          </div>
        ) : null}
      </div>

      {loadPageData && totalPages && totalPages > 1 ? (
        <Pagination
          count={totalPages}
          page={currentPage}
          className="mt-3"
          onChange={(_, page) => {
            loadPageData(page);
            scrollContainerRef.current?.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        />
      ) : null}
    </>
  );
}
