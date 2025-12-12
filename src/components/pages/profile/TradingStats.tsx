import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import LoaderWrapper from '@/components/Loader/LoaderWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
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
  const { t } = useTranslation();
  const isMobile = useBetterMediaQuery('(max-width: 768px)');

  const settings = useSelector((state) => state.settings);

  const [showAfterFees] = useState(settings.showFeesInPnl);
  const [isPnlWithFees, setIsPnlWithFees] = useState(showAfterFees);

  const totalProfitLoss = useMemo(() => {
    return (
      (traderInfo?.totalPnl ?? 0) +
      (isPnlWithFees ? 0 : (traderInfo?.totalFees ?? 0))
    );
  }, [isPnlWithFees, traderInfo?.totalFees, traderInfo?.totalPnl]);

  const STATS = [
    {
      title: t('profile.totalPnL'),
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
      onClick: () => setIsPnlWithFees(!isPnlWithFees),
    },
    {
      title: t('profile.totalVolume'),
      nb: traderInfo?.totalVolume ?? 0,
      format: 'currency',
      precision: 0,
      data: data?.map((d) => ({
        value: d.stats?.volume ?? 0,
      })),
    },
    {
      title: t('profile.totalFees'),
      nb: traderInfo?.totalFees ?? 0,
      format: 'currency',
      precision: 0,
      data: data?.map((d) => ({
        value: d.stats?.totalFees ?? 0,
      })),
    },
    {
      title: t('profile.positions'),
      nb: traderInfo?.totalNumberPositions ?? 0,
      suffix: `/${livePositionsNb}`,
      suffixClassName: 'text-sm font-semibold opacity-50',
      icon: <LiveIcon />,
      precision: 0,
      format: 'number',
      data: data?.map((d) => ({
        value: d.stats?.totalPositions ?? 0,
      })),
    },
    {
      title: t('profile.bestTrade'),
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
      title: t('profile.worstTrade'),
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
      title: t('profile.winRate'),
      nb: traderInfo?.winRatePercentage ?? 0,
      format: 'percentage',
      precision: 2,
    },
    {
      title: t('profile.avgTimeOpened'),
      nb: formatSecondsToTimeDifference(traderInfo?.avgHoldingTime ?? 0),
      precision: 0,
      format: 'time',
    },
  ];

  return (
    <div className={className}>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 items-center justify-between gap-2 p-3">
        <AnimatePresence>
          {STATS.map((stat) =>
            stat.nb ? (
              <li
                key={stat.title}
                className={twMerge("flex flex-row items-center justify-between border border-bcolor bg-third flex-1 p-2 px-3 rounded-md",
                  stat?.onClick && "cursor-pointer"
                )}
                onClick={stat?.onClick}
              >
                <div>
                  <div className='flex flex-row items-center gap-1'>
                    <p className="text-sm font-semibold opacity-50">
                      {stat.title}
                    </p>{' '}
                    {stat.title == t('profile.totalPnL') ? (
                      <p className='text-xxs opacity-50'>{isPnlWithFees ? t('profile.withFees') : t('profile.withoutFees')}</p>
                    ) : null}
                  </div>
                  <LoaderWrapper height="1.6875rem" isLoading={!traderInfo}>
                    {typeof stat.nb === 'number' ? (
                      <FormatNumber
                        nb={stat.nb}
                        format={
                          stat.format as
                          | 'currency'
                          | 'percentage'
                          | 'number'
                          | 'time'
                        }
                        precision={stat.precision ?? 2}
                        className={twMerge('text-xl', stat.className)}
                        isDecimalDimmed={false}
                        isAbbreviate={isMobile ? stat.nb > 100_000_000 : false}
                      />
                    ) : (
                      <p className="text-xl font-mono">{stat.nb}</p>
                    )}
                  </LoaderWrapper>
                </div>
              </li>
            ) : null,
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}
