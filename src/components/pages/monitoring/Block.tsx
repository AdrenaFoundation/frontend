import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';

export default function Block({
  columnsTitles,
  className,
  rowTitleClassName,
  data,
}: {
  className?: string;
  columnsTitles?: ReactNode[];
  rowTitleClassName?: string;
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
    <StyledSubSubContainer
      className={twMerge(
        'flex flex-col gap-6 bg-secondary p-0 border-none',
        className,
      )}
    >
      {data.map(({ rowTitle, ...v }, i) => (
        <div className="bg-third rounded-md p-3" key={i}>
          <p className="text-lg font-boldy overflow-hidden whitespace-nowrap flex grow flex-shrink-0 basis-0 text-txtfade">
            {rowTitle}
          </p>

          <ul className="flex flex-col gap-2 py-2">
            {(() => {
              const values = Object.hasOwn(v, 'value')
                ? [(v as { value: ReactNode }).value]
                : (v as { values: ReactNode[] }).values;

              return values.map((value, j) => (
                <li
                  className="flex flex-row justify-between items-center"
                  key={'li-' + j}
                >
                  {columnsTitles?.[j] && (
                    <p className={rowTitleClassName}> {columnsTitles[j]} </p>
                  )}
                  {value}
                </li>
              ));
            })()}
          </ul>
        </div>
      ))}
    </StyledSubSubContainer>
  );
}
