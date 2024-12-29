import Tippy from '@tippyjs/react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { formatNumber, formatPriceInfo, formatSecondsToTimeDifference } from '@/utils';

interface FormatNumberProps {
  nb?: number | null;
  format?: 'number' | 'currency' | 'percentage' | 'time';
  precision?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  suffixClassName?: string;
  prefixClassName?: string;
  wrapperClassName?: string;
  placeholderClassName?: string;
  isDecimalDimmed?: boolean;
  minimumFractionDigits?: number;
  precisionIfPriceDecimalsBelow?: number;
  isLoading?: boolean;
  isAbbreviate?: boolean;
  info?: number | string | null;
  showSignBeforePrefix?: boolean;
  isAbbreviateIcon?: boolean;
}

const FormatNumber = forwardRef<HTMLParagraphElement, FormatNumberProps>(
  (
    {
      nb,
      format = 'number',
      precision = 2,
      prefix = '',
      suffix = '',
      placeholder = '-',
      className,
      suffixClassName = '',
      prefixClassName,
      wrapperClassName,
      placeholderClassName,
      isDecimalDimmed = true,
      minimumFractionDigits = 0,
      precisionIfPriceDecimalsBelow = 6,
      isLoading = false,
      isAbbreviate = false,
      info = null,
      showSignBeforePrefix = false,
      isAbbreviateIcon = true,
    },
    ref,
  ) => {
    if (isLoading) {
      return (
        <div
          className={twMerge(
            'top-0 left-0 h-full w-[100px] p-3 bg-third rounded-lg z-10 transition-opacity duration-300',
            isLoading ? 'animate-pulse opacity-100' : 'opacity-0',
          )}
        />
      );
    }

    if (nb === null || typeof nb === 'undefined') {
      return (
        <p
          ref={ref}
          className={twMerge('font-mono', className, placeholderClassName)}
        >
          {placeholder}
        </p>
      );
    }

    const sign = nb && nb < 0 ? '-' : '';

    if (nb && showSignBeforePrefix) {
      nb = Math.abs(nb);
    }
    let num = formatNumber(
      nb,
      precision,
      minimumFractionDigits,
      precisionIfPriceDecimalsBelow,
    );

    if (format === 'currency') {
      num = formatPriceInfo(
        nb,
        precision,
        minimumFractionDigits,
        precisionIfPriceDecimalsBelow,
      );
    }

    if (format === 'percentage') {
      num = Number(nb).toFixed(precision);
    }

    if (format === 'time') {
      num = formatSecondsToTimeDifference(nb);
    }


    if (isAbbreviate) {
      if (nb > 999_999_999) {
        num = (nb / 1_000_000_000).toFixed(2) + 'B';
      } else if (nb > 999_999) {
        num = (nb / 1_000_000).toFixed(2) + 'M';
      } else if (nb > 999) {
        num = (nb / 1_000).toFixed(2) + 'K';
      }
    }

    const integer = num.split('.')[0];
    const decimal = num.split('.')[1];

    const nbDiv = (
      <p ref={ref} className={twMerge('font-mono inline-block', className)}>
        {isAbbreviate && isAbbreviateIcon && '~'}
        {showSignBeforePrefix && sign}
        {prefix && <span className={twMerge(className, prefixClassName)}>{prefix}</span>}
        {integer}
        {decimal && (
          <span
            className={twMerge(
              'font-mono',
              isDecimalDimmed && 'opacity-50',
              className,
            )}
          >
            .{decimal}
          </span>
        )}
        {format === 'percentage' && '%'}
        {suffix ? <span className={twMerge('ml-1', suffixClassName)}>{suffix}</span> : null}
      </p>
    );

    if (!info) {
      return nbDiv;
    }

    return (
      <div className={twMerge(info && 'flex flex-row gap-1 items-center', wrapperClassName)}>
        <Tippy
          content={
            <div className="text-sm w-60 flex flex-col justify-around items-center">
              {info}
            </div>
          }
          placement="auto"
        >
          {nbDiv}
        </Tippy>
      </div>
    );
  },
);

FormatNumber.displayName = 'FormatNumber';
export default FormatNumber;
