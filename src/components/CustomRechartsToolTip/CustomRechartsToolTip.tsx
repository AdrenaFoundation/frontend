import React from 'react';
import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { twMerge } from 'tailwind-merge';

import { AdrenaEvent } from '@/types';
import { formatNumber, formatPercentage, formatPriceInfo } from '@/utils';

export default function CustomRechartsToolTip({
  active,
  payload,
  label,
  labelSuffix,
  labelPrefix,
  isValueOnly,
  format = 'currency',
  suffix = '',
  isPieChart,
  precision = 2,
  total = false,
  totalColor = 'red',
  gmt, // GMT+0
  labelCustomization,
  events,
  lineDataKeys,
  precisionMap,
}: TooltipProps<ValueType, NameType> & {
  isValueOnly?: boolean;
  format?: 'currency' | 'percentage' | 'number';
  labelPrefix?: string;
  labelSuffix?: string;
  suffix?: string;
  isPieChart?: boolean;
  precision?: number;
  total?: boolean;
  totalColor?: string;
  gmt?: number;
  labelCustomization?: (label: string) => string;
  events?: AdrenaEvent[];
  lineDataKeys?: string[];
  precisionMap?: Record<string, number>;
}) {
  if (active && payload && payload.length) {
    const activeEvents = (events || []).filter(event => event.time === label);

    return (
      <div className="bg-third p-3 border border-white rounded-lg min-w-[12em]">
        {label && <p className="text-lg mb-2 font-mono">{labelPrefix}{labelCustomization ? labelCustomization(label) : label} {typeof gmt !== 'undefined' ? `${gmt < 0 ? `GMT${gmt}` : gmt > 0 ? `GMT+${gmt}` : "UTC"}` : null} {labelSuffix}</p>}

        {total ? <div
          key="total"
          className="text-sm font-mono flex gap-3 justify-between"
          style={{ color: totalColor }}
        >
          {!isValueOnly && !isPieChart && (
            <span style={{ color: totalColor }}>Total:</span>
          )}

          {!isValueOnly && isPieChart && (
            <span style={{ color: totalColor }}>Total:</span>
          )}

          <span
            className={twMerge('font-mono', isValueOnly && 'text-lg')}
            style={{ color: totalColor }}
          >
            {(() => {
              const v = payload.reduce((acc, item) => {
                const dataKeyStr = String(item.dataKey);
                if (lineDataKeys && lineDataKeys.some(key => dataKeyStr.includes(key))) {
                  return acc;
                }
                return acc + Number(item.value);
              }, 0);

              return format === 'currency'
                ? formatPriceInfo(Number(v), precision, precision)
                : format === 'percentage'
                  ? formatPercentage(Number(v), precision)
                  : formatNumber(Number(v), precision)
            })()}

            {suffix}
          </span>
        </div> : null}

        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="text-sm font-mono flex gap-3 justify-between"
            style={{ color: item.color }}
          >
            {!isValueOnly && !isPieChart && (
              <span style={{ color: item.color }}>{item.dataKey}:</span>
            )}

            {!isValueOnly && isPieChart && (
              <span style={{ color: item.color }}>{item.payload.name}:</span>
            )}

            <span
              className={twMerge('font-mono', isValueOnly && 'text-lg')}
              style={{ color: item.color }}
            >
              {(() => {
                const key = String(item.dataKey);
                const itemPrecision = precisionMap?.[key] ?? precision;
                return format === 'currency'
                  ? formatPriceInfo(Number(item.value), itemPrecision, itemPrecision)
                  : format === 'percentage'
                    ? formatPercentage(Number(item.value), itemPrecision)
                    : formatNumber(Number(item.value), itemPrecision);
              })()}
              {suffix}
            </span>
          </div>
        ))}

        {activeEvents.length > 0 ? <div className='mt-2 text-xs underline mb-1 opacity-90'>Event{activeEvents.length > 1 ? 's' : ''}:</div> : null}

        <div className='flex flex-col gap-1'>
          {activeEvents.map((event, i) =>
            <div key={event.label + '-' + i} className={twMerge('flex text-xs opacity-90 max-w-[20em]')}>
              {event.description}
            </div>)}
        </div>
      </div >
    );
  }

  return null;
}
