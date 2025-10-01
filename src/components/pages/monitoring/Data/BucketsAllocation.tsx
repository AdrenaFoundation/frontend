import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import { Cortex } from '@/types';
import {
  nativeToUi,
} from '@/utils';

export default function BucketsAllocation({
  cortex,
  titleClassName,
}: {
  cortex: Cortex;
  titleClassName?: string;
}) {
  const bucketNames = ['coreContributor', 'foundation', 'ecosystem'] as const;
  const bucketsLabels = ['Core Contrib.', 'Foundation', 'Ecosystem'];
  const bucketColors = ['#9F8CAE', '#EB6672', '#7FD7C1'];

  return (
    <div className="bg-[#050D14] border rounded-md lg:flex-1 shadow-xl h-[400px]">
      <div className="w-full border-b p-3 mb-6">
        <p className={titleClassName}>ADX Buckets Allocation</p>
      </div>

      <ResponsiveContainer width="80%" height="80%" className="m-auto">
        <PieChart>
          <Tooltip
            content={
              <CustomRechartsToolTip
                isValueOnly={true}
                format="number"
                suffix=" ADX"
              />
            }
            cursor={false}
          />
          <Pie
            dataKey="value"
            nameKey="name"
            data={bucketNames.map((name, i) => ({
              name: bucketsLabels[i],
              value: nativeToUi(
                cortex[`${name}BucketAllocation`],
                window.adrena.client.adxToken.decimals,
              ),
            }))}
            fill="#8884d8"
            cx="50%"
            cy="50%"
            innerRadius={30}
            labelLine={false}
          >
            {bucketColors.map((color, index) => (
              <Cell key={index} fill={color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="top"
            align="center"
            iconType="circle"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
