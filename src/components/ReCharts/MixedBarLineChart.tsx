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
import { formatGraphCurrency } from '@/utils';

import CustomRechartsToolTip from '../CustomRechartsToolTip/CustomRechartsToolTip';
import FormatNumber from '../Number/FormatNumber';
import PeriodSelector from './PeriodSelector';

interface ChartLabel {
    name: string;
    color?: string;
    type?: 'bar' | 'line';
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
        !label.name.toLowerCase().includes('cumulative'));

    // Find the cumulative label (either Fees or Volume)
    const cumulativeLabel = labels.find(label =>
        label.name.toLowerCase().includes('cumulative'));

    // Calculate the maximum value for the cumulative line
    const maxCumulativeValue = data.reduce((max, point) => {
        const cumulativeValue = cumulativeLabel ? Number(point[cumulativeLabel.name] || 0) : 0;
        return cumulativeValue > max ? cumulativeValue : max;
    }, 0);

    // Create a suitable domain for the cumulative axis
    const cumulativeDomain: AxisDomain = [0, Math.ceil(maxCumulativeValue * 1.1)];

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
                    {cumulativeLabel && (
                        <YAxis
                            domain={cumulativeDomain}
                            tickFormatter={formatYAxis}
                            fontSize="11"
                            axisLine={true}
                            tickLine={true}
                            yAxisId="right"
                            orientation="right"
                            scale="linear"
                        />
                    )}

                    <Tooltip
                        content={
                            <CustomRechartsToolTip
                                isValueOnly={labels.length === 1}
                                format={formatY}
                                total={total}
                                gmt={gmt}
                                events={events}
                                lineDataKeys={lineLabels.map(label => label.name).concat(cumulativeLabel ? [cumulativeLabel.name] : [])}
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
                    {barLabels.map(({ name, color }) => {
                        return (
                            <Bar
                                key={name}
                                type="monotone"
                                stackId="stacked"
                                dataKey={hiddenLabels.includes(name) ? name + ' ' : name} // Add space to remove the line but keep the legend
                                stroke={hiddenLabels.includes(name) ? `${color} 60` : color} // 50% opacity for hidden labels
                                fill={color}
                                xAxisId="main"
                                yAxisId="left"
                            />
                        );
                    })}

                    {/* Render standard line charts */}
                    {lineLabels.map(({ name, color }) => {
                        return (
                            <Line
                                key={name}
                                type="monotone"
                                dataKey={hiddenLabels.includes(name) ? name + ' ' : name}
                                stroke={color}
                                dot={false}
                                activeDot={false}
                                connectNulls={true}
                                hide={hiddenLabels.includes(name)}
                                name={name}
                                yAxisId="left"
                                xAxisId="main"
                            />
                        );
                    })}

                    {/* Render cumulative total line using right axis */}
                    {cumulativeLabel && (
                        <Line
                            key={cumulativeLabel.name}
                            type="monotone"
                            dataKey={hiddenLabels.includes(cumulativeLabel.name) ? cumulativeLabel.name + ' ' : cumulativeLabel.name}
                            stroke={cumulativeLabel.color}
                            dot={false}
                            activeDot={true}
                            connectNulls={true}
                            hide={hiddenLabels.includes(cumulativeLabel.name)}
                            name={cumulativeLabel.name}
                            yAxisId="right"
                            xAxisId="main"
                        />
                    )}

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
