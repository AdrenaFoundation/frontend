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

import { formatPriceInfo } from '@/utils';
import Tippy from '@tippyjs/react';

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

export default function LineRechartOpenInterest({
  title,
  data,
  labels,
}: {
  title: string;
  data: any;
  labels: [
    {
      name: string;
      color?: string;
    },
  ];
}) {
  const formatYAxis = (tickItem: any) => {
    let num = tickItem;
    if (tickItem > 999_999_999) {
      num = (tickItem / 1_000_000_000).toFixed(2) + 'B';
    } else if (tickItem > 999_999) {
      num = (tickItem / 1_000_000).toFixed(2) + 'M';
    } else if (tickItem > 999) {
      num = (tickItem / 1_000).toFixed(2) + 'K';
    }

    return `$${num}`;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex mb-3 justify-between items-center">
        <h2 className="">{title}</h2>

        <div className="flex gap-2 text-sm">
          <div className="cursor-pointer">1d</div>
          <Tippy
            content={
              <div className="text-sm w-20 flex flex-col justify-around">
                Coming soon
              </div>
            }
            placement="auto"
          >
            <div className="flex gap-2">
              <div className="text-txtfade cursor-not-allowed">7d</div>
              <div className="text-txtfade cursor-not-allowed">1M</div>
              <div className="text-txtfade cursor-not-allowed">1Y</div>
            </div>
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
            fontSize="13"
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
