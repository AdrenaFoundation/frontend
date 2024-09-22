import { ReactNode, useEffect, useState } from 'react';
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
    if (nbItemPerPage === 0) return setNbPages(1);

    const nbPages = Math.round(data.length / nbItemPerPage);

    setNbPages(nbPages > 0 ? nbPages : 1);
  }, [data.length, nbItemPerPage]);

  useEffect(() => {
    if (!pagination) return setPageData(data);

    setPageData(data.slice((page - 1) * nbItemPerPage, page * nbItemPerPage));
  }, [page, nbItemPerPage, data, pagination]);

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
            key={i}
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
        <div key={i} className="flex w-full border-b last:border-b-0 text-base">
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
                key={j}
                className="p-[0.3em]  flex grow flex-shrink-0 basis-0"
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

      {pagination ? (
        <div className="flex w-full justify-center align-center gap-2 mt-4">
          {Array.from(Array(nbPages)).map((_, i) => (
            <div
              key={i + 1}
              className={twMerge(
                'cursor-pointer',
                page === i + 1 ? 'text-primary' : 'text-txtfade',
              )}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      ) : null}
    </StyledSubSubContainer>
  ) : (
    <Block
      data={data}
      columnTitlesClassName={columnTitlesClassName}
      rowTitleClassName={rowTitleClassName}
      columnsTitles={columnsTitles}
      className={className}
    />
  );
}
