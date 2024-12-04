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
import { DataKey } from 'recharts/types/util/types';

import { RechartsData } from '@/types';
import { formatNumberShort } from '@/utils';

import CustomRechartsToolTip from '../../../CustomRechartsToolTip/CustomRechartsToolTip';

export default function LineRechartCohorts({
  data,
  labels,
  format,
}: {
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
  }[];
  format: 'currency' | 'number';
}) {
  const [hiddenLabels, setHiddenLabels] = React.useState<
    DataKey<string | number>[]
  >([]);

  const formatYAxis = (tickItem: number) => {
    return formatNumberShort(tickItem, 0);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

        <XAxis dataKey="time" fontSize="12" />

        <YAxis domain={['auto', 'auto']} tickFormatter={formatYAxis} fontSize="11" scale={"log"} />

        <Tooltip
          content={
            <CustomRechartsToolTip
              isValueOnly={labels.length === 1}
              format={format}
            />
          }
          cursor={false}
        />

        <Legend
          onClick={(e) => {
            setHiddenLabels(() => {
              if (
                hiddenLabels.includes(
                  String(e.dataKey).trim() as DataKey<string | number>,
                )
              ) {
                return hiddenLabels.filter(
                  (l) => l !== String(e.dataKey).trim(),
                ) as DataKey<string | number>[];
              }
              return [
                ...hiddenLabels,
                String(e.dataKey).trim() as DataKey<string | number>,
              ];
            });
          }}
          wrapperStyle={{ cursor: 'pointer', userSelect: 'none' }}
        />

        {labels.map(({ name, color }) => {
          return (
            <Line
              type="monotone"
              dataKey={hiddenLabels.includes(name) ? name + ' ' : name} // Add space to remove the line but keep the legend
              stroke={hiddenLabels.includes(name) ? `${color}80` : color} // 50% opacity for hidden labels
              fill={color}
              dot={false}
              key={name}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
