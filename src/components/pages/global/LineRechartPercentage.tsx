import React from 'react';
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

import { formatPercentage } from '@/utils';

export default function LineRechartPercentage({
  title,
  data,
  labels,
}: {
  title: string;
  data: any;
  labels: {
    name: string;
    color?: string;
  }[];
}) {
  const formatYAxis = (tickItem: any) => {
    return `${tickItem}%`;
  };

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
              {item.dataKey}: {formatPercentage(item.value)}
            </p>
          ))}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <h2 className="mb-3">{title}</h2>

      <ResponsiveContainer width="100%" height="100%" maxHeight={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="12" />

          <YAxis domain={[0, 100]} tickFormatter={formatYAxis} fontSize="13" />

          <Tooltip content={<CustomToolTip />} cursor={false} />

          <Legend />

          {labels?.map(({ name, color }) => {
            return (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                fill={color}
                stroke={color}
                dot={false}
              />
            );
          })}

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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
