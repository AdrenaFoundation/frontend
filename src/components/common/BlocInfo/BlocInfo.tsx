import { ReactNode } from 'react';

export default function BlocInfo({
  className,
  title,
  columnsTitles,
  data,
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
          <div className="w-1/3"></div>
          {(columnsTitles ?? []).map((title, i) => (
            <div key={i} className="flex grow pl-2 pr-2 text-lg">
              {title}
            </div>
          ))}
        </div>

        {data.map(({ rowTitle, ...v }, i) => (
          <div
            key={i}
            className="flex w-full border-b border-gray-800 text-xs pl-2 pr-2"
          >
            <div className="w-1/3 p-2">{rowTitle}</div>

            {(() => {
              const values = Object.hasOwn(v, 'value')
                ? [(v as { value: ReactNode }).value]
                : (v as { values: ReactNode[] }).values;

              return values.map((value, j) => (
                <div
                  key={j}
                  className="p-2 text-txtfade flex grow"
                  style={{
                    // Make all columns the same size
                    width: `${2 / 3 / values.length}%`,
                  }}
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
