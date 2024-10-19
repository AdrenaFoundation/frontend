import React from 'react';
import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { twMerge } from 'tailwind-merge';

import { formatPriceInfo } from '@/utils';

export default function CustomRechartsToolTip({
  active,
  payload,
  label,
  isValueOnly,
}: TooltipProps<ValueType, NameType> & { isValueOnly?: boolean }) {
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
              {formatPriceInfo(Number(item.value), 2, 2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
