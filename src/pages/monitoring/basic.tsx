import React, { useEffect, useState } from 'react';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Switch from '@/components/common/Switch/Switch';
import AumChart from '@/components/pages/global/Aum/AumChart';
import BorrowRateChart from '@/components/pages/global/BorrowRate/BorrowRateChart';
import CompositionChart from '@/components/pages/global/Composition/CompositionChart';
import DefilamaProtocolFeesChart from '@/components/pages/global/DefilamaProtocolFeesChart/DefilamaProtocolFeesChart';
import FeesBarChart from '@/components/pages/global/Fees/FeesBarChart';
import LpIntegrationChart from '@/components/pages/global/LpIntegration/LpIntegrationChart';
import OpenInterestChart from '@/components/pages/global/OpenInterest/OpenInterestChart';
import { RealizedPnlChart } from '@/components/pages/global/RealizedPnl/RealizedPnlChart';
import { UnrealizedPnlChart } from '@/components/pages/global/UnrealizedPnl/UnrealizedPnlChart';
import UsersCohortsChart from '@/components/pages/global/UsersCohorts/UsersCohortsChart';
import UtilizationChart from '@/components/pages/global/UtilizationChart/UtilizationChart';
import VolumeBarChart from '@/components/pages/global/Volume/VolumeBarChart';
import VelocityIndicator from '@/components/pages/monitoring/VelocityIndicator';
import DataApiClient from '@/DataApiClient';
import { PoolInfo } from '@/hooks/usePoolInfo';
import useVelocityIndicators from '@/hooks/useVelocityIndicators';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

export default function BasicMonitoring({
  mainPool,
  isSmallScreen,
  view,
}: PageProps & {
  poolInfo: PoolInfo | null;
  isSmallScreen: boolean;
  view: string;
}) {
  const [allTimeTraders, setAllTimeTraders] = React.useState<number | null>(
    null,
  );
  const [aprs, setAprs] = React.useState<{ lp: number; lm: number } | null>(
    null,
  );
  const [timePeriod, setTimePeriod] = useState<'24h' | '7d'>('24h');

  const { velocityData, isLoading: isVelocityLoading } =
    useVelocityIndicators();

  const useSqrtScaleForVolumeAndFeeChart = useSelector(
    (state) => state.settings.useSqrtScaleForVolumeAndFeeChart,
  );

  useEffect(() => {
    if (view !== 'lite') return;

    DataApiClient.getRolling7DGlobalApr()
      .then(({ lp_apr_rolling_seven_day, lm_apr_rolling_seven_day }) => {
        setAprs({
          lp: lp_apr_rolling_seven_day,
          lm: lm_apr_rolling_seven_day,
        });
      })
      .catch(() => {
      });

    DataApiClient.getAllTimeTradersCount()
      .then((count) => {
        setAllTimeTraders(count);
      })
      .catch(() => {
      });

    const interval = setInterval(() => {
      DataApiClient.getRolling7DGlobalApr()
        .then(({ lp_apr_rolling_seven_day, lm_apr_rolling_seven_day }) => {
          setAprs({
            lp: lp_apr_rolling_seven_day,
            lm: lm_apr_rolling_seven_day,
          });
        })
        .catch(() => {
        });

      DataApiClient.getAllTimeTradersCount()
        .then((count) => {
          setAllTimeTraders(count);
        })
        .catch(() => {
        });
    }, 60000);

    return () => clearInterval(interval);
  }, [view]);

  const getVelocityData = (
    metric:
      | 'tradingVolume'
      | 'totalFees'
      | 'liquidationVolume'
      | 'alpApr'
      | 'adxApr',
  ) => {
    const suffix = timePeriod === '24h' ? '24hChange' : '7dChange';
    const key = `${metric}${suffix}` as keyof typeof velocityData;
    return velocityData[key];
  };

  return (
    <div className="flex flex-col gap-2">
      {mainPool && (
        <StyledContainer className="p-0">
          <div className="flex flex-wrap justify-between">
            {/* Time Period Toggle */}
            <div className="border-0 min-w-[12em] flex flex-col justify-center">
              <div className="pb-2 text-center">
                <p className="text-[0.7em] sm:text-[0.7em] opacity-50">
                  Time Period
                </p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm opacity-50">24h</span>
                <Switch
                  checked={timePeriod === '7d'}
                  onChange={() =>
                    setTimePeriod(timePeriod === '24h' ? '7d' : '24h')
                  }
                  size="medium"
                />
                <span className="text-sm opacity-50">7d</span>
              </div>
            </div>

            <NumberDisplay
              title="TOTAL TRADING VOLUME"
              nb={mainPool.totalTradingVolume}
              format="currency"
              precision={0}
              className="border-0 min-w-[12em]"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              headerClassName="pb-2"
              titleClassName="text-[0.7em] sm:text-[0.7em]"
              footer={
                <VelocityIndicator
                  change={getVelocityData('tradingVolume')}
                  isLoading={isVelocityLoading}
                  className="mt-1"
                  isCurrency={true}
                  period={timePeriod}
                />
              }
            />

            <NumberDisplay
              title="TOTAL LIQUIDATION VOLUME"
              nb={mainPool.totalLiquidationVolume}
              format="currency"
              precision={0}
              className="border-0 min-w-[12em]"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              headerClassName="pb-2"
              titleClassName="text-[0.7em] sm:text-[0.7em]"
              footer={
                <VelocityIndicator
                  change={getVelocityData('liquidationVolume')}
                  isLoading={isVelocityLoading}
                  className="mt-1"
                  isCurrency={true}
                  period={timePeriod}
                />
              }
            />

            <NumberDisplay
              title="TOTAL FEES"
              nb={mainPool.totalFeeCollected}
              format="currency"
              precision={0}
              className="border-0 min-w-[12em]"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              headerClassName="pb-2"
              titleClassName="text-[0.7em] sm:text-[0.7em]"
              footer={
                <VelocityIndicator
                  change={getVelocityData('totalFees')}
                  isLoading={isVelocityLoading}
                  className="mt-1"
                  isCurrency={true}
                  period={timePeriod}
                />
              }
            />

            <NumberDisplay
              title="ALP Rolling 7D APR"
              nb={aprs?.lp ?? null}
              format="percentage"
              precision={2}
              isDecimalDimmed={false}
              className="border-0 min-w-[10em]"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              headerClassName="pb-2"
              titleClassName="text-[0.85em] sm:text-[0.85em]"
              tippyInfo="Average yield for ALP in the last 7 days"
              footer={
                <VelocityIndicator
                  change={getVelocityData('alpApr')}
                  isLoading={isVelocityLoading}
                  className="mt-1"
                  isCurrency={false}
                  period={timePeriod}
                />
              }
            />

            <NumberDisplay
              title="ADX Rolling 7D APR"
              nb={aprs?.lm ?? null}
              format="percentage"
              precision={2}
              isDecimalDimmed={false}
              className="border-0 min-w-[10em]"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              headerClassName="pb-2"
              titleClassName="text-[0.85em] sm:text-[0.85em]"
              tippyInfo="Average yield for 540d staked ADX in the last 7 days"
              footer={
                <VelocityIndicator
                  change={getVelocityData('adxApr')}
                  isLoading={isVelocityLoading}
                  className="mt-1"
                  isCurrency={false}
                  period={timePeriod}
                />
              }
            />

            <NumberDisplay
              title="Traders"
              nb={allTimeTraders ?? null}
              format="number"
              precision={0}
              className="border-0 min-w-[8em]"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              headerClassName="pb-2"
              titleClassName="text-[0.7em] sm:text-[0.7em]"
            />
          </div>
        </StyledContainer>
      )}

      {/* Rest of the charts remain the same */}
      {view === 'lite' ? (
        <StyledContainer className="flex gap-6">
          <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
            <AumChart />
            <VolumeBarChart
              isSmallScreen={false}
              yAxisBarScale={
                useSqrtScaleForVolumeAndFeeChart ? 'sqrt' : 'linear'
              }
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
            <UtilizationChart />
            <FeesBarChart
              isSmallScreen={isSmallScreen}
              yAxisBarScale={
                useSqrtScaleForVolumeAndFeeChart ? 'sqrt' : 'linear'
              }
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
            <OpenInterestChart isSmallScreen={isSmallScreen} />
            <BorrowRateChart />
          </div>

          <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
            <CompositionChart />
            <UsersCohortsChart />
          </div>

          <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
            <UnrealizedPnlChart isSmallScreen={isSmallScreen} />
            <RealizedPnlChart isSmallScreen={isSmallScreen} />
          </div>

          <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
            <DefilamaProtocolFeesChart isSmallScreen={isSmallScreen} />
            <LpIntegrationChart />
          </div>
        </StyledContainer>
      ) : null}
    </div>
  );
}
