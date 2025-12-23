import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import { CustodyExtended } from '@/types';

type PositionStat = {
  side: string;
  countPositions: number;
  totalPnl: number;
  minPnl: number;
  maxPnl: number;
  totalVolume: number;
  minVolume: number;
  maxVolume: number;
  averageVolume: number;
};

interface PositionStatsCardProps {
  symbol: string;
  stats: PositionStat[];
  custodies?: CustodyExtended[] | null;
  className?: string;
  isLoading?: boolean;
}

export default function PositionStatsCard({
  symbol,
  stats,
  custodies,
  className,
  isLoading = false,
}: PositionStatsCardProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div
        className={twMerge(
          'p-4 border rounded-md bg-[#050D14] flex-1 h-full flex items-center justify-center',
          className,
        )}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'p-4 border rounded-md bg-[#050D14] flex-1',
        className,
      )}
    >
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <Image
          src={
            custodies?.find(
              (c) =>
                c.tokenInfo.symbol.toLocaleLowerCase() === symbol.toLowerCase(),
            )?.tokenInfo.image || ''
          }
          alt="token icon"
          width={20}
          height={20}
          className="min-w-[20px]"
        />
        {symbol}
      </h3>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.side} className="flex flex-col gap-3">
            <h4
              className={`text-sm ${stat.side === 'long' ? 'text-green' : 'text-redbright'}`}
            >
              {stat.side.toUpperCase()}
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-txtfade">{t('monitoring.positions')}:</span>
                <FormatNumber
                  nb={stat.countPositions}
                  precision={0}
                  minimumFractionDigits={0}
                  className="font-regular"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txtfade">{t('monitoring.totalPnl')}:</span>
                <FormatNumber
                  nb={stat.totalPnl}
                  precision={0}
                  minimumFractionDigits={0}
                  format="currency"
                  className={twMerge(
                    'font-regular',
                    stat.totalPnl < 0 ? 'text-redbright' : 'text-green',
                  )}
                  isDecimalDimmed={false}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txtfade">{t('monitoring.volume')}:</span>
                <div className="text-right">
                  <FormatNumber
                    nb={stat.totalVolume}
                    precision={0}
                    minimumFractionDigits={0}
                    format="currency"
                    className="font-regular"
                  />
                  <span className="text-txtfade ml-1">
                    ({t('monitoring.avg')}{' '}
                    <FormatNumber
                      nb={stat.averageVolume}
                      precision={0}
                      minimumFractionDigits={0}
                      format="currency"
                    />
                    )
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txtfade">{t('monitoring.worstBestPnl')}:</span>
                <div className="text-right">
                  <FormatNumber
                    nb={stat.minPnl}
                    precision={0}
                    minimumFractionDigits={0}
                    format="currency"
                    className={twMerge(
                      'mr-1',
                      stat.minPnl < 0 ? 'text-redbright' : 'text-green',
                    )}
                  />
                  /
                  <FormatNumber
                    nb={stat.maxPnl}
                    precision={0}
                    minimumFractionDigits={0}
                    format="currency"
                    className={twMerge(
                      'ml-1',
                      stat.maxPnl < 0 ? 'text-redbright' : 'text-green',
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txtfade">{t('monitoring.smallestLargestVolume')}:</span>
                <div className="text-right">
                  <FormatNumber
                    nb={stat.minVolume}
                    precision={0}
                    minimumFractionDigits={0}
                    format="currency"
                    className="text-txtfade"
                  />{' '}
                  /{' '}
                  <FormatNumber
                    nb={stat.maxVolume}
                    precision={0}
                    minimumFractionDigits={0}
                    format="currency"
                    className="font-regular"
                  />
                </div>
              </div>
            </div>
            {stats.length > 1 && (
              <div className="h-[1px] bg-secondary/20 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
