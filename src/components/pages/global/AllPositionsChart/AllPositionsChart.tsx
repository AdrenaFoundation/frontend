import React, { PureComponent, useEffect, useMemo, useRef, useState } from 'react';

import Loader from '@/components/Loader/Loader';
import { PositionExtended } from '@/types';
import { ResponsiveContainer, Treemap } from 'recharts';


interface CustomizedContentProps {
  root: any;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: any;
  color: string;
  rank: number;
  name: string;
}

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, color, name, value } = props;

  return (
    <g key={`${name}-${color}-${value}`}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill:
            depth < 3
              ? color
              : "none",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10)
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 ? (
        <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
          {index + 1}
        </text>
      ) : null}
    </g>
  );
};

const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'] as const;

export default function AllPositionsChart({
  allPositions,
}: {
  allPositions: PositionExtended[] | null;
}) {
  if (allPositions === null) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  const data = useMemo(() => window.adrena.client.tokens.map((token) => {
    const positions = allPositions.filter((position) => position.token === token);

    return {
      key: token.symbol,
      name: token.symbol,
      children: positions.map((position) => ({
        key: position.owner.toBase58() + token.symbol,
        color: token.color,
        name: position.pnl?.toFixed(2) ?? 0,
        size: Math.floor(position.size),
      })),
    };
  }).filter((key) => key.children.length > 0), [allPositions]);

  console.log(data)

  // const data = [
  //   {
  //     name: 'axis',
  //     children: [
  //       { name: 'Axes', size: 1302 },
  //       { name: 'Axis', size: 24593 },
  //       { name: 'AxisGridLine', size: 652 },
  //       { name: 'AxisLabel', size: 636 },
  //       { name: 'CartesianAxes', size: 6703 },
  //     ],
  //   },
  //   {
  //     name: 'controls',
  //     children: [
  //       { name: 'AnchorControl', size: 2138 },
  //       { name: 'ClickControl', size: 3824 },
  //       { name: 'Control', size: 1353 },
  //       { name: 'ControlList', size: 4665 },
  //       { name: 'DragControl', size: 2649 },
  //       { name: 'ExpandControl', size: 2832 },
  //       { name: 'HoverControl', size: 4896 },
  //       { name: 'IControl', size: 763 },
  //       { name: 'PanZoomControl', size: 5222 },
  //       { name: 'SelectionControl', size: 7862 },
  //       { name: 'TooltipControl', size: 8435 },
  //     ],
  //   },
  //   {
  //     name: 'data',
  //     children: [
  //       { name: 'Data', size: 20544 },
  //       { name: 'DataList', size: 19788 },
  //       { name: 'DataSprite', size: 10349 },
  //       { name: 'EdgeSprite', size: 3301 },
  //       { name: 'NodeSprite', size: 19382 },
  //       {
  //         name: 'render',
  //         children: [
  //           { name: 'ArrowType', size: 698 },
  //           { name: 'EdgeRenderer', size: 5569 },
  //           { name: 'IRenderer', size: 353 },
  //           { name: 'ShapeRenderer', size: 2247 },
  //         ],
  //       },
  //       { name: 'ScaleBinding', size: 11275 },
  //       { name: 'Tree', size: 7147 },
  //       { name: 'TreeBuilder', size: 9930 },
  //     ],
  //   },
  //   {
  //     name: 'events',
  //     children: [
  //       { name: 'DataEvent', size: 7313 },
  //       { name: 'SelectionEvent', size: 6880 },
  //       { name: 'TooltipEvent', size: 3701 },
  //       { name: 'VisualizationEvent', size: 2117 },
  //     ],
  //   },
  //   {
  //     name: 'legend',
  //     children: [
  //       { name: 'Legend', size: 20859 },
  //       { name: 'LegendItem', size: 4614 },
  //       { name: 'LegendRange', size: 10530 },
  //     ],
  //   },
  // ];

  if (!data || !data.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap width={400} height={400} data={data} dataKey="size" content={<CustomizedContent colors={COLORS} />} />
    </ResponsiveContainer>
  );
}
