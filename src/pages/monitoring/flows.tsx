import 'react-datepicker/dist/react-datepicker.css';

import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import { twMerge } from 'tailwind-merge';

import Select from '@/components/common/Select/Select';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Filter from '@/components/Filter/Filter';
import FormatNumber from '@/components/Number/FormatNumber';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import { normalize } from '@/constant';
import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended } from '@/types';

export default function Flow({
  custodies,
}: {
  custodies: CustodyExtended[] | null;
}) {
  const { data, loading, startDate, setStartDate, endDate, setEndDate } =
    usePositionStats();
  const [selectedRange, setSelectedRange] = useState('Last Day');
  const [bubbleSizeBy, setBubbleSizeBy] = useState('Volume');

  const tradingStartDate = new Date('2024-01-01T00:00:00Z');

  const stats = data?.positionStats;
  const activity = data?.positionActivity;

  const getColor = (value: number, avg: number) => {
    if (value < 0) return '#AC2E41';
    if (value > 0 && value < avg) return '#BD773F';
    return '#18AC81';
  };

  const activityCalendarData = useMemo(() => {
    if (!activity) return null;

    const activityKeys: Record<string, keyof (typeof activity)[number]> = {
      'open size': 'totalExitSize',
      'position count': 'exitCount',
      pnl: 'totalExitPnl',
      volume: 'totalVolume',
      'increase size': 'totalIncreaseSize',
      fees: 'totalExitFees',
    };

    const formattedActivityKeys: Record<
      string,
      keyof (typeof formattedActivity)[number]
    > = {
      'open size': 'totalSize',
      'position count': 'totalPositions',
      pnl: 'totalPnl',
      volume: 'totalVolume',
      'increase size': 'totalIncreaseSize',
      fees: 'totalFees',
    };

    const formattedActivity = activity.reduce(
      (acc, activity) => ({
        ...acc,
        [activity.dateDay]: {
          totalSize: activity.totalExitSize,
          totalPositions: activity.exitCount,
          totalPnl: activity.totalExitPnl,
          totalVolume: activity.totalVolume,
          totalIncreaseSize: activity.totalIncreaseSize,
          totalFees: activity.totalExitFees,
        },
      }),
      {} as Record<
        string,
        {
          totalSize: number;
          totalPositions: number;
          totalPnl: number;
          totalVolume: number;
          totalIncreaseSize: number;
          totalFees: number;
        }
      >,
    );

    const averagePnl =
      activity.reduce((acc, activity) => acc + activity.totalExitPnl, 0) /
      activity.length;

    const maxTotal = (key: keyof typeof activity) =>
      Math.max(
        ...activity.map(
          (activity) => activity[key as keyof typeof activity] as number,
        ),
      );

    const minTotal = (key: keyof typeof activity) =>
      Math.min(
        ...activity.map(
          (activity) => activity[key as keyof typeof activity] as number,
        ),
      );

    const tableData = [];

    const highestVolume = [];
    for (let i = 0; i < 365; i++) {
      const date = new Date(
        tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000,
      ).toISOString();

      if (!formattedActivity[date]) {
        tableData.push({
          date: new Date(tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000),
          stats: null,
        });
      } else {
        highestVolume.push(formattedActivity[date].totalVolume);

        tableData.push({
          date: new Date(tradingStartDate.getTime() + i * 24 * 60 * 60 * 1000),
          stats: {
            color: getColor(formattedActivity[date].totalPnl, averagePnl),
            totalPositions: formattedActivity[date].totalPositions,
            pnl: formattedActivity[date].totalPnl,
            increaseSize: formattedActivity[date].totalIncreaseSize,
            totalFees: formattedActivity[date].totalFees,
            volume: formattedActivity[date].totalVolume,
            size: formattedActivity[date].totalSize,
            bubbleSize: normalize(
              formattedActivity[date][
              formattedActivityKeys[
              bubbleSizeBy.toLowerCase() as keyof typeof activityKeys
              ]
              ],
              3,
              15,
              minTotal(
                activityKeys[
                bubbleSizeBy.toLowerCase()
                ] as keyof typeof activity,
              ),
              maxTotal(
                activityKeys[
                bubbleSizeBy.toLowerCase()
                ] as keyof typeof activity,
              ),
            ),
          },
        });
      }
    }
    return tableData;
  }, [activity, bubbleSizeBy, endDate, startDate]);

  // Group stats by symbol
  const groupedStats = stats?.reduce((acc, stat) => {
    if (!acc[stat.symbol]) {
      acc[stat.symbol] = [];
    }
    acc[stat.symbol].push(stat);
    return acc;
  }, {} as Record<string, typeof stats>);

  if (loading) return <div>Loading...</div>;

  if (!data) return <div>No data</div>;

  return (
    <StyledContainer className="rounded-lg overflow-hidden p-5 mt-2">
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
          className="shrink-0 h-full flex items-center"
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

      <ActivityCalendar
        data={activityCalendarData}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        bubbleSizeBy={bubbleSizeBy}
        setBubbleSizeBy={setBubbleSizeBy}
        setSelectedRange={setSelectedRange}
      />

      <div className="flex flex-col lg:flex-row gap-3">
        {groupedStats &&
          Object.entries(groupedStats).map(([symbol, symbolStats]) => (
            <div
              key={symbol}
              className="p-4 border rounded-lg bg-[#050D14] flex-1"
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

    </StyledContainer>
  );
}
