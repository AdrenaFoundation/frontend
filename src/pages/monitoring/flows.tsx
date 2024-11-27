import 'react-datepicker/dist/react-datepicker.css';

import Image from 'next/image';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended } from '@/types';
import { getDaysBetweenDates } from '@/utils';

export default function Flow({
  custodies,
}: {
  custodies: CustodyExtended[] | null;
}) {
  const { data, loading, startDate, setStartDate, endDate, setEndDate } =
    usePositionStats();
  const [selectedRange, setSelectedRange] = useState('Last Day');

  if (loading) return <div>Loading...</div>;

  if (!data) return <div>No data</div>;

  const stats = data.positionStats;

  const getColor = (value: number, avg: number) => {
    if (value < 0) return 'bg-red';
    if (value > 0 && value < avg) return 'bg-orange';
    return 'bg-green';
  };

  const formattedActivity = data.positionActivity.reduce(
    (acc, activity) => ({
      ...acc,
      [activity.entryDate]: {
        countPositions: activity.countPositions,
        totalPnl: activity.totalPnl,
        averagePnl: activity.averagePnl,
        maxPnl: activity.maxPnl,
        minPnl: activity.minPnl,
        totalVolume: activity.totalVolume,
        maxVolume: activity.maxVolume,
        minVolume: activity.minVolume,
        averageVolume: activity.averageVolume,
      },
    }),
    {} as Record<
      string,
      Omit<(typeof data.positionActivity)[number], 'entryDate'>
    >,
  );

  const tradingStartDate = new Date('2024-01-01T00:00:00Z');

  const normalize = (
    value: number,
    minRange: number,
    maxRange: number,
    minValue: number,
    maxValue: number,
  ) => {
    if (value < minValue || value > maxValue) {
      return 2;
    }
    return (
      minRange +
      ((value - minValue) / (maxValue - minValue)) * (maxRange - minRange)
    );
  };

  const averagePnl =
    data.positionActivity.reduce(
      (acc, activity) => acc + activity.totalPnl,
      0,
    ) / data.positionActivity.length;
  const maxTotalVolume = Math.max(
    ...data.positionActivity.map((activity) => activity.totalVolume),
  );
  const minTotalVolume = Math.min(
    ...data.positionActivity.map((activity) => activity.totalVolume),
  );

  const activityCalendarData = (() => {
    const tableData = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    } as Record<
      string,
      ({
        total: number;
        color: string;
        size: number;
        date: Date;
        pnl: number;
        volume: number;
      } | null)[]
    >;

    const highestVolume = [];
    for (let i = 0; i < 365; i++) {
      const date = new Date(
        tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000,
      ).toISOString();

      const currentDay = new Date(
        tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000,
      ).toLocaleDateString('en-US', {
        weekday: 'short',
      });

      if (!formattedActivity[date]) {
        tableData[currentDay.toLowerCase()].push(null);
      } else {
        highestVolume.push(formattedActivity[date].totalVolume);

        tableData[currentDay.toLowerCase()].push({
          total: formattedActivity[date].countPositions,
          color: getColor(formattedActivity[date].totalPnl, averagePnl),
          date: new Date(tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000),
          pnl: formattedActivity[date].totalPnl,
          volume: formattedActivity[date].totalVolume,
          size: normalize(
            formattedActivity[date].totalVolume,
            1,
            20,
            minTotalVolume,
            maxTotalVolume,
          ),
        });
      }
    }
    return tableData;
  })();

  // Group stats by symbol
  const groupedStats = stats.reduce((acc, stat) => {
    if (!acc[stat.symbol]) {
      acc[stat.symbol] = [];
    }
    acc[stat.symbol].push(stat);
    return acc;
  }, {} as Record<string, typeof stats>);

  return (
    <StyledContainer className="rounded-lg overflow-hidden p-5 flex flex-wrap mt-2">
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between items-center">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-secondary border border-gray-600 rounded p-2 text-sm items-center">
          <Select
            onSelect={(value) => {
              setSelectedRange(value);
              const date = new Date();
              setEndDate(date.toISOString());
              switch (value) {
                case 'All Time':
                  setStartDate('2024-09-25T00:00:00Z');
                  break;
                case 'Last Month':
                  date.setMonth(date.getMonth() - 1);
                  setStartDate(date.toISOString());
                  break;
                case 'Last Week':
                  date.setDate(date.getDate() - 7);
                  setStartDate(date.toISOString());
                  break;
                case 'Last Day':
                  date.setDate(date.getDate() - 1);
                  setStartDate(date.toISOString());
                  break;
                case 'Custom':
                  break;
                default:
                  break;
              }
            }}
            reversed={true}
            className="shrink-0 h-full flex items-center w-[8.5em]"
            selectedTextClassName="text-sm"
            menuTextClassName="text-sm"
            menuClassName="rounded-tl-lg rounded-bl-lg ml-3"
            menuOpenBorderClassName="rounded-tl-lg rounded-bl-lg"
            options={[
              { title: 'All Time' },
              { title: 'Last Month' },
              { title: 'Last Week' },
              { title: 'Yesterday' },
              { title: 'Custom' },
            ]}
            selected={selectedRange}
          />

          {selectedRange === 'Custom' && (
            <>
              <DatePicker
                selected={new Date(startDate)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setStartDate(date.toISOString());
                  }
                }}
                className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
                minDate={new Date('2023-09-25')}
                maxDate={new Date()}
              />
              <DatePicker
                selected={new Date(endDate)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setEndDate(date.toISOString());
                  }
                }}
                className="w-full sm:w-auto px-2 py-1 bg-[#050D14] rounded border border-gray-600"
                minDate={new Date('2023-09-25')}
                maxDate={new Date()}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap w-full gap-4">
        {Object.entries(groupedStats).map(([symbol, symbolStats]) => (
          <div
            key={symbol}
            className="p-4 border rounded-lg bg-[#050D14] flex-grow min-w-[20em]"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Image
                src={
                  custodies?.find(
                    (c) =>
                      c.tokenInfo.symbol.toLocaleLowerCase() ===
                      symbol.toLowerCase(),
                  )?.tokenInfo.image || ''
                }
                alt="token icon"
                width="24"
                height="24"
              />
              {symbol}
            </h3>

            {symbolStats.map((stat) => (
              <div key={stat.side} className="mt-2 flex flex-col gap-2">
                <h4
                  className={`font-boldy ${stat.side === 'long' ? 'text-green' : 'text-redbright'
                    }`}
                >
                  {stat.side}
                </h4>
                <div>
                  <div className="flex justify-between text-txtfade">
                    <span>Positions count:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.countPositions}
                      precision={0}
                      minimumFractionDigits={0}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">
                      Total PnL over the period:
                    </span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.totalPnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className={twMerge(
                        'opacity-80',
                        stat.totalPnl < 0 ? 'text-redbright' : 'text-green',
                      )}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Worst PnL:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.minPnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className={twMerge(
                        'opacity-80',
                        stat.minPnl < 0 ? 'text-redbright' : 'text-green',
                      )}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Best PnL:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.maxPnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className={twMerge(
                        'opacity-80',
                        stat.maxPnl < 0 ? 'text-redbright' : 'text-green',
                      )}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Total Trade Volume:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.totalVolume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                    />
                  </div>
                  <div className="h-[1px] bg-third my-2" />
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Smallest Trade Size:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.minVolume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className="text-txtfade"
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Biggest Trade Size:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.maxVolume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className="text-txtfade"
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Average Trade Size:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.averageVolume}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <ActivityCalendar
        headers={Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString('default', { month: 'short' }),
        )}
        data={activityCalendarData}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
    </StyledContainer>
  );
}
