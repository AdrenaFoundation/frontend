import React, { useEffect } from 'react';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import ALPPriceChart from '@/components/pages/global/ALPPrice/ALPPriceChart';
import AumChart from '@/components/pages/global/Aum/AumChart';
import BorrowRateChart from '@/components/pages/global/BorrowRate/BorrowRateChart';
import CompositionChart from '@/components/pages/global/Composition/CompositionChart';
import FeesBarChart from '@/components/pages/global/Fees/FeesBarChart';
import FeesChart from '@/components/pages/global/Fees/FeesChart';
import OpenInterestChart from '@/components/pages/global/OpenInterest/OpenInterestChart';
import UsersCohortsChart from '@/components/pages/global/UsersCohorts/UsersCohortsChart';
import UtilizationChart from '@/components/pages/global/UtilizationChart/UtilizationChart';
import VolumeBarChart from '@/components/pages/global/Volume/VolumeBarChart';
import DataApiClient from '@/DataApiClient';
import { PoolInfo } from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';
import { UnrealizedPnlChart } from '@/components/pages/global/UnrealizedPnl/UnrealizedPnlChart';
import { RealizedPnlChart } from '@/components/pages/global/RealizedPnl/RealizedPnlChart';

export default function BasicMonitoring({
  mainPool,
  isSmallScreen
}: PageProps & {
  poolInfo: PoolInfo | null;
  isSmallScreen: boolean;
}) {
  const [aprs, setAprs] = React.useState<{
    lp: number;
    lm: number;
  } | null>(null);

  useEffect(() => {
    DataApiClient.getRolling7DGlobalApr().then(
      ({
        lp_apr_rolling_seven_day,
        lm_apr_rolling_seven_day,
      }) => {
        setAprs({
          lp: lp_apr_rolling_seven_day,
          lm: lm_apr_rolling_seven_day,
        });
      })
      .catch(() => {
        // Ignore
      });

    const interval = setInterval(() => {
      DataApiClient.getRolling7DGlobalApr().then(
        ({
          lp_apr_rolling_seven_day,
          lm_apr_rolling_seven_day,
        }) => {
          setAprs({
            lp: lp_apr_rolling_seven_day,
            lm: lm_apr_rolling_seven_day,
          });
        })
        .catch(() => {
          // Ignore
        });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 p-2">
      {mainPool && (
        <StyledContainer className="p-0">
          <div className="flex flex-wrap justify-between">
            <NumberDisplay
              title="TOTAL TRADING VOLUME"
              nb={mainPool.totalTradingVolume}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="TOTAL LIQUIDATION VOLUME"
              nb={mainPool.totalLiquidationVolume}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="TOTAL ALP VOLUME"
              nb={mainPool.totalAddRemoveLiquidityVolume}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="TOTAL FEES"
              nb={mainPool.totalFeeCollected}
              format="currency"
              precision={0}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="ALP Rolling 7D fees APR"
              nb={aprs?.lp ?? null}
              format="percentage"
              precision={2}
              isDecimalDimmed={false}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />

            <NumberDisplay
              title="ADX Rolling 7D fees APR"
              nb={aprs?.lm ?? null}
              format="percentage"
              precision={2}
              isDecimalDimmed={false}
              className='border-0 min-w-[12em]'
              bodyClassName='text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl'
              headerClassName='pb-2'
              titleClassName='text-[0.7em] sm:text-[0.7em]'
            />
          </div>
        </StyledContainer>
      )}

      <StyledContainer className="flex gap-6">
        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <AumChart />
          <VolumeBarChart isSmallScreen={false} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <UtilizationChart />
          <FeesBarChart isSmallScreen={isSmallScreen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <OpenInterestChart isSmallScreen={isSmallScreen} />
          <BorrowRateChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <UnrealizedPnlChart isSmallScreen={isSmallScreen} />
          <RealizedPnlChart isSmallScreen={isSmallScreen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <FeesChart isSmallScreen={isSmallScreen} />
          <UsersCohortsChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <CompositionChart />
          <ALPPriceChart />
        </div>

      </StyledContainer>
    </div>
  );
}
