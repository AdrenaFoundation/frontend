import React from 'react';
import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { twMerge } from 'tailwind-merge';

import { formatPercentage, formatPriceInfo } from '@/utils';

export default function CustomRechartsToolTip({
  active,
  payload,
  label,
  isValueOnly,
  format = 'currency',
}: TooltipProps<ValueType, NameType> & {
  isValueOnly?: boolean;
  format?: 'currency' | 'percentage' | 'number';
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-third p-3 border border-white rounded-lg min-w-[12em]">
        <p className="text-lg mb-2 font-mono">{label}</p>
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="text-sm font-mono flex gap-3 justify-between"
            style={{ color: item.color }}
          >
            {!isValueOnly && (
              <span style={{ color: item.color }}>{item.dataKey}:</span>
            )}
            <span
              className={twMerge('font-mono', isValueOnly && 'text-lg')}
              style={{ color: item.color }}
            >
              {format === 'currency'
                ? formatPriceInfo(Number(item.value), 2, 2)
                : format === 'percentage'
                  ? formatPercentage(Number(item.value), 0)
                  : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
