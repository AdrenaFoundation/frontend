import Tippy from '@tippyjs/react';
import React, { ReactNode, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AxisDomain, DataKey } from 'recharts/types/util/types';

import { AdrenaEvent, RechartsData } from '@/types';
import { formatGraphCurrency } from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

export default function StakedBarRechart<T extends string>({
  title,
  data,
  labels,
  period,
  setPeriod,
  periods,
  domain,
  tippyContent,
  isSmallScreen = true,
  subValue,
  formatY = 'currency',
  formatTooltip = formatY,
  precisionTooltip = 0,
  displayYAxis = true,
  gmt,
  total,
  events,
  startTimestamp,
  endTimestamp,
}: {
  title: ReactNode;
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
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
  isSmallScreen?: boolean;
  subValue?: number;
  formatY?: 'percentage' | 'currency' | 'number';
  formatTooltip?: 'percentage' | 'currency' | 'number';
  precisionTooltip?: number;
  displayYAxis?: boolean;
  gmt?: number;
  total?: boolean;
  events?: AdrenaEvent[];
  startTimestamp?: number;
  endTimestamp?: number;
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
    if (displayYAxis === false) {
      return '';
    }

    if (formatY === 'percentage') {
      if (tickItem === 0) return '0%';
      if (tickItem >= 100) return '100%';

      return `${tickItem * 100}%`;
    }

    return formatGraphCurrency({ tickItem, maxDecimals: 0 });
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <h2 className="">{title}</h2>

          {tippyContent && (
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

        <PeriodSelector
          period={period}
          setPeriod={setPeriod}
          periods={periods}
        />
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ marginLeft: '-1rem' }}
      >
        <BarChart data={data} stackOffset="expand">
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="12" />

          <YAxis domain={domain} tickFormatter={formatYAxis} fontSize="11" />

          <Tooltip
            content={
              <CustomRechartsToolTip
                isValueOnly={labels.length === 1}
                format={formatTooltip}
                precision={precisionTooltip}
                total={total}
                gmt={gmt}
                events={events}
                startTimestamp={startTimestamp}
                endTimestamp={endTimestamp}
              />
            }
            cursor={false}
          />

          {labels.length > 1 ? (
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
          ) : null}

          {labels.map(({ name, color }) => {
            return (
              <Bar
                type="monotone"
                stackId="staked"
                dataKey={hiddenLabels.includes(name) ? name + ' ' : name}
                stroke={hiddenLabels.includes(name) ? `${color} 80` : color}
                fill={color}
                key={name}
              />
            );
          })}

          {activeEvents?.map(({ label, time, color, labelPosition }, i) => (
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
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
