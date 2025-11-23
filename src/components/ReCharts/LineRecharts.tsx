import Tippy from '@tippyjs/react';
import React, { ReactNode, useMemo } from 'react';
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
import { AxisDomain, DataKey, ScaleType } from 'recharts/types/util/types';

import { AdrenaEvent, RechartsData } from '@/types';
import {
  formatGraphCurrency,
  formatNumberShort,
  formatPercentage,
} from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

export default function LineRechart<T extends string>({
  title,
  data,
  labels,
  period,
  setPeriod,
  periods,
  gmt,
  xDomain,
  yDomain,
  scale = 'linear',
  tippyContent,
  isSmallScreen = true,
  subValue,
  formatY = 'currency',
  precision = 0,
  precisionTooltip = 2,
  isMaxUtilizationReferenceLine,
  events,
  isNowReferenceLine,
  isAlpPage,
  showLegend = true,
  startTimestamp,
  endTimestamp,
  extraHeaderContent,
}: {
  title: string;
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
  }[];
  period?: T | null;
  setPeriod?: (v: T | null) => void;
  periods: (
    | T
    | {
        name: T;
        disabled?: boolean;
      }
  )[];
  xDomain?: AxisDomain;
  yDomain?: AxisDomain;
  scale?: ScaleType;
  precision?: number;
  precisionTooltip?: number;
  tippyContent?: ReactNode;
  isSmallScreen?: boolean;
  subValue?: number;
  gmt?: number;
  formatY?: 'percentage' | 'currency' | 'number';
  isMaxUtilizationReferenceLine?: boolean;
  events?: AdrenaEvent[];
  isNowReferenceLine?: boolean;
  isAlpPage?: boolean;
  showLegend?: boolean;
  startTimestamp?: number;
  endTimestamp?: number;
  extraHeaderContent?: ReactNode;
}) {
  const [hiddenLabels, setHiddenLabels] = React.useState<
    DataKey<string | number>[]
  >([]);

  const activeEvents = useMemo(() => {
    return (events || []).filter(
      (event) =>
        startTimestamp &&
        endTimestamp &&
        event.timestamp >= startTimestamp &&
        event.timestamp <= endTimestamp,
    );
  }, [events, startTimestamp, endTimestamp]);

  const formatYAxis = (tickItem: number) => {
    if (formatY === 'percentage') {
      return Math.abs(tickItem) === 0
        ? '0%'
        : formatPercentage(tickItem, precision);
    }

    if (formatY === 'currency') {
      return formatGraphCurrency({
        tickItem,
        maxDecimals: 0,
        maxDecimalsIfToken: 4,
      });
    }

    return formatNumberShort(tickItem, precision);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          {!isAlpPage ? <h2 className="">{title}</h2> : null}

          {tippyContent && !isAlpPage && (
            <Tippy content={tippyContent} placement="auto">
              <span className="cursor-help text-txtfade">ⓘ</span>
            </Tippy>
          )}

          {!isSmallScreen && typeof subValue !== 'undefined' && (
            <FormatNumber
              nb={subValue}
              className="text-sm text-txtfade sm:text-xs"
              format="currency"
              prefix="("
              suffix=")"
              suffixClassName="ml-0 text-txtfade"
              precision={0}
            />
          )}
        </div>

        <div className="flex flex-col">
          {typeof setPeriod !== 'undefined' && typeof period !== 'undefined' ? (
            <PeriodSelector
              period={period}
              setPeriod={setPeriod}
              periods={periods}
            />
          ) : null}

          {extraHeaderContent ? extraHeaderContent : null}
        </div>
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ marginLeft: '-1rem' }}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="12" domain={xDomain} />

          <YAxis
            domain={yDomain}
            tickFormatter={formatYAxis}
            fontSize="11"
            scale={scale}
          />

          <Tooltip
            content={
              <CustomRechartsToolTip
                isValueOnly={labels.length === 1}
                format={formatY}
                gmt={gmt}
                precision={precisionTooltip}
                events={events}
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
              />
            }
            cursor={false}
          />

          {/* Only show legend when showLegend is true */}
          {showLegend && (
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
          )}

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

          {isMaxUtilizationReferenceLine && (
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
          )}

          {isNowReferenceLine && (
            <ReferenceLine
              x={new Date().toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              })}
              stroke="#fffffff0"
              strokeWidth={1}
              strokeDasharray={'6 6'}
              label={{
                position: 'insideTopRight',
                offset: 10,
                value: 'Now',
                fill: '#fffffff0',
                fontWeight: 'bold',
                fontSize: 12,
              }}
            />
          )}

          {activeEvents?.map((event, i) => (
            <ReferenceLine
              id={`event-${event.label}`}
              key={event.label + '-' + i + '-' + event.time}
              x={event.time}
              stroke={event.color}
              strokeDasharray="3 3"
              label={{
                position: event.labelPosition ?? 'insideTopRight',
                value: event.label,
                fill: event.color,
                fontSize: 12,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
