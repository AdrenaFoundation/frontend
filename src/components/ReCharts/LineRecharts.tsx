import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AxisDomain, TickItem } from 'recharts/types/util/types';
import { twMerge } from 'tailwind-merge';

import { RechartsData } from '@/types';
import { formatNumberShort, formatPercentage, formatPriceInfo } from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';

export default function LineRechart({
  title,
  data,
  labels,
  period,
  setPeriod,
  domain,
  tippyContent,
  isSmallScreen = true,
  subValue,
  isReferenceLine,
  formatY = 'currency',
}: {
  title: string;
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
  }[];
  period: string | null;
  setPeriod: (v: string | null) => void;
  domain?: AxisDomain;
  tippyContent?: ReactNode;
  isSmallScreen?: boolean;
  subValue?: number;
  isReferenceLine?: boolean;
  formatY?: 'percentage' | 'currency' | 'number';
}) {
  const formatYAxis = (tickItem: number) => {
    if (formatY === 'percentage') {
      return formatPercentage(tickItem, 0);
    }

    if (formatY === 'currency') {
      return formatPriceInfo(tickItem, 0);
    }
    return formatNumberShort(tickItem);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <h2 className="">{title}</h2>

          {tippyContent && (
            <Tippy content={tippyContent}>
              <span className="cursor-help text-txtfade">ⓘ</span>
            </Tippy>
          )}

          {!isSmallScreen && (
            <FormatNumber
              nb={subValue}
              className="text-sm text-txtfade sm:text-xs"
              format="currency"
              prefix="("
              suffix=")"
              precision={0}
            />
          )}
        </div>

        <div className="flex gap-2 text-sm">
          <div
            className={twMerge(
              'cursor-pointer',
              period === '1d' ? 'underline' : '',
            )}
            onClick={() => setPeriod('1d')}
          >
            1d
          </div>
          <div
            className={twMerge(
              'cursor-pointer',
              period === '7d' ? 'underline' : '',
            )}
            onClick={() => setPeriod('7d')}
          >
            7d
          </div>
          <div
            className={twMerge(
              'cursor-pointer',
              period === '1M' ? 'underline' : '',
            )}
            onClick={() => setPeriod('1M')}
          >
            1M
          </div>

          <Tippy
            content={
              <div className="text-sm w-20 flex flex-col justify-around">
                Coming soon
              </div>
            }
            placement="auto"
          >
            <div className="text-txtfade cursor-not-allowed">1Y</div>
          </Tippy>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="12" />

          <YAxis domain={domain} tickFormatter={formatYAxis} fontSize="11" />

          <Tooltip
            content={
              <CustomRechartsToolTip isValueOnly={labels.length === 1} />
            }
            cursor={false}
          />

          <Legend />
          {labels.map(({ name, color }) => {
            return (
              <Line
                type="monotone"
                dataKey={name}
                stroke={color}
                fill={color}
                dot={false}
                key={name}
              />
            );
          })}

          {isReferenceLine && (
            <ReferenceLine
              y={100}
              stroke="white"
              label={{
                position: 'top',
                value: 'Max utilization',
                fill: 'white',
                fontSize: 12,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
