import React from 'react';
import { twMerge } from 'tailwind-merge';

type Header = {
  title: string;
  key: string; // optional data key; falls back to title
  width?: number | string; // px, %, rem, etc.
  align?: 'left' | 'center' | 'right';
  className?: string;
  isNoPadding?: boolean;
};

export default function TableV2({
  headers,
  data,
  maxHeight = 300,
  setActiveCol,
  bottomBar,
  className,
}: {
  headers: Header[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any }[];
  maxHeight?: number | string;
  setActiveCol?: (col: string | null) => void;
  bottomBar?: React.ReactNode;
  className?: string;
}) {
  const widthFor = (width?: Header['width']): string | undefined => {
    if (typeof width === 'number') return `${width}px`;
    return width;
  };

  const alignClass = (align?: Header['align']) =>
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

  return (
    <div
      className={twMerge(
        'relative rounded-lg border border-inputcolor bg-secondary overflow-hidden',
        className,
      )}
    >
      {/* Fixed header */}
      <div className="bg-main border-b border-inputcolor">
        <table className="w-full table-fixed">
          <ColGroup />
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={`head-${header.title}`}
                  className={twMerge(
                    'p-1 px-2 text-xs font-interMedium border-r text-white/50 border-inputcolor last:border-r-0 sticky top-0 bg-[#0E1621] z-10',
                    alignClass(header.align),
                    header.className,
                  )}
                >
                  {header.title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable body */}
      <div
        className="custom-chat-scrollbar overflow-y-auto overscroll-contain"
        style={{
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }}
      >
        <table className="w-full table-fixed">
          <ColGroup />
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="border-b border-bcolor last:border-b-0 hover:bg-third transition-colors"
              >
                {headers.map((header, colIndex) => {
                  const key = header.key ?? header.title;
                  return (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={twMerge(
                        'relative p-2 px-2 text-xs sm:text-sm border-r border-bcolor last:border-r-0',
                        alignClass(header.align),
                        header.isNoPadding ? 'p-0' : '',
                      )}
                      onMouseOver={() => {
                        if (setActiveCol) setActiveCol(header.key);
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
