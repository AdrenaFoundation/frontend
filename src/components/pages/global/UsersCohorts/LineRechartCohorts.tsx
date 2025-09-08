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
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { DataKey } from 'recharts/types/util/types';

import FormatNumber from '@/components/Number/FormatNumber';
import { RechartsData } from '@/types';
import {
  chunkArray,
  formatNumber,
  formatNumberShort,
  formatPercentage,
  formatToWeekOf,
} from '@/utils';

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
    const total = payload.reduce((acc, item) => acc + Number(item.value), 0);

    payload = [
      {}, // TRICK: add an item for total that will be the first item - useful to get same size chunks
      ...payload,
    ];

    const payloadChunks = chunkArray(payload, 15);

    return (
      <div className="bg-third p-3 border border-white rounded-lg min-w-[10em] grow">
        {label && (
          <p className="text-lg mb-2 font-mono">
            {labelCustomization ? labelCustomization(label) : label}
          </p>
        )}

        <div className="flex h-auto gap-4">
          {/* Have multiple tables */}
          {payloadChunks.map((payload, i) => (
            <table className="w-full table-auto h-10" key={`table-cohort-${i}`}>
              <thead>
                <tr>
                  <th className="text-xs font-boldy">Name</th>

                  <th className="text-xs font-boldy">
                    {
                      {
                        users: 'Users',
                        volumes: 'Volume',
                        trades: 'Trades',
                      }[type]
                    }
                  </th>

                  {type === 'users' ? (
                    <th className="text-xs font-boldy">
                      {
                        {
                          users: 'Retention',
                          volumes: 'Change',
                          trades: 'Change',
                        }[type]
                      }
                    </th>
                  ) : null}
                </tr>
              </thead>

              <tbody>
                {i === 0 ? (
                  <tr>
                    <td className="text-center">
                      <span style={{ color: totalColor }} className="text-sm">
                        Total
                      </span>
                    </td>

                    <td
                      className="text-center text-sm font-mono"
                      style={{ color: totalColor }}
                    >
                      {type === 'volumes' ? (
                        <FormatNumber
                          nb={total}
                          format="currency"
                          prefix="$"
                          precision={0}
                          isDecimalDimmed={false}
                          className="border-0 text-sm font-mono"
                          isAbbreviate={true}
                          isAbbreviateIcon={false}
                        />
                      ) : (
                        formatNumber(Number(total), precision)
                      )}
                    </td>

                    {type === 'users' ? (
                      <td className="text-center text-txtfade text-sm">-</td>
                    ) : null}
                  </tr>
                ) : null}

                {(i === 0 ? payload.slice(1) : payload).map((item) => {
                  const originalData = data.find(
                    (x) => x && item.dataKey && !!x[item.dataKey],
                  );

                  const originalNumber =
                    originalData && item.dataKey
                      ? Number(originalData[item.dataKey])
                      : 0;
                  const originalPercentage =
                    (Number(item.value) * 100) / originalNumber;

                  return (
                    <tr key={item.dataKey}>
                      <td className="text-center text-nowrap">
                        <span style={{ color: item.color }} className="text-sm">
                          {'Cohort ' + originalData?.['time']}
                        </span>
                      </td>

                      <td className="text-center">
                        <span style={{ color: item.color }}>
                          {type === 'volumes' ? (
                            <FormatNumber
                              nb={Number(item.value)}
                              prefix="$"
                              format="currency"
                              precision={0}
                              isDecimalDimmed={false}
                              className="border-0 text-sm font-mono"
                              isAbbreviate={true}
                              isAbbreviateIcon={false}
                            />
                          ) : (
                            <span className="text-sm font-mono">
                              {formatNumber(Number(item.value), precision)}
                            </span>
                          )}
                        </span>
                      </td>

                      {type === 'users' ? (
                        <td className="text-center text-sm font-mono text-txtfade">
                          {formatPercentage(originalPercentage, precision)}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export default function LineRechartCohorts({
  data,
  labels,
  type,
  hideLegend = false,
}: {
  data: RechartsData[];
  labels: {
    name: string;
    color?: string;
  }[];
  type: 'users' | 'volumes' | 'trades';
  hideLegend: boolean;
}) {
  const [hiddenLabels, setHiddenLabels] = React.useState<
    DataKey<string | number>[]
  >([]);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const formatYAxis = (tickItem: number) => {
    return formatNumberShort(tickItem, 0);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

        <XAxis dataKey="time" fontSize="12" />

        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={formatYAxis}
          fontSize="11"
          scale={'log'}
        />

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

        {!isMobile && !hideLegend && (
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
            formatter={(value) => {
              const originalData = data.find((x) => x && value && !!x[value]);

              return originalData?.['time'] ?? value;
            }}
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
      </LineChart>
    </ResponsiveContainer>
  );
}
