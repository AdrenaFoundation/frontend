import { Fragment, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';

export type PositionDetailType = {
  title: string;
  value: string | number | null;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  color?: string;
  precision?: number;
  suffix?: string;
  isDecimalDimmed?: boolean;
  className?: string;
  onEditClick?: () => void;
};
export const PositionDetail = ({
  data,
  className,
  itemClassName,
  titleClassName,
  showDivider = false,
  readOnly = false,
}: {
  data: PositionDetailType[];
  className?: string;
  itemClassName?: string;
  titleClassName?: string;
  showDivider?: boolean;
  readOnly?: boolean;
}) => {
  const editIcon = !readOnly && (
    <svg
      className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity ml-0.5 mt-[0.14rem]"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
      />
    </svg>
  );

  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className={twMerge('flex flex-row items-center px-2 py-2', className)}
      ref={ref}
    >
      {data.map((d, i) => (
        <Fragment key={i}>
          {showDivider && i !== 0 ? (
            <div
              className={twMerge('h-6 border-r border-inputcolor', d.className)}
            />
          ) : null}
          <div
            key={i}
            className={twMerge(
              'flex flex-col',
              data.length - 1 === i && '!px-0',
              d?.className,
              itemClassName,
            )}
          >
            <p
              className={twMerge(
                'text-xs opacity-50 whitespace-nowrap font-interMedium',
                titleClassName,
              )}
            >
              {d.title}
            </p>
            {typeof d.value !== 'string' ? (
              <div
                className={twMerge(
                  'flex items-center',
                  d?.onEditClick &&
                    'cursor-pointer hover:bg-[#1A2531] rounded-md transition-colors duration-300',
                )}
                onClick={d?.onEditClick}
              >
                <FormatNumber
                  nb={d.value}
                  format={d.format}
                  precision={d.precision}
                  suffix={d.suffix}
                  className={twMerge('text-sm flex', d.value && d.color)}
                  isDecimalDimmed={
                    typeof d.isDecimalDimmed === 'undefined'
                      ? true
                      : d.isDecimalDimmed
                  }
                  minimumFractionDigits={2}
                />
                {d?.onEditClick && editIcon}
              </div>
            ) : (
              <div
                className={twMerge(
                  'flex items-center',
                  d?.onEditClick &&
                    'cursor-pointer hover:bg-[#1A2531] rounded-md transition-colors duration-300',
                )}
                onClick={d?.onEditClick}
              >
                <p className="text-sm font-mono">{d.value}</p>
                {d?.onEditClick && editIcon}
              </div>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
};
