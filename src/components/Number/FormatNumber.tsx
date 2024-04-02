import React from 'react';
import { twMerge } from 'tailwind-merge';

import { formatNumber, formatPriceInfo } from '@/utils';

export default function FormatNumber({
  nb,
  format = 'number',
  precision = 2,
  unit = '',
  placeholder = '-',
  className,
  placeholderClassName,
}: {
  nb: number | null;
  format?: 'number' | 'currency' | 'percentage';
  precision?: number;
  unit?: string;
  placeholder?: string;
  className?: string;
  placeholderClassName?: string;
}) {
  if (nb === null || typeof nb === 'undefined') {
    return (
      <p className={twMerge(className, placeholderClassName, 'font-mono')}>
        {placeholder}
      </p>
    );
  }

  let num = formatNumber(nb, precision);

  if (format === 'currency') {
    num = formatPriceInfo(nb);
  }

  if (format === 'percentage') {
    num = Number(nb).toFixed(precision);
  }

  const integer = num.split('.')[0];
  const decimal = num.split('.')[1];

  return (
    <p className={twMerge(className, 'font-mono')}>
      {integer}
      {decimal && (
        <span className={twMerge(className, 'opacity-50')}>.{decimal}</span>
      )}
      {format === 'percentage' && '%'}
      {unit}
    </p>
  );
}
