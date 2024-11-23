import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { DataKey } from 'recharts/types/util/types';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import { formatPercentage } from '@/utils';

const adxColor = '#f96a6a';
const alpColor = '#2a85df';

export default function StakingChart() {
  const { allStakingStats } = useAllStakingStats();
  const adxTotalSupply = useADXTotalSupply();
  const alpTotalSupply = useALPTotalSupply();

  const [chartData, setChartData] = useState<{
    name: string;
    ADX: number;
    ALP: number;
    ADXAmount: number;
    ALPAmount: number;
  }[] | null>(null);

  const [hiddenLabels, setHiddenLabels] = React.useState<
    DataKey<string | number>[]
  >([]);

  useEffect(() => {
    if (!allStakingStats || !adxTotalSupply || !alpTotalSupply) {
      setChartData(null);
      return;
    }

    const data: {
      name: string;
      ADX: number;
      ALP: number;
      ADXAmount: number;
      ALPAmount: number;
    }[] = [
        {
          name: 'liquid',
          ADX: (adxTotalSupply - allStakingStats.ADX.liquid - allStakingStats.ADX.totalLocked) * 100 / adxTotalSupply,
          ADXAmount: adxTotalSupply - allStakingStats.ADX.liquid - allStakingStats.ADX.totalLocked,
          ALP: (alpTotalSupply - allStakingStats.ALP.totalLocked) * 100 / alpTotalSupply,
          ALPAmount: alpTotalSupply - allStakingStats.ALP.totalLocked,
        },
        {
          name: '0d',
          ADX: allStakingStats.ADX.liquid * 100 / adxTotalSupply,
          ADXAmount: allStakingStats.ADX.liquid,
          ALP: 0,
          ALPAmount: 0
        },
      ];

    Object.entries(allStakingStats.ADX.locked).forEach(([lockedDuration, lockedAmount]) => {
      data.push({
        name: lockedDuration + 'd',
        ADX: lockedAmount.total * 100 / adxTotalSupply,
        ADXAmount: lockedAmount.total,
        ALP: 0,
        ALPAmount: 0
      });
    });

    Object.entries(allStakingStats.ALP.locked).forEach(([lockedDuration, lockedAmount]) => {
      const existingData = data.find((d) => d.name === lockedDuration + 'd',);

      if (existingData) {
        existingData.ALP = lockedAmount.total * 100 / alpTotalSupply;
        existingData.ALPAmount = lockedAmount.total;
      } else {
        data.push({
          name: lockedDuration + 'd',
          ADX: 0,
          ALP: lockedAmount.total * 100 / alpTotalSupply,
          ADXAmount: 0,
          ALPAmount: lockedAmount.total,
        });
      }
    });

    setChartData(data);
  }, [adxTotalSupply, allStakingStats, alpTotalSupply]);

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  const formatYAxis = (tickItem: number) => {
    return formatPercentage(tickItem, 0);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <h2 className="">ADX/ALP STAKING</h2>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="name" fontSize="11" />
          <YAxis tickFormatter={formatYAxis} fontSize="10" />

          <Tooltip
            content={({
              payload,
              label,
            }: TooltipProps<ValueType, NameType>) => (
              <div className="bg-third p-3 border border-white rounded-lg min-w-[12em]">
                {label && <p className="text-lg mb-2 font-mono">{label}</p>}

                {payload && payload.map((item) => (
                  <div
                    key={item.dataKey}
                    className="text-sm font-mono flex justify-between items-center"
                  >
                    <div className='flex'>
                      <span className='text-lg font-boldy' style={{ color: item.color }}>{item.dataKey}</span>
                    </div>

                    <div className='flex gap-2'>
                      <span
                        className={twMerge('font-mono')}
                      >
                        {formatPercentage(Number(item.value), 2)}
                      </span>

                      <span>{'/'}</span>

                      <span
                        className={twMerge('font-mono')}
                        style={{ color: item.color }}
                      >
                        <FormatNumber
                          nb={Number(item.payload?.[`${item.dataKey}Amount`] ?? 0)}
                          precision={0}
                          isDecimalDimmed={false}
                          className={twMerge("text-sm", `text-[${item.color}]`)}
                          format={"number"}
                          isAbbreviate={true}
                          isAbbreviateIcon={false}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </div>)
            }
            cursor={false}
          />

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

          <Bar
            type="monotone"
            dataKey={hiddenLabels.includes("ADX") ? 'ADX' + ' ' : 'ADX'} // Add space to remove the line but keep the legend
            stroke={hiddenLabels.includes("ADX") ? `${adxColor}80` : adxColor} // 50% opacity for hidden labels
            fill={adxColor}
            key={"ADX"}
          />

          <Bar
            type="monotone"
            dataKey={hiddenLabels.includes("ALP") ? 'ALP' + ' ' : 'ALP'} // Add space to remove the line but keep the legend
            stroke={hiddenLabels.includes("ALP") ? `${alpColor}80` : alpColor} // 50% opacity for hidden labels
            fill={alpColor}
            key={"ALP"}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
