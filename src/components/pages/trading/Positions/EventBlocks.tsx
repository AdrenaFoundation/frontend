import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import addCollateralIcon from '@/../public/images/Icons/add-collateral-icon.svg';
import calendarIcon from '@/../public/images/Icons/calendar.svg';
import closeIcon from '@/../public/images/Icons/close-position-icon.svg';
import increaseCollateralIcon from '@/../public/images/Icons/increase-collateral-icon.svg';
import liquidatedIcon from '@/../public/images/Icons/liquidated-icon.svg';
import openPositionIcon from '@/../public/images/Icons/open-position-icon.svg';
import partialCloseIcon from '@/../public/images/Icons/partial-close.svg';
import removeCollateralIcon from '@/../public/images/Icons/remove-collateral-icon.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import DataApiClient from '@/DataApiClient';
import { ImageRef, PositionTransaction } from '@/types';
import { formatNumber } from '@/utils';

export type FormattedEventsType = {
  className?: string;
  dotClassName?: string;
  label: string;
  value: number | string | null;
  icon?: ImageRef;
  suffix?: string;
  format: 'currency' | 'number' | 'percentage' | 'text';
};

type LabelType =
  | 'Method'
  | 'PnL'
  | 'Fees'
  | 'Leverage'
  | 'Size'
  | 'Price'
  | 'Exit Fees'
  | 'Borrow Fees'
  | 'Collateral'
  | 'Exit Amount';

export default function EventBlocks({
  positionId,
  events,
  setEvents,
}: {
  positionId: number;
  events: FormattedEventsType[][];
  setEvents: React.Dispatch<React.SetStateAction<FormattedEventsType[][]>>;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState<LabelType | null>(null);

  useEffect(() => {
    getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionId]);

  const getEvents = async () => {
    setIsLoading(true);
    try {
      const positionTransactions = await DataApiClient.getPositionTransactions({
        positionId,
      });

      if (!positionTransactions) {
        return;
      }

      const formattedData = positionTransactions.map((event) =>
        formatData(event),
      );
      setEvents(formattedData);
    } catch (error) {
      console.error('Error fetching position transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatData = useCallback(
    (event: PositionTransaction): FormattedEventsType[] => {
      const data = [
        {
          label: 'transactionDate',
          value: event.transactionDate,
          format: 'text',
        },
        {
          label: 'PnL',
          value: event.additionalInfos.pnl,
          format: 'currency',
        },
        {
          label: 'Fees',
          value: event.additionalInfos.fees,
          format: 'currency',
        },
        {
          label: 'Leverage',
          value: event.additionalInfos.leverage,
          format: 'number',
          suffix: 'x',
        },
        {
          label: 'Size',
          value: event.additionalInfos.size,
          format: 'currency',
        },
        {
          label: 'Price',
          value: event.additionalInfos.price,
          format: 'currency',
        },
        {
          label: 'Exit Fees',
          value: event.additionalInfos.exitFees,
          format: 'currency',
        },
        {
          label: 'Borrow Fees',
          value: event.additionalInfos.borrowFees,
          format: 'currency',
        },
        {
          label: 'Collateral',
          value: event.additionalInfos.collateralAmountUsd,
          format: 'currency',
        },
        {
          label: 'Collateral Native',
          value: event.additionalInfos.collateralAmountNative,
          format: 'number',
        },
        {
          label: 'Exit Amount Native',
          value: event.additionalInfos.exitAmountNative,
          format: 'number',
        },
      ].filter(
        (item) => item.value !== null && item.value !== undefined,
      ) as FormattedEventsType[];

      switch (event.method) {
        case 'closePositionShort':
        case 'closePositionLong':
          if (
            event.additionalInfos.percentage === 100 ||
            event.additionalInfos.percentage === null
          ) {
            return [
              {
                className: 'text-[#ff344e] font-interSemibold',
                dotClassName: '#ff344e',
                label: 'Method',
                value: 'Close Position',
                icon: closeIcon,
                format: 'text',
              },
              ...data,
            ];
          }

          return [
            {
              className: 'text-[#FE7B47] font-interSemibold',
              dotClassName: '#FE7B47',
              label: 'Method',
              value: `Partial Close (${formatNumber(event.additionalInfos.percentage, 2)}%)`,
              icon: partialCloseIcon,
              format: 'text',
            },
            ...data,
          ];
        case 'addCollateral':
        case 'addCollateralLong':
        case 'addCollateralShort':
          return [
            {
              className: 'text-[#35C469] font-interSemibold',
              dotClassName: '#35C469',
              label: 'Method',
              value: 'Add Collateral',
              icon: addCollateralIcon,
              format: 'text',
            },
            ...data,
          ];

        case 'removeCollateralLong':
        case 'removeCollateralShort':
          return [
            {
              className: 'text-[#FEB14C] font-interSemibold',
              dotClassName: '#FEB14C',
              label: 'Method',
              value: 'Remove Collateral',
              icon: removeCollateralIcon,
              format: 'text',
            },
            ...data,
          ];

        case 'increasePositionLong':
        case 'increasePositionShort':
          return [
            {
              className: 'text-[#3FD5A5] font-interSemibold',
              dotClassName: '#3FD5A5',
              label: 'Method',
              value: 'Increase Position',
              icon: increaseCollateralIcon,
              format: 'text',
            },
            ...data,
          ];

        case 'liquidateLong':
        case 'liquidateShort':
          return [
            {
              className: 'text-orange font-interSemibold',
              dotClassName: '#FFA500',
              label: 'Method',
              value: 'Liquidated',
              icon: liquidatedIcon,
              format: 'text',
            },
            ...data,
          ];

        case 'openPositionShort':
        case 'openPositionLong':
          return [
            {
              className: 'text-[#7DAFF4] font-interSemibold',
              dotClassName: '#7DAFF4',
              label: 'Method',
              value: 'Open Position',
              icon: openPositionIcon,
              format: 'text',
            },
            ...data,
          ];
        default:
          return data;
      }
    },
    [],
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={
        isLoading
          ? { height: '16.091875rem', opacity: 1 }
          : { height: 'auto', opacity: 1 }
      }
      exit={{ height: 0, opacity: 0 }}
      key={`event - ${positionId}`}
      className="bg-main border-b border-bcolor max-h-[24rem] overflow-hidden"
    >
      <p className="font-bold text-xs opacity-30 mb-3 px-5 pt-5">
        {!isLoading ? events.length : ''} Events
      </p>

      <div className="flex flex-row gap-4 relative max-h-[20rem] overflow-y-auto custom-chat-scrollbar overscroll-contain">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 md:pl-[2.7rem] pt-0 w-full"
            >
              {events.length > 0 ? (
                <div
                  className={twMerge(
                    'flex flex-col gap-3 pb-6 md:pb-5',
                    events.length >= 3 && '!pb-6',
                  )}
                >
                  {events.map((event, index) => (
                    <div
                      className="relative border border-inputcolor rounded-md w-full md:w-fit"
                      key={index}
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="hidden md:flex absolute -left-6 w-3 h-3 rounded-full top-1/2 -translate-y-1/2 z-10"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="6"
                          fill={
                            event.find((e) => e.label === 'Method')
                              ?.dotClassName
                          }
                          fillOpacity="0.2"
                        />

                        <circle
                          cx="6"
                          cy="6"
                          r="3"
                          fill={
                            event.find((e) => e.label === 'Method')
                              ?.dotClassName
                          }
                        />
                      </svg>

                      {index < events.length - 1 && (
                        <div className="hidden md:flex absolute -left-[1.2rem] w-[0.0625rem] bg-inputcolor top-1/2 translate-y-1 h-[calc(100%+0.75rem)]" />
                      )}

                      <div
                        key={index}
                        className="flex flex-row gap-2 items-center p-2 px-3 opacity-70"
                        style={{
                          background:
                            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 8px)',
                        }}
                      >
                        <Image
                          src={calendarIcon}
                          alt="Calendar"
                          width={12}
                          height={12}
                          className="w-[0.625rem] h-[0.625rem]"
                        />

                        <p className="text-xs font-semibold">
                          {new Date(
                            event.find((e) => e.label === 'transactionDate')
                              ?.value as string,
                          ).toLocaleTimeString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="bg-[#0B131D] p-3 border-t border-t-inputcolor rounded-b-md">
                        <EventBlock
                          formattedData={event}
                          hoveredEvent={hoveredEvent}
                          setHoveredEvent={setHoveredEvent}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-4">
                  <p className="text-sm opacity-50">No events found</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const EventBlock = ({
  formattedData,
  hoveredEvent,
  setHoveredEvent,
}: {
  formattedData: FormattedEventsType[];
  hoveredEvent: LabelType | null;
  setHoveredEvent: (event: LabelType | null) => void;
}) => {
  // Filter out transactionDate since it's displayed in the header
  const displayData = useMemo(
    () => formattedData.filter((item) => item.label !== 'transactionDate'),
    [formattedData],
  );

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-3 sm:gap-6 md:gap-8">
      {displayData.map((item, index) => (
        <div
          className={twMerge(
            'flex flex-row justify-between md:justify-normal md:flex-col transition-opacity duration-300',
            hoveredEvent !== null &&
              hoveredEvent !== item.label &&
              hoveredEvent !== 'Method'
              ? 'opacity-30'
              : 'opacity-100',
          )}
          onMouseOver={() => setHoveredEvent(item.label as LabelType)}
          onMouseOut={() => setHoveredEvent(null)}
          key={index}
        >
          <p className="font-semibold text-sm sm:text-xs opacity-50">
            {item.label}
          </p>
          <div className="flex items-center gap-1">
            {item.icon && (
              <Image
                src={item.icon}
                alt={item.label}
                width={14}
                height={14}
                className="w-3 h-3 opacity-50"
              />
            )}
            {item.value !== null && item.value !== undefined ? (
              item.format === 'text' ? (
                <p className={twMerge('text-sm font-mono', item.className)}>
                  {item.value}
                  {item.suffix && (
                    <span className="opacity-50">{item.suffix}</span>
                  )}
                </p>
              ) : typeof item.value === 'number' ? (
                <FormatNumber
                  nb={item.value}
                  format={item.format}
                  suffix={item.suffix}
                  className={twMerge('text-sm font-mono', item.className)}
                  precision={item.format === 'currency' ? 2 : 0}
                  isDecimalDimmed={false}
                />
              ) : (
                <p className={twMerge('text-sm font-mono', item.className)}>
                  {item.value}
                  {item.suffix && (
                    <span className="opacity-50">{item.suffix}</span>
                  )}
                </p>
              )
            ) : (
              <p className="text-sm font-mono opacity-30">-</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="flex flex-col gap-3 p-5 pt-0 w-full">
      <div className="h-[5.6775rem] w-full bg-[#050D14] animate-loader rounded-md border border-white/10"></div>
      <div className="h-[5.6775rem] w-1/2 bg-[#050D14] animate-loader rounded-md border border-white/10 opacity-50"></div>
    </div>
  );
};
