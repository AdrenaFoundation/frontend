import NumberFlow from '@number-flow/react';
import { useEffect, useRef, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import usePositionStats from '@/hooks/usePositionStats';
import { PageProps } from '@/types';

import ActivityCalendar from '../pages/monitoring/ActivityCalendar';

export default function LandingStats({
  mainPool,
}: {
  mainPool: PageProps['mainPool'];
}) {
  const {
    activityCalendarData,
    bubbleBy,
    setBubbleBy,

    isInitialLoad,
  } = usePositionStats();

  const ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState<number>(0);
  const [statsValues, setStatsValues] = useState<number[]>([0, 0, 0, 0]);
  const [allTimeTraders, setAllTimeTraders] = useState<number>(0);

  const [selectedRange, setSelectedRange] = useState<string>('All Time');

  useEffect(() => {
    const getAlltimeTraders = () => {
      DataApiClient.getAllTimeTradersCount()
        .then((count) => {
          setAllTimeTraders(count ?? 0);
        })
        .catch(() => {});
    };
    getAlltimeTraders();
  }, []);
  // Intersection Observer to animate volume when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVolume(mainPool?.totalTradingVolume ?? 0);
            }, 500);
          }
        });
      },
      { threshold: 1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [mainPool]);

  // Intersection Observer to animate stats when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setStatsValues(STATS.map((stat) => stat.value ?? 0));
            }, 500);
          }
        });
      },
      { threshold: 1 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [mainPool, allTimeTraders]);

  const STATS = [
    {
      name: 'Total  Value Locked',
      value: mainPool?.aumUsd,
      format: { style: 'currency', currency: 'USD' },
    },
    {
      name: 'Open Interest',
      value: (mainPool?.oiLongUsd ?? 0) + (mainPool?.oiShortUsd ?? 0),
      format: { style: 'currency', currency: 'USD' },
    },
    {
      name: 'Total Fees Generated',
      value: mainPool?.totalFeeCollected,
      format: { style: 'currency', currency: 'USD' },
    },
    {
      name: 'Total Traders',
      value: allTimeTraders,
      format: { style: 'decimal' },
    },
  ];

  return (
    <div className="flex flex-col gap-[3.125rem] items-center bg-main  w-full">
      <div>
        <h3 className="opacity-50 text-center capitalize">
          Total Trading Volume
        </h3>
        <NumberFlow
          className="text-[2.5rem] lg:text-[3.375rem] font-monobold"
          value={volume}
          format={{ style: 'currency', currency: 'USD' }}
          ref={ref}
        />
      </div>

      <ActivityCalendar
        data={activityCalendarData}
        selectedRange={selectedRange}
        bubbleBy={bubbleBy}
        setBubbleBy={setBubbleBy}
        setSelectedRange={setSelectedRange}
        isLoading={isInitialLoad}
        isLanding
        hasData
      />

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-[6.25rem]"
        ref={statsRef}
      >
        {STATS.map((stat, index) => (
          <div key={stat.name} className="text-center">
            <p className="opacity-50 text-lg">{stat.name}</p>
            <NumberFlow
              className="text-3xl font-monobold"
              value={statsValues[index]}
              format={stat.format}
            />
          </div>
        ))}
      </div>

      {/* <div className="w-full border rounded-lg">
        <div
          className="flex flex-row gap-2 items-center justify-between p-2 px-3 w-full border-b"
          style={{
            background:
              'repeating-linear-gradient(-45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 8px)',
          }}
        >
          <p className="text-base font-semibold opacity-50">Highlights</p>
          <div className="flex flex-row gap-2 items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300">
            <p className="text-base font-semibold">Open Monitor Page</p>
            <Image src={arrowIcon} alt="arrow icon" className="w-1 h-1" />
          </div>
        </div>
        <div className="p-2">
          <div className="p-2 w-[300px] h-12 border rounded-md"></div>
        </div>
      </div> */}
    </div>
  );
}
