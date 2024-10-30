import { ReactNode, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

import Block from './Block';

export default function Table({
  breakpoint,
  className,
  columnsTitles,
  data,
  rowTitleWidth,
  columnTitlesClassName,
  rowTitleClassName,
  columnWrapperClassName,
  pagination = false,
  nbItemPerPage = 10,
  nbItemPerPageWhenBreakpoint = 2,
  rowHovering = false,
}: {
  breakpoint?: string | null;
  className?: string;
  columnsTitles?: ReactNode[];
  columnTitlesClassName?: string;
  rowTitleClassName?: string;
  columnWrapperClassName?: string;
  data: (
    | {
      rowTitle: ReactNode;
      values: ReactNode[];
    }
    | {
      rowTitle: ReactNode;
      value: ReactNode;
    }
  )[];
  rowTitleWidth?: string;
  pagination?: boolean;
  nbItemPerPage?: number;
  nbItemPerPageWhenBreakpoint?: number;
  rowHovering?: boolean;
}) {
  const isBreakpoint = useBetterMediaQuery(
    `(max-width: ${breakpoint ?? '800px'})`,
  );

  const [page, setPage] = useState<number>(1);
  const [nbPages, setNbPages] = useState<number | null>(null);
  const [pageData, setPageData] = useState<
    (
      | {
        rowTitle: ReactNode;
        values: ReactNode[];
      }
      | {
        rowTitle: ReactNode;
        value: ReactNode;
      }
    )[]
  >([]);

  useEffect(() => {
    const nb = isBreakpoint ? nbItemPerPageWhenBreakpoint : nbItemPerPage;

    if (nb === 0) return setNbPages(1);

    const nbPages = Math.ceil(data.length / nb);

    setNbPages(nbPages > 0 ? nbPages : 1);
  }, [data.length, isBreakpoint, nbItemPerPage, nbItemPerPageWhenBreakpoint]);

  useEffect(() => {
    if (!pagination) return setPageData(data);

    const nb = isBreakpoint ? nbItemPerPageWhenBreakpoint : nbItemPerPage;

    setPageData(data.slice((page - 1) * nb, page * nb));
  }, [
    page,
    nbItemPerPage,
    data,
    pagination,
    isBreakpoint,
    nbItemPerPageWhenBreakpoint,
  ]);

  const paginationDiv = useMemo(() => {
    let first = true;

    return (
      <div className="flex w-full justify-center align-center gap-2 mt-4 max-w-full flex-wrap">
        {Array.from(Array(nbPages)).map((_, i) => {
          const hidden =
            Math.abs(page - i - 1) > 3 && i !== 0 && i + 1 !== nbPages;

          if (!hidden) first = true;

          const shouldDisplay = hidden && first;

          if (shouldDisplay) first = false;

          return (
            <div key={`pagination-${i}`}>
              {shouldDisplay ? (
                <div
                  key={`pagination-none-${i}`}
                  className="cursor-pointer text-txtfade"
                >
                  ..
                </div>
              ) : null}

              <div
                key={`pagination-${i}`}
                className={twMerge(
                  'cursor-pointer',
                  page === i + 1 ? 'text-primary' : 'text-txtfade',
                  hidden ? 'hidden' : '',
                )}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [nbPages, page]);

  return !isBreakpoint ? (
    <StyledSubSubContainer className={twMerge('flex flex-col', className)}>
      <div className="flex pb-2">
        <div
          className={twMerge('flex shrink-0 ml-2', columnWrapperClassName)}
          style={{
            width: rowTitleWidth ?? '150px',
          }}
        />

        {(columnsTitles ?? []).map((title, i) => (
          <div
            key={`columns-${title}-${i}`}
            className={twMerge(
              'text-lg font-boldy overflow-hidden whitespace-nowrap flex grow flex-shrink-0 basis-0 uppercase text-txtfade',
              columnTitlesClassName,
            )}
          >
            {title}
          </div>
        ))}
      </div>

      {pageData.map(({ rowTitle, ...v }, i) => (
        <div
          key={`page-data-${rowTitle}-${i}`}
          className={twMerge(
            'flex w-full border border-transparent text-base pl-1',
            rowHovering ? 'hover:bg-secondary hover:border-bcolor' : '',
          )}
        >
          <div
            className={twMerge('flex shrink-0 items-center', rowTitleClassName)}
            style={{
              width: rowTitleWidth ?? '150px',
            }}
          >
            {rowTitle}
          </div>

          {(() => {
            const values = Object.hasOwn(v, 'value')
              ? [(v as { value: ReactNode }).value]
              : (v as { values: ReactNode[] }).values;

            return values.map((value, j) => (
              <div
                key={`values-${rowTitle}${i}-${j}`}
                className="p-[0.3em] flex grow flex-shrink-0 basis-0"
                style={{
                  // must limit here otherwise ChartJS chart can't resize well
                  maxWidth: `calc(100% - ${rowTitleWidth ?? '150px'})`,
                }}
              >
                {value}
              </div>
            ));
          })()}
        </div>
      ))}

      {pagination && nbPages && nbPages > 1 && paginationDiv}
    </StyledSubSubContainer>
  ) : (
    <>
      <Block
        data={pageData}
        columnTitlesClassName={columnTitlesClassName}
        rowTitleClassName={rowTitleClassName}
        columnsTitles={columnsTitles}
        className={className}
      />

      {pagination && nbPages && nbPages > 1 && paginationDiv}
    </>
  );
}
