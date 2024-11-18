import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';

import Image from 'next/image';
import DatePicker from 'react-datepicker';
import { twMerge } from 'tailwind-merge';
import Select from '@/components/common/Select/Select';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import usePositionStats from '@/hooks/usePositionStats';
import { CustodyExtended } from '@/types';

export default function Flow({
  custodies,
}: {
  custodies: CustodyExtended[] | null;
}) {
  const { data, loading, startDate, setStartDate, endDate, setEndDate } = usePositionStats();
  const [selectedRange, setSelectedRange] = useState('All Time');

  if (loading) return <div>Loading...</div>;

  const stats = Array.isArray(data) ? data : [];

  // Group stats by symbol
  const groupedStats = stats.reduce((acc, stat) => {
    if (!acc[stat.symbol]) {
      acc[stat.symbol] = [];
    }
    acc[stat.symbol].push(stat);
    return acc;
  }, {} as Record<string, typeof stats>);

  return (
    <StyledContainer className="rounded-lg overflow-hidden m-2 p-5 flex flex-wrap">
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between items-center">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-secondary border border-gray-600 rounded p-2">

          <div className="flex flex-col sm:flex-row sm:space-y-0 sm:space-x-2 space-y-2 items-center w-full sm:h-[2em]">
            <Select
              onSelect={(value) => {
                setSelectedRange(value);
                const date = new Date();
                setEndDate(date.toISOString());
                switch (value) {
                  case 'All Time':
                    setStartDate('2024-10-25T00:00:00Z');
                    break;
                  case 'Last Month':
                    date.setMonth(date.getMonth() - 1);
                    setStartDate(date.toISOString());
                    break;
                  case 'Last Week':
                    date.setDate(date.getDate() - 7);
                    setStartDate(date.toISOString());
                    break;
                  case 'Yesterday':
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
      </div>
      <div className="flex flex-wrap w-full gap-4">
        {Object.entries(groupedStats).map(([symbol, symbolStats]) => (
          <div key={symbol} className="p-4 border rounded bg-[#050D14] flex-grow">
            <h3 className="font-semibold flex items-center gap-2">
              <Image
                src={custodies?.find((c) => c.tokenInfo.symbol.toLocaleLowerCase() === symbol.toLowerCase())?.tokenInfo.image || ''}
                alt="token icon"
                width="24"
                height="24"
              />
              {symbol}
            </h3>
            {symbolStats.map((stat, _index) => (
              <div key={stat.side} className="mt-2">
                <h4 className={`font-semibold ${stat.side === 'long' ? 'text-green' : 'text-redbright'}`}>{stat.side}</h4>
                <div className="ml-4">
                  <div className="flex justify-between text-txtfade">
                    <span>Positions count:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.count_positions}
                      precision={0}
                      minimumFractionDigits={0}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Total PnL over the period:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.total_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className={twMerge("opacity-80", stat.total_pnl < 0 ? 'text-redbright' : 'text-green')}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Worst PnL:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.min_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className={twMerge("opacity-80", stat.min_pnl < 0 ? 'text-redbright' : 'text-green')}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span className="text-txtfade">Best PnL:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.max_pnl}
                      precision={2}
                      minimumFractionDigits={2}
                      prefix="$"
                      showSignBeforePrefix={true}
                      className={twMerge("opacity-80", stat.max_pnl < 0 ? 'text-redbright' : 'text-green')}
                      isDecimalDimmed={false}
                    />
                  </div>
                  <div className="flex justify-between text-txtfade">
                    <span>Total Trade Volume:</span>
                    <span className="flex-grow border-b border-dotted mx-1 opacity-30 mb-1"></span>
                    <FormatNumber
                      nb={stat.total_volume}
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
                      nb={stat.min_volume}
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
                      nb={stat.max_volume}
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
                      nb={stat.average_volume}
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
    </StyledContainer >
  );
}