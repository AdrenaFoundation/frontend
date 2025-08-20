import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { twMerge } from 'tailwind-merge';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import FormatNumber from '@/components/Number/FormatNumber';
import { ADRENA_GREEN, ADRENA_RED } from '@/constant';
import { useSelector } from '@/store/store';
import { EnrichedTraderInfo } from '@/types';
import { formatSecondsToTimeDifference } from '@/utils';

export default function TradingStats({
  traderInfo,
  className,
  livePositionsNb,
  data,
}: {
  traderInfo: EnrichedTraderInfo | null;
  className?: string;
  livePositionsNb: number | null;
  data?:
    | {
        date: Date;
        stats: {
          totalPositions: number;
          winrate: number;
          color: string;
          size: number;
          pnl: number;
          volume: number;
          increaseSize: number;
          totalFees: number;
          bubbleSize: number;
        } | null;
      }[]
    | null;
}) {
  const settings = useSelector((state) => state.settings);

  const [showAfterFees] = useState(settings.showFeesInPnl);

  const totalProfitLoss = useMemo(() => {
    return (
      (traderInfo?.totalPnl ?? 0) +
      (showAfterFees ? 0 : (traderInfo?.totalFees ?? 0))
    );
  }, [showAfterFees, traderInfo?.totalFees, traderInfo?.totalPnl]);

  const STATS = [
    {
      title: 'Total PnL',
      nb: totalProfitLoss,
      format: 'currency',
      precision: 2,
      className: twMerge(
        totalProfitLoss > 0 ? 'text-green' : '',
        totalProfitLoss < 0 ? 'text-redbright' : '',
      ),
      data: data?.map((d) => ({
        value: d.stats?.pnl ?? 0,
      })),
    },
    {
      title: 'Total Volume',
      nb: traderInfo?.totalVolume ?? 0,
      format: 'currency',
      precision: 0,
      data: data?.map((d) => ({
        value: d.stats?.volume ?? 0,
      })),
    },
    {
      title: 'Total Fees',
      nb: traderInfo?.totalFees ?? 0,
      format: 'currency',
      precision: 0,
      data: data?.map((d) => ({
        value: d.stats?.totalFees ?? 0,
      })),
    },
    {
      title: 'Positions',
      nb: traderInfo?.totalNumberPositions ?? 0,
      suffix: `/${livePositionsNb}`,
      suffixClassName: 'text-sm font-boldy opacity-50',
      icon: <LiveIcon />,
      precision: 0,
      format: 'number',
      data: data?.map((d) => ({
        value: d.stats?.totalPositions ?? 0,
      })),
    },
    {
      title: 'Best Trade',
      nb: traderInfo?.largestWinningTrade
        ? traderInfo.largestWinningTrade > 0
          ? traderInfo.largestWinningTrade
          : null
        : null,
      format: 'currency',
      precision: 2,
      className: 'text-green',
    },
    {
      title: 'Worst Trade',
      nb: traderInfo?.largestLosingTrade
        ? traderInfo.largestLosingTrade < 0
          ? traderInfo.largestLosingTrade
          : null
        : null,
      format: 'currency',
      precision: 2,
      className: 'text-redbright',
    },
    {
      title: 'Win Rate',
      nb: traderInfo?.winRatePercentage ?? 0,
      format: 'percentage',
      precision: 2,
    },
    {
      title: 'Avg. Time Opened',
      nb: formatSecondsToTimeDifference(traderInfo?.avgHoldingTime ?? 0),
      precision: 0,
      format: 'time',
    },
  ];

  return (
    <div className={className}>
      <ul className="grid grid-cols-4 items-center justify-between gap-2 p-3">
        {STATS.map((stat) => (
          <li
            key={stat.title}
            className="flex flex-row items-center justify-between border border-bcolor bg-third flex-1 p-2 px-3 rounded-lg"
          >
            <div>
              <p className="text-sm font-boldy opacity-50">{stat.title}</p>{' '}
              {typeof stat.nb === 'number' ? (
                <FormatNumber
                  nb={stat.nb}
                  format={
                    stat.format as 'currency' | 'percentage' | 'number' | 'time'
                  }
                  precision={stat.precision ?? 2}
                  className={twMerge('text-xl', stat?.className)}
                  isDecimalDimmed={false}
                />
              ) : (
                <p className="text-xl font-mono">{stat.nb}</p>
              )}
            </div>
            <ResponsiveContainer width={80} height={30}>
              <LineChart data={stat.data ?? []}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={
                    stat.className?.includes('text-green')
                      ? ADRENA_GREEN
                      : stat.className?.includes('text-redbright')
                        ? ADRENA_RED
                        : '#ffffff'
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </li>
        ))}
      </ul>
    </div>
  );
}
