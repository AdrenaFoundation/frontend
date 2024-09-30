import Tippy from '@tippyjs/react';
import React, { useEffect } from 'react';
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
import { CategoricalChartState } from 'recharts/types/chart/types';

import { formatPercentage } from '@/utils';

export default function LineRechartPercentage({
  title,
  data,
  labels,
  position,
  isActive,
  setIsActive,
  handleMouseMove,
  activeIndex,
}: {
  title: string;
  data: any;
  labels: {
    name: string;
    color?: string;
  }[];
  position: { x: number; y: number };
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  handleMouseMove: (e: CategoricalChartState) => void;
  activeIndex: number;
}) {
  // useEffect(() => {
  //   console.log('positions', position);
  // }, [position.x, position.y]);
  const formatYAxis = (tickItem: any) => {
    return `${tickItem}%`;
  };

  function CustomToolTip(props: any) {
    const { active, payload, label } = props;

    if (active && payload && payload.length) {
      return (
        <div className="bg-third p-3 border border-white rounded-lg">
          <p className="text-lg mb-2 font-mono">{label}</p>
          {payload.map((item: any) => (
            <p
              key={item.dataKey}
              className="text-sm font-mono"
              style={{ color: item.fill }}
            >
              {item.dataKey}: {formatPercentage(item.value)}
            </p>
          ))}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <h2 className="">{title}</h2>

        <div className="flex gap-2 text-sm">
          <div className="cursor-pointer">1d</div>
          <Tippy
            content={
              <div className="text-sm w-20 flex flex-col justify-around">
                Coming soon
              </div>
            }
            placement="auto"
          >
            <div className="flex gap-2">
              <div className="text-txtfade cursor-not-allowed">7d</div>
              <div className="text-txtfade cursor-not-allowed">1M</div>
              <div className="text-txtfade cursor-not-allowed">1Y</div>
            </div>
          </Tippy>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setIsActive(false);
          }}
        >
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="time" fontSize="12" />

          <YAxis domain={[0, 100]} tickFormatter={formatYAxis} fontSize="13" />

          <Tooltip
            position={position}
            active={isActive}
            defaultIndex={activeIndex}
            content={<CustomToolTip />}
          />

          <Legend />

          {labels?.map(({ name, color }) => {
            return (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                fill={color}
                stroke={color}
                dot={false}
                activeDot={isActive}
              />
            );
          })}

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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
