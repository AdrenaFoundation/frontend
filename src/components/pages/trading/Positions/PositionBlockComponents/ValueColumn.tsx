import Tippy from '@tippyjs/react';
import { twMerge } from 'tailwind-merge';

import { POSITION_BLOCK_STYLES } from './PositionBlockStyles';

interface ValueColumnProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  tooltip?: React.ReactNode;
  onClick?: () => void;
  columnClasses: string;
  suffix?: string;
  valueClassName?: string;
  suffixClassName?: string;
}

export const ValueColumn = ({
  label,
  value,
  tooltip,
  onClick,
  columnClasses,
  suffix,
  valueClassName,
  suffixClassName,
}: ValueColumnProps) => (
  <div className={columnClasses}>
    <div className={POSITION_BLOCK_STYLES.text.header}>{label}</div>
    <div
      className={twMerge(
        'flex w-full',
        onClick &&
          'cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors duration-100',
      )}
      onClick={onClick}
    >
      {tooltip ? (
        <Tippy content={tooltip} placement="auto">
          <div className={`${columnClasses} underline-dashed`}>{value}</div>
        </Tippy>
      ) : (
        <span className={`${valueClassName}`}>
          {value}
          {suffix && <span className={`${suffixClassName}`}>{suffix}</span>}
        </span>
      )}
    </div>
  </div>
);
