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

import FormatNumber from '@/components/Number/FormatNumber';
import { formatPriceInfo } from '@/utils';

function CustomToolTip(props: any) {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    return (
        <div className="bg-third p-3 border border-white rounded-lg min-w-[14em]">
          <p className="text-lg mb-2 font-mono">{label}</p>
          {payload.map((item: any) => (
            <div
              key={item.dataKey}
              className="text-sm font-mono flex justify-between"
              style={{ color: item.fill }}
            >
              <span style={{ color: item.fill }}>{item.dataKey}:</span>
              <span className="ml-2 font-mono" style={{ color: item.fill }}>{formatPriceInfo(item.value, 2, 2)}</span>
            </div>
          ))}
        </div>
    );
  }

  return null;
}

export default function LineRechartFees({
  title,
  sub_value,
  data,
  labels,
  period,
  setPeriod,
}: {
  title: string;
  sub_value: number;
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
        <div className="flex items-center gap-2">
          <h2 className="">{title}</h2>
          <Tippy content="Liquidation fees shown are exit fees from liquidated positions, not actual liquidation fees. All Opens are 0 bps, and Closes/Liquidations 16 bps.">
            <span className="cursor-help text-txtfade">ⓘ</span>
          </Tippy>
          
          <FormatNumber
            nb={sub_value}
            className="text-sm text-txtfade"
            prefix="(tot. $"
            suffix=")"
            precision={0}
          />
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
        <LineChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="name" fontSize="12" />

          <YAxis
            domain={[0, 'auto']}
            tickFormatter={formatYAxis}
            fontSize="11"
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
