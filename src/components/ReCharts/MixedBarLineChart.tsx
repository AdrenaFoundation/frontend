import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import {
    Bar,
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
import { AxisDomain, DataKey, ScaleType } from 'recharts/types/util/types';

import { AdrenaEvent, RechartsData } from '@/types';
import { formatGraphCurrency, formatPercentage } from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

export interface ChartLabel {
    name: string;
    color?: string;
    type?: 'bar' | 'line';
    yAxisId?: 'left' | 'right';
    format?: 'percentage' | 'currency' | 'number';
}

export default function MixedBarLineChart<T extends string>({
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
    gmt,
    total,
    events,
    yAxisBarScale = 'linear',
    formatRightY,
    rightDomain,
}: {
    title: string;
    data: RechartsData[];
    labels: ChartLabel[];
    period: T | null;
    setPeriod: (v: T | null) => void;
    periods: (T | {
        name: T;
        disabled?: boolean;
    })[];
    domain?: AxisDomain;
    tippyContent?: ReactNode;
    isSmallScreen?: boolean;
    subValue?: number;
    formatY?: 'percentage' | 'currency' | 'number';
    gmt?: number;
    total?: boolean;
    events?: AdrenaEvent[];
    yAxisBarScale: ScaleType;
    formatRightY?: 'percentage' | 'currency' | 'number';
    rightDomain?: AxisDomain;
}) {
    const [hiddenLabels, setHiddenLabels] = React.useState<
        DataKey<string | number>[]
    >([]);

    const formatYAxis = (tickItem: number) => {
        return formatGraphCurrency({ tickItem, maxDecimals: 0 });
    };

    // Group labels by type
    const barLabels = labels.filter(label => label.type !== 'line');
    const lineLabels = labels.filter(label => label.type === 'line' &&
        (!label.name.toLowerCase().includes('cumulative')));

    const hasRightAxis = labels.some(l => l.yAxisId === 'right');

    const formatMap = Object.fromEntries(
        labels.map(label => [label.name, label.format ?? formatY])
    );

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
                            suffixClassName='ml-0 text-txtfade'
                            precision={0}
                        />
                    )}
                </div>

                <PeriodSelector period={period} setPeriod={setPeriod} periods={periods} />
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                >
                    <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

                    <XAxis
                        dataKey="time"
                        fontSize="12"
                        axisLine={true}
                        tickLine={true}
                        scale="point"
                        xAxisId="main"
                        allowDataOverflow={true}
                    />

                    {/* Left Y-axis for daily values */}
                    <YAxis
                        domain={domain}
                        tickFormatter={formatYAxis}
                        fontSize="11"
                        axisLine={true}
                        tickLine={true}
                        yAxisId="left"
                        orientation="left"
                        scale={yAxisBarScale}
                    />

                    {/* Right Y-axis for cumulative total */}
                    {hasRightAxis ? (
                        <YAxis
                            domain={rightDomain}
                            tickFormatter={formatRightY === 'percentage' ? (value: number) => `${formatPercentage(value, 0)}%` : formatYAxis}
                            fontSize="11"
                            axisLine={true}
                            tickLine={true}
                            yAxisId="right"
                            orientation="right"
                            scale="linear"
                        />
                    ) : null}

                    <Tooltip
                        content={
                            <CustomRechartsToolTip
                                isValueOnly={labels.length === 1}
                                format={formatY}
                                formatMap={formatMap}
                                total={total}
                                gmt={gmt}
                                events={events}
                                lineDataKeys={lineLabels.map(label => label.name)}
                                precision={0}
                            />
                        }
                        cursor={false}
                    />

                    {labels.length > 1 ? <Legend
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
                    /> : null}

                    {/* Render bar charts */}
                    {barLabels.map(({ name, color }) => (
                        <Bar
                            key={name}
                            type="monotone"
                            stackId="stacked"
                            dataKey={hiddenLabels.includes(name) ? name + ' ' : name}
                            stroke={hiddenLabels.includes(name) ? `${color} 60` : color}
                            fill={color}
                            xAxisId="main"
                            yAxisId="left"
                        />
                    ))}

                    {/* Render standard line charts */}
                    {lineLabels.map((label) => (
                        <Line
                            key={label.name}
                            type="monotone"
                            dataKey={hiddenLabels.includes(label.name) ? label.name + ' ' : label.name}
                            stroke={label.color}
                            dot={false}
                            activeDot={false}
                            connectNulls={true}
                            hide={hiddenLabels.includes(label.name)}
                            name={label.name}
                            yAxisId={label.yAxisId ?? 'left'}
                            xAxisId="main"
                        />
                    ))}

                    {events?.map(({
                        label,
                        time,
                        color,
                        labelPosition,
                    }, i) => <ReferenceLine
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
                            yAxisId="left"
                            xAxisId="main"
                        />)}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
