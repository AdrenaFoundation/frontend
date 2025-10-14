import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import useADXCirculatingSupply from '@/hooks/useADXCirculatingSupply';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import { useSelector } from '@/store/store';
import { formatPercentage } from '@/utils';

const adxColor = '#f96a6a';

export default function StakingChart() {
  const { allStakingStats } = useAllStakingStats();
  const adxTotalSupply = useADXTotalSupply();
  const adxCirculatingSupply = useADXCirculatingSupply({
    totalSupplyADX: adxTotalSupply,
  });

  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

  const [chartData, setChartData] = useState<{
    name: string;
    ADX: number;
    ADXAmount: number;
  }[] | null>(null);

  useEffect(() => {
    if (!allStakingStats || !adxCirculatingSupply) {
      setChartData(null);
      return;
    }

    const data: {
      name: string;
      ADX: number;
      ADXAmount: number;
    }[] = [
        {
          name: 'liquid',
          ADX: (adxCirculatingSupply - allStakingStats.byDurationByAmount.ADX.liquid - allStakingStats.byDurationByAmount.ADX.totalLocked) * 100 / adxCirculatingSupply,
          ADXAmount: adxCirculatingSupply - allStakingStats.byDurationByAmount.ADX.liquid - allStakingStats.byDurationByAmount.ADX.totalLocked,
        },
        {
          name: '0d',
          ADX: allStakingStats.byDurationByAmount.ADX.liquid * 100 / adxCirculatingSupply,
          ADXAmount: allStakingStats.byDurationByAmount.ADX.liquid,
        },
      ];

    Object.entries(allStakingStats.byDurationByAmount.ADX.locked).forEach(([lockedDuration, lockedAmount]) => {
      data.push({
        name: lockedDuration + 'd',
        ADX: lockedAmount.total * 100 / adxCirculatingSupply,
        ADXAmount: lockedAmount.total,
      });
    });

    setChartData(data);
  }, [adxCirculatingSupply, allStakingStats]);

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
      <ResponsiveContainer width="100%" height="100%" style={{ marginLeft: '-1rem' }}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="10 10" strokeOpacity={0.1} />

          <XAxis dataKey="name" fontSize="11" />
          <YAxis tickFormatter={formatYAxis} fontSize="10" />

          <Tooltip
            content={({
              payload,
            }: TooltipProps<ValueType, NameType>) => (
              <div className="bg-third p-3 border border-white rounded-md justify-center">
                <div className='flex w-full justify-center items-center'>
                  {payload && payload.map((item) => (
                    <div
                      key={item.dataKey}
                      className="text-sm flex-col font-mono flex justify-center items-center"
                    >
                      <div className='flex flex-col justify-center items-center'>
                        <div
                          className={twMerge('font-mono flex gap-1')}
                        >
                          {formatPercentage(Number(item.value), 2)}

                          <div className='font-semibold'>of circulating supply</div>
                        </div>

                        <div
                          className='font-mono'
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

                          <span className='ml-1 font-semibold'>ADX</span>
                        </div>

                        {tokenPriceADX ? <>
                          <div
                            className={twMerge('font-mono')}
                            style={{ color: item.color }}
                          >
                            <FormatNumber
                              nb={Number(item.payload?.[`${item.dataKey}Amount`] ?? 0) * tokenPriceADX}
                              precision={0}
                              isDecimalDimmed={false}
                              className={twMerge("text-sm", `text-[${item.color}]`)}
                              format={"currency"}
                              prefix='$'
                              isAbbreviate={true}
                              isAbbreviateIcon={false}
                            />
                          </div>
                        </> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>)
            }
            cursor={false}
          />

          <Bar
            type="monotone"
            dataKey='ADX'
            stroke={adxColor}
            fill={adxColor}
            key="ADX"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
