import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';

import Block from './Block';

export default function Table({
  isBreakpoint,
  className,
  columnsTitles,
  data,
  rowTitleWidth,
}: {
  isBreakpoint: boolean | null;
  className?: string;
  columnsTitles?: ReactNode[];
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
}) {
  return isBreakpoint ? (
    <StyledSubSubContainer className={twMerge('flex flex-col', className)}>
      <div className="flex">
        <div
          className="flex shrink-0 ml-2"
          style={{
            width: rowTitleWidth ?? '150px',
          }}
        ></div>

        {(columnsTitles ?? []).map((title, i) => (
          <div
            key={i}
            className="text-lg font-special overflow-hidden whitespace-nowrap flex grow flex-shrink-0 basis-0"
          >
            {title}
          </div>
        ))}
      </div>

      {data.map(({ rowTitle, ...v }, i) => (
        <div key={i} className="flex w-full border-b last:border-b-0 text-base">
          <div
            className="flex shrink-0 items-center"
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
                className="p-[0.3em] text-txtfade flex grow flex-shrink-0 basis-0"
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
    </StyledSubSubContainer>
  ) : (
    <Block
      data={data}
      columnsTitles={columnsTitles}
      rowTitleWidth={rowTitleWidth}
    />
  );
}
