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

import { AdrenaEvent, RechartsData } from '@/types';
import { formatNumber, formatNumberShort, formatPercentage, formatPriceInfo, formatToWeekOf } from '@/utils';

function CustomRechartsToolTip({
  data,
  active,
  payload,
  label,
  precision = 2,
  format = 'currency',
  labelCustomization,
  events,
  totalColor = 'red',
}: TooltipProps<ValueType, NameType> & {
  data: RechartsData[];
  precision?: number;
  format?: 'currency' | 'percentage' | 'number';
  labelCustomization?: (label: string) => string;
  totalColor?: string;
  events?: AdrenaEvent[];
}) {
  if (active && payload && payload.length) {
    const activeEvents = (events || []).filter(event => event.time === label);

    return (
      <div className="bg-third p-3 border border-white rounded-lg min-w-[12em]">
        {label && <p className="text-lg mb-2 font-mono">{labelCustomization ? labelCustomization(label) : label}</p>}

        <table className='w-full'>
          <thead>
            <th className='text-xs font-boldy'>Name</th>
            <th className='text-xs font-boldy'>Date</th>
            <th className='text-xs font-boldy'>Traders</th>
            <th className='text-xs font-boldy'>start diff</th>
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

                  return format === 'currency'
                    ? formatPriceInfo(Number(v), precision, precision)
                    : format === 'percentage'
                      ? formatPercentage(Number(v), precision)
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
                    {format === 'currency'
                      ? formatPriceInfo(Number(item.value), precision, precision)
                      : format === 'percentage'
                        ? formatPercentage(Number(item.value), precision)
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


        {activeEvents.length > 0 ? <div className='mt-2 text-xs underline mb-1 opacity-90'>Event{activeEvents.length > 1 ? 's' : ''}:</div> : null}

        <div className='flex flex-col gap-1'>
          {activeEvents.map((event, i) =>
            <div key={event.label + '-' + i} className={twMerge('flex text-xs opacity-90 max-w-[20em]')}>
              {event.description}
            </div>)}
        </div>
      </div >
    );
  }

  return null;
}

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
          wrapperStyle={{ zIndex: 20 }}
          content={
            <CustomRechartsToolTip
              data={data}
              labelCustomization={(label: string) => {
                return `from ${formatToWeekOf(label)} to ${formatToWeekOf(label, 1)}`;
              }}
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
