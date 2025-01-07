import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';

export default function Tokenomics({
  className,
}: {
  className?: string;
}) {
  const data = [
    {
      label: 'Core Contributors',
      buckedNames: ['Launch Team', 'Investors'],
      data: [21.333333333, 14.666666667],
      color: '#9F8CAE',
    },
    {
      label: 'Foundation',
      buckedNames: ['Foundation Development', 'CEX/DEX Liquidity'],
      data: [5, 4],
      color: '#EB6672',
    },
    {
      label: 'Ecosystem',
      buckedNames: [
        'DAO Treasury Reserves',
        'Community Grants',
        'Partnerships/Marketing',
        'Genesis Liquidity Program',
        'Liquidity Mining - ALP Staking',
        'Liquidity Mining - ADX Staking',
      ],
      data: [7, 8, 10, 5, 15, 10],
      color: '#7FD7C1',
    },
  ] as const;

  const formattedData = data
    .map((d) =>
      d.buckedNames
        .map((name, i) => ({
          name,
          label: d.label,
          value: d.data[i],
          color: d.color,
        }))
        .flat(),
    )
    .flat();

  const bucketsLabels = ['Core Contrib.', 'Foundation', 'Ecosystem'];
  const bucketColors = ['#9F8CAE', '#EB6672', '#7FD7C1'];

  return (
    <div className={twMerge("flex flex-col h-full w-full max-h-[15em]", className)}>
      <ResponsiveContainer width="100%" height="100%" className="m-auto">
        <PieChart
          width={400}
          height={400}
        >
          <Tooltip
            content={<CustomRechartsToolTip format="percentage" isPieChart />}
            cursor={false}
          />

          <Pie
            dataKey="value"
            nameKey="label"
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            labelLine={false}
          >
            {formattedData.map(({ color }, index) => (
              <Cell key={index} fill={color} />
            ))}
          </Pie>

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={10}
            payload={bucketsLabels.map((name, i) => ({
              value: name,
              type: 'circle',
              color: bucketColors[i],
            }))}
          />
        </PieChart>
      </ResponsiveContainer>
    </div >
  );
}
