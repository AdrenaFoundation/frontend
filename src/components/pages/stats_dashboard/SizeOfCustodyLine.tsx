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

import { formatNumber, formatPriceInfo } from '@/utils';

import CustomToolTip from './CustomToolTip';

export default function SizeOfCustodyLine({
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
    <div className="border p-3 rounded-lg max-h-[450px]">
      <h2 className="mb-3">{title}</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMax']} tickFormatter={formatYAxis} />
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
            stroke="#3D3E3F"
            fill="#3D3E3F"
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
