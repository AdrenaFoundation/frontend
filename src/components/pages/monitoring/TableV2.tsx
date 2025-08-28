import React from 'react';
import { twMerge } from 'tailwind-merge';

import SortIcon from '@/components/Icons/SortIcon';

export type TableV2HeaderType = {
  title: string;
  key: string; // optional data key; falls back to title
  width?: number | string; // px, %, rem, etc.
  align?: 'left' | 'center' | 'right';
  className?: string;
  isSortable?: boolean;
  // Optional sticky column behavior. Use 'left' or 'right' to pin the column while horizontally scrolling.
  // Only works when isSticky is true on the table component.
  sticky?: 'left' | 'right';
  stickyOffset?: number; // in px, optional manual override
  stickyZIndex?: number; // optional z-index override
  // Whether to hide this column in block view
  hideInBlockView?: boolean;
};

export type TableV2RowType = {
  [key: string]: number | string | React.ReactNode;
};

type ViewMode = 'table' | 'block';

export default function TableV2({
  title,
  headers,
  data,
  maxHeight = 300,
  setActiveCol,
  bottomBar,
  className,
  isSticky = false,
  onRowClick,
  viewMode = 'table',
  onViewModeChange,
  blockViewComponent,
  handleSort,
}: {
  title: string;
  headers: TableV2HeaderType[];
  data: TableV2RowType[];
  maxHeight?: number | string;
  setActiveCol?: (col: string | null) => void;
  bottomBar?: React.ReactNode;
  className?: string;
  isSticky?: boolean;
  onRowClick?: (id: number | string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  blockViewComponent?: (item: TableV2RowType, index: number) => React.ReactNode;
  handleSort?: (column: string) => void;
}) {
  // Helpers for sizing and alignment
  const widthFor = (width?: TableV2HeaderType['width']): string | undefined => {
    if (typeof width === 'number') return `${width}px`;
    return width;
  };

  const alignClass = (align?: TableV2HeaderType['align']) =>
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  // Parse width to px when possible (number or '<num>px'). Returns null otherwise
  const parseWidthPx = (width?: TableV2HeaderType['width']): number | null => {
    if (typeof width === 'number') return width;
    if (typeof width === 'string') {
      const trimmed = width.trim();
      if (trimmed.endsWith('px')) {
        const v = parseFloat(trimmed.replace('px', ''));
        return Number.isFinite(v) ? v : null;
      }
    }
    return null;
  };

  // Precompute cumulative widths for sticky offsets (px best-effort)
  const ESTIMATED_COL_WIDTH = 120; // fallback for non-px/unknown widths
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
    cumulativeRight[i] = cumulativeRight[i + 1] + resolvedWidthPxByIndex[i + 1];
  }

  // Estimate a min table width (px) to enable horizontal scrolling when viewport is smaller
  const minTableWidthPx = headers.reduce((acc, h) => {
    const w = parseWidthPx(h.width);
    return acc + (w ?? ESTIMATED_COL_WIDTH);
  }, 0);

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

    // Only apply sticky column behavior if isSticky is enabled
    if (isSticky && h.sticky === 'left') {
      const left = h.stickyOffset ?? cumulativeLeft[colIndex] ?? 0;
      classes.push('sticky');
      style.left = left;
    } else if (isSticky && h.sticky === 'right') {
      const right = h.stickyOffset ?? cumulativeRight[colIndex] ?? 0;
      classes.push('sticky');
      style.right = right;
    }

    if (isSticky && h.sticky) {
      const z = h.stickyZIndex ?? (isHeader ? 30 : 20);
      style.zIndex = z;
      // Ensure solid background so underlying cells don't bleed through
      if (isHeader) {
        classes.push('bg-[#0E1621]');
      } else {
        classes.push('bg-secondary', 'group-hover:bg-third');
      }
    }

    return { className: classes.join(' '), style };
  };

  // Default block view component if none provided
  const defaultBlockComponent = (item: TableV2RowType, index: number) => (
    <div
      key={`block-${index}`}
      className="p-4 bg-main border border-inputcolor rounded-lg hover:bg-third transition-colors cursor-pointer"
      onClick={() => onRowClick?.(item.id as string | number)}
    >
      <div className="grid grid-cols-2 gap-2">
        {headers
          .filter((h) => !h.hideInBlockView)
          .map((header) => {
            const key = header.key ?? header.title;
            return (
              <div key={key} className="flex flex-col">
                <span className="text-xs sm:text-sm text-white/50 font-interMedium">
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
            'font-interMedium px-3 py-0.5 text-xs sm:text-sm rounded transition-colors',
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
            'font-interMedium px-3 py-0.5 text-xs sm:text-sm rounded transition-colors',
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
      <div
        className={twMerge(
          'relative rounded-xl border border-inputcolor bg-secondary overflow-hidden',
          className,
        )}
      >
        {/* View toggle header */}
        {onViewModeChange && (
          <div className="flex justify-between items-center p-2 px-3 bg-secondary border-b border-bcolor">
            <div className="text-lg font-interMedium">{title}</div>
            <ViewToggle />
          </div>
        )}

        {/* Block view container */}
        <div
          className="custom-chat-scrollbar overflow-y-auto overscroll-contain p-3"
          style={{
            maxHeight:
              typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((item, index) => BlockComponent(item, index))}
          </div>
        </div>

        {bottomBar && (
          <div className="border-t border-t-inputcolor w-full h-7 bg-[#0E1621]">
            {bottomBar}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'relative rounded-xl border border-inputcolor bg-secondary overflow-hidden',
        className,
      )}
    >
      {/* View toggle header for table view */}
      {onViewModeChange && (
        <div className="flex justify-between items-center p-2 px-3 bg-secondary border-b border-bcolor">
          <div className="text-lg font-interMedium">{title}</div>
          <ViewToggle />
        </div>
      )}

      {/* Single scroll container for both header and body */}
      <div
        className={twMerge(
          'custom-chat-scrollbar overscroll-contain',
          isSticky ? 'overflow-auto' : 'overflow-y-auto',
        )}
        style={{
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
      >
        <table
          className="w-full table-fixed"
          style={isSticky ? { minWidth: `${minTableWidthPx}px` } : undefined}
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
                      'p-1 px-2 text-xs sm:text-sm font-interMedium border-r border-inputcolor last:border-r-0 sticky top-0 bg-[#111A27]/90 backdrop-blur-sm z-20',
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
                        <SortIcon />
                      ) : null}
                      {header.title}
                      {header.isSortable && header.align === 'left' ? (
                        <SortIcon />
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="rounded-t-lg">
            {data.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className={twMerge(
                  'group border-b border-bcolor last:border-b-0 hover:bg-third transition-colors',
                  onRowClick ? 'cursor-pointer' : '',
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className={twMerge(
          'absolute bottom-0 pointer-events-none bg-gradient-to-b from-transparent to-secondary w-full h-12 z-20',
          bottomBar ? 'bottom-[1.71875rem]' : '',
        )}
      />
      {bottomBar ? (
        <div className="bottom-0 border-t border-t-inputcolor w-full h-7 bg-[#0E1621]">
          {bottomBar}
        </div>
      ) : null}
    </div>
  );
}
