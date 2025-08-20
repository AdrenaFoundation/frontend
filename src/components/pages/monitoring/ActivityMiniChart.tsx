import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import { ADRENA_GREEN, ADRENA_RED } from '@/constant';

import { ActivityDataType } from './ActivityCalendar';

export default function ActivityMiniChart({
  data,
  bubbleBy,
}: {
  data: ActivityDataType[] | null;
  bubbleBy: 'pnl' | 'volume' | 'position count';
}) {
  if (!data) {
    return <div className="p-3">No data available</div>;
  }
  // remove all data with no stats
  const filteredData = data.filter((item) => item.stats);

  // Add colors based on PnL values
  const dataWithColors = filteredData.map((item) => {
    let color = '#8884d8'; // default color

    if (item.stats?.pnl !== undefined) {
      color = item.stats.pnl >= 0 ? ADRENA_GREEN : ADRENA_RED; // green for positive, red for negative
    }

    return {
      ...item,
      color,
    };
  });

  return (
    <div className="p-1 border-t border-bcolor">
      <div className="opacity-30 hover:opacity-100 transition-opacity duration-300 h-[4.625rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataWithColors}
            margin={{ top: 0, right: 20, left: -10, bottom: 0 }}
          >
            <Bar
              dataKey={`stats.${bubbleBy === 'position count' ? 'totalPositions' : bubbleBy}`}
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Tooltip
              content={
                <CustomRechartsToolTip
                  format={bubbleBy === 'position count' ? 'number' : 'currency'}
                  precision={2}
                  labelCustomization={() => {
                    return bubbleBy;
                  }}
                  isValueOnly
                />
              }
              cursor={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
