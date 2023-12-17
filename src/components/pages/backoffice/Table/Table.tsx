import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Table({
  className,
  columnsTitles,
  data,
  rowTitleWidth,
}: {
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
  return (
    <div className={twMerge('flex flex-col pb-4', className)}>
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
            className="pl-2 text-lg font-specialmonster overflow-hidden whitespace-nowrap flex grow flex-shrink-0 basis-0"
          >
            {title}
          </div>
        ))}
      </div>

      {data.map(({ rowTitle, ...v }, i) => (
        <div
          key={i}
          className="flex w-full border-b last:border-b-0 border-gray-800 text-xs pl-2 pr-2"
        >
          <div
            className="flex shrink-0 p-2"
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
                className="p-2 text-txtfade flex grow flex-shrink-0 basis-0"
              >
                {value}
              </div>
            ));
          })()}
        </div>
      ))}
    </div>
  );
}
