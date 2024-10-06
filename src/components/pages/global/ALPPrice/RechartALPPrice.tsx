import Tippy from '@tippyjs/react';
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import { formatPriceInfo } from '@/utils';

function CustomToolTip(props: any) {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    return (
      <div className="bg-third p-3 border border-white rounded-lg">
        <p className="text-lg mb-2 font-mono">{label}</p>

        {payload.map((item: any) => (
          <p
            key={item.dataKey}
            className="text-lg font-mono text-center"
            style={{ color: item.fill }}
          >
            {formatPriceInfo(item.value)}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export default function RechartALPPrice({
  title,
  subValue,
  data,
  labels,
  period,
  setPeriod,
}: {
  title: string;
  subValue: number;
  data: any;
  labels: {
    name: string;
    color?: string;
  }[];
  period: string | null;
  setPeriod: (v: string | null) => void;
}) {
  const formatYAxis = (tickItem: any) => {
    return formatPriceInfo(tickItem, 6, 6);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="">{title}</h2>

          <div className="text-txtfade text-sm">
            ({formatPriceInfo(subValue, 4)})
          </div>
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

          <XAxis dataKey="name" fontSize="10" />

          <YAxis
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatYAxis}
            fontSize="10"
          />

          <Tooltip content={<CustomToolTip />} cursor={false} />

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
