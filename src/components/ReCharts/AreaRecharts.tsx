import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AxisDomain, DataKey } from 'recharts/types/util/types';

import { AdrenaEvent, RechartsData } from '@/types';
import {
  formatGraphCurrency,
  formatNumberShort,
  formatPercentage,
} from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

export default function AreaRechart<T extends string>({
  title,
  data,
  labels,
  period,
  setPeriod,
  periods,
  domain,
  tippyContent,
  subValue,
  formatY = 'currency',
  formatTooltipNumber = 'currency',
  gmt,
  events,
  lockPeriod,
  setLockPeriod,
  lockPeriods,
}: {
  title: string;
  data: RechartsData[];
  labels?: {
    name: string;
    color?: string;
    type?: 'area' | 'line';
  }[];
  period: T | null;
  setPeriod: (v: T | null) => void;
  periods: (
    | T
    | {
        name: T;
        disabled?: boolean;
      }
  )[];
  domain?: AxisDomain;
  tippyContent?: ReactNode;
  subValue?: number;
  formatY?: 'percentage' | 'currency' | 'number';
  formatTooltipNumber?: 'percentage' | 'currency' | 'number';
  gmt?: number;
  events?: AdrenaEvent[];
  lockPeriod?: number;
  setLockPeriod?: (period: number) => void;
  lockPeriods?: number[];
}) {
  const [hiddenLabels, setHiddenLabels] = React.useState<
    DataKey<string | number>[]
  >([]);

  const formatYAxis = (tickItem: number) => {
    if (formatY === 'percentage') {
      return formatPercentage(tickItem, 0);
    }

    if (formatY === 'currency') {
      return formatGraphCurrency({
        tickItem,
        maxDecimals: 2,
        maxDecimalsIfToken: 4,
      });
    }

    return formatNumberShort(tickItem, 0);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <h2 className="">{title}</h2>

          {tippyContent ? (
            <Tippy content={tippyContent} placement="auto">
              <span className="cursor-help text-txtfade">ⓘ</span>
            </Tippy>
          ) : null}

          {subValue ? (
            <FormatNumber
              nb={subValue}
              className="text-sm text-txtfade sm:text-xs"
              format={formatTooltipNumber}
              prefix="("
              suffix=")"
              suffixClassName="ml-0 text-txtfade"
              isDecimalDimmed={false}
              precision={title === 'ALP Price' ? 4 : 0}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <PeriodSelector
            period={period}
            setPeriod={setPeriod}
            periods={periods}
          />

          {lockPeriods && setLockPeriod && (
            <div className="flex gap-2 text-sm items-center">
              <span className="text-txtfade mr-1">Lock:</span>
              {lockPeriods.map((period) => (
                <div
                  key={period}
                  className={`cursor-pointer ${
                    lockPeriod === period ? 'underline' : ''
                  }`}
                  onClick={() => setLockPeriod(period)}
                >
                  {period}d
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="10" />

          <YAxis domain={domain} tickFormatter={formatYAxis} fontSize="10" />

          <Tooltip
            content={
              <CustomRechartsToolTip
                isValueOnly={labels?.length === 1}
                format={formatTooltipNumber}
                gmt={gmt}
                events={events}
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

          {labels?.map(({ name, color, type = 'area' }) => {
            const isHidden = hiddenLabels.includes(name);

            if (type === 'line') {
              return (
                <Line
                  type="monotone"
                  dataKey={isHidden ? name + ' ' : name} // Add space to hide the line but keep the legend
                  key={name}
                  stroke={isHidden ? `${color}80` : color} // 50% opacity for hidden lines
                  strokeWidth={2}
                  dot={false}
                />
              );
            }

            return (
              <Area
                type="monotone"
                dataKey={isHidden ? name + ' ' : name} // Add space to hide the area but keep the legend
                key={name}
                stroke={isHidden ? `${color}80` : color} // 50% opacity for hidden areas
                fill={isHidden ? `${color}40` : color} // More transparent fill for hidden areas
              />
            );
          })}

          {events?.map(({ label, time, color, labelPosition }, i) => (
            <ReferenceLine
              key={label + '-' + i + '-' + time}
              x={time}
              stroke={color}
              strokeDasharray="3 3"
              label={{
                position: labelPosition ?? 'insideTopRight',
                value: label,
                fill: color,
                fontSize: 12,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
