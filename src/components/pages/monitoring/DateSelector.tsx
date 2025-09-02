import 'react-datepicker/dist/react-datepicker.css';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import DatePicker from 'react-datepicker';

import calendarIcon from '@/../public/images/Icons/calendar.svg';
import Select from '@/components/common/Select/Select';

export default function DateSelector({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setSelectedRange,
  selectedRange,
}: {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSelectedRange: (range: string) => void;
  selectedRange: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 ">
      <Select
        onSelect={(value) => {
          setSelectedRange(value);
          const date = new Date();
          setEndDate(date.toISOString());
          switch (value) {
            case 'All time':
              setStartDate('2024-09-25T00:00:00.000Z');
              break;
            case 'Last 7 days':
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              sevenDaysAgo.setUTCHours(0, 0, 0, 0);
              setStartDate(sevenDaysAgo.toISOString());
              break;
            case 'Last 30 days':
              const oneMonthAgo = new Date();
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              oneMonthAgo.setUTCHours(0, 0, 0, 0);
              setStartDate(oneMonthAgo.toISOString());
              break;
            case 'Year to date':
              const startOfYear = new Date();
              startOfYear.setMonth(0, 1);
              startOfYear.setUTCHours(0, 0, 0, 0);
              setStartDate(startOfYear.toISOString());
              break;
            case 'Custom':
              break;
            default:
              break;
          }
        }}
        reversed={true}
        className="flex items-center"
        selectedTextClassName="text-sm font-interMedium"
        menuTextClassName="text-sm"
        menuClassName="px-3 py-1"
        menuOpenBorderClassName="bg-transparent"
        disableImageAsBg={true}
        options={[
          {
            title: 'All time',
            img: calendarIcon,
            imgClassName: 'w-3 h-3 opacity-50',
          },
          {
            title: 'Last 7 days',
            img: calendarIcon,
            imgClassName: 'w-3 h-3 opacity-50',
          },
          {
            title: 'Last 30 days',
            img: calendarIcon,
            imgClassName: 'w-3 h-3 opacity-50',
          },
          {
            title: 'Year to date',
            img: calendarIcon,
            imgClassName: 'w-3 h-3 opacity-50',
          },
          {
            title: 'Custom',
            img: calendarIcon,
            imgClassName: 'w-3 h-3 opacity-50',
          },
        ]}
        selected={selectedRange}
      />
      <AnimatePresence>
        {selectedRange === 'Custom' && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex items-center bg-[#0A1117] rounded-lg border border-gray-800/50">
              <DatePicker
                selected={new Date(startDate)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setStartDate(date.toISOString());
                  }
                }}
                className="h-8 w-[104px] px-2 bg-transparent text-xs font-medium"
                minDate={new Date('2023-09-25')}
                maxDate={new Date()}
              />
            </div>
            <span className="text-xs text-gray-500">to</span>
            <div className="relative flex items-center bg-[#0A1117] rounded-lg border border-gray-800/50">
              <DatePicker
                selected={new Date(endDate)}
                onChange={(date: Date | null) => {
                  if (date) {
                    setEndDate(date.toISOString());
                  }
                }}
                className="h-8 w-[104px] px-2 bg-transparent text-xs font-medium"
                minDate={new Date('2023-09-25')}
                maxDate={new Date()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
