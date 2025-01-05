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

import { RechartsData } from '@/types';
import { formatGraphCurrency, formatNumberShort, formatPercentage } from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

export default function AreaRechart<T extends string>({
  title,
  data,
  labels,
  period,
  setPeriod,
  periods,
  domain,
  tippyContent,
  subValue,
  formatY = 'currency',
  gmt,
}: {
  title: string;
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
  }[];
  period: T | null;
  setPeriod: (v: T | null) => void;
  periods: (T | {
    name: T;
    disabled?: boolean;
  })[];
  domain?: AxisDomain;
  tippyContent?: ReactNode;
  subValue?: number;
  formatY?: 'percentage' | 'currency' | 'number';
  gmt?: number;
}) {
  const formatYAxis = (tickItem: number) => {
    if (formatY === 'percentage') {
      return formatPercentage(tickItem, 0);
    }

    if (formatY === 'currency') {
      return formatGraphCurrency({ tickItem, maxDecimals: 2, maxDecimalsIfToken: 4 });
    }

    return formatNumberShort(tickItem, 0);
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

        <PeriodSelector period={period} setPeriod={setPeriod} periods={periods} />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="10" />

          <YAxis domain={domain} tickFormatter={formatYAxis} fontSize="10" />

          <Tooltip
            content={
              <CustomRechartsToolTip
                isValueOnly={labels.length === 1}
                gmt={gmt}
              />
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
