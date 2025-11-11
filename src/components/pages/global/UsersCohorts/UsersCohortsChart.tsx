import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Loader from '@/components/Loader/Loader';
import DataApiClient from '@/DataApiClient';
import { RechartsData } from '@/types';
import { getLastMondayUTC } from '@/utils';

import LineRechartCohorts from './LineRechartCohorts';

type CohortData = {
  cohort_id: string;
  activity_week: string[];
  cohort_active_users: number[];
  cohort_trades: number[];
  cohort_volume: number[];
}[];

const colors = [
  '#c6bf4e',
  '#e9de49',
  '#6aa87e',
  '#aa70e4',
  '#3e5fe4',
  '#7ace6f',
  '#6d68c0',
  '#8ec2e4',
  '#b091d6',
  '#debc6b',
  '#73c464',
  '#4358d5',
  '#a88cdc',
  '#b5de5b',
  '#71ce94',
  '#a467b8',
  '#799f94',
  '#9aa267',
  '#8cdbc2',
  '#c6a569',
  '#ecb77c',
  '#98d4cc',
  '#95e5e3',
  '#91b3f0',
  '#4764df',
  '#cf6dea',
  '#88a382',
  '#81ab7a',
  '#7065cf',
  '#e0ce58',
  '#68d7c8',
  '#79d4e0',
  '#d4a95b',
  '#6870bb',
  '#dea76c',
  '#6748cb',
  '#c688df',
  '#5e54dc',
  '#d187ca',
  '#87b398',
  '#68cd9f',
  '#63bfe1',
  '#c1b971',
  '#5d6fd7',
  '#dec67d',
  '#67aa86',
  '#c982bd',
  '#97d7ec',
  '#92a66c',
  '#5d43b5',
  '#b992e7',
  '#6b4ed0',
  '#576ab7',
  '#bdc15e',
  '#414bb9',
  '#dfc26b',
  '#3a7ad0',
  '#ce79b7',
  '#9ea471',
  '#6fac91',
];

export default function UsersCohortsChart() {
  const [apiData, setApiData] = useState<CohortData | null>(null);
  const [chartData, setChartData] = useState<RechartsData[] | null>(null);
  const [cohortsInfo, setCohortsInfo] = useState<
    | {
        name: string;
        color: string;
      }[]
    | null
  >(null);
  const [type, setType] = useState<'users' | 'volumes' | 'trades'>('users');

  const getCohortsApiData = async () => {
    try {
      const res = await fetch(
        `${DataApiClient.DATAPI_URL}/cohorts?end_date=${getLastMondayUTC().toISOString()}`,
      );

      const { data } = await res.json();

      const { cohorts } = data as {
        cohorts: CohortData;
      };

      setApiData(cohorts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const cohorts = apiData;

    if (!cohorts) return;

    const timestamps = Array.from(
      cohorts.reduce((set, cohort) => {
        cohort.activity_week.forEach((time) => {
          set.add(
            new Date(time).toLocaleString('en-US', {
              day: 'numeric',
              month: 'numeric',
            }),
          );
        });

        return set;
      }, new Set<string>()),
    );

    const formatted: RechartsData[] = timestamps.map(
      (time: string, i: number) => ({
        time,
        ...cohorts.reduce(
          (acc, cohort) => {
            // Look for the week that matches the current timestamp
            const index = cohort.activity_week.findIndex(
              (week) => week === cohorts[0].activity_week[i],
            );

            if (index === -1) return acc;

            const v = (() => {
              if (type === 'users') return cohort.cohort_active_users[index];
              if (type === 'trades') return cohort.cohort_trades[index];

              return cohort.cohort_volume[index];
            })();

            return {
              ...acc,
              [`Cohort ${cohort.cohort_id}`]: v,
            };
          },
          {} as {
            [key: string]: number;
          },
        ),
      }),
    );

    setCohortsInfo(
      cohorts.map((cohort, i) => ({
        name: `Cohort ${cohort.cohort_id}`,
        color: colors[i % colors.length],
      })),
    );

    setChartData(formatted);
  }, [apiData, type]);

  useEffect(() => {
    getCohortsApiData();

    const interval = setInterval(() => {
      getCohortsApiData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-h-[18em]">
      <div className="flex mb-3 justify-between items-center">
        <div className="flex gap-x-3 items-center">
          <h2>Weekly Trader Retention</h2>
        </div>

        <div className="flex gap-3 items-center">
          <div
            className={twMerge(
              'text-sm cursor-pointer hover:opacity-90',
              type === 'users' ? 'opacity-100 underline' : 'opacity-50',
            )}
            onClick={() => setType('users')}
          >
            user
          </div>
          <div
            className={twMerge(
              'text-sm cursor-pointer hover:opacity-90',
              type === 'volumes' ? 'opacity-100 underline' : 'opacity-50',
            )}
            onClick={() => setType('volumes')}
          >
            volume
          </div>
          <div
            className={twMerge(
              'text-sm cursor-pointer hover:opacity-90',
              type === 'trades' ? 'opacity-100 underline' : 'opacity-50',
            )}
            onClick={() => setType('trades')}
          >
            trade
          </div>
        </div>
      </div>

      <LineRechartCohorts
        type={type}
        data={chartData}
        labels={cohortsInfo ?? []}
        hideLegend={true}
      />
    </div>
  );
}
