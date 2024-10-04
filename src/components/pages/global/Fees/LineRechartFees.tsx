import Tippy from '@tippyjs/react';
import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

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
            className="text-sm font-mono"
            style={{ color: item.fill }}
          >
            {item.dataKey}: {formatPriceInfo(item.value)}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export default function LineRechartFees({
  title,
  data,
  labels,
  period,
  setPeriod,
}: {
  title: string;
  data: any;
  labels: {
    name: string;
    color?: string;
  }[];
  period: string | null;
  setPeriod: (v: string | null) => void;
}) {
  const formatYAxis = (tickItem: any) => {
    return formatPriceInfo(tickItem, 0);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <h2 className="">{title}</h2>

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
        <LineChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="name" fontSize="12" />

          <YAxis
            domain={[0, 'auto']}
            tickFormatter={formatYAxis}
            fontSize="13"
          />
          <Legend />
          <Tooltip content={<CustomToolTip />} cursor={false} />

          {labels?.map(({ name, color }) => {
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
