import React, { useState } from 'react';

import Select from '@/components/common/Select/Select';

export default function DateSelector({
  setStartDate,
  setEndDate,
  setSelectedRange,
  selectedRange,
}: {
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSelectedRange: (range: string) => void;
  selectedRange: string;
}) {
  return (
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
      options={[
        { title: 'All time' },
        { title: 'Last 7 days' },
        { title: 'Last 30 days' },
        { title: 'Year to date' },
        { title: 'Custom' },
      ]}
      selected={selectedRange}
    />
  );
}
