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

export default function LineRechartComposition({
  title,
  data,
  labels,
  period,
  setPeriod,
}: {
  title: string;
  data: any;
  labels: [
    {
      name: string;
      color?: string;
    },
  ];
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
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="12" />

          <YAxis
            domain={['dataMax']}
            tickFormatter={formatYAxis}
            fontSize="11"
          />

          <Tooltip content={<CustomToolTip />} cursor={false} />

          <Legend />

          <Line
            type="monotone"
            dataKey="WBTC"
            stroke="#f7931a"
            fill="#f7931a"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="USDC"
            stroke="#2775ca"
            fill="#2775ca"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="BONK"
            stroke="#dfaf92"
            fill="#dfaf92"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="JITOSOL"
            stroke="#84CC90"
            fill="#84CC90"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
