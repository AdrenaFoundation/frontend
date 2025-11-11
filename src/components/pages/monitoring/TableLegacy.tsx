import { Pagination } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

import Block from './Block';

/** @deprecated use Table instead **/

export default function TableLegacy({
  breakpoint,
  className,
  columnsTitles,
  data,
  rowTitleWidth,
  columnTitlesClassName,
  rowTitleClassName,
  columnWrapperClassName,
  paginationClassName,
  pagination = false,
  nbItemPerPage = 10,
  nbItemPerPageWhenBreakpoint = 2,
  rowHovering = false,
  rowClassName,
  page: controlledPage,
  onPageChange,
  useAutoAlignment = false,
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
        specificRowClassName?: string;
        values: ReactNode[];
      }
    | {
        rowTitle: ReactNode;
        specificRowClassName?: string;
        value: ReactNode;
      }
  )[];
  rowTitleWidth?: string;
  pagination?: boolean;
  paginationClassName?: string;
  nbItemPerPage?: number;
  nbItemPerPageWhenBreakpoint?: number;
  rowHovering?: boolean;
  rowClassName?: string;
  page?: number;
  onPageChange?: (page: number) => void;
  useAutoAlignment?: boolean;
}) {
  const isBreakpoint = useBetterMediaQuery(
    `(max-width: ${breakpoint ?? '800px'})`,
  );

  const [internalPage, setInternalPage] = useState<number>(1);
  const page = controlledPage !== undefined ? controlledPage : internalPage;

  const [nbPages, setNbPages] = useState<number | null>(null);
  const [pageData, setPageData] = useState<
    (
      | {
          rowTitle: ReactNode;
          values: ReactNode[];
          specificRowClassName?: string;
        }
      | {
          rowTitle: ReactNode;
          value: ReactNode;
          specificRowClassName?: string;
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, p: number) => {
    if (onPageChange) {
      onPageChange(p);
    } else {
      setInternalPage(p);
    }
  };

  const getColumnType = (title: ReactNode, index: number) => {
    if (!useAutoAlignment) {
      return { alignment: 'justify-center', truncation: '' };
    }

    if (index === 0) return { alignment: 'justify-center', truncation: '' };
    if (index === 1)
      return { alignment: 'justify-start', truncation: 'truncate' };
    return { alignment: 'justify-end', truncation: '' };
  };

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
              'p-[0.3em] flex grow flex-shrink-0 basis-0 text-txtfade text-sm font-semibold',
              columnTitlesClassName,
            )}
            style={{
              maxWidth: i === 0 ? '3rem' : 'auto',
            }}
          >
            <div
              className={twMerge(
                'w-full flex items-center',
                getColumnType(title, i).alignment,
                getColumnType(title, i).truncation,
              )}
            >
              {title}
            </div>
          </div>
        ))}
      </div>

      {pageData.map(({ rowTitle, specificRowClassName, ...v }, i) => (
        <div
          key={`page-data-${rowTitle}-${i}`}
          className={twMerge(
            'flex w-full border border-transparent text-base pl-1 relative',
            rowHovering
              ? 'hover:bg-secondary hover:border-bcolor rounded-md transition duration-300'
              : '',
            rowClassName,
            specificRowClassName,
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
                className={twMerge(
                  'p-[0.3em] flex grow flex-shrink-0 basis-0 items-center',
                  getColumnType(value, j).alignment,
                  getColumnType(value, j).truncation,
                )}
                style={{
                  maxWidth:
                    j === 0
                      ? '3rem'
                      : `calc(100% - ${rowTitleWidth ?? '150px'})`,
                }}
              >
                {value}
              </div>
            ));
          })()}
        </div>
      ))}

      {pagination && nbPages && nbPages > 1 && (
        <div className="mt-auto pt-2">
          <Pagination
            className={paginationClassName}
            variant="text"
            count={nbPages}
            page={page}
            onChange={handlePageChange}
          />
        </div>
      )}
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

      {pagination && nbPages && nbPages > 1 && (
        <div className="m-auto py-2">
          <Pagination
            className={paginationClassName}
            variant="text"
            count={nbPages}
            page={page}
            onChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
