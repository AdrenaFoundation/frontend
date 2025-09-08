import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { Cortex } from '@/types';
import { nativeToUi } from '@/utils';

export default function BucketsMintedAmount({
  cortex,
  titleClassName,
}: {
  cortex: Cortex;
  titleClassName?: string;
}) {
  const bucketNames = ['coreContributor', 'foundation', 'ecosystem'] as const;
  const bucketsLabels = ['Core Contrib.', 'Foundation', 'Ecosystem'];
  const colors = ['#9F8CAE', '#EB6672', '#7FD7C1'];
  const isBreakpoint = useBetterMediaQuery('(max-width: 500px)');

  return (
    <div className="bg-[#050D14] border rounded-lg lg:flex-1 shadow-xl h-[400px]">
      <div className="w-full border-b p-3 mb-6">
        <p className={titleClassName}>ADX Buckets Minted Amount</p>
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
                cortex[`${name}BucketMintedAmount`],
                window.adrena.client.adxToken.decimals,
              ),
            }))}
            fill="#8884d8"
            cx="50%"
            cy="50%"
            innerRadius={30}
            labelLine={false}
          >
            {colors.map((color, index) => (
              <Cell key={index} fill={color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="top"
            align="center"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{
              fontSize: isBreakpoint ? '8px' : '12px',
              margin: 'auto',
              color: '#ffffff',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
