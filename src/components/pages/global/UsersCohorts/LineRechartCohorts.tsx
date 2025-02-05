import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { DataKey } from 'recharts/types/util/types';
import { twMerge } from 'tailwind-merge';

import { RechartsData } from '@/types';
import { formatNumber, formatNumberShort, formatPercentage, formatPriceInfo, formatToWeekOf } from '@/utils';

function CustomRechartsToolTip({
  data,
  active,
  payload,
  label,
  precision = 2,
  labelCustomization,
  totalColor = 'red',
  type,
}: TooltipProps<ValueType, NameType> & {
  data: RechartsData[];
  precision?: number;
  labelCustomization?: (label: string) => string;
  totalColor?: string;
  type: 'users' | 'volumes' | 'trades';
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-third p-3 border border-white rounded-lg min-w-[12em]">
        {label && <p className="text-lg mb-2 font-mono">{labelCustomization ? labelCustomization(label) : label}</p>}

        <table className='w-full'>
          <thead>
            <th className='text-xs font-boldy'>Name</th>
            <th className='text-xs font-boldy'>Date</th>
            <th className='text-xs font-boldy'>
              {{
                users: 'Users',
                volumes: 'Volume',
                trades: 'Trades',
              }[type]}
            </th>
            <th className='text-xs font-boldy'>
              {{
                users: 'Retention',
                volumes: 'Change',
                trades: 'Change',
              }[type]}
            </th>
          </thead>

          <tbody>
            <tr>
              <td className='text-center'>
                <span
                  style={{ color: totalColor }}
                >
                  Total
                </span>
              </td>

              <td className='text-center'>
                -
              </td>

              <td className='text-center text-sm font-mono' style={{ color: totalColor }}>
                {(() => {
                  const v = payload.reduce((acc, item) => acc + Number(item.value), 0);

                  return type === 'volumes'
                    ? formatPriceInfo(Number(v), precision, precision)
                    : formatNumber(Number(v), precision)
                })()}
              </td>

              <td className='text-center text-txtfade'>
                -
              </td>
            </tr>

            {payload.map((item) => {
              const originalData = data.find(x => x && item.dataKey && !!x[item.dataKey]);

              const originalNumber = originalData && item.dataKey ? Number(originalData[item.dataKey]) : 0;
              const originalPercentage = Number(item.value) * 100 / originalNumber;

              return <tr key={item.dataKey}>
                <td className='text-center'>
                  <span style={{ color: item.color }}>{item.dataKey}</span>
                </td>

                <td className='text-center'>
                  <span style={{ color: item.color }}>{originalData?.['time']}</span>
                </td>

                <td className='text-center'>
                  <span
                    className={twMerge('font-mono')}
                    style={{ color: item.color }}
                  >
                    {type === 'volumes'
                      ? formatPriceInfo(Number(item.value), precision, precision)
                      : formatNumber(Number(item.value), precision)}
                  </span>
                </td>

                <td className='text-center text-sm font-mono text-txtfade'>
                  {formatPercentage(originalPercentage, precision)}
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </div >
    );
  }

  return null;
}

export default function LineRechartCohorts({
  data,
  labels,
  type,
}: {
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
  }[];
  type: 'users' | 'volumes' | 'trades';
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
          wrapperStyle={{ zIndex: 20 }}
          content={
            <CustomRechartsToolTip
              data={data}
              labelCustomization={(label: string) => {
                return `from ${formatToWeekOf(label)} to ${formatToWeekOf(label, 1)}`;
              }}
              type={type}
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
