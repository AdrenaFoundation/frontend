import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { twMerge } from 'tailwind-merge';

import CustomRechartsToolTip from '@/components/CustomRechartsToolTip/CustomRechartsToolTip';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import { EnrichedPositionApi } from '@/types';
import { formatPriceInfo, getTokenImage, getTokenSymbol } from '@/utils';

import { CHAOS_API_ENDPOINT } from '../TradingChart/datafeed';
import { FormattedEventsType } from './EventBlocks';

type ChartDataPoint = {
  time: string;
  timestamp: number;
  price: number;
  pnl: number;
  isOpen: boolean;
  isClose: boolean;
  isLiquidated: boolean;
  eventType?: string | null;
  eventColor?: string | null;
};

export default function PositionHistoryChart({
  positionHistory,
  events,
}: {
  positionHistory: EnrichedPositionApi;
  events: FormattedEventsType[][];
}) {
  const [realPriceData, setRealPriceData] = useState<
    Array<{ timestamp: number; price: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true);
      try {
        const startTime = new Date(positionHistory.entryDate).getTime();
        const endTime = positionHistory.exitDate
          ? new Date(positionHistory.exitDate).getTime()
          : Date.now();

        // Add some padding (20% of duration on each side, minimum 4 hours)
        const duration = endTime - startTime;
        const padding = Math.max(duration * 0.2, 4 * 60 * 60 * 1000); // 20% or 4 hours minimum

        // Don't fetch beyond current time
        const now = Date.now();
        const actualEndTime = Math.min(endTime + padding, now);

        const fetchStartTime = Math.floor(startTime - padding);
        const fetchEndTime = Math.floor(actualEndTime);

        const tokenSymbol = getTokenSymbol(positionHistory.token.symbol);

        const response = await fetch(
          `${CHAOS_API_ENDPOINT}/trading-view/data?feed=${tokenSymbol}USD&type=1H&from=${fetchStartTime}&till=${fetchEndTime}`,
        );

        if (!response.ok) {
          console.error(`Error fetching ${tokenSymbol} price data`);
          return;
        }

        const data = await response.json();

        if (data.result && Array.isArray(data.result)) {
          const formattedData = data.result.map(
            (item: { time: number; close: number }) => ({
              timestamp: item.time, // Convert seconds to milliseconds
              price: item.close,
            }),
          );
          console.log('Price data timestamps:', {
            first: formattedData[0],
            last: formattedData[formattedData.length - 1],
            count: formattedData.length,
          });
          setRealPriceData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceData();
  }, [positionHistory]);

  const chartData = useMemo(() => {
    if (isLoading || realPriceData.length === 0) {
      return [];
    }

    // Check if position duration is less than 24 hours for X-axis formatting
    const entryDate = new Date(positionHistory.entryDate);
    const exitDate = positionHistory.exitDate
      ? new Date(positionHistory.exitDate)
      : new Date();

    const timeDifferenceMs = exitDate.getTime() - entryDate.getTime();
    const isLessThan24Hours = timeDifferenceMs < 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Extract event timestamps and metadata from events data
    const eventTimestamps = events
      .map((event) => {
        const transactionDateItem = event.find(
          (item) => item.label === 'transactionDate',
        );
        const methodItem = event.find((item) => item.label === 'Method');

        if (transactionDateItem && methodItem) {
          const eventTimestamp = new Date(
            transactionDateItem.value as string,
          ).getTime();

          // Round down to nearest hour
          const roundedTimestamp =
            Math.floor(eventTimestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);

          return {
            timestamp: roundedTimestamp,
            eventType: methodItem.value as string,
            eventColor: methodItem.dotClassName || '#ffffff',
          };
        }
        return null;
      })
      .filter(Boolean);

    const data: ChartDataPoint[] = realPriceData.map((pricePoint) => {
      const timestamp = pricePoint.timestamp;
      const time = new Date(timestamp);
      const price = pricePoint.price;

      const pnl = positionHistory.pnl;

      return {
        time: isLessThan24Hours
          ? time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : time.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
            }),
        timestamp,
        price,
        pnl,
        isOpen: false,
        isClose: false,
        isLiquidated: false,
        eventType: null,
        eventColor: null,
      };
    });

    eventTimestamps.forEach((eventData) => {
      if (!eventData) return;

      // Find the closest data point to this event
      let closestIndex = 0;
      let closestDistance = Math.abs(data[0].timestamp - eventData.timestamp);

      for (let i = 1; i < data.length; i++) {
        const distance = Math.abs(data[i].timestamp - eventData.timestamp);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
      console.log('Checking closest point:', {
        closestIndex,
        closestDistance,
        eventData,
        currentEventType: data[closestIndex].eventType,
        dataPointTimestamp: data[closestIndex].timestamp,
        dataPointTime: new Date(data[closestIndex].timestamp),
      });

      // Only assign if within 24 hours (increased tolerance for better matching)
      if (closestDistance < 86400000) {
        // 24 hours in milliseconds
        console.log('Distance check passed, assigning event');

        // Check if this data point already has an event
        const hasEvent = data[closestIndex].eventType;

        // Priority system: Open/Close/Liquidated Position > Other events
        const isHighPriority =
          eventData.eventType === 'Open Position' ||
          eventData.eventType === 'Close Position' ||
          data[closestIndex].eventType === 'Liquidated' ||
          eventData.eventType?.includes('Partial Close');

        const currentIsHighPriority =
          data[closestIndex].eventType === 'Open Position' ||
          data[closestIndex].eventType === 'Close Position' ||
          data[closestIndex].eventType === 'Liquidated' ||
          data[closestIndex].eventType?.includes('Partial Close');

        // Assign event if:
        // 1. No existing event, OR
        // 2. New event is higher priority than existing, OR
        // 3. Same priority and this event is closer
        if (
          !hasEvent ||
          (isHighPriority && !currentIsHighPriority) ||
          (isHighPriority === currentIsHighPriority &&
            closestDistance <
              Math.abs(data[closestIndex].timestamp - eventData.timestamp))
        ) {
          data[closestIndex].eventType = eventData.eventType;
          data[closestIndex].eventColor = eventData.eventColor;

          // Override price with actual execution prices for position events
          if (eventData.eventType === 'Open Position') {
            data[closestIndex].price = positionHistory.entryPrice;
            // Recalculate PnL with the corrected price
            data[closestIndex].pnl = 0; // PnL is 0 at entry
          } else if (
            eventData.eventType === 'Close Position' ||
            positionHistory.status === 'liquidate' ||
            eventData.eventType?.includes('Partial Close')
          ) {
            if (positionHistory.exitPrice) {
              data[closestIndex].price = positionHistory.exitPrice;
              // Recalculate PnL with the corrected price
              const pnl =
                positionHistory.side === 'long'
                  ? (positionHistory.exitPrice - positionHistory.entryPrice) *
                    (positionHistory.entrySize || 1)
                  : (positionHistory.entryPrice - positionHistory.exitPrice) *
                    (positionHistory.entrySize || 1);
              data[closestIndex].pnl = pnl;
            }
          }

          console.log('Event assigned:', {
            index: closestIndex,
            eventType: data[closestIndex].eventType,
            replacedEvent: hasEvent,
            isHighPriority,
            correctedPrice: data[closestIndex].price,
          });
        } else {
          console.log('Event not assigned due to priority:', {
            newEvent: eventData.eventType,
            existingEvent: data[closestIndex].eventType,
            newPriority: isHighPriority,
            existingPriority: currentIsHighPriority,
          });
        }

        if (eventData.eventType === 'Open Position') {
          data[closestIndex].isOpen = true;
        } else if (
          eventData.eventType === 'Close Position' ||
          eventData.eventType?.includes('Partial Close')
        ) {
          data[closestIndex].isClose = true;
        } else if (eventData.eventType === 'Liquidated') {
          data[closestIndex].isLiquidated = true;
        }
      } else {
        console.log('Event too far from any data point:', {
          closestDistance,
          eventData,
        });
      }
    });

    return data;
  }, [positionHistory, realPriceData, isLoading, events]);

  const breakEvenPrice = positionHistory.entryPrice;
  const currentPnl = positionHistory.pnl || 0;

  // Check if position duration is less than 24 hours for reference line positioning
  const entryDate = new Date(positionHistory.entryDate);
  const exitDate = positionHistory.exitDate
    ? new Date(positionHistory.exitDate)
    : new Date();
  const timeDifferenceMs = exitDate.getTime() - entryDate.getTime();
  const isLessThan24Hours = timeDifferenceMs < 24 * 60 * 60 * 1000;

  // Find open, close, and liquidated points for the connection line
  const openPointIndex = chartData.findIndex((point) => point.isOpen);
  const closePointIndex = chartData.findIndex((point) => point.isClose);
  const liquidatedPointIndex = chartData.findIndex(
    (point) => point.isLiquidated,
  );

  const openPoint = openPointIndex >= 0 ? chartData[openPointIndex] : null;
  const closePoint = closePointIndex >= 0 ? chartData[closePointIndex] : null;
  const liquidatedPoint =
    liquidatedPointIndex >= 0 ? chartData[liquidatedPointIndex] : null;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden w-full h-[20rem] bg-[#0f1924] border border-inputcolor rounded-xl p-4 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const CustomDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { eventType: string; eventColor: string };
  }) => {
    const { cx, cy, payload } = props;

    if (!payload?.eventType) return null;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill={payload.eventColor}
          fillOpacity={0.2}
        />
        <circle cx={cx} cy={cy} r={4} fill={payload.eventColor} />
      </g>
    );
  };

  return (
    <div className="relative overflow-hidden w-full h-[20rem] bg-[#0f1924] border border-inputcolor rounded-xl p-4 flex flex-col">
      {/* <Image
        src={monster}
        alt="Monster"
        className="absolute z-0 opacity-5 right-0 -top-24 object-right w-[20rem]"
        style={{
          filter: 'grayscale(1) brightness(2) hue-rotate(180deg)',
        }}
      /> */}
      <div className="flex flex-col gap-2 mb-4 flex-shrink-0">
        <TokenDetails positionHistory={positionHistory} />
        <div className="flex flex-row items-center gap-2">
          <FormatNumber
            nb={Math.abs(positionHistory.pnl)}
            format="currency"
            prefix={positionHistory.pnl > 0 ? '+ ' : '- '}
            className={twMerge(
              'text-4xl font-interBold',
              positionHistory.pnl >= 0 ? 'text-[#35C488]' : 'text-redbright',
            )}
            isDecimalDimmed={false}
          />
          <div className="opacity-50">
            <FormatNumber
              nb={
                ((true
                  ? positionHistory.pnl
                  : positionHistory.pnl - positionHistory.fees) /
                  positionHistory.collateralAmount) *
                100
              }
              format="percentage"
              prefix="("
              suffix=")"
              prefixClassName="text-lg"
              suffixClassName={`ml-0 text-lg ${(true ? positionHistory.pnl : positionHistory.pnl - positionHistory.fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
              precision={2}
              minimumFractionDigits={2}
              isDecimalDimmed={false}
              className={`text-lg ${(true ? positionHistory.pnl : positionHistory.pnl - positionHistory.fees) > 0 ? 'text-[#35C488]' : 'text-redbright'}`}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="8 8"
              stroke="#162330"
              horizontal={true}
              vertical={true}
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B9299', fontSize: 12 }}
              interval="preserveStartEnd"
            />

            <YAxis
              orientation="right"
              domain={[
                (dataMin: number) => Math.max(0, dataMin * 0.995),
                (dataMax: number) => dataMax * 1.005,
              ]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B9299', fontSize: 12 }}
              tickFormatter={(value) => `${formatPriceInfo(value)}`}
            />

            {/* Open to Close/Liquidated Connection - Using vertical reference lines */}
            {openPoint && (closePoint || liquidatedPoint) && (
              <>
                <ReferenceLine
                  x={isLessThan24Hours ? openPoint.time : openPointIndex}
                  stroke="#7DAFF4"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                {closePoint && (
                  <ReferenceLine
                    x={isLessThan24Hours ? closePoint.time : closePointIndex}
                    stroke="#ff344e"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                  />
                )}
                {liquidatedPoint && (
                  <ReferenceLine
                    x={
                      isLessThan24Hours
                        ? liquidatedPoint.time
                        : liquidatedPointIndex
                    }
                    stroke="#ff6b35"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    strokeOpacity={0.7}
                  />
                )}
              </>
            )}

            {/* Price Line */}

            <Area
              type="monotone"
              dataKey="price"
              stroke={currentPnl >= 0 ? '#07956B' : '#C9243A'}
              strokeWidth={2}
              fill={currentPnl >= 0 ? '#07956B' : '#C9243A'}
              fillOpacity={0.1}
              dot={<CustomDot />}
            />

            {/* Break Even Line */}
            <ReferenceLine
              y={breakEvenPrice}
              stroke="#9333ea"
              strokeDasharray="5 5"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
            {/* White connection line between open and close/liquidated - moved after Line to be on top */}
            {openPoint && (closePoint || liquidatedPoint) && (
              <ReferenceLine
                segment={[
                  {
                    x: isLessThan24Hours ? openPoint.time : openPointIndex,
                    y: openPoint.price,
                  },
                  {
                    x: isLessThan24Hours
                      ? (liquidatedPoint || closePoint)!.time
                      : liquidatedPointIndex >= 0
                        ? liquidatedPointIndex
                        : closePointIndex,
                    y: (liquidatedPoint || closePoint)!.price,
                  },
                ]}
                stroke="white"
                strokeDasharray="5 5"
                strokeWidth={1}
                strokeOpacity={0.8}
              />
            )}
            <Tooltip content={<CustomRechartsToolTip />} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const TokenDetails = ({
  positionHistory,
}: {
  positionHistory: EnrichedPositionApi;
}) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Image
        src={getTokenImage(positionHistory.token)}
        alt="token"
        height={30}
        width={30}
        className="w-9 h-9 border border-bcolor rounded-full"
      />
      <div>
        <div className="flex flex-row items-center gap-2 mb-0.5">
          <p className="font-interSemibold text-base">
            {getTokenSymbol(positionHistory.token.symbol)}
          </p>
          <p
            className={twMerge(
              'text-xs p-0.5 px-1.5 rounded-md font-mono capitalize',
              positionHistory.side === 'long'
                ? 'bg-green/10 text-greenSide'
                : 'bg-red/10 text-redSide',
            )}
          >
            {positionHistory.side}
          </p>
          <FormatNumber
            nb={positionHistory.entryLeverage}
            suffix="x"
            className="opacity-50 text-xs"
            precision={0}
            isDecimalDimmed={false}
          />
        </div>
        <p className="text-xs opacity-50 font-boldy">
          {positionHistory.entryDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>

      <div
        className={twMerge(
          'text-xs font-mono font-semibold p-0.5 px-3 border rounded-full ml-2',
          positionHistory.status === 'liquidate'
            ? 'bg-orange/10 text-orange border-orange'
            : 'bg-red/10 text-redbright border-red',
        )}
      >
        {positionHistory.status === 'liquidate' ? 'Liquidated' : 'Closed'}
      </div>
    </div>
  );
};
