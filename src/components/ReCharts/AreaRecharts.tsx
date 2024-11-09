import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';
import { twMerge } from 'tailwind-merge';

import { RechartsData } from '@/types';
import { formatNumberShort, formatPercentage, formatPriceInfo } from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';

export default function AreaRechart({
  title,
  data,
  labels,
  period,
  setPeriod,
  domain,
  tippyContent,
  subValue,
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
  subValue?: number;
  formatY?: 'percentage' | 'currency' | 'number';
}) {
  const formatYAxis = (tickItem: number) => {
    if (formatY === 'percentage') {
      return formatPercentage(tickItem, 0);
    }

    if (formatY === 'currency') {
      return formatPriceInfo(tickItem, title === 'ALP Price' ? 4 : 0);
    }
    return formatNumberShort(tickItem);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <h2 className="">{title}</h2>

          {tippyContent && (
            <Tippy content={tippyContent} placement="auto">
              <span className="cursor-help text-txtfade">ⓘ</span>
            </Tippy>
          )}

          <FormatNumber
            nb={subValue}
            className="text-sm text-txtfade sm:text-xs"
            format="currency"
            prefix="("
            suffix=")"
            suffixClassName='ml-0 text-txtfade'
            isDecimalDimmed={false}
            precision={title === 'ALP Price' ? 4 : 0}
          />
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
        <AreaChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="10" />

          <YAxis domain={domain} tickFormatter={formatYAxis} fontSize="10" />

          <Tooltip
            content={
              <CustomRechartsToolTip isValueOnly={labels.length === 1} />
            }
            cursor={false}
          />

          {labels?.map(({ name, color }) => {
            return (
              <Area
                type="monotone"
                dataKey={name}
                key={name}
                stroke={color}
                fill={color}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
