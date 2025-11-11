import { useMemo } from 'react';

import LineRechart from '@/components/ReCharts/LineRecharts';

interface EmissionsChartProps {
  isSmallScreen: boolean;
}

const lmEmissionsStart = new Date(1727006400000);
const startDate = new Date(1726591514000);

type Emissions = {
  date: Date;
  time: string;
  adxLiquidityMining: number;
  alpLiquidityMining: number;
  genesisLiquidityMining: number;
  investorVesting: number;
  launchTeamVesting: number;
  foundationVesting: number;
}[];

// in percent
const alpLmEmissionDecay = 10;
const adxLmEmissionDecayYear1 = 7;
const adxLmEmissionDecayYear2 = 12;

const alpLmPerMonth = 15000000;
const adxLmPerMonth = 8600000;

// This unit is used in backend to calculate the emission - it's not pixel perfect, but it's close enough
const secondsPerMonth = 2592000;

// There are 4 rounds of 6 hours per day
const alpLmPerDay = (alpLmPerMonth / secondsPerMonth) * 21600 * 4;
const adxLmPerDay = (adxLmPerMonth / secondsPerMonth) * 21600 * 4;
const startOfLmLpMonthCounter = new Date(1726591514000);

const vestingStart = new Date(1734696000000);
const vestingEnd = new Date(1789905600000);

const investorVestPerDay =
  ((156650000 /
    ((vestingEnd.getTime() - vestingStart.getTime()) / (1000 * 60 * 60 * 24))) *
    50) /
  100;
const launchTeamVestPerDay =
  ((202350000 /
    ((vestingEnd.getTime() - vestingStart.getTime()) / (1000 * 60 * 60 * 24))) *
    50) /
  100;
const foundationVestPerDay =
  ((90000000 /
    ((vestingEnd.getTime() - vestingStart.getTime()) / (1000 * 60 * 60 * 24))) *
    50) /
  100;

const genesisStartDate = new Date(1726574400000);
const genesisEndDate = new Date(1742385600000);

const genesisAdxRewards = 50_000_000;
const genesisEmissionPerDay =
  genesisAdxRewards /
  ((genesisEndDate.getTime() - genesisStartDate.getTime()) /
    (1000 * 60 * 60 * 24));

export const fullyLiquidALPStaking = new Date(1742385600000);

export function EmissionsChart({ isSmallScreen }: EmissionsChartProps) {
  const emissions: Emissions = useMemo(() => {
    // Generate all timestamps
    const emissions = Array.from({ length: 770 }).reduce(
      (acc: Emissions, _, i) => {
        const d = new Date(startDate.getTime());
        d.setDate(d.getDate() + i);

        acc.push({
          date: d,
          time: d.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          }),
          adxLiquidityMining: 0,
          alpLiquidityMining: 0,
          genesisLiquidityMining: 0,
          investorVesting: 0,
          launchTeamVesting: 0,
          foundationVesting: 0,
        });

        return acc;
      },
      [] as Emissions,
    );

    // Calculate LM emissions

    let monthsSinceStart = 0;
    let lastMonthUpdate = startOfLmLpMonthCounter;
    let alpLmPerDayDyn = alpLmPerDay;
    let adxLmPerDayDyn = adxLmPerDay;

    // Handle ADX/ALP staking LM emissions
    emissions.forEach((emission) => {
      if (
        emission.date.getTime() >=
        lastMonthUpdate.getTime() + secondsPerMonth * 1000
      ) {
        // One month as passed, apply decay
        monthsSinceStart += 1;
        lastMonthUpdate = new Date(
          lastMonthUpdate.getTime() + secondsPerMonth * 1000,
        );

        alpLmPerDayDyn =
          alpLmPerDayDyn - (alpLmPerDayDyn * alpLmEmissionDecay) / 100;

        const adxLmEmissionDecay =
          monthsSinceStart < 12
            ? adxLmEmissionDecayYear1
            : adxLmEmissionDecayYear2;

        adxLmPerDayDyn =
          adxLmPerDayDyn - (adxLmPerDayDyn * adxLmEmissionDecay) / 100;
      }

      if (emission.date.getTime() < lmEmissionsStart.getTime()) {
        return;
      }

      if (emission.date.getTime() >= fullyLiquidALPStaking.getTime()) {
        emission.alpLiquidityMining = 0;
      } else {
        emission.alpLiquidityMining = alpLmPerDayDyn;
      }
      emission.adxLiquidityMining = adxLmPerDayDyn;
    });

    // Handle vesting
    emissions.forEach((emission) => {
      if (
        emission.date.getTime() <= vestingStart.getTime() ||
        emission.date.getTime() >= vestingEnd.getTime()
      ) {
        return;
      }

      emission.investorVesting = investorVestPerDay;
      emission.launchTeamVesting = launchTeamVestPerDay;
      emission.foundationVesting = foundationVestPerDay;
    });

    // Handle genesis
    emissions.forEach((emission) => {
      if (
        emission.date.getTime() <= genesisStartDate.getTime() ||
        emission.date.getTime() >= genesisEndDate.getTime()
      ) {
        return;
      }

      emission.genesisLiquidityMining = genesisEmissionPerDay;
    });

    return emissions;
  }, []);

  return (
    <LineRechart
      title=""
      formatY="number"
      isNowReferenceLine={true}
      data={emissions.map(
        ({
          time,
          alpLiquidityMining,
          adxLiquidityMining,
          genesisLiquidityMining,
          investorVesting,
          launchTeamVesting,
          foundationVesting,
        }) => ({
          time,
          'ALP LM': alpLiquidityMining,
          'ADX LM': adxLiquidityMining,
          'ALP Genesis LM': genesisLiquidityMining,
          'Investor Vesting': investorVesting,
          'Launch Team Vesting': launchTeamVesting,
          'Foundation Vesting': foundationVesting,
        }),
      )}
      labels={[
        { name: 'ALP LM', color: '#256281' },
        { name: 'ADX LM', color: '#a82e2e' },
        { name: 'ALP Genesis LM', color: '#7ed7c1' },
        { name: 'Investor Vesting', color: '#9e8cae' },
        { name: 'Launch Team Vesting', color: '#d4c7df' },
        { name: 'Foundation Vesting', color: '#eb6672' },
      ]}
      scale="sqrt"
      periods={[]}
      yDomain={[0]}
      gmt={0}
      isSmallScreen={isSmallScreen}
    />
  );
}
