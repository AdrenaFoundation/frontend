import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
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

import downloadIcon from '../../../public/images/download.png';
import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

interface ChartLabel {
  name: string;
  color?: string;
  type?: 'area' | 'line';
  yAxisId?: 'left' | 'right';
  stackId?: string;
}

export default function MixedAreaLineChart<T extends string>({
  title,
  data,
  labels,
  period,
  setPeriod,
  periods,
  leftDomain,
  rightDomain,
  tippyContent,
  subValue,
  formatLeftY = 'currency',
  formatRightY = 'currency',
  gmt,
  events,
  lockPeriod,
  setLockPeriod,
  lockPeriods,
  exportToCSV,
  startTimestamp,
  endTimestamp,
}: {
  title: string;
  data: RechartsData[];
  labels: ChartLabel[];
  period: T | null;
  setPeriod: (v: T | null) => void;
  periods: (
    | T
    | {
      name: T;
      disabled?: boolean;
    }
  )[];
  leftDomain?: AxisDomain;
  rightDomain?: AxisDomain;
  tippyContent?: ReactNode;
  subValue?: number;
  formatLeftY?: 'percentage' | 'currency' | 'number';
  formatRightY?: 'percentage' | 'currency' | 'number';
  gmt?: number;
  events?: AdrenaEvent[];
  lockPeriod?: number;
  setLockPeriod?: (period: number) => void;
  lockPeriods?: number[];
  exportToCSV?: () => void;
  startTimestamp?: number;
  endTimestamp?: number;
}) {
  const { t } = useTranslation();
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

  const formatYAxis = (
    tickItem: number,
    format: 'percentage' | 'currency' | 'number',
  ) => {
    if (format === 'percentage') {
      return formatPercentage(tickItem, 0);
    }

    if (format === 'currency') {
      return formatGraphCurrency({
        tickItem,
        maxDecimals: 2,
        maxDecimalsIfToken: 4,
      });
    }

    return formatNumberShort(tickItem, 0);
  };

  // Group labels by type and axis
  const areaLabels = labels.filter(
    (label) => label.type === 'area' || !label.type,
  );
  const lineLabels = labels.filter((label) => label.type === 'line');

  // Right axis labels
  const rightAxisLabels = labels.filter((label) => label.yAxisId === 'right');

  // Determine if we need a right axis
  const hasRightAxis = rightAxisLabels.length > 0;

  const precisionMap = Object.fromEntries(
    labels.map((label) => [
      label.name,
      label.name.toLowerCase().includes('alp price')
        ? 3
        : label.name.toLowerCase().includes('aum')
          ? 0
          : 2,
    ]),
  );

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="mb-3">
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex justify-between items-center">
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
                  format="currency"
                  prefix="("
                  suffix=")"
                  suffixClassName="ml-0 text-txtfade"
                  isDecimalDimmed={false}
                  precision={title.includes('ALP Price') ? 4 : 0}
                />
              ) : null}
            </div>

            {exportToCSV ? (
              <div
                className="flex gap-1 items-center cursor-pointer transition-opacity opacity-50 hover:opacity-100"
                onClick={exportToCSV}
              >
                <div className="text-sm tracking-wider">{t('monitoring.export')}</div>
                <Image
                  src={downloadIcon}
                  width={0}
                  height={0}
                  style={{ width: '14px', height: '12px' }}
                  alt="Download icon"
                  className="w-3.5 h-3.5"
                />
              </div>
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
                    className={`cursor-pointer ${lockPeriod === period ? 'underline' : ''
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

        <div className="hidden sm:flex justify-between items-start">
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
                format="currency"
                prefix="("
                suffix=")"
                suffixClassName="ml-0 text-txtfade"
                isDecimalDimmed={false}
                precision={title.includes('ALP Price') ? 4 : 0}
              />
            ) : null}

            {exportToCSV ? (
              <div
                className="flex gap-1 items-center cursor-pointer transition-opacity opacity-50 hover:opacity-100"
                onClick={exportToCSV}
              >
                <div className="text-sm tracking-wider">{t('monitoring.export')}</div>
                <Image
                  src={downloadIcon}
                  width={0}
                  height={0}
                  style={{ width: '14px', height: '12px' }}
                  alt="Download icon"
                  className="w-3.5 h-3.5"
                />
              </div>
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
                    className={`cursor-pointer ${lockPeriod === period ? 'underline' : ''
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
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ marginLeft: hasRightAxis ? '0px' : '-1rem' }}
      >
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="10" xAxisId="0" />

          {/* Left Y-axis */}
          <YAxis
            domain={leftDomain || ['dataMin', 'dataMax']}
            tickFormatter={(val) => formatYAxis(val, formatLeftY)}
            fontSize="10"
            yAxisId="left"
          />

          {/* Right Y-axis (conditionally rendered) */}
          {hasRightAxis && (
            <YAxis
              domain={rightDomain || ['dataMin', 'dataMax']}
              tickFormatter={(val) => formatYAxis(val, formatRightY)}
              fontSize="10"
              yAxisId="right"
              orientation="right"
            />
          )}

          <Tooltip
            content={
              <CustomRechartsToolTip
                isValueOnly={false}
                format={formatLeftY}
                gmt={gmt}
                events={events}
                lineDataKeys={lineLabels.map((label) => label.name)}
                precisionMap={precisionMap}
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

          {/* Render area charts */}
          {areaLabels.map(({ name, color, yAxisId = 'left', stackId }) => (
            <Area
              key={name}
              type="monotone"
              dataKey={hiddenLabels.includes(name) ? name + ' ' : name}
              stroke={color}
              fill={color}
              yAxisId={yAxisId}
              xAxisId="0"
              connectNulls={true}
              hide={hiddenLabels.includes(name)}
              stackId={stackId}
            />
          ))}

          {/* Render line charts */}
          {lineLabels.map(({ name, color, yAxisId = 'left' }) => (
            <Line
              key={name}
              type="monotone"
              dataKey={hiddenLabels.includes(name) ? name + ' ' : name}
              stroke={color}
              strokeWidth={1}
              dot={false}
              activeDot={true}
              yAxisId={yAxisId}
              xAxisId="0"
              connectNulls={true}
              hide={hiddenLabels.includes(name)}
            />
          ))}

          {activeEvents?.map(({ label, time, color, labelPosition }, i) => (
            <ReferenceLine
              key={label + '-' + i + '-' + time}
              x={time}
              stroke={color}
              strokeDasharray="3 3"
              yAxisId="left"
              xAxisId="0"
              label={{
                position: labelPosition ?? 'insideTopRight',
                value: label,
                fill: color,
                fontSize: 12,
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
