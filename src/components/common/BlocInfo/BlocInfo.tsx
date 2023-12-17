import { ReactNode } from 'react';

export default function BlocInfo({
  className,
  title,
  columnsTitles,
  data,
  rowTitleWidth,
}: {
  className?: string;
  title: ReactNode;
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
    <div
      className={`flex flex-col border border-gray-400 bg-black ${className}`}
    >
      <div className="w-full flex items-center">
        <div className="font-specialmonster text-xl ml-4 mt-2 mb-4 border-b-2 border-white">
          {title}
        </div>
      </div>

      <div className="flex flex-col">
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
    </div>
  );
}
