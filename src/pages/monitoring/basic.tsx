import React, { useEffect } from 'react';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
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

  const velocityData = useVelocityIndicators();

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
      .catch(() => {});

    DataApiClient.getAllTimeTradersCount()
      .then((count) => {
        setAllTimeTraders(count);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      DataApiClient.getRolling7DGlobalApr()
        .then(({ lp_apr_rolling_seven_day, lm_apr_rolling_seven_day }) => {
          setAprs({
            lp: lp_apr_rolling_seven_day,
            lm: lm_apr_rolling_seven_day,
          });
        })
        .catch(() => {});

      DataApiClient.getAllTimeTradersCount()
        .then((count) => {
          setAllTimeTraders(count);
        })
        .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, [view]);

  return (
    <div className="flex flex-col gap-2">
      {mainPool && (
        <StyledContainer className="p-0">
          <div className="flex flex-wrap justify-between">
            <NumberDisplay
              title="TOTAL TRADING VOLUME"
              nb={mainPool.totalTradingVolume}
              format="currency"
              precision={0}
              className="border-0 min-w-[12em] text-center"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center"
              headerClassName="pb-2 text-center"
              titleClassName="text-[0.7em] sm:text-[0.7em] text-center"
              footer={
                <div className="flex justify-center">
                  <VelocityIndicator
                    dailyChange={velocityData['24h'].tradingVolumeChange}
                    weeklyChange={velocityData['7d'].tradingVolumeChange}
                    className="mt-1"
                    format="currency"
                  />
                </div>
              }
            />

            <NumberDisplay
              title="TOTAL LIQUIDATION VOLUME"
              nb={mainPool.totalLiquidationVolume}
              format="currency"
              precision={0}
              className="border-0 min-w-[12em] text-center"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center"
              headerClassName="pb-2 text-center"
              titleClassName="text-[0.7em] sm:text-[0.7em] text-center"
              footer={
                <div className="flex justify-center">
                  <VelocityIndicator
                    dailyChange={velocityData['24h'].liquidationVolumeChange}
                    weeklyChange={velocityData['7d'].liquidationVolumeChange}
                    className="mt-1"
                    format="currency"
                  />
                </div>
              }
            />

            <NumberDisplay
              title="TOTAL FEES"
              nb={mainPool.totalFeeCollected}
              format="currency"
              precision={0}
              className="border-0 min-w-[12em] text-center"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center"
              headerClassName="pb-2 text-center"
              titleClassName="text-[0.7em] sm:text-[0.7em] text-center"
              footer={
                <div className="flex justify-center">
                  <VelocityIndicator
                    dailyChange={velocityData['24h'].totalFeesChange}
                    weeklyChange={velocityData['7d'].totalFeesChange}
                    className="mt-1"
                    format="currency"
                  />
                </div>
              }
            />

            <NumberDisplay
              title="ALP Rolling 7D APR"
              nb={aprs?.lp ?? null}
              format="percentage"
              precision={2}
              isDecimalDimmed={false}
              className="border-0 min-w-[10em] text-center"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center"
              headerClassName="pb-2 text-center"
              titleClassName="text-[0.85em] sm:text-[0.85em] text-center"
              tippyInfo="Average yield for ALP in the last 7 days"
              footer={
                <div className="flex justify-center">
                  <VelocityIndicator
                    dailyChange={velocityData['24h'].alpAprChange}
                    weeklyChange={velocityData['7d'].alpAprChange}
                    className="mt-1"
                    format="percentage"
                  />
                </div>
              }
            />

            <NumberDisplay
              title="ADX Rolling 7D APR"
              nb={aprs?.lm ?? null}
              format="percentage"
              precision={2}
              isDecimalDimmed={false}
              className="border-0 min-w-[10em] text-center"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center"
              headerClassName="pb-2 text-center"
              titleClassName="text-[0.85em] sm:text-[0.85em] text-center"
              tippyInfo="Average yield for 540d staked ADX in the last 7 days"
              footer={
                <div className="flex justify-center">
                  <VelocityIndicator
                    dailyChange={velocityData['24h'].adxAprChange}
                    weeklyChange={velocityData['7d'].adxAprChange}
                    className="mt-1"
                    format="percentage"
                  />
                </div>
              }
            />

            <NumberDisplay
              title="Total Traders"
              nb={allTimeTraders ?? null}
              format="number"
              precision={0}
              className="border-0 min-w-[8em] text-center"
              bodyClassName="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center"
              headerClassName="pb-2 text-center"
              titleClassName="text-[0.7em] sm:text-[0.7em] text-center"
              footer={
                <div className="flex justify-center">
                  <VelocityIndicator
                    dailyChange={velocityData['24h'].newTraders}
                    weeklyChange={velocityData['7d'].newTraders}
                    className="mt-1"
                    format="number"
                  />
                </div>
              }
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
